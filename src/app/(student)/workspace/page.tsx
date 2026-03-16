"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  LayoutDashboard,
  CheckCircle2,
  Clock,
  AlertCircle,
  Calendar,
  TrendingUp,
  GraduationCap,
  FileText,
  Heart,
  Target,
  Plus,
  ExternalLink,
  MapPin,
  DollarSign,
  Star,
  Upload,
  Eye,
  Download,
  MoreHorizontal,
  ChevronRight,
  BookOpen,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function WorkspacePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    } else {
      setLoading(false)
    }
  }, [session, status, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading workspace...</div>
      </div>
    )
  }

  // Mock data for universities and documents
  const appliedUniversities = [
    {
      id: '1',
      name: 'Stanford University',
      program: 'MS Computer Science',
      location: 'California, USA',
      deadline: new Date('2024-12-15'),
      status: 'submitted',
      ranking: 3
    },
    {
      id: '2',
      name: 'MIT',
      program: 'MS Artificial Intelligence',
      location: 'Massachusetts, USA',
      deadline: new Date('2024-12-01'),
      status: 'submitted',
      ranking: 1
    },
    {
      id: '3',
      name: 'UC Berkeley',
      program: 'MS Data Science',
      location: 'California, USA',
      deadline: new Date('2025-01-15'),
      status: 'in_progress',
      ranking: 4
    }
  ]

  const shortlistedUniversities = [
    {
      id: '4',
      name: 'Carnegie Mellon University',
      program: 'MS Machine Learning',
      location: 'Pennsylvania, USA',
      deadline: new Date('2024-12-15'),
      ranking: 5
    },
    {
      id: '5',
      name: 'Georgia Tech',
      program: 'MS Computer Science',
      location: 'Georgia, USA',
      deadline: new Date('2025-01-10'),
      ranking: 8
    }
  ]

  const documents = [
    {
      id: '1',
      name: 'Statement of Purpose - Stanford',
      type: 'sop',
      status: 'completed',
      lastModified: new Date('2024-11-20')
    },
    {
      id: '2',
      name: 'Resume_MS_Applications',
      type: 'resume',
      status: 'completed',
      lastModified: new Date('2024-11-18')
    },
    {
      id: '3',
      name: 'Transcript_Official',
      type: 'transcript',
      status: 'completed',
      lastModified: new Date('2024-11-10')
    },
    {
      id: '4',
      name: 'LOR_Prof_Smith',
      type: 'lor',
      status: 'pending',
      lastModified: new Date('2024-11-22')
    }
  ]

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <div className="border-b border-gray-800 backdrop-blur-sm sticky top-0 z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Chat
              </Button>
              <div className="flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-orange-500" />
                <h1 className="text-xl font-semibold">My Workspace</h1>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gradient-to-br from-blue-500/10 to-transparent rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/20 rounded-xl flex items-center justify-center">
                <Send className="h-6 w-6 text-blue-500" />
              </div>
              <span className="text-3xl font-bold text-white">{appliedUniversities.length}</span>
            </div>
            <p className="text-sm text-gray-400">Total Applications</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500/10 to-transparent rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-500/20 rounded-xl flex items-center justify-center">
                <CheckCircle2 className="h-6 w-6 text-green-500" />
              </div>
              <span className="text-3xl font-bold text-white">{appliedUniversities.filter(u => u.status === 'submitted').length}</span>
            </div>
            <p className="text-sm text-gray-400">Submitted</p>
          </div>
          
          <div className="bg-gradient-to-br from-yellow-500/10 to-transparent rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <span className="text-3xl font-bold text-white">{appliedUniversities.filter(u => u.status === 'in_progress').length}</span>
            </div>
            <p className="text-sm text-gray-400">In Progress</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500/10 to-transparent rounded-2xl p-6 border border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center">
                <Heart className="h-6 w-6 text-purple-500" />
              </div>
              <span className="text-3xl font-bold text-white">{shortlistedUniversities.length}</span>
            </div>
            <p className="text-sm text-gray-400">Shortlisted</p>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Universities */}
          <div className="lg:col-span-2 space-y-8">
            {/* Applied Universities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Applications</h3>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-orange-500 hover:text-orange-400"
                  onClick={() => router.push('/applications')}
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="space-y-4">
                {appliedUniversities.map((uni) => (
                  <div
                    key={uni.id}
                    className="bg-gray-900/50 rounded-xl p-4 hover:bg-gray-900 transition-all cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-white">{uni.name}</h4>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${
                            uni.status === 'submitted' 
                              ? 'bg-green-500/20 text-green-500' 
                              : 'bg-yellow-500/20 text-yellow-500'
                          }`}>
                            {uni.status === 'submitted' ? 'Submitted' : 'In Progress'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2">{uni.program}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {uni.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {uni.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <Button size="icon" variant="ghost" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Shortlisted Universities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Shortlisted</h3>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-purple-500 hover:text-purple-400"
                  onClick={() => router.push('/applications?filter=shortlisted')}
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {shortlistedUniversities.map((uni) => (
                  <div
                    key={uni.id}
                    className="bg-gray-900/50 rounded-xl p-4 hover:bg-gray-900 transition-all cursor-pointer border border-gray-800"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-medium text-white">{uni.name}</h4>
                      <Heart className="h-4 w-4 text-purple-500 fill-current" />
                    </div>
                    <p className="text-sm text-gray-400 mb-3">{uni.program}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        Deadline: {uni.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                      <Button size="sm" className="h-7 text-xs">
                        Apply
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Documents & Actions */}
          <div className="space-y-8">
            {/* Documents */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-white">Documents</h3>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-orange-500 hover:text-orange-400"
                  onClick={() => router.push('/documents')}
                >
                  View All
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              
              <div className="bg-gray-900/50 rounded-xl p-4 space-y-3">
                {documents.map((doc) => {
                  const getDocType = () => {
                    switch (doc.type) {
                      case 'sop': return { color: 'text-blue-500', label: 'SOP' }
                      case 'resume': return { color: 'text-green-500', label: 'Resume' }
                      case 'transcript': return { color: 'text-purple-500', label: 'Transcript' }
                      case 'lor': return { color: 'text-orange-500', label: 'LOR' }
                      default: return { color: 'text-gray-500', label: 'Doc' }
                    }
                  }
                  const docType = getDocType()
                  
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg hover:bg-gray-800 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg bg-gray-700 flex items-center justify-center text-xs font-medium ${docType.color}`}>
                          {docType.label}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">{doc.name}</p>
                          <p className="text-xs text-gray-500">
                            {doc.lastModified.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.status === 'completed' ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Clock className="h-4 w-4 text-yellow-500" />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </motion.div>

            {/* Quick Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <h3 className="text-lg font-semibold text-white mb-6">Quick Actions</h3>
              <div className="space-y-3">
                <Button 
                  className="w-full justify-start gap-3 h-12 bg-gray-900/50 hover:bg-gray-900 border-gray-800"
                  variant="outline"
                  onClick={() => router.push('/workspace/tasks')}
                >
                  <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center">
                    <Calendar className="h-4 w-4 text-orange-500" />
                  </div>
                  <span className="flex-1 text-left">View All Tasks</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button 
                  className="w-full justify-start gap-3 h-12 bg-gray-900/50 hover:bg-gray-900 border-gray-800"
                  variant="outline"
                  onClick={() => router.push('/roadmap')}
                >
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center">
                    <Target className="h-4 w-4 text-purple-500" />
                  </div>
                  <span className="flex-1 text-left">View Roadmap</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>
                
                <Button 
                  className="w-full justify-start gap-3 h-12 bg-gray-900/50 hover:bg-gray-900 border-gray-800"
                  variant="outline"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                  <span className="flex-1 text-left">Resources</span>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                </Button>
              </div>
            </motion.div>
          </div>
        </div>

      </div>
    </div>
  )
}