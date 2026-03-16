"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft,
  BookOpen,
  FileText,
  Edit,
  Plus,
  Calendar,
  Clock,
  Type,
  Eye,
  Sparkles,
  CheckCircle2,
  PenTool
} from "lucide-react"
import { cn } from '@/lib/utils'

interface Chapter {
  id: string
  title: string
  status: "completed" | "in-progress" | "draft"
  wordCount: number
  content: string
  createdAt: string
  lastUpdated: string
  icon: any
}

export default function ChaptersPage() {
  const router = useRouter()
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  
  // Mock data - would come from API
  const chapters: Chapter[] = [
    {
      id: "intro",
      title: "Introduction",
      status: "completed",
      wordCount: 523,
      content: `My journey began in a small town, where dreams seemed as distant as the stars. I'm Sarah Chen, a product manager at Google, but my story is about much more than titles and companies.

Growing up, I was fascinated by how technology could connect people and solve real problems. This curiosity led me down a path I never expected - from a computer science student at Stanford to leading product teams at one of the world's most innovative companies.

"The best way to predict the future is to invent it." - This quote has guided every step of my journey.

Today, I'm passionate about helping others navigate their tech careers. Whether you're a student wondering how to break into tech, or a professional looking to transition, I'm here to share what I've learned along the way.

The path wasn't always clear, and there were moments of doubt, failure, and unexpected turns. But each challenge taught me something valuable about resilience, innovation, and the power of believing in yourself even when others don't see your vision.`,
      createdAt: "2024-01-15",
      lastUpdated: "2024-01-20",
      icon: BookOpen
    },
    {
      id: "journey",
      title: "Chapter 1: The Journey",
      status: "completed",
      wordCount: 789,
      content: `The journey to where I am today started in an unexpected place - my grandmother's kitchen. She was always tinkering with recipes, adjusting ingredients, testing new combinations. I didn't realize it then, but she was teaching me the fundamentals of iteration and user testing.

## Early Spark

My first real encounter with technology happened in middle school. Our computer lab had these old beige machines, and I was immediately drawn to them. While other kids played games, I found myself fascinated by how the programs worked. I started asking questions: "How does the computer know what to do?" "Why does this button make that happen?"

## College Years

Stanford was both a dream come true and a reality check. I was surrounded by brilliant minds, all pushing the boundaries of what was possible. My computer science courses challenged me in ways I never expected. There were nights I spent debugging code until 3 AM, questioning whether I belonged there.

## The Turning Point

Everything changed during my junior year internship at a small startup. For the first time, I saw how technology could directly impact real people's lives. We were building an app to help elderly people connect with their families. When I saw a grandmother video-calling her grandson for the first time, something clicked. This wasn't just about code - it was about human connection.

## Lessons Learned

The most important lesson from this chapter? Embrace the uncertainty. Every pivot, every failure, every small success was building toward something bigger. The journey isn't linear, and that's exactly what makes it beautiful.`,
      createdAt: "2024-01-16",
      lastUpdated: "2024-01-21",
      icon: FileText
    },
    {
      id: "achievements",
      title: "Chapter 2: Achievements",
      status: "in-progress",
      wordCount: 245,
      content: `My proudest achievement isn't the products I've launched or the awards I've received - it's the team I helped build and the culture we created together.

## Building Something Meaningful

When I joined Google as a PM, I inherited a struggling project. The team was demoralized, the product had poor user adoption, and stakeholders had lost confidence. Instead of scrapping it, we decided to rebuild - not just the product, but the team's approach to problem-solving.

## The Transformation

We implemented user research sessions, started doing regular retrospectives, and created space for everyone's voice to be heard. Slowly, the team began to gel. We started shipping features that users actually wanted...

[This chapter is still being written]`,
      createdAt: "2024-01-17",
      lastUpdated: "2024-01-22",
      icon: Sparkles
    }
  ]

  const selectedChapterData = chapters.find(c => c.id === selectedChapter)
  const completedChapters = chapters.filter(c => c.status === "completed").length
  const totalWordCount = chapters.reduce((total, chapter) => total + chapter.wordCount, 0)

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
                onClick={() => router.push("/explore/my-twin")}
                className="hover:bg-secondary/70"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-white">Your Story Chapters</h1>
                  <p className="text-sm text-muted-foreground">
                    {completedChapters} of {chapters.length} chapters completed • {totalWordCount.toLocaleString()} words written
                  </p>
                </div>
              </div>
            </div>

            <Button
              onClick={() => router.push("/explore/train")}
              className="bg-primary hover:bg-primary/90 text-black"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Chapter
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Chapters List */}
          <div className="lg:col-span-1">
            <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Chapters</h2>
              <div className="space-y-3">
                {chapters.map((chapter) => {
                  const Icon = chapter.icon
                  return (
                    <button
                      key={chapter.id}
                      onClick={() => setSelectedChapter(chapter.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-lg border transition-all",
                        selectedChapter === chapter.id
                          ? "bg-primary/10 border-primary/50"
                          : "bg-[hsl(0_0%_6%)] border-[hsl(0_0%_18%)] hover:border-[hsl(0_0%_24%)]"
                      )}
                    >
                      <div className="flex items-start gap-3">
                        <div className={cn(
                          "mt-0.5",
                          chapter.status === "completed" && "text-green-500",
                          chapter.status === "in-progress" && "text-yellow-500",
                          chapter.status === "draft" && "text-muted-foreground"
                        )}>
                          {chapter.status === "completed" ? (
                            <CheckCircle2 className="h-4 w-4" />
                          ) : chapter.status === "in-progress" ? (
                            <PenTool className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-white text-sm mb-1 truncate">
                            {chapter.title}
                          </h3>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Badge 
                              variant="secondary" 
                              className={cn(
                                "text-xs px-2 py-0.5",
                                chapter.status === "completed" && "bg-green-500/10 text-green-400",
                                chapter.status === "in-progress" && "bg-yellow-500/10 text-yellow-400",
                                chapter.status === "draft" && "bg-gray-500/10 text-gray-400"
                              )}
                            >
                              {chapter.status}
                            </Badge>
                            <span>{chapter.wordCount} words</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  )
                })}
                
                {/* Add New Chapter */}
                <button
                  onClick={() => router.push("/explore/train")}
                  className="w-full p-4 border border-dashed border-[hsl(0_0%_18%)] hover:border-primary/50 rounded-lg text-sm text-muted-foreground hover:text-white transition-all flex items-center justify-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Add New Chapter
                </button>
              </div>
            </div>
          </div>

          {/* Chapter Content */}
          <div className="lg:col-span-2">
            {selectedChapterData ? (
              <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-xl overflow-hidden">
                {/* Chapter Header */}
                <div className="p-6 border-b border-[hsl(0_0%_18%)]">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h1 className="text-2xl font-bold text-white mb-2">
                        {selectedChapterData.title}
                      </h1>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {new Date(selectedChapterData.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>Updated {new Date(selectedChapterData.lastUpdated).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Type className="h-4 w-4" />
                          <span>{selectedChapterData.wordCount} words</span>
                        </div>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)]"
                      onClick={() => router.push(`/explore/train?chapter=${selectedChapterData.id}`)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                  </div>
                </div>

                {/* Chapter Content */}
                <ScrollArea className="h-[600px]">
                  <div className="p-6">
                    <div className="prose prose-invert max-w-none">
                      <div className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {selectedChapterData.content.split('\n\n').map((paragraph, index) => {
                          // Handle headers
                          if (paragraph.startsWith('## ')) {
                            return (
                              <h2 key={index} className="text-xl font-semibold text-white mt-8 mb-4">
                                {paragraph.replace('## ', '')}
                              </h2>
                            )
                          }
                          
                          // Handle blockquotes
                          if (paragraph.startsWith('"') && paragraph.endsWith('"')) {
                            return (
                              <blockquote key={index} className="border-l-4 border-primary pl-4 my-6 italic text-gray-400">
                                {paragraph}
                              </blockquote>
                            )
                          }
                          
                          // Handle regular paragraphs
                          if (paragraph.trim()) {
                            // Check for drop cap (first paragraph)
                            if (index === 0 && paragraph.length > 50) {
                              return (
                                <p key={index} className="text-lg leading-relaxed text-gray-300 mb-6">
                                  <span className="text-3xl font-serif float-left mr-2 mt-1 text-primary">
                                    {paragraph.charAt(0)}
                                  </span>
                                  {paragraph.slice(1)}
                                </p>
                              )
                            }
                            
                            return (
                              <p key={index} className="text-gray-300 leading-relaxed mb-6">
                                {paragraph}
                              </p>
                            )
                          }
                          
                          return null
                        })}
                      </div>
                    </div>
                  </div>
                </ScrollArea>
              </div>
            ) : (
              <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-xl h-[700px] flex items-center justify-center">
                <div className="text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">Select a Chapter</h3>
                  <p className="text-muted-foreground">
                    Choose a chapter from the list to view its content
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}