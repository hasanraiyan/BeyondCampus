"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { motion } from "framer-motion"
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Plus, Menu, ChevronDown, Compass, Briefcase, TrendingUp, MessageSquare, Sparkles, ArrowRight, GraduationCap, LayoutDashboard, Edit, Users, Home, Calendar, HelpCircle, UserCircle, X, Expand, Target, Lock } from "lucide-react"
import { cn } from '@/lib/utils'
import AppSidebar from './AppSidebar'
import type { NavItem } from './AppSidebar'
import { useSidebar } from "@/contexts/SidebarContext"
import { usePathname } from "next/navigation"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

interface Chat {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
}

interface Mentor {
  id: string
  name: string
  role: string
  company: string
  image?: string
  category: "tech" | "business" | "research"
  studentsHelped: number
  rating: number
  tagline: string
  responseTime: string
}

interface SuccessStory {
  id: string
  text: string
  author: string
  school: string
}

interface University {
  id: string
  name: string
  shortName: string
  specialty: string
  studentsHelped: number
  rating: number
  tagline: string
  responseTime: string
}


export default function ChatInterface() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [chats, setChats] = useState<Chat[]>([
    {
      id: "1",
      title: "Career Path Discussion",
      messages: [],
      createdAt: new Date(),
    },
  ])
  const [currentChatId, setCurrentChatId] = useState("1")
  const [inputMessage, setInputMessage] = useState("")
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [displayedText, setDisplayedText] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<"all" | "tech" | "business" | "research">("all")
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0)
  const [showCapabilities, setShowCapabilities] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const [userProfile, setUserProfile] = useState<any>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

  const currentChat = chats.find((chat) => chat.id === currentChatId)

  // Sample data for mentors, universities and success stories
  const mentors: Mentor[] = [
    { id: "1", name: "Sarah Chen", role: "Product Manager", company: "Google", category: "tech", studentsHelped: 342, rating: 4.9, tagline: "Ask me about tech careers", responseTime: "Available now" },
    { id: "2", name: "Michael Park", role: "Investment Banker", company: "Goldman Sachs", category: "business", studentsHelped: 189, rating: 4.8, tagline: "Finance career guidance", responseTime: "Responds in 5 min" },
    { id: "3", name: "Dr. Lisa Wang", role: "Research Scientist", company: "MIT", category: "research", studentsHelped: 276, rating: 5.0, tagline: "Research path advisor", responseTime: "Available now" },
    { id: "4", name: "Alex Kumar", role: "Software Engineer", company: "Meta", category: "tech", studentsHelped: 423, rating: 4.9, tagline: "Coding interview prep", responseTime: "Available now" },
    { id: "5", name: "Emma Thompson", role: "Strategy Consultant", company: "McKinsey", category: "business", studentsHelped: 156, rating: 4.7, tagline: "Consulting careers", responseTime: "Responds in 10 min" },
    { id: "6", name: "Prof. James Lee", role: "AI Researcher", company: "Stanford", category: "research", studentsHelped: 298, rating: 4.9, tagline: "AI/ML career paths", responseTime: "Available now" },
  ]

  const universities: University[] = [
    { id: "1", name: "Massachusetts Institute of Technology", shortName: "MIT", specialty: "Engineering & Tech", studentsHelped: 1247, rating: 4.9, tagline: "Get admission tips", responseTime: "Quick response" },
    { id: "2", name: "Stanford University", shortName: "Stanford", specialty: "Computer Science", studentsHelped: 986, rating: 4.8, tagline: "CS program insights", responseTime: "Available now" },
    { id: "3", name: "Harvard University", shortName: "Harvard", specialty: "Business & Liberal Arts", studentsHelped: 1103, rating: 4.9, tagline: "Application guidance", responseTime: "Responds in 15 min" },
    { id: "4", name: "UC Berkeley", shortName: "Berkeley", specialty: "Innovation & Research", studentsHelped: 678, rating: 4.7, tagline: "Berkeley experience", responseTime: "Available now" },
    { id: "5", name: "Yale University", shortName: "Yale", specialty: "Law & Medicine", studentsHelped: 534, rating: 4.8, tagline: "Yale admissions help", responseTime: "Quick response" },
    { id: "6", name: "Princeton University", shortName: "Princeton", specialty: "Mathematics & Physics", studentsHelped: 412, rating: 4.9, tagline: "Princeton insights", responseTime: "Available now" },
  ]

  const successStories: SuccessStory[] = [
    { id: "1", text: "Got into Stanford CS after chatting with AI advisors", author: "Emma S.", school: "Stanford" },
    { id: "2", text: "Landed my dream internship at Google with mentor guidance", author: "David L.", school: "MIT" },
    { id: "3", text: "Changed my major and found my passion through AI conversations", author: "Sophie M.", school: "Harvard" },
  ]

  const filteredMentors = selectedCategory === "all" 
    ? mentors 
    : mentors.filter(m => m.category === selectedCategory)



  // Fetch user profile data
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile')
        if (response.ok) {
          const data = await response.json()
          setUserProfile(data)
        }
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    }
    
    if (session) {
      fetchUserProfile()
    }
  }, [session])

  const { setHeaderAction, setBottomContent } = useSidebar()

  useEffect(() => {
    // Set Header Action
    setHeaderAction(
      <Button
        variant="ghost"
        size="icon"
        onClick={createNewChat}
        className="h-8 w-8 hover:bg-secondary/70 transition-colors opacity-70 hover:opacity-100"
        aria-label="Create new chat"
      >
        <Plus className="h-4 w-4" />
      </Button>
    )

    // Set Bottom Content
    setBottomContent(
      <div className="border-t border-border/30 mt-4">
        <div className="px-4 py-3 flex items-center justify-between">
          <h3 className="text-[11px] font-semibold text-muted-foreground/70 uppercase tracking-widest">Recent Chats</h3>
          <Button
            variant="ghost"
            size="icon"
            onClick={createNewChat}
            className="h-6 w-6 hover:bg-secondary/70 opacity-60 hover:opacity-100"
            aria-label="Start new chat"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>
        <div className="max-h-64 overflow-y-auto px-4 pb-3">
          <div className="space-y-1">
            {chats.map((chat) => (
              <Button
                key={chat.id}
                variant={currentChatId === chat.id ? "secondary" : "ghost"}
                className="w-full justify-start text-left group hover:bg-secondary/50 h-10 px-4 rounded-md"
                onClick={() => setCurrentChatId(chat.id)}
              >
                <span className="text-[15px] truncate">{chat.title}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    )

    // Cleanup
    return () => {
      setHeaderAction(null)
      setBottomContent(null)
    }
  }, [chats, currentChatId, setHeaderAction, setBottomContent])

  // Typing animation effect
  useEffect(() => {
    const fullText = "Welcome to BeyondCampus"
    
    if (currentChat?.messages.length === 0) {
      setDisplayedText("")
      let currentIndex = 0
      
      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1))
          currentIndex++
        } else {
          clearInterval(typingInterval)
        }
      }, 50) // Adjust speed here (lower = faster)

      return () => clearInterval(typingInterval)
    }
  }, [currentChat?.messages.length, currentChatId])

  // Auto-rotate success stories
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStoryIndex((prev) => (prev + 1) % successStories.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [])




  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [currentChat?.messages])

  const handleSendMessage = () => {
    if (!inputMessage.trim() || !currentChat) return

    const newMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim().replace(/\s+/g, ' '),
      timestamp: new Date(),
    }

    const updatedChats = chats.map((chat) => {
      if (chat.id === currentChatId) {
        return {
          ...chat,
          messages: [...chat.messages, newMessage],
        }
      }
      return chat
    })

    setChats(updatedChats)
    setInputMessage("")

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: "I'm here to help you explore career paths and provide guidance. What specific aspect of your career would you like to discuss?",
        timestamp: new Date(),
      }

      setChats((prevChats) =>
        prevChats.map((chat) => {
          if (chat.id === currentChatId) {
            return {
              ...chat,
              messages: [...chat.messages, aiResponse],
            }
          }
          return chat
        })
      )
    }, 1000)
  }

  const createNewChat = () => {
    const newChat: Chat = {
      id: Date.now().toString(),
      title: `New Chat ${chats.length + 1}`,
      messages: [],
      createdAt: new Date(),
    }
    setChats([...chats, newChat])
    setCurrentChatId(newChat.id)
  }


  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback>BC</AvatarFallback>
              </Avatar>
              <h3 className="font-semibold text-base">BeyondCampus AI</h3>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowCapabilities(true)}
              className="flex items-center gap-2"
            >
              <HelpCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Capabilities</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowProfile(true)}
              className="flex items-center gap-2 relative z-10"
            >
              <UserCircle className="h-4 w-4" />
              <span className="hidden sm:inline">My Profile</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden md:flex"
            >
              <ChevronDown
                className={cn(
                  "h-5 w-5 transition-transform",
                  sidebarOpen ? "-rotate-90" : "rotate-90"
                )}
              />
            </Button>
          </div>
        </div>

        {/* Main Content Area */}
        {currentChat?.messages.length === 0 ? (
          /* Welcome State - Centered */
          <div className="flex-1 flex flex-col items-center justify-center px-8 py-12 relative overflow-hidden -mt-20">
            {/* Background Gradient Effects */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 pointer-events-none" />
            <div className="absolute top-20 left-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
            <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary/5 rounded-full blur-3xl pointer-events-none animate-pulse delay-700" />
            
            <div className="max-w-2xl w-full relative z-10">
              {/* Welcome Text with Enhanced Styling */}
              <div className="text-center mb-10">
                <p className="text-lg text-muted-foreground mb-2">
                  Hello, <span className="text-primary/80 font-medium">{session?.user?.name?.split(' ')[0] || "User"}</span> 👋
                </p>
                <h1 className="text-7xl font-black tracking-tight bg-gradient-to-r from-primary via-primary/90 to-primary/80 bg-clip-text text-transparent animate-gradient drop-shadow-lg">
                  {displayedText}
                </h1>
              </div>

              {/* Claude-style Input Area */}
              <div className="w-full max-w-[800px] mx-auto">
                <div className="relative bg-[#404040] rounded-[24px] px-6 py-4 pr-[120px] min-h-[120px]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ask anything"
                    className="absolute top-4 left-6 right-[140px] bg-transparent border-none outline-none text-white text-[18px] placeholder:text-[#A0A0A0]"
                    autoFocus
                  />
                  
                  {/* Bottom-left Actions Dropdown */}
                  <div className="absolute left-3 bottom-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#555555] rounded-[20px] hover:bg-[#666666] transition-colors text-white text-sm font-medium">
                          <Sparkles className="h-4 w-4" />
                          Actions
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 bg-gray-900 border-gray-700" style={{ backgroundColor: '#1a1a1a' }}>
                        <DropdownMenuLabel className="text-gray-400 text-xs uppercase">AI Capabilities</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                          onClick={() => {
                            setInputMessage("I need help shortlisting universities based on my profile")
                            setTimeout(() => handleSendMessage(), 100)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">University Shortlisting</div>
                            <div className="text-xs text-gray-400">Get personalized recommendations</div>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                          onClick={() => {
                            setInputMessage("Can you recommend mentors who can guide me?")
                            setTimeout(() => handleSendMessage(), 100)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20">
                            <Users className="h-4 w-4 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Mentor Recommender</div>
                            <div className="text-xs text-gray-400">Find the right mentors for you</div>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                          onClick={() => {
                            setInputMessage("Help me find the best courses for my career goals")
                            setTimeout(() => handleSendMessage(), 100)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20">
                            <Briefcase className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Course Recommender</div>
                            <div className="text-xs text-gray-400">Discover ideal programs</div>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                          onClick={() => {
                            setInputMessage("Which countries are best suited for my profile and goals?")
                            setTimeout(() => handleSendMessage(), 100)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20">
                            <Compass className="h-4 w-4 text-orange-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Country Recommender</div>
                            <div className="text-xs text-gray-400">Explore study destinations</div>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Bottom-right Button Container */}
                  <div className="absolute right-3 bottom-3 flex items-center gap-3">
                    {/* Attachment Button */}
                    <button className="w-11 h-11 bg-[#555555] rounded-[20px] flex items-center justify-center hover:bg-[#666666] transition-colors">
                      <Plus className="h-5 w-5 text-white" />
                    </button>
                    
                    {/* Call Input Button */}
                    <button className="w-11 h-11 bg-[#555555] rounded-[20px] flex items-center justify-center hover:bg-[#666666] transition-colors">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </button>
                    
                    {/* Send Button - only show when input has text */}
                    {inputMessage.trim() && (
                      <button 
                        onClick={handleSendMessage}
                        className="w-11 h-11 bg-[#555555] rounded-[20px] flex items-center justify-center hover:bg-[#666666] transition-colors"
                      >
                        <ArrowRight className="h-5 w-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Suggested Messages */}
              <div className="mt-8 max-w-[800px] mx-auto">
                <p className="text-sm text-muted-foreground mb-4 text-center">Try asking Maya:</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    onClick={() => {
                      setInputMessage("What are the best universities for Computer Science in the US?")
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                    className="group relative px-4 py-3 text-left rounded-lg border border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <GraduationCap className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">What are the best universities for Computer Science in the US?</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setInputMessage("Help me prepare for my Stanford CS interview")
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                    className="group relative px-4 py-3 text-left rounded-lg border border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <MessageSquare className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">Help me prepare for my Stanford CS interview</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setInputMessage("I need guidance on writing a compelling SOP for grad school")
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                    className="group relative px-4 py-3 text-left rounded-lg border border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Edit className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">I need guidance on writing a compelling SOP for grad school</span>
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      setInputMessage("What's the typical timeline for applying to US universities?")
                      setTimeout(() => handleSendMessage(), 100)
                    }}
                    className="group relative px-4 py-3 text-left rounded-lg border border-border/50 hover:border-primary/50 bg-card/50 backdrop-blur-sm transition-all hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <span className="text-sm font-medium">What's the typical timeline for applying to US universities?</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>


          </div>
        ) : (
          /* Chat State - Traditional Layout */
          <>
            <ScrollArea className="flex-1" ref={scrollAreaRef}>
              <div className="w-full">
                {currentChat?.messages.map((message, index) => {
                  const prevMessage = index > 0 ? currentChat.messages[index - 1] : null
                  const showHeader = !prevMessage || prevMessage.role !== message.role || 
                    (message.timestamp.getTime() - prevMessage.timestamp.getTime() > 5 * 60 * 1000)
                  
                  return (
                    <div
                      key={message.id}
                      className={cn(
                        "w-full border-b border-border/10",
                        message.role === "user" 
                          ? "bg-background" 
                          : "bg-secondary/20"
                      )}
                    >
                      <div className="max-w-4xl mx-auto px-6 py-6">
                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className={cn(
                                "text-xs font-semibold",
                                message.role === "user" 
                                  ? "bg-primary/10 text-primary" 
                                  : "bg-secondary text-foreground"
                              )}>
                                {message.role === "user" ? "U" : "AI"}
                              </AvatarFallback>
                            </Avatar>
                          </div>
                          
                          {/* Message Content */}
                          <div className="flex-1 min-w-0">
                            {/* Message Header */}
                            {showHeader && (
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-semibold text-foreground">
                                  {message.role === "user" ? (session?.user?.name || "User") : "BeyondCampus AI"}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {message.timestamp.toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </span>
                              </div>
                            )}
                            
                            {/* Message Text */}
                            <div className="prose prose-sm max-w-none">
                              <p className="text-[16px] leading-[1.6] text-foreground whitespace-pre-wrap break-words m-0">
                                {message.content}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </ScrollArea>

            {/* Claude-style Input Area */}
            <div className="p-6 bg-transparent">
              <div className="max-w-[800px] mx-auto">
                <div className="relative bg-[#404040] rounded-[24px] px-6 py-4 pr-[120px] min-h-[120px]">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault()
                        handleSendMessage()
                      }
                    }}
                    placeholder="Ask anything"
                    className="w-full bg-transparent border-none outline-none text-white text-[18px] placeholder:text-[#A0A0A0] font-inherit text-left pt-1 whitespace-nowrap overflow-hidden"
                  />
                  
                  {/* Bottom-left Actions Dropdown */}
                  <div className="absolute left-3 bottom-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 px-4 py-2 bg-[#555555] rounded-[20px] hover:bg-[#666666] transition-colors text-white text-sm font-medium">
                          <Sparkles className="h-4 w-4" />
                          Actions
                          <ChevronDown className="h-3 w-3" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="start" className="w-64 bg-gray-900 border-gray-700" style={{ backgroundColor: '#1a1a1a' }}>
                        <DropdownMenuLabel className="text-gray-400 text-xs uppercase">AI Capabilities</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-800" />
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                          onClick={() => {
                            setInputMessage("I need help shortlisting universities based on my profile")
                            setTimeout(() => handleSendMessage(), 100)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/20">
                            <GraduationCap className="h-4 w-4 text-blue-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">University Shortlisting</div>
                            <div className="text-xs text-gray-400">Get personalized recommendations</div>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                          onClick={() => {
                            setInputMessage("Can you recommend mentors who can guide me?")
                            setTimeout(() => handleSendMessage(), 100)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/20">
                            <Users className="h-4 w-4 text-purple-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Mentor Recommender</div>
                            <div className="text-xs text-gray-400">Find the right mentors for you</div>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                          onClick={() => {
                            setInputMessage("Help me find the best courses for my career goals")
                            setTimeout(() => handleSendMessage(), 100)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-green-500/20">
                            <Briefcase className="h-4 w-4 text-green-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Course Recommender</div>
                            <div className="text-xs text-gray-400">Discover ideal programs</div>
                          </div>
                        </DropdownMenuItem>
                        
                        <DropdownMenuItem 
                          className="flex items-center gap-3 py-3 cursor-pointer hover:bg-gray-800 text-white focus:bg-gray-800 focus:text-white"
                          onClick={() => {
                            setInputMessage("Which countries are best suited for my profile and goals?")
                            setTimeout(() => handleSendMessage(), 100)
                          }}
                        >
                          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/20">
                            <Compass className="h-4 w-4 text-orange-500" />
                          </div>
                          <div className="flex-1">
                            <div className="font-medium">Country Recommender</div>
                            <div className="text-xs text-gray-400">Explore study destinations</div>
                          </div>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Bottom-right Button Container */}
                  <div className="absolute right-3 bottom-3 flex items-center gap-3">
                    {/* Attachment Button */}
                    <button className="w-11 h-11 bg-[#555555] rounded-[20px] flex items-center justify-center hover:bg-[#666666] transition-colors">
                      <Plus className="h-5 w-5 text-white" />
                    </button>
                    
                    {/* Call Input Button */}
                    <button className="w-11 h-11 bg-[#555555] rounded-[20px] flex items-center justify-center hover:bg-[#666666] transition-colors">
                      <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                      </svg>
                    </button>
                    
                    {/* Send Button - only show when input has text */}
                    {inputMessage.trim() && (
                      <button 
                        onClick={handleSendMessage}
                        className="w-11 h-11 bg-[#555555] rounded-[20px] flex items-center justify-center hover:bg-[#666666] transition-colors"
                      >
                        <ArrowRight className="h-5 w-5 text-white" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Capabilities Modal */}
      {showCapabilities && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">What Maya Can Do</h2>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowCapabilities(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <ScrollArea className="p-6 max-h-[calc(80vh-80px)]">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <p className="text-lg text-muted-foreground">
                    Maya is your AI-powered career counselor, specialized in helping students navigate their study abroad journey.
                  </p>
                </div>

                <div className="grid gap-4">
                  <div className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <GraduationCap className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">University Research & Matching</h3>
                      <p className="text-sm text-muted-foreground">
                        Get personalized university recommendations based on your profile, budget, and aspirations. Compare programs, rankings, and admission requirements.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Edit className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Application Support</h3>
                      <p className="text-sm text-muted-foreground">
                        Craft compelling SOPs, essays, and cover letters. Get feedback on your documents and tips for making your application stand out.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Calendar className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Timeline & Deadline Management</h3>
                      <p className="text-sm text-muted-foreground">
                        Stay on track with personalized timelines, important deadlines, and reminders for applications, tests, and visa processes.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <MessageSquare className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Interview Preparation</h3>
                      <p className="text-sm text-muted-foreground">
                        Practice with mock interviews, get tips on common questions, and build confidence for your university interviews.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Career Guidance</h3>
                      <p className="text-sm text-muted-foreground">
                        Explore career paths, understand job markets, and get advice on building skills that align with your goals.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4 p-4 rounded-lg bg-secondary/50">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Users className="h-5 w-5 text-primary" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Networking & Mentorship</h3>
                      <p className="text-sm text-muted-foreground">
                        Connect with students who've been through similar journeys and get insights from their experiences.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-center">
                    <span className="font-semibold">💡 Pro tip:</span> Maya remembers your preferences and goals from onboarding to provide personalized advice throughout your journey.
                  </p>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfile && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-background rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
          >
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-2xl font-bold">My Profile</h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowProfile(false)
                    router.push('/profile')
                  }}
                  className="flex items-center gap-2"
                >
                  <Expand className="h-4 w-4" />
                  <span>Expand</span>
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowProfile(false)}
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            <ScrollArea className="p-6 max-h-[calc(80vh-80px)]">
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Avatar className="h-20 w-20 mx-auto mb-4">
                    <AvatarFallback className="text-2xl">{session?.user?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <h3 className="text-xl font-semibold">{session?.user?.name || 'User'}</h3>
                  <p className="text-muted-foreground">{session?.user?.email}</p>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-secondary/50">
                    <label className="text-sm font-medium text-muted-foreground">Preferred Name</label>
                    <p className="mt-1 font-medium">{userProfile?.nickname || session?.user?.name || 'Not set'}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <label className="text-sm font-medium text-muted-foreground">Current Education</label>
                    <p className="mt-1 font-medium">{userProfile?.currentEducation || 'Not set'}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <label className="text-sm font-medium text-muted-foreground">Target Countries</label>
                    <p className="mt-1 font-medium">
                      {userProfile?.targetCountries?.join(', ') || 'Not set'}
                    </p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <label className="text-sm font-medium text-muted-foreground">Study Timeline</label>
                    <p className="mt-1 font-medium">{userProfile?.studyTimeline || 'Not set'}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <label className="text-sm font-medium text-muted-foreground">Preferred Course</label>
                    <p className="mt-1 font-medium">{userProfile?.preferredCourse || 'Not set'}</p>
                  </div>

                  <div className="p-4 rounded-lg bg-secondary/50">
                    <label className="text-sm font-medium text-muted-foreground">Budget Range</label>
                    <p className="mt-1 font-medium">{userProfile?.budget || 'Not set'}</p>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <p className="text-sm text-center">
                    <span className="font-semibold">🔒 Privacy:</span> This information helps Maya provide personalized guidance. Your data is secure and never shared.
                  </p>
                </div>

                <div className="flex justify-center">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Edit className="h-4 w-4" />
                    Edit Profile (Coming Soon)
                  </Button>
                </div>
              </div>
            </ScrollArea>
          </motion.div>
        </div>
      )}
    </div>
  )
}