"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  ArrowLeft,
  Brain,
  MessageSquare,
  Users,
  BarChart3,
  Settings,
  Sparkles,
  BookOpen,
  Edit,
  Trash2,
  Eye,
  ChevronRight,
  Plus,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Zap,
  PenTool,
  CheckCircle2,
  Lightbulb,
  Check,
  X
} from "lucide-react"
import { cn } from '@/lib/utils'

interface Stat {
  label: string
  value: string | number
  change?: string
  icon: any
}

interface Chapter {
  id: string
  title: string
  status: "completed" | "in-progress" | "locked"
  wordCount?: number
  lastUpdated?: string
}

interface Conversation {
  id: string
  userName: string
  lastMessage: string
  timestamp: string
  messages: number
}

export default function MyTwinDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("overview")
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [instructions, setInstructions] = useState<string[]>([
    "Always mention my 5+ years of mentoring experience when discussing career guidance",
    "Keep responses under 2 paragraphs for better readability",
    "Emphasize my startup background when discussing entrepreneurship",
    "Never give financial advice, redirect to financial professionals"
  ])
  const [editingInstruction, setEditingInstruction] = useState<number | null>(null)
  const [editValue, setEditValue] = useState("")

  // Mock data - would come from API
  const twinData = {
    name: "Sarah Chen",
    tagline: "Turning coffee into code since 2019",
    personality: "Friendly",
    tone: "Conversational",
    createdAt: "2024-01-15",
    lastTrained: "2024-01-20",
    profileCompletion: 75,
    totalConversations: 23,
    totalMessages: 156,
    avgResponseTime: "2.3s",
    satisfactionScore: 4.8
  }

  const stats: Stat[] = [
    {
      label: "Total Conversations",
      value: twinData.totalConversations,
      change: "+12%",
      icon: MessageSquare
    },
    {
      label: "Active Users",
      value: 18,
      change: "+5%",
      icon: Users
    },
    {
      label: "Avg Response Time",
      value: twinData.avgResponseTime,
      icon: Clock
    },
    {
      label: "Satisfaction Score",
      value: `${twinData.satisfactionScore}/5`,
      change: "+0.3",
      icon: TrendingUp
    }
  ]

  const chapters: Chapter[] = [
    {
      id: "intro",
      title: "Introduction",
      status: "completed",
      wordCount: 523,
      lastUpdated: "2 days ago"
    },
    {
      id: "journey",
      title: "The Journey",
      status: "completed",
      wordCount: 789,
      lastUpdated: "2 days ago"
    },
    {
      id: "achievements",
      title: "Achievements",
      status: "in-progress",
      wordCount: 245,
      lastUpdated: "1 day ago"
    },
    {
      id: "challenges",
      title: "Challenges",
      status: "locked"
    },
    {
      id: "wisdom",
      title: "Wisdom",
      status: "locked"
    }
  ]

  const recentConversations: Conversation[] = [
    {
      id: "1",
      userName: "Alex Kumar",
      lastMessage: "Thanks for the career advice!",
      timestamp: "2 hours ago",
      messages: 12
    },
    {
      id: "2",
      userName: "Jessica Park",
      lastMessage: "Can we schedule a follow-up?",
      timestamp: "5 hours ago",
      messages: 8
    },
    {
      id: "3",
      userName: "Michael Chen",
      lastMessage: "Great insights on ML careers",
      timestamp: "1 day ago",
      messages: 15
    }
  ]

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <div className="border-b border-[hsl(0_0%_18%)] bg-[hsl(0_0%_4%)]">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push("/explore")}
                className="hover:bg-secondary/70"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Brain className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">My AI Twin</h1>
                  <p className="text-sm text-muted-foreground">Manage your digital representative</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/explore/train")}
                className="border-[hsl(0_0%_18%)] hover:bg-[#0d1117]"
              >
                <PenTool className="h-4 w-4 mr-2" />
                Continue Training
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/explore/edit")}
                className="border-[hsl(0_0%_18%)] hover:bg-[#0d1117]"
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit Twin
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Twin Profile Card */}
        <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-primary/10 text-primary text-xl font-bold">
                  SC
                </AvatarFallback>
              </Avatar>
              
              <div>
                <h2 className="text-2xl font-bold text-white mb-1">{twinData.name}</h2>
                <p className="text-muted-foreground mb-3">{twinData.tagline}</p>
                
                <div className="flex items-center gap-4 text-sm">
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {twinData.personality}
                  </Badge>
                  <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                    {twinData.tone}
                  </Badge>
                  <span className="text-muted-foreground">
                    Created {new Date(twinData.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="mb-2">
                <span className="text-sm text-muted-foreground">Profile Completion</span>
                <div className="flex items-center gap-2 mt-1">
                  <Progress value={twinData.profileCompletion} className="w-32 h-2" />
                  <span className="text-sm font-medium text-white">{twinData.profileCompletion}%</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Last trained {new Date(twinData.lastTrained).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-4"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="p-2 rounded-lg bg-primary/10">
                  <stat.icon className="h-4 w-4 text-primary" />
                </div>
                {stat.change && (
                  <span className={cn(
                    "text-xs font-medium",
                    stat.change.startsWith("+") ? "text-green-500" : "text-red-500"
                  )}>
                    {stat.change}
                  </span>
                )}
              </div>
              <p className="text-sm text-muted-foreground">{stat.label}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)]">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="training">Training Progress</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="insights" onClick={() => router.push("/explore/insights")}>
              Insights
            </TabsTrigger>
            <TabsTrigger value="conversations">Conversations</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Activity */}
              <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Recent Conversations
                </h3>
                <div className="space-y-3">
                  {recentConversations.map((conv) => (
                    <div
                      key={conv.id}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-[hsl(0_0%_10%)] cursor-pointer transition-colors"
                      onClick={() => router.push(`/explore/conversation/${conv.id}`)}
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs">
                            {conv.userName.split(" ").map(n => n[0]).join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium text-white">{conv.userName}</p>
                          <p className="text-xs text-muted-foreground">{conv.lastMessage}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{conv.timestamp}</p>
                        <p className="text-xs text-muted-foreground">{conv.messages} messages</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full mt-3"
                  onClick={() => setActiveTab("conversations")}
                >
                  View all conversations
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>

              {/* Quick Actions */}
              <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Quick Actions
                </h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                    onClick={() => router.push("/explore/chapters")}
                  >
                    <BookOpen className="h-4 w-4 mr-2" />
                    View All Chapters
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                    onClick={() => router.push("/explore/train")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add New Chapter
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                    onClick={() => router.push("/explore/preview")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Twin
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                    onClick={() => setActiveTab("analytics")}
                  >
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Analytics
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                    onClick={() => setActiveTab("settings")}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Twin Settings
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Training Progress Tab */}
          <TabsContent value="training" className="space-y-6">
            <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Your Story Chapters
                </h3>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                    onClick={() => router.push("/explore/chapters")}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View All
                  </Button>
                  <Button
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-black"
                    onClick={() => router.push("/explore/train")}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Chapter
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className={cn(
                      "flex items-center justify-between p-4 rounded-lg border transition-colors",
                      chapter.status === "completed" && "bg-green-500/5 border-green-500/20 hover:bg-green-500/10",
                      chapter.status === "in-progress" && "bg-primary/5 border-primary/20 hover:bg-primary/10",
                      chapter.status === "locked" && "bg-[hsl(0_0%_6%)] border-[hsl(0_0%_18%)] opacity-60"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-2 rounded-lg",
                        chapter.status === "completed" && "bg-green-500/10",
                        chapter.status === "in-progress" && "bg-primary/10",
                        chapter.status === "locked" && "bg-[hsl(0_0%_18%)]"
                      )}>
                        {chapter.status === "completed" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : chapter.status === "in-progress" ? (
                          <PenTool className="h-4 w-4 text-primary" />
                        ) : (
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-medium text-white">{chapter.title}</h4>
                        {chapter.wordCount && (
                          <p className="text-sm text-muted-foreground">
                            {chapter.wordCount} words
                            {chapter.lastUpdated && ` • Updated ${chapter.lastUpdated}`}
                          </p>
                        )}
                      </div>
                    </div>
                    {chapter.status !== "locked" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/explore/train?chapter=${chapter.id}`)}
                      >
                        {chapter.status === "completed" ? "Edit" : "Continue"}
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="text-sm text-white mb-2">
                  <Sparkles className="h-4 w-4 inline mr-1" />
                  Pro tip: The more detailed your chapters, the better your AI Twin can represent you!
                </p>
                <p className="text-xs text-muted-foreground">
                  Complete all chapters to unlock advanced personalization features.
                </p>
              </div>
            </div>
          </TabsContent>

          {/* Instructions Tab */}
          <TabsContent value="instructions" className="space-y-6">
            <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Lightbulb className="h-5 w-5" />
                    Twin Instructions
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage guidelines that control how your AI Twin responds to visitors
                  </p>
                </div>
                <Button
                  size="sm"
                  className="bg-primary hover:bg-primary/90 text-black"
                  onClick={() => router.push("/explore/train")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Instruction
                </Button>
              </div>

              {instructions.length === 0 ? (
                <div className="text-center py-12">
                  <Lightbulb className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h4 className="text-lg font-medium text-white mb-2">No Instructions Yet</h4>
                  <p className="text-muted-foreground mb-6">
                    Add instructions to guide how your AI Twin responds to visitors
                  </p>
                  <Button
                    onClick={() => router.push("/explore/train")}
                    className="bg-primary hover:bg-primary/90 text-black"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add First Instruction
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {instructions.map((instruction, index) => (
                    <div
                      key={index}
                      className="p-4 bg-[hsl(0_0%_6%)] border border-[hsl(0_0%_18%)] rounded-lg group hover:border-[hsl(0_0%_24%)] transition-colors"
                    >
                      {editingInstruction === index ? (
                        <div className="space-y-3">
                          <textarea
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            rows={3}
                            className="w-full px-3 py-2 bg-[#0d1117] border border-[hsl(0_0%_18%)] rounded-md text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
                          />
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => {
                                if (editValue.trim()) {
                                  const newInstructions = [...instructions]
                                  newInstructions[index] = editValue.trim()
                                  setInstructions(newInstructions)
                                  setEditingInstruction(null)
                                  setEditValue("")
                                }
                              }}
                              className="bg-primary hover:bg-primary/90 text-black"
                            >
                              <Check className="h-3 w-3 mr-1" />
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setEditingInstruction(null)
                                setEditValue("")
                              }}
                              className="border-[hsl(0_0%_18%)]"
                            >
                              <X className="h-3 w-3 mr-1" />
                              Cancel
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-start gap-3">
                              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center mt-0.5 shrink-0">
                                <span className="text-xs font-medium text-primary">{index + 1}</span>
                              </div>
                              <p className="text-sm text-white leading-relaxed">{instruction}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                setEditingInstruction(index)
                                setEditValue(instruction)
                              }}
                              className="h-8 w-8 p-0 hover:bg-[hsl(0_0%_18%)]"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => {
                                const newInstructions = instructions.filter((_, i) => i !== index)
                                setInstructions(newInstructions)
                              }}
                              className="h-8 w-8 p-0 hover:bg-red-500/20 text-red-400"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  
                  <div className="border-t border-[hsl(0_0%_18%)] pt-4 mt-6">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">
                        {instructions.length} instruction{instructions.length !== 1 ? 's' : ''} active
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push("/explore/train")}
                        className="border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                      >
                        <Plus className="h-3 w-3 mr-2" />
                        Add More
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Conversations Tab */}
          <TabsContent value="conversations">
            <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">All Conversations</h3>
              <p className="text-muted-foreground">Conversation history coming soon...</p>
            </div>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics">
            <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-4">Analytics Dashboard</h3>
              <p className="text-muted-foreground">Detailed analytics coming soon...</p>
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings">
            <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6">
              <h3 className="text-lg font-semibold text-white mb-6">Twin Settings</h3>
              
              <div className="space-y-6">
                {/* Danger Zone */}
                <div className="border border-red-500/20 rounded-lg p-4">
                  <h4 className="text-sm font-medium text-red-400 mb-2">Danger Zone</h4>
                  <p className="text-sm text-muted-foreground mb-4">
                    Once you delete your AI Twin, there is no going back. Please be certain.
                  </p>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => setShowDeleteModal(true)}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete AI Twin
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold text-white mb-2">Delete AI Twin?</h3>
            <p className="text-sm text-muted-foreground mb-6">
              This action cannot be undone. All your training data and conversations will be permanently deleted.
            </p>
            <div className="flex gap-3">
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => {
                  // Handle deletion
                  router.push("/explore")
                }}
              >
                Delete
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}