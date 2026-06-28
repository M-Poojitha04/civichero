// Local, high-quality static assets organized by category folders (guaranteed to load instantly)
export const CATEGORY_DEFAULT_IMAGES: Record<
  "Road Issue" | "Waste Management" | "Water Supply" | "Electrical" | "Sanitation" | "Environment",
  { before: string; after: string }
> = {
  "Road Issue": {
    before: "/assets/incidents/road/pothole_before.jpg",
    after: "/assets/incidents/road/pothole_after.jpg"
  },
  "Water Supply": {
    before: "/assets/incidents/water/pipeline_leak_before.jpg",
    after: "/assets/incidents/water/pipeline_leak_after.jpg"
  },
  "Sanitation": {
    before: "/assets/incidents/drainage/clogged_drain_before.jpg",
    after: "/assets/incidents/drainage/clogged_drain_after.jpg"
  },
  "Electrical": {
    before: "/assets/incidents/electrical/streetlight_before.jpg",
    after: "/assets/incidents/electrical/streetlight_after.jpg"
  },
  "Waste Management": {
    before: "/assets/incidents/waste/garbage_before.jpg",
    after: "/assets/incidents/waste/garbage_after.jpg"
  },
  "Environment": {
    before: "/assets/incidents/parks/fallen_tree_before.jpg",
    after: "/assets/incidents/parks/fallen_tree_after.jpg"
  }
};

// Map specific subcategory keywords to local static assets in folders
export function getKeywordSpecificImage(
  category: string,
  title: string = "",
  description: string = "",
  type: "before" | "after" = "before"
): string {
  const text = `${title} ${description}`.toLowerCase();

  // 1. Road Issues
  if (
    text.includes("pothole") ||
    text.includes("road wear") ||
    text.includes("rutting") ||
    text.includes("road surface") ||
    text.includes("cracking") ||
    text.includes("asphalt")
) {
    return type === "before"
      ? "/assets/incidents/road/pothole_before.jpg"
      : "/assets/incidents/road/pothole_after.jpg";
  }
  if (text.includes("sinkhole") || text.includes("collapse") || text.includes("cavity") || text.includes("cracked road")) {
    return type === "before"
      ? "/assets/incidents/road/road_collapse_before.jpg"
      : "/assets/incidents/road/road_collapse_after.jpg";
  }
  if (text.includes("divider") || text.includes("median") || text.includes("barrier") || text.includes("curb")) {
    return type === "before"
      ? "/assets/incidents/road/divider_damage_before.jpg"
      : "/assets/incidents/road/divider_damage_after.jpg";
  }

  // 2. Water Supply
  if (text.includes("leak") || text.includes("burst") || text.includes("pipeline") || text.includes("pipe")) {
    if (text.includes("valve") || text.includes("gasket") || text.includes("chamber")) {
      return type === "before"
        ? "/assets/incidents/water/valve_leak_before.jpg"
        : "/assets/incidents/water/valve_leak_after.jpg";
    }
    return type === "before"
      ? "/assets/incidents/water/pipeline_leak_before.jpg"
      : "/assets/incidents/water/pipeline_leak_after.jpg";
  }
  if (text.includes("muddy") || text.includes("brown") || text.includes("contaminated") || text.includes("turbid") || text.includes("dirty water")) {
    return type === "before"
      ? "/assets/incidents/water/muddy_water_before.jpg"
      : "/assets/incidents/water/muddy_water_after.jpg";
  }
  if (text.includes("valve") || text.includes("gasket") || text.includes("chamber")) {
    return type === "before"
      ? "/assets/incidents/water/valve_leak_before.jpg"
      : "/assets/incidents/water/valve_leak_after.jpg";
  }

  // 3. Drainage / Sanitation
  if (text.includes("flood") || text.includes("flooding") || text.includes("rainwater") || text.includes("stagnant") || text.includes("swamp")) {
    return type === "before"
      ? "/assets/incidents/drainage/flooding_before.jpg"
      : "/assets/incidents/drainage/flooding_after.jpg";
  }
  if (text.includes("drain") || text.includes("drainage") || text.includes("clogged") || text.includes("choked") || text.includes("blockage") || text.includes("sewer") || text.includes("manhole") || text.includes("gully")) {
    return type === "before"
      ? "/assets/incidents/drainage/clogged_drain_before.jpg"
      : "/assets/incidents/drainage/clogged_drain_after.jpg";
  }

  // 4. Waste Management
  if (text.includes("dumping") || text.includes("dumped") || text.includes("debris") || text.includes("waste pile") || text.includes("illegal")) {
    return type === "before"
      ? "/assets/incidents/waste/illegal_dump_before.jpg"
      : "/assets/incidents/waste/illegal_dump_after.jpg";
  }
  if (text.includes("garbage") || text.includes("waste") || text.includes("trash") || text.includes("bin") || text.includes("refuse")) {
    return type === "before"
      ? "/assets/incidents/waste/garbage_before.jpg"
      : "/assets/incidents/waste/garbage_after.jpg";
  }

  // 5. Electrical
  if (text.includes("transformer") || text.includes("sparking") || text.includes("short circuit") || text.includes("high-voltage") || text.includes("feeder") || text.includes("sag")) {
    return type === "before"
      ? "/assets/incidents/electrical/transformer_before.jpg"
      : "/assets/incidents/electrical/transformer_after.jpg";
  }
  if (text.includes("streetlight") || text.includes("light") || text.includes("led") || text.includes("lamp") || text.includes("blackout") || text.includes("flickering")) {
    return type === "before"
      ? "/assets/incidents/electrical/streetlight_before.jpg"
      : "/assets/incidents/electrical/streetlight_after.jpg";
  }

// 6. Parks / Environment

// Fallen trees / branches
if (
    text.includes("tree") ||
    text.includes("branch") ||
    text.includes("foliage") ||
    text.includes("canopy") ||
    text.includes("neem") ||
    text.includes("fallen")
) {
    return type === "before"
        ? "/assets/incidents/parks/fallen_tree_before.jpg"
        : "/assets/incidents/parks/fallen_tree_after.jpg";
}

// Park trail erosion
if (
    text.includes("park") ||
    text.includes("trail") ||
    text.includes("walking trail") ||
    text.includes("erosion") ||
    text.includes("mud rut") ||
    text.includes("roots") ||
    text.includes("soil")
) {
    return type === "before"
        ? "/assets/incidents/parks/fallen_tree_before.jpg"
        : "/assets/incidents/parks/fallen_tree_after.jpg";
}

  // 7. Traffic Signals
  if (text.includes("signal") || text.includes("traffic light") || text.includes("junction light")) {
    return type === "before"
      ? "/assets/incidents/traffic/traffic_signal_before.jpg"
      : "/assets/incidents/traffic/traffic_signal_after.jpg";
  }

  // Fallback to Category defaults
  const normalizedCategory = (CATEGORY_DEFAULT_IMAGES[category as keyof typeof CATEGORY_DEFAULT_IMAGES] 
    ? category 
    : "Road Issue") as keyof typeof CATEGORY_DEFAULT_IMAGES;

  return type === "before"
    ? CATEGORY_DEFAULT_IMAGES[normalizedCategory].before
    : CATEGORY_DEFAULT_IMAGES[normalizedCategory].after;
}
