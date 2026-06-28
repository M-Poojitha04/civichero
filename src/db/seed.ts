import { db } from "./index.ts";
import { users, issues, comments } from "./schema.ts";
import { getKeywordSpecificImage } from "../utils/imageMatcher.ts";

export async function seedDatabase() {
  try {
    console.log("--------------------------------------------------");
    console.log("CIVICHERO MUNICIPAL DATA ENGINE: INITIALIZING...");
    console.log("--------------------------------------------------");

    // 1. Reset tables to ensure absolute consistency and overwrite old demo data
    console.log("Purging legacy tables to perform clean Hyderabad Smart City seed...");
    await db.delete(comments);
    await db.delete(issues);
    await db.delete(users);

    const now = Date.now();
    const oneYearAgo = now - 365 * 24 * 3600 * 1000;

    // 2. Setup Base Pools
    const FIRST_NAMES = [
      "Aarav", "Priya", "Vikram", "Rahul", "Sai", "Swetha", "Neha", "Aditya", "Ananya", "Rajesh",
      "Venkat", "Sandeep", "Harika", "Divya", "Manoj", "Karthik", "Lakshmi", "Srikanth", "Ramesh", "Suresh",
      "Sneha", "Kiran", "Deepa", "Amit", "Prakash", "Sanjay", "Meera", "Rohit", "Pranav", "Sunitha",
      "Arjun", "Kavitha", "Vijay", "Madhavi", "Gopal", "Krishna", "Shalini", "Tarun", "Nikhil", "Pooja",
      "Varun", "Rhea", "Gautam", "Shruti", "Manish", "Anil", "Sowmya", "Abhishek", "Jyothi", "Poojitha"
    ];
    const LAST_NAMES = [
      "Sharma", "Patel", "Malhotra", "Mehta", "Reddy", "Rao", "Choudhury", "Naidu", "Yadav", "Verma",
      "Kumar", "Singh", "Joshi", "Iyer", "Goud", "Kulkarni", "Deshmukh", "Nair", "Pillai", "Gupta",
      "Bhat", "Som", "Das", "Sen", "Bose", "Chatterjee", "Banerjee", "Mukherjee", "Roy", "Sinha"
    ];

    const WARDS = [
      { id: 1, name: "Ward 1 - Gachibowli Financial District", lat: 17.4400, lng: 78.3480, landmark: "DLF Cyber City" },
      { id: 2, name: "Ward 2 - Jubilee Hills Precinct", lat: 17.4300, lng: 78.4000, landmark: "Jubilee Hills Road No. 36" },
      { id: 3, name: "Ward 3 - Banjara Hills Residential", lat: 17.4150, lng: 78.4200, landmark: "KBR National Park" },
      { id: 4, name: "Ward 4 - Madhapur IT Corridor", lat: 17.4480, lng: 78.3740, landmark: "Hitech City Metro Link" },
      { id: 5, name: "Ward 5 - Kukatpally Transit Loop", lat: 17.4850, lng: 78.4050, landmark: "JNTU Junction" },
      { id: 6, name: "Ward 6 - Ameerpet Commercial Zone", lat: 17.4350, lng: 78.4400, landmark: "Ameerpet Cross Roads" },
      { id: 7, name: "Ward 7 - Secunderabad Junction", lat: 17.4400, lng: 78.5000, landmark: "Secunderabad Central Station" },
      { id: 8, name: "Ward 8 - Begumpet Airfield Area", lat: 17.4450, lng: 78.4600, landmark: "Begumpet Flyover" },
      { id: 9, name: "Ward 9 - Charminar Heritage Quarter", lat: 17.3616, lng: 78.4747, landmark: "Laad Bazaar Market" },
      { id: 10, name: "Ward 10 - Himayatnagar Residential", lat: 17.4000, lng: 78.4850, landmark: "Himayatnagar Main Road" },
      { id: 11, name: "Ward 11 - Dilsukhnagar Commercial", lat: 17.3680, lng: 78.5250, landmark: "Dilsukhnagar Bus Depot" },
      { id: 12, name: "Ward 12 - Miyapur Residential Block", lat: 17.4950, lng: 78.3500, landmark: "Miyapur Allwyn Cross Roads" },
      { id: 13, name: "Ward 13 - Kondapur Corridor", lat: 17.4600, lng: 78.3600, landmark: "Chirec School Road" },
      { id: 14, name: "Ward 14 - Koti Retail Junction", lat: 17.3850, lng: 78.4850, landmark: "Koti Womens College Lane" },
      { id: 15, name: "Ward 15 - Sanathnagar Industrial Zone", lat: 17.4550, lng: 78.4300, landmark: "Sanathnagar Foundry Block" }
    ];

    const DEPARTMENTS = [
      "Greater Hyderabad Municipal Corporation (GHMC)",
      "Roads & Buildings Department",
      "Hyderabad Metropolitan Water Supply & Sewerage Board",
      "Electricity Distribution Division",
      "Urban Forestry & Parks",
      "Solid Waste Management",
      "Storm Water Drain Division",
      "Traffic Engineering Cell",
      "Public Health Engineering",
      "Lake Protection Authority"
    ];

    const OFFICERS = [
      { name: "K. Sridhar", role: "Executive Engineer", dept: "Greater Hyderabad Municipal Corporation (GHMC)" },
      { name: "M. Anuradha", role: "Assistant Engineer", dept: "Roads & Buildings Department" },
      { name: "V. Rajesh", role: "Superintendent Engineer", dept: "Hyderabad Metropolitan Water Supply & Sewerage Board" },
      { name: "S. Venkat Rao", role: "Electrical Inspector", dept: "Electricity Distribution Division" },
      { name: "B. Chandrashekar", role: "Horticulture Officer", dept: "Urban Forestry & Parks" },
      { name: "P. Srinivas", role: "Sanitation Supervisor", dept: "Solid Waste Management" },
      { name: "G. Lakshmi", role: "Drainage Analyst", dept: "Storm Water Drain Division" },
      { name: "T. Satish Kumar", role: "Traffic Officer", dept: "Traffic Engineering Cell" },
      { name: "D. Suresh Babu", role: "Public Health Officer", dept: "Public Health Engineering" },
      { name: "Syed Mushtaq", role: "Lake Protection Officer", dept: "Lake Protection Authority" },
      { name: "A. Ravinder", role: "Senior Engineer", dept: "Roads & Buildings Department" },
      { name: "N. Prasad", role: "Field Inspector", dept: "Greater Hyderabad Municipal Corporation (GHMC)" },
      { name: "J. Geetha", role: "Line Engineer", dept: "Electricity Distribution Division" },
      { name: "R. Swarnalatha", role: "Forestry Analyst", dept: "Urban Forestry & Parks" },
      { name: "Mohammed Farhan", role: "Sanitation Inspector", dept: "Solid Waste Management" },
      { name: "C. H. Raju", role: "Civil Engineer", dept: "Storm Water Drain Division" },
      { name: "M. Divya Reddy", role: "Operations Lead", dept: "Hyderabad Metropolitan Water Supply & Sewerage Board" },
      { name: "Y. Srinivasa Rao", role: "District Engineer", dept: "Greater Hyderabad Municipal Corporation (GHMC)" },
      { name: "K. Mohan Babu", role: "Chief Planner", dept: "Traffic Engineering Cell" },
      { name: "P. Anitha", role: "Sanitation Lead", dept: "Solid Waste Management" },
      { name: "D. Mahender", role: "Assistant Inspector", dept: "Public Health Engineering" },
      { name: "B. Ramchander", role: "Field Officer", dept: "Lake Protection Authority" },
      { name: "Abdul Wahab", role: "Grid Supervisor", dept: "Electricity Distribution Division" },
      { name: "S. Nageshwar Rao", role: "Site Engineer", dept: "Roads & Buildings Department" },
      { name: "T. Swapna", role: "Water Inspector", dept: "Hyderabad Metropolitan Water Supply & Sewerage Board" },
      { name: "G. Venkatesh", role: "Dredging Lead", dept: "Storm Water Drain Division" },
      { name: "V. Shailaja", role: "Botanist Officer", dept: "Urban Forestry & Parks" },
      { name: "N. Karunakar", role: "Enforcement Specialist", dept: "Solid Waste Management" },
      { name: "M. A. Qayyum", role: "Junior Engineer", dept: "Greater Hyderabad Municipal Corporation (GHMC)" },
      { name: "R. Madhavan", role: "Surveyor", dept: "Roads & Buildings Department" },
      { name: "S. Kavitha", role: "Laboratory Tech", dept: "Hyderabad Metropolitan Water Supply & Sewerage Board" },
      { name: "B. Murali Krishna", role: "Line Inspector", dept: "Electricity Distribution Division" },
      { name: "G. Sandeep", role: "Park Supervisor", dept: "Urban Forestry & Parks" },
      { name: "Y. Rama Rao", role: "Logistics Coordinator", dept: "Solid Waste Management" },
      { name: "D. Ramya", role: "GIS Analyst", dept: "Traffic Engineering Cell" },
      { name: "M. K. Goud", role: "Zone Inspector", dept: "Greater Hyderabad Municipal Corporation (GHMC)" },
      { name: "Syed Ghouse", role: "Field Assistant", dept: "Storm Water Drain Division" },
      { name: "P. Vinay Kumar", role: "Chemist", dept: "Public Health Engineering" },
      { name: "V. Haritha", role: "Ecologist", dept: "Lake Protection Authority" },
      { name: "S. A. Khan", role: "Operations Manager", dept: "Hyderabad Metropolitan Water Supply & Sewerage Board" }
    ];

    // CATEGORY SPECIFIC TEMPLATES
    const TEMPLATES: Record<string, {
      titles: string[];
      descriptions: string[];
      rootCauses: string[];
      suggestions: string[][];
      predictiveAlerts: string[];
      departments: string[];
    }> = {
      "Road Issue": {
        titles: [
          "Severe pothole cluster near local Metro Pillar",
          "Peeling bituminous course on descending ramp",
          "Deep pavement sinkhole near educational hub",
          "Broken road median divider scattering bricks",
          "Extensive structural road wear near bus terminal"
        ],
        descriptions: [
          "Continuous water logging during rainfall and dense heavy axle bus transits have caused the asphalt layers to crumble, resulting in multiple tire-damaging potholes.",
          "The upper rubberized asphalt wearing course has stripped off fully, leaving loose granite aggregates scattered across the road and causing braking skid hazards.",
          "A major section of the asphalt has collapsed inwards on the secondary service lane, exposing the dry stone sub-grade and creating a 2-foot deep sink hole.",
          "Concrete block medians have been knocked out of alignment, with sharp concrete pieces protruding onto the main fast lane and blocking safe vehicle movement.",
          "Road surface displays deep structural rutting and complete cracking across both main lanes, making driving highly turbulent and unsafe for two-wheelers."
        ],
        rootCauses: [
          "Sub-base moisture penetration combined with persistent transit of overloaded municipal vehicles exceeding the standard sub-grade structural threshold.",
          "Asphalt aggregate stripping due to severe lateral shear friction from high-speed heavy braking on descending flyover lanes.",
          "Gradual soil settlement and piping of aggregate base caused by a minor underlying stormwater leakage node.",
          "High-speed mechanical impact by commercial vehicles during midnight coupled with missing reflective marker guards.",
          "Thermal expansion cycles combined with legacy bituminous mix formula which lacked correct polymer modifiers to resist water stripping."
        ],
        suggestions: [
          ["Excavate defective base down to 150mm", "Apply dense bituminous macadam base layer", "Lay wearing asphalt concrete with polymer binders", "Compact using a 10-ton dual-drum vibrating roller"],
          ["Mill the damaged top asphalt course with cold milling machine", "Spray hot rubberized tack emulsifier", "Screed stone matrix asphalt wearing layer", "Ensure longitudinal joint compaction"],
          ["Cordon off hazard zone with reflective water barriers", "Exhume surrounding hollow base", "Fill cavity with structural cement aggregate mix", "Restore asphalt pavement cap"],
          ["Remove broken concrete dividers", "Lay high-durability interlocked concrete medians", "Apply retroreflective yellow paints", "Install impact-absorbing terminal end blocks"],
          ["Execute full-width mechanical scarification", "Re-grade base with aggregate binder grade-II", "Apply micro-surfacing emulsion cap", "Calibrate adjacent drainage level outlets"]
        ],
        predictiveAlerts: [
          "Sub-grade water saturation detected via moisture sensors. High probability of recurring pavement failure without an immediate drainage bypass channel.",
          "Elevated structural wear curve. Adjacent flyover spans show similar aggregate stripping; full ramp resurfacing is advised before upcoming winter monsoon.",
          "Subsidence monitoring indicates minor soil movement. Immediate water-line pressure logging recommended to rule out adjacent main line fractures.",
          "Recurring collision sector. Traffic speed calibration or solar blinker median indicators recommended to reduce nightly impact risk.",
          "Asphalt lifecycle is depleted. Rutting index has exceeded 22mm. Temporary patches will fail under standard peak-hour heavy loading."
        ],
        departments: ["Roads & Buildings Department", "Greater Hyderabad Municipal Corporation (GHMC)"]
      },
      "Water Supply": {
        titles: [
          "High pressure drinking water pipeline burst",
          "Brownish muddy water distribution in local pipeline",
          "No municipal water supply for consecutive cycles",
          "Major pipeline gate-valve leakage wasting water",
          "Severe pipeline air-locking limiting tap pressure"
        ],
        descriptions: [
          "A main 600mm distribution pipe has ruptured sub-surface, causing drinking water to bubble out heavily, flooding the pedestrian walkways and nearby retail shops.",
          "Tap water supplied to households contains high turbidity, muddy soil residue, and is emitting a distinct sewage-like organic odor, making it completely unfit for consumption.",
          "Residents in this sector have received zero municipal water for the past 4 scheduled supply cycles, forcing complete reliance on commercial tankers.",
          "The main control valve chamber is flooded due to damaged gasket glands, leaking thousands of liters of clean drinking water onto the arterial road.",
          "Water supply pressure has dropped to near-zero. Pipes emit loud rattling air noises during supply hours but discharge only sputtering trickles."
        ],
        rootCauses: [
          "Internal rust scaling and high-pressure water hammer stress on vintage cast-iron pipelines laid in 1994.",
          "Cross-contamination caused by structural fractures in both the drinking water conduit and an overlapping parallel sewer line under ground.",
          "Main feeder valve blockage in the high-level municipal reservoir reservoir coupled with unannounced booster pump repairs.",
          "Friction wear of mechanical valve packings and failure of the brass stem gland seal under continuous cyclic load.",
          "Air pocket accumulation inside the distribution crest trunk due to a missing or clogged automatic air release valve."
        ],
        suggestions: [
          ["Isolate reservoir feed valves", "Excavate soil with backhoe loader to expose pipeline fracture", "Fit high-strength ductile iron mechanical repair sleeve", "Flush line and test pressure"],
          ["Deploy helium-gas leak detection to trace pipeline cross-contamination node", "Isolate and shut the cracked conduits", "Install high-density polyethylene (HDPE) liners", "Disinfect supply trunk with heavy chlorination"],
          ["Clear blockages inside municipal booster intake pump", "Replace worn impeller components", "Normalize reservoir outflow schedules", "Deploy temporary water bowsers to affected blocks"],
          ["Dewater the flooded valve chamber", "Replace the damaged mechanical gland packings", "Install heavy-duty synthetic rubber seal gaskets", "Enclose chamber with watertight security cover"],
          ["Locate highest physical point of the pipe loop", "Install automatic air release valves (ARVs)", "Flush line sediment to clear air lock bottlenecks", "Monitor pressure flow rates via inline sensors"]
        ],
        predictiveAlerts: [
          "Pipeline integrity metrics indicate end-of-life status. High frequency of pressure bursts expects further failures. Full trunk replacement is highly recommended.",
          "Biological hazard alert. Fecal coliform trace expected in water tests. Immediate boiling advisory should be broadcasted to the local ward community.",
          "System flow analysis shows unbalanced head levels. If reservoir outflow scheduling isn't automated, adjacent high-elevation blocks will suffer severe water scarcity.",
          "Corrosion of valve fasteners is widespread in this sector. Recommend a targeted preventative overhaul of all municipal valve hubs in Ward 6.",
          "Air pockets indicate recurring intake vacuum suction. Intake valve calibrations required at the primary water treatment plant to prevent pump damage."
        ],
        departments: ["Hyderabad Metropolitan Water Supply & Sewerage Board", "Public Health Engineering"]
      },
      "Sanitation": {
        titles: [
          "Overflowing sewer manhole onto main shopping lane",
          "Blocked storm-water drain causing stagnant runoff",
          "Pedestrian pathway flooded with foul-smelling effluent",
          "Uncovered septic drainage vent emitting bio-gases",
          "Clogged gully trap chamber creating swampy marsh"
        ],
        descriptions: [
          "Black sewer water is bubbling out continuously from a loose manhole cover, spreading across the shopping walkways and causing terrible odor and slippery footing.",
          "The roadside storm water concrete drain is completely choked with plastic waste, silt, and tree branches, causing rainwater to stagnate and breed mosquitoes.",
          "Raw municipal effluent is trickling out from a cracked sub-surface sewage junction, saturating the pedestrian walkway and creating severe sanitary risks.",
          "The municipal sewer ventilation column has rusted and snapped at the base, venting raw sewer hydrogen sulfide gases directly at pedestrian breathing levels.",
          "Roadside catch-pit chamber is fully blocked by dry leaves and soil sediment, creating a large pool of dirty, foul-smelling water spanning across the street lane."
        ],
        rootCauses: [
          "Accumulation of commercial fats, oil, grease (FOG), and discarded plastics forming a hard chemical block inside the local sewer lateral.",
          "Delayed routine de-silting schedules combined with persistent municipal littering into the open roadside concrete channels.",
          "Infiltration of heavy tree root systems into clay-tile sewer pipes, cracking the pipe collar joints and causing sewer blockages.",
          "Environmental rust and sulfur oxidation wearing out the cast-iron ventilation pipe column, leaving it open and exposed.",
          "Accumulation of construction sand and silt runoff from adjacent private development plots, sealing the catch-pit filter screen."
        ],
        suggestions: [
          ["Deploy a high-velocity hydro-jetting machine to clear fat blocks", "Vacuum out sewer sludge using truck-mounted pump", "Enforce commercial grease-trap compliance checks on local food stalls"],
          ["Dredge out solid silt up to 1 meter depth from storm drain", "Dispose of mud aggregate outside ward zone", "Install high-strength steel trash screens on intake vents"],
          ["Trace pipeline cracks using fiber-optic CCTV pipe inspection camera", "Excavate target node", "Install joint PVC sleeves", "Backfill soil with lime disinfectant compound"],
          ["Remove broken ventilation column base", "Erect heavy-duty PVC ventilation shaft with activated carbon filter cap", "Verify gas flow pressure levels"],
          ["Clear sand and leaf blockages from concrete catch pit", "Clean internal gully trap screens", "De-clog the outlet lateral pipeline link", "Apply eco-friendly larvicides to eliminate mosquitoes"]
        ],
        predictiveAlerts: [
          "Frequent commercial grease blocking zone. High recurrence probability unless local commercial kitchens install certified, regularly-cleaned grease traps.",
          "High flooding hazard. A 15mm/hr rainfall event will cause instant street overflow due to reduced drainage volume. Immediate de-silting is mandatory.",
          "Root intrusion detected at multiple adjacent nodes. Recommend mechanical root cutting and chemical treatment of sewer joints across this lane.",
          "Elevated sewer gas concentrations. Continuous monitoring advised; high ambient heat might trigger hazardous sulfur gas build-up.",
          "Soil runoff rates are high due to lack of ground foliage. Catch pits will clog within 30 days unless nearby open soil is grassed or paved."
        ],
        departments: ["Storm Water Drain Division", "Public Health Engineering", "Hyderabad Metropolitan Water Supply & Sewerage Board"]
      },
      "Electrical": {
        titles: [
          "Dangerous overhead utility cable sag near market",
          "Complete failure of high-speed Flyover LEDs",
          "Sparking overhead electricity transformer terminals",
          "Damaged feeder pillar box with live wires exposed",
          "Flickering high-voltage streetlights on ring road"
        ],
        descriptions: [
          "A huge bundle of mixed electrical and telecom overhead cables has sagged to within 6 feet of the road surface, presenting extreme danger for trucks and pedestrians.",
          "An entire block of 15 high-intensity LED streetlights on the flyover is non-functional, causing complete darkness and high night-driving collision risks.",
          "Frequent visible blue sparks and crackling noises observed at the overhead transformer pole, especially during light showers or evening peak loads.",
          "The steel door of the outdoor power distribution pillar box has broken off, exposing high-voltage terminal lines and live fuses right next to a park sidewalk.",
          "High-pressure sodium streetlights on this lane are cycling/flickering continuously, causing severe visual discomfort and dark patches on the highway."
        ],
        rootCauses: [
          "Tensioning bracket fatigue on concrete utility poles coupled with excessive deadweight from unauthorized private fiber-optic lines.",
          "Water seepage in the underground electrical junction chamber, tripping the main residual current circuit breaker (RCCB).",
          "Loose contact connectors on the high-tension busbars combined with heavy accumulation of dirt and rust oxide on the terminal clamps.",
          "Vandalism and physical corrosion of the sheet-metal enclosure hinge pins coupled with missing lock assemblies.",
          "Aging of the ballast capacitor units and degradation of the light sensors controlling the automatic photo-sensitive switchboard."
        ],
        suggestions: [
          ["Coordinate with telecom providers to identify and tag cables", "Tension and anchor overhead wire supports", "Remove illegal cable wraps", "Install aerial cable bundling straps"],
          ["De-energize the flyover lighting circuit", "Dewater and seal the underground junction box", "Replace shorted cable leads", "Install IP68 rated weatherproof connectors"],
          ["Conduct emergency load shedding on transformer", "Clean high-tension terminals with wire brush", "Apply anti-oxidation contact grease", "Tighten terminal bolt assemblies to spec"],
          ["Install custom double-door IP55 heavy steel distribution pillar box", "Enclose live internal copper busbars with insulating sleeves", "Install heavy mechanical security padlocks"],
          ["Inspect lighting ballast panels", "Replace degraded electrical capacitors and starters", "Install modern solid-state photocell sensors", "Upgrade flickering sodium bulbs to energy-efficient LEDs"]
        ],
        predictiveAlerts: [
          "Physical load limits exceeded. Snapping hazard high. Standard heavy cargo transport will trigger complete pole breakage without cable raising.",
          "Ground fault risk remains. High soil moisture near flyover base may re-trigger short-circuits. Complete waterproofing of conduit entries advised.",
          "Overload telemetry alert. Transformer core temperature exceeds 85°C during peak hours. Imminent burn-out if phase loading is not balanced soon.",
          "Critical safety violation. High risk of electrical shock to pedestrians during wet conditions. Immediate enclosure upgrade is a life-safety priority.",
          "Power quality drop. Frequent voltage dips detected in this line segment. Power supply substation must calibrate voltage regulator taps."
        ],
        departments: ["Electricity Distribution Division", "Traffic Engineering Cell"]
      },
      "Waste Management": {
        titles: [
          "Vast smart waste bin overflowing onto sidewalk",
          "Illegal commercial debris dumping in public park",
          "Accumulation of domestic kitchen waste on street corner",
          "Discarded electronic and hazardous waste in empty plot",
          "Neglected green waste pile blocking transit lane"
        ],
        descriptions: [
          "The municipal smart waste container has overflowed completely, with rotting garbage bags, plastics, and debris scattered across the main pedestrian pathway.",
          "Loads of broken concrete slabs, tiles, brick powder, and drywall have been dumped illegally inside the public park green zone, destroying the grass beds.",
          "A large pile of household organic garbage has accumulated on the street corner. It is rotting in the heat, emitting a foul stench, and attracting stray dogs.",
          "An empty residential plot is being used to dump degraded television casings, circuit boards, batteries, and chemical containers, raising toxic leakage risks.",
          "Heavy branches and foliage cleared during private tree-trimming have been left on the road shoulder for weeks, forcing pedestrians to walk on the fast lane."
        ],
        rootCauses: [
          "Mechanical breakdown of the smart bin ultrasonic fill-sensor combined with delayed routing of the hydraulic compaction garbage truck.",
          "Illegal midnight dumping by private construction renovators aiming to bypass municipal commercial landfill disposal charges.",
          "Absence of designated community waste bins in this sector coupled with irregular daily household garbage collector collection schedules.",
          "Lack of boundary fencing on empty private plots combined with missing municipal surveillance in the secondary residential blocks.",
          "Failure of garden clearing crews to coordinate debris transport with the bulk waste transit flatbeds."
        ],
        suggestions: [
          ["Deploy mechanical refuse loader to clear waste pile", "Steam-clean and sanitize the smart bin and sidewalk", "Replace faulty ultrasonic fill-sensor", "Update collection route database"],
          ["Clear construction debris using Bobcat loaders", "Exhume damaged soil layer", "Install motion-sensor LED floodlights on park boundary", "Erect warning sign boards detailing penal fines"],
          ["Clear trash heap and spray organic disinfectants", "Install a dual-bin dry and wet municipal waste hub on the corner", "Reinforce door-to-door collection schedules"],
          ["Identify and secure the private plot owner", "Deploy specialized hazardous waste handling team", "Sift and transport e-waste to certified recycling unit", "Mandate plot fencing"],
          ["Deploy a heavy wood-chipper machine to process organic green waste", "Load processed chips onto municipal trailers", "Restore road shoulder lane access"]
        ],
        predictiveAlerts: [
          "Fill-level telemetry indicates a high weekend volume spike. Recommend adjusting refuse collection schedules to run twice-daily on Saturdays and Sundays.",
          "Nightly commercial dumping hotspot. High probability of recurring illegal dumping unless physical height barriers are installed on the park lane.",
          "Stray animal attraction index is high. Risk of stray bites in this residential block is elevated due to food waste decomposition.",
          "Soil toxicity hazard. Chemical leaching into shallow groundwater table is highly probable without immediate exhumation of battery waste.",
          "Foliage has dried completely, turning into a major fire hazard. Simple ignition from a discarded cigarette could cause a fast-moving street-side fire."
        ],
        departments: ["Solid Waste Management", "Greater Hyderabad Municipal Corporation (GHMC)"]
      },
      "Environment": {
        titles: [
          "Rusted and dangerous children play equipment",
          "Hyacinth choking lake surface and emitting sulfur odor",
          "Severe tree canopy overgrowth blocking streetlights",
          "Erosion of public park walking trail following rains",
          "Unauthorized felling of protected heritage tree"
        ],
        descriptions: [
          "Swings and slides in the public park have rusted severely, with broken chain links and sharp metal shards exposed, presenting a critical safety hazard for children.",
          "Water hyacinths have completely blanketed the lake surface, cutting off oxygen for fish, turning the water black, and releasing a rotten egg sulfur odor.",
          "Overhanging heavy tree branches have completely enveloped 5 consecutive streetlights, blocking all night lighting and casting dark shadows on the road.",
          "Heavy runoff has eroded the gravel walking trail in the public park, creating deep mud ruts, exposed tree roots, and highly unstable footing for walkers.",
          "A mature neem tree has been hacked down on the public sidewalk by private parties without municipal forestry permits or tree-felling authorization."
        ],
        rootCauses: [
          "Complete lack of preventive mechanical lubrication and yearly anti-corrosive painting cycles by the ward park maintenance staff.",
          "Unregulated inlet of domestic sewage containing high levels of agricultural/detergent phosphates and nitrates into the lake body.",
          "Extended absence of scheduled seasonal pruning of the municipal roadside arboriculture corridor.",
          "Inadequate storm drainage flanking the walking track combined with using poor sub-grade soils lacking aggregate stability binders.",
          "Illegal cutting by adjacent commercial shop owners to increase visibility of their street-front advertising billboards."
        ],
        suggestions: [
          ["Dismantle and remove the rusted metal play structures", "Install modern modular high-density polyethylene (HDPE) swing units", "Pour safety-certified rubber mulch base"],
          ["Deploy specialized aquatic weed harvester boats", "Physically clear hyacinth biomass", "Install floating solar-powered surface aerators", "Monitor water dissolved oxygen"],
          ["Deploy hydraulic aerial bucket lift truck", "Prune overhanging branches blocking streetlight optics", "Apply protective pruning sealant to tree wounds"],
          ["Re-grade eroded walking track with stable stone dust base", "Install interlocking concrete paving tiles", "Construct side brick-lined stormwater drains"],
          ["Confiscate felling equipment from the site", "Issue heavy financial fine to offending business owner under Tree Protection Act", "Plant 5 high-quality native tree saplings as compensation"]
        ],
        predictiveAlerts: [
          "High injury risk. Play equipment is structurally compromised. Recommend sealing the playground gates with warning tape until complete replacement.",
          "Complete lake eutrophication risk. Dissolved oxygen levels are under 1.2 mg/L. Imminent large-scale fish die-off within 48 hours without aeration.",
          "Wind squall hazard. Overhanging branches are extremely heavy and rest directly on low-tension power cables, risking major line breaks.",
          "Further track disintegration expected. Any rain event exceeding 10mm will wash out the remaining gravel base, blocking the park entirely.",
          "Loss of canopy cover. Sidewalk heat-island index will increase. Recommend regular drone arbor surveys of the main boulevard."
        ],
        departments: ["Urban Forestry & Parks", "Lake Protection Authority", "Greater Hyderabad Municipal Corporation (GHMC)"]
      }
    };

    // 3. Generate 500 High-Quality Citizens
    console.log("Generating 500 internally consistent citizen profiles...");
    const citizenEmails: string[] = [];
    const seedUsers = [];

    // First, seed the mock logged-in user with high points so they can see their cool profile
    seedUsers.push({
      uid: "mock-google-user-123",
      email: "citizen.pioneer@gmail.com",
      name: "Pioneer Citizen",
      reputationPoints: 450,
      badges: JSON.stringify(["Reporter", "Validator", "Hero", "SLA Advocate", "Green Pioneer"])
    });
    citizenEmails.push("citizen.pioneer@gmail.com");

    // Seed the user's explicit email if they log in via standard Google Auth
    seedUsers.push({
      uid: "mock-google-user-poojitha",
      email: "machrlapoojitha@gmail.com",
      name: "Poojitha Machrla",
      reputationPoints: 1120,
      badges: JSON.stringify(["Reporter", "Validator", "Hero", "Super Hero", "SLA Advocate", "Water Watchdog"])
    });
    citizenEmails.push("machrlapoojitha@gmail.com");

    // Generate the remaining 498 users
    for (let i = 1; i <= 498; i++) {
      const fName = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const lName = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const name = `${fName} ${lName}`;
      const email = `${fName.toLowerCase()}.${lName.toLowerCase()}${i}@hyderabad.civic.in`;
      
      const rep = Math.floor(Math.random() * 300); // base points
      // Add top contributors
      const isTop = Math.random() < 0.1; // 10% are top contributors
      const finalRep = isTop ? Math.floor(200 + Math.random() * 1000) : rep;

      const userBadges = ["Reporter"];
      if (finalRep > 150) userBadges.push("Validator");
      if (finalRep > 400) userBadges.push("Hero");
      if (finalRep > 750) userBadges.push("Super Hero");
      if (Math.random() < 0.3) userBadges.push("Street Guard");
      if (Math.random() < 0.2) userBadges.push("Water Watchdog");
      if (Math.random() < 0.15) userBadges.push("Green Pioneer");
      if (Math.random() < 0.1) userBadges.push("SLA Advocate");

      seedUsers.push({
        uid: `citizen-uid-${i}`,
        email,
        name,
        reputationPoints: finalRep,
        badges: JSON.stringify(userBadges)
      });
      citizenEmails.push(email);
    }

    // Bulk insert users
    const chunkSize = 100;
    for (let i = 0; i < seedUsers.length; i += chunkSize) {
      const chunk = seedUsers.slice(i, i + chunkSize);
      for (const u of chunk) {
        await db.insert(users).values(u).onConflictDoUpdate({
          target: users.uid,
          set: {
            email: u.email,
            name: u.name,
            reputationPoints: u.reputationPoints,
            badges: u.badges,
          }
        });
      }
    }
    console.log(`Successfully seeded ${seedUsers.length} users with profiles!`);

    // 4. Generate 160 Highly Detailed Hyderabad Complaints
    console.log("Generating 160 realistic complaints centered around Hyderabad...");
    const seedIssuesList = [];
    const issueCategoriesList: ("Road Issue" | "Water Supply" | "Sanitation" | "Electrical" | "Waste Management" | "Environment")[] = [
      "Road Issue", "Water Supply", "Sanitation", "Electrical", "Waste Management", "Environment"
    ];

    // Status profiles
    const statusPool: ("Reported" | "Verified" | "Assigned" | "In Progress" | "Resolved")[] = [
      "Resolved", "In Progress", "Assigned", "Verified", "Reported"
    ];

    // Severity profiles
    const severityPool: ("Critical" | "High" | "Medium" | "Low")[] = [
      "Medium", "High", "Low", "Critical"
    ];

    function getDeterministicSeedImages(
      category: string,
      title: string = "",
      description: string = ""
    ): { before: string; after: string } {
      return {
        before: getKeywordSpecificImage(category, title, description, "before"),
        after: getKeywordSpecificImage(category, title, description, "after")
      };
    }

    // Helper to generate coordinates in a subtle offset around base coordinate
    function offsetCoords(lat: number, lng: number) {
      const offsetLat = lat + (Math.random() - 0.5) * 0.015;
      const offsetLng = lng + (Math.random() - 0.5) * 0.015;
      return { lat: parseFloat(offsetLat.toFixed(5)), lng: parseFloat(offsetLng.toFixed(5)) };
    }

    const languages = ["English", "Telugu", "Hindi", "Urdu"];

    // Generate exactly 160 issues
    for (let i = 1; i <= 160; i++) {
      // Pick Category based on specified ratios
      // Road Issues (30%), Water Supply (22%), Sanitation (22%), Electrical (18%), Waste (3%), Environment (5%)
      let category: "Road Issue" | "Water Supply" | "Sanitation" | "Electrical" | "Waste Management" | "Environment" = "Road Issue";
      const roll = Math.random();
      if (roll < 0.30) {
        category = "Road Issue";
      } else if (roll < 0.52) {
        category = "Water Supply";
      } else if (roll < 0.74) {
        category = "Sanitation";
      } else if (roll < 0.92) {
        category = "Electrical";
      } else if (roll < 0.95) {
        category = "Waste Management";
      } else {
        category = "Environment";
      }

      // Pick Severity based on ratios: Critical (10%), High (25%), Medium (45%), Low (20%)
      let severity: "Critical" | "High" | "Medium" | "Low" = "Medium";
      const sevRoll = Math.random();
      if (sevRoll < 0.10) {
        severity = "Critical";
      } else if (sevRoll < 0.35) {
        severity = "High";
      } else if (sevRoll < 0.80) {
        severity = "Medium";
      } else {
        severity = "Low";
      }

      // Pick Status: Resolved (~40%), In Progress (~25%), Assigned (~15%), Verified (~10%), Reported (~10%)
      let status: "Reported" | "Verified" | "Assigned" | "In Progress" | "Resolved" = "Reported";
      const statusRoll = Math.random();
      if (statusRoll < 0.40) {
        status = "Resolved";
      } else if (statusRoll < 0.65) {
        status = "In Progress";
      } else if (statusRoll < 0.80) {
        status = "Assigned";
      } else if (statusRoll < 0.90) {
        status = "Verified";
      } else {
        status = "Reported";
      }

      const templates = TEMPLATES[category];
      const templateIndex = Math.floor(Math.random() * templates.titles.length);
      
      const titleText = `${templates.titles[templateIndex]} #${1000 + i}`;
      const descriptionText = `${templates.descriptions[templateIndex]} Please resolve this on priority. This is causing major distress to local residents.`;
      const rootCause = templates.rootCauses[templateIndex];
      const suggestions = templates.suggestions[templateIndex];
      const alert = templates.predictiveAlerts[templateIndex];
      const assignedDept = templates.departments[Math.floor(Math.random() * templates.departments.length)];

      // Pick Ward
      const wardObj = WARDS[Math.floor(Math.random() * WARDS.length)];
      const { lat: rawLat, lng: rawLng } = offsetCoords(wardObj.lat, wardObj.lng);
      
      const address = `${wardObj.landmark}, Sector ${Math.floor(Math.random() * 5) + 1}, near block ${String.fromCharCode(65 + Math.floor(Math.random() * 6))}`;

      // Date reported
      const reportedAt = Math.floor(oneYearAgo + Math.random() * (now - oneYearAgo - 7 * 24 * 3600 * 1000));
      
      const votes = Math.floor(Math.random() * 110) + 10;
      const verifiedCount = Math.floor(votes * (0.4 + Math.random() * 0.4));
      
      // Select upvoters and validators emails
      const upvotersPool = [];
      const validatorsPool = [];
      for (let v = 0; v < 5; v++) {
        upvotersPool.push(citizenEmails[Math.floor(Math.random() * citizenEmails.length)]);
        validatorsPool.push(citizenEmails[Math.floor(Math.random() * citizenEmails.length)]);
      }

      const reporterEmail = citizenEmails[Math.floor(Math.random() * citizenEmails.length)];

      const cost = Math.floor(5000 + Math.random() * 145000);

      // Select before and after photos deterministically based on keyword/title matching
      const seedImgPair = getDeterministicSeedImages(category, titleText, descriptionText);
      const beforeImg = seedImgPair.before;

      let resolvedImage = undefined;
      let beforeAfterResult = undefined;
      let beforeAfterConfidence = undefined;

      if (status === "Resolved") {
        resolvedImage = seedImgPair.after;
        beforeAfterResult = "AI Resolved Comparison Engine verified 100% resolution. Debris / blockage completely excavated, surface restored, and traffic flow normalized.";
        beforeAfterConfidence = Math.floor(Math.random() * 10) + 90;
      }

      // Assemble trust metrics
      const aiConf = Math.floor(Math.random() * 10) + 90; // 90-100%
      const gpsVerified = Math.random() < 0.95;
      const duplicateStatus = "Checked-Clear";
      
      // Calculate realistic trust score (65-98)
      const trustScore = Math.floor(70 + (verifiedCount / votes) * 20 + (gpsVerified ? 8 : 0));

      // Community Impact Metrics
      const isCritical = severity === "Critical";
      const isHigh = severity === "High";
      const impactScore = Math.floor(40 + (isCritical ? 45 : isHigh ? 30 : 15) + Math.random() * 15);
      const affected = Math.floor(50 + (isCritical ? 500 : isHigh ? 200 : 50) + Math.random() * 100);
      
      const schoolsHospitals = [];
      if (Math.random() < 0.3) schoolsHospitals.push("Apollo Clinic");
      if (Math.random() < 0.25) schoolsHospitals.push("St. Jude High School");
      if (Math.random() < 0.15) schoolsHospitals.push("Care Hospital Gachibowli");

      const trafficDisruption: "None" | "Low" | "Medium" | "High" = 
        isCritical ? "High" : isHigh ? "Medium" : Math.random() < 0.5 ? "Low" : "None";

      // Timeline entries
      const timelineEntries = [
        { status: "Reported", updatedAt: reportedAt, note: "Citizen complaint officially logged in CivicHero system." }
      ];

      if (status !== "Reported") {
        timelineEntries.push({
          status: "Verified",
          updatedAt: reportedAt + 2 * 3600 * 1000,
          note: `System completed AI verification. Verified by ${verifiedCount} community validators. GPS telemetry checked.`
        });
      }

      if (status !== "Reported" && status !== "Verified") {
        const assignedOfficer = OFFICERS.find(o => o.dept === assignedDept) || OFFICERS[0];
        timelineEntries.push({
          status: "Assigned",
          updatedAt: reportedAt + 5 * 3600 * 1000,
          note: `Re-routed to ${assignedDept}. Dispatched Field Crew under Lead Officer: ${assignedOfficer.name}.`
        });
      }

      if (status === "In Progress" || status === "Resolved") {
        timelineEntries.push({
          status: "In Progress",
          updatedAt: reportedAt + 12 * 3600 * 1000,
          note: "Crew deployed on site with heavy tooling. Safety perimeter established, mechanical restoration active."
        });
      }

      if (status === "Resolved") {
        timelineEntries.push({
          status: "Resolved",
          updatedAt: reportedAt + 24 * 3600 * 1000,
          note: "Operational fix completed. Verified resolved via citizen visual checking & AI comparison verification."
        });
      }

      seedIssuesList.push({
        id: `complaint-${category.toLowerCase().replace(" ", "-")}-${i}`,
        title: titleText,
        description: descriptionText,
        category,
        severity,
        confidence: aiConf,
        lat: rawLat,
        lng: rawLng,
        address,
        ward: wardObj.name,
        district: wardObj.name.includes("Charminar") || wardObj.name.includes("Koti") ? "South District" : wardObj.name.includes("Jubilee") || wardObj.name.includes("Banjara") || wardObj.name.includes("Gachibowli") ? "West District" : "Central District",
        status,
        statusTimeline: JSON.stringify(timelineEntries),
        votes,
        upvoters: JSON.stringify(upvotersPool),
        verifiedCount,
        validators: JSON.stringify(validatorsPool),
        isFakeFlagged: false,
        reputationPointsGiven: status === "Resolved",
        resolutionCost: cost,
        resolutionSuggestions: JSON.stringify(suggestions),
        rootCauseAnalysis: rootCause,
        predictiveAlert: alert,
        assignedDepartment: assignedDept,
        followers: JSON.stringify([reporterEmail]),
        createdAt: reportedAt,
        originalLanguage: languages[Math.floor(Math.random() * languages.length)],
        reporterEmail,
        image: beforeImg,
        resolutionImage: resolvedImage,
        beforeAfterResult,
        beforeAfterConfidence,
        trustScore,
        isEmergencyEscalated: isCritical || (isHigh && Math.random() < 0.5),
        communityImpactScore: impactScore,
        communityImpactCitizensAffected: affected,
        communityImpactSchoolsHospitals: JSON.stringify(schoolsHospitals),
        communityImpactTrafficDisruption: trafficDisruption,
        trustBreakdownAiConfidence: aiConf,
        trustBreakdownCommunityValidations: verifiedCount,
        trustBreakdownGpsVerified: gpsVerified,
        trustBreakdownDuplicateStatus: duplicateStatus
      });
    }

    // Bulk insert complaints
    for (let i = 0; i < seedIssuesList.length; i += chunkSize) {
      const chunk = seedIssuesList.slice(i, i + chunkSize);
      for (const issue of chunk) {
        await db.insert(issues).values(issue);
      }
    }
    console.log(`Successfully seeded ${seedIssuesList.length} complaints!`);

    // 5. Generate 350+ Deep Interconnected Comments / Timeline logs
    console.log("Generating 300+ citizen/official comment logs...");
    const citizenCommentPool = [
      "Water pressure was very low, glad the team is taking a look.",
      "The odor is reducing after the sanitation crew arrived.",
      "This pothole caused a minor bike skid yesterday, please patch it quickly.",
      "I live nearby and can confirm that this issue has been resolved nicely.",
      "Thank you for the super-fast response time, GHMC is really shining!",
      "Still waiting for full asphalt clearing here, some dust remains.",
      "Streetlight is working perfectly now! Walking at night feels safe again.",
      "Excellent AI duplicate checking, it merged with my report automatically.",
      "Sewer line is cleared. Solid work by the sanitation engineers.",
      "The heavy machinery is on-site. Hope this is a permanent solution and not just a patch.",
      "This water pipe leaks every winter, structural pipe renewal is definitely needed.",
      "I appreciate the transparency of tracking the cost estimate here.",
      "Great work! Very happy with how CivicHero coordinates with water works board.",
      "Confirmed resolved. Cleaned up everything nicely."
    ];

    const officialCommentPool = [
      "Field engineering team is dispatched with a vacuum jetting compressor.",
      "Repairs scheduled for today's morning cycle. Temporary caution cones laid.",
      "Material orders approved. Silt clearance operations in progress.",
      "LED ballast modules replaced and main circuit board waterproofed.",
      "Inspection complete. No structural leaks detected on the main water trunk, joint sealed.",
      "Refuse container emptied. Sanitation truck routing frequency increased.",
      "Hydraulic excavator deployed. Sub-grade aggregate packing initiated.",
      "Official SLA timeline updated. Expect permanent restoration by tonight."
    ];

    const seedCommentsList = [];
    let commentIndex = 1;

    for (const issue of seedIssuesList) {
      // Add 1-3 comments for each issue
      const numComments = Math.floor(Math.random() * 3) + 1;
      for (let c = 0; c < numComments; c++) {
        const isOfficial = Math.random() < 0.35; // 35% comments from official representatives
        const text = isOfficial 
          ? officialCommentPool[Math.floor(Math.random() * officialCommentPool.length)]
          : citizenCommentPool[Math.floor(Math.random() * citizenCommentPool.length)];

        const userEmail = isOfficial 
          ? `officer.${OFFICERS[Math.floor(Math.random() * OFFICERS.length)].name.toLowerCase().replace(/[^a-z]/g, "")}@hyderabad.gov.in`
          : citizenEmails[Math.floor(Math.random() * citizenEmails.length)];

        const userName = isOfficial 
          ? `Officer ${OFFICERS[Math.floor(Math.random() * OFFICERS.length)].name} (${OFFICERS[Math.floor(Math.random() * OFFICERS.length)].role})`
          : seedUsers.find(u => u.email === userEmail)?.name || "Civic Defender";

        const userRole = isOfficial ? "Official" : "Citizen";
        const commentTime = issue.createdAt + (c + 1) * 2 * 3600 * 1000;

        seedCommentsList.push({
          issueId: issue.id,
          text,
          userEmail,
          userName,
          userRole,
          timestamp: commentTime
        });
      }
    }

    // Bulk insert comments
    for (let i = 0; i < seedCommentsList.length; i += chunkSize) {
      const chunk = seedCommentsList.slice(i, i + chunkSize);
      for (const c of chunk) {
        await db.insert(comments).values(c);
      }
    }

    console.log(`Successfully seeded ${seedCommentsList.length} comments and community logs!`);
    console.log("--------------------------------------------------");
    console.log("CIVICHERO HYDERABAD SMART-CITY DATA SEED COMPLETE!");
    console.log("--------------------------------------------------");
  } catch (error) {
    console.error("Failed to seed Hyderabad municipal database:", error);
  }
}
