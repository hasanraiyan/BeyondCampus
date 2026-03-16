"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { 
  ArrowLeft,
  Sparkles,
  Upload,
  Eye,
  Plus,
  Trash2,
  Mic
} from "lucide-react"
import { cn } from '@/lib/utils'

export default function CreateAITwin() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    twinName: "",
    tagline: "",
    personality: "friendly",
    customPersonality: "",
    tone: "conversational",
    customTone: "",
    links: [] as { title: string; url: string }[],
    voiceNote: null as string | File | null
  })
  const [newLinkTitle, setNewLinkTitle] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const handleStartTraining = async () => {
    if (!formData.twinName || !formData.tagline) {
      alert('Please fill in twin name and tagline')
      return
    }
    
    setIsLoading(true)
    
    try {
      // Generate a mock user ID for demo (in production, get from auth)
      const userId = `user_${Date.now()}`
      const userName = `User_${Date.now().toString().slice(-4)}`
      
      console.log("Creating twin:", formData)
      
      const response = await fetch('/api/twins/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          twinName: formData.twinName,
          tagline: formData.tagline,
          personality: formData.personality === 'other' ? formData.customPersonality : formData.personality,
          tone: formData.tone === 'other' ? formData.customTone : formData.tone,
          links: formData.links,
          userId,
          userName
        })
      })
      
      const result = await response.json()
      
      if (result.success) {
        console.log("Twin created successfully:", result.twin)
        // Redirect to training with twin data
        router.push(result.trainingUrl)
      } else {
        console.error('Failed to create twin:', result.error)
        alert('Failed to create twin: ' + result.error)
      }
    } catch (error) {
      console.error('Error creating twin:', error)
      alert('Error creating twin')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePublish = () => {
    console.log("Publishing Twin:", formData)
    // TODO: Create and publish twin immediately
    router.push("/explore/my-twin")
  }

  const getInitials = () => {
    if (!formData.twinName) return "AI"
    return formData.twinName.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const addLink = () => {
    if (newLinkTitle.trim() && newLinkUrl.trim()) {
      setFormData({
        ...formData,
        links: [...formData.links, { title: newLinkTitle.trim(), url: newLinkUrl.trim() }]
      })
      setNewLinkTitle("")
      setNewLinkUrl("")
    }
  }

  const removeLink = (index: number) => {
    setFormData({
      ...formData,
      links: formData.links.filter((_, i) => i !== index)
    })
  }

  const startRecording = () => {
    setIsRecording(true)
    // TODO: Implement voice recording
    setTimeout(() => {
      setIsRecording(false)
      setFormData({...formData, voiceNote: "Recording saved"})
    }, 3000)
  }

  const removeVoiceNote = () => {
    setFormData({...formData, voiceNote: null})
  }

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <button
        onClick={() => router.push("/explore")}
        className="absolute top-4 left-4 flex items-center gap-2 text-muted-foreground hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="h-4 w-4" />
        <span className="text-sm">Back</span>
      </button>

      <div className="max-w-2xl mx-auto p-8 pt-16">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Create Your AI Twin</h1>
          <p className="text-muted-foreground text-sm">
            Set up your digital representative in just a few steps
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-white mb-3 text-center">
              Profile Picture
            </label>
            <div className="flex flex-col items-center gap-4">
              <Avatar className="h-20 w-20">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="text-center">
                <Button variant="outline" size="sm" className="mb-2">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Photo
                </Button>
                <p className="text-xs text-muted-foreground">
                  Or we'll use your initials
                </p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Twin Name
            </label>
            <Input
              type="text"
              placeholder="e.g. Sarah Chen, Dr. Park, Alex the Mentor"
              value={formData.twinName}
              onChange={(e) => setFormData({...formData, twinName: e.target.value})}
              className="w-full h-10 bg-[#0d1117] border-[hsl(0_0%_18%)] text-white placeholder:text-muted-foreground focus:border-primary/50"
            />
            <p className="text-xs text-muted-foreground mt-1">
              This is how your AI Twin will introduce itself
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Tagline / Catchy Description
            </label>
            <textarea
              placeholder="e.g. 'Turning coffee into code since 2019' or 'Your friendly neighborhood data wizard'"
              value={formData.tagline}
              onChange={(e) => setFormData({...formData, tagline: e.target.value})}
              rows={2}
              className="w-full px-3 py-2 bg-[#0d1117] border border-[hsl(0_0%_18%)] rounded-md text-white placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none resize-none"
            />
            <p className="text-xs text-muted-foreground mt-1">
              A fun, memorable line that appears when someone starts chatting
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Twin Personality
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "professional", label: "Professional", desc: "Expert and knowledgeable" },
                { value: "friendly", label: "Friendly", desc: "Warm and approachable" },
                { value: "witty", label: "Witty", desc: "Clever with a sense of humor" },
                { value: "other", label: "Custom", desc: "Define your own personality" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({...formData, personality: option.value, customPersonality: ""})}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-center hover:scale-105",
                    formData.personality === option.value
                      ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                      : "bg-[#0d1117] border-[hsl(0_0%_18%)] hover:border-[hsl(0_0%_24%)] hover:bg-[hsl(0_0%_6%)]"
                  )}
                >
                  <div className="font-medium text-white text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
            {formData.personality === "other" && (
              <Input
                type="text"
                placeholder="e.g. Empathetic, Analytical, Creative..."
                value={formData.customPersonality}
                onChange={(e) => setFormData({...formData, customPersonality: e.target.value})}
                className="mt-4 w-full h-10 bg-[#0d1117] border-[hsl(0_0%_18%)] text-white placeholder:text-muted-foreground focus:border-primary/50"
              />
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Conversation Tone
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "formal", label: "Formal", desc: "Professional and structured" },
                { value: "conversational", label: "Conversational", desc: "Natural and flowing" },
                { value: "casual", label: "Casual", desc: "Relaxed and informal" },
                { value: "other", label: "Custom", desc: "Define your own tone" }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData({...formData, tone: option.value, customTone: ""})}
                  className={cn(
                    "p-4 rounded-lg border transition-all text-center hover:scale-105",
                    formData.tone === option.value
                      ? "bg-primary/10 border-primary/50 ring-1 ring-primary/30"
                      : "bg-[#0d1117] border-[hsl(0_0%_18%)] hover:border-[hsl(0_0%_24%)] hover:bg-[hsl(0_0%_6%)]"
                  )}
                >
                  <div className="font-medium text-white text-sm">{option.label}</div>
                  <div className="text-xs text-muted-foreground mt-1">{option.desc}</div>
                </button>
              ))}
            </div>
            {formData.tone === "other" && (
              <Input
                type="text"
                placeholder="e.g. Motivational, Academic, Quirky..."
                value={formData.customTone}
                onChange={(e) => setFormData({...formData, customTone: e.target.value})}
                className="mt-4 w-full h-10 bg-[#0d1117] border-[hsl(0_0%_18%)] text-white placeholder:text-muted-foreground focus:border-primary/50"
              />
            )}
          </div>

          {/* Add Links Section */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Add Links
            </label>
            <div className="bg-[hsl(0_0%_6%)] border border-[hsl(0_0%_18%)] rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-4">
                Add important links for your twin to reference (portfolio, social media, etc.)
              </p>
              
              {/* Existing Links */}
              {formData.links.length > 0 && (
                <div className="space-y-2 mb-4">
                  {formData.links.map((link, index) => (
                    <div key={index} className="flex items-center justify-between bg-[#0d1117] border border-[hsl(0_0%_24%)] rounded-lg p-3">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-white text-sm truncate">{link.title}</div>
                        <div className="text-xs text-muted-foreground truncate">{link.url}</div>
                      </div>
                      <button
                        onClick={() => removeLink(index)}
                        className="ml-2 text-muted-foreground hover:text-red-400 transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add New Link */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Link title (e.g. Portfolio)"
                    value={newLinkTitle}
                    onChange={(e) => setNewLinkTitle(e.target.value)}
                    className="bg-[#0d1117] border-[hsl(0_0%_18%)] text-white placeholder:text-muted-foreground focus:border-primary/50"
                  />
                  <Input
                    type="url"
                    placeholder="https://..."
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    className="bg-[#0d1117] border-[hsl(0_0%_18%)] text-white placeholder:text-muted-foreground focus:border-primary/50"
                  />
                </div>
                <Button
                  onClick={addLink}
                  disabled={!newLinkTitle.trim() || !newLinkUrl.trim()}
                  variant="outline"
                  size="sm"
                  className="w-full border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)] disabled:opacity-50"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Link
                </Button>
              </div>
            </div>
          </div>

          {/* Add Voice Section */}
          <div>
            <label className="block text-sm font-medium text-white mb-3">
              Add Voice
            </label>
            <div className="bg-[hsl(0_0%_6%)] border border-[hsl(0_0%_18%)] rounded-lg p-4">
              <p className="text-xs text-muted-foreground mb-4">
                Record a voice note to help your AI twin understand your speaking style and tone
              </p>
              
              {formData.voiceNote ? (
                <div className="bg-[#0d1117] border border-[hsl(0_0%_24%)] rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
                        <Mic className="h-5 w-5 text-green-400" />
                      </div>
                      <div>
                        <div className="font-medium text-white text-sm">Voice Note Recorded</div>
                        <div className="text-xs text-muted-foreground">Ready to train your twin's voice</div>
                      </div>
                    </div>
                    <button
                      onClick={removeVoiceNote}
                      className="text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <Button
                  onClick={startRecording}
                  disabled={isRecording}
                  variant="outline"
                  className={cn(
                    "w-full h-12 border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_10%)] transition-all",
                    isRecording && "bg-red-500/10 border-red-500/30 text-red-400"
                  )}
                >
                  <Mic className={cn("h-4 w-4 mr-2", isRecording && "animate-pulse")} />
                  {isRecording ? "Recording... (3s)" : "Record Voice Note"}
                </Button>
              )}
            </div>
          </div>

        </div>

        <div className="mt-8 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Publish Button */}
            <Button
              onClick={handlePublish}
              disabled={!formData.twinName || !formData.tagline}
              variant="outline"
              className="flex-1 h-12 border-[hsl(0_0%_18%)] hover:bg-[hsl(0_0%_8%)] hover:border-primary/30"
            >
              <Eye className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="text-sm font-medium">Publish</div>
                <div className="text-xs text-muted-foreground">Go live immediately</div>
              </div>
            </Button>

            {/* Start Training Button */}
            <Button
              onClick={handleStartTraining}
              disabled={!formData.twinName || !formData.tagline}
              className="flex-1 h-12 bg-primary hover:bg-primary/90 text-black font-medium"
            >
              <Sparkles className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="text-sm font-medium">Start Training</div>
                <div className="text-xs opacity-70">Keep private</div>
              </div>
            </Button>
          </div>
          
          <div className="text-center space-y-2">
            <p className="text-xs text-muted-foreground">
              <strong>Publish:</strong> Your twin goes live at beyondcampus.com/{formData.twinName.toLowerCase().replace(/\s+/g, '-') || 'your-name'}
            </p>
            <p className="text-xs text-muted-foreground">
              <strong>Start Training:</strong> Train your twin privately before making it public
            </p>
          </div>
        </div>
      </div>

    </div>
  )
}