"use client"

import type React from "react"
import Link from "next/link"
import { AlertTriangle } from "lucide-react"
import { ChevronDown } from "lucide-react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Bell,
  User,
  TreePine,
  Leaf,
  Droplets,
  Award,
  Camera,
  Play,
  BookOpen,
  Users,
  Calendar,
  Star,
  TrendingUp,
  MapPin,
  Heart,
  Share2,
  Plus,
  Languages,
} from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function UserDashboard() {
  const [issueTitle, setIssueTitle] = useState("")
  const [issueLocation, setIssueLocation] = useState("")
  const [issueDescription, setIssueDescription] = useState("")
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [language, setLanguage] = useState<"en" | "hi" | "bn" | "ta" | "te" | "mr">("en")

  const translations = {
    en: {
      welcome: "Welcome back, Arjun!",
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
    },
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
      educationHub: "पर्यावरण शिक्षा केंद्र",
      environmentalJourney: "मेरी पर्यावरणीय यात्रा",
      today: "आज",
      daysAgo: "दिन पहले",
      weekAgo: "सप्ताह पहले",
      weeksAgo: "सप्ताह पहले",
      monthAgo: "महीना पहले",
    },
    bn: {
      welcome: "স্বাগতম ফিরে, অর্জুন!",
      progress: "এই মাসে আপনি অসাধারণ অগ্রগতি করেছেন। আমাদের গ্রহের জন্য দুর্দান্ত কাজ চালিয়ে যান!",
      level: "লেভেল ৭ পরিবেশ যোদ্ধা",
      impactPoints: "প্রভাব পয়েন্ট",
      myImpact: "আমার পরিবেশগত প্রভাব",
      xpPoints: "XP পয়েন্ট",
      treesPlanted: "গাছ লাগানো",
      co2Offset: "CO₂ হ্রাস",
      waterSaved: "পানি সাশ্রয়",
      progressToNext: "লেভেল ৮ এর অগ্রগতি",
      xpNeeded: "পরবর্তী লেভেলের জন্য XP প্রয়োজন",
      activeProjects: "আমার সক্রিয় প্রকল্প",
      joinMore: "আরো যোগ দিন",
      participants: "যোগদান করেছে",
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
      educationHub: "পরিবেশ শিক্ষা কেন্দ্র",
      environmentalJourney: "আমার পরিবেশগত যাত্রা",
      today: "আজ",
      daysAgo: "দিন আগে",
      weekAgo: "সপ্তাহ আগে",
      weeksAgo: "সপ্তাহ আগে",
      monthAgo: "মাস আগে",
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
        "மாசுபாடு, சட்டவிரோத குப்பை கொட்டுதல், காடழிப்பு, அல்லது உங்கள் பகுதியில் உள்ள பிற சுற்றுச்சூழல் கவலைகளை புகாரளித்து நமது சுற்றுச்சூழலைப் பாதுகாக்க உதவுங்கள்.",
      reportButton: "பிரச்சினையை புகாரளிக்கவும் (+10 XP)",
      photoEvidence: "புகைப்பட ஆதாரம்",
      gpsLocation: "GPS இடம்",
      leaderboard: "சமூக லீடர்போர்டு",
      viewFullLeaderboard: "முழு லீடர்போர்டைப் பார்க்கவும்",
      educationHub: "சுற்றுச்சூழல் கல்வி மையம்",
      environmentalJourney: "எனது சுற்றுச்சூழல் பயணம்",
      today: "இன்று",
      daysAgo: "நாட்களுக்கு முன்பு",
      weekAgo: "வாரம் முன்பு",
      weeksAgo: "வாரங்களுக்கு முன்பு",
      monthAgo: "மாதம் முன்பு",
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
    },
    mr: {
      welcome: "परत स्वागत आहे, अर्जुन!",
      progress: "या महिन्यात तुम्ही अप्रतिम प्रगती केली आहे. आपल्या ग्रहासाठी उत्कृष्ट कार्य चालू ठेवा!",
      level: "स्तर 7 पर्यावरण योद्धा",
      impactPoints: "प्रभाव गुण",
      myImpact: "माझा पर्यावरणीय प्रभाव",
      xpPoints: "XP गुण",
      treesPlanted: "झाडे लावली",
      co2Offset: "CO₂ कपात",
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
      educationHub: "पर्यावरण शिक्षण केंद्र",
      environmentalJourney: "माझा पर्यावरणीय प्रवास",
      today: "आज",
      daysAgo: "दिवसांपूर्वी",
      weekAgo: "आठवडा पूर्वी",
      weeksAgo: "आठवडे पूर्वी",
      monthAgo: "महिना पूर्वी",
    },
  }

  const t = translations[language]

  const languageOptions = [
    { code: "en", name: "English", nativeName: "EN" },
    { code: "hi", name: "Hindi", nativeName: "हिं" },
    { code: "bn", name: "Bangla", nativeName: "বাং" },
    { code: "ta", name: "Tamil", nativeName: "தமி" },
    { code: "te", name: "Telugu", nativeName: "తెలు" },
    { code: "mr", name: "Marathi", nativeName: "मरा" },
  ]

  const currentLanguage = languageOptions.find((lang) => lang.code === language)

  const handleSubmitReport = () => {
    console.log("[v0] Submitting report:", { issueTitle, issueLocation, issueDescription, uploadedFiles })
    setIssueTitle("")
    setIssueLocation("")
    setIssueDescription("")
    setUploadedFiles([])
  }

  const handleJoinProject = (projectName: string) => {
    console.log("[v0] Joining project:", projectName)
  }

  const handleEducationClick = (item: any) => {
    console.log("[v0] Education item clicked:", item.title)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    setUploadedFiles((prev) => [...prev, ...files])
    console.log("[v0] Files uploaded:", files.length)
  }

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
            <div
              className="flex items-center gap-2 glass rounded-full px-3 py-1 cursor-pointer"
              onClick={() => console.log("[v0] Profile clicked")}
            >
              <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
                <User className="w-3 h-3 text-white" />
              </div>
              <span className="text-sm font-medium">Arjun Patel</span>
            </div>
          </div>
        </div>
      </header>

      <main className="p-6 space-y-6">
        {/* Hero Header with Welcome Message */}
        <div className="glass-strong rounded-3xl p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-green-500/10" />
          <div className="relative z-10">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center mx-auto mb-4">
              <TreePine className="w-10 h-10 text-white animate-pulse" />
            </div>
            <h1 className="font-serif font-bold text-3xl text-foreground mb-2">{t.welcome}</h1>
            <p className="text-lg text-muted-foreground mb-6">{t.progress}</p>
            <div className="flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-emerald-600 font-medium">{t.level}</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-4 h-4 text-yellow-500" />
                <span className="text-muted-foreground">2,450 {t.impactPoints}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Row 1: My Impact & Ongoing Projects */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                          <div className="text-2xl font-bold text-emerald-600">2,450</div>
                          <div className="text-xs text-muted-foreground">{t.xpPoints}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Impact Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-emerald-50">
                    <TreePine className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-emerald-600">47</div>
                    <div className="text-xs text-muted-foreground">{t.treesPlanted}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-green-50">
                    <Leaf className="w-6 h-6 text-green-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-green-600">125kg</div>
                    <div className="text-xs text-muted-foreground">{t.co2Offset}</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-teal-50">
                    <Droplets className="w-6 h-6 text-teal-600 mx-auto mb-2" />
                    <div className="text-lg font-bold text-teal-600">890L</div>
                    <div className="text-xs text-muted-foreground">{t.waterSaved}</div>
                  </div>
                </div>

                {/* Progress to Next Level */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{t.progressToNext}</span>
                    <span className="font-medium">2,450 / 3,000 XP</span>
                  </div>
                  <Progress value={82} className="h-2" />
                  <p className="text-xs text-muted-foreground">550 XP {t.xpNeeded}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Ongoing Projects */}
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
              <div className="space-y-4">
                {[
                  {
                    title:
                      language === "en"
                        ? "Community Garden Project"
                        : language === "hi"
                          ? "सामुदायिक बगीचा परियोजना"
                          : language === "bn"
                            ? "সামুদায়িক বাগি প্রকল্প"
                            : language === "ta"
                              ? "பொது வேலை பொருள் பாடு"
                              : language === "te"
                                ? "ప్రక్టీకా ప్రాజెక్టు"
                                : "सामुदायिक बगीचा परियोजना",
                    progress: 75,
                    participants: 24,
                    deadline:
                      language === "en"
                        ? "2 weeks left"
                        : language === "hi"
                          ? "2 सप्ताह बचे"
                          : language === "bn"
                            ? "২ সপ্তাহ বাকি"
                            : language === "ta"
                              ? "2 வாரங்கள் மீதம்"
                              : language === "te"
                                ? "2 సప్టామ్యాలు మిగిలింది"
                                : "2 सप्ताह बचे",
                    impact: "+15 XP",
                  },
                  {
                    title:
                      language === "en"
                        ? "Beach Cleanup Initiative"
                        : language === "hi"
                          ? "समुद्री तट सफाई पहल"
                          : language === "bn"
                            ? "সমুদ্রী ট্যাট সাফাই প্রতিষ্ঠান"
                            : language === "ta"
                              ? "சுற்றுச்சூழல் பொருள் பாடு"
                              : language === "te"
                                ? "ప్రక్టీకా ప్రాజెక్టు"
                                : "समुद्री तट सफाई पहल",
                    progress: 45,
                    participants: 18,
                    deadline:
                      language === "en"
                        ? "1 month left"
                        : language === "hi"
                          ? "1 महीना बचा"
                          : language === "bn"
                            ? "১ মাস বাকি"
                            : language === "ta"
                              ? "1 மாதம் மீதம்"
                              : language === "te"
                                ? "1 మాసం మిగిలింది"
                                : "1 महीना बचा",
                    impact: "+25 XP",
                  },
                  {
                    title:
                      language === "en"
                        ? "Solar Panel Installation"
                        : language === "hi"
                          ? "सोलर पैनल स्थापना"
                          : language === "bn"
                            ? "সোলার প্যানেল স্থাপনা"
                            : language === "ta"
                              ? "சோலர் பைனல் அநுபவம்"
                              : language === "te"
                                ? "సోలర్ పైనల్ స్థాన"
                                : "सोलर पैनल स्थापना",
                    progress: 90,
                    participants: 12,
                    deadline:
                      language === "en"
                        ? "3 days left"
                        : language === "hi"
                          ? "3 दिन बचे"
                          : language === "bn"
                            ? "৩ দিন বাকি"
                            : language === "ta"
                              ? "3 நாட்கள் மீதம்"
                              : language === "te"
                                ? "3 రోజులు మిగిలింది"
                                : "3 दिन बचे",
                    impact: "+40 XP",
                  },
                ].map((project, index) => (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                    onClick={() => handleJoinProject(project.title)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-foreground">{project.title}</h4>
                      <Badge className="bg-emerald-100 text-emerald-700">{project.impact}</Badge>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
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
        </div>

        {/* Row 2: Report Issue Portal & Leaderboard */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Report Issue Portal */}
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
                  <p className="text-sm text-muted-foreground mb-4">{t.reportDescription}</p>
                </div>
                <Link href="/report-issue">
                  <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">{t.reportButton}</Button>
                </Link>
                <div className="grid grid-cols-2 gap-3 text-xs text-muted-foreground">
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

          {/* Leaderboard */}
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg font-serif flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-yellow-600" />
                {t.leaderboard}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { name: "Priya Sharma", points: 3240, rank: 1, change: "up", avatar: "PS" },
                  { name: "Rahul Kumar", points: 2890, rank: 2, change: "same", avatar: "RK" },
                  { name: "Arjun Patel", points: 2450, rank: 3, change: "up", avatar: "AP" },
                  { name: "Sneha Gupta", points: 2180, rank: 4, change: "down", avatar: "SG" },
                  { name: "Vikram Singh", points: 1950, rank: 5, change: "up", avatar: "VS" },
                ].map((user, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg transition-colors ${
                      user.name === "Arjun Patel" ? "bg-emerald-100 border border-emerald-200" : "bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className="text-lg font-bold text-muted-foreground">#{user.rank}</span>
                        {user.change === "up" && <TrendingUp className="w-3 h-3 text-green-500" />}
                        {user.change === "down" && <TrendingUp className="w-3 h-3 text-red-500 rotate-180" />}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 flex items-center justify-center">
                        <span className="text-xs font-bold text-white">{user.avatar}</span>
                      </div>
                      <span className="font-medium text-foreground">{user.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-emerald-600">{user.points.toLocaleString()}</span>
                      <span className="text-xs text-muted-foreground">XP</span>
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
        </div>

        {/* Row 3: Education Hub */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600" />
              {t.educationHub}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                {
                  type: "video",
                  title:
                    language === "en"
                      ? "Climate Change Basics"
                      : language === "hi"
                        ? "जलवायु परिवर्तन मूल बातें"
                        : language === "bn"
                          ? "মৌসুম পরিবর্তনের মূল বিষয়গুলো"
                          : language === "ta"
                            ? "வாதாவை மாற்றம் முதல் பாடுகள்"
                            : language === "te"
                              ? "వాతావరణ మార్పు ముఖ్యమైన పాయింట్లు"
                              : "जलवायु परिवर्तन मूल बातें",
                  duration:
                    language === "en"
                      ? "5 min"
                      : language === "hi"
                        ? "5 मिनट"
                        : language === "bn"
                          ? "৫ মিনিট"
                          : language === "ta"
                            ? "5 நிமிடங்கள்"
                            : language === "te"
                              ? "5 నిమిటాలు"
                              : "5 मिनट",
                  xp: "+5 XP",
                  thumbnail: "climate",
                },
                {
                  type: "article",
                  title:
                    language === "en"
                      ? "Ocean Conservation Tips"
                      : language === "hi"
                        ? "समुद्री संरक्षण सुझाव"
                        : language === "bn"
                          ? "সমুদ্র সংরক্ষণের পরামর্শ"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "समुद्री संरक्षण सुझाव",
                  duration:
                    language === "en"
                      ? "3 min read"
                      : language === "hi"
                        ? "3 मिनट पढ़ें"
                        : language === "bn"
                          ? "৩ মিনিট পড়ুন"
                          : language === "ta"
                            ? "3 நிமிடங்கள் படிக்கவும்"
                            : language === "te"
                              ? "3 నిమిటాలు పட్డి చూద్దాం"
                              : "3 मिनट पढ़ें",
                  xp: "+3 XP",
                  thumbnail: "ocean",
                },
                {
                  type: "quiz",
                  title:
                    language === "en"
                      ? "Renewable Energy Quiz"
                      : language === "hi"
                        ? "नवीकरणीय ऊर्जा प्रश्नोत्तरी"
                        : language === "bn"
                          ? "পুনরুদ্ধ শক্তির পরীক্ষা"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "नवीकरणीय ऊर्जा प्रश्नोत्तरी",
                  duration:
                    language === "en"
                      ? "10 questions"
                      : language === "hi"
                        ? "10 प्रश्न"
                        : language === "bn"
                          ? "১০টি প্রশ্ন"
                          : language === "ta"
                            ? "10 பிரশ்நங்கள்"
                            : language === "te"
                              ? "10 ప్రశ్నలు"
                              : "10 प्रश्न",
                  xp: "+10 XP",
                  thumbnail: "energy",
                },
                {
                  type: "video",
                  title:
                    language === "en"
                      ? "Sustainable Living Guide"
                      : language === "hi"
                        ? "टिकाऊ जीवन गाइड"
                        : language === "bn"
                          ? "সামান্য জীবনের নির্মাণ"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "टिकाऊ जीवन गाइड",
                  duration:
                    language === "en"
                      ? "8 min"
                      : language === "hi"
                        ? "8 मिनट"
                        : language === "bn"
                          ? "৮ মিনিট"
                          : language === "ta"
                            ? "8 நிமிடங்கள்"
                            : language === "te"
                              ? "8 నిమిటాలు"
                              : "8 मिनट",
                  xp: "+8 XP",
                  thumbnail: "living",
                },
                {
                  type: "article",
                  title:
                    language === "en"
                      ? "Biodiversity Importance"
                      : language === "hi"
                        ? "जैव विविधता का महत्व"
                        : language === "bn"
                          ? "জৈব বিভিন্নতার গুরুত্ব"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "जैव विविधता का महत्व",
                  duration:
                    language === "en"
                      ? "4 min read"
                      : language === "hi"
                        ? "4 मिनट पढ़ें"
                        : language === "bn"
                          ? "৪ মিনিট পড়ুন"
                          : language === "ta"
                            ? "4 நிமிடங்கள் படிக்கவும்"
                            : language === "te"
                              ? "4 నిమిటాలు పడ్డి చూద్దాం"
                              : "4 मिनट पढ़ें",
                  xp: "+4 XP",
                  thumbnail: "biodiversity",
                },
                {
                  type: "interactive",
                  title:
                    language === "en"
                      ? "Carbon Footprint Calculator"
                      : language === "hi"
                        ? "कार्बन फुटप्रिंट कैलकुलेटर"
                        : language === "bn"
                          ? "কার্বন ফুটপ্রিংট ক্যালকুলেটর"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "कार्बन फुटप्रिंट कैलकुलेटर",
                  duration:
                    language === "en"
                      ? "Interactive"
                      : language === "hi"
                        ? "इंटरैक्टिव"
                        : language === "bn"
                          ? "সীমাহীন"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "इंटरैक्टिव",
                  xp: "+15 XP",
                  thumbnail: "calculator",
                },
              ].map((item, index) => (
                <div
                  key={index}
                  className="group p-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all cursor-pointer hover:scale-105"
                  onClick={() => handleEducationClick(item)}
                >
                  <div className="w-full h-24 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg mb-3 flex items-center justify-center relative overflow-hidden">
                    {item.type === "video" && <Play className="w-8 h-8 text-blue-600" />}
                    {item.type === "article" && <BookOpen className="w-8 h-8 text-green-600" />}
                    {item.type === "quiz" && <Award className="w-8 h-8 text-yellow-600" />}
                    {item.type === "interactive" && <TrendingUp className="w-8 h-8 text-purple-600" />}
                  </div>
                  <h4 className="font-medium text-foreground mb-1 group-hover:text-emerald-600 transition-colors">
                    {item.title}
                  </h4>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{item.duration}</span>
                    <Badge className="bg-emerald-100 text-emerald-700">{item.xp}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Row 4: My Dashboard Timeline */}
        <Card className="glass">
          <CardHeader>
            <CardTitle className="text-lg font-serif flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              {t.environmentalJourney}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  date: t.today,
                  action:
                    language === "en"
                      ? "Joined Beach Cleanup Initiative"
                      : language === "hi"
                        ? "समुद्री तट सफाई पहल में शामिल हुए"
                        : language === "bn"
                          ? "সমুদ্রী ট্যাট সাফাই প্রতিষ্ঠানে যোগ দিয়েছেন"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "समुद्री तट सफाई पहल में शामिल हुए",
                  badge:
                    language === "en"
                      ? "Participant"
                      : language === "hi"
                        ? "प्रतिभागी"
                        : language === "bn"
                          ? "অংশগ্রহণকারী"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "प्रतिभागी",
                  icon: Droplets,
                  color: "text-blue-600",
                },
                {
                  date:
                    language === "en"
                      ? "2 days ago"
                      : language === "hi"
                        ? "2 दिन पहले"
                        : language === "bn"
                          ? "২ দিন আগে"
                          : language === "ta"
                            ? "2 நாட்கள் முன்பு"
                            : language === "te"
                              ? "2 రోజులు మునుపు"
                              : "2 दिन पहले",
                  action:
                    language === "en"
                      ? "Completed Solar Panel Installation"
                      : language === "hi"
                        ? "सोलर पैनल स्थापना पूरी की"
                        : language === "bn"
                          ? "সোলার প্যানেল স্থাপনা সম্পূর্ণ করেছেন"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "सोलर पैनल स्थापना पूरी की",
                  badge:
                    language === "en"
                      ? "Achievement"
                      : language === "hi"
                        ? "उपलब्धि"
                        : language === "bn"
                          ? "সাহায্য"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "उপলब्धि",
                  icon: Award,
                  color: "text-yellow-600",
                },
                {
                  date:
                    language === "en"
                      ? "1 week ago"
                      : language === "hi"
                        ? "1 सप्ताह पहले"
                        : language === "bn"
                          ? "১ সপ্তাহ আগে"
                          : language === "ta"
                            ? "1 வாரம் முன்பு"
                            : language === "te"
                              ? "1 సప్టామ్యాలు మునుపు"
                              : "1 सप्ताह पहले",
                  action:
                    language === "en"
                      ? "Reported illegal dumping site"
                      : language === "hi"
                        ? "अवैध डंपिंग साइट की रिपोर्ट की"
                        : language === "bn"
                          ? "অবৈধ ডাম্পিং সাইট প্রতিবেদন করেছেন"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "अवैध डंपिंग साइट की रिपोर्ट की",
                  badge:
                    language === "en"
                      ? "Reporter"
                      : language === "hi"
                        ? "रिपोर्टर"
                        : language === "bn"
                          ? "প্রতিবেদক"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "रिपोर्टर",
                  icon: Camera,
                  color: "text-orange-600",
                },
                {
                  date:
                    language === "en"
                      ? "2 weeks ago"
                      : language === "hi"
                        ? "2 सप्ताह पहले"
                        : language === "bn"
                          ? "২ সপ্তাহ আগে"
                          : language === "ta"
                            ? "2 வாரங்கள் முன்பு"
                            : language === "te"
                              ? "2 సప్టామ్యాలు మునుపు"
                              : "2 सप्ताह पहले",
                  action:
                    language === "en"
                      ? "Planted 10 trees in Community Garden"
                      : language === "hi"
                        ? "सामुदायिक बगीचे में 10 पेड़ लगाए"
                        : language === "bn"
                          ? "সামুদায়িক বাগি মধ্যে ১০টি গাছ লাগানো"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "सामुदायिक बगीचे में 10 पेड़ लगाए",
                  badge:
                    language === "en"
                      ? "Contributor"
                      : language === "hi"
                        ? "योगदानकर्ता"
                        : language === "bn"
                          ? "অংশগ্রহণকারী"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "योगदानकर्ता",
                  icon: TreePine,
                  color: "text-green-600",
                },
                {
                  date:
                    language === "en"
                      ? "1 month ago"
                      : language === "hi"
                        ? "1 महीना पहले"
                        : language === "bn"
                          ? "১ মাস আগে"
                          : language === "ta"
                            ? "1 மாதம் முன்பு"
                            : language === "te"
                              ? "1 మాసం మునుపు"
                              : "1 महीना पहले",
                  action:
                    language === "en"
                      ? "Reached Level 7 Eco-Warrior"
                      : language === "hi"
                        ? "स्तर 7 पर्यावरण योद्धा तक पहुंचे"
                        : language === "bn"
                          ? "স্তর ৭ পরিবেশ যোদ্ধার পরিবেশে পৌঁছেছেন"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "स्तर 7 पर्यावरण योद्धा तक पहुंचे",
                  badge:
                    language === "en"
                      ? "Level Up"
                      : language === "hi"
                        ? "स्तर वृद्धि"
                        : language === "bn"
                          ? "স্তর বাড়ানো"
                          : language === "ta"
                            ? "சுற்றுச்சூழல் பொருள் பாடு"
                            : language === "te"
                              ? "ప్రక్టీకా ప్రాజెక్టు"
                              : "स्तर वृद्धि",
                  icon: Star,
                  color: "text-purple-600",
                },
              ].map((activity, index) => (
                <div key={index} className="flex items-center gap-4 p-3 rounded-lg bg-muted/30">
                  <div className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center ${activity.color}`}>
                    <activity.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-foreground">{activity.action}</p>
                    <p className="text-sm text-muted-foreground">{activity.date}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{activity.badge}</Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log("[v0] Share clicked for:", activity.action)}
                    >
                      <Share2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => console.log("[v0] Like clicked for:", activity.action)}
                    >
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
