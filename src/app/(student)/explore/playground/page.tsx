"use client"

import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { 
  ArrowLeft,
  Brain,
  BookOpen,
  Mic,
  FileText,
  Eye,
  Settings,
  ChevronRight
} from "lucide-react"

export default function PlaygroundPage() {
  const router = useRouter()

  const trainingOptions = [
    {
      id: "stories",
      title: "Share Your Stories",
      description: "Tell your twin about your experiences, achievements, and career journey",
      icon: BookOpen,
      color: "bg-blue-500/10 text-blue-400 border-blue-500/20",
      action: () => router.push("/explore/train"),
      recommended: true
    },
    {
      id: "interview",
      title: "AI-Guided Interview", 
      description: "Let me ask you questions to learn about you naturally",
      icon: Mic,
      color: "bg-green-500/10 text-green-400 border-green-500/20",
      action: () => router.push("/explore/interview")
    },
    {
      id: "documents",
      title: "Upload Documents",
      description: "Share your resume, portfolio, or other documents",
      icon: FileText,
      color: "bg-purple-500/10 text-purple-400 border-purple-500/20",
      action: () => {},
      comingSoon: true
    }
  ]

  return (
    <div className="min-h-screen bg-[#0d1117]">
      {/* Header */}
      <div className="border-b border-[hsl(0_0%_18%)] bg-[hsl(0_0%_4%)]">
        <div className="max-w-6xl mx-auto px-6 py-4">
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
                  <h1 className="text-xl font-semibold text-white">AI Twin Playground</h1>
                  <p className="text-sm text-muted-foreground">Train your digital representative</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/explore/preview")}
                className="border-[hsl(0_0%_18%)] hover:bg-[#0d1117]"
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview Twin
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => router.push("/explore/my-twin")}
                className="border-[hsl(0_0%_18%)] hover:bg-[#0d1117]"
              >
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Welcome to the Playground</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explore some of the ways you can train your twin. The more you share, the better your AI Twin will represent you.
          </p>
        </div>

        {/* Training Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {trainingOptions.map((option) => (
            <div
              key={option.id}
              className={`relative bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-xl p-6 transition-all hover:scale-105 cursor-pointer hover:border-[hsl(0_0%_24%)] ${
                option.comingSoon ? 'opacity-60 cursor-not-allowed' : ''
              }`}
              onClick={!option.comingSoon ? option.action : undefined}
            >
              {option.recommended && (
                <div className="absolute -top-2 right-4">
                  <span className="bg-primary text-black text-xs px-2 py-1 rounded-full font-medium">
                    Recommended
                  </span>
                </div>
              )}
              
              <div className={`inline-flex p-3 rounded-lg mb-4 ${option.color}`}>
                <option.icon className="h-6 w-6" />
              </div>
              
              <h3 className="text-lg font-semibold text-white mb-3">{option.title}</h3>
              <p className="text-muted-foreground mb-6 text-sm">{option.description}</p>
              
              {!option.comingSoon ? (
                <Button className="w-full bg-primary hover:bg-primary/90 text-black">
                  Get Started
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              ) : (
                <Button variant="outline" disabled className="w-full border-[hsl(0_0%_18%)]">
                  Coming Soon
                </Button>
              )}
            </div>
          ))}
        </div>

        {/* Help Text */}
        <div className="text-center mt-12">
          <p className="text-sm text-muted-foreground">
            Need help getting started? Try the "Share Your Stories" method - it's perfect for beginners.
          </p>
        </div>
      </div>
    </div>
  )
}