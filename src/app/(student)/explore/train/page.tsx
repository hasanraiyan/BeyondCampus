"use client"

import { useState, useRef, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  BookOpen, 
  ArrowLeft,
  Send,
  Pause,
  Sparkles,
  Plus,
  Link,
  PenTool,
  FileText,
  CheckCircle2,
  Eye,
  X,
  Settings,
  Lightbulb,
  Edit,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  MessageCircle,
  GripVertical,
  ExternalLink,
  Maximize2,
  User
} from "lucide-react"
import { cn } from '@/lib/utils'
import AddMemoryDropdown from '@/components/AddMemoryDropdown'

// BFF streaming helper - Trainer API via SSE
const streamTrainer = async (
  twinId: string,
  text: string,
  threadId: string,
  memoryBlockId: string,
  chapterId: string,
  onToken: (token: string) => void,
  onComplete: (fullMessage: string) => void,
  onError: (error: Error) => void
) => {
  try {
    const response = await fetch(`/api/twins/${twinId}/trainer/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream'
      },
      body: JSON.stringify({
        text,
        thread_id: threadId,
        notebook_id: memoryBlockId,
        chapter_id: chapterId
      })
    })

    if (!response.ok || !response.body) {
      const err = await response.text().catch(() => '')
      throw new Error(`Trainer stream error ${response.status}: ${err}`)
    }

    const { streamLangGraphResponse } = await import('@/lib/sse-parser')
    let full = ''
    for await (const streamingMessage of streamLangGraphResponse(response)) {
      if (streamingMessage.content) {
        const token = streamingMessage.content.slice(full.length)
        if (token) onToken(token)
        full = streamingMessage.content
      }
    }
    onComplete(full)
  } catch (e) {
    onError(e as Error)
  }
}


interface Message {
  id: string
  role: "trainer" | "user"
  content: string
  timestamp: Date
}

interface Chapter {
  id: string
  title: string
  icon: any
  status: "locked" | "current" | "completed"
  description: string
}

export default function TrainAITwinPage() {
  return (
    <Suspense fallback={<div className="flex h-screen items-center justify-center bg-background"><div className="text-muted-foreground">Loading...</div></div>}>
      <TrainAITwin />
    </Suspense>
  )
}

function TrainAITwin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [sessionStarted, setSessionStarted] = useState(false)
  const [currentChapter, setCurrentChapter] = useState(0)
  const [showAddChapter, setShowAddChapter] = useState(false)
  const [newChapterTitle, setNewChapterTitle] = useState("")
  const [newChapterDescription, setNewChapterDescription] = useState("")
  const [viewingChapter, setViewingChapter] = useState<string | null>(null)
  const [showInstructionModal, setShowInstructionModal] = useState(false)
  const [newInstruction, setNewInstruction] = useState("")
  const [instructions, setInstructions] = useState<string[]>([])
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showReflectionModal, setShowReflectionModal] = useState(false)
  const [reflection, setReflection] = useState("")
  const [isGeneratingReflection, setIsGeneratingReflection] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [previewOpen, setPreviewOpen] = useState(false)
  const [previewWidth, setPreviewWidth] = useState(384)
  const [isResizing, setIsResizing] = useState(false)
  const [interviewMode, setInterviewMode] = useState(true)
  const [threadId, setThreadId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<{id: string, name: string} | null>(null)
  const [twinId, setTwinId] = useState<string | null>(null)
  const [twinData, setTwinData] = useState<any>(null)

  const handleModeSwitch = () => {
    const newMode = !interviewMode
    setInterviewMode(newMode)
    // Reset session to show appropriate greeting for new mode
    setSessionStarted(false)
    setMessages([])
    // Reset everything for fresh start
    setThreadId(null)
    setCurrentUser(null)
  }
  const [activePanel, setActivePanel] = useState<string | null>(null)
  const [panelWidth, setPanelWidth] = useState(400)
  const [isPanelResizing, setIsPanelResizing] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // User-created chapters
  const [customChapters, setCustomChapters] = useState<Chapter[]>([])
  // MemoryBlocks identifiers
  const [memoryBlockId, setMemoryBlockId] = useState<string>('block_default')
  const [chapterId, setChapterId] = useState<string>('')
  const [memoryBlocks, setMemoryBlocks] = useState<Array<{ id: string; title: string }>>([
    { id: 'block_default', title: 'Onboarding (Default)' }
  ])
  const [creatingBlock, setCreatingBlock] = useState(false)

  const handleCreateBlock = () => {
    const title = prompt('New MemoryBlock title (e.g., NEET PG Strategy)')?.trim()
    if (!title) return
    const id = crypto.randomUUID()
    setMemoryBlocks(prev => [...prev, { id, title }])
    setMemoryBlockId(id)
    setChapterId(crypto.randomUUID())
  }
  
  // Get current chapters
  const chapters = customChapters

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [inputMessage])

  // Scroll to bottom on new messages
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  // Close user menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showUserMenu])

  // Load twin data from URL parameters
  useEffect(() => {
    const twinIdParam = searchParams?.get('twinId')
    if (twinIdParam) {
      setTwinId(twinIdParam)
      console.log('Training twin with ID:', twinIdParam)
      // In production, you could fetch twin data from API here
      // For now, we'll use the URL params and form data
    }
  }, [searchParams])

  // Start training session with dynamic AI greeting
  useEffect(() => {
    if (!sessionStarted) {
      setSessionStarted(true)
      // Get dynamic greeting from AI
      getInitialGreeting()
    }
  }, [sessionStarted])

  const handlePublishTwin = async () => {
    if (!twinId || !currentUser?.id) {
      alert('Twin ID or user not found')
      return
    }
    
    try {
      console.log('Publishing twin:', twinId)
      
      const response = await fetch('/api/twins/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twinId,
          userId: currentUser.id
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log('Twin published successfully:', result.twin)
        alert(`Twin published successfully! Available at: ${window.location.origin}${result.publicUrl}`)
        // Optionally redirect to the published twin or success page
        router.push(result.publicUrl)
      } else {
        console.error('Failed to publish twin:', result.error)
        alert('Failed to publish twin: ' + result.error)
      }
    } catch (error) {
      console.error('Error publishing twin:', error)
      alert('Error publishing twin')
    }
  }

  const getInitialGreeting = async () => {
    try {
      setIsTyping(true)
      
      // Generate fresh user data for each session
      const freshUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const freshUserName = `User_${Date.now().toString().slice(-4)}`
      
      console.log('Creating fresh session with:', { freshUserId, freshUserName })
      
      // Store current user info
      setCurrentUser({ id: freshUserId, name: freshUserName })
      
      // Create a new logical thread id and chapter id for BFF
      const currentThreadId = crypto.randomUUID()
      setThreadId(currentThreadId)
      const newChapterId = crypto.randomUUID()
      setChapterId(newChapterId)
      console.log('New trainer session:', { currentThreadId, newChapterId })
      
      // Create placeholder greeting message for streaming
      const greetingId = Date.now().toString()
      const greeting: Message = {
        id: greetingId,
        role: "trainer",
        content: "",
        timestamp: new Date()
      }
      
      setMessages([greeting])
      
      // Start trainer via BFF and let it onboard
      await streamTrainer(
        twinId!,
        'Start onboarding',
        currentThreadId,
        memoryBlockId,
        newChapterId,
        // onToken callback - update greeting content as tokens arrive
        (token: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === greetingId 
              ? { ...msg, content: msg.content + token }
              : msg
          ))
        },
        // onComplete callback
        (fullMessage: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === greetingId 
              ? { ...msg, content: fullMessage }
              : msg
          ))
          setIsTyping(false)
        },
        // onError callback
        (error: Error) => {
          console.error('Error in streaming initial greeting:', error)
          // Fall back to static greeting
          const fallbackContent = interviewMode 
            ? "✨ Hey there! I'm your AI Trainer in Interview Mode. I'll guide you through essential questions to build your mentor twin. Let's start with your background - could you tell me about your professional experience and what makes you passionate about mentoring?"
            : "✨ Hey there! I'm your AI Trainer, ready to help you build your digital twin! You're in Custom Mode, so feel free to share whatever you'd like me to learn about you today. What would you like to train me on?"
         
          setMessages(prev => prev.map(msg => 
            msg.id === greetingId 
              ? { ...msg, content: fallbackContent }
              : msg
          ))
          setIsTyping(false)
        }
      )
    } catch (error) {
      console.error('Error getting initial greeting:', error)
      
      // Fallback to static greeting if API fails
      const fallbackGreeting: Message = {
        id: Date.now().toString(),
        role: "trainer",
        content: interviewMode 
          ? "✨ Hey there! I'm your AI Trainer in Interview Mode. I'll guide you through essential questions to build your mentor twin. Let's start with your background - could you tell me about your professional experience and what makes you passionate about mentoring?"
          : "✨ Hey there! I'm your AI Trainer, ready to help you build your digital twin! You're in Custom Mode, so feel free to share whatever you'd like me to learn about you today. What would you like to train me on?",
        timestamp: new Date()
      }
      setMessages([fallbackGreeting])
      setIsTyping(false)
    }
  }

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: inputMessage.trim(),
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputMessage("")
    setIsLoading(true)
    setIsTyping(true)

    // Create a placeholder message for streaming content
    const trainerMessageId = (Date.now() + 1).toString()
    const trainerMessage: Message = {
      id: trainerMessageId,
      role: "trainer",
      content: "",
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, trainerMessage])

    try {
      // Create thread if it doesn't exist
      let currentThreadId = threadId
      let userId = currentUser?.id
      let userName = currentUser?.name
      
      if (!currentThreadId || !userId || !userName) {
        // Generate fresh user data if not available
        userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        userName = `User_${Date.now().toString().slice(-4)}`
        setCurrentUser({ id: userId, name: userName })
        
        console.log("Creating new logical thread:", { userId, userName })
        currentThreadId = crypto.randomUUID()
        setThreadId(currentThreadId)
        if (!chapterId) setChapterId(crypto.randomUUID())
        console.log("Thread created:", currentThreadId)
      }

      // Stream via BFF trainer API
      console.log("Streaming trainer via BFF:", currentThreadId)
      await streamTrainer(
        twinId!,
        userMessage.content,
        currentThreadId,
        memoryBlockId,
        chapterId || crypto.randomUUID(),
        // onToken callback - update message content as tokens arrive
        (token: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === trainerMessageId 
              ? { ...msg, content: msg.content + token }
              : msg
          ))
        },
        // onComplete callback
        (fullMessage: string) => {
          setMessages(prev => prev.map(msg => 
            msg.id === trainerMessageId 
              ? { ...msg, content: fullMessage }
              : msg
          ))
          setIsTyping(false)
          setIsLoading(false)
        },
        // onError callback
        (error: Error) => {
          console.error('Error in streaming:', error)
          setMessages(prev => prev.map(msg => 
            msg.id === trainerMessageId 
              ? { ...msg, content: "I apologize, but I'm having trouble connecting to the training system right now. Please try again in a moment. In the meantime, feel free to continue sharing your experiences!" }
              : msg
          ))
          setIsTyping(false)
          setIsLoading(false)
        }
      )
    } catch (error) {
      console.error('Error in handleSendMessage:', error)
      
      // Update the placeholder message with fallback content
      setMessages(prev => prev.map(msg => 
        msg.id === trainerMessageId 
          ? { ...msg, content: "I apologize, but I'm having trouble connecting to the training system right now. Please try again in a moment. In the meantime, feel free to continue sharing your experiences!" }
          : msg
      ))
      setIsTyping(false)
      setIsLoading(false)
    }
  }

  // Check if user input contains instruction keywords
  const detectInstruction = (input: string): boolean => {
    const instructionKeywords = [
      "add instruction", "make sure", "always mention", "never say", "remember to",
      "instruction:", "rule:", "guideline:", "when responding", "make sure my twin"
    ]
    return instructionKeywords.some(keyword => input.toLowerCase().includes(keyword.toLowerCase()))
  }

  // Check if user input contains profile information
  const detectProfileInfo = (input: string): { type: string; detected: boolean } => {
    const profilePatterns = {
      achievement: [
        "I won", "I received", "I got awarded", "I achieved", "I earned", "I was recognized",
        "I completed certification", "I graduated", "I finished", "award", "certificate"
      ],
      link: [
        "my website", "my portfolio", "my github", "my linkedin", "check out my",
        "here's my", "you can find me at", "http", "www.", ".com", ".dev", ".io"
      ],
      skill: [
        "I'm good at", "I know", "I can", "I'm experienced in", "I work with",
        "I specialize in", "my skills include", "I'm proficient in"
      ],
      experience: [
        "I work at", "I worked at", "my job", "my role", "I'm a", "I was a",
        "my company", "my position", "currently working"
      ],
      education: [
        "I studied", "I went to", "I have a degree", "my university", "my college",
        "I majored in", "graduated from"
      ]
    }

    for (const [type, patterns] of Object.entries(profilePatterns)) {
      if (patterns.some(pattern => input.toLowerCase().includes(pattern.toLowerCase()))) {
        return { type, detected: true }
      }
    }
    
    return { type: '', detected: false }
  }

  // Generate contextual responses based on conversation
  const getTrainerResponse = (userInput: string, history: Message[]): string => {
    const messageCount = history.filter(m => m.role === "user").length

    // Check if this looks like an instruction
    if (detectInstruction(userInput)) {
      return "💡 I notice this sounds like an instruction for your AI Twin! Would you like me to add this as a permanent guideline? I can help you refine it to make sure your twin follows it consistently. Should I add this instruction for you?"
    }

    // Check if this contains profile information
    const profileDetection = detectProfileInfo(userInput)
    if (profileDetection.detected) {
      const profileResponses = {
        achievement: "🏆 That's an impressive achievement! This sounds like something important for your portfolio. Would you like me to add this to your achievements section? I can help capture the details and make sure it's properly documented.",
        link: "🔗 I noticed you mentioned a link or website! This would be great to add to your portfolio. Should I help you save this link so people can easily find your work?",
        skill: "🎯 Great! It sounds like you have valuable skills to showcase. Would you like me to add these to your skills section in your portfolio? I can help organize them by proficiency level too.",
        experience: "💼 Your work experience is valuable information! This would be perfect for your portfolio. Should I help you add this experience with proper details like dates and responsibilities?",
        education: "🎓 Your educational background is important! Would you like me to add this to your education section in your portfolio? I can help organize all the details properly."
      }
      
      return profileResponses[profileDetection.type as keyof typeof profileResponses] || 
        "📝 This sounds like valuable information for your profile! Would you like me to help you save this to your portfolio?"
    }

    if (interviewMode) {
      // Structured interview questions for mentors
      const mentorInterviewQuestions = [
        "🎯 Great! Now let's dive deeper. What type of mentees do you typically work with, and what draws you to mentoring?",
        "🌟 Excellent! What are the most common challenges your mentees bring to you? What patterns do you see?",
        "💪 Let's talk about your mentoring approach. Do you have a specific philosophy or framework you follow?",
        "🎨 Can you share a mentoring success story? Tell me about a time when you really made a difference for someone.",
        "💬 How would you describe your mentoring style? Are you more of a coach, advisor, or something else?",
        "🚀 What's your expertise area that makes you valuable as a mentor? What unique insights do you offer?",
        "💡 What advice do you find yourself giving repeatedly? What are your go-to wisdom nuggets?",
        "🔧 How do you typically structure your mentoring relationships? What boundaries do you set?",
        "🎓 What's been your own learning journey that prepared you to mentor others?",
        "🤔 What would you want potential mentees to know about working with you?"
      ]

      if (messageCount <= mentorInterviewQuestions.length) {
        return mentorInterviewQuestions[messageCount - 1] || "🌟 This is really insightful! Tell me more about what makes this approach effective."
      }
      
      // Interview follow-ups
      const interviewFollowUps = [
        "🤔 That's a great example! Can you give me more specific details about how that situation unfolded?",
        "✨ I love that approach! How did you develop this mentoring style over time?",
        "💭 That's valuable insight! What would you say to other mentors who struggle with this?",
        "🔍 Tell me more about that - what made that particular mentoring relationship successful?",
        "🌟 That's exactly the kind of wisdom your twin should share! Any other similar experiences?"
      ]
      
      return interviewFollowUps[Math.floor(Math.random() * interviewFollowUps.length)]
    } else {
      // Custom mode - more open-ended responses
      const customModeResponses = [
        "🤔 That's fascinating! Can you tell me more about what made that experience so impactful?",
        "✨ I love that perspective! How has this shaped the way you approach mentoring?",
        "💭 That's a great insight! What would you want your mentees to learn from this?",
        "🔍 Interesting! What other details about this would help someone understand your approach?",
        "🌟 That's valuable information! Is there anything else about this topic that's important to your mentoring?",
        "🎯 Perfect! What other aspects of your mentoring experience should I know about?"
      ]
      
      return customModeResponses[Math.floor(Math.random() * customModeResponses.length)]
    }
  }

  const generateReflection = () => {
    setShowReflectionModal(true)
    setIsGeneratingReflection(true)
    
    // Simulate AI reflection generation based on conversation history
    setTimeout(() => {
      const messageCount = messages.filter(m => m.role === "user").length
      const conversationDepth = messages.length
      
      let reflectionText = ""
      
      if (messageCount === 0) {
        reflectionText = "I'm excited to get to know you! While we haven't started our conversation yet, I can sense you're ready to share your story. I'm here to help you explore and articulate the experiences that have shaped who you are today."
      } else if (messageCount < 3) {
        reflectionText = `Based on our brief conversation so far, I can see you're thoughtful about sharing your experiences. You've given me ${messageCount} glimpse${messageCount > 1 ? 's' : ''} into your world, and I'm already starting to understand your communication style. There's clearly much more depth to your story that I'm eager to explore with you.`
      } else if (messageCount < 6) {
        reflectionText = `Through our ${conversationDepth} exchanges, I'm beginning to see patterns in how you think and express yourself. You seem to be someone who values authenticity and takes time to reflect before sharing. Your experiences suggest a journey of growth and learning. I can sense there are pivotal moments in your story that have really shaped your perspective.`
      } else {
        reflectionText = `After our rich conversation with ${conversationDepth} exchanges, I'm developing a clearer picture of who you are. You demonstrate thoughtfulness in how you approach challenges, and there's a clear thread of resilience running through your experiences. Your communication style shows both vulnerability and strength - you're willing to share meaningful experiences while maintaining perspective on your growth. I can see how your past experiences are informing your current worldview and future aspirations.`
      }
      
      reflectionText += " Through our structured training conversation, I'm learning about different facets of your personality - from your professional background to personal values to the experiences that have shaped who you are today."
      
      setReflection(reflectionText)
      setIsGeneratingReflection(false)
    }, 2000) // Simulate processing time
  }

  const handlePauseTraining = () => {
    // Save progress and navigate to dashboard
    router.push("/explore/my-twin")
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    e.preventDefault()
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing) return
    
    const newWidth = window.innerWidth - e.clientX
    const minWidth = 300
    const maxWidth = 600
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setPreviewWidth(newWidth)
    }
  }

  const handleMouseUp = () => {
    setIsResizing(false)
  }

  useEffect(() => {
    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isResizing])

  const handlePanelMouseDown = (e: React.MouseEvent) => {
    setIsPanelResizing(true)
    e.preventDefault()
  }

  const handlePanelMouseMove = (e: MouseEvent) => {
    if (!isPanelResizing) return
    
    const newWidth = window.innerWidth - e.clientX
    const minWidth = 300
    const maxWidth = 800
    
    if (newWidth >= minWidth && newWidth <= maxWidth) {
      setPanelWidth(newWidth)
    }
  }

  const handlePanelMouseUp = () => {
    setIsPanelResizing(false)
  }

  useEffect(() => {
    if (isPanelResizing) {
      document.addEventListener('mousemove', handlePanelMouseMove)
      document.addEventListener('mouseup', handlePanelMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    }

    return () => {
      document.removeEventListener('mousemove', handlePanelMouseMove)
      document.removeEventListener('mouseup', handlePanelMouseUp)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }
  }, [isPanelResizing])

  return (
    <div className="flex h-screen bg-[#0d1117]">
      {/* Main Chat Area */}
      <div className={cn("flex flex-col transition-all duration-300", previewOpen ? "flex-1" : "flex-1")}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-[hsl(0_0%_18%)]">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="hover:bg-secondary/70"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-white">Training Your Twin</h1>
                <p className="text-sm text-muted-foreground">
                  Training your AI Twin with essential questions
                </p>
              </div>
            </div>
            {/* Publish Block */}
            <Button
              variant="outline"
              size="sm"
              className="border-[hsl(0_0%_18%)] hover:bg-[#0d1117]"
              onClick={async () => {
                try {
                  if (!twinId) return
                  const res = await fetch(`/api/twins/${twinId}/memory/block/status`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ memory_block_id: memoryBlockId, status: 'published' })
                  })
                  if (!res.ok) throw new Error(`HTTP ${res.status}`)
                  alert('MemoryBlock published')
                } catch (e) {
                  console.error('Publish failed', e)
                  alert('Failed to publish block')
                }
              }}
            >
              Publish Block
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">Twin Development</span>
              </div>
              <div className="flex items-center gap-2 ml-4">
                <div className="w-20 bg-[hsl(0_0%_18%)] rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: "35%" }}></div>
                </div>
                <span className="text-xs text-primary font-semibold">35%</span>
              </div>
            </div>
            {/* MemoryBlock Selector */}
            <div className="flex items-center gap-2 bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg px-3 py-2">
              <span className="text-sm text-muted-foreground">Block</span>
              <select
                value={memoryBlockId}
                onChange={(e) => {
                  const id = e.target.value
                  if (id === '__create__') {
                    handleCreateBlock()
                    return
                  }
                  setMemoryBlockId(id)
                  setChapterId(crypto.randomUUID())
                }}
                className="bg-transparent text-white text-sm outline-none"
              >
                {memoryBlocks.map(b => (
                  <option key={b.id} value={b.id} className="bg-[hsl(0_0%_8%)]">
                    {b.title}
                  </option>
                ))}
                <option value="__create__" className="bg-[hsl(0_0%_8%)] text-primary">+ New MemoryBlock</option>
              </select>
            </div>
            
            {/* Interview Mode Toggle */}
            <div className="flex items-center gap-2 bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-white">Interview Mode</span>
              </div>
              <button
                onClick={handleModeSwitch}
                className={cn(
                  "relative inline-flex h-5 w-9 items-center rounded-full transition-colors ml-2",
                  interviewMode ? "bg-primary" : "bg-[hsl(0_0%_24%)]"
                )}
              >
                <span
                  className={cn(
                    "inline-block h-3 w-3 transform rounded-full bg-white transition-transform",
                    interviewMode ? "translate-x-5" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPreviewOpen(!previewOpen)}
              className="border-[hsl(0_0%_18%)] hover:bg-[#0d1117]"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            
            {/* User Menu */}
            <div className="relative" ref={userMenuRef}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="hover:bg-secondary/70 px-2"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {session?.user?.name?.split(' ').map(n => n[0]).join('') || 'U'}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="h-3 w-3 ml-1" />
              </Button>

              {showUserMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg shadow-lg z-50">
                  <div className="p-3 border-b border-[hsl(0_0%_18%)]">
                    <p className="text-sm font-medium text-white">{session?.user?.name || "User"}</p>
                    <p className="text-xs text-muted-foreground">{session?.user?.email || ""}</p>
                  </div>
                  <div className="py-2">
                    <button
                      onClick={() => {
                        handlePauseTraining()
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[hsl(0_0%_12%)] transition-colors"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      Twin Dashboard
                    </button>
                    <button
                      onClick={() => {
                        router.push("/portfolio")
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[hsl(0_0%_12%)] transition-colors"
                    >
                      <User className="h-4 w-4" />
                      My Portfolio
                    </button>
                    <button
                      onClick={() => {
                        router.push("/settings")
                        setShowUserMenu(false)
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-white hover:bg-[hsl(0_0%_12%)] transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </button>
                    <div className="border-t border-[hsl(0_0%_18%)] mt-2 pt-2">
                      <button
                        onClick={() => {
                          // Handle logout
                          setShowUserMenu(false)
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn(
                  "flex gap-3",
                  message.role === "user" && "justify-end"
                )}
              >
                {message.role === "trainer" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                      <PenTool className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div className={cn(
                  "max-w-[80%]",
                  message.role === "user" && "flex flex-col items-end"
                )}>
                  {message.role === "trainer" && (
                    <p className="text-xs text-muted-foreground mb-1">
                      AI Trainer
                    </p>
                  )}
                  <div className={cn(
                    "rounded-lg px-4 py-3",
                    message.role === "user"
                      ? "bg-primary text-primary-foreground"
                      : "bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)]"
                  )}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{message.content}</p>
                  </div>
                  <span className="text-xs text-muted-foreground mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit"
                    })}
                  </span>
                </div>

                {message.role === "user" && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-sm">You</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-bold">
                    <PenTool className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                    <span className="text-sm text-muted-foreground">AI Trainer is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-6 border-t border-[hsl(0_0%_18%)] bg-[hsl(0_0%_4%)]">
          <div className="max-w-3xl mx-auto">
            {/* Quick Actions */}
            <div className="flex items-center gap-2 mb-3">
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_8%)] hover:border-primary/30"
                onClick={() => {
                  setSidebarOpen(true)
                  router.push("/explore/insights")
                }}
              >
                <BarChart3 className="h-3 w-3 mr-1.5" />
                Insights
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="h-8 text-xs border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_8%)] hover:border-primary/30"
                onClick={generateReflection}
              >
                <Sparkles className="h-3 w-3 mr-1.5" />
                Reflect
              </Button>
              <AddMemoryDropdown 
                onAddContent={(content) => {
                  setInputMessage(content)
                }}
              />
            </div>

            {/* Input Box */}
            <div className="relative bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg focus-within:border-primary/50 transition-colors">
              <Textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault()
                    handleSendMessage()
                  }
                }}
                placeholder="Share your story... Every detail helps paint a complete picture of who you are"
                className="min-h-[80px] max-h-[200px] w-full resize-none bg-transparent border-0 text-white placeholder:text-muted-foreground focus:outline-none focus:ring-0 p-4 pr-16"
                rows={3}
              />
              
              {/* Character count */}
              <div className="absolute bottom-2 left-4 text-xs text-muted-foreground">
                {inputMessage.length > 0 && (
                  <span>{inputMessage.length} characters</span>
                )}
              </div>

              {/* Send button */}
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isLoading}
                size="icon"
                className="absolute bottom-3 right-3 h-10 w-10 bg-primary hover:bg-primary/90 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="h-4 w-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="h-4 w-4 text-black" />
                )}
              </Button>
            </div>

            {/* Helper text */}
            <div className="flex items-center justify-between mt-3">
              <p className="text-xs text-muted-foreground">
                {interviewMode 
                  ? "🎯 Interview Mode: I'll guide you through structured mentoring questions"
                  : "✨ Custom Mode: Share whatever mentoring experiences feel important to you"
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Press <kbd className="px-1.5 py-0.5 text-xs bg-[hsl(0_0%_18%)] rounded">Enter</kbd> to send
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Book Progress */}
      {sidebarOpen && (
        <div 
          className="border-l border-[hsl(0_0%_18%)] bg-[hsl(0_0%_6%)] p-4 overflow-y-auto flex flex-col relative"
          style={{ width: `${previewWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-primary" />
            </div>
          </div>

          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Twin Training
              </h2>
              {isResizing && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                  {previewWidth}px
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Quick resize buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewWidth(300)}
                  className="h-6 px-2 text-xs hover:bg-[hsl(0_0%_18%)]"
                >
                  S
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewWidth(400)}
                  className="h-6 px-2 text-xs hover:bg-[hsl(0_0%_18%)]"
                >
                  M
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewWidth(500)}
                  className="h-6 px-2 text-xs hover:bg-[hsl(0_0%_18%)]"
                >
                  L
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(false)}
                className="h-6 w-6 hover:bg-[hsl(0_0%_18%)]"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          <div className="space-y-3">

          {/* Training Progress */}
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">Training Progress</h3>
              <div className={cn(
                "px-2 py-1 rounded-full text-xs font-medium",
                interviewMode 
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "bg-green-500/10 text-green-400 border border-green-500/20"
              )}>
                {interviewMode ? "Interview" : "Custom"}
              </div>
            </div>
            <div className="w-full bg-[hsl(0_0%_18%)] rounded-full h-2 mb-2">
              <div className="bg-primary h-2 rounded-full transition-all duration-500" style={{ width: "35%" }}></div>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">7 of 20 questions answered</p>
              <span className="text-xs text-primary font-semibold">35%</span>
            </div>
          </div>

          {/* Publish Twin */}
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Publish Your Twin</h3>
            <p className="text-xs text-muted-foreground mb-3">
              Make your AI twin available for others to interact with
            </p>
            <Button
              onClick={handlePublishTwin}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
              disabled={!twinId || messages.filter(m => m.role === "user").length < 3}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Publish Twin
            </Button>
            {messages.filter(m => m.role === "user").length < 5 && (
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Complete more training to unlock publishing
              </p>
            )}
          </div>

          {/* Training Questions */}
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-3">Essential Questions</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[
                { id: 1, question: "What's your professional background?", completed: true },
                { id: 2, question: "What are your core values?", completed: true },
                { id: 3, question: "What are your key achievements?", completed: true },
                { id: 4, question: "What challenges have you overcome?", completed: false },
                { id: 5, question: "What are your hobbies and interests?", completed: false },
                { id: 6, question: "What's your communication style?", completed: false },
                { id: 7, question: "What are your future goals?", completed: false },
                { id: 8, question: "What advice would you give to others?", completed: false },
                { id: 9, question: "What are your technical skills?", completed: false },
                { id: 10, question: "What's your educational background?", completed: false },
              ].map((item) => (
                <div key={item.id} className="flex items-center gap-2 p-2 rounded-lg hover:bg-[hsl(0_0%_10%)] transition-colors group">
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                    item.completed 
                      ? "bg-green-500 border-green-500" 
                      : "border-[hsl(0_0%_24%)] group-hover:border-primary/50"
                  )}>
                    {item.completed && <CheckCircle2 className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className={cn(
                    "text-xs flex-1",
                    item.completed ? "text-muted-foreground line-through" : "text-white"
                  )}>
                    {item.question}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Custom Chapters */}
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">
                Add Content
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs hover:bg-[hsl(0_0%_18%)] px-2"
                  onClick={() => router.push("/explore/chapters")}
                >
                  <BookOpen className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs hover:bg-[hsl(0_0%_18%)] px-2"
                  onClick={() => setShowAddChapter(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              {chapters.length > 0 ? chapters.map((chapter, index) => {
                const Icon = chapter.icon
                return (
                  <div 
                    key={chapter.id}
                    className={cn(
                      "flex items-start gap-3 p-2 rounded-lg transition-colors group",
                      chapter.status === "current" && "bg-primary/10 border border-primary/30",
                      chapter.status === "completed" && "hover:bg-[hsl(0_0%_18%)] cursor-pointer"
                    )}
                  >
                    <div className={cn(
                      "mt-0.5",
                      chapter.status === "completed" && "text-green-500",
                      chapter.status === "current" && "text-primary",
                      chapter.status === "locked" && "text-muted-foreground opacity-50"
                    )}>
                      {chapter.status === "completed" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className={cn(
                        "text-sm font-medium",
                        chapter.status === "current" && "text-white",
                        chapter.status === "completed" && "text-muted-foreground group-hover:text-white",
                        chapter.status === "locked" && "text-muted-foreground opacity-50"
                      )}>
                        {chapter.title}
                      </h4>
                      <p className={cn(
                        "text-xs mt-0.5",
                        chapter.status === "locked" ? "text-muted-foreground opacity-50" : "text-muted-foreground"
                      )}>
                        {chapter.description}
                      </p>
                    </div>
                    {chapter.status === "completed" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setViewingChapter(chapter.id)}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                )
              }) : (
                <div className="text-center py-8 text-muted-foreground">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No chapters created yet</p>
                  <p className="text-xs mt-1">Add your first custom chapter to get started</p>
                </div>
              )}

              {/* Add Chapter Button - More Visible */}
              <button
                onClick={() => setShowAddChapter(true)}
                className="w-full p-3 border border-dashed border-[hsl(0_0%_18%)] hover:border-primary/50 rounded-lg text-sm text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2 mt-2"
              >
                <Plus className="h-4 w-4" />
                Add Custom Chapter
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-white">
                Twin Instructions
              </h3>
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs hover:bg-[hsl(0_0%_18%)] px-2"
                  onClick={() => router.push("/explore/my-twin")}
                >
                  <Settings className="h-3 w-3" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-6 text-xs hover:bg-[hsl(0_0%_18%)] px-2"
                  onClick={() => setShowInstructionModal(true)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
            </div>

            <div className="text-center py-4">
              <div className="text-2xl font-bold text-white">{instructions.length}</div>
              <p className="text-xs text-muted-foreground">Active instructions</p>
            </div>

            <div className="space-y-2 mt-4">
              <Button
                size="sm" 
                variant="outline"
                className="w-full h-8 text-xs border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                onClick={() => router.push("/explore/my-twin")}
              >
                <Settings className="h-3 w-3 mr-1.5" />
                View All Instructions
              </Button>
              
              <button
                onClick={() => setShowInstructionModal(true)}
                className="w-full p-3 border border-dashed border-[hsl(0_0%_18%)] hover:border-primary/50 rounded-lg text-sm text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Instruction
              </button>
            </div>
          </div>

          {/* Writing Tips */}
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-4">
            <h3 className="text-sm font-medium text-white mb-2">Writing Tips</h3>
            <div className="space-y-2 text-xs text-muted-foreground">
              <p>• Be specific - names, dates, and details matter</p>
              <p>• Share the "why" behind your decisions</p>
              <p>• Include failures - they make success meaningful</p>
            </div>
          </div>

          {/* Create New Conversation - Only show when sufficient progress */}
          {(messages.filter(m => m.role === "user").length >= 7) && (
            <div className="bg-gradient-to-r from-primary/10 to-primary/5 border border-primary/30 rounded-lg p-4">
              <div className="text-center">
                <CheckCircle2 className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <h3 className="text-sm font-medium text-white mb-1">Basic Training Complete!</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  You've answered enough essential questions to create a functional twin.
                </p>
                <Button
                  onClick={() => router.push("/explore/playground")}
                  className="w-full bg-primary hover:bg-primary/90 text-black font-medium"
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Create New Conversation
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  You can always return here to add more details
                </p>
              </div>
            </div>
          )}
          </div>
        </div>
      )}

      {/* Sidebar Toggle Button */}
      {!sidebarOpen && (
        <div className="fixed right-4 top-1/2 transform -translate-y-1/2 z-10">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="h-8 w-8 border-[hsl(0_0%_18%)] bg-[hsl(0_0%_8%)] hover:bg-[hsl(0_0%_10%)]"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Preview Panel */}
      {previewOpen && (
        <div 
          className="border-l border-[hsl(0_0%_18%)] bg-[hsl(0_0%_6%)] flex flex-col relative"
          style={{ width: `${previewWidth}px` }}
        >
          {/* Resize Handle */}
          <div
            className="absolute left-0 top-0 bottom-0 w-1 cursor-col-resize hover:bg-primary/50 transition-colors group"
            onMouseDown={handleMouseDown}
          >
            <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <GripVertical className="h-4 w-4 text-primary" />
            </div>
          </div>
          {/* Preview Header */}
          <div className="flex items-center justify-between p-4 border-b border-[hsl(0_0%_18%)]">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Preview Your Twin
              </h3>
              {isResizing && (
                <span className="text-xs text-primary bg-primary/10 px-2 py-1 rounded">
                  {previewWidth}px
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Quick resize buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewWidth(300)}
                  className="h-6 px-2 text-xs hover:bg-[hsl(0_0%_18%)]"
                >
                  S
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewWidth(400)}
                  className="h-6 px-2 text-xs hover:bg-[hsl(0_0%_18%)]"
                >
                  M
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPreviewWidth(500)}
                  className="h-6 px-2 text-xs hover:bg-[hsl(0_0%_18%)]"
                >
                  L
                </Button>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setPreviewOpen(false)}
                className="h-6 w-6 hover:bg-[hsl(0_0%_18%)]"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Twin Welcome */}
          <div className="p-4 border-b border-[hsl(0_0%_18%)]">
            <div className="text-center">
              <Avatar className="h-16 w-16 mx-auto mb-3">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  SC
                </AvatarFallback>
              </Avatar>
              <h4 className="text-lg font-semibold text-white mb-1">Sarah Chen</h4>
              <p className="text-sm text-muted-foreground mb-3">Turning coffee into code since 2019</p>
              <div className="flex items-center gap-1 px-2 py-0.5 bg-green-500/10 border border-green-500/30 rounded-full w-fit mx-auto">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="text-xs text-green-400">AI Twin Active</span>
              </div>
            </div>
          </div>

          {/* Chat Preview */}
          <div className="flex-1 p-4">
            <div className="space-y-4">
              {/* Sample conversation */}
              <div className="flex items-start gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-secondary text-xs">V</AvatarFallback>
                </Avatar>
                <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-white">Hi! Can you tell me about your background?</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">SC</AvatarFallback>
                </Avatar>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 max-w-[80%]">
                  <p className="text-sm text-white">Hello! I'm Sarah, a passionate software engineer who's been turning coffee into code since 2019. I love building innovative solutions and have experience in full-stack development.</p>
                </div>
              </div>

              <div className="text-center py-4">
                <p className="text-xs text-muted-foreground">This is how visitors will chat with your AI Twin</p>
              </div>
            </div>
          </div>

          {/* Test Input */}
          <div className="p-4 border-t border-[hsl(0_0%_18%)]">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Test your twin..."
                className="flex-1 px-3 py-2 bg-[#0d1117] border border-[hsl(0_0%_18%)] rounded-md text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none text-sm"
              />
              <Button size="sm" className="px-3">
                <Send className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Add Chapter Modal */}
      {showAddChapter && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4">Add Custom Chapter</h3>
            <p className="text-sm text-muted-foreground mb-4">
              What aspect of your story would you like to explore? Add a custom chapter about anything that matters to you.
            </p>
            
            {/* Suggested Topics */}
            <div className="mb-4">
              <p className="text-xs text-muted-foreground mb-2">Suggested topics:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  { title: "Hobbies & Passions", desc: "What you love to do outside work" },
                  { title: "Side Projects", desc: "Personal projects and initiatives" },
                  { title: "Travel & Culture", desc: "Places and experiences that shaped you" },
                  { title: "Personal Philosophy", desc: "Your beliefs and values" },
                  { title: "Future Goals", desc: "Where you're headed next" }
                ].map((topic) => (
                  <button
                    key={topic.title}
                    onClick={() => {
                      setNewChapterTitle(topic.title)
                      setNewChapterDescription(topic.desc)
                    }}
                    className="px-3 py-1 text-xs bg-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_24%)] rounded-full text-muted-foreground hover:text-white transition-colors"
                  >
                    {topic.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Chapter Title</label>
                <input
                  type="text"
                  placeholder="e.g. My Creative Journey"
                  value={newChapterTitle}
                  onChange={(e) => setNewChapterTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[hsl(0_0%_18%)] rounded-md text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                  autoFocus
                />
              </div>

              <div>
                <label className="text-xs text-muted-foreground mb-1 block">Brief Description</label>
                <input
                  type="text"
                  placeholder="What this chapter covers..."
                  value={newChapterDescription}
                  onChange={(e) => setNewChapterDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-[#0d1117] border border-[hsl(0_0%_18%)] rounded-md text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => {
                  if (newChapterTitle.trim() && newChapterDescription.trim()) {
                    const newChapter: Chapter = {
                      id: `custom-${Date.now()}`,
                      title: newChapterTitle,
                      icon: FileText,
                      status: "current",
                      description: newChapterDescription
                    }
                    setCustomChapters([...customChapters, newChapter])
                    setInputMessage(`I'd like to tell you about ${newChapterTitle}. ${newChapterDescription}. This is important to my story because...`)
                    setNewChapterTitle("")
                    setNewChapterDescription("")
                    setShowAddChapter(false)
                  }
                }}
                disabled={!newChapterTitle.trim() || !newChapterDescription.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-black disabled:opacity-50"
              >
                Add Chapter
              </Button>
              <Button
                onClick={() => {
                  setShowAddChapter(false)
                  setNewChapterTitle("")
                  setNewChapterDescription("")
                }}
                variant="outline"
                className="flex-1 border-[hsl(0_0%_18%)] hover:bg-[#0d1117]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* View Chapter Modal */}
      {viewingChapter && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg max-w-4xl w-full max-h-[80vh] flex flex-col">
            {/* Chapter Header */}
            <div className="p-6 border-b border-[hsl(0_0%_18%)]">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {chapters.find(c => c.id === viewingChapter)?.title}
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    {chapters.find(c => c.id === viewingChapter)?.description}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setViewingChapter(null)}
                  className="h-8 w-8 p-0"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Chapter Content */}
            <ScrollArea className="flex-1 p-6">
              <div className="prose prose-invert max-w-none">
                {viewingChapter === "intro" ? (
                  <div className="space-y-6">
                    <p className="text-lg leading-relaxed text-gray-300">
                      <span className="text-3xl font-serif float-left mr-2 mt-1 text-primary">M</span>
                      y journey began in a small town, where dreams seemed as distant as the stars. 
                      I'm Sarah Chen, a product manager at Google, but my story is about much more than titles and companies.
                    </p>
                    
                    <p className="text-gray-300 leading-relaxed">
                      Growing up, I was fascinated by how technology could connect people and solve real problems. 
                      This curiosity led me down a path I never expected - from a computer science student at Stanford 
                      to leading product teams at one of the world's most innovative companies.
                    </p>

                    <blockquote className="border-l-4 border-primary pl-4 my-6 italic text-gray-400">
                      "The best way to predict the future is to invent it." - This quote has guided every step of my journey.
                    </blockquote>

                    <p className="text-gray-300 leading-relaxed">
                      Today, I'm passionate about helping others navigate their tech careers. Whether you're a student 
                      wondering how to break into tech, or a professional looking to transition, I'm here to share 
                      what I've learned along the way.
                    </p>
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">
                      This chapter is still being written. Continue your conversation to add more to your story.
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>

            {/* Chapter Navigation */}
            <div className="p-4 border-t border-[hsl(0_0%_18%)] flex items-center justify-between">
              <Button
                size="sm"
                variant="outline"
                className="border-[hsl(0_0%_18%)]"
                disabled
              >
                ← Previous Chapter
              </Button>
              <span className="text-xs text-muted-foreground">
                Chapter 1 of {chapters.length}
              </span>
              <Button
                size="sm"
                variant="outline"
                className="border-[hsl(0_0%_18%)]"
              >
                Next Chapter →
              </Button>
            </div>
          </div>
        </div>
      )}


      {/* Add Instruction Modal */}
      {showInstructionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Lightbulb className="h-5 w-5" />
              Add Instruction for Your Twin
            </h3>
            <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
              Give your AI Twin specific guidance on how to respond. These instructions will help 
              your twin maintain consistency across all conversations.
            </p>
            
            <div className="mb-4">
              <label className="text-xs text-muted-foreground mb-2 block">Instruction</label>
              <textarea
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                placeholder="e.g., Always mention my passion for helping students when discussing career advice..."
                rows={4}
                className="w-full px-3 py-2 bg-[#0d1117] border border-[hsl(0_0%_18%)] rounded-md text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Be specific and clear. Your twin will follow these guidelines in all conversations.
              </p>
            </div>

            {/* Example Instructions */}
            <div className="mb-6">
              <p className="text-xs text-muted-foreground mb-2">Example instructions:</p>
              <div className="space-y-2">
                {[
                  "Always mention my 5+ years of mentoring experience",
                  "Keep responses under 2 paragraphs for better readability", 
                  "Emphasize my startup background when discussing entrepreneurship",
                  "Never give financial advice, redirect to professionals"
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setNewInstruction(example)}
                    className="w-full text-left p-2 text-xs bg-[hsl(0_0%_6%)] hover:bg-[hsl(0_0%_12%)] border border-[hsl(0_0%_18%)] hover:border-[hsl(0_0%_24%)] rounded text-muted-foreground hover:text-white transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={() => {
                  if (newInstruction.trim()) {
                    setInstructions([...instructions, newInstruction.trim()])
                    setNewInstruction("")
                    setShowInstructionModal(false)
                    // You could add a success message here
                  }
                }}
                disabled={!newInstruction.trim()}
                className="flex-1 bg-primary hover:bg-primary/90 text-black disabled:opacity-50"
              >
                Add Instruction
              </Button>
              <Button
                onClick={() => {
                  setShowInstructionModal(false)
                  setNewInstruction("")
                }}
                variant="outline"
                className="flex-1 border-[hsl(0_0%_18%)] hover:bg-[#0d1117]"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reflection Modal */}
      {showReflectionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6 max-w-2xl w-full max-h-[80vh] flex flex-col">
            {/* Reflection Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">AI Reflection</h2>
                  <p className="text-sm text-muted-foreground">
                    Based on our conversation so far
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowReflectionModal(false)}
                className="h-8 w-8 hover:bg-[hsl(0_0%_18%)]"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Reflection Content */}
            <div className="flex-1 bg-[hsl(0_0%_6%)] border border-[hsl(0_0%_18%)] rounded-lg p-6 overflow-y-auto">
              {isGeneratingReflection ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="relative">
                    <Sparkles className="h-8 w-8 text-primary animate-pulse" />
                    <div className="absolute inset-0 h-8 w-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
                  </div>
                  <p className="text-white mt-4 font-medium">Generating reflection...</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Analyzing our conversation and your shared experiences
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                      <Sparkles className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-white leading-relaxed">{reflection}</p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-4 border-t border-[hsl(0_0%_18%)]">
                    <p className="text-xs text-muted-foreground mb-3">
                      This reflection helps your AI Twin understand you better. Continue conversations to get more personalized insights.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={generateReflection}
                        className="border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                      >
                        <Sparkles className="h-3 w-3 mr-1.5" />
                        Generate New Reflection
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setInputMessage("I'd like to hear more about your reflection on who I am. What other insights do you have?")
                          setShowReflectionModal(false)
                        }}
                        className="border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                      >
                        <MessageCircle className="h-3 w-3 mr-1.5" />
                        Discuss This Reflection
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
