import React, { useState, useEffect } from "react";
import {
  MapPin,
  School,
  Landmark,
  Building2,
  Trees,
  Search,
  Globe,
  Layers,
  Activity,
  Locate,
  Info,
  Sparkles,
  CloudRain,
  Navigation,
  Compass,
  Loader,
  Wifi,
  Tv,
  Flame,
  Shield,
  HeartPulse,
  Eye,
  AlertTriangle,
  Grid
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Issue } from "../types";

// Landmark details
export const LANDMARKS = [
  { id: "lm-1", name: "St. Jude Public School", lat: 17.4085, lng: 78.4720, type: "school", icon: School, color: "text-blue-500 bg-blue-100 border-blue-300 dark:bg-blue-950/40 dark:border-blue-800" },
  { id: "lm-2", name: "Apollo General Hospital", lat: 17.3980, lng: 78.4810, type: "hospital", icon: Building2, color: "text-red-500 bg-red-100 border-red-300 dark:bg-red-950/40 dark:border-red-800" },
  { id: "lm-3", name: "City Metro Station Gate 1", lat: 17.4120, lng: 78.4950, type: "metro", icon: Landmark, color: "text-indigo-500 bg-indigo-100 border-indigo-300 dark:bg-indigo-950/40 dark:border-indigo-800" },
  { id: "lm-4", name: "Vibe Nagar Central Market", lat: 17.4025, lng: 78.4910, type: "market", icon: Landmark, color: "text-amber-500 bg-amber-100 border-amber-300 dark:bg-amber-950/40 dark:border-amber-800" },
  { id: "lm-5", name: "Greenfield Public Park", lat: 17.4010, lng: 78.4710, type: "park", icon: Trees, color: "text-emerald-500 bg-emerald-100 border-emerald-300 dark:bg-emerald-950/40 dark:border-emerald-800" }
];

const ROADS = [
  { id: "road-1", name: "Metro Parkway NW", orientation: "vertical", pos: "25%", strokeWidth: 6 },
  { id: "road-2", name: "Secunderabad Transit Arterial", orientation: "vertical", pos: "50%", strokeWidth: 8 },
  { id: "road-3", name: "Sector 4 Beltway", orientation: "vertical", pos: "75%", strokeWidth: 6 },
  { id: "road-4", name: "Charminar Highway Link", orientation: "horizontal", pos: "30%", strokeWidth: 6 },
  { id: "road-5", name: "Gachibowli Bypass Arterial", orientation: "horizontal", pos: "65%", strokeWidth: 8 }
];

// Boundary matching server
const MIN_LAT = 17.3900;
const MAX_LAT = 17.4200;
const MIN_LNG = 78.4600;
const MAX_LNG = 78.5100;

interface MapProps {
  issues: Issue[];
  selectedIssueId: string | null;
  onSelectIssue: (issueId: string) => void;
  onMapClick: (lat: number, lng: number, address: string) => void;
  showHeatmap: boolean;
  filterCategory: string;
}

