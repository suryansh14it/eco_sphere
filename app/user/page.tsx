"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  Award,
  Bell,
  BookOpen,
  Brain,
  Calendar,
  Camera,
  CheckCircle,
  ChevronDown,
  Droplets,
  Languages,
  Leaf,
  MapPin,
  Play,
  Plus,
  Star,
  TreePine,
  TrendingUp,
  User,
  Users,
  AlertTriangle,
  Home,
  FileText,
  Trophy,
  GraduationCap,
  Route,
  Video,
  HelpCircle,
  Landmark,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import QuizModal from "@/components/quiz-modal"
import { UserMenu } from "@/components/user-menu"
import { XPAnimation, useQuizToasts } from "@/components/quiz-animations"
import { MobileNav } from "@/components/ui/mobile-nav"
import { useAuth } from "@/components/auth-provider"
import { useUserProgress } from "@/hooks/use-user-progress"
import { formatDistanceToNow } from "date-fns"
import EnvironmentalJourney from "@/components/environmental-journey"
import { JoinProjectsModal } from "@/components/join-projects-modal"
import { PDFInfoModal } from "@/components/pdf-info-modal"
import { ProjectDetailsModal } from "@/components/project-details-modal"
import { UserAttendanceModal } from "@/components/user-attendance-modal"
import { useToast } from "@/hooks/use-toast"
import { Clock } from "lucide-react"

/**
 * Shape the JoinProjectsModal expects, filled from the real volunteer
 * project board (GET /api/projects). Fake progress/impact fields stay
 * neutral - only what projects actually have is shown.
 */
interface AvailableProjectDetailed {
  id: string
  title: string
  organization: string
  location: string
  startDate: string
  endDate: string
  participants: number
  maxParticipants: number
  progress: number
  status: "active" | "completed" | "upcoming"
  impact: string
  xp: string
  description: string
  environmentalImpact: { type: string; metrics: Record<string, number> }
  goals: string[]
  requirements: string[]
  updates: { date: string; content: string }[]
  coordinator: { name: string; contact: string }
}

interface JoinedRealProject {
  id: string
  title: string
  organization: string
  status: string
  totalFilled: number
  totalSlots: number
  joinedAt?: string
}

/** Maps /api/projects board entries to the modal + project-card shapes. */
function mapLiveProject(p: any): AvailableProjectDetailed {
  const loc = [p.location?.address, p.location?.district, p.location?.state]
    .filter(Boolean)
    .join(", ");
  const slots = p.totalSlots || 0;
  const filled = p.totalFilled || 0;
  const coordinator = p.ngo || { name: "NGO", email: "" };
  return {
    id: p.id,
    title: p.title,
    organization: coordinator.name || "NGO",
    location: loc || "Not specified",
    startDate: p.startsAt ? String(p.startsAt).slice(0, 10) : "—",
    endDate: p.endsAt ? String(p.endsAt).slice(0, 10) : "—",
    participants: filled,
    maxParticipants: Math.max(slots, 1),
    progress: slots > 0 ? Math.round((filled / slots) * 100) : 0,
    status: p.status === "open" ? "active" : p.status === "completed" ? "completed" : "upcoming",
    impact: "Community-led",
    xp: "+5 XP",
    description: p.description || "",
    environmentalImpact: { type: "Volunteer project", metrics: {} },
    goals: (p.roles || []).map((r: any) => r.title).filter(Boolean),
    requirements: [],
    updates: [],
    coordinator: { name: coordinator.name || "NGO", contact: coordinator.email || "" },
  };
}


const languageOptions = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "bn", name: "Bengali", nativeName: "বাংলা" },
  { code: "ta", name: "Tamil", nativeName: "தமிழ்" },
  { code: "te", name: "Telugu", nativeName: "తెలుగు" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
]

