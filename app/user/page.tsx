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
  const [quizMaterial, setQuizMaterial] = useState<{
    title: string;
    type: string;
    id: string;
    description?: string;
  } | null>(null)
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    addUserXP,
    markItemAsComplete,
    isItemCompleted,
    calculateXpForNextLevel,
    userXp,
    userLevel,
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
  
  // Get the current language object
  const currentLanguage = languageOptions.find(l => l.code === language) || languageOptions[0]
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && user.role !== 'user') {
      router.push(`/${user.role}`);
    }
  }, [user, loading, router]);
  
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

  // If still loading or not authenticated, show loading
  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-emerald-50 via-green-50 to-lime-50">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-lg text-green-700">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Add functions for quiz interactions
  const handleEducationClick = (item: { id: string; type: string; title: string; description?: string }) => {
    if (item.type === 'video' || item.type === 'pdf') {
      setQuizMaterial({
        id: item.id,
        type: item.type,
        title: item.title,
        description: item.description
      });
      setQuizModalOpen(true);
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
                        const totalForNext = xpInfo.current + xpInfo.needed;
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
                  onClick={() => console.log("[v0] Join More clicked")}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  {t.joinMore}
                </Button>
              </CardHeader>
              <CardContent>
                {/* ... existing active projects content ... */}
                <div className="space-y-4">
                  {[
                    {
                      title: language === "en" ? "Community Garden Project" : "सामुदायिक बगीचा परियोजना",
                      progress: 75,
                      participants: 24,
                      deadline: language === "en" ? "2 weeks left" : "2 सप्ताह बचे",
                      impact: "+15 XP",
                    },
                    {
                      title: language === "en" ? "Beach Cleanup Initiative" : "समुद्री तट सफाई पहल",
                      progress: 45,
                      participants: 18,
                      deadline: language === "en" ? "1 month left" : "1 महीना बचा",
                      impact: "+25 XP",
                    },
                    {
                      title: language === "en" ? "Solar Panel Installation" : "सोलर पैनल स्थापना",
                      progress: 90,
                      participants: 12,
                      deadline: language === "en" ? "3 days left" : "3 दिन बचे",
                      impact: "+40 XP",
                    },
                  ].map((project, index) => (
                    <div
                      key={index}
                      className="p-4 rounded-lg bg-emerald-50 hover:bg-emerald-100 transition-colors cursor-pointer"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-foreground">{project.title}</h4>
                        <Badge className="bg-emerald-100 text-emerald-700">{project.impact}</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-emerald-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {project.participants} {t.participants}
                        </span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {project.deadline}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={project.progress} className="flex-1 h-2" />
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
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
                        },
                        {
                          id: "video-2",
                          type: "video", 
                          title: language === "en" ? "Ocean Conservation" : "समुद्री संरक्षण",
                          duration: language === "en" ? "8 min" : "8 मिनट",
                          xp: "+8 XP",
                          description: language === "en" ? "Protecting our marine ecosystems" : "हमारे समुद्री पारिस्थितिक तंत्र की रक्षा",
                          level: language === "en" ? "Intermediate" : "मध्यम",
                        },
                        {
                          id: "video-3",
                          type: "video",
                          title: language === "en" ? "Renewable Energy Solutions" : "नवीकरणीय ऊर्जा समाधान",
                          duration: language === "en" ? "12 min" : "12 मिनट",
                          xp: "+12 XP",
                          description: language === "en" ? "Exploring sustainable energy alternatives" : "स्थायी ऊर्जा विकल्पों की खोज",
                          level: language === "en" ? "Advanced" : "उन्नत",
                        },
                        {
                          id: "video-4",
                          type: "video",
                          title: language === "en" ? "Sustainable Agriculture" : "टिकाऊ कृषि",
                          duration: language === "en" ? "6 min" : "6 मिनट",
                          xp: "+6 XP",
                          description: language === "en" ? "Eco-friendly farming practices" : "पर्यावरण अनुकूल कृषि प्रथाएं",
                          level: language === "en" ? "Beginner" : "शुरुआती",
                        },
                        {
                          id: "video-5",
                          type: "video",
                          title: language === "en" ? "Wildlife Protection" : "वन्यजीव संरक्षण",
                          duration: language === "en" ? "10 min" : "10 मिनट",
                          xp: "+10 XP",
                          description: language === "en" ? "Preserving species and ecosystems" : "प्रजातियों और पारिस्थितिक तंत्र का संरक्षण",
                          level: language === "en" ? "Intermediate" : "मध्यम",
                        },
                        {
                          id: "video-6",
                          type: "video",
                          title: language === "en" ? "Green Technology" : "हरित प्रौद्योगिकी",
                          duration: language === "en" ? "15 min" : "15 मिनट",
                          xp: "+15 XP",
                          description: language === "en" ? "Eco-friendly technological innovations" : "पर्यावरण अनुकूल तकनीकी नवाचार",
                          level: language === "en" ? "Advanced" : "उन्नत",
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
                            className="w-full h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
                            onClick={() => handleEducationClick(video)}
                          >
                            <Play className="w-8 h-8 text-blue-600" />
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
                          <Button
                            variant={completedItems.has(video.id) ? "secondary" : "outline"}
                            size="sm"
                            className="w-full"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleCompletion(video.id, video);
                            }}
                          >
                            {completedItems.has(video.id) ? "Completed" : "Mark as Complete"}
                          </Button>
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
                        },
                        {
                          id: "pdf-2", 
                          type: "pdf",
                          title: "Sustainable Development Goals",
                          filename: "1-s2.0-S0964569123001047-main.pdf",
                          description: "Analysis of environmental sustainability targets",
                          pages: "22 pages",
                          xp: "+20 XP",
                        },
                        {
                          id: "pdf-3",
                          type: "pdf",
                          title: "Climate Change Impact Assessment",
                          filename: "10.1002@bse.2514.pdf",
                          description: "Business strategies for climate adaptation",
                          pages: "18 pages", 
                          xp: "+18 XP",
                        },
                        {
                          id: "pdf-4",
                          type: "pdf",
                          title: "Environmental Management Systems",
                          filename: "10.1016@j.jenvman.2005.04.004.pdf",
                          description: "Framework for environmental management",
                          pages: "12 pages",
                          xp: "+12 XP",
                        },
                        {
                          id: "pdf-5",
                          type: "pdf", 
                          title: "Conservation Biology Principles",
                          filename: "10.1111@cobi.13252.pdf",
                          description: "Modern approaches to biodiversity conservation",
                          pages: "25 pages",
                          xp: "+25 XP",
                        },
                        {
                          id: "pdf-6",
                          type: "pdf",
                          title: "Marine Resource Management",
                          filename: "fmars-3-1542705.pdf",
                          description: "Frontiers in marine science research",
                          pages: "20 pages",
                          xp: "+20 XP",
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
                            className="w-full h-24 bg-gradient-to-br from-green-100 to-blue-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden"
                            onClick={() => handleEducationClick(item)}
                          >
                            <BookOpen className="w-8 h-8 text-green-600" />
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
    </div>
  )
}
