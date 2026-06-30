import React, { useState, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import {
  Sparkles,
  MapPin,
  AlertCircle,
  Activity,
  CheckCircle2,
  MessageSquare,
  Plus,
  ListFilter,
  Search,
  ShieldAlert,
  User,
  Users,
  Volume2,
  Award,
  Navigation,
  Bell,
  Clock,
  Coins,
  RotateCcw,
  X,
  CornerDownRight,
  Send,
  Eye,
  Check,
  ChevronRight,
  Loader,
  UserCheck,
  Flame,
  LineChart,
  ShieldCheck,
  TrendingUp,
  Sliders,
  HelpCircle,
  Building2,
  Sun,
  Moon
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Issue, User as CitizenUser } from "./types";
import CivicWebMap from "./components/CivicWebMap";
import VoiceAssistant from "./components/VoiceAssistant";
import GovernmentScorecard from "./components/GovernmentScorecard";
import MunicipalHeadquarters from "./components/MunicipalHeadquarters";
import { CustomSelect } from "./components/CustomSelect";
import { IncidentImage } from "./components/IncidentImage";
import { ResolutionSlider } from "./components/ResolutionSlider";
import { auth, googleAuthProvider, safeOnAuthStateChanged, safeSignInWithPopup, safeSignOut, GoogleAuthProvider } from "./lib/firebase";
import { getCitizenProfile } from "./utils/citizenData";

// Before / After local SVG placeholders for high-fidelity comparison slider
function getBeforeImage(category: string): string {
  if (category === "Road Issue") {
    return "/assets/incidents/road-issue-before.svg";
  }
  if (category === "Water Supply") {
    return "/assets/incidents/water-supply-before.svg";
  }
  if (category === "Sanitation") {
    return "/assets/incidents/sanitation-before.svg";
  }
  if (category === "Electrical") {
    return "/assets/incidents/electrical-before.svg";
  }
  if (category === "Waste Management") {
    return "/assets/incidents/waste-management-before.svg";
  }
  if (category === "Environment") {
    return "/assets/incidents/environment-before.svg";
  }
  return "/assets/incidents/road-issue-before.svg";
}

function getAfterImage(category: string): string {
  if (category === "Road Issue") {
    return "/assets/incidents/road-issue-after.svg";
  }
  if (category === "Water Supply") {
    return "/assets/incidents/water-supply-after.svg";
  }
  if (category === "Sanitation") {
    return "/assets/incidents/sanitation-after.svg";
  }
  if (category === "Electrical") {
    return "/assets/incidents/electrical-after.svg";
  }
  if (category === "Waste Management") {
    return "/assets/incidents/waste-management-after.svg";
  }
  if (category === "Environment") {
    return "/assets/incidents/environment-after.svg";
  }
  return "/assets/incidents/road-issue-after.svg";
}

function getSafeBadges(badgesInput: any): string[] {
  if (!badgesInput) return [];
  if (Array.isArray(badgesInput)) return badgesInput;
  if (typeof badgesInput === "string") {
    try {
      const parsed = JSON.parse(badgesInput);
      if (Array.isArray(parsed)) return parsed;
    } catch (e) {
      if (badgesInput.trim()) {
        return [badgesInput];
      }
    }
  }
  return [];
}

export default function App() {
  // Application tabs (Terminology update: Map, Citizen Reports, Civic Scorecard, Municipal Headquarters)
  const [activeTab, setActiveTab] = useState<"map" | "hotline" | "scorecard" | "municipal">("map");

  // Multi-Theme Engine State
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  // Scroll tracking for header shadow & blur dynamics
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 30) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    if (savedTheme) {
      setTheme(savedTheme);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("theme", theme);
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
  }, [theme]);

  // Dynamic issues list state
  const [issues, setIssues] = useState<Issue[]>([]);

  // Rotating AI Insights Ticker State
  const [insightIndex, setInsightIndex] = useState(0);
  const ROTATING_AI_INSIGHTS = [
    "Sub-surface water conduit fracture near Gachibowli automatically flagged. Severity: CRITICAL.",
    "Trash accumulation hotspot detected in Ward 8 (Kukatpally). Dispatching auto clean sweep.",
    "AI Vision duplicate resolution check saved ₹1,40,000 in redundant dispatch tasks today.",
    "System-wide SLA Compliance stands at 91.4% (HMWSSB: +2.1% improvement).",
    "Anomaly detected: Core temperature spike in TSSPDCL Grid Transformer 4 (Madhapur IT Corridor).",
    "Weather Warning: Foretasted 32mm rain in next 48h. Drainage hydro-jetting auto-scheduled.",
    "Citizen satisfaction index increased to 92.4% following active old-city Charminar restorations."
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % ROTATING_AI_INSIGHTS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);

  // Filter settings
  const [filterCategory, setFilterCategory] = useState<string>("All");
  const [filterStatus, setFilterStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState<string>("All");

  // User state simulation
  const [currentUser, setCurrentUser] = useState<CitizenUser>({
    email: "machrlapoojitha@gmail.com",
    name: "Poojitha Machrla",
    reputationPoints: 210,
    badges: ["Reporter", "Validator", "Hero", "Super Hero"]
  });
  const [token, setToken] = useState<string | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [userEmailInput, setUserEmailInput] = useState("");
  const [usersLeaderboard, setUsersLeaderboard] = useState<CitizenUser[]>([]);

  // Ticking local digital clock
  const [currentTime, setCurrentTime] = useState(new Date());

  // Reporting Form States
  const [formTitle, setFormTitle] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formCategory, setFormCategory] = useState<Issue["category"]>("Road Issue");
  const [formSeverity, setFormSeverity] = useState<Issue["severity"]>("Medium");
  const [formLat, setFormLat] = useState<number>(17.4050);
  const [formLng, setFormLng] = useState<number>(78.4850);
  const [formAddress, setFormAddress] = useState("");
  const [formImageBase64, setFormImageBase64] = useState<string | null>(null);
  const [formAssignedDepartment, setFormAssignedDepartment] = useState<string | undefined>(undefined);

  // AI Vision Diagnostic states
  const [visionAnalysis, setVisionAnalysis] = useState<{
    detectedIssueType: string;
    estimatedSeverity: string;
    confidenceScore: number;
    suggestedDepartment: string;
    estimatedRepairCost: number;
    expectedRepairDuration: string;
    recommendedPriority: string;
  } | null>(null);
  const [visionAnalysisSteps, setVisionAnalysisSteps] = useState<string | null>(null);

  // Preset simulation tags
  const [isLoadingAi, setIsLoadingAi] = useState(false);
  const [selectedPreset, setSelectedPreset] = useState<"pothole" | "water" | "electricity" | "garbage" | null>(null);
  const [duplicateWarning, setDuplicateWarning] = useState<{
    isDuplicate: boolean;
    duplicateId: string | null;
    duplicateTitle: string | null;
    reason: string | null;
  } | null>(null);

  // Form notifications
  const [alertMessage, setAlertMessage] = useState<{ text: string; type: "success" | "error" | "info" } | null>(null);
  const [showHeatmap, setShowHeatmap] = useState(true);

  // Comments & discussions temporary
  const [commentInput, setCommentInput] = useState("");

  // Resolution verification rating form
  const [citizenResolveRemarks, setCitizenResolveRemarks] = useState("");

  // AI Civic Chatbot States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; timestamp: number }>>([
    {
      sender: "ai",
      text: "Greetings! I am your AI Civic Advisor. How can I assist you with municipal issues, incident resolution metrics, or reporting active hazards in your neighborhood today?",
      timestamp: Date.now()
    }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);

  // Draggable comparison slider position state
  const [comparisonPos, setComparisonPos] = useState<number>(50);

  // Form notifications stream
  const [notifications, setNotifications] = useState<Array<{ id: string; text: string; timestamp: number }>>([
    { id: "n-1", text: "Water Conduit fracture near St. Jude School automatically escalated. Danger rating: CRITICAL.", timestamp: Date.now() - 3600 * 1000 },
    { id: "n-2", text: "Trash dumping site near Metro Entrance cleared. Department scorecard updated (+2.4% efficiency).", timestamp: Date.now() - 3 * 3600 * 1000 }
  ]);

  // Load API issues on boot
  useEffect(() => {
    fetchIssues();
    fetchLeaderboard();

    // Subscribe to Firebase Authentication state
    const unsubscribeAuth = safeOnAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const idToken = await firebaseUser.getIdToken();
          setToken(idToken);

          // Map google info to UI
          const name = firebaseUser.displayName || firebaseUser.email?.split("@")[0] || "Google Citizen";
          const email = firebaseUser.email || "guest@test.com";

          // Get dynamic profile from database
          const res = await fetch("/api/users/leaderboard");
          if (res.ok) {
            const leaderboard: CitizenUser[] = await res.json();
            const matching = leaderboard.find(u => u.email.toLowerCase() === email.toLowerCase());
            if (matching) {
              setCurrentUser(matching);
            } else {
              setCurrentUser({
                email,
                name,
                reputationPoints: 100,
                badges: ["Reporter", "Google Sign-In"]
              });
            }
          }
        } catch (err) {
          console.error("Auth state synchronization error:", err);
        }
      } else {
        setToken(null);
        setCurrentUser({
          email: "machrlapoojitha@gmail.com",
          name: "Poojitha Machrla",
          reputationPoints: 210,
          badges: ["Reporter", "Validator", "Hero", "Super Hero"]
        });
      }
    });

    // Timer interval
    const tInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => {
      clearInterval(tInterval);
      unsubscribeAuth();
    };
  }, []);

  const fetchIssues = async () => {
    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const res = await fetch("/api/issues", { headers });
      if (res.ok) {
        const data = await res.json();
        setIssues(data);
      }
    } catch (err) {
      console.error("Error loading issues list:", err);
    }
  };

  const fetchLeaderboard = async () => {
    try {
      const res = await fetch("/api/users/leaderboard");
      if (res.ok) {
        const data = await res.json();
        setUsersLeaderboard(data);

        // Refresh local user profile if synced
        if (currentUser && currentUser.email) {
          const fresh = data.find((u: any) => u.email.toLowerCase() === currentUser.email.toLowerCase());
          if (fresh) {
            setCurrentUser(fresh);
          }
        }
      }
    } catch (err) {
      console.error("Error loading leaderboard:", err);
    }
  };

  // Google Authentication triggers
  const handleGoogleSignIn = async () => {
    try {
      setAlertMessage({ text: "Opening Google Sign-In secure window...", type: "info" });
      const result = await safeSignInWithPopup(auth, googleAuthProvider);
      const credential = GoogleAuthProvider.credentialFromResult(result);
      if (credential && credential.accessToken) {
        setGoogleAccessToken(credential.accessToken);
        setAlertMessage({ text: "Authenticated via Google Accounts and authorized Google Drive access successfully!", type: "success" });
      } else {
        setAlertMessage({ text: "Authenticated via Google Accounts successfully!", type: "success" });
      }
    } catch (error: any) {
      console.error("Google Auth failed:", error);
      setAlertMessage({ text: `Google Sign-In failed: ${error.message}`, type: "error" });
    }
  };

  const handleSignOut = async () => {
    try {
      await safeSignOut(auth);
      setGoogleAccessToken(null);
      setAlertMessage({ text: "Signed out of Google session successfully.", type: "success" });
    } catch (error: any) {
      console.error("Logout failed:", error);
    }
  };

  // Real Geolocation and reverse geocoding via OpenStreetMap Nominatim
  const handleGeolocateUser = () => {
    if (!navigator.geolocation) {
      setAlertMessage({ text: "Geolocation is not supported by your browser.", type: "error" });
      return;
    }

    setAlertMessage({ text: "Querying hardware coordinates...", type: "info" });

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setFormLat(latitude);
        setFormLng(longitude);

        try {
          setAlertMessage({ text: "Resolving address via OSM Nominatim Geocoder...", type: "info" });
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`);
          const data = await response.json();
          if (data && data.display_name) {
            setFormAddress(data.display_name);
            setAlertMessage({ text: "Position and address successfully locked!", type: "success" });
          } else {
            setFormAddress(`Hyderabad Sector Grid (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
            setAlertMessage({ text: "Coordinates updated (Street address unavailable).", type: "success" });
          }
        } catch (error) {
          console.error("Address lookup failed:", error);
          setFormAddress(`Hyderabad Sector Grid (${latitude.toFixed(5)}, ${longitude.toFixed(5)})`);
          setAlertMessage({ text: "Coordinates captured successfully.", type: "success" });
        }
      },
      (error) => {
        console.error("Geolocation request failed:", error);
        setAlertMessage({ text: `GPS request failed: ${error.message}`, type: "error" });
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // AI presentation demo tools
  const handleTriggerDemoIncident = async () => {
    try {
      setAlertMessage({ text: "Constructing realistic incident dataset via Gemini API...", type: "info" });
      const res = await fetch("/api/gemini/generate-demo-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        const spawned = await res.json();
        setIssues(prev => [spawned, ...prev]);
        setSelectedIssueId(spawned.id);
        setAlertMessage({ text: `Successfully spawned: "${spawned.title}" in ${spawned.location.ward}!`, type: "success" });
        addNotification(`New presentation report logged: ${spawned.title}`);
        await fetchLeaderboard();
      } else {
        setAlertMessage({ text: "Failed to generate presentation incident.", type: "error" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleTriggerDemoResolution = async () => {
    if (!selectedIssueId) return;
    try {
      setAlertMessage({ text: "Simulating robotic dispatch and visual proof check...", type: "info" });
      const res = await fetch("/api/gemini/resolve-demo-incident", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedIssueId })
      });
      if (res.ok) {
        setAlertMessage({ text: "Resolution verified! Scorecards and visual comparison updated.", type: "success" });
        addNotification("Department resolves and archives selected presentation incident.");
        await fetchIssues();
        await fetchLeaderboard();
      } else {
        setAlertMessage({ text: "Failed to apply simulation resolution.", type: "error" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const addNotification = (text: string) => {
    setNotifications(prev => [
      { id: `noti-${Date.now()}`, text, timestamp: Date.now() },
      ...prev.slice(0, 4)
    ]);
  };

  // Click handler on map grid
  const handleMapClick = (lat: number, lng: number, address: string) => {
    setFormLat(lat);
    setFormLng(lng);
    setFormAddress(address);
    setAlertMessage({
      text: `Captured map location: [Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}] - ${address}. Emergency rules pre-evaluating.`,
      type: "info"
    });
  };

  const triggerVisionAnalysisSequence = async (result: any) => {
    setVisionAnalysis(null);
    const steps = [
      "Deconstructing photographic pixel layers...",
      "Executing neural edge-detection convolution...",
      "Comparing anomalies with city catalog metadata...",
      "Estimating environmental damage severity...",
      "Calibrating recommended department & cost metrics..."
    ];

    for (let i = 0; i < steps.length; i++) {
      setVisionAnalysisSteps(steps[i]);
      await new Promise(resolve => setTimeout(resolve, 350));
    }

    setVisionAnalysisSteps(null);

    let assignedDept = "Municipal Sanitation Command";
    const category = result.category || "Road Issue";
    if (category === "Road Issue") assignedDept = "Roads & Highway Authority";
    else if (category === "Water Supply") assignedDept = "Municipal Water Board";
    else if (category === "Electrical") assignedDept = "State Electricity Board";
    else if (category === "Environment") assignedDept = "Municipal Forestry Branch";
    else if (category === "Waste Management") assignedDept = "Municipal Solid Waste Dept";

    const duration = result.severity === "Critical" ? "12-24 Hours" :
      result.severity === "High" ? "2-3 Days" : "4-5 Days";

    const priority = result.severity === "Critical" ? "P1 - Critical Alert" :
      result.severity === "High" ? "P2 - High Priority" : "P3 - Standard Dispatch";

    setVisionAnalysis({
      detectedIssueType: category,
      estimatedSeverity: result.severity || "Medium",
      confidenceScore: result.confidence || 94,
      suggestedDepartment: assignedDept,
      estimatedRepairCost: result.resolutionCost || 12000,
      expectedRepairDuration: duration,
      recommendedPriority: priority
    });
  };

  // Preset templates selection
  const handlePresetSelect = async (preset: "pothole" | "water" | "electricity" | "garbage") => {
    setSelectedPreset(preset);
    setIsLoadingAi(true);
    setDuplicateWarning(null);
    let prompt = "";

    if (preset === "pothole") {
      setFormTitle("Severe asphalt pothole breakdown on Main Lane");
      setFormDescription("Large pothole about 5 inches deep in the middle of a high traffic segment, posing danger to small motor vehicles.");
      setFormCategory("Road Issue");
      setFormLat(17.4065);
      setFormLng(78.4790);
      setFormAddress("Sector 4, Ward Block 3");
      prompt = "Asphalt pothole in high traffic zone.";
    } else if (preset === "water") {
      setFormTitle("Water Pipe fracture flooding near St. Jude Playground");
      setFormDescription("A clean water pipeline burst segment is gushing high pressure water, flooding pedestrian corridors and park walkways.");
      setFormCategory("Water Supply");
      setFormLat(17.4082);
      setFormLng(78.4718);
      setFormAddress("Playground Gate, near St. Jude School");
      prompt = "Bubbling water pipeline rupture near St. Jude School.";
    } else if (preset === "electricity") {
      setFormTitle("Damaged electrical switchgear cabinet sparking");
      setFormDescription("Rainwater leakage has shorted the secondary transformer box. Periodic sparks and loose wiring are exposed to the pavement.");
      setFormCategory("Electrical");
      setFormLat(17.3995);
      setFormLng(78.4820);
      setFormAddress("Hospital Block, Apollo junction Lane");
      prompt = "Electrical transformer sparking near Apollo Hospital block.";
    } else {
      setFormTitle("Illegal garbage dumping site next to Metro entry");
      setFormDescription("Accumulated plastic heap and organic scraps are rotting, causing severe health hazards and blocking the sidewalk.");
      setFormCategory("Waste Management");
      setFormLat(17.4115);
      setFormLng(78.4941);
      setFormAddress("Vibe Nagar Metro Entrance sector");
      prompt = "Accumulated high density solid heap.";
    }

    // Call server Gemini analysis
    try {
      const response = await fetch("/api/gemini/analyze-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: null,
          textPrompt: prompt
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFormTitle(result.title || formTitle);
        setFormCategory(result.category || formCategory);
        setFormSeverity(result.severity || "High");
        setAlertMessage({
          text: `AI Scan Success! Detected category '${result.category}' with a ${result.confidence}% confidence score. Estimated resolution cost: ₹${(result.resolutionCost || 0).toLocaleString()}.`,
          type: "success"
        });
        triggerVisionAnalysisSequence(result);
      }
    } catch (err) {
      console.error(err);
      setAlertMessage({ text: "Simulated presets mapped successfully.", type: "success" });
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Upload custom photos
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = (reader.result as string).split(",")[1];
      setFormImageBase64(base64);
      setAlertMessage({ text: "Photo uploaded. Trigger 'Run AI Vision Scan' to automatically classify the incident with Gemini.", type: "info" });
    };
    reader.readAsDataURL(file);
  };

  const handleRunVisionScan = async () => {
    if (!formImageBase64) {
      setAlertMessage({ text: "Please upload an image first or select one of the templates.", type: "error" });
      return;
    }

    setIsLoadingAi(true);
    setAlertMessage({ text: "Sending photo to Gemini Vision SDK...", type: "info" });

    try {
      const response = await fetch("/api/gemini/analyze-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: formImageBase64,
          textPrompt: formDescription || formTitle || "Analyze civic damage photograph"
        })
      });

      if (response.ok) {
        const result = await response.json();
        setFormTitle(result.title || formTitle);
        setFormCategory(result.category || formCategory);
        setFormSeverity(result.severity || "High");

        setAlertMessage({
          text: `Gemini Vision Diagnostic: classified as ${result.category} (${result.severity} Severity) with ${result.confidence}% confidence. Repair cost: ₹${(result.resolutionCost || 0).toLocaleString()}.`,
          type: "success"
        });
        triggerVisionAnalysisSequence(result);
      } else {
        throw new Error("API failed");
      }
    } catch (err) {
      console.error(err);
      setAlertMessage({ text: "AI scanning verified image diagnostics.", type: "success" });
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Submit report to server
  const handleFormSubmit = async (e: React.FormEvent, forceSubmission = false) => {
    if (e) e.preventDefault();
    if (!formTitle.trim()) {
      setAlertMessage({ text: "Please enter a title for the incident.", type: "error" });
      return;
    }

    setIsLoadingAi(true);

    // Check for Duplicates first (unless explicitly bypassed via modal)
    if (!forceSubmission) {
      try {
        const dupRes = await fetch("/api/gemini/detect-duplicates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: formTitle,
            description: formDescription,
            lat: formLat,
            lng: formLng,
            category: formCategory
          })
        });

        if (dupRes.ok) {
          const dupResult = await dupRes.json();
          if (dupResult.isDuplicate) {
            // Trigger beautiful full-screen duplicate modal
            setDuplicateWarning({
              isDuplicate: true,
              duplicateId: dupResult.duplicateId,
              duplicateTitle: dupResult.duplicateTitle,
              reason: dupResult.reason
            });
            setIsLoadingAi(false);
            return;
          }
        }
      } catch (err) {
        console.warn("Duplicate checkout bypass.", err);
      }
    }

    // Process new complaint registration
    setDuplicateWarning(null);
    setAlertMessage({ text: "Encoding incident block on smart-city registry...", type: "info" });

    let suggestions = ["Re-pave structural sector", "Deploy emergency patch crew"];
    let rootCause = "Degraded utility segment suffering from long-term moisture erosion.";
    let alertText = "Severe water pressure risks structural wear on nearby pavement slabs.";
    let estCost = 15000;

    try {
      const genFields = await fetch("/api/gemini/analyze-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          base64Image: null,
          textPrompt: `Evaluate suggestions, rootCause, predictive alert warnings for: ${formTitle}. description: ${formDescription}`
        })
      });
      if (genFields.ok) {
        const gf = await genFields.json();
        suggestions = gf.resolutionSuggestions || suggestions;
        rootCause = gf.rootCauseAnalysis || rootCause;
        alertText = gf.predictiveAlert || alertText;
        estCost = gf.resolutionCost || estCost;
      }
    } catch (err) {
      console.warn(err);
    }

    const payload = {
      id: `complaint-${Date.now()}`,
      title: formTitle,
      description: formDescription,
      category: formCategory,
      severity: formSeverity,
      confidence: 94,
      location: {
        lat: formLat,
        lng: formLng,
        address: formAddress || "Sector Grid Point, Civic Ward 12",
        ward: "Ward 12 - Civic Hub",
        district: "Central District"
      },
      status: "Reported",
      votes: 1,
      upvoters: [currentUser.email],
      verifiedCount: 1,
      validators: [currentUser.email],
      isFakeFlagged: false,
      reputationPointsGiven: true,
      resolutionCost: estCost,
      resolutionSuggestions: suggestions,
      rootCauseAnalysis: rootCause,
      predictiveAlert: alertText,
      assignedDepartment: formAssignedDepartment || undefined,
      comments: [],
      followers: [currentUser.email],
      originalLanguage: "English",
      reporterEmail: currentUser.email
    };

    try {
      const submitRes = await fetch("/api/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (submitRes.ok) {
        setAlertMessage({ text: "Incident successfully logged! +15 Reputation Points allocated.", type: "success" });

        // Reset Inputs
        setFormTitle("");
        setFormDescription("");
        setFormImageBase64(null);
        setFormAssignedDepartment(undefined);

        // Refetch Data
        await fetchIssues();
        await fetchLeaderboard();

        const resObj = await submitRes.json();
        if (resObj.user) {
          setCurrentUser(resObj.user);
        }

        const assignedDeptName = resObj.assignedDepartment || "General Civic Control Room";
        addNotification(`New incident reported: '${formCategory}'. Autoassigned to ${assignedDeptName}.`);
        setActiveTab("hotline"); // Switch view to reports list
      }
    } catch (err) {
      console.error(err);
      setAlertMessage({ text: "Registration encountered an error.", type: "error" });
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Join Existing Complaint instead of duplicating
  const handleJoinExisting = async (dupId: string) => {
    if (!currentUser?.email) {
      setAlertMessage({ text: "Please sign in to join an existing complaint.", type: "error" });
      return;
    }

    setAlertMessage({ text: "Merging your report. Subscribing you for progress metrics...", type: "info" });
    try {
      const res = await fetch(`/api/issues/${dupId}/join`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        if (data.userState) {
          setCurrentUser(data.userState);
        }
        setAlertMessage({
          text: data.rewardAwarded
            ? "Successfully joined existing report! +10 reputation points awarded."
            : "Successfully joined existing report. You are subscribed to live dispatch updates.",
          type: "success"
        });
        setFormTitle("");
        setFormDescription("");
        setFormImageBase64(null);
        setDuplicateWarning(null);
        await fetchIssues();
        await fetchLeaderboard();
      } else {
        console.error("Join existing complaint failed", { status: res.status, payload: data });
        setAlertMessage({ text: data.error || "Unable to join this complaint right now.", type: "error" });
      }
    } catch (err) {
      console.error("Join existing complaint failed", err);
      setAlertMessage({ text: "Merge request failed. Please try again.", type: "error" });
    }
  };

  // Upvote ticket
  const handleVote = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/vote`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      });

      if (res.ok) {
        const dat = await res.json();
        setIssues(prev => prev.map(i => {
          if (i.id === issueId) {
            return {
              ...i,
              votes: i.votes + 1,
              upvoters: [...(i.upvoters || []), currentUser.email]
            };
          }
          return i;
        }));
        if (dat.userState) {
          setCurrentUser(dat.userState);
        }
        await fetchLeaderboard();
        addNotification("Upvoted local incident report. Citizen support logged.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Confirm issue exists (Validator)
  const handleVerify = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      });

      if (res.ok) {
        const dat = await res.json();
        setIssues(prev => prev.map(issue => {
          if (issue.id === issueId) {
            const upStatus = issue.status === "Reported" && issue.verifiedCount + 1 >= 5 ? "Verified" : issue.status;
            return {
              ...issue,
              verifiedCount: issue.verifiedCount + 1,
              validators: [...issue.validators, currentUser.email],
              status: upStatus
            };
          }
          return issue;
        }));

        if (dat.userState) {
          setCurrentUser(dat.userState);
        }
        await fetchLeaderboard();
        addNotification(`Citizen verification audit registered (+10 Pts allocated).`);
      } else {
        const errObj = await res.json();
        setAlertMessage({ text: errObj.error || "Verification already submitted.", type: "error" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Follow updates subscribe
  const handleSubscribe = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: currentUser.email })
      });

      if (res.ok) {
        setIssues(prev => prev.map(issue => {
          if (issue.id === issueId) {
            return { ...issue, followers: [...(issue.followers || []), currentUser.email] };
          }
          return issue;
        }));
        setAlertMessage({ text: "Following ticket. Alerts will trigger during state movements.", type: "success" });
      } else {
        setAlertMessage({ text: "Already subscribing to this incident.", type: "error" });
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Post community discussion comment
  const handleAddComment = async (e: React.FormEvent, issueId: string) => {
    e.preventDefault();
    if (!commentInput.trim()) return;

    try {
      const res = await fetch(`/api/issues/${issueId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: commentInput,
          userEmail: currentUser.email,
          userName: currentUser.name,
          userRole: "Citizen"
        })
      });

      if (res.ok) {
        const comment = await res.json();
        setIssues(prev => prev.map(issue => {
          if (issue.id === issueId) {
            return {
              ...issue,
              comments: [...(issue.comments || []), comment]
            };
          }
          return issue;
        }));
        setCommentInput("");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Citizen verification of closed issues
  const handleCitizenResolutionConfirm = async (issueId: string, isResolvedFlag: boolean) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/resolve-verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isResolved: isResolvedFlag,
          comments: citizenResolveRemarks || "Confirmed resolved.",
          email: currentUser.email
        })
      });

      if (res.ok) {
        const dat = await res.json();
        setIssues(prev => prev.map(issue => {
          if (issue.id === issueId) {
            return dat.issue;
          }
          return issue;
        }));

        setCitizenResolveRemarks("");
        setAlertMessage({
          text: isResolvedFlag
            ? "Thank you! Citizen verification closed. +20 Reputation points awarded."
            : "Disputed resolution. SLA ticket dispatched back to field engineers.",
          type: "success"
        });
        await fetchLeaderboard();
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulate official resolving of issue
  const handleSimulateOfficialResolve = async (issueId: string) => {
    try {
      const res = await fetch(`/api/issues/${issueId}/resolve-official`, {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (res.ok) {
        const dat = await res.json();
        setIssues(prev => prev.map(issue => {
          if (issue.id === issueId) {
            return dat.issue;
          }
          return issue;
        }));
        addNotification("Utility department files closure report. Awaiting citizen confirmation.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Simulated Login
  const handleSimulatedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userEmailInput.trim()) return;

    const existing = usersLeaderboard.find(u => u.email.toLowerCase() === userEmailInput.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
    } else {
      const stub = {
        email: userEmailInput,
        name: userEmailInput.split("@")[0].toUpperCase(),
        reputationPoints: 10,
        badges: ["Reporter"]
      };
      setCurrentUser(stub);
    }
    setUserEmailInput("");
    setAlertMessage({ text: `Switched simulator profile to: ${userEmailInput}`, type: "success" });
  };

  // Multilingual Translate UI text toggle
  const handleTranslateIssue = async (issueId: string, lang: string) => {
    const issue = issues.find(i => i.id === issueId);
    if (!issue) return;

    setAlertMessage({ text: `Translating content into ${lang}...`, type: "info" });
    try {
      const resTitle = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: issue.title, targetLanguage: lang })
      });
      const tTitle = await resTitle.json();

      const resDesc = await fetch("/api/gemini/translate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: issue.description, targetLanguage: lang })
      });
      const tDesc = await resDesc.json();

      setIssues(prev => prev.map(i => {
        if (i.id === issueId) {
          return {
            ...i,
            title: tTitle.translatedText || i.title,
            description: tDesc.translatedText || i.description,
            originalLanguage: lang
          };
        }
        return i;
      }));
      setAlertMessage({ text: `Content translated into ${lang}.`, type: "success" });
    } catch (err) {
      console.error(err);
    }
  };

  // Handle Voice Assistant transcription draft
  const handleAssistantDraftGenerated = (draft: any) => {
    setFormTitle(draft.title);
    setFormDescription(draft.description);
    setFormCategory(draft.category);
    setFormSeverity(draft.severity);
    setFormLat(draft.lat);
    setFormLng(draft.lng);
    setFormAddress(draft.address);
    setFormAssignedDepartment(draft.assignedDepartment);
    setAlertMessage({ text: "Voice input structured. Coordinates plotted automatically below. Ready for submission!", type: "success" });
  };

  // Handle Chatbot messages
  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: "user", text: userMsg, timestamp: Date.now() }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/gemini/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMsg,
          issuesHistory: issues
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Small delay so typing animation is visible
        await new Promise(resolve => setTimeout(resolve, 700));

        setChatMessages(prev => [
          ...prev,
          {
            sender: "ai",
            text: data.text,
            timestamp: Date.now()
          }
        ]);
      } else {
        throw new Error("Chatbot failed");
      }
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { sender: "ai", text: "I ran diagnostics on current tickets. We have active reports nearby: Water line, power lines, and road defects. Feel free to search specific areas!", timestamp: Date.now() }]);
    } finally {
      setIsChatLoading(false);
    }
  };
  const sendQuickPrompt = (prompt: string) => {
    setChatInput(prompt);

    setTimeout(() => {
      const form = document.querySelector("form");
      form?.requestSubmit();
    }, 50);
  };

  const selectedIssue = issues.find(i => i && i.id === selectedIssueId);

  // Filter implementation
  const filteredIssuesList = issues.filter(issue => {
    if (!issue) return false;
    const matchesCategory = filterCategory === "All" || issue.category === filterCategory;
    const matchesStatus = filterStatus === "All" || issue.status === filterStatus;

    const matchesSearch = searchQuery === "All" || searchQuery === "" ||
      (issue.title && issue.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (issue.description && issue.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (issue.assignedDepartment && issue.assignedDepartment.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesCategory && matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(79,140,255,0.16),transparent_30%),radial-gradient(circle_at_top_right,rgba(124,92,255,0.14),transparent_24%),linear-gradient(135deg,#060816_0%,#070b14_48%,#05060d_100%)] text-app-text font-sans antialiased selection:bg-cyan-500/30 selection:text-cyan-200">

      {/* Modern Two-Layer Enterprise Sticky Navigation System */}
      <header className={`sticky top-0 z-50 w-full border-b transition-all duration-350 ${scrolled
        ? "bg-app-card/85 backdrop-blur-[18px] border-app-border/80 shadow-[0_12px_40px_rgba(2,8,23,0.22)]"
        : "bg-app-card/70 backdrop-blur-[14px] border-app-border/40 shadow-[0_8px_24px_rgba(2,8,23,0.14)]"
        }`}>

        {/* ROW 1 (Primary Header) */}
        <div className="h-16 md:h-[72px] border-b border-app-border/40 flex items-center">
          <div className="max-w-[1400px] w-full mx-auto px-4 md:px-6 flex justify-between items-center h-full gap-4">

            {/* CivicHero Logo, Badge & Subtitle */}
            <div className="flex items-center gap-3.5 shrink-0">
              <div className="h-10 w-10 bg-gradient-to-tr from-cyan-500 to-indigo-500 rounded-xl flex items-center justify-center text-white font-bold tracking-tight shadow-lg shadow-cyan-500/10 hover:rotate-3 transition-transform duration-200">
                <Activity className="h-5.5 w-5.5 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold tracking-tight text-app-text leading-none">CivicHero</span>
                  <span className="text-[9px] uppercase px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-bold tracking-wider leading-none">SMART-CITY OS</span>
                </div>
                <span className="text-[10px] text-app-text-muted hidden sm:block leading-none mt-1.5 font-medium">AI-Powered Hyperlocal Civic Coordination</span>
              </div>
            </div>

            {/* Right Controls & Profile Info */}
            <div className="flex items-center gap-3 md:gap-4 shrink-0">

              {/* System Time (Minimal clock) */}
              <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-app-bg border border-app-border/60 rounded-xl text-[11px] font-mono text-app-text-muted h-10 select-none">
                <Clock className="h-3.5 w-3.5 text-cyan-400" />
                <span className="font-semibold text-app-text-muted">System Time:</span>
                <span className="text-app-text font-bold tracking-tight">{currentTime.toLocaleTimeString()}</span>
              </div>

              {/* Theme Toggle */}
              <button
                id="theme-toggle"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                className="p-2 bg-app-bg hover:bg-app-elevated border border-app-border rounded-xl text-app-text hover:text-cyan-400 transition-all cursor-pointer flex items-center justify-center h-10 w-10 shadow-sm"
                title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {theme === "light" ? <Moon className="h-5 w-5 text-app-text" /> : <Sun className="h-5 w-5 text-app-text" />}
              </button>

              {/* Reputation & Civic Profile */}
              <div className="hidden sm:block text-right">
                <span className="text-[9px] text-app-text-muted block uppercase tracking-widest font-mono font-bold leading-none mb-1 select-none">Civic Profile</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-app-text">{(currentUser?.name || "").split("@")[0]}</span>
                  <span className="text-xs font-mono font-extrabold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 border border-cyan-500/20 rounded-md flex items-center gap-1 select-none">
                    <Coins className="h-3 w-3 text-cyan-400" />
                    {currentUser?.reputationPoints || 0} Pts
                  </span>
                </div>
              </div>

              {/* Profile Avatar & Badge hover dropdown */}
              <div className="h-10 w-10 bg-gradient-to-tr from-cyan-500/20 to-indigo-500/20 border border-app-border rounded-full flex items-center justify-center text-app-text relative group cursor-default shadow-md select-none">
                <User className="h-5 w-5 text-app-text-secondary" />
                <div className="absolute right-0 top-12 p-3 bg-app-card border border-app-border rounded-xl shadow-2xl text-[10px] text-app-text-muted whitespace-nowrap hidden group-hover:block z-50 animate-[slideUp_0.15s_ease-out]">
                  <p className="font-bold text-app-text mb-2 border-b border-app-border pb-1">Reputation Badges ({getSafeBadges(currentUser?.badges).length})</p>
                  <div className="flex flex-col gap-1.5">
                    {getSafeBadges(currentUser?.badges).map(b => (
                      <span key={b} className="inline-block px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[9px] rounded-lg font-bold">
                        🏆 {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>

        {/* ROW 2 (Navigation Bar) */}
        <div className="h-12 md:h-14 flex items-center bg-app-card/30">
          <div className="max-w-[1400px] w-full mx-auto px-4 md:px-6 flex justify-between items-center h-full gap-4">

            {/* Tabs Selector (Scrolls horizontally on small viewports) */}
            <div className="flex items-center gap-1.5 md:gap-3 overflow-x-auto no-scrollbar scroll-smooth flex-1 md:flex-initial py-1 -mx-4 px-4 md:mx-0 md:px-0">

              <button
                id="nav-tab-map"
                onClick={() => setActiveTab("map")}
                className={`h-10 px-5 rounded-2xl flex items-center gap-2.5 shrink-0 font-medium text-sm transition-all duration-300 border ${activeTab === "map"
                  ?
                  "bg-gradient-to-b from-blue-500/20 to-blue-600/10 text-blue-300 border-blue-400/25 shadow-lg shadow-blue-500/10"
                  :
                  "bg-transparent text-slate-400 border-transparent hover:bg-white/[0.04] hover:text-white hover:border-white/10"
                  }`}
              >
                <Navigation className={`h-4 w-4 transition-all duration-300 ${activeTab === "map"
                  ?
                  "text-blue-300"
                  :
                  "text-slate-500 group-hover:text-slate-200"
                  }`} />
                <span className="whitespace-nowrap">Community Dashboard</span>
              </button>

              <button
                id="nav-tab-hotline"
                onClick={() => setActiveTab("hotline")}
                className={`h-9 px-3.5 text-xs font-semibold tracking-wide rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-300 relative group shrink-0 select-none hover:-translate-y-0.5 active:translate-y-0 ${activeTab === "hotline"
                  ? "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "bg-app-bg/10 text-app-text-muted hover:text-app-text hover:bg-app-bg/30 border border-app-border/40 hover:border-app-border/80"
                  }`}
              >
                <ShieldAlert className={`h-4 w-4 transition-all duration-200 ${activeTab === "hotline" ? "text-cyan-400 animate-pulse scale-110" : "text-app-text-muted group-hover:scale-105 group-hover:text-app-text"}`} />
                <span className="whitespace-nowrap">Citizen Reports</span>
                <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-md font-bold transition-colors ${activeTab === "hotline" ? "bg-cyan-500/25 text-cyan-400" : "bg-app-bg/50 border border-app-border/50 text-app-text-muted"
                  }`}>
                  {issues.filter(i => i && i.status !== "Resolved").length}
                </span>
                {activeTab === "hotline" && (
                  <motion.span
                    layoutId="headerTabGlow"
                    className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full blur-[2px] shadow-[0_0_10px_#06b6d4]"
                  />
                )}
              </button>

              <button
                id="nav-tab-scorecard"
                onClick={() => setActiveTab("scorecard")}
                className={`h-9 px-3.5 text-xs font-semibold tracking-wide rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-300 relative group shrink-0 select-none hover:-translate-y-0.5 active:translate-y-0 ${activeTab === "scorecard"
                  ? "bg-cyan-950/50 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                  : "bg-app-bg/10 text-app-text-muted hover:text-app-text hover:bg-app-bg/30 border border-app-border/40 hover:border-app-border/80"
                  }`}
              >
                <Award className={`h-4 w-4 transition-all duration-200 ${activeTab === "scorecard" ? "text-cyan-400 animate-pulse scale-110" : "text-app-text-muted group-hover:scale-105 group-hover:text-app-text"}`} />
                <span className="whitespace-nowrap">Verification Center</span>
                {activeTab === "scorecard" && (
                  <motion.span
                    layoutId="headerTabGlow"
                    className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-cyan-400 to-indigo-500 rounded-full blur-[2px] shadow-[0_0_10px_#06b6d4]"
                  />
                )}
              </button>

              <button
                id="nav-tab-municipal"
                onClick={() => setActiveTab("municipal")}
                className={`h-9 px-3.5 text-xs font-semibold tracking-wide rounded-xl flex items-center gap-2 cursor-pointer transition-all duration-300 relative group shrink-0 select-none hover:-translate-y-0.5 active:translate-y-0 ${activeTab === "municipal"
                  ? "bg-violet-950/50 text-violet-400 border border-violet-500/30 shadow-[0_0_15px_rgba(124,92,255,0.2)]"
                  : "bg-app-bg/10 text-app-text-muted hover:text-app-text hover:bg-app-bg/30 border border-app-border/40 hover:border-app-border/80"
                  }`}
              >
                <Building2 className={`h-4 w-4 transition-all duration-200 ${activeTab === "municipal" ? "text-violet-400 animate-spin-slow scale-110" : "text-app-text-muted group-hover:scale-105 group-hover:text-app-text"}`} />
                <span className="whitespace-nowrap">Municipal Operating System</span>
                {activeTab === "municipal" && (
                  <motion.span
                    layoutId="headerTabGlow"
                    className="absolute -bottom-[6px] left-1/2 -translate-x-1/2 w-8 h-1 bg-gradient-to-r from-violet-400 to-indigo-500 rounded-full blur-[2px] shadow-[0_0_10px_#7c5cff]"
                  />
                )}
              </button>

            </div>

            {/* AI Insights Ticker (Smoothly fading & sliding vertical text ticker) */}
            <div className="hidden md:flex items-center gap-2.5 font-mono text-[10px] text-app-text-muted select-none overflow-hidden flex-1 justify-end pl-4 border-l border-app-border/40 max-w-[450px]">
              <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse shrink-0" />
              <span className="text-cyan-500 font-bold shrink-0 uppercase tracking-wider">AI INSIGHTS:</span>
              <div className="h-5 overflow-hidden relative w-[300px]">
                <AnimatePresence mode="wait">
                  <motion.span
                    key={insightIndex}
                    initial={{ opacity: 0, x: 12, filter: "blur(3px)" }}
                    animate={{ opacity: 1, x: 0, filter: "blur(0px)" }}
                    exit={{ opacity: 0, x: -12, filter: "blur(3px)" }}
                    transition={{ duration: 0.38, ease: "easeInOut" }}
                    className="absolute inset-0 truncate italic text-app-text block text-right font-medium"
                  >
                    {ROTATING_AI_INSIGHTS[insightIndex]}
                  </motion.span>
                </AnimatePresence>
              </div>
            </div>

          </div>
        </div>

      </header>

      {/* Primary Container Layout */}
      <main className="mx-auto flex w-full max-w-[1380px] flex-col gap-6 px-4 py-6 sm:px-5 lg:px-6 xl:px-8 lg:py-8">

        {/* Alerts Banner */}
        {alertMessage && (
          <div className={`p-3.5 border rounded-xl text-xs flex justify-between items-center shadow-lg transition-all ${alertMessage.type === "success"
            ? "bg-emerald-950/30 border-emerald-850 text-emerald-400"
            : alertMessage.type === "error"
              ? "bg-rose-950/30 border-rose-850 text-rose-400"
              : "bg-cyan-950/30 border-cyan-850 text-cyan-400"
            }`}>
            <span className="font-sans font-medium">{alertMessage.text}</span>
            <button onClick={() => setAlertMessage(null)} className="text-slate-400 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* TAB CONTENTS RENDERER */}

        {/* Tab 1: Map command center */}
        {activeTab === "map" && (
          <div className="grid grid-cols-1 items-start gap-5 sm:gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)] xl:gap-7">
            <div className="min-w-0 space-y-6">

              {/* Premium Dashboard Header */}
              <div className="relative overflow-hidden rounded-[30px] border border-cyan-500/15 bg-gradient-to-br from-slate-900 via-[#111827] to-slate-950 shadow-[0_30px_80px_rgba(0,0,0,.55)]">

                {/* Ambient Glow */}
                <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[550px] h-[220px] bg-cyan-500/10 blur-[120px] pointer-events-none" />

                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,211,238,.06),transparent_60%)] pointer-events-none" />

                {/* Header */}
                <div className="relative flex items-center justify-between px-8 pt-7 pb-5 border-b border-white/5">

                  <div className="flex items-center gap-5">

                    <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-cyan-500 to-indigo-600 flex items-center justify-center shadow-[0_0_40px_rgba(6,182,212,.45)]">

                      <Navigation className="w-8 h-8 text-white" />

                    </div>

                    <div>

                      <h1 className="text-4xl font-black tracking-tight text-white">

                        Community Operations Center

                      </h1>

                      <p className="text-slate-400 mt-2 text-base">

                        AI-powered live monitoring, predictive analytics and citizen incident intelligence.

                      </p>

                    </div>

                  </div>

                  <div className="flex items-center gap-4">

                    <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/10 px-6 py-4">

                      <div className="text-[10px] uppercase tracking-[0.3em] text-slate-400">

                        Active

                      </div>

                      <div className="text-4xl font-black text-cyan-300">

                        {issues.filter(i => i.status !== "Resolved").length}

                      </div>

                    </div>

                    <button
                      onClick={() => setShowHeatmap(!showHeatmap)}
                      className={`rounded-2xl px-8 py-5 text-sm font-bold transition-all ${showHeatmap
                        ? "bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30"
                        : "bg-slate-800 hover:bg-slate-700 text-white"
                        }`}
                    >
                      {showHeatmap ? "Hide Heatmap" : "Show Heatmap"}
                    </button>

                  </div>

                </div>

                {/* Map */}
                <div className="relative p-5">

                  <CivicWebMap
                    issues={issues}
                    selectedIssueId={selectedIssueId}
                    onSelectIssue={(id) => {
                      setSelectedIssueId(id);
                      setActiveTab("hotline");
                    }}
                    onMapClick={handleMapClick}
                    showHeatmap={showHeatmap}
                    filterCategory="All"
                  />

                </div>

              </div>

              {/* AI Assistant */}
              <VoiceAssistant
                onDraftGenerated={handleAssistantDraftGenerated}
              />

            </div>

            {/* AI assisted reporting sheet */}
            <div className="premium-card sticky top-6 w-full self-start p-4 space-y-6 sm:p-5 lg:p-6 xl:min-w-[320px]">
              <div className="relative overflow-hidden rounded-2xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/10 via-slate-900 to-slate-950 p-4 sm:p-5 lg:p-6">

                <div className="absolute right-0 top-0 h-24 w-24 rounded-full bg-cyan-500/10 blur-3xl" />

                <div className="relative flex flex-wrap items-start justify-between gap-3">

                  <div className="flex min-w-0 items-start gap-3">
                    <div className="h-10 w-10 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/30">

                      <Sparkles className="h-5 w-5 text-white" />

                    </div>

                    <div className="min-w-0">

                      <h3 className="text-base font-bold leading-tight text-white sm:text-lg">
                        AI Incident Copilot
                      </h3>

                      <p className="mt-1 text-sm leading-6 text-slate-400">
                        AI categorizes, prioritizes and routes every report automatically.
                      </p>

                    </div>

                  </div>

                  <div className="shrink-0 rounded-xl border border-emerald-500/30 bg-emerald-500/15 px-3 py-2 text-left">

                    <p className="text-[10px] uppercase tracking-[0.2em] text-slate-400">
                      Confidence
                    </p>

                    <p className="mt-0.5 text-xl font-bold text-emerald-400">
                      98%
                    </p>

                  </div>

                </div>

              </div>

              {/* Simulator preset buttons */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-app-text-muted uppercase block tracking-wider font-bold">Quick Templates</span>
                <div className="grid grid-cols-2 gap-3">

                  {[
                    {
                      icon: "🛣",
                      title: "Road Damage",
                      desc: "Potholes & cracks",
                      color: "from-orange-500/20 to-amber-500/10",
                      border: "border-orange-500/30",
                      preset: "pothole" as const
                    },
                    {
                      icon: "💧",
                      title: "Water Leak",
                      desc: "Pipeline burst",
                      color: "from-cyan-500/20 to-blue-500/10",
                      border: "border-cyan-500/30",
                      preset: "water" as const
                    },
                    {
                      icon: "⚡",
                      title: "Electrical",
                      desc: "Transformer issue",
                      color: "from-yellow-500/20 to-orange-500/10",
                      border: "border-yellow-500/30",
                      preset: "electricity" as const
                    },
                    {
                      icon: "🗑",
                      title: "Waste",
                      desc: "Illegal dumping",
                      color: "from-emerald-500/20 to-green-500/10",
                      border: "border-emerald-500/30",
                      preset: "garbage" as const
                    }
                  ].map((item) => {
                    const isSelected = selectedPreset === item.preset;

                    return (
                    <button
                      key={item.title}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() => { void handlePresetSelect(item.preset); }}
                      className={`
                group
                rounded-2xl
                border
                ${item.border}
                bg-gradient-to-br
                ${item.color}
                p-4
                text-left
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
                hover:scale-[1.02]
                ${isSelected ? "ring-2 ring-cyan-400/70 shadow-[0_0_0_1px_rgba(34,211,238,0.25)]" : ""}
            `}
                    >

                      <div className="text-3xl mb-3 transition-transform duration-300 group-hover:scale-110">
                        {item.icon}
                      </div>

                      <div className="font-semibold text-white text-sm">
                        {item.title}
                      </div>

                      <div className="text-xs text-slate-400 mt-1">
                        {item.desc}
                      </div>

                    </button>
                    );
                  })}

                </div>
              </div>

              {/* Native files drag-drop / uploads section */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-app-text-muted uppercase block tracking-wider font-bold">Evidence</span>
                <div className="p-4 bg-app-bg border border-app-border hover:border-cyan-500/30 border-dashed rounded-xl transition-all relative flex flex-col items-center justify-center min-h-[90px] text-center select-none group/upload min-w-[44px]">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer min-h-[44px]"
                  />
                  {formImageBase64 ? (
                    <div className="space-y-1.5">
                      <span className="text-xs text-emerald-500 font-bold block flex items-center justify-center gap-1.5">
                        <Check className="h-4 w-4 bg-emerald-500/20 p-0.5 rounded-full" />
                        Incident image loaded
                      </span>
                      <button
                        type="button"
                        onClick={handleRunVisionScan}
                        disabled={isLoadingAi}
                        className="py-1.5 px-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-[10px] uppercase font-mono tracking-wider cursor-pointer shadow min-h-[44px]"
                      >
                        Run AI Vision Scan
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      <p className="text-xs text-app-text font-bold">Drag photo here or choose file</p>
                      <p className="text-[10px] text-app-text-muted">Auto-identifies categories & parameters</p>
                    </div>
                  )}
                </div>
              </div>

              {/* AI Vision Scan Progress Indicator */}
              <AnimatePresence>
                {visionAnalysisSteps && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-4 bg-cyan-950/20 border border-cyan-500/30 rounded-2xl space-y-2 select-none"
                  >
                    <div className="flex items-center gap-2">
                      <Loader className="h-4 w-4 text-cyan-400 animate-spin" />
                      <span className="text-xs font-mono font-bold text-cyan-400">EMBEDDED VISION SCANNER ACTIVE</span>
                    </div>
                    <p className="text-[11px] font-mono text-app-text-muted italic">{visionAnalysisSteps}</p>
                    <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 animate-[flow_2.5s_linear_infinite]" style={{ width: "70%" }}></div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* AI Vision Scan Results Card */}
              <AnimatePresence>
                {visionAnalysis && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="p-4 bg-slate-900 border border-app-border rounded-2xl shadow-xl space-y-3 relative overflow-hidden group"
                  >
                    <div className="absolute top-0 right-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
                      <Sparkles className="h-20 w-20 text-cyan-500" />
                    </div>

                    <div className="flex justify-between items-center border-b border-app-border/40 pb-2">
                      <span className="text-[10px] font-mono font-bold text-cyan-400 flex items-center gap-1.5 uppercase">
                        <Sparkles className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
                        AI Vision Scan Results
                      </span>
                      <span className="text-[10px] font-mono font-bold text-emerald-400">
                        {visionAnalysis.confidenceScore}% Confidence
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] font-sans">
                      <div>
                        <span className="text-[9px] text-app-text-muted uppercase font-mono block">Detected Issue</span>
                        <span className="font-bold text-app-text block truncate">{visionAnalysis.detectedIssueType}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-app-text-muted uppercase font-mono block">Severity Index</span>
                        <span className="font-bold text-red-400 block">{visionAnalysis.estimatedSeverity}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-app-text-muted uppercase font-mono block">Suggested Dept</span>
                        <span className="font-bold text-app-text block truncate">{visionAnalysis.suggestedDepartment}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-app-text-muted uppercase font-mono block">Repair Cost</span>
                        <span className="font-bold text-cyan-400 block">₹{visionAnalysis.estimatedRepairCost.toLocaleString()}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-app-text-muted uppercase font-mono block">Duration EST</span>
                        <span className="font-bold text-app-text block">{visionAnalysis.expectedRepairDuration}</span>
                      </div>

                      <div>
                        <span className="text-[9px] text-app-text-muted uppercase font-mono block">AI Priority</span>
                        <span className="font-bold text-yellow-400 block">{visionAnalysis.recommendedPriority}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Form Entry */}
              <form onSubmit={handleFormSubmit} className="space-y-4 pt-2 border-t border-app-border">

                <div>
                  <label className="text-[10px] font-mono text-app-text-muted uppercase block mb-1 font-bold">Issue Summary</label>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Pavement collapse on 5th avenue block"
                    required
                    className="w-full bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl px-4 py-3 text-xs text-app-text placeholder-app-text-muted/60 focus:outline-none focus:border-cyan-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 transition-all shadow-sm"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-mono text-app-text-muted uppercase block mb-1 font-bold">Description</label>
                  <textarea
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    placeholder="Provide depth, dimensions, and impact parameters..."
                    rows={3}
                    className="w-full bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl px-4 py-3 text-xs text-app-text placeholder-app-text-muted/60 focus:outline-none focus:border-cyan-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 transition-all shadow-sm"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-mono text-app-text-muted uppercase block mb-1 font-bold">Category</label>
                    <CustomSelect
                      value={formCategory}
                      onChange={(val) => setFormCategory(val as Issue["category"])}
                      options={[
                        { value: "Road Issue", label: "Road Issue" },
                        { value: "Water Supply", label: "Water Supply" },
                        { value: "Electrical", label: "Electrical" },
                        { value: "Waste Management", label: "Waste Management" },
                        { value: "Sanitation", label: "Sanitation" },
                        { value: "Environment", label: "Environment" }
                      ]}
                      className="w-full bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl px-3 py-3 text-xs text-app-text focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-mono text-app-text-muted uppercase block mb-1 font-bold">Priority</label>
                    <CustomSelect
                      value={formSeverity}
                      onChange={(val) => setFormSeverity(val as Issue["severity"])}
                      options={[
                        { value: "Low", label: "Low" },
                        { value: "Medium", label: "Medium" },
                        { value: "High", label: "High" },
                        { value: "Critical", label: "Critical" }
                      ]}
                      className="w-full bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl px-3 py-3 text-xs text-app-text focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3 bg-app-bg border border-app-border rounded-xl text-[10px] font-mono text-app-text-muted shadow">
                  <div className="flex justify-between items-center pb-1.5 border-b border-app-border">
                    <span className="text-[9px] uppercase text-app-text-muted font-bold">Location</span>
                    <button
                      type="button"
                      onClick={handleGeolocateUser}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 rounded-lg text-[9px] font-bold transition-all flex items-center gap-1 cursor-pointer min-h-[44px]"
                    >
                      <Navigation className="h-2.5 w-2.5 animate-pulse" />
                      AUTO GPS
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <span className="block text-[8px] uppercase text-app-text-muted">Latitude</span>
                      <span className="text-app-text font-semibold">{formLat.toFixed(5)}</span>
                    </div>
                    <div>
                      <span className="block text-[8px] uppercase text-app-text-muted">Longitude</span>
                      <span className="text-app-text font-semibold">{formLng.toFixed(5)}</span>
                    </div>
                  </div>
                  <div className="pt-1.5 border-t border-app-border">
                    <span className="block text-[8px] uppercase text-app-text-muted">MAPPED SECTOR LOCATION</span>
                    <span className="text-cyan-500 font-semibold block break-words leading-tight">{formAddress || "Click map or AUTO GPS..."}</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoadingAi || !formTitle}
                  className={`
                    group w-full min-h-[64px] rounded-2xl
                    bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600
                    hover:from-blue-500 hover:to-indigo-500
                    disabled:from-slate-700 disabled:to-slate-700
                    disabled:cursor-not-allowed
                    shadow-lg shadow-blue-900/30
                    hover:shadow-blue-500/30
                    transition-all duration-300
                    hover:-translate-y-0.5
                    px-5 py-4
                    text-left
                  `}
                >
                  {isLoadingAi ? (
                    <div className="flex flex-col">
                      <span className="text-white font-semibold">
                        🤖 AI Processing...
                      </span>
                      <span className="text-blue-100 text-xs mt-1">
                        Checking duplicates & assigning department
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-semibold text-base">
                          Submit Incident
                        </div>

                        <div className="text-blue-100 text-xs mt-1">
                          AI will classify, prioritize & route automatically
                        </div>
                      </div>

                      <div className="text-2xl transition-transform duration-300 group-hover:translate-x-1">
                        →
                      </div>
                    </div>
                  )}
                </button>

              </form>

            </div>

          </div>
        )}

        {/* Tab 2: Citizen Reports active list */}
        {activeTab === "hotline" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start pb-16 lg:pb-0">

            {/* Filter controls and items lists */}
            <div className="lg:col-span-5 space-y-4">

              <div className="flex flex-col gap-3">
                <h2 className="text-base font-bold tracking-tight text-app-text flex items-center gap-2 uppercase">
                  <ShieldAlert className="h-4.5 w-4.5 text-cyan-500" />
                  Hyperlocal Citizen Reports List
                </h2>

                {/* Search query box */}
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-app-text-muted" />
                  <input
                    type="text"
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search titles, departments, or keyword parameters..."
                    className="w-full bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl pl-10 pr-4 py-2.5 text-xs text-app-text focus:outline-none focus:border-cyan-500/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/40 transition-all shadow-sm"
                  />
                </div>

                {/* Filters Row */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-mono text-app-text-muted ml-1 mb-1 font-bold">Category</span>
                    <CustomSelect
                      value={filterCategory}
                      onChange={(val) => setFilterCategory(val)}
                      options={[
                        { value: "All", label: "All Categories" },
                        { value: "Road Issue", label: "Road Issue" },
                        { value: "Water Supply", label: "Water Supply" },
                        { value: "Electrical", label: "Electrical" },
                        { value: "Waste Management", label: "Waste Management" },
                        { value: "Sanitation", label: "Sanitation" },
                        { value: "Environment", label: "Environment" }
                      ]}
                      className="bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl px-3 py-2.5 text-xs text-app-text focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] uppercase font-mono text-app-text-muted ml-1 mb-1 font-bold">Resolution State</span>
                    <CustomSelect
                      value={filterStatus}
                      onChange={(val) => setFilterStatus(val)}
                      options={[
                        { value: "All", label: "All Statuses" },
                        { value: "Reported", label: "Reported" },
                        { value: "Verified", label: "Verified" },
                        { value: "Assigned", label: "Assigned" },
                        { value: "In Progress", label: "In Progress" },
                        { value: "Resolved", label: "Resolved" }
                      ]}
                      className="bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl px-3 py-2.5 text-xs text-app-text focus:outline-none focus:border-cyan-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Incidents Scroller list */}
              <div className="space-y-3 max-h-[580px] overflow-y-auto pr-1">
                {filteredIssuesList.length === 0 ? (
                  <div className="p-8 bg-app-card border border-app-border rounded-xl text-center shadow-inner">
                    <p className="text-xs text-app-text-muted font-mono">No active incidents matched the selected parameters.</p>
                  </div>
                ) : (
                  filteredIssuesList.map((issue) => {
                    const isOverdue = issue.status !== "Resolved" && Date.now() > issue.slaDeadline;
                    const isSelected = selectedIssueId === issue.id;

                    // Severity indicators
                    let severityBadge = "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30";
                    if (issue.severity === "Critical") severityBadge = "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/40 font-bold";
                    else if (issue.severity === "High") severityBadge = "bg-orange-500/10 text-orange-600 dark:text-orange-450 border-orange-500/40 font-bold";
                    else if (issue.severity === "Medium") severityBadge = "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/45 font-semibold";

                    // Status indicators
                    let statusBadge = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
                    if (issue.status === "Resolved") statusBadge = "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/40 font-bold";
                    else if (issue.status === "In Progress") statusBadge = "bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/40 font-bold";
                    else if (issue.status === "Assigned") statusBadge = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/40";

                    return (
                      <div
                        key={issue.id}
                        onClick={() => {
                          setSelectedIssueId(issue.id);
                        }}
                        className={`p-5 rounded-[18px] border transition-all duration-300 cursor-pointer select-none relative overflow-hidden ${isSelected
                          ? "bg-app-elevated border-cyan-500/60 shadow-lg shadow-cyan-500/5 ring-1 ring-cyan-500/40 translate-x-1"
                          : "bg-app-card border-app-border hover:border-app-text-muted/30 hover:bg-app-elevated/70 hover:-translate-y-0.5 shadow-sm"
                          }`}
                      >
                        {/* SLA Overdue badge overlay */}
                        {isOverdue && (
                          <span className="absolute top-0 right-0 py-1 px-3.5 bg-red-600 text-white text-[8px] font-mono font-bold tracking-widest uppercase rounded-bl-xl animate-pulse">
                            🚨 EMERGENCY SLA OUT-OF-WINDOW
                          </span>
                        )}

                        <div className="flex justify-between items-center mb-3">
                          <span className="text-[10px] font-mono text-app-text-muted font-bold">
                            ID: {issue.id.slice(-8)} • {issue.location?.ward || "Unknown Ward"}
                          </span>
                          <div className="flex gap-1.5 text-[9px] font-mono">
                            <span className={`px-2.5 py-1 border rounded-lg ${severityBadge}`}>
                              {issue.severity}
                            </span>
                            <span className={`px-2.5 py-1 border rounded-lg ${statusBadge}`}>
                              {issue.status}
                            </span>
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-app-text mb-1.5 leading-snug">
                          {issue.title}
                        </h4>
                        <p className="text-xs text-app-text-muted line-clamp-2 max-w-[390px] mb-4 leading-relaxed">
                          {issue.description}
                        </p>

                        <div className="flex justify-between items-center text-[10px] font-mono pt-3 border-t border-app-border text-app-text-muted">
                          <span className="font-semibold text-app-text-secondary">🔧 {issue.assignedDepartment.split(" & ")[0]}</span>
                          <span className="text-cyan-600 dark:text-cyan-450 font-bold flex items-center gap-1">
                            👍 {issue.votes} • Verified {issue.verifiedCount}x
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Google Authentication Control Panel */}
              <div className="bg-app-card p-5 border border-app-border rounded-xl space-y-3 shadow-md">
                <span className="text-[10px] font-mono text-app-text-muted uppercase block tracking-wider font-bold">MUNICIPAL PORTAL IDENTITY</span>

                {token ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-xs text-app-text">Active: <strong className="text-app-text font-bold">{currentUser?.name || "Official Agent"}</strong></span>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30 rounded-xl text-xs font-semibold transition-all cursor-pointer min-h-[44px]"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <p className="text-[11px] text-app-text-muted leading-relaxed font-sans">
                      Securely authenticate with Google Accounts to synchronize real reputation points, follow public reports, and validate tickets.
                    </p>
                    <button
                      type="button"
                      onClick={handleGoogleSignIn}
                      className="w-full py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow min-h-[44px]"
                    >
                      <User className="h-4 w-4" />
                      Google Sign-In
                    </button>
                  </div>
                )}
              </div>

              {/* AI Presentation Demo Mode Panel */}
              <div className="bg-app-card p-5 border border-app-border rounded-xl space-y-3 shadow-md">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-cyan-500 uppercase block tracking-wider font-bold">AI PRESENTATION PLATFORM</span>
                  <span className="px-2 py-0.5 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-lg text-[8px] font-mono font-bold uppercase">Demo Mode</span>
                </div>
                <p className="text-[11px] text-app-text-muted leading-relaxed font-sans">
                  Immediately generate hyper-realistic हैदराबाद incidents and verify automatic visual SLA resolutions with comparison sliders.
                </p>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={handleTriggerDemoIncident}
                    className="py-2.5 px-2 bg-app-bg hover:bg-cyan-500/5 hover:border-cyan-500/40 text-cyan-600 dark:text-cyan-400 border border-app-border rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Spawn Ticket
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerDemoResolution}
                    disabled={!selectedIssue || selectedIssue.status === "Resolved"}
                    className="py-2.5 px-2 bg-app-bg hover:bg-emerald-500/5 hover:border-emerald-500/40 text-emerald-600 dark:text-emerald-400 border border-app-border disabled:opacity-50 disabled:hover:bg-app-bg disabled:hover:border-app-border disabled:text-app-text-muted/50 rounded-xl text-[10px] font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 min-h-[44px] active:scale-95"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Resolve Demo
                  </button>
                </div>
              </div>

            </div>

            {/* Ticket details viewport panel */}
            <div className="lg:col-span-7 bg-app-card border border-app-border rounded-2xl p-6 shadow-xl min-h-[400px]">
              {selectedIssue ? (
                <div className="space-y-7">

                  {/* Detailed Title Section */}
                  <div className="border-b border-app-border pb-3 flex justify-between items-start gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="px-2.5 py-0.5 bg-app-bg text-[10px] font-mono text-app-text-muted border border-app-border rounded-lg">
                          {selectedIssue.category}
                        </span>
                        <span className="px-2.5 py-0.5 bg-cyan-500/10 text-[10px] text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 rounded-lg font-bold">
                          AI Confidence {selectedIssue.confidence || 92}%
                        </span>
                        <span className="text-[10px] text-app-text-muted font-mono font-medium">
                          Audited: {new Date(selectedIssue.createdAt).toLocaleDateString()}
                        </span>
                      </div>

                      <h3 className="text-base font-extrabold tracking-tight text-app-text leading-snug">
                        {selectedIssue.title}
                      </h3>
                      <p className="text-xs text-app-text-muted mt-2 font-sans leading-relaxed">
                        {selectedIssue.description}
                      </p>
                    </div>

                    {/* Translate action */}
                    <div className="flex flex-col gap-1 items-end shrink-0">
                      <span className="text-[9px] font-mono text-app-text-muted uppercase font-bold">Translate Language</span>
                      <div className="flex gap-1 bg-app-bg p-1 rounded-xl border border-app-border">
                        <button
                          type="button"
                          onClick={() => handleTranslateIssue(selectedIssue.id, "Telugu")}
                          className="px-2 py-1 text-[9px] font-mono text-app-text-muted hover:text-cyan-500 hover:bg-app-card rounded-md font-bold transition-all"
                        >

                        </button>
                        <button
                          type="button"
                          onClick={() => handleTranslateIssue(selectedIssue.id, "Hindi")}
                          className="px-2 py-1 text-[9px] font-mono text-app-text-muted hover:text-cyan-500 hover:bg-app-card rounded-md font-bold transition-all"
                        >

                        </button>
                        <button
                          type="button"
                          onClick={() => handleTranslateIssue(selectedIssue.id, "Tamil")}
                          className="px-2 py-1 text-[9px] font-mono text-app-text-muted hover:text-cyan-500 hover:bg-app-card rounded-md font-bold transition-all"
                        >

                        </button>
                      </div>
                    </div>
                  </div>

                  {/* AUTOMATIC EMERGENCY ESCALATION STATUS HEADER */}
                  {((selectedIssue.severity === "Critical" ||
                    (selectedIssue.title || "").toLowerCase().includes("burst") ||
                    (selectedIssue.title || "").toLowerCase().includes("spark") ||
                    (selectedIssue.title || "").toLowerCase().includes("hazard") ||
                    (selectedIssue.description || "").toLowerCase().includes("school") ||
                    (selectedIssue.description || "").toLowerCase().includes("hospital")) &&
                    selectedIssue.status !== "Resolved") && (
                      <div className="p-4 bg-red-500/10 border-2 border-red-500 rounded-2xl flex items-start gap-3 shadow shadow-red-550/20 animate-pulse">
                        <Flame className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-xs font-bold text-red-600 dark:text-red-400 uppercase leading-none">Automated Proximity Emergency Escalation</h4>
                          <p className="text-[10px] text-red-600 dark:text-red-450 font-mono mt-1 leading-relaxed">
                            ⚠️ Proximity to public institutions (School/Hospital Zone) detected. Incident priority elevated. Resolution SLA target locked under speed-tally rules.
                          </p>
                        </div>
                      </div>
                    )}

                  {/* HIGH FIDELITY COMPARE IMAGE SLIDER */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-mono text-app-text-muted uppercase block tracking-wider font-bold">
                      {!!selectedIssue.resolutionImage?.trim()
                        ? "Interactive Before & After Resolution Slider"
                        : "Field Image Attachment & Analytical Diagnostic"}
                    </span>

                    {!!selectedIssue.resolutionImage?.trim() ? (
                      <div className="space-y-2">
                        <ResolutionSlider
                          beforeSrc={selectedIssue.image}
                          afterSrc={
                            selectedIssue.resolutionImage?.trim()
                              ? selectedIssue.resolutionImage
                              : selectedIssue.image
                          }
                          category={selectedIssue.category}
                          title={selectedIssue.title}
                          description={selectedIssue.description}
                          heightClass="h-[240px]"
                        />
                        <span className="text-[9px] font-mono text-cyan-500 text-center block leading-none font-semibold">
                          Drag the slider cursor left and right to inspect the municipal repair evidence
                        </span>
                      </div>
                    ) : (
                      <div className="relative w-full h-[180px] rounded-2xl overflow-hidden border border-app-border bg-app-bg">
                        <IncidentImage
                          src={selectedIssue.image}
                          alt="Incident Report Photo"
                          category={selectedIssue.category}
                          type="before"
                          title={selectedIssue.title}
                          description={selectedIssue.description}
                          className="w-full h-full object-cover object-center" />
                        <div className="absolute bottom-3 left-3 bg-app-card/90 border border-app-border text-cyan-600 dark:text-cyan-400 font-mono text-[9px] px-2 py-1 rounded shadow z-10">
                          Incident Verification: Image Analysed & Approved
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Local maps coordinates site locator summary */}
                  <div className="grid grid-cols-2 gap-3 p-4 bg-app-bg border border-app-border rounded-xl text-xs font-sans text-app-text">
                    <div>
                      <span className="text-[9px] font-mono text-app-text-muted uppercase block mb-0.5 font-bold">Audited District Zone</span>
                      <p className="font-bold text-app-text">📍 {selectedIssue.location?.address || "Unknown Location Address"}</p>
                      <p className="text-[10px] font-mono text-app-text-muted">{selectedIssue.location?.ward || "Unknown Ward"}, {selectedIssue.location?.district || "Unknown District"}</p>
                    </div>
                    <div>
                      <span className="text-[9px] font-mono text-app-text-muted uppercase block mb-0.5 font-bold">Assigned Authority / Department</span>
                      <p className="font-bold text-app-text">⚙️ {selectedIssue.assignedDepartment}</p>
                      <span className="text-[10px] font-mono text-app-text-muted">SLA target metrics: {selectedIssue.slaHours || 48} hours</span>
                    </div>
                  </div>

                  {/* ADVANCED RE-DESIGNED AI ASSISTED RESOLUTION INSIGHTS PANEL */}
                  <div className="bg-app-bg border border-cyan-500/30 rounded-xl p-5 space-y-4 shadow-sm">

                    <div className="flex justify-between items-center pb-2 border-b border-app-border">
                      <h4 className="text-xs font-bold text-cyan-600 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="h-4 w-4 text-cyan-500 animate-pulse" />
                        AI Hyperlocal Diagnostic Suite
                      </h4>
                      <span className="text-[9px] font-mono text-cyan-600 dark:text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded font-bold">
                        Estimated Budget: ₹{(selectedIssue.resolutionCost || 0).toLocaleString()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

                      {/* Left: Interactive Score Breakdown */}
                      <div className="md:col-span-5 space-y-3 p-3 bg-app-card border border-app-border rounded-xl">
                        <span className="text-[9px] font-mono text-app-text-muted uppercase block leading-none font-bold">Trust & Verification Score</span>

                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full border-4 border-cyan-500 flex items-center justify-center bg-cyan-500/10 text-xs font-bold text-app-text font-mono shadow-inner">
                            {selectedIssue.trustScore || 88}%
                          </div>
                          <div>
                            <span className="text-xs font-bold text-app-text">High Reliability Block</span>
                            <span className="text-[9px] text-app-text-muted block leading-tight">Constituent validation criteria verified successfully.</span>
                          </div>
                        </div>

                        {/* constituents list */}
                        <div className="space-y-1.5 text-[10px] font-mono text-app-text-muted border-t border-app-border pt-2.5">
                          <div className="flex justify-between items-center">
                            <span>✓ AI Confidence Index:</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">94%</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>✓ Multi-Citizen Verification:</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">{selectedIssue.verifiedCount * 12}% (+{selectedIssue.verifiedCount})</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>✓ Calibrated GPS Lock:</span>
                            <span className="text-emerald-500 font-semibold">Active</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span>✓ Unique Node Audit:</span>
                            <span className="text-emerald-500 font-semibold">Unique</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: Diagnostics & Impact */}
                      <div className="md:col-span-7 space-y-3">
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div className="p-2.5 bg-app-card rounded-xl border border-app-border">
                            <span className="text-[8px] font-mono text-app-text-muted uppercase block font-bold">Severity Explanation</span>
                            <p className="text-[10px] text-app-text font-sans leading-relaxed mt-0.5">
                              {selectedIssue.severityExplanation || "Large pavement fissure blocking active lane."}
                            </p>
                          </div>
                          <div className="p-2.5 bg-app-card rounded-xl border border-app-border">
                            <span className="text-[8px] font-mono text-app-text-muted uppercase block font-bold">Root Cause Analysis</span>
                            <p className="text-[10px] text-app-text font-sans leading-relaxed mt-0.5">
                              {selectedIssue.rootCauseAnalysis || "Environmental weathering on aging local conduit grids."}
                            </p>
                          </div>
                        </div>

                        {/* Community Impact Metrics block */}
                        <div className="p-2.5 bg-app-card rounded-xl border border-app-border space-y-2">
                          <span className="text-[9px] font-mono text-app-text-muted uppercase block leading-none font-bold">Community Impact Assessment</span>

                          <div className="grid grid-cols-3 gap-1 text-[10px] text-app-text font-mono">
                            <div className="text-center p-1 bg-app-bg border border-app-border rounded">
                              <span className="text-[7.5px] text-app-text-muted block">IMPACT SCORE</span>
                              <span className="text-cyan-600 dark:text-cyan-400 font-bold">84/100</span>
                            </div>
                            <div className="text-center p-1 bg-app-bg border border-app-border rounded">
                              <span className="text-[7.5px] text-app-text-muted block">CITIZENS AFFECTED</span>
                              <span className="text-cyan-600 dark:text-cyan-400 font-bold">~180 Souls</span>
                            </div>
                            <div className="text-center p-1 bg-app-bg border border-app-border rounded">
                              <span className="text-[7.5px] text-app-text-muted block">URBAN RATING</span>
                              <span className="text-amber-500 font-bold">Hospital zone</span>
                            </div>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Suggestions list */}
                    <div className="p-2.5 bg-app-card rounded-xl border border-app-border text-xs">
                      <span className="text-[9px] font-mono text-app-text-muted uppercase block mb-1 font-bold">Recommended Resolution Actions</span>
                      <ul className="list-disc list-inside space-y-1 text-app-text text-[11px] font-sans">
                        {selectedIssue.resolutionSuggestions?.map((s, idx) => (
                          <li key={idx}>{s}</li>
                        )) || <li className="italic text-app-text-muted">Evaluating municipal repair strategy.</li>}
                      </ul>
                    </div>

                    {/* Future Risk Alert */}
                    <div className="p-2.5 border border-amber-500/20 bg-amber-500/5 rounded-xl text-xs flex gap-2.5 items-start">
                      <AlertCircle className="h-4.5 w-4.5 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[9px] font-mono text-amber-600 dark:text-amber-400 uppercase block font-bold leading-none">Predictive Infrastructure Hazard Alert</span>
                        <p className="text-[10.5px] text-amber-600 dark:text-amber-400 mt-1 font-sans">
                          ⚠️ {selectedIssue.predictiveAlert || "Moisture levels near segment are stable; block failure risk remains within standard margins."}
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Status workflow Timeline tracker */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-app-text-muted uppercase block font-bold">Audit Verification History (MUNICIPAL INCIDENT LIFECYCLE)</span>
                    <div className="bg-app-bg border border-app-border rounded-xl p-4 space-y-3.5 select-none relative">
                      {(() => {
                        const status = selectedIssue.status;
                        const createdTime = new Date(selectedIssue.createdAt).getTime();

                        // Deterministic officer assignment based on category
                        let officer = "K. Sridhar (GHMC Ward Engineer)";
                        if (selectedIssue.category === "Water Supply" || selectedIssue.category === "Sanitation") {
                          officer = "M. Raghu (HMWSSB Sewerage Inspector)";
                        } else if (selectedIssue.category === "Electrical") {
                          officer = "N. Anirudh (TSSPDCL Line Inspector)";
                        } else if (selectedIssue.category === "Waste Management") {
                          officer = "P. Rajesh (Waste Logistics Lead)";
                        } else if (selectedIssue.category === "Environment") {
                          officer = "S. Swetha (Environment Officer)";
                        }

                        const steps = [
                          {
                            label: "Citizen Incident Reported",
                            note: `Citizen logged initial hazard report for ${selectedIssue.title}.`,
                            completed: true,
                            time: new Date(createdTime).toLocaleTimeString()
                          },
                          {
                            label: "AI vision validation",
                            note: "AI Vision analyzed attached photograph, matched hazard vectors and logged parameters.",
                            completed: true,
                            time: new Date(createdTime + 10 * 1000).toLocaleTimeString()
                          },
                          {
                            label: "AI duplicate validation check",
                            note: "Automated scan of existing tickets within 200m radius completed with no duplicates flagged.",
                            completed: true,
                            time: new Date(createdTime + 22 * 1000).toLocaleTimeString()
                          },
                          {
                            label: "Officer Assigned",
                            note: `Assigned GHMC Senior Inspector to direct verification. Assigned: ${officer}.`,
                            completed: ["Assigned", "In Progress", "Resolved"].includes(status),
                            time: new Date(createdTime + 15 * 60 * 1000).toLocaleTimeString()
                          },
                          {
                            label: "Crew Dispatched",
                            note: `GHMC Rapid Remediation Vehicle dispatched to coordinate repair.`,
                            completed: ["In Progress", "Resolved"].includes(status),
                            time: new Date(createdTime + 45 * 60 * 1000).toLocaleTimeString()
                          },
                          {
                            label: "Repair Work Started",
                            note: "Municipal ground crew on-site. Reconstruction in progress under active SLA.",
                            completed: ["In Progress", "Resolved"].includes(status),
                            time: new Date(createdTime + 90 * 60 * 1000).toLocaleTimeString()
                          },
                          {
                            label: "AI Repair Verification",
                            note: "Visual computer vision checks compared the completed repair photograph against historical imagery.",
                            completed: status === "Resolved",
                            time: selectedIssue.updatedAt ? new Date(new Date(selectedIssue.updatedAt).getTime() - 20 * 60 * 1000).toLocaleTimeString() : "--:--"
                          },
                          {
                            label: "Citizen Audited & Approved",
                            note: selectedIssue.citizenResolveRemarks || "Citizen verified repair quality, awarding reputation points.",
                            completed: status === "Resolved",
                            time: selectedIssue.updatedAt ? new Date(selectedIssue.updatedAt).toLocaleTimeString() : "--:--"
                          },
                          {
                            label: "Complaint Closed & Archived",
                            note: "Official GHMC ledger closed and archived. Ticket marked resolved.",
                            completed: status === "Resolved",
                            time: selectedIssue.updatedAt ? new Date(selectedIssue.updatedAt).toLocaleTimeString() : "--:--"
                          }
                        ];

                        return steps.map((step, idx) => {
                          const isActive = step.completed && (idx === steps.length - 1 || !steps[idx + 1].completed);
                          return (
                            <div key={idx} className="flex gap-3 relative group">
                              {idx < steps.length - 1 && (
                                <div className={`absolute left-2 top-5 bottom-0 w-0.5 ${step.completed && steps[idx + 1].completed ? "bg-cyan-500/80" : "bg-app-border"
                                  }`} />
                              )}

                              <div className={`h-4.5 w-4.5 rounded-full flex items-center justify-center shrink-0 border z-10 text-[9px] font-mono font-bold leading-none ${isActive ? "bg-cyan-500 border-cyan-400 text-slate-950 animate-pulse ring-4 ring-cyan-500/20" :
                                step.completed ? "bg-cyan-950/40 border-cyan-500/80 text-cyan-400" :
                                  "bg-app-card border-app-border text-app-text-muted"
                                }`}>
                                {step.completed ? "✓" : idx + 1}
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className={`text-[11px] font-bold truncate uppercase ${isActive ? "text-cyan-400 font-black" :
                                    step.completed ? "text-slate-200" : "text-app-text-muted"
                                    }`}>
                                    {step.label}
                                  </span>
                                  <span className="text-[9px] font-mono text-app-text-muted shrink-0">
                                    {step.time}
                                  </span>
                                </div>
                                <p className={`text-[10px] leading-relaxed mt-0.5 ${isActive ? "text-slate-300 font-medium" :
                                  step.completed ? "text-slate-400" : "text-slate-500/80"
                                  }`}>
                                  {step.note}
                                </p>
                              </div>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </div>

                  {/* Community Validation & Collaboration Control Row */}
                  <div className="flex flex-wrap items-center gap-3 py-3.5 border-t border-b border-app-border">

                    <button
                      type="button"
                      onClick={() => selectedIssue && handleVote(selectedIssue.id)}
                      disabled={!selectedIssue || !currentUser || !!selectedIssue.upvoters?.includes(currentUser.email)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all min-h-[44px] ${selectedIssue && currentUser && selectedIssue.upvoters?.includes(currentUser.email)
                        ? "bg-app-bg text-app-text-muted border border-app-border disabled:cursor-not-allowed"
                        : "bg-cyan-600/15 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-600 hover:text-white"
                        }`}
                    >
                      👍 Upvote Issue ({selectedIssue?.votes || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => selectedIssue && handleVerify(selectedIssue.id)}
                      disabled={!selectedIssue || !currentUser || !!selectedIssue.validators?.includes(currentUser.email)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5 transition-all min-h-[44px] ${selectedIssue && currentUser && selectedIssue.validators?.includes(currentUser.email)
                        ? "bg-app-bg text-app-text-muted border border-app-border disabled:cursor-not-allowed"
                        : "bg-emerald-600/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-600 hover:text-white"
                        }`}
                    >
                      ✓ Confirm Issue Exists ({selectedIssue?.verifiedCount || 0})
                    </button>

                    <button
                      type="button"
                      onClick={() => selectedIssue && handleSubscribe(selectedIssue.id)}
                      className="px-4 py-2 bg-app-bg hover:bg-app-bg/80 border border-app-border text-app-text hover:text-cyan-500 rounded-xl text-xs font-sans font-bold cursor-pointer min-h-[44px]"
                    >
                      🔔 Follow Ticket
                    </button>

                    {selectedIssue && selectedIssue.status !== "Resolved" && (
                      <button
                        type="button"
                        onClick={() => handleSimulateOfficialResolve(selectedIssue.id)}
                        className="px-3 py-2 bg-transparent hover:bg-app-bg text-app-text-muted hover:text-app-text border border-dashed border-app-border rounded-xl text-[10px] font-mono cursor-pointer ml-auto animate-pulse min-h-[44px]"
                      >
                        [Simulate Dept. Resolve]
                      </button>
                    )}
                  </div>

                  {/* CITIZEN RESOLUTION VERIFICATION GAUGE */}
                  {selectedIssue.status === "Resolved" && (
                    <div className="bg-emerald-500/5 border border-emerald-500/30 rounded-2xl p-5 space-y-3">
                      <div className="flex items-center gap-2">
                        <UserCheck className="h-5 w-5 text-emerald-500" />
                        <div>
                          <h4 className="text-xs font-bold text-app-text uppercase leading-none">Citizen Resolution Audit Verification</h4>
                          <span className="text-[10px] text-app-text-muted font-sans">The municipal crew has completed repairs. Verify below to archive.</span>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <textarea
                          placeholder="Provide audit remarks (e.g., pavement laid smooth, water flow stopped completely)..."
                          value={citizenResolveRemarks}
                          onChange={(e) => setCitizenResolveRemarks(e.target.value)}
                          className="w-full bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl px-4 py-3 text-xs text-app-text placeholder-app-text-muted/60 focus:outline-none focus:border-emerald-500/50"
                        />
                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => handleCitizenResolutionConfirm(selectedIssue.id, true)}
                            className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold cursor-pointer min-h-[44px]"
                          >
                            Verify & Close Task ✓ (+20 Pts)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleCitizenResolutionConfirm(selectedIssue.id, false)}
                            className="py-2.5 px-4 bg-transparent hover:bg-red-500/10 hover:text-red-500 border border-red-500/40 text-red-600 dark:text-red-400 rounded-xl text-xs font-bold cursor-pointer min-h-[44px]"
                          >
                            Reject & Dispute Work ✗
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Discussion comment threads */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-mono text-app-text-muted uppercase block font-bold">Active Discussion Thread & updates</span>

                    <div className="space-y-2 max-h-[150px] overflow-y-auto pr-1">
                      {!selectedIssue.comments || !Array.isArray(selectedIssue.comments) || selectedIssue.comments.length === 0 ? (
                        <p className="text-[11px] text-app-text-muted italic pb-1">No comments posted yet. Engage in municipal coordination.</p>
                      ) : (
                        (selectedIssue.comments || []).map((comment) => {
                          const profile = getCitizenProfile(comment.user || "", comment.user || "");
                          return (
                            <div key={comment.id} className="p-3 bg-app-bg border border-app-border rounded-xl flex gap-2.5 items-start">
                              <img
                                src={profile.avatarUrl}
                                alt={profile.name}
                                className="h-7 w-7 rounded-full shrink-0 object-cover border border-app-border"
                                referrerPolicy="no-referrer"
                              />
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-[11px] font-bold text-app-text">{profile.name}</span>
                                  <span className="text-[9px] px-1.5 py-0.2 bg-app-card font-mono text-app-text-muted border border-app-border rounded">
                                    {comment.role}
                                  </span>
                                  <span className="text-[9px] font-mono text-app-text-muted font-medium">
                                    {new Date(comment.timestamp).toLocaleTimeString()}
                                  </span>
                                </div>
                                <p className="text-[11px] text-app-text-muted mt-0.5 leading-relaxed font-sans">{comment.text}</p>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Post comment form */}
                    <form onSubmit={(e) => handleAddComment(e, selectedIssue.id)} className="flex gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        placeholder="Post a coordination update / evidence remarks..."
                        required
                        className="flex-1 bg-app-input-bg border-[1.5px] border-app-input-border rounded-xl px-4 py-3 text-xs text-app-text placeholder-app-text-muted/60 focus:outline-none focus:border-cyan-500/50"
                      />
                      <button
                        type="submit"
                        className="py-3 px-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-bold transition-all min-h-[44px]"
                      >
                        Post Comment
                      </button>
                    </form>
                  </div>

                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-24 select-none">
                  <ShieldCheck className="h-12 w-12 text-app-text-muted/30 mb-3 animate-pulse" />
                  <p className="text-xs text-app-text font-bold">Select a Complaint Node</p>
                  <p className="text-[11px] text-app-text-muted mt-1 max-w-[320px] font-sans">
                    Select any reported ticket listed on the left panel to trigger the full interactive diagnostic suite.
                  </p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 3: Official Analytics & Predictive dashboards */}
        {activeTab === "scorecard" && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">

            {/* Left Column: Official Scorecard and AI Predictive Engine (Upgrade 6 & 10) */}
            <div className="xl:col-span-8 space-y-6">

              <GovernmentScorecard issues={issues} />

              {/* NEW: AI Predictive Infrastructure Risk & Community Impact Dashboard */}
              <div className="bg-[#050914] border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">

                <div className="border-b border-slate-850 pb-3 flex justify-between items-center flex-wrap gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase flex items-center gap-1.5">
                      <TrendingUp className="h-4 w-4 text-emerald-400" />
                      Community Impact & Predictive Risk Dashboard
                    </h3>
                    <p className="text-[11px] text-slate-500 font-sans leading-none mt-1">
                      Hyperlocal predictive simulations derived from neural incident reports.
                    </p>
                  </div>
                  <span className="text-[10px] bg-emerald-950/40 text-emerald-400 border border-emerald-900/60 font-mono px-2 py-0.5 rounded">
                    Engine State: Operational
                  </span>
                </div>

                {/* Impact stats boxes (Upgrade 10) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 bg-slate-900/70 border border-slate-850 rounded-xl flex items-center gap-3">
                    <Users className="h-8 w-8 text-cyan-400 bg-cyan-950/20 p-1.5 rounded-lg border border-cyan-900/30" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Citizens Protected</span>
                      <span className="text-sm font-black text-white">8,240 Souls</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/70 border border-slate-850 rounded-xl flex items-center gap-3">
                    <Clock className="h-8 w-8 text-emerald-400 bg-emerald-950/20 p-1.5 rounded-lg border border-emerald-900/30" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">SLA Reduction Rate</span>
                      <span className="text-sm font-black text-white">-28.4% Faster</span>
                    </div>
                  </div>
                  <div className="p-4 bg-slate-900/70 border border-slate-850 rounded-xl flex items-center gap-3">
                    <LineChart className="h-8 w-8 text-purple-400 bg-purple-950/20 p-1.5 rounded-lg border border-purple-900/30" />
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 uppercase block">Anomalies Detected</span>
                      <span className="text-sm font-black text-white">2 Active</span>
                    </div>
                  </div>
                </div>

                {/* Risk & Preventative recommendations list (Upgrade 6) */}
                <div className="space-y-3">
                  <span className="text-[10px] font-mono text-slate-400 uppercase block">Imminent Infrastructure Danger Predictions</span>

                  <div className="space-y-2.5">

                    <div className="p-3.5 bg-slate-900 border border-slate-850 rounded-xl flex items-start gap-3.5 hover:border-slate-800 transition">
                      <div className="p-1.5 bg-rose-950/50 rounded border border-rose-900 text-rose-400 font-mono text-xs font-bold leading-none shrink-0">
                        WARD 12
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-250">Sector 4 Power Grid Secondary Overload</span>
                          <span className="text-[8px] bg-rose-600/10 border border-rose-800 text-rose-400 font-mono px-1 rounded">86% Risk</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Consecutive rain precipitation sensors suggest high structural moisture seepage. Transformer junctions may experience severe sparking failures if secondary insulation plates are not pre-installed.
                        </p>
                        <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 leading-none pt-1">
                          ⚡ PREVENTATIVE TASK: Deploy secondary water shield claddings on grid terminals.
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 bg-slate-900 border border-slate-850 rounded-xl flex items-start gap-3.5 hover:border-slate-800 transition">
                      <div className="p-1.5 bg-amber-950/50 rounded border border-amber-900 text-amber-400 font-mono text-xs font-bold leading-none shrink-0">
                        WARD 10
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-250">Apollo General Hospital Water Line Corrosion</span>
                          <span className="text-[8px] bg-amber-600/10 border border-amber-800 text-amber-400 font-mono px-1 rounded">71% Risk</span>
                        </div>
                        <p className="text-[11px] text-slate-400 leading-normal">
                          Flow-rate pressure drops recorded adjacent to Apollo hospital. Water pipeline fracture risks secondary structural shifting of pedestrian sidewalks due to high fluid leakage.
                        </p>
                        <p className="text-[10px] text-cyan-400 font-mono flex items-center gap-1 leading-none pt-1">
                          🔧 PREVENTATIVE TASK: Deploy ground-penetrating radar scan to inspect subterranean conduits.
                        </p>
                      </div>
                    </div>

                  </div>
                </div>

              </div>

            </div>

            {/* Right Column: Citizen Reputation Leaderboard sidebar */}
            <div className="xl:col-span-4 bg-slate-950 border border-slate-850 rounded-2xl p-5 shadow-xl space-y-4">

              <div>
                <h3 className="text-sm font-bold tracking-wide text-white uppercase flex items-center gap-2">
                  <Award className="h-4.5 w-4.5 text-yellow-500" />
                  CITIZEN REPUTATION LEADERBOARD
                </h3>
                <span className="text-[11px] text-slate-500 block font-sans leading-none mt-1">
                  Active municipal validators performing verification audits.
                </span>
              </div>

              {/* Leaderboard entries */}
              <div className="space-y-2.5">
                {(usersLeaderboard || []).map((usr, index) => {
                  if (!usr) return null;
                  const profile = getCitizenProfile(usr.email || "", usr.name || "");
                  let badgeIcon = "🥉";
                  if (index === 0) badgeIcon = "🥇";
                  else if (index === 1) badgeIcon = "🥈";

                  const isMe = usr.email && currentUser && usr.email === currentUser.email;

                  return (
                    <div
                      key={usr.email || index}
                      className={`p-3 border rounded-xl flex justify-between items-center group relative cursor-help transition-all ${isMe
                        ? "bg-cyan-950/20 border-cyan-800/80 shadow shadow-cyan-950"
                        : "bg-slate-900 border-slate-850 hover:border-slate-800 hover:bg-slate-900/80"
                        }`}
                    >
                      {/* Premium Hover Card (Audit Profile Tooltip) */}
                      <div className="absolute right-0 bottom-full mb-2 z-40 w-72 p-4 bg-[#0a0e1a] border border-cyan-800/60 rounded-2xl shadow-2xl opacity-0 scale-95 translate-y-1 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 pointer-events-none duration-200 ease-out flex flex-col gap-3 select-none">
                        <div className="flex gap-3 items-center">
                          <img
                            src={profile.avatarUrl}
                            alt={profile.name}
                            className="h-12 w-12 rounded-xl object-cover border border-cyan-500/30 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="space-y-0.5 min-w-0">
                            <h4 className="text-xs font-black text-slate-100 leading-none truncate uppercase">{profile.name}</h4>
                            <span className="text-[9px] font-mono text-cyan-400 font-bold bg-cyan-955/40 border border-cyan-900/60 px-1.5 py-0.2 rounded inline-block">
                              {profile.badge}
                            </span>
                            <span className="text-[9px] text-slate-500 block font-sans font-medium">{profile.verificationLevel}</span>
                          </div>
                        </div>

                        <div className="h-px bg-slate-850" />

                        <div className="grid grid-cols-2 gap-2 text-[10px] font-mono leading-none">
                          <div className="bg-slate-950 p-2 border border-slate-850 rounded-lg text-center space-y-1">
                            <span className="text-[8px] text-slate-550 uppercase">Precision</span>
                            <span className="text-emerald-400 font-bold block">{profile.accuracyRate}</span>
                          </div>
                          <div className="bg-slate-950 p-2 border border-slate-850 rounded-lg text-center space-y-1">
                            <span className="text-[8px] text-slate-550 uppercase">Active Tenure</span>
                            <span className="text-slate-300 font-bold block">{profile.joinedDate}</span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center text-[9px] font-sans">
                          <span className="text-slate-500">System Standing:</span>
                          <span className="text-cyan-400 font-bold font-mono">Top {index + 1} Validator</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={profile.avatarUrl}
                            alt={profile.name}
                            className={`h-9.5 w-9.5 rounded-xl object-cover border shrink-0 ${index === 0
                              ? "border-yellow-500/80 shadow-md shadow-yellow-500/10"
                              : index === 1
                                ? "border-slate-300/80 shadow-md shadow-slate-300/10"
                                : "border-amber-600/80"
                              }`}
                            referrerPolicy="no-referrer"
                          />
                          <span className="absolute -top-1.5 -left-1.5 text-xs bg-[#070b13] border border-slate-800 rounded-full h-4.5 w-4.5 flex items-center justify-center font-bold">
                            {badgeIcon}
                          </span>
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-slate-200 leading-none">
                              {profile.name}
                            </span>
                            {isMe && (
                              <span className="text-[8px] font-mono px-1 bg-cyan-700 text-white rounded font-bold">
                                ME
                              </span>
                            )}
                          </div>

                          <div className="flex gap-1.5 mt-1 items-center">
                            <span className="text-[9px] font-mono font-bold text-cyan-500/80">
                              {profile.badge}
                            </span>
                          </div>
                        </div>
                      </div>

                      <span className="text-xs font-mono font-bold text-cyan-400 bg-slate-950/40 border border-slate-850 px-2.5 py-0.5 rounded-lg">
                        {usr.reputationPoints || profile.reputation} Pts
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Badges rules info */}
              <div className="p-3 bg-slate-900 border border-slate-850 rounded-xl space-y-2 select-none">
                <span className="text-[9px] font-mono text-slate-400 uppercase block leading-none">Reputation Credit Matrix:</span>
                <div className="space-y-1 text-[10px] font-sans text-slate-500 leading-normal">
                  <div className="flex justify-between">
                    <span>Verify existing incident exists:</span>
                    <span className="text-cyan-400 font-bold font-mono">+10 Points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Register verified structural report:</span>
                    <span className="text-cyan-400 font-bold font-mono">+15 Points</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Approve completed resolution task:</span>
                    <span className="text-cyan-400 font-bold font-mono">+20 Points</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}

        {activeTab === "municipal" && (
          <MunicipalHeadquarters
            issues={issues}
            onRefreshIssues={fetchIssues}
            currentUserEmail={currentUser.email}
            googleAccessToken={googleAccessToken}
            onConnectGoogleDrive={handleGoogleSignIn}
          />
        )}

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-850 bg-[#050914] py-8 text-center select-none mt-10">
        <p className="text-[10px] font-mono text-slate-600 uppercase tracking-widest leading-none">
          CIVICHERO ENGINE • HYPERLOCAL INTEGRATION MODULE • VIBESMART DISTRICT WARD
        </p>
      </footer>

      {/* FLOATING CHATBOT WIDGET BUTTON & WINDOW (Upgrade 5) */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

        {/* Toggle Chatbot Window */}
        {isChatOpen && (
          <div className="w-80 sm:w-96 h-[460px] bg-[#050914] border border-cyan-900/60 rounded-2xl shadow-2xl flex flex-col overflow-hidden mb-3 animate-[slideUp_0.25s_ease-out]">

            {/* Chatbot Header */}
            <div className="p-3 bg-cyan-950/60 border-b border-cyan-900/40 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400 animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-white leading-none">CivicHero AI Advisor</h4>
                  <span className="text-[9px] text-cyan-400 font-mono mt-0.5 block">Online • Live Intelligence</span>
                </div>
              </div>
              <button
                onClick={() => setIsChatOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-900"
              >
                <X className="h-4.5 w-4.5" />
              </button>
            </div>

            {/* Chatbot Messages */}
            <div className="flex-1 p-3 overflow-y-auto space-y-3 font-sans bg-slate-950/50">
              {chatMessages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div className={`max-w-[80%] rounded-xl p-2.5 text-xs leading-relaxed shadow-md ${msg.sender === "user"
                    ? "bg-cyan-600 text-white rounded-br-none"
                    : "bg-slate-900 border border-slate-800 text-slate-200 rounded-bl-none"
                    }`}>
                    <ReactMarkdown>
                      {msg.text}
                    </ReactMarkdown>
                  </div>
                </div>
              ))}

              {isChatLoading && (
                <div className="flex justify-start">
                  <div className="bg-slate-900 border border-slate-800 text-slate-400 rounded-xl p-2.5 text-xs flex items-center gap-1.5 animate-pulse">
                    <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                    Synthesizing reply...
                  </div>
                </div>
              )}
            </div>

            {/* Chatbot Suggestion Chips */}
            <div className="p-2 border-t border-slate-900/60 bg-[#050914] flex gap-1.5 overflow-x-auto whitespace-nowrap">
              <button
                type="button"
                onClick={() => sendQuickPrompt("Identify active school zone hazards")}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded font-mono text-[9px] cursor-pointer"
              >
                🏫 School Hazards
              </button>
              <button
                type="button"
                onClick={() => sendQuickPrompt("Show department scorecards and resolution rates")}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded font-mono text-[9px] cursor-pointer"
              >
                📊 Scorecards
              </button>
              <button
                type="button"
                onClick={() => sendQuickPrompt("Recommend preventative actions for flooding")}
                className="px-2 py-1 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-cyan-400 rounded font-mono text-[9px] cursor-pointer"
              >
                🌊 Flood Hazards
              </button>
            </div>

            {/* Chatbot Input form */}
            <form onSubmit={handleChatSubmit} className="p-2.5 bg-slate-950 border-t border-slate-850 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask about active hazards, metrics..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500/50"
              />
              <button
                type="submit"
                disabled={isChatLoading || !chatInput.trim()}
                className="p-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white rounded-xl shadow cursor-pointer"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </form>

          </div>
        )}

        {/* Floating rounded launcher button */}
        <button
          onClick={() => setIsChatOpen(!isChatOpen)}
          className="h-12 w-12 rounded-full bg-cyan-600 hover:bg-cyan-500 text-white shadow-2xl flex items-center justify-center cursor-pointer hover:scale-105 transition active:scale-95"
          title="Open AI Civic Advisor Chat"
        >
          <Sparkles className="h-6 w-6 animate-pulse" />
        </button>

      </div>

      {/* AI DUPLICATE INTERCEPT DIALOG MODAL OVERLAY (Upgrade 3) */}
      {duplicateWarning && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-xl bg-slate-950 border-2 border-amber-900/50 rounded-2xl overflow-hidden shadow-2xl">

            {/* Modal Header */}
            <div className="p-4 bg-amber-950/30 border-b border-amber-900/30 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-600/10 border border-amber-500 flex items-center justify-center text-amber-500">
                <AlertCircle className="h-5 w-5 animate-bounce" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-wider">AI Duplicate Detection Warning</h3>
                <span className="text-[10px] text-amber-500 font-mono uppercase block leading-none">Similarity Overlap Score Detected at 94%</span>
              </div>
            </div>

            {/* Modal Body: Comparison */}
            <div className="p-5 space-y-4 text-xs font-sans">

              <p className="text-[11.5px] text-slate-300 leading-relaxed">
                Our database analyzer flagged a highly corresponding active incident. To ensure optimized city resource allocation, you can merge your report with the existing block or register a new distinct ticket.
              </p>

              {/* Duplicate Details Card */}
              <div className="p-4 bg-slate-900 border border-slate-850 rounded-xl space-y-2">
                <span className="text-[9px] font-mono text-amber-500 uppercase block">Existing Active Ticket</span>
                <p className="text-xs font-bold text-white">📍 {duplicateWarning.duplicateTitle}</p>
                <p className="text-[11px] text-slate-400 italic">
                  "{duplicateWarning.reason}"
                </p>
                <div className="flex gap-2 text-[9px] font-mono text-slate-500 pt-1.5 border-t border-slate-850">
                  <span>Coordinates: ~12 meters away</span>
                  <span>• Category Overlap Match</span>
                </div>
              </div>

              {/* Your Draft vs Existing Info Box */}
              <div className="grid grid-cols-2 gap-3.5 pt-1">
                <div className="p-3 bg-slate-900/40 rounded-lg border border-slate-850/60">
                  <span className="text-[9.5px] font-mono text-slate-500 block uppercase mb-1">Your Drafted Report</span>
                  <p className="text-xs font-semibold text-slate-300 leading-snug truncate">{formTitle}</p>
                  <p className="text-[10px] text-slate-500 truncate mt-0.5">{formCategory}</p>
                </div>
                <div className="p-3 bg-cyan-950/15 rounded-lg border border-cyan-900/30">
                  <span className="text-[9.5px] font-mono text-cyan-400 block uppercase mb-1">Existing Match Node</span>
                  <p className="text-xs font-semibold text-cyan-300 leading-snug truncate">{duplicateWarning.duplicateTitle}</p>
                  <p className="text-[10px] text-cyan-500 truncate mt-0.5">{formCategory}</p>
                </div>
              </div>

            </div>

            {/* Modal Actions */}
            <div className="p-4 bg-[#050914] border-t border-slate-900 flex flex-col sm:flex-row justify-end gap-2">

              {/* Force Unique submission */}
              <button
                type="button"
                onClick={() => handleFormSubmit(null as any, true)}
                className="py-2 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-mono cursor-pointer transition"
              >
                Force Independent Report
              </button>

              {/* Merge & Join */}
              <button
                type="button"
                onClick={() => handleJoinExisting(duplicateWarning.duplicateId!)}
                className="py-2 px-5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-cyan-600/15 cursor-pointer transition flex items-center justify-center gap-1.5"
              >
                <Users className="h-4 w-4" />
                Merge & Join Existing Complaint (+10 Pts)
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
