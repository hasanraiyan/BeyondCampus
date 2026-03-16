"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { 
  Sparkles, 
  MessageSquare,
  Brain,
  CheckCircle,
  ArrowRight,
  BookOpen,
  Plus
} from "lucide-react"
import { cn } from '@/lib/utils'

export default function TwinCreated() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  const handleStartTraining = () => {
    setIsLoading(true)
    // Navigate to training interface
    router.push("/explore/train")
  }

  const handleSkip = () => {
    // Navigate to twin dashboard or profile
    router.push("/explore/my-twin")
  }

  return (
    <div className="min-h-screen bg-[#0d1117] flex items-center justify-center p-6">
      <div className="max-w-xl w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-block mb-6">
            <div className="absolute inset-0 animate-ping">
              <div className="h-20 w-20 rounded-full bg-green-500/20"></div>
            </div>
            <div className="relative h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-green-500" />
            </div>
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-2">
            🎉 Your AI Twin is ready!
          </h1>
          <p className="text-lg text-muted-foreground">
            Time to bring it to life with your knowledge
          </p>
        </div>

        {/* What is Training Section */}
        <div className="bg-[hsl(0_0%_8%)] border border-[hsl(0_0%_18%)] rounded-xl p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Brain className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold text-white">Train Your AI Twin</h2>
          </div>
          
          <p className="text-muted-foreground mb-4 leading-relaxed">
            Your AI Twin will interview you to deeply understand your story - like a biographer learning about their subject.
          </p>

          {/* Key Points */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Answer questions at your own pace - leave and return anytime
              </p>
            </div>

            <div className="flex items-start gap-3">
              <BookOpen className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                The AI digs deep to capture your experiences and expertise
              </p>
            </div>

            <div className="flex items-start gap-3">
              <Plus className="h-4 w-4 text-primary mt-0.5" />
              <p className="text-sm text-muted-foreground">
                Add your own stories beyond what the AI asks
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            onClick={handleStartTraining}
            disabled={isLoading}
            className="flex-1 bg-primary hover:bg-primary/90 text-black font-medium h-12"
          >
            {isLoading ? (
              "Loading..."
            ) : (
              <>
                <Sparkles className="h-5 w-5 mr-2" />
                Start Training
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
          
          <Button
            onClick={handleSkip}
            variant="outline"
            className="flex-1 border-[hsl(0_0%_18%)] hover:bg-[#0d1117] hover:border-[hsl(0_0%_24%)] h-12"
          >
            Skip for Now
          </Button>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-4">
          You can always train your Twin later from your dashboard
        </p>
      </div>
    </div>
  )
}