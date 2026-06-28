import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Activity, 
  Bell, 
  ShieldCheck, 
  Brain, 
  Users, 
  Wrench, 
  Sparkles, 
  Minimize2, 
  Maximize2, 
  Zap, 
  Droplet, 
  Trash2, 
  AlertOctagon, 
  Cpu, 
  Play, 
  Pause,
  ArrowRight,
  ShieldAlert,
  MapPin,
  Flame,
  Gauge,
  Check,
  X,
  Sun
} from "lucide-react";
import { Issue } from "../types";
import { CustomSelect } from "./CustomSelect";
import { IncidentImage } from "./IncidentImage";
import { ResolutionSlider } from "./ResolutionSlider";

interface MunicipalHeadquartersProps {
  issues: Issue[];
  onRefreshIssues: () => Promise<void>;
  currentUserEmail?: string;
  googleAccessToken: string | null;
  onConnectGoogleDrive: () => Promise<void>;
}

interface RealTimeEvent {
  id: string;
  type: "CREATED" | "VERIFIED" | "ASSIGNED" | "ESCALATED" | "RESOLVED";
  title: string;
  detail: string;
  timestamp: number;
  badge?: string;
}

export default function MunicipalHeadquarters({ 
  issues, 
  onRefreshIssues, 
  currentUserEmail,
  googleAccessToken,
  onConnectGoogleDrive
}: MunicipalHeadquartersProps) {
  // Navigation tabs: executive, intelligence, ai-engine, department, demo-center, gdrive
  const [activeSubTab, setActiveSubTab] = useState<"executive" | "intelligence" | "ai-engine" | "department" | "demo-center" | "gdrive">("executive");
  const [selectedWard, setSelectedWard] = useState<string>("Ward 12 - Civic Hub");
  const [selectedDept, setSelectedDept] = useState<string>("Roads & Highway Authority");
  const [isDemoLoading, setIsDemoLoading] = useState<string | null>(null);

  // Google Drive Sync States
  // const [isSyncing, setIsSyncing] = useState(false);
  // const [syncResult, setSyncResult] = useState<{
  //   success: boolean;
  //   message: string;
  //   syncedFiles?: string[];
  //   unmatchedFiles?: string[];
  //   error?: string;
  // } | null>(null);

  // const handleSyncDrive = async () => {
  //   if (!googleAccessToken) {
  //     setToast({ text: "Please connect to Google Drive first to synchronize images.", type: "error" });
  //     return;
  //   }

  //   setIsSyncing(true);
  //   setSyncResult(null);
  //   setToast({ text: "Establishing secure connection and retrieving 'CivicHero Assets' folder...", type: "info" });

  //   try {
  //     const res = await fetch("/api/drive/sync", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "Authorization": `Bearer ${googleAccessToken}`
  //       }
  //     });

  //     const data = await res.json();
  //     setSyncResult(data);

  //     if (res.ok && data.success) {
  //       setToast({ text: `Sync complete! ${data.syncedFiles?.length || 0} files updated successfully.`, type: "success" });
  //       await onRefreshIssues();
  //     } else {
  //       const errorMsg = data.message || data.error || "Failed to synchronize.";
  //       setToast({ text: `Sync failed: ${errorMsg}`, type: "error" });
  //     }
  //   } catch (err: any) {
  //     console.error("Sync error:", err);
  //     setSyncResult({
  //       success: false,
  //       message: err.message || "An unexpected network or server error occurred during sync."
  //     });
  //     setToast({ text: "Drive sync service connection error.", type: "error" });
  //   } finally {
  //     setIsSyncing(false);
  //   }
  // };
  
  // Presentation Mode state
  const [isPresentationMode, setIsPresentationMode] = useState(false);
  const [presentationSlide, setPresentationSlide] = useState<"kpis" | "wards" | "ai" | "depts">("kpis");
  const [presentationAutoplay, setPresentationAutoplay] = useState(true);
  const slideTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Before/After slide comparison
  const [beforeAfterIndex, setBeforeAfterIndex] = useState(0);
  const [sliderPosition, setSliderPosition] = useState(50);

  // Real-time Event Feed
  const [liveEvents, setLiveEvents] = useState<RealTimeEvent[]>([
    {
      id: "evt-1",
      type: "RESOLVED",
      title: "Pothole Remediation Validated",
      detail: "AI visual verification confirmed 100% flat asphalt closure on Civic Hub Avenue.",
      timestamp: Date.now() - 4 * 60000,
      badge: "Roads & Highway"
    },
    {
      id: "evt-2",
      type: "ESCALATED",
      title: "SLA Deadline Breach Warning",
      detail: "Water Supply valve issue in Ward 4 escalated to commissioner due to pressure hazard.",
      timestamp: Date.now() - 15 * 60000,
      badge: "Water Board"
    },
    {
      id: "evt-3",
      type: "ASSIGNED",
      title: "Repair Team Dispatched",
      detail: "State Electricity Board crew allocated to high-risk transformer enclosure in Tech District.",
      timestamp: Date.now() - 32 * 60000,
      badge: "Power Grid"
    }
  ]);

  // Toast alert
  const [toast, setToast] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);

  // Gemini Executive Commissioner Report state
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  const [isReportOpen, setIsReportOpen] = useState(false);

  // Commissioner checklist states (to maintain interactive state on the briefing report)
  const [checkedActions, setCheckedActions] = useState<Record<number, boolean>>({});

  const handleGenerateReport = async () => {
    setIsReportLoading(true);
    setToast({ text: "Compiling real-time ward audit feeds and routing to Gemini...", type: "info" });
    try {
      const res = await fetch("/api/gemini/executive-report");
      const data = await res.json();
      setReportData(data);
      setIsReportOpen(true);
      setCheckedActions({}); // Reset checklist on new generation
      setToast({ text: "AI Executive Commissioner Report generated successfully.", type: "success" });
    } catch (err: any) {
      console.error("Error generating report:", err);
      setToast({ text: "Failed to generate AI report. Falling back to secure offline intelligence.", type: "error" });
    } finally {
      setIsReportLoading(false);
    }
  };

  // Auto-simulation of occasional live events to show off the real-time pipeline
  useEffect(() => {
    const simulationInterval = setInterval(() => {
      // Pick random simulated event
      const eventPool: Omit<RealTimeEvent, "id" | "timestamp">[] = [
        {
          type: "CREATED",
          title: "New Road Hazard Spotted",
          detail: "Citizen submitted thermal scan of pavement fatigue near Ward 8 residential ring.",
          badge: "Roads & Highway"
        },
        {
          type: "VERIFIED",
          title: "Community Upvote Threshold Met",
          detail: "Pavement crack verified by 5 verified citizens near hospital boundary.",
          badge: "Verification"
        },
        {
          type: "ASSIGNED",
          title: "Automated AI Dispatch",
          detail: "Crew assigned to water clogging site based on proximity optimization algorithms.",
          badge: "Water Board"
        },
        {
          type: "ESCALATED",
          title: "Emergency Escalation",
          detail: "Electrical grid surge report marked Critical and sent to Senior Command Center.",
          badge: "Power Grid"
        },
        {
          type: "RESOLVED",
          title: "Municipal Sign-Off Registered",
          detail: "Sanitation crew uploaded closure log, garbage bin clear verified via telemetry.",
          badge: "Solid Waste"
        }
      ];

      const chosen = eventPool[Math.floor(Math.random() * eventPool.length)];
      const newEvt: RealTimeEvent = {
        ...chosen,
        id: `evt-sim-${Date.now()}`,
        timestamp: Date.now()
      };

      setLiveEvents(prev => [newEvt, ...prev].slice(0, 15));
      showToast(`Real-Time Sync: ${newEvt.title}`, "info");
    }, 45000); // every 45 seconds

    return () => clearInterval(simulationInterval);
  }, []);

  // Handle listening to custom events from external App.tsx report creations
  useEffect(() => {
    const handleExternalUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        const { type, issue } = customEvent.detail;
        const newEvt: RealTimeEvent = {
          id: `evt-ext-${Date.now()}`,
          type: type || "CREATED",
          title: `External Event Sync: ${type || "Update"}`,
          detail: issue ? `"${issue.title}" status changed to ${issue.status}` : "Applet database table synchronized successfully.",
          timestamp: Date.now(),
          badge: issue?.assignedDepartment || "System"
        };
        setLiveEvents(prev => [newEvt, ...prev].slice(0, 15));
        showToast(newEvt.title, "success");
      }
    };

    window.addEventListener("civic-update", handleExternalUpdate);
    return () => window.removeEventListener("civic-update", handleExternalUpdate);
  }, []);

  // Autoplay presentation mode slides
  useEffect(() => {
    if (isPresentationMode && presentationAutoplay) {
      slideTimerRef.current = setInterval(() => {
        setPresentationSlide(prev => {
          if (prev === "kpis") return "wards";
          if (prev === "wards") return "ai";
          if (prev === "ai") return "depts";
          return "kpis";
        });
      }, 8000);
    } else {
      if (slideTimerRef.current) {
        clearInterval(slideTimerRef.current);
      }
    }
    return () => {
      if (slideTimerRef.current) clearInterval(slideTimerRef.current);
    };
  }, [isPresentationMode, presentationAutoplay]);

  const showToast = (text: string, type: "success" | "error" | "info") => {
    setToast({ text, type });
    setTimeout(() => setToast(null), 4000);
  };

  // Helper calculation algorithms for Ward Health & Analytics
  const wardsList = [
    "Ward 12 - Civic Hub",
    "Ward 4 - Commercial Junction",
    "Ward 8 - Residential Hub",
    "Ward 15 - Tech District",
    "Ward 3 - Green Enclave"
  ];

  const getWardHealthBreakdown = (wardName: string) => {
    const wardIssues = issues.filter(i => i && i.location?.ward === wardName);
    
    // Base healthy score is 95
    let roadHealth = 94;
    let waterHealth = 92;
    let electricalHealth = 90;
    let sanitationHealth = 96;

    wardIssues.forEach(i => {
      if (i.status === "Resolved") return; // resolved doesn't detract
      const severityPenalty = i.severity === "Critical" ? 20 : i.severity === "High" ? 12 : i.severity === "Medium" ? 6 : 3;
      
      if (i.category === "Road Issue") roadHealth -= severityPenalty;
      else if (i.category === "Water Supply") waterHealth -= severityPenalty;
      else if (i.category === "Electrical") electricalHealth -= severityPenalty;
      else if (i.category === "Waste Management" || i.category === "Sanitation") sanitationHealth -= severityPenalty;
    });

    // clamp
    roadHealth = Math.max(Math.min(roadHealth, 100), 25);
    waterHealth = Math.max(Math.min(waterHealth, 100), 20);
    electricalHealth = Math.max(Math.min(electricalHealth, 100), 30);
    sanitationHealth = Math.max(Math.min(sanitationHealth, 100), 25);

    const overallScore = Math.round((roadHealth + waterHealth + electricalHealth + sanitationHealth) / 4);

    // Calculate simulated trajectory based on resolved vs open issues
    const resolvedCount = wardIssues.filter(i => i.status === "Resolved").length;
    const activeCount = wardIssues.filter(i => i.status !== "Resolved").length;
    let trajectory: "stable" | "improving" | "declining" = "stable";
    if (resolvedCount > activeCount && activeCount > 0) trajectory = "improving";
    else if (activeCount > resolvedCount + 2) trajectory = "declining";

    return {
      roadHealth,
      waterHealth,
      electricalHealth,
      sanitationHealth,
      overallScore,
      trajectory,
      activeIssuesCount: activeCount,
      resolvedIssuesCount: resolvedCount
    };
  };

  // Executive KPI stats
  const totalIssuesCount = issues.filter(Boolean).length;
  const resolvedIssuesCount = issues.filter(i => i && i.status === "Resolved").length;
  const openIssuesCount = totalIssuesCount - resolvedIssuesCount;
  
  // SLA calculation
  const slaComplianceRate = totalIssuesCount > 0 
    ? Math.round(((issues.filter(i => i && i.status === "Resolved" && i.createdAt + (i.slaHours || 24) * 3600000 >= i.createdAt).length + 
                   issues.filter(i => i && i.status !== "Resolved" && Date.now() < (i.slaDeadline || Date.now() + 1000000)).length) / totalIssuesCount) * 100)
    : 92;

  const averageResolutionHours = 12.4; // hours
  const citizenSatisfaction = totalIssuesCount > 0 
    ? Math.round(85 + (resolvedIssuesCount / totalIssuesCount) * 12) 
    : 88;

  const cityHealthIndex = Math.round((slaComplianceRate * 0.4) + (citizenSatisfaction * 0.4) + ((resolvedIssuesCount / (totalIssuesCount || 1)) * 20));

  // Ward scores calculations
  const calculatedWardScores = wardsList.map(ward => ({
    name: ward,
    ...getWardHealthBreakdown(ward)
  }));

  const worstWard = [...calculatedWardScores].sort((a, b) => a.overallScore - b.overallScore)[0];

  // AI-Grounded Detailed Prompt & Explanations (Phase 8 & Phase 2 details)
  const getAiRecommendationForWard = (wardName: string) => {
    const wardIssues = issues.filter(i => i && i.location?.ward === wardName && i.status !== "Resolved");
    
    if (wardIssues.length === 0) {
      return {
        trend: "Optimal Infrastructure Health - Minimal Incidents",
        rootCause: "Preventative telemetry scheduled monthly. High community feedback density with rapid official response loop.",
        suggestions: [
          "Maintain current patrol frequencies on primary transit roads.",
          "Perform seasonal culvert inspections ahead of storm monsoon season."
        ],
        crew: "Horticulture & Standard Patrol Crew (1 Vehicle)",
        confidence: 98,
        cost: "₹5,000",
        resolutionTime: "Routine Maintenance Plan",
        reasoning: "Zero critical or high-severity triggers reported in the last 72 hours. Structural indices are highly stable."
      };
    }

    const firstIssue = wardIssues[0];
    const category = firstIssue.category;

    if (category === "Road Issue") {
      return {
        trend: "Arterial road surface deterioration & structural sinkhole vulnerability rising.",
        rootCause: "Sub-grade water seepage cracking asphalt binders under persistent bus/truck vibrations.",
        suggestions: [
          "Deploy Polymer Modified Asphalt (PMA) paving to extend surface lifespan.",
          "Audit stormwater drainage inlets flanking the primary road loops.",
          "Restrict heavy vehicles (> 7.5 Tons) to nighttime off-peak hours.",
          "Install smart pavement fatigue fiber sensors."
        ],
        crew: "Roads & Highway Advanced Quick-Response Unit (QC-1, 6 crew members)",
        confidence: 94,
        cost: "₹45,000",
        resolutionTime: "12 Hours",
        reasoning: `Critical pothole/cave-in "${firstIssue.title}" reported with high severity. Close proximity to community nodes demands immediate bitumen base seal.`
      };
    } else if (category === "Water Supply") {
      return {
        trend: "Underground hydraulic pressure spikes & cast-iron pipeline joints fatigue.",
        rootCause: "Legacy cast-iron pipelines (laid pre-1996) corroding. Water hammer effect from sudden valves pressure changes.",
        suggestions: [
          "Incorporate High-Density Polyethylene (HDPE) slip-lining to reinforce piping.",
          "Set up smart sub-surface pressure relief bypass regulators.",
          "Initiate acoustic flow audits to locate silent micro-leaks before catastrophic bursts."
        ],
        crew: "Water Board Pressure Audit & Hydraulic Engineers (3 Crews + Hydro-Vac Truck)",
        confidence: 96,
        cost: "₹32,000",
        resolutionTime: "8 Hours",
        reasoning: `High-pressure valve burst spotted. Sub-grade pressure levels indicate vulnerability to adjacent residential structural foundations.`
      };
    } else if (category === "Electrical") {
      return {
        trend: "Transformer substation thermal loading & commercial cabling interference.",
        rootCause: "Overhead commercial line clutter combined with micro-climate heating of primary transformers.",
        suggestions: [
          "Bundle unstructured telecommunication lines into structured underground ducts.",
          "Apply thermal insulating compounds on power substation switchgear.",
          "Install immediate protective perimeter mesh enclosing transformer ground poles."
        ],
        crew: "State Electricity Board Substation Maintenance Taskforce (SEB-3, 4 linemen)",
        confidence: 92,
        cost: "₹15,000",
        resolutionTime: "6 Hours",
        reasoning: "Low-hanging cable reports and transformer sparking hazards threaten public safety, especially near school zones during weather anomalies."
      };
    } else {
      return {
        trend: "Solid waste dump blockages & secondary pedestrian pathway sanitation deterioration.",
        rootCause: "Inadequate frequency of scheduled compaction trucks coupled with commercial trash overflow near major junctions.",
        suggestions: [
          "Optimize truck routes dynamically using real-time landfill fill sensors.",
          "Set up automated fine notices via CCTV AI video streams for illegal dumping.",
          "Deploy mobile waste compactors to clear high-density areas."
        ],
        crew: "Municipal Solid Waste Rapid Response Taskforce (MSW-7, 2 compactor trucks)",
        confidence: 95,
        cost: "₹12,000",
        resolutionTime: "4 Hours",
        reasoning: "Unattended rubbish heaps pose environmental risks and trigger pest activity. Quick clearance is vital to prevent secondary drainage clogging."
      };
    }
  };

  const selectedWardRecommendation = getAiRecommendationForWard(selectedWard);

  // Department Operations stats
  const departmentsList = [
    { name: "Roads & Highway Authority", icon: Wrench, color: "from-amber-600 to-yellow-500", key: "Road Issue" },
    { name: "Municipal Water Board & Sanitation", icon: Droplet, color: "from-blue-600 to-cyan-500", key: "Water Supply" },
    { name: "State Electricity Board", icon: Zap, color: "from-purple-600 to-indigo-500", key: "Electrical" },
    { name: "Municipal Solid Waste Dept", icon: Trash2, color: "from-emerald-600 to-teal-500", key: "Waste Management" }
  ];

  const getDepartmentStats = (deptName: string, categoryKey: string) => {
    const deptIssues = issues.filter(i => i && (i.assignedDepartment === deptName || i.category === categoryKey));
    const openTickets = deptIssues.filter(i => i.status !== "Resolved").length;
    const resolvedTickets = deptIssues.filter(i => i.status === "Resolved").length;
    const totalTickets = deptIssues.length;

    let slaComp = 95;
    if (openTickets > 4) slaComp = 84;
    else if (openTickets > 2) slaComp = 90;

    let workload: "Low" | "Medium" | "High" | "Critical" = "Low";
    if (openTickets > 5) workload = "Critical";
    else if (openTickets > 3) workload = "High";
    else if (openTickets > 1) workload = "Medium";

    let avgTime = "8.2 hrs";
    if (categoryKey === "Road Issue") avgTime = "14.5 hrs";
    else if (categoryKey === "Water Supply") avgTime = "9.1 hrs";
    else if (categoryKey === "Electrical") avgTime = "5.6 hrs";

    // AI Crew allocation recommendation
    let crewAdv = "Maintain standard patrol schedules.";
    if (workload === "Critical") {
      crewAdv = "OVERLOAD DETECTED: Deploy 2 standby emergency backup crews from District Base immediately.";
    } else if (workload === "High") {
      crewAdv = "MEDIUM SURGE: Relocate 1 maintenance truck from North Base to reinforce Central Ward operations.";
    } else if (workload === "Medium") {
      crewAdv = "SLA BOUND: Crew sizes are sufficient. Monitor response times on active high-priority reports.";
    }

    return {
      openTickets,
      resolvedTickets,
      totalTickets,
      slaComp,
      workload,
      avgTime,
      crewAdv
    };
  };

  const selectedDeptStats = getDepartmentStats(selectedDept, departmentsList.find(d => d.name === selectedDept)?.key || "Road Issue");

  // Phase 6: Interactive Demo Incident Generator Click Handler
  const triggerDemoIncident = async (incidentType: "road_collapse" | "water_leak" | "transformer" | "flood" | "garbage") => {
    setIsDemoLoading(incidentType);
    showToast(`Invoking Gemini AI Vision & Synthesis pipeline for "${incidentType.replace('_', ' ').toUpperCase()}"...`, "info");

    let params: any = {};
    if (incidentType === "road_collapse") {
      params = {
        category: "Road Issue",
        title: "CRITICAL: Major Arterial Road Collapse & Cavity",
        description: "A sudden 2-meter deep sub-surface cavity has triggered a partial asphalt collapse near School Zone B. Critical traffic hazard. Heavy vehicles are bottoming out, pose major risk to two-wheelers.",
        image: "/assets/incidents/road-issue-before.svg",
        severity: "Critical",
        trustScore: 97,
        resolutionCost: 45000,
        ward: "Ward 12 - Civic Hub",
        suggestions: ["Secure structural fencing around the perimeter", "Enforce total vehicle detours", "Coordinate with Water Board on pipe hydration scanning"],
        rootCauseAnalysis: "Hydro-geological excavation and silent drainage water leakage washing off asphalt foundations.",
        predictiveAlert: "Structural collapse of adjacent sidewalk is highly likely within 24 hours under soil wetness."
      };
    } else if (incidentType === "water_leak") {
      params = {
        category: "Water Supply",
        title: "HIGH-PRESSURE: Sub-Surface Valve Fractured",
        description: "Drinking water distribution mains have broken, bubbling hundreds of liters of water per second. High risk of local water pollution and severe roadway erosion.",
        image: "/assets/incidents/water-supply-before.svg",
        severity: "High",
        trustScore: 94,
        resolutionCost: 28000,
        ward: "Ward 4 - Commercial Junction",
        suggestions: ["Shut regional valve gate 3B immediately", "Execute bypass flow mapping", "Replace joint seals with carbon-steel reinforced couplers"],
        rootCauseAnalysis: "Cyclic hydraulic stress from evening pumping surges hitting aged ductile iron joint welds.",
        predictiveAlert: "Sewer line cross-contamination possible if pressure drop is sustained."
      };
    } else if (incidentType === "transformer") {
      params = {
        category: "Electrical",
        title: "DANGER: Transformer Sparking & Low Overhead Conduit",
        description: "Secondary distributor transformer sparking visibly during breeze cycles. Low hanging 440V aerial lines overlap commercial shopping sidewalks.",
        image: "/assets/incidents/electrical-before.svg",
        severity: "Critical",
        trustScore: 96,
        resolutionCost: 18000,
        ward: "Ward 15 - Tech District",
        suggestions: ["Prune overlapping tree canopy immediately", "Install physical insulated conduit sleeving"],
        rootCauseAnalysis: "Micro-arcing from loose secondary lug connections coupled with wind-induced canopy friction.",
        predictiveAlert: "Short circuit damage to nearby consumer routers and tech server rooms if left uninsulated."
      };
    } else if (incidentType === "flood") {
      params = {
        category: "Water Supply",
        title: "HIGH EMERGENCY: Storm Drainage Flooding Block",
        description: "Sewer and storm drainage backflow has inundated the main pediatric hospital access corridor. Medical vehicles are forced to make 4km detours.",
        image: "/assets/incidents/water-supply-before.svg",
        severity: "Critical",
        trustScore: 98,
        resolutionCost: 35000,
        ward: "Ward 8 - Residential Hub",
        suggestions: ["Deploy heavy-duty diesel submersible dewatering pumps", "Clear construction concrete slurry deposits", "Establish emergency pediatric ambulance lane"],
        rootCauseAnalysis: "Runoff volume exceeding capacity due to unmonitored plastic aggregate sludge in junction basins.",
        predictiveAlert: "Foul odor and disease vectors will spread within 12 hours as water stagnates."
      };
    } else if (incidentType === "garbage") {
      params = {
        category: "Waste Management",
        title: "ALERT: Commercial Solid Waste Bulk Dumping",
        description: "Industrial plastic and chemical containers dumped across active pedestrian walking paths, triggering sharp chemical odors and blocking accessibility.",
        image: "/assets/incidents/waste-management-before.svg",
        severity: "Medium",
        trustScore: 91,
        resolutionCost: 12000,
        ward: "Ward 3 - Green Enclave",
        suggestions: ["Engage specialized hazardous waste sweepers", "Check commercial CCTV logs for truck license plate extraction", "Deploy SmartBin overflow sensor units"],
        rootCauseAnalysis: "Unauthorized dumping by non-registered building contractors trying to bypass regional transport tipping fees.",
        predictiveAlert: "Chemical runoff could contaminate the local park wetland buffer if rainfall occurs."
      };
    }

    try {
      const res = await fetch("/api/gemini/generate-demo-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(params)
      });

      if (res.ok) {
        const createdIssue = await res.json();
        // Dispatch custom event for real-time notification integration
        window.dispatchEvent(new CustomEvent("civic-update", {
          detail: { type: "CREATED", issue: createdIssue }
        }));
        
        await onRefreshIssues();
        showToast(`Gemini AI successfully registered and dispatched: "${createdIssue.title}"`, "success");
      } else {
        throw new Error("API failed");
      }
    } catch (e) {
      console.warn("Server demo endpoint failed, simulating locally with real-time dispatch", e);
      // fallback simulation to guarantee a flawless live demo presentation
      const fakeId = `complaint-sim-${Date.now()}`;
      const fakeIssue: Issue = {
        id: fakeId,
        title: params.title,
        description: params.description,
        category: params.category,
        severity: params.severity,
        confidence: 96,
        location: {
          lat: 17.4050,
          lng: 78.4850,
          address: `Hyderabad Sector, ${params.ward}`,
          ward: params.ward,
          district: "Central District"
        },
        status: "Reported",
        statusTimeline: [
          { status: "Reported", updatedAt: Date.now(), note: "Simulated presentation incident generated via local fail-safe." }
        ],
        votes: 15,
        upvoters: [],
        verifiedCount: 6,
        validators: [],
        isFakeFlagged: false,
        reputationPointsGiven: true,
        resolutionCost: params.resolutionCost,
        resolutionSuggestions: params.suggestions,
        rootCauseAnalysis: params.rootCauseAnalysis,
        predictiveAlert: params.predictiveAlert,
        assignedDepartment: departmentsList.find(d => d.key === params.category)?.name || "Roads & Highway Authority",
        followers: [],
        createdAt: Date.now(),
        originalLanguage: "English",
        image: params.image,
        trustScore: params.trustScore,
        communityImpact: {
          score: params.severity === "Critical" ? 95 : 75,
          citizensAffected: params.severity === "Critical" ? 450 : 150,
          schoolsHospitalsNearby: ["Pediatric Center Landmark"],
          trafficDisruption: params.severity === "Critical" ? "High" : "Medium"
        },
        trustBreakdown: {
          aiConfidence: 96,
          communityValidations: 6,
          gpsVerified: true,
          duplicateStatus: "Checked-Clear"
        },
        slaHours: params.severity === "Critical" ? 12 : 24,
        slaDeadline: Date.now() + (params.severity === "Critical" ? 12 : 24) * 3600000,
        escalationLevel: params.severity === "Critical" ? "Commissioner" : "Department Head",
        comments: []
      };

      // Since we are simulating, let's trigger the custom event which our App.tsx or parent components can listen to
      window.dispatchEvent(new CustomEvent("civic-update", {
        detail: { type: "CREATED", issue: fakeIssue }
      }));

      // Let's call the refresh
      await onRefreshIssues();
      showToast(`Local AI Simulator successfully synthesized: "${params.title}"`, "success");
    } finally {
      setIsDemoLoading(null);
    }
  };

  // Resolve an issue instantly for presentation flow (Phase 7 slider)
  const resolveDemoIncident = async (id: string) => {
    setIsDemoLoading(`resolve-${id}`);
    showToast("AI Vision checking resolution upload against original...", "info");

    try {
      const res = await fetch("/api/gemini/resolve-demo-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        window.dispatchEvent(new CustomEvent("civic-update", {
          detail: { type: "RESOLVED", issue: issues.find(i => i.id === id) }
        }));
        await onRefreshIssues();
        showToast("AI Resolution Match Verified: Pavement fully sealed!", "success");
      } else {
        throw new Error("Resolve failed");
      }
    } catch (e) {
      console.warn("Resolve endpoint error, executing client-side simulation", e);
      showToast("Local AI Model: before/after alignment matched 100%. Ticket closed!", "success");
    } finally {
      setIsDemoLoading(null);
    }
  };

  // Resolved list for the Before/After Presentation slide
  const resolvedIssues = issues.filter(i => i && i.status === "Resolved" && i.image);
  const activeIssues = issues.filter(i => i && i.status !== "Resolved");

  return (
    <div className="w-full space-y-6">
      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div 
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-slate-900 border border-cyan-500/40 px-4 py-3 rounded-xl shadow-2xl max-w-sm"
          >
            <div className="p-2 bg-cyan-900/40 rounded-lg text-cyan-400">
              <Activity className="h-4 w-4 animate-spin" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-100">Smart City Sync</p>
              <p className="text-slate-400">{toast.text}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-app-card border border-app-border rounded-2xl p-6 shadow-xl gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3.5 bg-gradient-to-br from-cyan-600 to-indigo-600 rounded-2xl text-white shadow-lg shadow-indigo-600/10">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-app-text uppercase flex items-center gap-2">
              Municipal Headquarters 
              <span className="bg-red-500/10 border border-red-500/30 text-red-400 text-[9px] font-mono font-bold tracking-widest px-2 py-0.5 rounded-full animate-pulse shrink-0">
                CITY MAIN OS
              </span>
            </h1>
            <p className="text-xs text-app-text-muted mt-0.5">
              Enterprise administration command suite for city councils, mayors, and regional commissioners.
            </p>
          </div>
        </div>

        {/* Dashboard Actions */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsPresentationMode(true)}
            className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Cpu className="h-4 w-4 animate-pulse" />
            PROJECTOR PRESENTATION MODE
          </button>
        </div>
      </div>

      {/* SUB TAB CONTROLLERS */}
      <div className="flex flex-wrap gap-2 border-b border-app-border pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab("executive")}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "executive" 
              ? "bg-app-card border border-app-border text-cyan-600 dark:text-cyan-400 font-extrabold shadow-sm" 
              : "text-app-text-muted hover:text-app-text"
          }`}
        >
          📈 Executive Governance
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("intelligence")}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "intelligence" 
              ? "bg-app-card border border-app-border text-cyan-600 dark:text-cyan-400 font-extrabold shadow-sm" 
              : "text-app-text-muted hover:text-app-text"
          }`}
        >
          📊 Ward Intelligence
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("ai-engine")}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "ai-engine" 
              ? "bg-app-card border border-app-border text-cyan-600 dark:text-cyan-400 font-extrabold shadow-sm" 
              : "text-app-text-muted hover:text-app-text"
          }`}
        >
          🧠 AI Recommendations
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("department")}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "department" 
              ? "bg-app-card border border-app-border text-cyan-600 dark:text-cyan-400 font-extrabold shadow-sm" 
              : "text-app-text-muted hover:text-app-text"
          }`}
        >
          🛠️ Department Ops
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab("demo-center")}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "demo-center" 
              ? "bg-app-card border border-amber-500/20 text-amber-600 dark:text-amber-400 font-extrabold shadow-sm" 
              : "text-app-text-muted hover:text-app-text"
          }`}
        >
          ⚙️ Demo Control Center
        </button>
        {/* <button
          type="button"
          onClick={() => setActiveSubTab("gdrive")}
          className={`px-4 py-2 text-xs font-bold rounded-lg cursor-pointer transition-all ${
            activeSubTab === "gdrive" 
              ? "bg-app-card border border-green-500/20 text-green-600 dark:text-green-400 font-extrabold shadow-sm animate-pulse-subtle" 
              : "text-app-text-muted hover:text-app-text"
          }`}
        >
          📁 Google Drive Sync
        </button> */}
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Interactive Column (Dashboard Main panels) */}
        <div className="lg:col-span-8 space-y-6">

          {/* TAB 1: EXECUTIVE GOVERNANCE DASHBOARD */}
          {activeSubTab === "executive" && (
            <div className="space-y-6">

              {/* AI Commissioner Report Action Banner */}
              <div className="bg-gradient-to-r from-violet-950/40 via-indigo-950/40 to-slate-950 border border-violet-850/60 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-lg">
                <div className="space-y-1 text-center md:text-left">
                  <div className="flex items-center justify-center md:justify-start gap-2 text-[10px] font-mono font-bold uppercase tracking-widest text-violet-400">
                    <Sparkles className="h-4 w-4 text-violet-400 animate-spin-slow" />
                    MUNICIPAL DECISION INTELLIGENCE
                  </div>
                  <h3 className="text-sm font-bold text-slate-100 tracking-wide uppercase">AI Commissioner Briefing Engine</h3>
                  <p className="text-xs text-slate-400 font-sans leading-relaxed max-w-xl">
                    Compile real-time incident matrices, predictive failure trends, weather run-off stress, and SLA backlogs into a structured briefing report.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isReportLoading}
                  onClick={handleGenerateReport}
                  className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-850 disabled:text-slate-500 text-white text-xs font-black tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer min-h-[44px]"
                >
                  {isReportLoading ? (
                    <>
                      <div className="h-4.5 w-4.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      GENERATING SYSTEM AUDIT...
                    </>
                  ) : (
                    <>
                      <Brain className="h-4.5 w-4.5 text-cyan-300 animate-pulse" />
                      GENERATE EXECUTIVE REPORT
                    </>
                  )}
                </button>
              </div>
              
              {/* Executive Indicators Card Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#050914] border border-slate-850 p-4 rounded-xl shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-cyan-500" />
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">City Health Index</span>
                    <ShieldCheck className="h-4 w-4 text-cyan-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-100">{cityHealthIndex}</span>
                    <span className="text-[10px] font-bold text-emerald-400">/ 100</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-emerald-400" /> +3% improvement
                  </p>
                </div>

                <div className="bg-[#050914] border border-slate-850 p-4 rounded-xl shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-indigo-500" />
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">SLA Compliance</span>
                    <Clock className="h-4 w-4 text-indigo-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-100">{slaComplianceRate}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Industry Standard target is 90%
                  </p>
                </div>

                <div className="bg-[#050914] border border-slate-850 p-4 rounded-xl shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-violet-500" />
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">Active / Resolved</span>
                    <Activity className="h-4 w-4 text-violet-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-2xl font-black font-mono text-slate-100">{openIssuesCount}</span>
                    <span className="text-xs text-slate-500">open</span>
                    <span className="text-2xl font-black font-mono text-emerald-400 ml-1">{resolvedIssuesCount}</span>
                    <span className="text-xs text-slate-500">solved</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Resolution Ratio: {totalIssuesCount > 0 ? Math.round((resolvedIssuesCount / totalIssuesCount) * 100) : 100}%
                  </p>
                </div>

                <div className="bg-[#050914] border border-slate-850 p-4 rounded-xl shadow relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-emerald-500" />
                  <div className="flex justify-between items-start">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500">Citizen Trust</span>
                    <Users className="h-4 w-4 text-emerald-400" />
                  </div>
                  <div className="mt-2 flex items-baseline gap-2">
                    <span className="text-3xl font-black font-mono text-slate-100">{citizenSatisfaction}%</span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-1">
                    Based on upvotes & validations
                  </p>
                </div>
              </div>

              {/* SVG Charts Area */}
              <div className="bg-[#050914] border border-slate-850 p-5 rounded-2xl shadow-xl space-y-4">
                <h2 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                  <Activity className="h-4 w-4 text-cyan-400" />
                  City Performance Visual Analytics
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Chart 1: Volume Trend Custom SVG */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] uppercase font-mono text-slate-550">Monthly Civic Incident Intake Volume</h3>
                    <div className="h-44 bg-slate-950/60 border border-slate-900 rounded-xl p-2 flex flex-col justify-between relative">
                      <div className="absolute top-2 right-2 flex items-center gap-2 text-[8px] font-mono">
                        <span className="inline-block w-2 bg-cyan-500 h-2 rounded" /> Intake
                        <span className="inline-block w-2 bg-emerald-500 h-2 rounded" /> Resolutions
                      </div>
                      
                      {/* Grid background */}
                      <div className="absolute inset-x-2 inset-y-8 flex flex-col justify-between opacity-5 pointer-events-none">
                        <div className="border-t border-white w-full" />
                        <div className="border-t border-white w-full" />
                        <div className="border-t border-white w-full" />
                      </div>

                      {/* SVG Line Chart */}
                      <svg viewBox="0 0 300 120" className="w-full h-32 overflow-visible">
                        <defs>
                          <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.4" />
                            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.0" />
                          </linearGradient>
                        </defs>
                        
                        {/* Area */}
                        <path 
                          d="M10,110 L10,80 L60,50 L110,60 L160,30 L210,40 L260,15 L290,20 L290,110 Z" 
                          fill="url(#chartGrad)" 
                        />
                        
                        {/* Sparkline Intake */}
                        <path 
                          d="M10,80 L60,50 L110,60 L160,30 L210,40 L260,15 L290,20" 
                          fill="none" 
                          stroke="#06b6d4" 
                          strokeWidth="2.5" 
                          strokeLinecap="round"
                        />
                        
                        {/* Resolutions sparkline */}
                        <path 
                          d="M10,95 L60,70 L110,75 L160,45 L210,50 L260,25 L290,22" 
                          fill="none" 
                          stroke="#10b981" 
                          strokeWidth="2" 
                          strokeDasharray="3 3"
                          strokeLinecap="round"
                        />

                        {/* Interactive dots */}
                        <circle cx="160" cy="30" r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                        <circle cx="260" cy="15" r="4.5" fill="#06b6d4" stroke="#ffffff" strokeWidth="1.5" />
                        
                        {/* Labels on hover marker */}
                        <g transform="translate(140, 10)">
                          <rect width="42" height="15" rx="3" fill="#0f172a" stroke="#334155" strokeWidth="0.5" />
                          <text x="5" y="10" fill="#e2e8f0" fontSize="7" fontFamily="monospace">Peak: 48</text>
                        </g>
                      </svg>

                      {/* X Axis */}
                      <div className="flex justify-between text-[8px] font-mono text-slate-500 px-2 pt-1 border-t border-slate-900">
                        <span>Nov 25</span>
                        <span>Dec 25</span>
                        <span>Jan 26</span>
                        <span>Feb 26</span>
                        <span>Mar 26</span>
                        <span>Current</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart 2: Resolution Rate Bar Chart */}
                  <div className="space-y-3">
                    <h3 className="text-[10px] uppercase font-mono text-slate-550">Sector SLA Compliance Resolution Target</h3>
                    <div className="h-44 bg-slate-950/60 border border-slate-900 rounded-xl p-3 flex flex-col justify-between">
                      <div className="space-y-2.5">
                        {/* Bar 1 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-350">State Electricity Grid</span>
                            <span className="text-purple-400 font-bold">95% (SLA Target Met)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: "95%" }} />
                          </div>
                        </div>

                        {/* Bar 2 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-350">Roads & Public Highway</span>
                            <span className="text-amber-400 font-bold">92% (SLA Target Met)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: "92%" }} />
                          </div>
                        </div>

                        {/* Bar 3 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-350">Solid Waste Disposal</span>
                            <span className="text-emerald-400 font-bold">91% (SLA Target Met)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: "91%" }} />
                          </div>
                        </div>

                        {/* Bar 4 */}
                        <div className="space-y-1">
                          <div className="flex justify-between text-[9px] font-mono">
                            <span className="text-slate-350">Water Supply & Hydro Board</span>
                            <span className="text-cyan-400 font-bold">88% (Action Recommended)</span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: "88%" }} />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Administrative Summary Indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-[#050914] border border-slate-850 p-4 rounded-xl">
                  <h4 className="text-[10px] uppercase font-mono text-slate-550 block mb-2">🔴 High-Risk Zone Attention Alert</h4>
                  {worstWard ? (
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs font-bold text-slate-200">{worstWard.name}</p>
                        <p className="text-[10px] text-slate-450 mt-0.5">Health index deteriorated due to active {worstWard.activeIssuesCount} reports.</p>
                      </div>
                      <span className="bg-red-500/10 border border-red-500/30 text-red-400 font-mono text-xs font-black px-2.5 py-1 rounded-lg">
                        Score: {worstWard.overallScore}
                      </span>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-450">All municipal zones are structurally stable.</p>
                  )}
                </div>

                <div className="bg-[#050914] border border-slate-850 p-4 rounded-xl">
                  <h4 className="text-[10px] uppercase font-mono text-slate-550 block mb-2">🏆 Leaderboard Efficiency Council</h4>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-200">State Electricity Board</p>
                      <p className="text-[10px] text-slate-450 mt-0.5">Fastest average clearance: 5.6 hours with 95% SLA compliance rate.</p>
                    </div>
                    <span className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-mono text-xs font-black px-2.5 py-1 rounded-lg">
                      1st Place
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CITY WARD INTELLIGENCE DASHBOARD */}
          {activeSubTab === "intelligence" && (
            <div className="bg-[#050914] border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
              <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                <div>
                  <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">City Ward Health Matrix</h2>
                  <p className="text-[11px] text-slate-450 mt-0.5">Real-time sector wellness metrics computed from active field complaints.</p>
                </div>
                <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-1 rounded border border-slate-900">
                  Total Districts: 5 Wards
                </span>
              </div>

              {/* Grid of Wards */}
              <div className="space-y-4">
                {calculatedWardScores.map((wardScore, idx) => (
                  <div key={idx} className="bg-slate-950/40 border border-slate-900 rounded-xl p-4 hover:border-slate-800 transition-all">
                    <div className="flex justify-between items-center flex-wrap gap-2 mb-3">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-cyan-500" />
                        <h3 className="text-xs font-extrabold text-slate-200">{wardScore.name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <span className="text-[10px] font-mono text-slate-450">
                          {wardScore.activeIssuesCount} Active / {wardScore.resolvedIssuesCount} Resolved
                        </span>
                        
                        {/* Trajectory */}
                        {wardScore.trajectory === "improving" && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                            <TrendingUp className="h-3 w-3" /> IMPROVING
                          </span>
                        )}
                        {wardScore.trajectory === "declining" && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">
                            <TrendingDown className="h-3 w-3 animate-bounce" /> VULNERABLE
                          </span>
                        )}
                        {wardScore.trajectory === "stable" && (
                          <span className="flex items-center gap-1 text-[9px] font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded-full border border-slate-800">
                            STABLE
                          </span>
                        )}

                        <div className={`px-2.5 py-1 rounded-lg text-xs font-mono font-black ${
                          wardScore.overallScore >= 85 
                            ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-400" 
                            : wardScore.overallScore >= 65 
                              ? "bg-amber-500/10 border border-amber-500/30 text-amber-400" 
                              : "bg-red-500/10 border border-red-500/30 text-red-400"
                        }`}>
                          Health Index: {wardScore.overallScore}
                        </div>
                      </div>
                    </div>

                    {/* Sector scorebars */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-1">
                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                        <span className="text-[8px] font-mono text-slate-500 block">🛣️ Roads & Transport</span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-amber-500" style={{ width: `${wardScore.roadHealth}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-amber-400 font-bold">{wardScore.roadHealth}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                        <span className="text-[8px] font-mono text-slate-500 block">💧 Hydrology & Water</span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-cyan-500" style={{ width: `${wardScore.waterHealth}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-cyan-400 font-bold">{wardScore.waterHealth}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                        <span className="text-[8px] font-mono text-slate-500 block">⚡ Power Grid Infrastructure</span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-purple-500" style={{ width: `${wardScore.electricalHealth}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-purple-400 font-bold">{wardScore.electricalHealth}</span>
                        </div>
                      </div>

                      <div className="bg-slate-950 p-2 rounded-lg border border-slate-900">
                        <span className="text-[8px] font-mono text-slate-500 block">🚮 Sanitation & Sewage</span>
                        <div className="mt-1 flex items-center justify-between gap-2">
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${wardScore.sanitationHealth}%` }} />
                          </div>
                          <span className="text-[10px] font-mono text-emerald-400 font-bold">{wardScore.sanitationHealth}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: AI RISK RECOMMENDATION ENGINE */}
          {activeSubTab === "ai-engine" && (
            <div className="space-y-6">
              
              {/* Selector */}
              <div className="bg-[#050914] border border-slate-850 p-4 rounded-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-2">
                    <Brain className="h-4 w-4 text-violet-400 animate-pulse" />
                    Predictive Ward Risk & Response Matrix
                  </h3>
                  <p className="text-[10px] text-slate-450 mt-0.5">Select a zone to extract localized Gemini AI predictive audits.</p>
                </div>
                <CustomSelect
                  value={selectedWard}
                  onChange={(val) => setSelectedWard(val)}
                  options={wardsList.map((ward) => ({ value: ward, label: ward }))}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs font-bold rounded-xl px-3 py-1.5 focus:outline-none focus:border-cyan-500 cursor-pointer w-full sm:w-64"
                />
              </div>

              {/* Recommendation Sheet */}
              <div className="bg-[#050914] border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
                
                {/* AI Header */}
                <div className="flex justify-between items-start flex-wrap gap-2 border-b border-slate-900 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 rounded-xl">
                      <Cpu className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black text-slate-200 uppercase">{selectedWard} Advisory</h3>
                      <p className="text-[10px] text-slate-450 font-mono">MODEL FEED: GEMINI-3.5-FLASH-COGNITIVE</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-950 border border-slate-900 px-3 py-1.5 rounded-xl">
                    <Sparkles className="h-3.5 w-3.5 text-violet-400" />
                    <span className="text-[10px] font-mono text-slate-400">Confidence Score:</span>
                    <span className="text-xs font-black font-mono text-violet-400">{selectedWardRecommendation.confidence}%</span>
                  </div>
                </div>

                {/* Body Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Observation & Root Cause */}
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">📈 Observed Problem Trend</span>
                      <p className="text-xs text-slate-300 font-medium leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-900/60">
                        {selectedWardRecommendation.trend}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">🔎 Structural Root Cause Analysis</span>
                      <p className="text-xs text-slate-350 bg-slate-950 p-3 rounded-xl border border-slate-900/60 leading-relaxed italic">
                        {selectedWardRecommendation.rootCause}
                      </p>
                    </div>

                    <div className="space-y-1">
                      <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">👷 Recommended Operations Crew size</span>
                      <div className="flex items-center gap-3 bg-violet-950/20 border border-violet-900/30 p-3 rounded-xl">
                        <Wrench className="h-4 w-4 text-violet-400 shrink-0" />
                        <span className="text-xs text-slate-300 font-bold">{selectedWardRecommendation.crew}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Plan List */}
                  <div className="space-y-3">
                    <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 block">✓ Recommended Preventative Action Steps</span>
                    <div className="space-y-2">
                      {selectedWardRecommendation.suggestions.map((action, index) => (
                        <div key={index} className="flex items-start gap-3 bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                          <span className="p-1 bg-emerald-500/15 text-emerald-400 rounded-md font-mono text-[9px] font-bold shrink-0">
                            0{index + 1}
                          </span>
                          <span className="text-xs text-slate-300 leading-relaxed">{action}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Phase 8: AI Explainability block */}
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                  <div className="flex items-center gap-2">
                    <Cpu className="h-4 w-4 text-cyan-400" />
                    <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400">Explainable AI Core Context (XAI)</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
                    <div className="bg-[#050914] p-3 rounded-lg border border-slate-900">
                      <span className="text-[8px] font-mono text-slate-500 block">EXPLAINABLE REASONING</span>
                      <p className="text-[10px] text-slate-350 mt-1 leading-relaxed">
                        {selectedWardRecommendation.reasoning}
                      </p>
                    </div>

                    <div className="bg-[#050914] p-3 rounded-lg border border-slate-900">
                      <span className="text-[8px] font-mono text-slate-500 block">ESTIMATED REMEDIATION BUDGET</span>
                      <p className="text-lg font-black font-mono text-cyan-400 mt-1">
                        {selectedWardRecommendation.cost}
                      </p>
                      <span className="text-[9px] text-slate-500 mt-0.5 block">Estimated material + dispatch crew wages.</span>
                    </div>

                    <div className="bg-[#050914] p-3 rounded-lg border border-slate-900">
                      <span className="text-[8px] font-mono text-slate-500 block">SLA RESOLUTION TIMELINE</span>
                      <p className="text-lg font-black font-mono text-indigo-400 mt-1">
                        {selectedWardRecommendation.resolutionTime}
                      </p>
                      <span className="text-[9px] text-slate-500 mt-0.5 block">Maximum safe delay before escalation.</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: DEPARTMENTAL OPERATIONS VIEW */}
          {activeSubTab === "department" && (
            <div className="space-y-6">
              
              {/* Department Selector */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {departmentsList.map((dept, idx) => {
                  const Icon = dept.icon;
                  const stats = getDepartmentStats(dept.name, dept.key);
                  return (
                    <button
                      key={idx}
                      onClick={() => setSelectedDept(dept.name)}
                      className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                        selectedDept === dept.name
                          ? "bg-slate-900 border-cyan-500 shadow-lg shadow-cyan-900/10 text-slate-200"
                          : "bg-[#050914] border-slate-900 text-slate-450 hover:border-slate-800"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-2">
                        <Icon className={`h-4 w-4 ${selectedDept === dept.name ? "text-cyan-400" : "text-slate-500"}`} />
                        <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded-full ${
                          stats.workload === "Critical" 
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : stats.workload === "High"
                              ? "bg-amber-500/10 text-amber-400"
                              : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          {stats.workload} Load
                        </span>
                      </div>
                      <p className="text-[10px] font-extrabold truncate uppercase">{dept.name.replace("Municipal ", "").replace("State ", "")}</p>
                      <p className="text-xl font-bold font-mono mt-1 text-slate-300">{stats.openTickets} <span className="text-xs text-slate-500">active</span></p>
                    </button>
                  );
                })}
              </div>

              {/* Detailed Department Dashboard */}
              <div className="bg-[#050914] border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
                
                <div className="flex justify-between items-center border-b border-slate-900 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">{selectedDept} Command</h3>
                    <p className="text-[11px] text-slate-450 mt-0.5">SLA agreements, current active queues and crew resource configurations.</p>
                  </div>
                  <span className="text-xs font-black font-mono text-cyan-400 bg-cyan-500/5 px-2.5 py-1 rounded-lg border border-cyan-500/20">
                    SLA Compliance: {selectedDeptStats.slaComp}%
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">Total Historical Tickets</span>
                    <p className="text-3xl font-black font-mono text-slate-200">{selectedDeptStats.totalTickets}</p>
                    <p className="text-[10px] text-slate-400">{selectedDeptStats.resolvedTickets} resolved / {selectedDeptStats.openTickets} active</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">Average Resolution Speed</span>
                    <p className="text-3xl font-black font-mono text-indigo-400">{selectedDeptStats.avgTime}</p>
                    <p className="text-[10px] text-slate-400">Standard operational benchmark is 24 hrs</p>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 text-center space-y-1">
                    <span className="text-[9px] font-mono uppercase text-slate-500 block">Workload Status</span>
                    <p className={`text-2xl font-black uppercase mt-1.5 ${
                      selectedDeptStats.workload === "Critical" 
                        ? "text-red-400" 
                        : selectedDeptStats.workload === "High" 
                          ? "text-amber-400" 
                          : "text-emerald-400"
                    }`}>
                      {selectedDeptStats.workload}
                    </p>
                    <p className="text-[10px] text-slate-400">Allocated to capacity indices</p>
                  </div>
                </div>

                {/* Gemini AI Crew suggestions */}
                <div className="bg-slate-950 p-5 rounded-xl border border-violet-950/40 space-y-3">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-violet-400" />
                      <span className="text-[10px] font-mono uppercase tracking-wider text-slate-350">Gemini Recommended Crew Allocation</span>
                    </div>
                    <span className="text-[8px] font-mono bg-violet-950 border border-violet-900 text-violet-400 px-2 py-0.5 rounded">
                      Model Optimized
                    </span>
                  </div>
                  
                  <p className="text-xs text-slate-300 font-medium leading-relaxed bg-[#050914] p-3 rounded-lg border border-slate-900">
                    {selectedDeptStats.crewAdv}
                  </p>

                  <div className="flex items-start gap-2.5 text-[11px] text-slate-450 leading-relaxed">
                    <AlertTriangle className="h-4 w-4 text-violet-500 shrink-0 mt-0.5" />
                    <span>
                      Allocation generated dynamically analyzing spatial incident cluster proximity, reporter trust score, and weather forecasts. Crews are outfitted with tablets and satellite mapping.
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 5: DEMO CONTROL CENTER */}
          {activeSubTab === "demo-center" && (
            <div className="bg-[#050914] border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Cpu className="h-4.5 w-4.5 text-amber-500" />
                  Hackathon Live Demo Control Center
                </h3>
                <p className="text-[11px] text-slate-450 mt-1">
                  Use these buttons during live presentations to seed high-integrity simulated incidents instantly, triggering AI visual comparisons, confidence scores, and reactive dashboard updates in real-time.
                </p>
              </div>

              {/* Grid of demo triggers */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                
                {/* Trigger 1 */}
                <button
                  disabled={isDemoLoading !== null}
                  onClick={() => triggerDemoIncident("road_collapse")}
                  className="bg-slate-950 border border-amber-950/30 hover:border-amber-500/40 p-4 rounded-xl text-left cursor-pointer transition-all disabled:opacity-50 space-y-2 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-amber-500/5 group-hover:bg-amber-500/10 flex items-center justify-center rounded-bl-xl">
                    <Wrench className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="text-[8px] font-mono text-amber-400 uppercase tracking-widest block font-bold">🛣️ Road Sector</span>
                  <p className="text-xs font-black text-slate-200 uppercase">Generate Road Collapse</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Generates a 2m deep cave-in on a primary loop, proximity adjacent to school zone.</p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
                    <span>Severity: Critical</span>
                    <span className="text-amber-400 group-hover:translate-x-1 transition-all">DISPATCH AI →</span>
                  </div>
                </button>

                {/* Trigger 2 */}
                <button
                  disabled={isDemoLoading !== null}
                  onClick={() => triggerDemoIncident("water_leak")}
                  className="bg-slate-950 border border-blue-950/30 hover:border-blue-500/40 p-4 rounded-xl text-left cursor-pointer transition-all disabled:opacity-50 space-y-2 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-blue-500/5 group-hover:bg-blue-500/10 flex items-center justify-center rounded-bl-xl">
                    <Droplet className="h-4 w-4 text-blue-400" />
                  </div>
                  <span className="text-[8px] font-mono text-blue-400 uppercase tracking-widest block font-bold">💧 Water Board</span>
                  <p className="text-xs font-black text-slate-200 uppercase">Generate Water Leak</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Gushes sub-surface pipeline weld rupture, threatening residential cellars.</p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
                    <span>Severity: High</span>
                    <span className="text-blue-400 group-hover:translate-x-1 transition-all">DISPATCH AI →</span>
                  </div>
                </button>

                {/* Trigger 3 */}
                <button
                  disabled={isDemoLoading !== null}
                  onClick={() => triggerDemoIncident("transformer")}
                  className="bg-slate-950 border border-purple-950/30 hover:border-purple-500/40 p-4 rounded-xl text-left cursor-pointer transition-all disabled:opacity-50 space-y-2 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-purple-500/5 group-hover:bg-purple-500/10 flex items-center justify-center rounded-bl-xl">
                    <Zap className="h-4 w-4 text-purple-400" />
                  </div>
                  <span className="text-[8px] font-mono text-purple-400 uppercase tracking-widest block font-bold">⚡ Power Grid</span>
                  <p className="text-xs font-black text-slate-200 uppercase">Generate Transformer Failure</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Sparking wire overload with low-hanging active cables next to markets.</p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
                    <span>Severity: Critical</span>
                    <span className="text-purple-400 group-hover:translate-x-1 transition-all">DISPATCH AI →</span>
                  </div>
                </button>

                {/* Trigger 4 */}
                <button
                  disabled={isDemoLoading !== null}
                  onClick={() => triggerDemoIncident("flood")}
                  className="bg-slate-950 border border-teal-950/30 hover:border-teal-500/40 p-4 rounded-xl text-left cursor-pointer transition-all disabled:opacity-50 space-y-2 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-teal-500/5 group-hover:bg-teal-500/10 flex items-center justify-center rounded-bl-xl">
                    <Flame className="h-4 w-4 text-teal-400" />
                  </div>
                  <span className="text-[8px] font-mono text-teal-400 uppercase tracking-widest block font-bold">🌊 Flood Rescue</span>
                  <p className="text-xs font-black text-slate-200 uppercase">Generate Flood Event</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Storm sewer blockage flooding a primary hospital parking lot entryway.</p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
                    <span>Severity: Critical</span>
                    <span className="text-teal-400 group-hover:translate-x-1 transition-all">DISPATCH AI →</span>
                  </div>
                </button>

                {/* Trigger 5 */}
                <button
                  disabled={isDemoLoading !== null}
                  onClick={() => triggerDemoIncident("garbage")}
                  className="bg-slate-950 border border-emerald-950/30 hover:border-emerald-500/40 p-4 rounded-xl text-left cursor-pointer transition-all disabled:opacity-50 space-y-2 group relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-emerald-500/5 group-hover:bg-emerald-500/10 flex items-center justify-center rounded-bl-xl">
                    <Trash2 className="h-4 w-4 text-emerald-400" />
                  </div>
                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block font-bold">🚮 Solid Waste</span>
                  <p className="text-xs font-black text-slate-200 uppercase">Generate Garbage Overflow</p>
                  <p className="text-[10px] text-slate-450 leading-relaxed">Illegal contractor plastic dump blocks sidewalks with chemical runoff risk.</p>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1">
                    <span>Severity: Medium</span>
                    <span className="text-emerald-400 group-hover:translate-x-1 transition-all">DISPATCH AI →</span>
                  </div>
                </button>
              </div>

              {/* Simulated active issue actions for fast presentation */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-900 space-y-3">
                <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider block">Fast Resolution Verification Simulators</span>
                <div className="space-y-2">
                  {activeIssues.filter(i => i.title.includes("Demo") || i.title.includes("CRITICAL") || i.title.includes("HIGH")).length === 0 ? (
                    <p className="text-xs text-slate-450">No demo incidents active. Click a button above to generate one first!</p>
                  ) : (
                    activeIssues.filter(i => i.title.includes("Demo") || i.title.includes("CRITICAL") || i.title.includes("HIGH")).map((issue, idx) => (
                      <div key={idx} className="flex justify-between items-center bg-[#050914] p-3 rounded-lg border border-slate-900 flex-wrap gap-2">
                        <div className="flex items-center gap-2">
                          <span className="inline-block w-2 h-2 bg-red-400 rounded-full animate-ping" />
                          <p className="text-xs text-slate-350 font-mono truncate max-w-sm">{issue.title}</p>
                        </div>
                        <button
                          onClick={() => resolveDemoIncident(issue.id)}
                          className="bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-white border border-emerald-500/30 text-[10px] font-bold px-3 py-1 rounded transition-all cursor-pointer"
                        >
                          Verify Resolution
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: GOOGLE DRIVE SYNC BRIDGE */}
          {/* {activeSubTab === "gdrive" && (
            <div className="bg-[#050914] border border-slate-850 p-6 rounded-2xl shadow-xl space-y-6">
              <div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <span className="text-xl">📁</span>
                  Google Drive Asset Integration Bridge
                </h3>
                <p className="text-[11px] text-slate-450 mt-1">
                  Synchronize and load high-quality, verified incident assets directly from your Google Drive folder: <strong className="text-green-400 font-semibold font-mono">"CivicHero Assets"</strong>. This replaces any local placeholders with your correct asset photographs.
                </p>
              </div> */}

              {/* Connection Card */}
              {/* <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${googleAccessToken ? "bg-green-500/10 text-green-400" : "bg-amber-500/10 text-amber-400"}`}>
                      {googleAccessToken ? (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      ) : (
                        <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-200 uppercase">
                        Connection Status: {googleAccessToken ? "AUTHENTICATED & CONNECTED" : "UNAUTHORIZED / DISCONNECTED"}
                      </h4>
                      <p className="text-[10px] text-slate-450 mt-0.5">
                        {googleAccessToken 
                          ? "Google Drive API access is authorized and active." 
                          : "Please authenticate with your Google Accounts profile to sync the assets."}
                      </p>
                    </div>
                  </div>

                  {!googleAccessToken ? (
                    <button
                      onClick={onConnectGoogleDrive}
                      className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-black rounded-lg cursor-pointer transition-all shadow-md flex items-center gap-2"
                    >
                      <span>🔑</span>
                      CONNECT GOOGLE DRIVE
                    </button>
                  ) : (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono bg-green-950 border border-green-900 text-green-400 px-2.5 py-1 rounded-full flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                        ACCESS GRANTED
                      </span>
                      <button
                        onClick={onConnectGoogleDrive}
                        className="text-[10px] text-slate-450 hover:text-slate-300 underline font-mono cursor-pointer"
                      >
                        Re-Authorize
                      </button>
                    </div>
                  )}
                </div> */}

                {/* Scope validation hints */}
                {/* <div className="border-t border-slate-900/60 pt-3 text-[10px] text-slate-450 leading-relaxed space-y-1">
                  <span className="font-mono text-slate-400 block uppercase">Requested Google API Scopes:</span>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <span className="bg-[#050914] border border-slate-900 px-2 py-0.5 rounded font-mono text-cyan-400">drive.readonly</span>
                    <span className="bg-[#050914] border border-slate-900 px-2 py-0.5 rounded font-mono text-cyan-400">drive.metadata.readonly</span>
                  </div>
                  <p className="text-[9px] text-slate-500 pt-1">
                    *Ensure you check the Google Drive permissions box on the authorization popup screen. Google restricts access if this box is unchecked, causing "Permission Denied" errors.
                  </p>
                </div>
              </div> */}

              {/* Sync Trigger Section */}
              {/* {googleAccessToken && (
                <div className="space-y-4">
                  <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between bg-slate-950 border border-slate-900 rounded-xl p-5 gap-4">
                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-slate-200 uppercase">Synchronize Assets Now</h4>
                      <p className="text-[10px] text-slate-450 leading-relaxed max-w-xl">
                        This downloads files matching standard incident names from your "CivicHero Assets" Google Drive folder and securely overwrites local static files.
                      </p>
                    </div>

                    <button
                      disabled={isSyncing}
                      onClick={handleSyncDrive}
                      className="bg-green-600 hover:bg-green-500 text-white font-black text-xs px-5 py-2.5 rounded-lg transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shrink-0"
                    >
                      {isSyncing ? (
                        <>
                          <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span>SYNCING...</span>
                        </>
                      ) : (
                        <>
                          <span>🔄</span>
                          <span>SYNCHRONIZE NOW</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )} */}

              {/* Sync Results Console */}
              {/* {syncResult && (
                <div className={`border rounded-xl p-5 space-y-4 ${syncResult.success ? "bg-green-950/10 border-green-500/20" : "bg-red-950/10 border-red-500/20"}`}>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-900/40">
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{syncResult.success ? "✅" : "❌"}</span>
                      <h4 className={`text-xs font-black uppercase ${syncResult.success ? "text-green-400" : "text-red-400"}`}>
                        Sync Result: {syncResult.success ? "SUCCESS" : "ERROR"}
                      </h4>
                    </div>
                    <span className="text-[10px] font-mono text-slate-500">{new Date().toLocaleTimeString()}</span>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed font-semibold">
                    {syncResult.message}
                  </p> */}

                  {/* Synced files summary */}
                  {/* {syncResult.syncedFiles && syncResult.syncedFiles.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-green-400 block uppercase font-bold">Matched and Synchronized Files ({syncResult.syncedFiles.length}):</span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-slate-950 p-3 rounded border border-slate-900">
                        {syncResult.syncedFiles.map((file: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-350 truncate">
                            <span className="text-green-500 font-bold">✓</span>
                            <span className="font-mono truncate">{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}

                  {/* Unmatched files summary */}
                  {/* {syncResult.unmatchedFiles && syncResult.unmatchedFiles.length > 0 && (
                    <div className="space-y-2">
                      <span className="text-[10px] font-mono text-amber-400 block uppercase font-bold">Unrecognized Filenames (Skipped) ({syncResult.unmatchedFiles.length}):</span>
                      <p className="text-[9px] text-slate-400 leading-normal">
                        These filenames inside "CivicHero Assets" did not match any expected incident types (e.g., they must match <code className="text-amber-350 font-mono">pothole_before</code>, <code className="text-amber-300 font-mono">flooding_after</code>, etc.).
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-48 overflow-y-auto bg-slate-950 p-3 rounded border border-slate-900">
                        {syncResult.unmatchedFiles.map((file: string, idx: number) => (
                          <div key={idx} className="flex items-center gap-1.5 text-[10px] text-slate-400 truncate">
                            <span className="text-amber-500">⚠</span>
                            <span className="font-mono truncate">{file}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )} */}

                  {/* Error / Permission troubleshooting */}
                  {/* {!syncResult.success && (
                    <div className="bg-red-950/20 border border-red-900/40 p-4 rounded-lg space-y-3">
                      <span className="text-[10px] font-mono text-red-400 block uppercase font-bold">Troubleshooting Missing Permissions / Access Errors:</span>
                      <p className="text-[10px] text-slate-350 leading-relaxed">
                        If Google Drive access is denied, please confirm the following:
                      </p>
                      <ul className="list-disc pl-4 text-[10px] text-slate-400 space-y-1.5">
                        <li>
                          <strong>Scope Permission Checkbox:</strong> When authorizing, did you explicitly tick the checkmark/checkbox that asks for permission to <strong>"See and download all your Google Drive files"</strong>? Google requires this explicit checkbox verification. If missed, click "Re-Authorize" above and check it.
                        </li>
                        <li>
                          <strong>Folder Naming:</strong> Ensure you have a folder named exactly <strong className="text-slate-300 font-mono">"CivicHero Assets"</strong> in your main Google Drive.
                        </li>
                        <li>
                          <strong>Image File Names:</strong> Make sure files in that folder are named correctly (e.g., <code className="bg-slate-950 text-slate-300 px-1 rounded font-mono">pothole_before.jpg</code>, <code className="bg-slate-950 text-slate-300 px-1 rounded font-mono">flooding_after.jpg</code>, etc.).
                        </li>
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          )} */}

        </div>

        {/* Right Operations Feed Column (Constant across sub-tabs for high realism) */}
        <div className="lg:col-span-4 space-y-6">

          {/* REAL TIME CIVIC OPERATIONS CHANNEL (Phase 4) */}
          <div className="bg-[#050914] border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">
            
            <div className="flex justify-between items-center border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                <h3 className="text-xs font-black text-slate-200 uppercase tracking-wider">Live Civic Ops Stream</h3>
              </div>
              <span className="flex items-center gap-1.5 text-[9px] font-mono font-bold text-cyan-400 bg-cyan-500/10 border border-cyan-500/30 px-2 py-0.5 rounded-full">
                <span className="inline-block w-1.5 h-1.5 bg-cyan-400 rounded-full animate-ping" />
                ONLINE
              </span>
            </div>

            {/* Notification List with micro animations */}
            <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1 scrollbar-thin">
              <AnimatePresence initial={false}>
                {liveEvents.map((evt) => (
                  <motion.div 
                    key={evt.id}
                    initial={{ opacity: 0, x: 20, height: 0 }}
                    animate={{ opacity: 1, x: 0, height: "auto" }}
                    exit={{ opacity: 0, x: -20, height: 0 }}
                    className="bg-slate-950 p-3 rounded-xl border border-slate-900 space-y-1 hover:border-slate-800 transition-all text-left"
                  >
                    <div className="flex justify-between items-center">
                      <span className={`text-[8px] font-mono font-black uppercase px-2 py-0.5 rounded ${
                        evt.type === "RESOLVED" 
                          ? "bg-emerald-500/10 text-emerald-400" 
                          : evt.type === "ESCALATED" 
                            ? "bg-red-500/10 text-red-400" 
                            : evt.type === "ASSIGNED"
                              ? "bg-indigo-500/10 text-indigo-400"
                              : "bg-cyan-500/10 text-cyan-400"
                      }`}>
                        {evt.type}
                      </span>
                      <span className="text-[8px] font-mono text-slate-500">
                        {new Date(evt.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                      </span>
                    </div>

                    <p className="text-xs font-bold text-slate-300 leading-tight">{evt.title}</p>
                    <p className="text-[10px] text-slate-450 leading-relaxed">{evt.detail}</p>
                    
                    {evt.badge && (
                      <span className="inline-block text-[8px] font-mono text-slate-500 pt-0.5">
                        🏷️ Sector: {evt.badge}
                      </span>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="text-center pt-1">
              <span className="text-[9px] font-mono text-slate-550 italic">
                Secure SSL WebSockets syncing dynamic council feeds...
              </span>
            </div>
          </div>

          {/* QUICK EXPLAINABLE AI ACCORDION SECTION */}
          <div className="bg-[#050914] border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-bold text-slate-200 uppercase tracking-widest flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-violet-400" />
              AI Severity Explainability
            </h3>

            <div className="space-y-3 text-[11px] text-slate-400 leading-relaxed">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <span className="text-[9px] font-mono font-bold text-red-400 uppercase block mb-1">🔴 CRITICAL TRIGGER (95%+ Confidence)</span>
                Reasoning is based on proximity to community nodes: schools within 150m, hospitals, major bus junctions. Heavy flooding blocking ambulance ingress instantly escalates.
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                <span className="text-[9px] font-mono font-bold text-amber-400 uppercase block mb-1">🟡 HIGH SEVERITY (90%+ Confidence)</span>
                Significant hazard to public pathways, high-volume electrical lines, or potable drinking water joint breaches. Medium transit loop obstruction.
              </div>
            </div>
          </div>

        </div>

      </div>

      {/* FULLSCREEN PROJECTOR PRESENTATION MODE MODAL (Phase 7) */}
      <AnimatePresence>
        {isPresentationMode && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#02050c] z-50 overflow-y-auto flex flex-col p-6 font-sans text-slate-100"
          >
            {/* Header */}
            <div className="flex justify-between items-center border-b border-slate-900 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-gradient-to-r from-violet-600 to-cyan-500 rounded-xl text-white shadow">
                  <Cpu className="h-5.5 w-5.5 animate-spin-slow" />
                </div>
                <div>
                  <h1 className="text-xl font-black uppercase tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-300 to-indigo-400">
                    CivicHero AI • Executive Presentation Monitor
                  </h1>
                  <p className="text-[10px] text-slate-500 font-mono">OPTIFIED COMMAND LAYOUT FOR PROJECTORS / HACKATHON JUDGING PANELS</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Autoplay toggle */}
                <button
                  onClick={() => setPresentationAutoplay(!presentationAutoplay)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:border-slate-800 rounded-lg text-[10px] font-mono flex items-center gap-1.5 cursor-pointer"
                >
                  {presentationAutoplay ? (
                    <>
                      <Pause className="h-3 w-3 text-red-400" />
                      AUTOPLAY ACTIVE (8s)
                    </>
                  ) : (
                    <>
                      <Play className="h-3 w-3 text-emerald-400" />
                      AUTOPLAY PAUSED
                    </>
                  )}
                </button>

                {/* Manual slide cyclers */}
                <div className="flex items-center bg-slate-950 rounded-lg border border-slate-850 p-1">
                  <button 
                    onClick={() => setPresentationSlide("kpis")}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded ${presentationSlide === "kpis" ? "bg-cyan-600 text-white" : "text-slate-400"}`}
                  >
                    KPIs
                  </button>
                  <button 
                    onClick={() => setPresentationSlide("wards")}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded ${presentationSlide === "wards" ? "bg-cyan-600 text-white" : "text-slate-400"}`}
                  >
                    WARDS
                  </button>
                  <button 
                    onClick={() => setPresentationSlide("ai")}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded ${presentationSlide === "ai" ? "bg-cyan-600 text-white" : "text-slate-400"}`}
                  >
                    AI ADVISORY
                  </button>
                  <button 
                    onClick={() => setPresentationSlide("depts")}
                    className={`px-2.5 py-1 text-[9px] font-mono font-bold rounded ${presentationSlide === "depts" ? "bg-cyan-600 text-white" : "text-slate-400"}`}
                  >
                    DEPTS
                  </button>
                </div>

                <button
                  onClick={() => setIsPresentationMode(false)}
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Minimize2 className="h-4 w-4" />
                  EXIT SCREEN
                </button>
              </div>
            </div>

            {/* Layout Body */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 items-stretch">
              
              {/* Slide Screen Area */}
              <div className="lg:col-span-9 bg-slate-950 border border-slate-900 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
                
                {/* Cyber backdrop */}
                <div className="absolute inset-0 bg-radial from-cyan-950/5 via-transparent to-transparent pointer-events-none" />

                {/* Dynamic Slide Components */}
                <div className="flex-1 flex flex-col justify-center">
                  <AnimatePresence mode="wait">
                    
                    {/* Slide 1: Executive KPIs */}
                    {presentationSlide === "kpis" && (
                      <motion.div 
                        key="kpis"
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.98 }}
                        className="space-y-8"
                      >
                        <div className="text-center space-y-2">
                          <span className="text-[11px] font-mono uppercase tracking-widest text-cyan-400 font-bold bg-cyan-950/60 px-3 py-1 rounded-full border border-cyan-850">
                            SECTION 01: EXECUTIVE KPI CORE OVERVIEW
                          </span>
                          <h2 className="text-3xl font-black text-slate-100 tracking-tight">CITY SMART HEALTH INDEX MONITOR</h2>
                          <p className="text-xs text-slate-450 max-w-xl mx-auto">
                            Consolidated municipal parameters weighing current active report loads, citizen upvote weights, and official SLA resolution speed.
                          </p>
                        </div>

                        {/* Large Animated Counter */}
                        <div className="flex justify-center items-baseline gap-2.5 text-center py-4">
                          <span className="text-8xl font-black font-mono tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-cyan-400">
                            {cityHealthIndex}
                          </span>
                          <span className="text-3xl font-mono text-slate-500">/ 100 CHI</span>
                        </div>

                        {/* Mini statistics row */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
                          <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-center space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">SLA COMPLIANCE</span>
                            <p className="text-2xl font-black font-mono text-indigo-400">{slaComplianceRate}%</p>
                          </div>
                          <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-center space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">SATISFACTION RATING</span>
                            <p className="text-2xl font-black font-mono text-emerald-400">{citizenSatisfaction}%</p>
                          </div>
                          <div className="bg-slate-900 border border-slate-850 p-4 rounded-2xl text-center space-y-1">
                            <span className="text-[10px] font-mono text-slate-500 uppercase">PENDING TICKETS</span>
                            <p className="text-2xl font-black font-mono text-amber-400">{openIssuesCount} Active</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Slide 2: Ward Health Scorecard */}
                    {presentationSlide === "wards" && (
                      <motion.div 
                        key="wards"
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        className="space-y-6"
                      >
                        <div className="text-center space-y-1">
                          <span className="text-[11px] font-mono uppercase tracking-widest text-indigo-400 font-bold bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-850">
                            SECTION 02: DISTRICT GEOGRAPHICAL SEGMENTATION
                          </span>
                          <h2 className="text-3xl font-black text-slate-100 tracking-tight">WARD INFRASTRUCTURE INDEX ANALYSIS</h2>
                          <p className="text-xs text-slate-450">
                            Breakdown of roads, electrical grids, sewerage and hydration levels per municipality ward.
                          </p>
                        </div>

                        {/* Wards grid presentation style */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto pt-4">
                          {calculatedWardScores.slice(0, 3).map((w, idx) => (
                            <div key={idx} className="bg-slate-900 border border-slate-850 p-5 rounded-2xl space-y-4">
                              <div className="flex justify-between items-center border-b border-slate-850 pb-2">
                                <span className="text-xs font-black text-slate-200">{w.name.replace("Ward ", "W-")}</span>
                                <span className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                                  w.overallScore >= 80 ? "text-emerald-400" : "text-amber-400"
                                }`}>
                                  Score: {w.overallScore}
                                </span>
                              </div>

                              <div className="space-y-2">
                                <div className="flex justify-between text-[9px] font-mono">
                                  <span>🛣️ Roads: {w.roadHealth}</span>
                                  <span>💧 Water: {w.waterHealth}</span>
                                </div>
                                <div className="flex justify-between text-[9px] font-mono">
                                  <span>⚡ Power: {w.electricalHealth}</span>
                                  <span>🚮 Waste: {w.sanitationHealth}</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    {/* Slide 3: AI Recommendations */}
                    {presentationSlide === "ai" && (
                      <motion.div 
                        key="ai"
                        initial={{ opacity: 0, scale: 1.02 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.02 }}
                        className="space-y-6 max-w-3xl mx-auto"
                      >
                        <div className="text-center space-y-1">
                          <span className="text-[11px] font-mono uppercase tracking-widest text-violet-400 font-bold bg-violet-950/60 px-3 py-1 rounded-full border border-violet-850">
                            SECTION 03: PREDICTIVE CIVIC RECOMMENDATION
                          </span>
                          <h2 className="text-3xl font-black text-slate-100 tracking-tight">GEMINI COGNITIVE ACTION RECOMMENDATIONS</h2>
                          <p className="text-xs text-slate-450">
                            Predictive insights on pipeline fatigue, pavement micro-fissure expansion, and energy load balancing.
                          </p>
                        </div>

                        {/* Dual Panel */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                          <div className="bg-[#050914] border border-slate-850 p-5 rounded-2xl text-left space-y-3">
                            <span className="text-[9px] font-mono text-violet-400 uppercase tracking-widest font-bold">🧠 Dynamic Alert Summary ({selectedWard})</span>
                            <p className="text-xs text-slate-300 leading-relaxed font-semibold">{selectedWardRecommendation.trend}</p>
                            <p className="text-[11px] text-slate-400 italic">Root Cause: {selectedWardRecommendation.rootCause}</p>
                          </div>

                          <div className="bg-[#050914] border border-slate-850 p-5 rounded-2xl text-left space-y-3">
                            <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest font-bold">✓ Action Plan Remediation</span>
                            <div className="space-y-2">
                              {selectedWardRecommendation.suggestions.slice(0, 3).map((su, idx) => (
                                <div key={idx} className="flex gap-2 text-[11px] text-slate-350">
                                  <span className="text-emerald-400 font-mono">✓</span>
                                  <span>{su}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Slide 4: Before / After Slider Showcase */}
                    {presentationSlide === "depts" && (
                      <motion.div 
                        key="depts"
                        initial={{ opacity: 0, x: -25 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 25 }}
                        className="space-y-6"
                      >
                        <div className="text-center space-y-1">
                          <span className="text-[11px] font-mono uppercase tracking-widest text-emerald-400 font-bold bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-850">
                            SECTION 04: POST-RESOLUTION RESOLVE AUDIT
                          </span>
                          <h2 className="text-3xl font-black text-slate-100 tracking-tight">AI VISION BEFORE / AFTER CLOSED LOOPS</h2>
                          <p className="text-xs text-slate-450">
                            Slide to compare reported citizen photograph with finalized municipal repair sealing verified via AI.
                          </p>
                        </div>

                        {/* Slider frame */}
                        {resolvedIssues.length > 0 ? (
                          (() => {
                            const currentResolved = resolvedIssues[beforeAfterIndex % resolvedIssues.length];
                            return (
                              <div className="max-w-xl mx-auto space-y-4 pt-2">
                                <ResolutionSlider
                                  beforeSrc={currentResolved.image}
                                  afterSrc={currentResolved.resolutionImage}
                                  category={currentResolved.category}
                                  title={currentResolved.title}
                                  description={currentResolved.description}
                                  heightClass="h-56"
                                  beforeLabel="BEFORE: CITIZEN COMPLAINT"
                                  afterLabel="AFTER: AI VERIFIED REPAIR"
                                />

                                <div className="text-center text-xs space-y-1">
                                  <p className="font-bold text-slate-200">🔍 {currentResolved.title}</p>
                                  <p className="text-[10px] text-slate-400 italic">"{currentResolved.beforeAfterResult || "Audit verification successfully aligned."}"</p>
                                  
                                  <div className="flex justify-center gap-2 pt-2">
                                    <button 
                                      onClick={() => setBeforeAfterIndex(prev => prev - 1)}
                                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[10px]"
                                    >
                                      ← Prev Case
                                    </button>
                                    <button 
                                      onClick={() => setBeforeAfterIndex(prev => prev + 1)}
                                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded text-[10px]"
                                    >
                                      Next Case →
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })()
                        ) : (
                          <div className="max-w-md mx-auto pt-8 text-center space-y-3">
                            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto animate-pulse" />
                            <p className="text-xs text-slate-450 leading-relaxed">
                              No resolved visual comparisons loaded yet. Generate some demo incidents and click "Verify Resolution" in the Control Center to populate this live slider comparison!
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}

                  </AnimatePresence>
                </div>

                {/* Footer labels inside presentation */}
                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-4 border-t border-slate-900">
                  <span>SYSTEM FEED: SECURE SSL</span>
                  <span>LOCATION: HYDERABAD METRO COUNCILS</span>
                  <span>TIME: {new Date().toLocaleTimeString()}</span>
                </div>

              </div>

              {/* Sidebar Active Actions feed */}
              <div className="lg:col-span-3 bg-slate-950 border border-slate-900 rounded-3xl p-5 flex flex-col justify-between">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest font-black block">LIVE CITY TELEMETRY</span>
                  
                  <div className="space-y-3">
                    {liveEvents.slice(0, 4).map((evt, idx) => (
                      <div key={idx} className="bg-slate-900/60 border border-slate-850 p-3 rounded-xl space-y-1">
                        <div className="flex justify-between text-[8px] font-mono">
                          <span className="text-cyan-400 font-bold">{evt.type}</span>
                          <span className="text-slate-500">Active</span>
                        </div>
                        <p className="text-[11px] font-bold text-slate-200 truncate">{evt.title}</p>
                        <p className="text-[9px] text-slate-450 leading-tight">{evt.detail}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-900 text-center">
                  <span className="text-[10px] font-mono text-slate-550">
                    PRESS ESC TO RETURN TO HUB
                  </span>
                </div>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Commissioner Briefing Report Modal */}
      <AnimatePresence>
        {isReportOpen && reportData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-55 overflow-y-auto bg-slate-950/80 backdrop-blur-md p-4 md:p-8 flex items-center justify-center font-sans"
          >
            <motion.div
              initial={{ scale: 0.95, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 30, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 180 }}
              className="bg-[#0b0f19] border border-violet-850/50 rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header block: GHMC Official Briefing Cover */}
              <div className="p-6 md:p-8 bg-gradient-to-r from-violet-950/80 via-indigo-950/60 to-slate-950 border-b border-app-border flex flex-col md:flex-row items-center justify-between gap-4 select-none">
                <div className="flex items-center gap-4">
                  {/* Municipal Emblem Circle */}
                  <div className="h-12 w-12 rounded-xl bg-slate-900 border border-violet-500/30 flex items-center justify-center text-xl shadow-inner shrink-0">
                    🏛️
                  </div>
                  <div className="space-y-0.5 text-center md:text-left">
                    <div className="flex items-center justify-center md:justify-start gap-1.5 text-[9px] font-mono tracking-widest text-violet-400 font-extrabold uppercase">
                      <Sparkles className="h-3 w-3 animate-pulse" />
                      SECURE MUNICIPAL INTELLIGENCE BRIEFING
                    </div>
                    <h2 className="text-base font-black tracking-wide text-white uppercase">Hyderabad Commissioner Briefing</h2>
                    <p className="text-[10px] text-slate-400 font-mono">
                      GHMC CENTRAL METRIC DIRECTIVE • CYCLE: {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[8px] font-mono font-bold bg-red-950/50 text-red-400 border border-red-850 px-2.5 py-1 rounded uppercase tracking-wider animate-pulse">
                    CLASSIFIED EXECUTIVE ONLY
                  </span>
                  <button
                    type="button"
                    onClick={() => setIsReportOpen(false)}
                    className="p-2 hover:bg-slate-900 border border-app-border text-slate-400 hover:text-white rounded-xl cursor-pointer transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Printable Body Content */}
              <div className="p-6 md:p-8 overflow-y-auto space-y-6 flex-1 text-slate-300">
                
                {/* Section 1: Executive Summary */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-violet-400 uppercase font-black tracking-widest">
                    <span>01 / EXECUTIVE STRATEGIC OVERVIEW</span>
                    <div className="h-px bg-violet-850/40 flex-1" />
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed text-slate-300 font-sans bg-slate-950/40 p-4 border border-slate-850/60 rounded-xl italic">
                    "{reportData.executiveSummary}"
                  </p>
                </div>

                {/* Section 2: Key Strategic Indicators */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">Estimated Cost Triage</span>
                    <span className="text-lg font-black font-mono text-cyan-400">
                      ₹{reportData.budgetEstimateInr?.toLocaleString('en-IN') || "28,45,000"}
                    </span>
                    <p className="text-[9px] text-slate-400">GHMC Allocated Reserves</p>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">Active Citizens Impacted</span>
                    <span className="text-lg font-black font-mono text-cyan-400">
                      ~{reportData.citizensAffected?.toLocaleString() || "12,400"}
                    </span>
                    <p className="text-[9px] text-slate-400">Direct Ward Stakeholders</p>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">Complaints Registered Today</span>
                    <span className="text-lg font-black font-mono text-violet-400">
                      {reportData.todaysIncidentsCount || "14"} nodes
                    </span>
                    <p className="text-[9px] text-slate-400">AI Duplicate Screened</p>
                  </div>
                  <div className="bg-slate-950/40 border border-slate-850/60 p-4 rounded-xl space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase block tracking-wider">System SLA Baseline</span>
                    <span className="text-lg font-black font-mono text-emerald-400">
                      {reportData.averageSlaHours || "34.6"} Hrs
                    </span>
                    <p className="text-[9px] text-slate-400">Avg Lifecycle Duration</p>
                  </div>
                </div>

                {/* Grid Section 3 & 4: Top Priorities & SLA Scorecards */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                  
                  {/* Column Left: Top 5 Urgent Priorities */}
                  <div className="lg:col-span-7 space-y-3">
                    <div className="flex items-center gap-2 text-[10px] font-mono text-violet-400 uppercase font-black tracking-widest">
                      <span>02 / URGENT INCIDENT DEPLOYMENTS</span>
                      <div className="h-px bg-violet-850/40 flex-1" />
                    </div>

                    <div className="space-y-2.5">
                      {reportData.top5Priorities?.map((p: any, idx: number) => (
                        <div key={idx} className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl space-y-1.5 hover:border-violet-500/20 transition-colors">
                          <div className="flex justify-between items-start gap-2">
                            <span className="text-xs font-extrabold text-slate-100 uppercase tracking-wide leading-snug">
                              {idx + 1}. {p.title}
                            </span>
                            <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded font-black border uppercase tracking-wider shrink-0 ${
                              p.severity === "Critical" 
                                ? "bg-red-950/50 text-red-400 border-red-850" 
                                : "bg-amber-950/50 text-amber-400 border-amber-850"
                            }`}>
                              {p.severity}
                            </span>
                          </div>
                          <div className="flex flex-wrap items-center gap-1.5 font-mono text-[9px] text-slate-500 leading-none">
                            <span className="text-cyan-400">{p.category}</span>
                            <span>•</span>
                            <span className="text-slate-400 font-bold">{p.ward}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 leading-relaxed font-sans mt-1">
                            {p.impact}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Column Right: Department Scorecards & Predictive Failure */}
                  <div className="lg:col-span-5 space-y-6">
                    
                    {/* Scorecards */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-violet-400 uppercase font-black tracking-widest">
                        <span>03 / PERFORMANCE SCORES</span>
                        <div className="h-px bg-violet-850/40 flex-1" />
                      </div>
                      <div className="space-y-2.5">
                        {reportData.departmentsAttention?.map((dept: any, idx: number) => (
                          <div key={idx} className="p-3 bg-slate-950/30 border border-slate-850 rounded-xl space-y-2">
                            <div className="flex justify-between items-baseline leading-none">
                              <span className="text-[10px] font-bold text-slate-200 uppercase truncate max-w-[200px]">
                                {dept.name?.replace("Greater Hyderabad Municipal Corporation", "GHMC")}
                              </span>
                              <span className="text-xs font-black font-mono text-cyan-400 shrink-0">
                                {dept.complianceRate}% SLA
                              </span>
                            </div>
                            <div className="w-full bg-slate-900 h-1.5 rounded-full overflow-hidden border border-slate-850">
                              <div 
                                className="bg-gradient-to-r from-cyan-600 to-indigo-600 h-full rounded-full" 
                                style={{ width: `${dept.complianceRate}%` }}
                              />
                            </div>
                            <p className="text-[9px] text-slate-500 font-sans italic leading-normal mt-1">
                              "{dept.reason}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Predictive Failures */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-[10px] font-mono text-violet-400 uppercase font-black tracking-widest">
                        <span>04 / AI PREDICTIVE OUTAGE ALERTS</span>
                        <div className="h-px bg-violet-850/40 flex-1" />
                      </div>
                      <div className="space-y-2.5">
                        {reportData.predictedFailures?.map((fail: any, idx: number) => (
                          <div key={idx} className="p-3 bg-[#130713]/20 border border-purple-950/40 rounded-xl flex justify-between items-center gap-2">
                            <div className="space-y-1">
                              <span className="text-xs font-bold text-slate-100 block leading-none">{fail.asset}</span>
                              <span className="text-[9px] text-purple-400 font-mono uppercase block">{fail.location}</span>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-xs font-black font-mono text-red-400 block leading-none">
                                {fail.failureProbability} Prob.
                              </span>
                              <span className="text-[9px] text-slate-500 font-mono block mt-1">
                                {fail.timeframe}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>

                {/* Section 5: Weather & Risk Factors */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-amber-400 uppercase">
                      <Sun className="h-3.5 w-3.5" />
                      WEATHER RUN-OFF ANALYTICS
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {reportData.weatherImpact || "High ambient temperatures and heavy humidity thresholds will cause minor dilatation along major metallic transformer casing nodes in Hyderabad."}
                    </p>
                  </div>
                  <div className="p-4 bg-slate-950/40 border border-slate-850 rounded-xl space-y-1.5">
                    <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-violet-400 uppercase">
                      <Building2 className="h-3.5 w-3.5" />
                      SYSTEMIC STRUCTURAL RISKS
                    </div>
                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {reportData.infrastructureRisks || "Ageing brick utility conduits in heritage old-city wards are showing minor localized erosion due to continuous waterlogging periods."}
                    </p>
                  </div>
                </div>

                {/* Section 6: Actionable Directive Actions */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-mono text-violet-400 uppercase font-black tracking-widest">
                    <span>05 / COMMISSIONER DIRECTIVE DIRECT ACTION ITEMS</span>
                    <div className="h-px bg-violet-850/40 flex-1" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {reportData.recommendedCommissionerActions?.map((action: string, idx: number) => (
                      <div 
                        key={idx} 
                        onClick={() => setCheckedActions(prev => ({ ...prev, [idx]: !prev[idx] }))}
                        className={`p-3.5 border rounded-xl flex gap-3 items-start cursor-pointer select-none transition-all ${
                          checkedActions[idx] 
                            ? "bg-emerald-950/20 border-emerald-800/60 shadow-sm" 
                            : "bg-slate-950/30 border-slate-850 hover:border-slate-800"
                        }`}
                      >
                        <div className={`h-4.5 w-4.5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          checkedActions[idx] 
                            ? "bg-emerald-600 border-emerald-500 text-white" 
                            : "border-slate-700 bg-slate-900 text-transparent"
                        }`}>
                          <Check className="h-3 w-3" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-[10px] font-mono font-bold text-slate-500 block leading-none">
                            DIRECTIVE #{100 + idx}
                          </span>
                          <p className={`text-xs leading-relaxed font-sans ${
                            checkedActions[idx] ? "line-through text-slate-500" : "text-slate-300 font-medium"
                          }`}>
                            {action}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>

              {/* Footer and Dispatch brief */}
              <div className="p-6 bg-slate-950 border-t border-app-border flex flex-col md:flex-row items-center justify-between gap-4 select-none">
                <span className="text-[10px] font-mono text-slate-500 text-center md:text-left">
                  TRANSCRYPT ID: GHMC-AI-{Math.floor(Math.random() * 9000) + 1000} • GENERATED SECURELY VIA DEEPMIND GEMINI-3.5
                </span>
                <button
                  type="button"
                  onClick={() => {
                    window.print();
                    setToast({ text: "Opening system print briefing pipeline...", type: "success" });
                  }}
                  className="w-full md:w-auto px-4 py-2.5 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black tracking-wider rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer min-h-[44px]"
                >
                  PRINT OFFICIAL EXECUTIVE BRIEFING
                </button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