export default function CivicWebMap({
  issues,
  selectedIssueId,
  onSelectIssue,
  onMapClick,
  showHeatmap,
  filterCategory
}: MapProps) {
  const [zoom, setZoom] = useState<number>(1);
  const [mapMode, setMapMode] = useState<"standard" | "satellite">("standard");
  const [isClustered, setIsClustered] = useState<boolean>(true);
  const [mapProvider, setMapProvider] = useState<"blueprint" | "google">("blueprint");
  const [searchVal, setSearchVal] = useState("");
  const [hoveredItem, setHoveredItem] = useState<{ name: string; info: string; type?: string } | null>(null);

  // High-Tech Overlays & Controls
  const [trafficActive, setTrafficActive] = useState<boolean>(true);
  const [weatherActive, setWeatherActive] = useState<boolean>(false);
  const [routeActive, setRouteActive] = useState<boolean>(true);
  const [aiDetectionActive, setAiDetectionActive] = useState<boolean>(false);
  const [satelliteLabelsActive, setSatelliteLabelsActive] = useState<boolean>(true);
  const [terrainActive, setTerrainActive] = useState<boolean>(true);

  // Live simulation and GPS Acquisition states
  const [isGpsAcquiring, setIsGpsAcquiring] = useState<boolean>(false);
  const [gpsProgressText, setGpsProgressText] = useState("");
  const [isSatelliteScanning, setIsSatelliteScanning] = useState<boolean>(false);
  const [mapClicks, setMapClicks] = useState<Array<{ x: number; y: number; id: number }>>([]);

  // Simulated dynamic sensor feed
  const [liveNotifications, setLiveNotifications] = useState<Array<{ id: string; text: string; type: string; timestamp: string }>>([
    { id: "n-1", text: "AI-Vision: Water pipeline pressure normal in Sector 4", type: "system", timestamp: "04:31:02" },
    { id: "n-2", text: "Radar: Congestion detected near Metro Parkway NW", type: "traffic", timestamp: "04:31:12" },
    { id: "n-3", text: "Report: Pothole flagged near Greenfield Public Park", type: "hazard", timestamp: "04:31:40" }
  ]);

  // Handle auto-simulated real-time report arrives
  useEffect(() => {
    const alertsPool = [
      { text: "AI-Vision: Garbage heap accumulation detected near Central Market", type: "hazard" },
      { text: "System: Structural safety verification complete for Ward Block 3", type: "system" },
      { text: "Radar: Emergency vehicle clearance route calculated successfully", type: "route" },
      { text: "Telemetry: Rain gauge reporting 12mm/hr near Hospital Block", type: "weather" },
      { text: "Grid: Backup electricity transformer loaded at 74% capacity", type: "system" },
      { text: "Incident: Streetlight blackout reported on Sector 4 Beltway", type: "hazard" }
    ];

    const interval = setInterval(() => {
      const randomAlert = alertsPool[Math.floor(Math.random() * alertsPool.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(" ")[0];
      setLiveNotifications(prev => [
        { id: `n-${Date.now()}`, text: randomAlert.text, type: randomAlert.type, timestamp: timeStr },
        ...prev.slice(0, 3)
      ]);
    }, 7000);

    return () => clearInterval(interval);
  }, []);

  // Map Provider Google Switch Telemetry Simulation
  const handleToggleProvider = () => {
    if (mapProvider === "blueprint") {
      setIsGpsAcquiring(true);
      setGpsProgressText("ESTABLISHING ORBITAL DUPLEX LINK...");

      setTimeout(() => {
        setGpsProgressText("CALIBRATING CIVIC GIS BOUNDARIES...");
      }, 500);

      setTimeout(() => {
        setGpsProgressText("FETCHING VECTOR STREET TILES...");
      }, 1000);

      setTimeout(() => {
        setIsGpsAcquiring(false);
        setMapProvider("google");
      }, 1600);
    } else {
      setMapProvider("blueprint");
    }
  };

  // Satellite Scanning trigger on toggle
  useEffect(() => {
    if (mapMode === "satellite") {
      setIsSatelliteScanning(true);
      const timer = setTimeout(() => setIsSatelliteScanning(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [mapMode]);

  // Convert GPS coordinates to SVG pixel grid percentages (0 - 100%)
  const gpsToPercent = (lat: number, lng: number) => {
    const safeLat = typeof lat === "number" && !isNaN(lat) ? lat : 17.4050;
    const safeLng = typeof lng === "number" && !isNaN(lng) ? lng : 78.4850;
    const x = ((safeLng - MIN_LNG) / (MAX_LNG - MIN_LNG)) * 100;
    const y = (1.0 - ((safeLat - MIN_LAT) / (MAX_LAT - MIN_LAT))) * 100;
    return { x, y };
  };

  // Convert click coordinates to GPS
  const handleMapClick = (e: React.MouseEvent<SVGSVGElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    const pctX = clickX / rect.width;
    const pctY = clickY / rect.height;

    // Spawn micro-interaction click ripple
    const clickId = Date.now();
    setMapClicks(prev => [...prev, { x: pctX * 100, y: pctY * 100, id: clickId }]);
    setTimeout(() => {
      setMapClicks(prev => prev.filter(c => c.id !== clickId));
    }, 1000);

    const lng = MIN_LNG + pctX * (MAX_LNG - MIN_LNG);
    const lat = MAX_LAT - pctY * (MAX_LAT - MIN_LAT);

    // Approximate address based on nearest landmark
    let nearestLandmark = LANDMARKS[0];
    let minDist = 999999;
    LANDMARKS.forEach(lm => {
      const dist = Math.sqrt(Math.pow(lm.lat - lat, 2) + Math.pow(lm.lng - lng, 2));
      if (dist < minDist) {
        minDist = dist;
        nearestLandmark = lm;
      }
    });

    const meters = Math.round(minDist * 111000); // approx meters per degree
    const address = `${meters < 200 ? `Near ${nearestLandmark.name}, ` : ""}Street Sector ${Math.floor(pctX * 10 + 1)}, Ward Block ${Math.floor(pctY * 8 + 1)}`;
    onMapClick(lat, lng, address);
  };

  // Filter issues based on category
  const activeIssues = issues.filter(issue => {
    if (!issue || !issue.location) return false;
    if (filterCategory === "All") return true;
    return issue.category === filterCategory;
  });

  // Handle Landmark Search Selection
  const handleSearchSelect = (lm: typeof LANDMARKS[0]) => {
    setSearchVal(lm.name);
    const nearestIssue = activeIssues.find(i => {
      const dist = Math.sqrt(Math.pow(i.location.lat - lm.lat, 2) + Math.pow(i.location.lng - lm.lng, 2));
      return dist < 0.005;
    });
    if (nearestIssue) {
      onSelectIssue(nearestIssue.id);
    }
  };

  // Group closely spaced issues to represent Marker Clustering (Hackathon Highlight)
  const getClusteredMarkers = () => {
    if (!isClustered) return activeIssues.map(i => ({ type: "single" as const, issue: i }));

    const result: Array<{ type: "single"; issue: Issue } | { type: "cluster"; key: string; lat: number; lng: number; count: number; ids: string[]; severity: string }> = [];
    const visited = new Set<string>();

    activeIssues.forEach(issue => {
      if (visited.has(issue.id)) return;

      const clusterGroup = activeIssues.filter(other => {
        if (visited.has(other.id)) return false;
        const dist = Math.sqrt(Math.pow(issue.location.lat - other.location.lat, 2) + Math.pow(issue.location.lng - other.location.lng, 2));
        return dist < 0.009; // Cluster radius
      });

      if (clusterGroup.length > 1) {
        const avgLat = clusterGroup.reduce((sum, item) => sum + item.location.lat, 0) / clusterGroup.length;
        const avgLng = clusterGroup.reduce((sum, item) => sum + item.location.lng, 0) / clusterGroup.length;

        clusterGroup.forEach(item => visited.add(item.id));
        result.push({
          type: "cluster",
          key: `cluster-${issue.id}`,
          lat: avgLat,
          lng: avgLng,
          count: clusterGroup.length,
          ids: clusterGroup.map(item => item.id),
          severity: clusterGroup.some(item => item.severity === "Critical") ? "Critical" : "High"
        });
      } else {
        visited.add(issue.id);
        result.push({ type: "single", issue });
      }
    });

    return result;
  };

  const selectedIssue = activeIssues.find(i => i.id === selectedIssueId);

  return (
    <div className="relative w-full h-[640px] bg-app-card border border-app-border rounded-[24px] overflow-hidden shadow-2xl flex flex-col group/map select-none">

      {/* Map Status Badges */}
      <div className="absolute top-5 left-5 z-30 flex items-center gap-2 pointer-events-none">

        <div className="
    flex items-center gap-2
    px-3 py-2
    rounded-full
    border border-cyan-500/20
    bg-slate-950/75
    backdrop-blur-xl
    shadow-lg
  ">
          <div className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_10px_#34d399]" />

          <span className="text-[11px] font-semibold tracking-wide text-white">
            Live GIS
          </span>
        </div>

        {showHeatmap && (

          <div className="
      flex items-center gap-2
      px-3 py-2
      rounded-full
      border border-orange-400/20
      bg-orange-500/10
      backdrop-blur-xl
    ">

            <div className="h-2 w-2 rounded-full bg-orange-400 animate-pulse" />

            <span className="text-[11px] font-semibold text-orange-300">
              Heatmap
            </span>

          </div>

        )}

      </div>

      {/* Floating AI City Status HUD */}
      <div className="absolute left-5 top-[88px] z-30 hidden xl:block">

        <div className="
            w-56
            rounded-2xl
            border border-white/10
            bg-slate-950/75
            backdrop-blur-xl
            shadow-2xl
            shadow-black/40
            p-4
          ">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">

            <div>
              <div className="text-[10px] uppercase tracking-[0.25em] text-cyan-400 font-semibold">
                CITY HEALTH
              </div>

              <div className="text-[22px] font-bold text-white leading-none mt-1">
                92%
              </div>
            </div>

            <div className="
        h-11
        w-11
        rounded-xl
        bg-emerald-500/15
        flex
        items-center
        justify-center
      ">
              <Sparkles className="h-5 w-5 text-emerald-400" />
            </div>

          </div>

          {/* Progress */}
          <div className="mb-4">

            <div className="h-2 rounded-full bg-slate-800 overflow-hidden">

              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400"
                style={{ width: "92%" }}
              />

            </div>

          </div>

          {/* Stats */}

          <div className="space-y-3">

            <div className="flex justify-between items-center">

              <span className="text-slate-400 text-xs">
                Active
              </span>

              <span className="font-semibold text-white">
                {issues.filter(i => i.status !== "Resolved").length}
              </span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-slate-400 text-xs">
                AI Confidence
              </span>

              <span className="text-cyan-300 font-semibold">
                98.4%
              </span>

            </div>

            <div className="flex justify-between items-center">

              <span className="text-slate-400 text-xs">
                Risk
              </span>

              <span className="
          px-2
          py-1
          rounded-full
          text-[10px]
          font-semibold
          bg-emerald-500/15
          text-emerald-300
        ">
                LOW
              </span>

            </div>

          </div>

        </div>

      </div>

      {/* Top Right Map Actions Bar */}
      <div
        className="
          absolute
          top-5
          left-1/2
          -translate-x-1/2
          z-30

          flex
          items-center
          gap-2

          rounded-2xl
          border
          border-white/10

          bg-slate-950/70
          backdrop-blur-xl

          px-3
          py-2

          shadow-2xl
          shadow-black/40
          "
      >
        {/* Toggle Map Provider */}
        <button
          type="button"
          onClick={handleToggleProvider}
          className={`
    flex items-center gap-2
    px-4 py-2
    rounded-xl
    transition-all duration-300
    border
    ${mapProvider === "google"
              ? "bg-blue-500/15 border-blue-400/40 text-blue-300 shadow-lg shadow-blue-500/10"
              : "bg-transparent border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
            }
  `}
          title="Toggle Google Maps"
        >
          <Compass
            className={`h-4 w-4 transition-transform duration-300 ${mapProvider === "google"
              ? "rotate-12 text-blue-300"
              : ""
              }`}
          />

          <span className="text-xs font-medium">
            Vector
          </span>
        </button>

        {/* Satellite Mode Switch */}
        <button
          type="button"
          onClick={() =>
            setMapMode(prev =>
              prev === "standard"
                ? "satellite"
                : "standard"
            )
          }
          className={`
    flex items-center gap-2
    px-4 py-2
    rounded-xl
    transition-all duration-300
    border
    ${mapMode === "satellite"
              ? "bg-blue-500/15 border-blue-400/40 text-blue-300 shadow-lg shadow-blue-500/10"
              : "bg-transparent border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
            }
  `}
        >
          <Layers className="h-4 w-4" />

          <span className="text-xs font-medium">
            Satellite
          </span>
        </button>

        {/* Clustering Toggle */}
        <button
          type="button"
          onClick={() => setIsClustered(prev => !prev)}
          className={`
    flex items-center gap-2
    px-4 py-2
    rounded-xl
    transition-all duration-300
    border
    ${isClustered
              ? "bg-blue-500/15 border-blue-400/40 text-blue-300 shadow-lg shadow-blue-500/10"
              : "bg-transparent border-transparent text-slate-300 hover:bg-white/5 hover:text-white"
            }
  `}
        >
          <Locate className="h-4 w-4" />

          <span className="text-xs font-medium">
            Cluster
          </span>

          <div
            className={`w-2 h-2 rounded-full ${isClustered
              ? "bg-emerald-400 shadow-[0_0_8px_#34d399]"
              : "bg-slate-500"
              }`}
          />
        </button>

        {/* Search Landmarks */}
        <div className="relative">
          <div className="flex items-center rounded-xl bg-white/5 border border-white/10 px-3 py-2 w-56">
            <Search className="h-4 w-4 text-slate-400 mr-2" />

            <input
              type="text"
              placeholder="Search places..."
              value={searchVal}
              onChange={(e) => setSearchVal(e.target.value)}
              className="bg-transparent text-sm text-white placeholder:text-slate-500 outline-none w-full"
            />
          </div>

          {searchVal && (
            <div className="absolute mt-2 w-full rounded-xl bg-slate-900 border border-white/10 shadow-2xl overflow-hidden z-50">
              {LANDMARKS
                .filter(lm =>
                  lm.name.toLowerCase().includes(searchVal.toLowerCase())
                )
                .map(lm => (
                  <button
                    key={lm.id}
                    onClick={() => handleSearchSelect(lm)}
                    className="w-full px-4 py-3 text-left hover:bg-white/5 transition text-sm text-slate-200"
                  >
                    📍 {lm.name}
                  </button>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Primary Scaled Map Container */}
      <div className="relative flex-1 bg-slate-950 overflow-hidden cursor-crosshair">

        {/* GPS Acquisition Simulation Effect */}
        <AnimatePresence>
          {isGpsAcquiring && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-slate-950 flex flex-col items-center justify-center text-center p-6"
            >
              <div className="relative flex items-center justify-center mb-4">
                <Compass className="h-16 w-16 text-cyan-400 animate-spin-slow" />
                <div className="absolute inset-0 h-24 w-24 border-2 border-cyan-500/20 rounded-full animate-ping"></div>
              </div>
              <h4 className="text-sm font-mono font-extrabold text-cyan-400 tracking-widest uppercase mb-1.5 animate-pulse">
                {gpsProgressText}
              </h4>
              <p className="text-[10px] text-app-text-muted font-mono tracking-wide max-w-sm">
                Acquiring high-resolution Google Maps GIS satellite telemetry data from regional server clusters.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shimmer loading over Google Maps */}
        <div className="absolute inset-0 w-full h-full pointer-events-none opacity-0 group-[.loading]/map:opacity-100 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 animate-[shimmer_2s_infinite]"></div>

        {mapProvider === "google" ? (
          <div className="absolute inset-0 w-full h-full transition-opacity duration-500">
            <iframe
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer"
              src={`https://maps.google.com/maps?q=${selectedIssue?.location?.lat || 17.4050},${selectedIssue?.location?.lng || 78.4850}&t=${mapMode === "satellite" ? "k" : "m"}&z=16&ie=UTF8&iwloc=&output=embed`}
            />
          </div>
        ) : (
          <div className="relative w-full h-full">

            {/* SVG Canvas Map */}
            <svg
              width="100%"
              height="100%"
              onClick={handleMapClick}
              className="absolute inset-0 transition-all duration-700 ease-in-out"
            >
              <defs>
                {/* Heatmap glows */}
                <radialGradient id="grad-critical" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
                  <stop offset="50%" stopColor="#ef4444" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="grad-high" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#f97316" stopOpacity="0.75" />
                  <stop offset="60%" stopColor="#f97316" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#f97316" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="grad-medium" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#eab308" stopOpacity="0.7" />
                  <stop offset="60%" stopColor="#eab308" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#eab308" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="grad-low" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.6" />
                  <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                </radialGradient>
                <radialGradient id="grad-resolved" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.5" />
                  <stop offset="80%" stopColor="#10b981" stopOpacity="0.08" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
                </radialGradient>

                {/* Grid patterns */}
                <pattern id="grid" width="45" height="45" patternUnits="userSpaceOnUse">
                  <path d="M 45 0 L 0 0 0 45" fill="none" stroke={mapMode === "satellite" ? "#101e38" : "var(--app-map-grid)"} strokeWidth="1" />
                </pattern>
              </defs>

              {/* Map Base Canvas color */}
              <rect width="100%" height="100%" fill={mapMode === "satellite" ? "#030712" : "var(--app-map-bg)"} />

              {/* Grid lines overlay */}
              <rect width="100%" height="100%" fill="url(#grid)" />

              {/* Satellite mode features */}
              {mapMode === "satellite" && (
                <>
                  {/* Topographic Elevation Curves */}
                  {terrainActive && (
                    <>
                      <path d="M 0 120 Q 250 140 450 110 T 850 150 T 1250 120" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.15" />
                      <path d="M 0 220 Q 350 260 650 210 T 1050 270" fill="none" stroke="#10b981" strokeWidth="0.5" opacity="0.12" />
                      <path d="M 100 500 C 420 520, 720 420, 1120 540" fill="none" stroke="#059669" strokeWidth="1" opacity="0.15" strokeDasharray="3,6" />
                      <text x="5%" y="15%" className="fill-emerald-500/40 text-[9px] font-mono">ELEV: 508m</text>
                      <text x="45%" y="24%" className="fill-emerald-500/40 text-[9px] font-mono">ELEV: 514m</text>
                      <text x="80%" y="54%" className="fill-emerald-500/40 text-[9px] font-mono">ELEV: 522m</text>
                    </>
                  )}

                  {/* Satellite Simulated Forests / Park Areas */}
                  <rect x="5%" y="60%" width="22%" height="30%" rx="12" fill="#10b981" opacity="0.06" />

                  {/* Building Outlines */}
                  <rect x="35%" y="15%" width="12%" height="10%" rx="6" fill="#1e293b" opacity="0.4" stroke="#475569" strokeWidth="1" />
                  <rect x="52%" y="15%" width="15%" height="10%" rx="6" fill="#1e293b" opacity="0.4" stroke="#475569" strokeWidth="1" />
                  <rect x="75%" y="40%" width="15%" height="20%" rx="6" fill="#1e293b" opacity="0.4" stroke="#475569" strokeWidth="1" />

                  {/* Satellite Labels Overlay */}
                  {satelliteLabelsActive && (
                    <>
                      <text x="41%" y="20%" textAnchor="middle" className="fill-slate-400 text-[10px] font-bold font-sans">Municipal Telecommunications Hub</text>
                      <text x="59%" y="20%" textAnchor="middle" className="fill-slate-400 text-[10px] font-bold font-sans">Apollo Medical Emergency Block</text>
                      <text x="82%" y="50%" textAnchor="middle" className="fill-slate-400 text-[10px] font-bold font-sans">Central Commercial Depot</text>
                    </>
                  )}

                  {/* AI Object Detection bounding boxes overlay */}
                  {aiDetectionActive && (
                    <>
                      {/* Highlight Roads with blue boundary */}
                      <rect x="23.5%" y="0%" width="3%" height="100%" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                      <text x="22%" y="10%" className="fill-blue-400 text-[8px] font-mono font-bold">CLASS: ROAD (98%)</text>

                      <rect x="48%" y="0%" width="4%" height="100%" fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="3,3" opacity="0.8" />
                      <text x="47%" y="8%" className="fill-blue-400 text-[8px] font-mono font-bold">CLASS: HIGHWAY (99%)</text>

                      {/* Green zone boundary */}
                      <rect x="4.5%" y="59.5%" width="23%" height="31%" fill="none" stroke="#10b981" strokeWidth="2" opacity="0.7" />
                      <text x="6%" y="62%" className="fill-emerald-400 text-[9px] font-mono font-bold">[GREEN SPACE ZONE: 96% CONFIDENCE]</text>

                      {/* Structural detections */}
                      <rect x="34.5%" y="14.5%" width="13%" height="11%" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8" />
                      <text x="35%" y="13%" className="fill-amber-400 text-[8px] font-mono font-bold">STRUCTURE DETECTED (97%)</text>

                      <rect x="51.5%" y="14.5%" width="16%" height="11%" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.8" />
                      <text x="52%" y="13%" className="fill-amber-400 text-[8px] font-mono font-bold">STRUCTURE DETECTED (99%)</text>
                    </>
                  )}
                </>
              )}

              {/* Water Canal Canal */}
              <path d="M 0 450 Q 300 420 500 390 T 1000 430" fill="none" stroke="#1d4ed8" strokeWidth="10" opacity="0.25" />

              {/* Highway main lines representing high-tech street structures */}
              {ROADS.map(road => (
                <g key={road.id}
                  className="group/road cursor-pointer"
                  onMouseEnter={() => setHoveredItem({ name: road.name, info: "City Transit Corridors • Clean flow", type: "road" })}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <line
                    x1={road.orientation === "vertical" ? road.pos : "0%"}
                    y1={road.orientation === "vertical" ? "0%" : road.pos}
                    x2={road.orientation === "vertical" ? road.pos : "100%"}
                    y2={road.orientation === "vertical" ? "100%" : road.pos}
                    stroke={mapMode === "satellite" ? "#1e293b" : "var(--app-map-road)"}
                    strokeWidth={road.strokeWidth}
                    opacity="0.8"
                  />

                  {/* High-fidelity traffic congestion overlay */}
                  {trafficActive && (
                    <line
                      x1={road.orientation === "vertical" ? road.pos : "0%"}
                      y1={road.orientation === "vertical" ? "0%" : road.pos}
                      x2={road.orientation === "vertical" ? road.pos : "100%"}
                      y2={road.orientation === "vertical" ? "100%" : road.pos}
                      stroke={road.id === "road-2" ? "#ef4444" : road.id === "road-5" ? "#eab308" : "#10b981"}
                      strokeWidth={road.strokeWidth - 2}
                      opacity="0.75"
                      strokeDasharray="8, 12"
                      className="animate-[flow_7s_linear_infinite]"
                      style={{ strokeDashoffset: road.id === "road-2" ? 30 : -30 }}
                    />
                  )}
                </g>
              ))}

              {/* Animated Weather Overlay Data */}
              {weatherActive && (
                <>
                  {/* Subtle raindrops flow in CSS */}
                  <g opacity="0.3" stroke="#22d3ee" strokeWidth="0.8" strokeLinecap="round">
                    <line x1="10%" y1="10%" x2="9%" y2="15%" />
                    <line x1="30%" y1="15%" x2="29%" y2="20%" />
                    <line x1="50%" y1="12%" x2="49%" y2="17%" />
                    <line x1="70%" y1="8%" x2="69%" y2="13%" />
                    <line x1="90%" y1="18%" x2="89%" y2="23%" />
                    <line x1="20%" y1="40%" x2="19%" y2="45%" />
                    <line x1="45%" y1="42%" x2="44%" y2="47%" />
                    <line x1="80%" y1="38%" x2="79%" y2="43%" />
                  </g>
                  {/* Floating weather statistics on grid */}
                  <text x="8%" y="15%" className="fill-cyan-400/60 text-[10px] font-mono">Temp: 28°C</text>
                  <text x="8%" y="19%" className="fill-cyan-400/60 text-[10px] font-mono">Humid: 84%</text>
                  <text x="8%" y="23%" className="fill-cyan-400/60 text-[10px] font-mono">Precip: Heavy Rain</text>

                  <text x="78%" y="82%" className="fill-cyan-400/60 text-[10px] font-mono">Wind: 14km/h NE</text>
                </>
              )}

              {/* Emergency vehicle route overlay (Navigating from Hospital Block to nearest critical issue) */}
              {routeActive && selectedIssue && (
                (() => {
                  const pctHospital = gpsToPercent(17.3980, 78.4810); // Apollo Hospital
                  const pctIncident = gpsToPercent(selectedIssue.location.lat, selectedIssue.location.lng);
                  return (
                    <>
                      {/* Neon purple routing path */}
                      <path
                        d={`M ${pctHospital.x}% ${pctHospital.y}% 
                            L ${pctHospital.x}% ${pctIncident.y}% 
                            L ${pctIncident.x}% ${pctIncident.y}%`}
                        fill="none"
                        stroke="#a855f7"
                        strokeWidth="3.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeDasharray="6, 8"
                        className="animate-[flow_4s_linear_infinite] drop-shadow-[0_0_6px_rgba(168,85,247,0.8)]"
                      />

                      {/* Emergency Responder label */}
                      <text
                        x={`${(pctHospital.x + pctIncident.x) / 2}%`}
                        y={`${pctIncident.y - 3}%`}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-purple-300 font-extrabold bg-black"
                      >
                        ⚡ ACTIVE EMERGENCY DISPATCH ROUTE (1.2 km)
                      </text>
                    </>
                  );
                })()
              )}

              {/* Dynamic Impact Radius Circular Halo on Selected Issue */}
              {selectedIssue && selectedIssue.location && (
                (() => {
                  const pct = gpsToPercent(selectedIssue.location.lat, selectedIssue.location.lng);
                  return (
                    <>
                      {/* Outer impact zone halo representing 300-meter buffer */}
                      <circle
                        cx={`${pct.x}%`}
                        cy={`${pct.y}%`}
                        r="85"
                        fill="none"
                        stroke="#22d3ee"
                        strokeWidth="1.5"
                        strokeDasharray="4,4"
                        className="animate-[spin_40s_linear_infinite]"
                      />
                      {/* Dynamic Pulsing AI mesh */}
                      <circle
                        cx={`${pct.x}%`}
                        cy={`${pct.y}%`}
                        r="85"
                        fill="#06b6d4"
                        fillOpacity="0.04"
                        className="animate-pulse"
                      />
                      <text
                        x={`${pct.x}%`}
                        y={`${pct.y - 13.5}%`}
                        textAnchor="middle"
                        className="text-[9px] font-mono fill-cyan-400 font-semibold"
                      >
                        AI 300m Buffer Halo (Schools/Hospitals Inspected)
                      </text>
                    </>
                  );
                })()
              )}

              {/* Active HEATMAP Glows */}
              {showHeatmap && activeIssues.map((issue) => {
                if (!issue || !issue.location) return null;
                const pct = gpsToPercent(issue.location.lat, issue.location.lng);
                let gradientId = "grad-low";
                let size = 60;
                if (issue.status === "Resolved") {
                  gradientId = "grad-resolved";
                  size = 35;
                } else if (issue.severity === "Critical") {
                  gradientId = "grad-critical";
                  size = 115;
                } else if (issue.severity === "High") {
                  gradientId = "grad-high";
                  size = 90;
                } else if (issue.severity === "Medium") {
                  gradientId = "grad-medium";
                  size = 70;
                }

                return (
                  <circle
                    key={`heatmap-${issue.id}`}
                    cx={`${pct.x}%`}
                    cy={`${pct.y}%`}
                    r={size}
                    fill={`url(#${gradientId})`}
                    className="animate-pulse origin-center"
                    style={{ animationDuration: issue.severity === "Critical" ? "1.5s" : "3s" }}
                  />
                );
              })}

              {/* Micro-interaction map click ripples */}
              {mapClicks.map(click => (
                <g key={click.id}>
                  <circle
                    cx={`${click.x}%`}
                    cy={`${click.y}%`}
                    r="30"
                    fill="none"
                    stroke="#06b6d4"
                    strokeWidth="2"
                    className="animate-[ping_1s_ease-out_infinite]"
                  />
                  <circle
                    cx={`${click.x}%`}
                    cy={`${click.y}%`}
                    r="8"
                    fill="#06b6d4"
                    fillOpacity="0.3"
                  />
                </g>
              ))}

              {/* Live User Location Beacon with glowing blue pulse */}
              {(() => {
                const userPct = gpsToPercent(17.4050, 78.4850);
                return (
                  <g>
                    <circle
                      cx={`${userPct.x}%`}
                      cy={`${userPct.y}%`}
                      r="20"
                      fill="none"
                      stroke="#00ffff"
                      strokeWidth="1.5"
                      className="animate-ping"
                    />
                    <circle
                      cx={`${userPct.x}%`}
                      cy={`${userPct.y}%`}
                      r="7"
                      fill="#00ffff"
                      className="shadow-lg shadow-cyan-500/50"
                      onMouseEnter={() => setHoveredItem({ name: "Your GPS Beacon", info: "Calibrated location • Dual signal online", type: "user" })}
                      onMouseLeave={() => setHoveredItem(null)}
                    />
                    <circle
                      cx={`${userPct.x}%`}
                      cy={`${userPct.y}%`}
                      r="2"
                      fill="#ffffff"
                    />
                  </g>
                );
              })()}

              {/* Satellite scanning sweep lines */}
              {mapMode === "satellite" && isSatelliteScanning && (
                <line
                  x1="0%"
                  y1="0%"
                  x2="100%"
                  y2="0%"
                  stroke="#10b981"
                  strokeWidth="3"
                  className="animate-[scanSweep_2s_ease-in-out_infinite] drop-shadow-[0_0_10px_#10b981]"
                />
              )}
            </svg>

            {/* LANDMARKS OVERLAYS */}
            {LANDMARKS.map((lm) => {
              const pct = gpsToPercent(lm.lat, lm.lng);
              const IconComp = lm.icon;
              return (
                <div
                  key={lm.id}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center z-10 transition-all duration-200 hover:scale-110"
                  style={{
                    left: `${pct.x}%`,
                    top: `${pct.y}%`,
                  }}
                  onMouseEnter={() => setHoveredItem({ name: lm.name, info: `Landmark • Lat: ${lm.lat.toFixed(4)}, Lng: ${lm.lng.toFixed(4)}`, type: "landmark" })}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  <div className={`p-2 rounded-xl border shadow-lg flex items-center justify-center cursor-default ${lm.color}`}>
                    <IconComp className="h-4.5 w-4.5" />
                  </div>
                  <span className="mt-1 px-2 py-0.5 bg-slate-950/90 backdrop-blur-xs text-[9px] font-bold text-app-text rounded-md border border-app-border shadow whitespace-nowrap">
                    {lm.name}
                  </span>
                </div>
              );
            })}

            {/* FLOATING HOVER TOOLTIP CARD */}
            <AnimatePresence>
              {hoveredItem && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 5 }}
                  className="absolute bottom-16 right-4 z-40 p-3 bg-slate-950/95 backdrop-blur-md border border-cyan-500/30 rounded-xl shadow-2xl max-w-xs pointer-events-none"
                >
                  <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold text-cyan-400">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>HUD Telemetry focus</span>
                  </div>
                  <h4 className="text-xs font-bold text-app-text leading-tight">{hoveredItem.name}</h4>
                  <p className="text-[10px] text-app-text-muted mt-1 leading-snug">{hoveredItem.info}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* RENDER DYNAMIC PINS OR SIMULATED CLUSTERING GROUPS */}
            {getClusteredMarkers().map((marker) => {
              if (marker.type === "cluster") {
                const pct = gpsToPercent(marker.lat, marker.lng);
                const isClusterSelected = selectedIssue && marker.ids.includes(selectedIssue.id);

                return (
                  <motion.div
                    key={marker.key}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 15 }}
                    className="absolute -translate-x-1/2 -translate-y-1/2 z-20 cursor-pointer flex flex-col items-center"
                    style={{
                      left: `${pct.x}%`,
                      top: `${pct.y}%`,
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectIssue(marker.ids[0]); // Select first issue in cluster
                    }}
                    onMouseEnter={() => setHoveredItem({ name: `Incident Cluster (${marker.count} Cases)`, info: `Dynamic cluster localized at coordinates. Primary Severity: ${marker.severity}` })}
                    onMouseLeave={() => setHoveredItem(null)}
                  >
                    {/* Cluster Circle Glow */}
                    <span className="absolute flex h-10 w-10">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-30"></span>
                      <span className="relative inline-flex rounded-full h-10 w-10 bg-cyan-950 border-2 border-cyan-400/80 shadow-cyan-500/50 shadow-lg justify-center items-center text-xs font-bold text-cyan-400 font-mono">
                        {marker.count}
                      </span>
                    </span>

                    {/* Visual Label */}
                    {isClusterSelected && (
                      <div className="absolute top-7 bg-slate-950 text-cyan-400 text-[9px] font-mono py-0.5 px-2 rounded border border-cyan-800 whitespace-nowrap z-30">
                        Grouped Incident Node
                      </div>
                    )}
                  </motion.div>
                );
              }

              // Single marker rendering
              const issue = marker.issue;
              const pct = gpsToPercent(issue.location.lat, issue.location.lng);
              const isSelected = selectedIssueId === issue.id;

              let markerColor = "bg-blue-500 border-blue-400 shadow-blue-500/50";
              let textColor = "text-blue-400";
              let pingColor = "bg-blue-400";

              if (issue.status === "Resolved") {
                markerColor = "bg-emerald-500 border-emerald-400 shadow-emerald-500/50";
                textColor = "text-emerald-400";
                pingColor = "bg-emerald-400";
              } else if (issue.severity === "Critical") {
                markerColor = "bg-red-600 border-red-500 shadow-red-600/50";
                textColor = "text-red-400";
                pingColor = "bg-red-500";
              } else if (issue.severity === "High") {
                markerColor = "bg-orange-500 border-orange-400 shadow-orange-500/50";
                textColor = "text-orange-400";
                pingColor = "bg-orange-400";
              } else if (issue.severity === "Medium") {
                markerColor = "bg-yellow-500 border-yellow-400 shadow-yellow-500/50";
                textColor = "text-yellow-400";
                pingColor = "bg-yellow-400";
              }

              return (
                <motion.div
                  key={issue.id}
                  initial={{ opacity: 0, y: -25, scale: 0.6 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 260, damping: 20 }}
                  className="absolute z-20 cursor-pointer flex flex-col items-center"
                  style={{
                    left: `${pct.x}%`,
                    top: `${pct.y}%`,
                    transform: isSelected ? "scale(1.2) translate(-50%, -100%)" : "translate(-50%, -100%)",
                    transformOrigin: "bottom center"
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectIssue(issue.id);
                  }}
                  onMouseEnter={() => setHoveredItem({ name: issue.title, info: `${issue.category} • ${issue.severity} Severity • ${issue.status}` })}
                  onMouseLeave={() => setHoveredItem(null)}
                >
                  {/* Pulse circle for critical reports */}
                  {issue.status !== "Resolved" && (issue.severity === "Critical" || issue.severity === "High") && (
                    <span className="absolute -top-1 font-mono flex h-5 w-5 -translate-y-1/2">
                      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${pingColor} opacity-75`}></span>
                      <span className={`relative inline-flex rounded-full h-5 w-5 ${markerColor}`}></span>
                    </span>
                  )}

                  {/* Marker pin shape */}
                  <div className={`relative flex items-center justify-center w-8 h-8 rounded-full border-2 text-white shadow-xl transition-all duration-300 ${markerColor} ${isSelected ? "ring-4 ring-cyan-400 scale-110 z-30" : "hover:scale-115"
                    }`}>
                    <MapPin className="h-4.5 w-4.5" />
                  </div>

                  {/* Little triangle pointer */}
                  <div className={`w-2.5 h-2.5 -mt-1.5 rotate-45 border-r border-b ${issue.status === "Resolved" ? "bg-emerald-500 border-emerald-400" :
                    issue.severity === "Critical" ? "bg-red-600 border-red-500" :
                      issue.severity === "High" ? "bg-orange-500 border-orange-400" :
                        issue.severity === "Medium" ? "bg-yellow-500 border-yellow-400" :
                          "bg-blue-500 border-blue-400"
                    }`} />

                  {/* Label displayed on selection */}
                  {isSelected && (
                    <div className="absolute top-9 bg-slate-950 text-app-text text-[10px] py-1 px-2.5 rounded-md border border-cyan-500/30 font-sans font-bold shadow-xl whitespace-nowrap z-50 flex items-center gap-1.5">
                      <span className={`h-1.5 w-1.5 rounded-full ${issue.status === "Resolved" ? "bg-emerald-400" : "bg-cyan-400 animate-ping"}`}></span>
                      {issue.title.length > 25 ? `${issue.title.slice(0, 23)}...` : issue.title}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Satellite Controls & Live Feeds Tray */}
      {mapMode === "satellite" && mapProvider === "blueprint" && (
        <div className="px-4 py-2 bg-slate-900/90 border-t border-app-border/40 flex flex-wrap items-center gap-4 z-10">
          <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase tracking-wider">Satellite Analytics:</span>

          <label className="flex items-center gap-1.5 text-[10px] font-mono text-app-text font-bold cursor-pointer hover:text-emerald-400">
            <input
              type="checkbox"
              checked={aiDetectionActive}
              onChange={() => setAiDetectionActive(!aiDetectionActive)}
              className="accent-emerald-500"
            />
            AI Object Detect Overlay
          </label>

          <label className="flex items-center gap-1.5 text-[10px] font-mono text-app-text font-bold cursor-pointer hover:text-emerald-400">
            <input
              type="checkbox"
              checked={satelliteLabelsActive}
              onChange={() => setSatelliteLabelsActive(!satelliteLabelsActive)}
              className="accent-emerald-500"
            />
            Building Labels
          </label>

          <label className="flex items-center gap-1.5 text-[10px] font-mono text-app-text font-bold cursor-pointer hover:text-emerald-400">
            <input
              type="checkbox"
              checked={terrainActive}
              onChange={() => setTerrainActive(!terrainActive)}
              className="accent-emerald-500"
            />
            Topography Terrain
          </label>
        </div>
      )}

      {/* Bottom Layer Controls */}
      <div className="border-t border-white/10 bg-slate-950/75 backdrop-blur-xl px-5 py-3">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="text-[11px] uppercase tracking-[0.25em] text-slate-500 font-semibold mr-2">
              Layers
            </span>
            <button
              type="button"
              onClick={() => setTrafficActive(!trafficActive)}
              className={`rounded-full px-3 py-1.5 text-xs transition-all ${trafficActive
                  ? "bg-blue-500/15 text-blue-300"
                  : "text-slate-400 hover:bg-white/5"
                }`}
            >
              🚦 Traffic
            </button>
            <button
              type="button"
              onClick={() => setWeatherActive(!weatherActive)}
              className={`rounded-full px-3 py-1.5 text-xs transition-all ${weatherActive
                  ? "bg-blue-500/15 text-blue-300"
                  : "text-slate-400 hover:bg-white/5"
                }`}
            >
              🌦 Weather
            </button>
            <button
              type="button"
              onClick={() => setRouteActive(!routeActive)}
              className={`rounded-full px-3 py-1.5 text-xs transition-all ${routeActive
                  ? "bg-blue-500/15 text-blue-300"
                  : "text-slate-400 hover:bg-white/5"
                }`}
            >
              🚑 Routes
            </button>
          </div>
          <div className="flex items-center gap-3 min-w-0 flex-1 justify-end">
            <span className="rounded-full bg-emerald-500/15 px-2 py-1 text-[10px] text-emerald-300 font-semibold whitespace-nowrap">
              ● LIVE
            </span>
            <AnimatePresence mode="wait">
              <motion.span
                key={liveNotifications[0]?.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.25 }}
                className="truncate text-xs text-slate-300"
              >
                {liveNotifications[0]?.text}
              </motion.span>
            </AnimatePresence>
          </div>
        </div>
      </div>



      {/* Map Legend & Status Bar */ }
      <div className="p-4 bg-app-card border-t border-app-border/80 flex flex-wrap gap-y-3 justify-between items-center z-10">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5">
          <span className="text-xs text-app-text-muted font-bold uppercase tracking-wider text-[11px]">Map Legend:</span>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-600 border border-red-400 inline-block shadow shadow-red-600/40"></span>
            <span className="text-[11px] text-app-text font-mono font-bold">Critical</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-orange-500 border border-orange-400 inline-block shadow shadow-orange-500/40"></span>
            <span className="text-[11px] text-app-text font-mono font-bold">High</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-yellow-500 border border-yellow-400 inline-block shadow shadow-yellow-500/40"></span>
            <span className="text-[11px] text-app-text font-mono font-bold">Medium</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3 w-3 rounded-full bg-blue-500 border border-blue-400 inline-block"></span>
            <span className="text-[11px] text-app-text font-mono font-bold">Low</span>
          </div>
          <div className="flex items-center gap-1.5 border-l border-app-border/40 pl-4">
            <span className="h-3 w-3 rounded-full bg-emerald-500 border border-emerald-400 inline-block"></span>
            <span className="text-[11px] text-emerald-400 font-mono font-extrabold">Resolved</span>
          </div>
        </div>

        {/* Hover / Cursor telemetry info box */}
        <div className="min-h-[24px] text-right">
          {hoveredItem ? (
            <div className="text-xs font-mono text-cyan-400 transition-all duration-200 flex items-center gap-1 font-bold">
              <Info className="h-3.5 w-3.5 text-cyan-400" />
              <span className="text-app-text-muted">Focus:</span> {hoveredItem.name}
              <span className="text-app-text-muted/80 ml-2">({hoveredItem.info})</span>
            </div>
          ) : (
            <div className="text-xs font-mono text-app-text-muted font-semibold">
              Click anywhere to place report coordinates • Telemetry aligned
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes flow {
          to {
            stroke-dashoffset: -100;
          }
        }
        @keyframes scanSweep {
          0% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(480px);
          }
          100% {
            transform: translateY(0);
          }
        }
      `}</style>
    </div >
  );
}