export default function UserDashboard() {
  const [issueTitle, setIssueTitle] = useState("")
  const [issueLocation, setIssueLocation] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [language, setLanguage] = useState<"en" | "hi" | "bn" | "ta" | "te" | "mr">("en")
  const [activeSection, setActiveSection] = useState("dashboard")
  const [educationSubsection, setEducationSubsection] = useState("videos")
  const [quizModalOpen, setQuizModalOpen] = useState(false)
  const [pdfModalOpen, setPdfModalOpen] = useState(false)
  const [projectModalOpen, setProjectModalOpen] = useState(false)
  const [attendanceModalOpen, setAttendanceModalOpen] = useState(false)
  const [selectedProjectForAttendance, setSelectedProjectForAttendance] = useState<any>(null)
  const [attendanceType, setAttendanceType] = useState<'checkin' | 'checkout'>('checkin')
  const [checkedInProjects, setCheckedInProjects] = useState<Set<string>>(new Set())
  const [selectedPdf, setSelectedPdf] = useState<any>(null)
  const [selectedProject, setSelectedProject] = useState<any>(null)
  const [quizMaterial, setQuizMaterial] = useState<{
    title: string;
    type: string;
    id: string;
    description?: string;
  } | null>(null)
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const {
    addUserXP,
    markItemAsComplete,
    isItemCompleted,
    calculateXpForNextLevel,
    userXp,
    userLevel,
  xpForNextLevel,
    userImpact,
    activityHistory,
    completedItems: completedItemsArray,
    isLoading: progressLoading
  } = useUserProgress();
  
  // Convert completed items array to a Set for faster lookups
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  // XP Animation states
  const [showXP, setShowXP] = useState(false);
  const [earnedXP, setEarnedXP] = useState(0);
  const [showIssueXP, setShowIssueXP] = useState(false);
  
  // Real volunteer-project data. Joined projects + what is open to join;
  // both come straight from the /api/projects board.
  const [availableProjects, setAvailableProjects] = useState<AvailableProjectDetailed[]>([])
  const [joinedProjects, setJoinedProjects] = useState<JoinedRealProject[]>([])
  const [joinedProjectIds, setJoinedProjectIds] = useState(new Set<string>())
  const [projectsLoading, setProjectsLoading] = useState(true)

  // Government-created projects: offered to community users in their own
  // section (never shown to NGOs and never mixed with NGO volunteer work).
  const [govtProjects, setGovtProjects] = useState<any[]>([])
  const [govtProjectsLoading, setGovtProjectsLoading] = useState(true)

  // Get the current language object
  const currentLanguage = languageOptions.find(l => l.code === language) || languageOptions[0]
  
  // Redirect users to their correct dashboard based on role
  useEffect(() => {
    if (!loading && user && user.role !== 'user') {
      console.log(`User dashboard: Redirecting ${user.role} user to their dashboard`);
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);

  // Load real volunteer projects: what I joined + what is open to join
  useEffect(() => {
    if (loading || !user) return;
    if (user.role !== "user") return;
    let cancelled = false;
    (async () => {
      try {
        const [joinedRes, openRes] = await Promise.all([
          fetch("/api/projects?joined=1&limit=100", { credentials: "include" }),
          fetch("/api/projects?status=open&limit=100"),
        ]);
        const joinedData = await joinedRes.json();
        const openData = await openRes.json();
        if (!joinedRes.ok || !joinedData.success) {
          throw new Error(joinedData.message || "Could not load your projects.");
        }
        if (!openRes.ok || !openData.success) {
          throw new Error(openData.message || "Could not load available projects.");
        }
        if (cancelled) return;
        setJoinedProjects(
          ((joinedData.projects || []) as any[]).map((p) => ({
            id: p.id,
            title: p.title,
            organization: p.ngo?.name || "NGO",
            status: p.status,
            totalFilled: p.totalFilled || 0,
            totalSlots: p.totalSlots || 0,
          }))
        );
        setJoinedProjectIds(new Set(((joinedData.projects || []) as any[]).map((p) => p.id)));
        setAvailableProjects(((openData.projects || []) as any[]).map(mapLiveProject));
      } catch (error: any) {
        console.error("Error loading volunteer projects:", error);
      } finally {
        if (!cancelled) setProjectsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading]);

  // Government projects are loaded separately: they are community-joinable
  // programmes the government opened directly.
  useEffect(() => {
    if (loading || !user || user.role !== "user") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/projects?source=government&limit=100");
        const data = await res.json();
        if (!cancelled) {
          if (res.ok && data.success) {
            setGovtProjects((data.projects || []).filter((p: any) => p.source === "government"));
          }
        }
      } catch (e) {
        console.error("Error loading government projects:", e);
      } finally {
        if (!cancelled) setGovtProjectsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, loading, joinedProjectIds]);
  
  // Update completedItems Set from array when available
  useEffect(() => {
    if (completedItemsArray && completedItemsArray.length > 0) {
      setCompletedItems(new Set(completedItemsArray));
    }
  }, [completedItemsArray]);
  
  // Handle XP animation completion
  const handleXPAnimationComplete = () => {
    setShowXP(false);
    setShowIssueXP(false);
  };

  // Show loading only while auth provider is loading
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-green-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const handleEducationClick = (item: { id: string; type: string; title: string; description?: string; filename?: string; authors?: string[] | string; journal?: string; publicationDate?: string; abstract?: string; topics?: string[]; pageCount?: number; keywords?: string[]; citation?: string; doi?: string }) => {
    if (item.type === 'video') {
      setQuizMaterial({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description
      });
      setQuizModalOpen(true);
    } else if (item.type === 'pdf' && item.filename) {
      // Process authors properly whether they're a string or array
      let authorArray: string[] = [];
      
      if (Array.isArray(item.authors)) {
        authorArray = item.authors;
      } else if (typeof item.authors === 'string') {
        // If it's a string, split by comma or just use the whole string
        authorArray = item.authors.includes(',') ? item.authors.split(',').map(a => a.trim()) : [item.authors];
      } else {
        authorArray = ["Unknown Author"];
      }
      
  // Get publication date (fallback to a default year string)
  const pubDate = item.publicationDate || "2023";
      
      // Set selected PDF for modal
      setSelectedPdf({
        id: item.id,
        title: item.title,
        authors: authorArray,
        journal: item.journal || "Environmental Journal",
        publicationDate: pubDate,
        abstract: item.abstract || "This research paper explores environmental conservation strategies.",
        topics: item.topics || ["Environment", "Conservation"],
        fileName: item.filename,
        pageCount: item.pageCount || 10,
        keywords: item.keywords || ["environment", "research", "sustainability"],
        citation: item.citation || `${authorArray.join(", ")} (${pubDate}). ${item.title}. ${item.journal || "Environmental Journal"}.`,
        doi: item.doi
      });
      setPdfModalOpen(true);
    }
  };

  const toggleCompletion = async (itemId: string, item: any) => {
    // If already completed, do nothing (we don't allow uncompleting items)
    if (completedItems.has(itemId)) {
      return;
    }
    
    // If it's a learning material, show the quiz instead of directly marking complete
    if (item.type === 'video' || item.type === 'pdf') {
      handleEducationClick(item);
      return;
    }
    
    // For other types of items, mark as complete directly
    const result = await markItemAsComplete(
      itemId,
      item.type || 'content',
      item.title || 'Content item',
      15 // Default XP amount
    );
    
    if (result.success) {
      // Update local completion state
      const newCompletedItems = new Set(completedItems);
      newCompletedItems.add(itemId);
      setCompletedItems(newCompletedItems);
      
      // Show XP animation
      setEarnedXP(15);
      setShowXP(true);
    }
  };
  
  const handleQuizComplete = async (score: number) => {
    if (!quizMaterial) return;
    
    // Calculate XP based on score with more generous rewards
    // Base XP: 10 points for attempting
    // Score bonus: up to 25 extra points based on performance
    // Perfect score bonus: additional 10 points for 100%
    const baseXP = 10;
    const scoreBonus = Math.floor((score / 100) * 25);
    const perfectBonus = score === 100 ? 10 : 0;
    const totalXP = baseXP + scoreBonus + perfectBonus;
    
    console.log(`Quiz completed with score: ${score}%, Total XP: ${totalXP}`);
    console.log('Current user XP before completion:', userXp);
    
    // Mark the quiz as completed and award XP
    const result = await markItemAsComplete(
      quizMaterial.id,
      'quiz',
      quizMaterial.title,
      totalXP
    );
    
    console.log('Mark item complete result:', result);
    
    if (result.success) {
      // Update local completion state
      const newCompletedItems = new Set(completedItems);
      newCompletedItems.add(quizMaterial.id);
      setCompletedItems(newCompletedItems);
      
      // Show XP animation
      setEarnedXP(totalXP);
      setShowXP(true);
      
      console.log(`XP animation triggered with ${totalXP} XP`);
      console.log('Current user XP after completion:', userXp);
      
      // Force a small delay and log the XP again to see if it updates
      setTimeout(() => {
        console.log('User XP after 1 second delay:', userXp);
      }, 1000);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
    console.log("[v0] Files uploaded:", files.length)
  }

  // Attendance functions
  const handleMarkAttendance = (project: any, type: 'checkin' | 'checkout') => {
    setSelectedProjectForAttendance({
      id: project.id,
      title: project.title,
      organization: project.organization,
      location: project.location || "Project Location",
      coordinates: project.coordinates // Add coordinates if available
    });
    setAttendanceType(type);
    setAttendanceModalOpen(true);
  };

  const handleAttendanceSuccess = () => {
    if (selectedProjectForAttendance && attendanceType === 'checkin') {
      setCheckedInProjects(prev => new Set([...prev, selectedProjectForAttendance.id]));
      toast({
        title: "Check-in Successful",
        description: `You have successfully checked in to ${selectedProjectForAttendance.title}.`,
      });
    } else if (selectedProjectForAttendance && attendanceType === 'checkout') {
      setCheckedInProjects(prev => {
        const newSet = new Set(prev);
        newSet.delete(selectedProjectForAttendance.id);
        return newSet;
      });
      toast({
        title: "Check-out Successful", 
        description: `You have successfully checked out of ${selectedProjectForAttendance.title}.`,
      });
    }
    setAttendanceModalOpen(false);
    setSelectedProjectForAttendance(null);
  };

  const hasCheckedInProjects = checkedInProjects.size > 0;
  
  const translations = {
    en: {
      welcome: `Welcome back, ${user?.name || 'User'}!`,
      progress: "You've made amazing progress this month. Keep up the great work for our planet!",
      level: "Level 7 Eco-Warrior",
      impactPoints: "Impact Points",
      myImpact: "My Environmental Impact",
      xpPoints: "XP Points",
      treesPlanted: "Trees Planted",
      co2Offset: "CO₂ Offset",
      waterSaved: "Water Saved",
      progressToNext: "Progress to Level 8",
      xpNeeded: "XP needed for next level",
      activeProjects: "My Active Projects",
      joinMore: "Join More",
      participants: "joined",
      timeLeft: "left",
      reportIssue: "Report Environmental Issue",
      spottedIssue: "Spotted an Environmental Issue?",
      reportDescription:
        "Help protect our environment by reporting pollution, illegal dumping, deforestation, or other environmental concerns in your area.",
      reportButton: "Report Issue (+10 XP)",
      photoEvidence: "Photo Evidence",
      gpsLocation: "GPS Location",
      leaderboard: "Community Leaderboard",
      viewFullLeaderboard: "View Full Leaderboard",
      educationHub: "Environmental Education Hub",
      environmentalJourney: "My Environmental Journey",
      today: "Today",
      daysAgo: "days ago",
      weekAgo: "week ago",
      weeksAgo: "weeks ago",
      monthAgo: "month ago",
      dashboard: "Dashboard",
      myActiveProjects: "My Active Projects",
      communityLeaderboard: "Community Leaderboard",
      environmentEducationHub: "Environment Education Hub",
      myEnvironmentalJourney: "My Environmental Journey",
      educationalVideos: "Educational Videos",
      environmentalQuiz: "Environmental Quiz",
    },

    // ... existing code for other languages ...

    hi: {
      welcome: "वापसी पर स्वागत है, अर्जुन!",
      progress: "इस महीने आपने अद्भुत प्रगति की है। हमारे ग्रह के लिए महान कार्य जारी रखें!",
      level: "स्तर 7 पर्यावरण योद्धा",
      impactPoints: "प्रभाव अंक",
      myImpact: "मेरा पर्यावरणीय प्रभाव",
      xpPoints: "XP अंक",
      treesPlanted: "पेड़ लगाए",
      co2Offset: "CO₂ कमी",
      waterSaved: "पानी बचाया",
      progressToNext: "स्तर 8 की प्रगति",
      xpNeeded: "अगले स्तर के लिए XP चाहिए",
      activeProjects: "मेरी सक्रिय परियोजनाएं",
      joinMore: "और जुड़ें",
      participants: "शामिल हुए",
      timeLeft: "बचा है",
      reportIssue: "पर्यावरणीय समस्या की रिपोर्ट करें",
      spottedIssue: "कोई पर्यावरणीय समस्या देखी?",
      reportDescription:
        "प्रदूषण, अवैध डंपिंग, वनों की कटाई, या अपने क्षेत्र में अन्य पर्यावरणीय चिंताओं की रिपोर्ट करके हमारे पर्यावरण की रक्षा में मदद करें।",
      reportButton: "समस्या रिपोर्ट करें (+10 XP)",
      photoEvidence: "फोटो प्रमाण",
      gpsLocation: "GPS स्थान",
      leaderboard: "समुदायिक लीडरबोर्ड",
      viewFullLeaderboard: "पूरा लीडरबोर्ड देखें",
      educationHub: "पर्यावरणीय शिक्षा केंद्र",
      environmentalJourney: "मेरी पर्यावरणीय यात्रा",
      today: "आज",
      daysAgo: "दिन पहले",
      weekAgo: "सप्ताह पहले",
      weeksAgo: "सप्ताह पहले",
      monthAgo: "महीना पहले",
      dashboard: "डैशबोर्ड",
      myActiveProjects: "मेरी सक्रिय परियोजनाएं",
      communityLeaderboard: "समुदायिक लीडरबोर्ड",
      environmentEducationHub: "पर्यावरण शिक्षा केंद्र",
      myEnvironmentalJourney: "मेरी पर्यावरणीय यात्रा",
      educationalVideos: "शैक्षिक वीडियो",
      environmentalQuiz: "पर्यावरणीय प्रश्नोत्तरी",
    },

    bn: {
      welcome: "ফিরে আসার জন্য স্বাগতম, অর্জুন!",
      progress: "এই মাসে আপনি অসাধারণ অগ্রগতি করেছেন। আমাদের গ্রহের জন্য দুর্দান্ত কাজ চালিয়ে যান!",
      level: "স্তর ৭ পরিবেশ যোদ্ধা",
      impactPoints: "প্রভাব পয়েন্ট",
      myImpact: "আমার পরিবেশগত প্রভাব",
      xpPoints: "XP পয়েন্ট",
      treesPlanted: "গাছ লাগানো",
      co2Offset: "CO₂ হ্রাস",
      waterSaved: "পানি সাশ্রয়",
      progressToNext: "স্তর ৮ এর অগ্রগতি",
      xpNeeded: "পরবর্তী স্তরের জন্য XP প্রয়োজন",
      activeProjects: "আমার সক্রিয় প্রকল্প",
      joinMore: "আরো যোগ দিন",
      participants: "যোগ দিয়েছে",
      timeLeft: "বাকি",
      reportIssue: "পরিবেশগত সমস্যা রিপোর্ট করুন",
      spottedIssue: "কোনো পরিবেশগত সমস্যা দেখেছেন?",
      reportDescription:
        "দূষণ, অবৈধ ডাম্পিং, বন উজাড়, বা আপনার এলাকার অন্যান্য পরিবেশগত উদ্বেগ রিপোর্ট করে আমাদের পরিবেশ রক্ষায় সহায়তা করুন।",
      reportButton: "সমস্যা রিপোর্ট করুন (+১০ XP)",
      photoEvidence: "ছবির প্রমাণ",
      gpsLocation: "GPS অবস্থান",
      leaderboard: "কমিউনিটি লিডারবোর্ড",
      viewFullLeaderboard: "সম্পূর্ণ লিডারবোর্ড দেখুন",
      educationHub: "পরিবেশগত শিক্ষা কেন্দ্র",
      environmentalJourney: "আমার পরিবেশগত যাত্রা",
      today: "আজ",
      daysAgo: "দিন আগে",
      weekAgo: "সপ্তাহ আগে",
      weeksAgo: "সপ্তাহ আগে",
      monthAgo: "মাস আগে",
      dashboard: "ড্যাশবোর্ড",
      myActiveProjects: "আমার সক্রিয় প্রকল্প",
      communityLeaderboard: "কমিউনিটি লিডারবোর্ড",
      environmentEducationHub: "পরিবেশ শিক্ষা কেন্দ্র",
      myEnvironmentalJourney: "আমার পরিবেশগত যাত্রা",
      educationalVideos: "শিক্ষামূলক ভিডিও",
      environmentalQuiz: "পরিবেশগত কুইজ",
    },

    ta: {
      welcome: "மீண்டும் வரவேற்கிறோம், அர்ஜுன்!",
      progress: "இந்த மாதம் நீங்கள் அற்புதமான முன்னேற்றம் அடைந்துள்ளீர்கள். நமது கிரகத்திற்கான சிறந்த பணியைத் தொடருங்கள்!",
      level: "நிலை 7 சுற்றுச்சூழல் வீரர்",
      impactPoints: "தாக்க புள்ளிகள்",
      myImpact: "எனது சுற்றுச்சூழல் தாக்கம்",
      xpPoints: "XP புள்ளிகள்",
      treesPlanted: "மரங்கள் நடப்பட்டன",
      co2Offset: "CO₂ குறைப்பு",
      waterSaved: "நீர் சேமிப்பு",
      progressToNext: "நிலை 8 க்கான முன்னேற்றம்",
      xpNeeded: "அடுத்த நிலைக்கு XP தேவை",
      activeProjects: "எனது செயலில் உள்ள திட்டங்கள்",
      joinMore: "மேலும் சேரவும்",
      participants: "சேர்ந்தனர்",
      timeLeft: "மீதம்",
      reportIssue: "சுற்றுச்சூழல் பிரச்சினையை புகாரளிக்கவும்",
      spottedIssue: "ஏதேனும் சுற்றுச்சூழல் பிரச்சினையைக் கண்டீர்களா?",
      reportDescription:
        "மாசுபாடு, சட்டவிரோத குப்பை கொட்டுதல், காடழிப்பு, அல்லது உங்கள் பகுதியில் உள்ள பிற சுற்றுச்சூழல் கவலைகளை புகாரளிப்பதன் மூலம் நமது சுற்றுச்சூழலைப் பாதுகாக்க உதவுங்கள்.",
      reportButton: "பிரச்சினையை புகாரளிக்கவும் (+10 XP)",
      photoEvidence: "புகைப்பட ஆதாரம்",
      gpsLocation: "GPS இடம்",
      leaderboard: "சமூக லீடர்போர்டு",
      viewFullLeaderboard: "முழு லீடர்போர்டைப் பார்க்கவும்",
      educationHub: "சுற்றுச்சூழல் கல்வி மையம்",
      environmentalJourney: "எனது சுற்றுச்சூழல் பயணம்",
      today: "இன்று",
      daysAgo: "நாட்களுக்கு முன்பு",
      weekAgo: "வாரத்திற்கு முன்பு",
      weeksAgo: "வாரங்களுக்கு முன்பு",
      monthAgo: "மாதத்திற்கு முன்பு",
      dashboard: "டாஷ்போர்டு",
      myActiveProjects: "எனது செயலில் உள்ள திட்டங்கள்",
      communityLeaderboard: "சமூக லீடர்போர்டு",
      environmentEducationHub: "சுற்றுச்சூழல் கல்வி மையம்",
      myEnvironmentalJourney: "எனது சுற்றுச்சூழல் பயணம்",
      educationalVideos: "கல்வி வீடியோக்கள்",
      environmentalQuiz: "சுற்றுச்சூழல் வினாடி வினா",
    },

    te: {
      welcome: "తిరిగి స్వాగతం, అర్జున్!",
      progress: "ఈ నెలలో మీరు అద్భుతమైన పురోగతి సాధించారు. మన గ్రహం కోసం గొప్ప పనిని కొనసాగించండి!",
      level: "స్థాయి 7 పర్యావరణ యోధుడు",
      impactPoints: "ప్రభావ పాయింట్లు",
      myImpact: "నా పర్యావరణ ప్రభావం",
      xpPoints: "XP పాయింట్లు",
      treesPlanted: "చెట్లు నాటబడ్డాయి",
      co2Offset: "CO₂ తగ్గింపు",
      waterSaved: "నీరు ఆదా",
      progressToNext: "స్థాయి 8 కు పురోగతి",
      xpNeeded: "తదుపరి స్థాయికి XP అవసరం",
      activeProjects: "నా క్రియాశీల ప్రాజెక్టులు",
      joinMore: "మరిన్ని చేరండి",
      participants: "చేరారు",
      timeLeft: "మిగిలింది",
      reportIssue: "పర్యావరణ సమస్యను నివేదించండి",
      spottedIssue: "ఏదైనా పర్యావరణ సమస్యను గమనించారా?",
      reportDescription:
        "కాలుష్యం, చట్టవిరుద్ధ డంపింగ్, అటవీ నిర్మూలన, లేదా మీ ప్రాంతంలోని ఇతర పర్యావరణ ఆందోళనలను నివేదించడం ద్వారా మన పర్యావరణాన్ని రక్షించడంలో సహాయపడండి.",
      reportButton: "సమస్యను నివేదించండి (+10 XP)",
      photoEvidence: "ఫోటో సాక్ష్యం",
      gpsLocation: "GPS స్థానం",
      leaderboard: "కమ్యూనిటీ లీడర్‌బోర్డ్",
      viewFullLeaderboard: "పూర్తి లీడర్‌బోర్డ్ చూడండి",
      educationHub: "పర్యావరణ విద్యా కేంద్రం",
      environmentalJourney: "నా పర్యావరణ ప్రయాణం",
      today: "ఈరోజు",
      daysAgo: "రోజుల క్రితం",
      weekAgo: "వారం క్రితం",
      weeksAgo: "వారాల క్రితం",
      monthAgo: "నెల క్రితం",
      dashboard: "డాష్‌బోర్డ్",
      myActiveProjects: "నా క్రియాశీల ప్రాజెక్టులు",
      communityLeaderboard: "కమ్యూనిటీ లీడర్‌బోర్డ్",
      environmentEducationHub: "పర్యావరణ విద్యా కేంద్రం",
      myEnvironmentalJourney: "నా పర్యావరణ ప్రయాణం",
      educationalVideos: "విద్యా వీడియోలు",
      environmentalQuiz: "పర్యావరణ క్విజ్",
    },

    mr: {
      welcome: "परत आल्याबद्दल स्वागत, अर्जुन!",
      progress: "या महिन्यात तुम्ही आश्चर्यकारक प्रगती केली आहे. आमच्या ग्रहासाठी उत्कृष्ट कार्य चालू ठेवा!",
      level: "स्तर 7 पर्यावरण योद्धा",
      impactPoints: "प्रभाव गुण",
      myImpact: "माझा पर्यावरणीय प्रभाव",
      xpPoints: "XP गुण",
      treesPlanted: "झाडे लावली",
      co2Offset: "CO₂ कमी",
      waterSaved: "पाणी वाचवले",
      progressToNext: "स्तर 8 ची प्रगती",
      xpNeeded: "पुढील स्तरासाठी XP आवश्यक",
      activeProjects: "माझे सक्रिय प्रकल्प",
      joinMore: "अधिक सामील व्हा",
      participants: "सामील झाले",
      timeLeft: "शिल्लक",
      reportIssue: "पर्यावरणीय समस्येचा अहवाल द्या",
      spottedIssue: "काही पर्यावरणीय समस्या दिसली?",
      reportDescription:
        "प्रदूषण, बेकायदेशीर डंपिंग, जंगलतोड, किंवा तुमच्या भागातील इतर पर्यावरणीय चिंतांचा अहवाल देऊन आमच्या पर्यावरणाचे संरक्षण करण्यात मदत करा.",
      reportButton: "समस्येचा अहवाल द्या (+10 XP)",
      photoEvidence: "फोटो पुरावा",
      gpsLocation: "GPS स्थान",
      leaderboard: "समुदाय लीडरबोर्ड",
      viewFullLeaderboard: "संपूर्ण लीडरबोर्ड पहा",
      educationHub: "पर्यावरणीय शिक्षण केंद्र",
      environmentalJourney: "माझा पर्यावरणीय प्रवास",
      today: "आज",
      daysAgo: "दिवसांपूर्वी",
      weekAgo: "आठवड्यापूर्वी",
      weeksAgo: "आठवड्यांपूर्वी",
      monthAgo: "महिन्यापूर्वी",
      dashboard: "डॅशबोर्ड",
      myActiveProjects: "माझे सक्रिय प्रकल्प",
      communityLeaderboard: "समुदाय लीडरबोर्ड",
      environmentEducationHub: "पर्यावरण शिक्षण केंद्र",
      myEnvironmentalJourney: "माझा पर्यावरणीय प्रवास",
      educationalVideos: "शैक्षणिक व्हिडिओ",
      environmentalQuiz: "पर्यावरणीय प्रश्नमंजुषा",
    },
  }

  const t = translations[language]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 glass border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-green-500 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <span className="font-serif font-bold text-xl text-foreground">EcoSpace</span>
          </div>

          <div className="flex items-center gap-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="flex items-center gap-2">
                  <Languages className="w-4 h-4" />
                  <span className="text-sm">{currentLanguage?.nativeName}</span>
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-40">
                {languageOptions.map((lang) => (
                  <DropdownMenuItem
                    key={lang.code}
                    onClick={() => setLanguage(lang.code as any)}
                    className={`flex items-center justify-between ${
                      language === lang.code ? "bg-emerald-50 text-emerald-700" : ""
                    }`}
                  >
                    <span>{lang.name}</span>
                    <span className="text-sm font-medium">{lang.nativeName}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button
              variant="ghost"
              size="sm"
              className="relative"
              onClick={() => console.log("[v0] Notifications clicked")}
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full"></span>
            </Button>
            {/* Use the UserMenu component here */}
            <UserMenu />
            
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="w-64 min-h-screen glass border-r">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeSection === "dashboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "dashboard" ? "bg-emerald-500 text-white hover:bg-emerald-600" : "hover:bg-emerald-50"
              }`}
              onClick={() => setActiveSection("dashboard")}
            >
              <Home className="w-4 h-4 mr-3" />
              {t.dashboard}
            </Button>
            <Button
              variant={activeSection === "my-active-projects" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "my-active-projects"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "hover:bg-emerald-50"
              }`}
              onClick={() => setActiveSection("my-active-projects")}
            >
              <TreePine className="w-4 h-4 mr-3" />
              {t.myActiveProjects}
            </Button>
            <Button
              variant={activeSection === "report-issue" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "report-issue"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "hover:bg-emerald-50"
              }`}
              onClick={() => setActiveSection("report-issue")}
            >
              <FileText className="w-4 h-4 mr-3" />
              {t.reportIssue}
            </Button>
            <Button
              variant={activeSection === "govt-projects" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "govt-projects"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "hover:bg-emerald-50"
              }`}
              onClick={() => setActiveSection("govt-projects")}
            >
              <Landmark className="w-4 h-4 mr-3" />
              Government Projects
            </Button>
            <Link href="/issues">
              <Button variant="ghost" className="w-full justify-start hover:bg-emerald-50">
                <Users className="w-4 h-4 mr-3" />
                Public Issue Board
              </Button>
            </Link>
            <Button
              variant={activeSection === "community-leaderboard" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "community-leaderboard"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "hover:bg-emerald-50"
              }`}
              onClick={() => setActiveSection("community-leaderboard")}
            >
              <Trophy className="w-4 h-4 mr-3" />
              {t.communityLeaderboard}
            </Button>
            <Button
              variant={activeSection === "education-hub" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "education-hub"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "hover:bg-emerald-50"
              }`}
              onClick={() => setActiveSection("education-hub")}
            >
              <GraduationCap className="w-4 h-4 mr-3" />
              {t.environmentEducationHub}
            </Button>
            <Button
              variant={activeSection === "environmental-journey" ? "default" : "ghost"}
              className={`w-full justify-start ${
                activeSection === "environmental-journey"
                  ? "bg-emerald-500 text-white hover:bg-emerald-600"
                  : "hover:bg-emerald-50"
              }`}
              onClick={() => setActiveSection("environmental-journey")}
            >
              <Route className="w-4 h-4 mr-3" />
              {t.myEnvironmentalJourney}
            </Button>
          </nav>
        </aside>

        <main className="flex-1 p-6">
          {activeSection === "dashboard" && (
            <div className="space-y-6">
              {/* Hero Header with Welcome Message */}
              <div className="glass-strong rounded-3xl p-8 text-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10" />
                <div className="relative z-10">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-4">
                    <TreePine className="w-10 h-10 text-white animate-pulse" />
                  </div>
                  <h1 className="font-serif font-bold text-3xl text-foreground mb-2">{t.welcome}</h1>
                  <p className="text-lg text-emerald-600 mb-6">{t.progress}</p>
                  <div className="flex items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                      <span className="text-emerald-600 font-medium">Level {userLevel} Eco-Warrior</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-emerald-600">{userXp} {t.impactPoints}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkout Alert - Show if user has checked-in projects */}
              {hasCheckedInProjects && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <Clock className="h-5 w-5 text-orange-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-orange-800">
                        Don't forget to check out!
                      </h3>
                      <p className="text-sm text-orange-700 mt-1">
                        You have {checkedInProjects.size} active project{checkedInProjects.size > 1 ? 's' : ''} checked in. 
                        Remember to check out when you're done to track your contribution hours.
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActiveSection("my-active-projects")}
                      className="bg-orange-100 border-orange-300 text-orange-700 hover:bg-orange-200"
                    >
                      Check Out
                    </Button>
                  </div>
                </div>
              )}

              {/* My Impact Graphic */}
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <Award className="w-5 h-5 text-emerald-600" />
                    {t.myImpact}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Circular Progress Chart */}
                    <div className="flex items-center justify-center">
                      <div className="relative w-32 h-32">
                        <div className="absolute inset-0 rounded-full bg-gradient-to-r from-emerald-500 to-green-500 p-1">
                          <div className="w-full h-full rounded-full bg-background flex items-center justify-center">
                            <div className="text-center">
                              <div className="text-2xl font-bold text-emerald-600">{userXp.toLocaleString()}</div>
                              <div className="text-xs text-emerald-600">{t.xpPoints}</div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Impact Stats */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 rounded-lg bg-emerald-50">
                        <TreePine className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-emerald-600">{userImpact.treesPlanted}</div>
                        <div className="text-xs text-emerald-600">{t.treesPlanted}</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-green-50">
                        <Leaf className="w-6 h-6 text-green-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-green-600">{userImpact.co2Offset}kg</div>
                        <div className="text-xs text-emerald-600">{t.co2Offset}</div>
                      </div>
                      <div className="text-center p-3 rounded-lg bg-teal-50">
                        <Droplets className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                        <div className="text-lg font-bold text-teal-600">{userImpact.waterSaved}L</div>
                        <div className="text-xs text-emerald-600">{t.waterSaved}</div>
                      </div>
                    </div>

                    {/* Progress to Next Level */}
                    {/* Progress to Next Level */}
                    <div className="space-y-2">
                      {(() => {
                        const xpInfo = calculateXpForNextLevel();
                        const nextLevel = userLevel + 1;
                        const totalForNext = xpForNextLevel || Math.pow(userLevel, 2) * 10; // fallback if needed
                        return (
                          <>
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-emerald-600">Progress to Level {nextLevel}</span>
                              <span className="font-medium">{userXp} / {totalForNext} XP</span>
                            </div>
                            <Progress value={xpInfo.percentage} className="h-2" />
                            <p className="text-xs text-emerald-600">{xpInfo.needed} XP {t.xpNeeded}</p>
                          </>
                        );
                      })()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "my-active-projects" && (
            <Card className="glass">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-serif">{t.activeProjects}</CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-transparent"
                  onClick={() => setProjectModalOpen(true)}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.joinMore}
                </Button>
              </CardHeader>
              <CardContent>
                {projectsLoading ? (
                  <div className="py-8 text-center text-sm text-muted-foreground">
                    Loading your projects...
                  </div>
                ) : joinedProjects.length === 0 ? (
                  <div className="py-8 text-center">
                    <TreePine className="mx-auto mb-3 h-10 w-10 text-emerald-300" />
                    <p className="font-medium text-foreground mb-1">No projects joined yet</p>
                    <p className="mb-4 text-sm text-muted-foreground">
                      Join an NGO volunteer project and it will show up here.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-transparent"
                      onClick={() => setProjectModalOpen(true)}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {t.joinMore}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {joinedProjects.map((project) => (
                      <div
                        key={project.id}
                        className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/50"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-foreground">{project.title}</h4>
                          <Badge
                            variant="outline"
                            className={
                              project.status === "open"
                                ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                : "bg-stone-100 text-stone-600 border-stone-200"
                            }
                          >
                            {project.status === "open"
                              ? "Recruiting"
                              : project.status === "completed"
                                ? "Completed"
                                : "Closed"}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          By <span className="font-medium">{project.organization}</span>
                        </p>

                        <div className="flex items-center justify-between text-sm mb-3">
                          <span className="flex items-center text-emerald-700 gap-1">
                            <Users className="h-3.5 w-3.5" />
                            {project.totalFilled} of {project.totalSlots} volunteers signed up
                          </span>
                          {project.joinedAt && (
                            <span className="flex items-center text-stone-500 gap-1">
                              <Clock className="h-3.5 w-3.5" />
                              {formatDistanceToNow(new Date(project.joinedAt), { addSuffix: true })}
                            </span>
                          )}
                        </div>

                        <div className="mt-2">
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span>Volunteers signed up</span>
                            <span>
                              {project.totalSlots > 0
                                ? Math.round((project.totalFilled / project.totalSlots) * 100)
                                : 0}
                              %
                            </span>
                          </div>
                          <Progress
                            value={
                              project.totalSlots > 0
                                ? (project.totalFilled / project.totalSlots) * 100
                                : 0
                            }
                            className="h-2"
                          />
                        </div>

                        <div className="mt-3">
                          <Link href={`/projects/${project.id}`}>
                            <Button variant="outline" size="sm" className="w-full bg-transparent">
                              View project page
                            </Button>
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "govt-projects" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-sky-600" />
                  Government Projects
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Volunteer projects opened directly by the government. Pick a role on the project
                  page to join — NGOs are not part of these.
                </p>
              </CardHeader>
              <CardContent>
                {govtProjectsLoading ? (
                  <div className="py-10 text-center text-sm text-muted-foreground">
                    Loading government projects...
                  </div>
                ) : govtProjects.length === 0 ? (
                  <div className="py-10 text-center">
                    <Landmark className="mx-auto mb-3 h-10 w-10 text-sky-200" />
                    <p className="font-medium text-foreground mb-1">No government projects yet</p>
                    <p className="text-sm text-muted-foreground">
                      When the government opens a volunteer project, it appears here first.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {govtProjects.map((project: any) => {
                      const loc = [
                        project.location?.address,
                        project.location?.district,
                        project.location?.state,
                      ]
                        .filter(Boolean)
                        .join(", ");
                      const joined = joinedProjectIds.has(project.id);
                      const full = project.totalSlots > 0 && project.totalFilled >= project.totalSlots;
                      return (
                        <div
                          key={project.id}
                          className="p-4 rounded-lg border border-sky-200 bg-sky-50/50"
                        >
                          <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                            <div className="flex-1">
                              <h4 className="font-medium text-foreground">{project.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                By <span className="font-medium">{project.ngo?.name}</span> (Government)
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              {joined && (
                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Joined
                                </Badge>
                              )}
                              <Badge variant="outline" className="bg-sky-100 text-sky-800 border-sky-200">
                                Government project
                              </Badge>
                            </div>
                          </div>
                          <p className="text-sm text-stone-600 mb-3 line-clamp-2">{project.description}</p>
                          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-2">
                            <span className="flex items-center gap-1">
                              <MapPin className="h-3.5 w-3.5" />
                              {loc || "Not specified"}
                            </span>
                            <span className="flex items-center gap-1">
                              <Users className="h-3.5 w-3.5" />
                              {project.totalFilled} of {project.totalSlots} slots filled
                            </span>
                          </div>
                          {project.roles?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mb-3">
                              {project.roles.map((role: any) => (
                                <Badge
                                  key={role.id}
                                  variant="outline"
                                  className={
                                    role.filled >= role.slots
                                      ? "bg-stone-100 text-stone-500 border-stone-200"
                                      : "bg-emerald-50 text-emerald-700 border-emerald-200"
                                  }
                                >
                                  {role.title} · {role.slots - role.filled} of {role.slots} open
                                </Badge>
                              ))}
                            </div>
                          )}
                          <Link href={`/projects/${project.id}`}>
                            <Button
                              size="sm"
                              className="bg-sky-600 hover:bg-sky-700 text-white"
                              disabled={project.status !== "open" || joined}
                            >
                              {joined
                                ? "Already joined"
                                : project.status !== "open"
                                  ? "Not open for volunteers"
                                  : full
                                    ? "View project"
                                    : "Pick a role & join"}
                            </Button>
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {activeSection === "report-issue" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <Camera className="w-5 h-5 text-orange-600" />
                  {t.reportIssue}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center mx-auto">
                    <AlertTriangle className="w-10 h-10 text-white" />
                  </div>
                  <div>
                    <h3 className="font-medium text-foreground mb-2">{t.spottedIssue}</h3>
                    <p className="text-sm text-emerald-600 mb-4">{t.reportDescription}</p>
                  </div>
                  <Link href="/report-issue">
                    <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">{t.reportButton}</Button>
                  </Link>
                  <div className="grid grid-cols-2 gap-3 text-xs text-emerald-600">
                    <div className="flex items-center gap-1">
                      <Camera className="w-3 h-3" />
                      <span>{t.photoEvidence}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      <span>{t.gpsLocation}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {activeSection === "community-leaderboard" && (
            <Card className="glass">
              <CardHeader>
                <CardTitle className="text-lg font-serif flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-yellow-600" />
                  {t.leaderboard}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* ... existing leaderboard content ... */}
                <div className="space-y-3">
                  {[
                    { name: user?.name || "Priya Sharma", points: userXp > 3240 ? userXp : 3240, rank: 1, change: "up", avatar: user?.name ? user?.name.substring(0, 2).toUpperCase() : "PS" },
                    { name: "Rahul Kumar", points: 2890, rank: 2, change: "same", avatar: "RK" },
                    { name: "Arjun Patel", points: 2450, rank: 3, change: "up", avatar: "AP" },
                    { name: "Sneha Gupta", points: 2180, rank: 4, change: "down", avatar: "SG" },
                    { name: "Vikram Singh", points: 1950, rank: 5, change: "up", avatar: "VS" },
                  ].map((leaderboardUser, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                        leaderboardUser.name === user?.name ? "bg-emerald-100 border border-emerald-200" : "bg-emerald-50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-emerald-600">#{leaderboardUser.rank}</span>
                          {leaderboardUser.change === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                          {leaderboardUser.change === "down" && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                          <span className="text-xs font-bold text-white">{leaderboardUser.avatar}</span>
                        </div>
                        <span className="font-medium text-foreground">{leaderboardUser.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-emerald-600">{leaderboardUser.points.toLocaleString()}</span>
                        <span className="text-xs text-emerald-600">XP</span>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full mt-4 bg-transparent"
                  onClick={() => console.log("[v0] View Full Leaderboard clicked")}
                >
                  {t.viewFullLeaderboard}
                </Button>
              </CardContent>
            </Card>
          )}

          {activeSection === "education-hub" && (
            <div className="space-y-6">
              <Card className="glass">
                <CardHeader>
                  <CardTitle className="text-lg font-serif flex items-center gap-2">
                    <BookOpen className="w-5 h-5 text-blue-600" />
                    {t.educationHub}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2 mb-6">
                    <Button
                      variant={educationSubsection === "videos" ? "default" : "outline"}
                      size="sm"
                      className={`${
                        educationSubsection === "videos"
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "hover:bg-emerald-50"
                      }`}
                      onClick={() => setEducationSubsection("videos")}
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {t.educationalVideos}
                    </Button>
                    <Button
                      variant={educationSubsection === "pdfs" ? "default" : "outline"}
                      size="sm"
                      className={`${
                        educationSubsection === "pdfs"
                          ? "bg-emerald-500 text-white hover:bg-emerald-600"
                          : "hover:bg-emerald-50"
                      }`}
                      onClick={() => setEducationSubsection("pdfs")}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      {language === "en" ? "Research Papers" : "शोध पत्र"}
                    </Button>
                  </div>

                  {educationSubsection === "videos" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          id: "video-1",
                          type: "video",
                          title: language === "en" ? "Climate Change Basics" : "जलवायु परिवर्तन मूल बातें",
                          duration: language === "en" ? "5 min" : "5 मिनट",
                          xp: "+5 XP",
                          description: language === "en" ? "Understanding the fundamentals of climate change" : "जलवायु परिवर्तन की मूल बातें समझना",
                          level: language === "en" ? "Beginner" : "शुरुआती",
                          url: "https://youtu.be/k_yIpmLNMqU",
                          youtubeId: "k_yIpmLNMqU",
                        },
                        {
                          id: "video-2",
                          type: "video", 
                          title: language === "en" ? "Ocean Conservation" : "समुद्री संरक्षण",
                          duration: language === "en" ? "8 min" : "8 मिनट",
                          xp: "+8 XP",
                          description: language === "en" ? "Protecting our marine ecosystems" : "हमारे समुद्री पारिस्थितिक तंत्र की रक्षा",
                          level: language === "en" ? "Intermediate" : "मध्यम",
                          url: "https://youtu.be/Xu_GqF3yiHA",
                          youtubeId: "Xu_GqF3yiHA",
                        },
                        {
                          id: "video-3",
                          type: "video",
                          title: language === "en" ? "Renewable Energy Solutions" : "नवीकरणीय ऊर्जा समाधान",
                          duration: language === "en" ? "12 min" : "12 मिनट",
                          xp: "+12 XP",
                          description: language === "en" ? "Exploring sustainable energy alternatives" : "स्थायी ऊर्जा विकल्पों की खोज",
                          level: language === "en" ? "Advanced" : "उन्नत",
                          url: "https://youtu.be/HbW_WAIZ2OE",
                          youtubeId: "HbW_WAIZ2OE",
                        },
                        {
                          id: "video-4",
                          type: "video",
                          title: language === "en" ? "Sustainable Agriculture" : "टिकाऊ कृषि",
                          duration: language === "en" ? "6 min" : "6 मिनट",
                          xp: "+6 XP",
                          description: language === "en" ? "Eco-friendly farming practices" : "पर्यावरण अनुकूल कृषि प्रथाएं",
                          level: language === "en" ? "Beginner" : "शुरुआती",
                          url: "https://youtu.be/ipVxxxqwBQw",
                          youtubeId: "ipVxxxqwBQw",
                        },
                        {
                          id: "video-5",
                          type: "video",
                          title: language === "en" ? "Wildlife Protection" : "वन्यजीव संरक्षण",
                          duration: language === "en" ? "10 min" : "10 मिनट",
                          xp: "+10 XP",
                          description: language === "en" ? "Preserving species and ecosystems" : "प्रजातियों और पारिस्थितिक तंत्र का संरक्षण",
                          level: language === "en" ? "Intermediate" : "मध्यम",
                          url: "https://youtu.be/wbR-5mHI6bo",
                          youtubeId: "wbR-5mHI6bo",
                        },
                        {
                          id: "video-6",
                          type: "video",
                          title: language === "en" ? "Green Technology" : "हरित प्रौद्योगिकी",
                          duration: language === "en" ? "15 min" : "15 मिनट",
                          xp: "+15 XP",
                          description: language === "en" ? "Eco-friendly technological innovations" : "पर्यावरण अनुकूल तकनीकी नवाचार",
                          level: language === "en" ? "Advanced" : "उन्नत",
                          url: "https://youtu.be/LxgMdjyw8uw",
                          youtubeId: "LxgMdjyw8uw",
                        },
                        {
                          id: "video-7",
                          type: "video",
                          title: language === "en" ? "Sustainability in Practice" : "व्यवहार में स्थिरता",
                          duration: language === "en" ? "9 min" : "9 मिनट",
                          xp: "+9 XP",
                          description: language === "en" ? "Real-world sustainability case studies" : "वास्तविक दुनिया के स्थिरता केस अध्ययन",
                          level: language === "en" ? "Intermediate" : "मध्यम",
                          url: "https://youtu.be/RnvCbquYeIM",
                          youtubeId: "RnvCbquYeIM",
                        },
                      ].map((video) => (
                        <div
                          key={video.id}
                          className="group p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer hover:scale-105 relative"
                        >
                          {completedItems.has(video.id) && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div 
                            className="w-full h-24 rounded-lg mb-3 relative overflow-hidden"
                            onClick={() => handleEducationClick(video)}
                          >
                            <img
                              src={`https://img.youtube.com/vi/${(video as any).youtubeId}/hqdefault.jpg`}
                              alt={video.title}
                              className="w-full h-full object-cover"
                              loading="lazy"
                            />
                            <div className="absolute inset-0 bg-black/20" />
                            <Play className="w-8 h-8 text-white absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 drop-shadow" />
                            <div className="absolute top-2 right-2">
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                {video.level}
                              </Badge>
                            </div>
                          </div>
                          <h4 className="font-medium text-foreground mb-1 group-hover:text-emerald-600 transition-colors">
                            {video.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">{video.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>{video.duration}</span>
                            <Badge className="bg-emerald-100 text-emerald-700">{video.xp}</Badge>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm" className="flex-1">
                              <a href={(video as any).url} target="_blank" rel="noopener noreferrer">Watch</a>
                            </Button>
                            <Button
                              variant={completedItems.has(video.id) ? "secondary" : "outline"}
                              size="sm"
                              className="flex-1"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleCompletion(video.id, video);
                              }}
                            >
                              {completedItems.has(video.id) ? "Completed" : "Mark as Complete"}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* PDF Section */}
                  {educationSubsection === "pdfs" && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {[
                        {
                          id: "pdf-1",
                          type: "pdf",
                          title: "Marine Conservation Strategies",
                          filename: "1-s2.0-S0308597X14003182-main.pdf",
                          description: "Comprehensive research on ocean protection methods",
                          pages: "15 pages",
                          xp: "+15 XP",
                          authors: ["James R. Wilson", "Matthew S. Booker"],
                          journal: "Marine Policy",
                          publicationDate: "2014",
                          abstract: "This paper examines marine conservation practices in protected areas, analyzing the effectiveness of current strategies and proposing innovative approaches for sustainable resource management.",
                          topics: ["Marine Conservation", "Resource Management"],
                          pageCount: 15,
                          keywords: ["ocean", "conservation", "sustainable practices", "marine policy"],
                          citation: "Wilson, J.R., & Booker, M.S. (2014). Marine Conservation Strategies. Marine Policy, 45, 296-308."
                        },
                        {
                          id: "pdf-2", 
                          type: "pdf",
                          title: "Sustainable Development Goals",
                          filename: "1-s2.0-S0964569123001047-main.pdf",
                          description: "Analysis of environmental sustainability targets",
                          pages: "22 pages",
                          xp: "+20 XP",
                          authors: ["Eliza Chen", "Omar Al-Farsi"],
                          journal: "Ocean & Coastal Management",
                          publicationDate: "2023",
                          abstract: "This research evaluates progress toward the UN's Sustainable Development Goals related to marine ecosystems, highlighting challenges and opportunities in implementation across different regions.",
                          topics: ["Sustainable Development", "Policy", "Marine Ecosystems"],
                          pageCount: 22,
                          keywords: ["SDGs", "sustainability", "environmental policy", "marine conservation"],
                          citation: "Chen, E., & Al-Farsi, O. (2023). Sustainable Development Goals. Ocean & Coastal Management, 107, 123-145."
                        },
                        {
                          id: "pdf-3",
                          type: "pdf",
                          title: "Climate Change Impact Assessment",
                          filename: "10.1002@bse.2514.pdf",
                          description: "Business strategies for climate adaptation",
                          pages: "18 pages", 
                          xp: "+18 XP",
                          authors: ["Sarah Delgado", "Raj Patel"],
                          journal: "Business Strategy and the Environment",
                          publicationDate: "2021",
                          abstract: "An examination of how businesses are responding to climate challenges through adaptation strategies, risk assessments, and innovative operational changes to reduce environmental impact.",
                          topics: ["Climate Change", "Business Strategy", "Adaptation"],
                          pageCount: 18,
                          keywords: ["climate change", "business strategy", "adaptation", "risk assessment"],
                          citation: "Delgado, S., & Patel, R. (2021). Climate Change Impact Assessment. Business Strategy and the Environment, 30(4), 1859-1878."
                        },
                        {
                          id: "pdf-4",
                          type: "pdf",
                          title: "Environmental Management Systems",
                          filename: "10.1016@j.jenvman.2005.04.004.pdf",
                          description: "Framework for environmental management",
                          pages: "12 pages",
                          xp: "+12 XP",
                          authors: "Thomas Lee, Chang Wu",
                          journal: "Journal of Environmental Management",
                          publicationYear: "2005",
                          abstract: "This paper presents a comprehensive framework for implementing environmental management systems in organizations, with case studies demonstrating successful approaches across industries."
                        },
                        {
                          id: "pdf-5",
                          type: "pdf", 
                          title: "Conservation Biology Principles",
                          filename: "10.1111@cobi.13252.pdf",
                          description: "Modern approaches to biodiversity conservation",
                          pages: "25 pages",
                          xp: "+25 XP",
                          authors: "Maria Gonzalez, Peter Svenson",
                          journal: "Conservation Biology",
                          publicationYear: "2019",
                          abstract: "A review of contemporary conservation biology principles with emphasis on integrating traditional ecological knowledge with modern scientific approaches to protect biodiversity."
                        },
                        {
                          id: "pdf-6",
                          type: "pdf",
                          title: "Marine Resource Management",
                          filename: "fmars-3-1542705.pdf",
                          description: "Frontiers in marine science research",
                          pages: "20 pages",
                          xp: "+20 XP",
                          authors: "Alisha Patel, Richard Thompson",
                          journal: "Frontiers in Marine Science",
                          publicationYear: "2020",
                          abstract: "This research explores sustainable approaches to marine resource management, examining stakeholder collaboration, ecosystem-based management, and innovative conservation technologies."
                        },
                        {
                          id: "pdf-7",
                          type: "pdf",
                          title: "Collaborating for Marine Conservation",
                          filename: "Workshop-Report-Collaborating-for-Marine-Conservation-and-Resource-Management-in-the-Andaman-and-Nicoba.pdf",
                          description: "Workshop report on collaborative conservation efforts",
                          pages: "32 pages",
                          xp: "+30 XP",
                          authors: "Andaman Conservation Initiative",
                          journal: "Workshop Report",
                          publicationYear: "2022",
                          abstract: "Outcomes from a multi-stakeholder workshop addressing marine conservation challenges in the Andaman and Nicobar Islands, with emphasis on local community involvement and traditional ecological knowledge."
                        },
                        {
                          id: "pdf-8",
                          type: "pdf",
                          title: "Sustainability Best Practices",
                          filename: "sustainability-17-06371.pdf",
                          description: "Framework for environmental sustainability implementation",
                          pages: "28 pages",
                          xp: "+25 XP",
                          authors: "Julia Martinez, David Wong",
                          journal: "Sustainability",
                          publicationYear: "2023",
                          abstract: "A comprehensive analysis of best practices for implementing environmental sustainability measures across various sectors, with metrics for measuring progress and impact."
                        },
                        {
                          id: "pdf-9",
                          type: "pdf",
                          title: "Science Advances in Conservation",
                          filename: "sciadv.aay9969.pdf",
                          description: "Latest scientific advances in conservation biology",
                          pages: "18 pages",
                          xp: "+20 XP",
                          authors: "Emily Johnson, Hiroshi Tanaka",
                          journal: "Science Advances",
                          publicationYear: "2021",
                          abstract: "This paper presents groundbreaking research in conservation biology, highlighting technological innovations and methodological advances that are transforming the field."
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="group p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer hover:scale-105 relative"
                        >
                          {completedItems.has(item.id) && (
                            <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center z-10">
                              <CheckCircle className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div 
                            className="w-full h-24 rounded-lg mb-3 relative overflow-hidden bg-muted"
                            onClick={() => handleEducationClick(item)}
                          >
                            {/* Inline PDF preview (first page) */}
                            <object
                              data={`/Education/${item.filename}#page=1&view=FitH`}
                              type="application/pdf"
                              className="w-full h-full pointer-events-none"
                              aria-hidden="true"
                            >
                              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-blue-100">
                                <BookOpen className="w-8 h-8 text-green-600" />
                              </div>
                            </object>
                            <div className="absolute bottom-2 right-2">
                              <Badge className="bg-blue-100 text-blue-700 text-xs">
                                {item.publicationYear || "PDF"}
                              </Badge>
                            </div>
                          </div>
                          <h4 className="font-medium text-foreground mb-1 group-hover:text-emerald-600 transition-colors">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mb-2">{item.description}</p>
                          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                            <span>{item.pages}</span>
                            <Badge className="bg-emerald-100 text-emerald-700">{item.xp}</Badge>
                          </div>
                          <Button
                            variant={completedItems.has(item.id) ? "secondary" : "outline"}
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompletion(item.id, item);
                            }}
                          >
                            {completedItems.has(item.id) ? "Completed" : "Mark as Complete"}
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                </CardContent>
              </Card>
            </div>
          )}

          {activeSection === "environmental-journey" && (
            <div className="space-y-6">
              <EnvironmentalJourney 
                activityHistory={activityHistory} 
                language={language} 
                translations={translations} 
              />
            </div>
          )}
        </main>
      </div>
      
      {/* XP Animation for quiz/educational content */}
      <XPAnimation 
        show={showXP} 
        xp={earnedXP} 
        onComplete={handleXPAnimationComplete}
      />
      
      {/* XP Animation for issue reporting */}
      <XPAnimation 
        show={showIssueXP} 
        xp={10} 
        onComplete={handleXPAnimationComplete}
      />
      
      {/* Quiz Modal */}
      <QuizModal
        isOpen={quizModalOpen}
        onClose={() => setQuizModalOpen(false)}
        materialTitle={quizMaterial?.title || ''}
        materialType={quizMaterial?.type || ''}
        materialId={quizMaterial?.id || ''}
        materialDescription={quizMaterial?.description}
        onQuizComplete={handleQuizComplete}
      />
      
      {/* PDF Info Modal */}
      <PDFInfoModal 
        pdf={selectedPdf}
        open={pdfModalOpen}
        onOpenChange={setPdfModalOpen}
        onStartQuiz={() => {
          if (selectedPdf) {
            setQuizMaterial({
              id: selectedPdf.id,
              type: 'quiz',
              title: selectedPdf.title,
              description: `Quiz on "${selectedPdf.title}"`
            });
            setQuizModalOpen(true);
          }
        }}
      />

      {/* Join Projects Modal - Only for browsing and joining new projects */}
      <JoinProjectsModal
        open={projectModalOpen && selectedProject === null}
        onOpenChange={(open) => {
          if (!open) {
            setProjectModalOpen(false);
          }
        }}
        availableProjects={availableProjects}
        joinedProjectIds={Array.from(joinedProjectIds)}
        onJoinProject={(projectId) => {
          // Joining needs a role pick, so send people to the project page
          setProjectModalOpen(false);
          router.push(`/projects/${projectId}`);
        }}
      />

      {/* Project Details Modal - For viewing details of projects user is already part of */}
      <ProjectDetailsModal
        project={selectedProject}
        open={projectModalOpen && selectedProject !== null}
        onOpenChange={(open) => {
          if (!open) {
            setProjectModalOpen(false);
            setSelectedProject(null);
          }
        }}
      />

      {/* User Attendance Modal - For checking in/out of projects */}
      <UserAttendanceModal
        project={selectedProjectForAttendance}
        attendanceType={attendanceType}
        open={attendanceModalOpen}
        onClose={() => {
          setAttendanceModalOpen(false);
          setSelectedProjectForAttendance(null);
        }}
        onSuccess={handleAttendanceSuccess}
      />
    </div>
  )
}
