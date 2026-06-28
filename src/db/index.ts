import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema.ts";
import fs from "fs";
import path from "path";

export const createPool = () => {
  return new Pool({
    host: process.env.SQL_HOST || "localhost",
    user: process.env.SQL_USER || "postgres",
    password: process.env.SQL_PASSWORD || "postgres",
    database: process.env.SQL_DB_NAME || "civichero",
    connectionTimeoutMillis: 15000,
    max: 10,
    idleTimeoutMillis: 30000,
    keepAlive: true,
  });
};

let db: any;

if (process.env.SQL_HOST) {
  const pool = createPool();

  const originalPoolQuery = pool.query.bind(pool);
  (pool as any).query = async function (queryTextOrConfig: any, values?: any[], callback?: any): Promise<any> {
    if (typeof callback === "function") {
      return originalPoolQuery(queryTextOrConfig, values, callback);
    }
    
    let attempts = 0;
    const maxAttempts = 3;
    while (attempts < maxAttempts) {
      attempts++;
      try {
        return await originalPoolQuery(queryTextOrConfig, values);
      } catch (err: any) {
        const isConnectionError = err?.message?.includes("Connection terminated unexpectedly") || 
                                  err?.message?.includes("connection") || 
                                  err?.message?.includes("terminated") ||
                                  err?.code === "57P01" || 
                                  err?.code === "57P02" || 
                                  err?.code === "57P03";
        if (isConnectionError && attempts < maxAttempts) {
          console.warn(`[SQL Pool Retry] Query failed on attempt ${attempts}/${maxAttempts}. Error: ${err.message || err}. Retrying in 150ms...`);
          await new Promise(resolve => setTimeout(resolve, 150));
          continue;
        }
        throw err;
      }
    }
    throw new Error("Pool query execution failed after maximum retries.");
  };

  const originalConnect = pool.connect.bind(pool);
  (pool as any).connect = async function (callback?: any): Promise<any> {
    if (callback) {
      return originalConnect(callback);
    }
    
    const client = await originalConnect();
    const originalClientQuery = client.query.bind(client);
    
    (client as any).query = async function (queryTextOrConfig: any, values?: any[], callback?: any): Promise<any> {
      if (typeof callback === "function") {
        return originalClientQuery(queryTextOrConfig, values, callback);
      }
      
      let attempts = 0;
      const maxAttempts = 3;
      while (attempts < maxAttempts) {
        attempts++;
        try {
          return await originalClientQuery(queryTextOrConfig, values);
        } catch (err: any) {
          const isConnectionError = err?.message?.includes("Connection terminated unexpectedly") || 
                                    err?.message?.includes("connection") || 
                                    err?.message?.includes("terminated") ||
                                    err?.code === "57P01" ||
                                    err?.code === "57P02" ||
                                    err?.code === "57P03";
          if (isConnectionError && attempts < maxAttempts) {
            console.warn(`[SQL Client Retry] Query failed on attempt ${attempts}/${maxAttempts}. Error: ${err.message || err}. Retrying in 150ms...`);
            await new Promise(resolve => setTimeout(resolve, 150));
            continue;
          }
          throw err;
        }
      }
      throw new Error("Client query execution failed after maximum retries.");
    };
    
    return client;
  };

  pool.on("error", (err) => {
    console.error("Unexpected error on idle SQL pool client:", err);
  });

  db = drizzle(pool, { schema });
} else {
  // Pure JSON Local DB Fallback for seamless out-of-the-box local export behavior!
  console.log("--------------------------------------------------");
  console.log("CIVICHERO LOCAL DB: DETECTED EXPORTED OFFLINE MODE");
  console.log("FALLING BACK TO LOCAL FILE-BASED SQLITE-MIMIC DATABASE");
  console.log("--------------------------------------------------");

  const LOCAL_DB_PATH = path.join(process.cwd(), "civichero_local_db.json");

  const loadLocalDb = (): { users: any[]; issues: any[]; comments: any[] } => {
    try {
      if (fs.existsSync(LOCAL_DB_PATH)) {
        const fileContent = fs.readFileSync(LOCAL_DB_PATH, "utf8");
        return JSON.parse(fileContent);
      }
    } catch (e) {
      console.error("[Local DB] Error loading file:", e);
    }
    return { users: [], issues: [], comments: [] };
  };

  const saveLocalDb = (data: any) => {
    try {
      fs.writeFileSync(LOCAL_DB_PATH, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error("[Local DB] Error saving file:", e);
    }
  };

  const getTableName = (tableObj: any): "users" | "issues" | "comments" => {
    if (tableObj === schema.users) return "users";
    if (tableObj === schema.issues) return "issues";
    if (tableObj === schema.comments) return "comments";
    
    // Fallback detection using schema name
    const rawName = tableObj?._?.name || tableObj?.name || "";
    if (rawName.includes("user")) return "users";
    if (rawName.includes("issue")) return "issues";
    if (rawName.includes("comment")) return "comments";
    return "issues";
  };

  const matchCondition = (row: any, condition: any): boolean => {
    if (!condition) return true;

    // 1. Raw SQL Template Tags
    if (typeof condition === "object" && condition.sqlFragments) {
      const sqlText = condition.sqlFragments.join(" ");
      if (sqlText.includes("status != 'Resolved'") || sqlText.includes("status !== 'Resolved'")) {
        return row.status !== "Resolved";
      }
    }

    // 2. Drizzle binary comparison (like eq)
    if (condition.left && condition.right !== undefined) {
      const colName = condition.left.name || condition.left.column?.name;
      const val = condition.right;
      if (colName) {
        const key = Object.keys(row).find(
          k => k.toLowerCase() === colName.toLowerCase() || 
               k.replace(/[A-Z]/g, m => "_" + m.toLowerCase()) === colName
        ) || colName;
        return row[key] === val;
      }
    }

    // 3. Nested Drizzle operators (and, or)
    if (Array.isArray(condition.conditions)) {
      const isOr = condition.constructor?.name?.toLowerCase().includes("or") || String(condition).toLowerCase().includes("or");
      if (isOr) {
        return condition.conditions.some((c: any) => matchCondition(row, c));
      } else {
        return condition.conditions.every((c: any) => matchCondition(row, c));
      }
    }

    return true;
  };

  db = {
    select: function (selectFields?: any) {
      let selectedTable: any = null;
      let queryCondition: any = null;
      let queryOrder: any = null;

      const queryBuilder = {
        from: function (table: any) {
          selectedTable = table;
          return this;
        },
        where: function (condition: any) {
          queryCondition = condition;
          return this;
        },
        orderBy: function (order: any) {
          queryOrder = order;
          return this;
        },
        then: function (onfulfilled?: (value: any) => any) {
          const tableName = getTableName(selectedTable);
          const state = loadLocalDb();
          const list = state[tableName] || [];
          
          // Filter matching rows
          let matched = list.filter(row => matchCondition(row, queryCondition));

          // Apply selected fields projection if applicable
          if (selectFields && typeof selectFields === "object" && Object.keys(selectFields).length > 0) {
            const selectKeys = Object.keys(selectFields);
            matched = matched.map(row => {
              const obj: any = {};
              for (const key of selectKeys) {
                const colObj = selectFields[key];
                const colName = colObj?.name || colObj?.column?.name || key;
                const rowKey = Object.keys(row).find(
                  k => k.toLowerCase() === colName.toLowerCase() || 
                       k.replace(/[A-Z]/g, m => "_" + m.toLowerCase()) === colName
                ) || colName;
                obj[key] = row[rowKey];
              }
              return obj;
            });
          }

          // Apply ordering
          if (queryOrder) {
            const colName = queryOrder?.expression?.name || queryOrder?.column?.name || queryOrder?.name;
            const isDesc = queryOrder?.constructor?.name?.toLowerCase().includes("desc") || 
                           String(queryOrder).toLowerCase().includes("desc");
            if (colName) {
              const rowKey = matched.length > 0 ? Object.keys(matched[0]).find(
                k => k.toLowerCase() === colName.toLowerCase() || 
                     k.replace(/[A-Z]/g, m => "_" + m.toLowerCase()) === colName
              ) || colName : colName;

              matched.sort((a, b) => {
                const valA = a[rowKey];
                const valB = b[rowKey];
                if (valA === valB) return 0;
                if (valA === undefined || valA === null) return 1;
                if (valB === undefined || valB === null) return -1;
                const comp = valA < valB ? -1 : 1;
                return isDesc ? -comp : comp;
              });
            }
          }

          if (onfulfilled) {
            return Promise.resolve(onfulfilled(matched));
          }
          return Promise.resolve(matched);
        }
      };

      return queryBuilder;
    },

    insert: function (table: any) {
      let insertData: any = null;
      let conflictConfig: any = null;

      const insertBuilder = {
        values: function (data: any) {
          insertData = data;
          return this;
        },
        onConflictDoUpdate: function (config: any) {
          conflictConfig = config;
          return this;
        },
        onConflictDoNothing: function () {
          return this;
        },
        returning: function () {
          return this;
        },
        then: function (onfulfilled?: (value: any) => any) {
          const tableName = getTableName(table);
          const state = loadLocalDb();
          const items = Array.isArray(insertData) ? insertData : [insertData];
          const results: any[] = [];

          for (const rawItem of items) {
            const item = { ...rawItem };
            
            // Auto increment IDs
            if (tableName === "users" && !item.id) {
              item.id = state.users.length + 1;
            }
            if (tableName === "comments" && !item.id) {
              item.id = state.comments.length + 1;
            }
            if (item.createdAt === undefined) {
              item.createdAt = Date.now();
            }

            // Check for conflict
            let hasConflict = false;
            if (conflictConfig) {
              const targetColName = conflictConfig.target?.name || "uid";
              const existingIdx = state[tableName].findIndex((row: any) => {
                return row[targetColName] === item[targetColName];
              });

              if (existingIdx !== -1) {
                // Perform Update
                const setValues = conflictConfig.set || {};
                const updated = { ...state[tableName][existingIdx], ...item, ...setValues };
                state[tableName][existingIdx] = updated;
                results.push(updated);
                hasConflict = true;
              }
            }

            if (!hasConflict) {
              state[tableName].push(item);
              results.push(item);
            }
          }

          saveLocalDb(state);

          if (onfulfilled) {
            return Promise.resolve(onfulfilled(results));
          }
          return Promise.resolve(results);
        }
      };

      return insertBuilder;
    },

    update: function (table: any) {
      let updateData: any = null;
      let updateCondition: any = null;

      const updateBuilder = {
        set: function (data: any) {
          updateData = data;
          return this;
        },
        where: function (condition: any) {
          updateCondition = condition;
          return this;
        },
        returning: function () {
          return this;
        },
        then: function (onfulfilled?: (value: any) => any) {
          const tableName = getTableName(table);
          const state = loadLocalDb();
          const list = state[tableName] || [];
          const updatedRows: any[] = [];

          state[tableName] = list.map((row: any) => {
            if (matchCondition(row, updateCondition)) {
              const updated = { ...row, ...updateData };
              updatedRows.push(updated);
              return updated;
            }
            return row;
          });

          saveLocalDb(state);

          if (onfulfilled) {
            return Promise.resolve(onfulfilled(updatedRows));
          }
          return Promise.resolve(updatedRows);
        }
      };

      return updateBuilder;
    },

    delete: function (table: any) {
      let deleteCondition: any = null;

      const deleteBuilder = {
        where: function (condition: any) {
          deleteCondition = condition;
          return this;
        },
        then: function (onfulfilled?: (value: any) => any) {
          const tableName = getTableName(table);
          const state = loadLocalDb();
          const list = state[tableName] || [];
          
          if (!deleteCondition) {
            state[tableName] = [];
          } else {
            state[tableName] = list.filter((row: any) => !matchCondition(row, deleteCondition));
          }

          saveLocalDb(state);

          if (onfulfilled) {
            return Promise.resolve(onfulfilled([]));
          }
          return Promise.resolve([]);
        }
      };

      return deleteBuilder;
    }
  };
}

export { db };
