"use client"

import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  GraduationCap,
  Plus,
  Search,
  Filter,
  Calendar,
  MapPin,
  DollarSign,
  Star,
  ExternalLink,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown,
  MoreVertical,
  Heart,
  Send
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface University {
  id: string
  name: string
  program: string
  location: string
  country: string
  deadline: Date
  status: 'not_started' | 'in_progress' | 'submitted' | 'accepted' | 'rejected'
  ranking: number
  tuitionFee: string
  duration: string
  intake: string
  requirementsStatus: {
    sop: boolean
    lor: boolean
    transcript: boolean
    testScores: boolean
    resume: boolean
  }
  notes?: string
  shortlisted: boolean
}

const statusColors = {
  not_started: { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'Not Started' },
  in_progress: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'In Progress' },
  submitted: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Submitted' },
  accepted: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Accepted' },
  rejected: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Rejected' }
}

function ApplicationsContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showOnlyShortlisted, setShowOnlyShortlisted] = useState(false)

  // Mock universities data
  const [universities, setUniversities] = useState<University[]>([
    {
      id: '1',
      name: 'Stanford University',
      program: 'MS Computer Science',
      location: 'Stanford, California',
      country: 'USA',
      deadline: new Date('2024-12-15'),
      status: 'submitted',
      ranking: 3,
      tuitionFee: '$55,473/year',
      duration: '2 years',
      intake: 'Fall 2025',
      requirementsStatus: {
        sop: true,
        lor: true,
        transcript: true,
        testScores: true,
        resume: true
      },
      shortlisted: false
    },
    {
      id: '2',
      name: 'MIT',
      program: 'MS Artificial Intelligence',
      location: 'Cambridge, Massachusetts',
      country: 'USA',
      deadline: new Date('2024-12-01'),
      status: 'submitted',
      ranking: 1,
      tuitionFee: '$59,750/year',
      duration: '2 years',
      intake: 'Fall 2025',
      requirementsStatus: {
        sop: true,
        lor: true,
        transcript: true,
        testScores: true,
        resume: true
      },
      shortlisted: false
    },
    {
      id: '3',
      name: 'UC Berkeley',
      program: 'MS Data Science',
      location: 'Berkeley, California',
      country: 'USA',
      deadline: new Date('2025-01-15'),
      status: 'in_progress',
      ranking: 4,
      tuitionFee: '$29,000/year',
      duration: '1.5 years',
      intake: 'Fall 2025',
      requirementsStatus: {
        sop: true,
        lor: true,
        transcript: true,
        testScores: false,
        resume: true
      },
      shortlisted: false
    },
    {
      id: '4',
      name: 'Carnegie Mellon University',
      program: 'MS Machine Learning',
      location: 'Pittsburgh, Pennsylvania',
      country: 'USA',
      deadline: new Date('2024-12-15'),
      status: 'not_started',
      ranking: 5,
      tuitionFee: '$52,000/year',
      duration: '1.5 years',
      intake: 'Fall 2025',
      requirementsStatus: {
        sop: false,
        lor: false,
        transcript: true,
        testScores: false,
        resume: false
      },
      shortlisted: true
    },
    {
      id: '5',
      name: 'Georgia Tech',
      program: 'MS Computer Science',
      location: 'Atlanta, Georgia',
      country: 'USA',
      deadline: new Date('2025-01-10'),
      status: 'not_started',
      ranking: 8,
      tuitionFee: '$16,000/year',
      duration: '2 years',
      intake: 'Fall 2025',
      requirementsStatus: {
        sop: false,
        lor: false,
        transcript: false,
        testScores: false,
        resume: false
      },
      shortlisted: true
    }
  ])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    } else {
      setLoading(false)
      // Check for filter parameter
      const filter = searchParams.get('filter')
      if (filter === 'shortlisted') {
        setShowOnlyShortlisted(true)
      }
    }
  }, [session, status, router, searchParams])

  const filteredUniversities = universities.filter(uni => {
    const matchesSearch = uni.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         uni.program.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         uni.location.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = filterStatus === 'all' || uni.status === filterStatus
    const matchesShortlist = !showOnlyShortlisted || uni.shortlisted
    return matchesSearch && matchesStatus && matchesShortlist
  })

  const getRequirementsCount = (requirements: any) => {
    return Object.values(requirements).filter(Boolean).length
  }

  const toggleShortlist = (id: string) => {
    setUniversities(universities.map(uni => 
      uni.id === id ? { ...uni, shortlisted: !uni.shortlisted } : uni
    ))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading applications...</div>
      </div>
    )
  }

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
                onClick={() => router.push('/workspace')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Workspace
              </Button>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-orange-500" />
                <h1 className="text-xl font-semibold">University Applications</h1>
              </div>
            </div>
            <Button className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add University
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filters */}
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search universities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-orange-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white focus:border-orange-500 focus:outline-none"
            >
              <option value="all">All Status</option>
              <option value="not_started">Not Started</option>
              <option value="in_progress">In Progress</option>
              <option value="submitted">Submitted</option>
              <option value="accepted">Accepted</option>
              <option value="rejected">Rejected</option>
            </select>
            <Button
              variant={showOnlyShortlisted ? "default" : "outline"}
              onClick={() => setShowOnlyShortlisted(!showOnlyShortlisted)}
              className={showOnlyShortlisted ? "bg-orange-500 hover:bg-orange-600" : "border-gray-800"}
            >
              <Heart className={`h-4 w-4 ${showOnlyShortlisted ? 'fill-current' : ''}`} />
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Total Applications</span>
              <Send className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold">{universities.length}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Submitted</span>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold">{universities.filter(u => u.status === 'submitted').length}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">In Progress</span>
              <Clock className="h-4 w-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold">{universities.filter(u => u.status === 'in_progress').length}</div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Upcoming Deadlines</span>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold">
              {universities.filter(u => u.deadline > new Date() && u.deadline < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)).length}
            </div>
          </div>
        </div>

        {/* Universities List */}
        <div className="space-y-4">
          {filteredUniversities.map((uni) => {
            const statusColor = statusColors[uni.status]
            const requirementsComplete = getRequirementsCount(uni.requirementsStatus)
            
            return (
              <motion.div
                key={uni.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 rounded-xl p-6 border border-gray-800 hover:bg-gray-900 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{uni.name}</h3>
                        <p className="text-gray-300 mb-2">{uni.program}</p>
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {uni.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="h-3 w-3 text-orange-500 fill-current" />
                            #{uni.ranking}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {uni.tuitionFee}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleShortlist(uni.id)}
                          className={uni.shortlisted ? 'text-red-500' : 'text-gray-400'}
                        >
                          <Heart className={`h-5 w-5 ${uni.shortlisted ? 'fill-current' : ''}`} />
                        </Button>
                        <Button size="icon" variant="ghost">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <span className="text-xs text-gray-400">Deadline</span>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium">
                        {uni.deadline.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Intake</span>
                    <p className="text-sm font-medium mt-1">{uni.intake}</p>
                  </div>
                  <div>
                    <span className="text-xs text-gray-400">Duration</span>
                    <p className="text-sm font-medium mt-1">{uni.duration}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor.bg} ${statusColor.text}`}>
                      {statusColor.label}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400">Requirements:</span>
                      <div className="flex items-center gap-1">
                        {Object.entries(uni.requirementsStatus).map(([key, value]) => (
                          <div
                            key={key}
                            className={`w-2 h-2 rounded-full ${value ? 'bg-green-500' : 'bg-gray-600'}`}
                            title={key.toUpperCase()}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-gray-400">{requirementsComplete}/5</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" className="border-gray-700">
                      <ExternalLink className="h-3 w-3 mr-1" />
                      Website
                    </Button>
                    <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                      View Details
                    </Button>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {filteredUniversities.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-400">No universities found matching your criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function ApplicationsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading applications...</div>
      </div>
    }>
      <ApplicationsContent />
    </Suspense>
  )
}