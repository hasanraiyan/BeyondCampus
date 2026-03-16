"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Calendar,
  AlertCircle,
  Target,
  Milestone,
  ChevronRight,
  ChevronDown,
  FileText,
  GraduationCap,
  Plane,
  DollarSign,
  Home,
  BookOpen,
  Users,
  User as UserIcon,
  Flag
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface RoadmapPhase {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  startMonth: number // months from now
  duration: number // in months
  milestones: Milestone[]
  status: 'not_started' | 'in_progress' | 'completed'
  progress: number
}

interface Milestone {
  id: string
  title: string
  description?: string
  tasks: Task[]
  deadline?: Date
  status: 'not_started' | 'in_progress' | 'completed'
  critical?: boolean
}

interface Task {
  id: string
  title: string
  completed: boolean
  priority?: 'high' | 'medium' | 'low'
}

const roadmapPhases: RoadmapPhase[] = [
  {
    id: 'profile_prep',
    title: 'Profile Building',
    description: 'Complete your profile and prepare for standardized tests',
    icon: <UserIcon className="h-5 w-5" />,
    color: '#3b82f6',
    startMonth: 0,
    duration: 3,
    status: 'in_progress',
    progress: 60,
    milestones: [
      {
        id: 'm1',
        title: 'Complete Profile Setup',
        status: 'completed',
        tasks: [
          { id: 't1', title: 'Personal information', completed: true },
          { id: 't2', title: 'Educational background', completed: true },
          { id: 't3', title: 'Career goals', completed: false }
        ]
      },
      {
        id: 'm2',
        title: 'Standardized Test Preparation',
        status: 'in_progress',
        deadline: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
        critical: true,
        tasks: [
          { id: 't4', title: 'Register for GRE/GMAT', completed: true, priority: 'high' },
          { id: 't5', title: 'Complete test prep course', completed: false, priority: 'high' },
          { id: 't6', title: 'Take practice tests', completed: false },
          { id: 't7', title: 'Book test date', completed: false, priority: 'high' }
        ]
      },
      {
        id: 'm3',
        title: 'English Proficiency Test',
        status: 'not_started',
        tasks: [
          { id: 't8', title: 'Register for IELTS/TOEFL', completed: false, priority: 'high' },
          { id: 't9', title: 'Complete preparation', completed: false },
          { id: 't10', title: 'Take the test', completed: false }
        ]
      }
    ]
  },
  {
    id: 'research',
    title: 'Research & Shortlisting',
    description: 'Research universities and programs that match your profile',
    icon: <BookOpen className="h-5 w-5" />,
    color: '#8b5cf6',
    startMonth: 2,
    duration: 2,
    status: 'not_started',
    progress: 0,
    milestones: [
      {
        id: 'm4',
        title: 'University Research',
        status: 'not_started',
        tasks: [
          { id: 't11', title: 'Identify target countries', completed: false },
          { id: 't12', title: 'Research top universities', completed: false },
          { id: 't13', title: 'Check eligibility criteria', completed: false },
          { id: 't14', title: 'Compare programs', completed: false }
        ]
      },
      {
        id: 'm5',
        title: 'Create Shortlist',
        status: 'not_started',
        critical: true,
        tasks: [
          { id: 't15', title: 'List 8-10 universities', completed: false },
          { id: 't16', title: 'Categorize: Dream, Target, Safe', completed: false },
          { id: 't17', title: 'Note application deadlines', completed: false, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'documents',
    title: 'Document Preparation',
    description: 'Prepare all required documents for applications',
    icon: <FileText className="h-5 w-5" />,
    color: '#10b981',
    startMonth: 3,
    duration: 2,
    status: 'not_started',
    progress: 0,
    milestones: [
      {
        id: 'm6',
        title: 'Academic Documents',
        status: 'not_started',
        tasks: [
          { id: 't18', title: 'Collect transcripts', completed: false, priority: 'high' },
          { id: 't19', title: 'Get degree certificates', completed: false },
          { id: 't20', title: 'Calculate GPA', completed: false }
        ]
      },
      {
        id: 'm7',
        title: 'Application Essays',
        status: 'not_started',
        critical: true,
        tasks: [
          { id: 't21', title: 'Draft Statement of Purpose', completed: false, priority: 'high' },
          { id: 't22', title: 'Write Personal Statement', completed: false },
          { id: 't23', title: 'Get essays reviewed', completed: false },
          { id: 't24', title: 'Finalize essays', completed: false }
        ]
      },
      {
        id: 'm8',
        title: 'Recommendation Letters',
        status: 'not_started',
        deadline: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000),
        tasks: [
          { id: 't25', title: 'Identify recommenders', completed: false },
          { id: 't26', title: 'Request LORs', completed: false, priority: 'high' },
          { id: 't27', title: 'Provide necessary info', completed: false },
          { id: 't28', title: 'Follow up', completed: false }
        ]
      }
    ]
  },
  {
    id: 'applications',
    title: 'Applications',
    description: 'Submit applications to shortlisted universities',
    icon: <GraduationCap className="h-5 w-5" />,
    color: '#f59e0b',
    startMonth: 5,
    duration: 2,
    status: 'not_started',
    progress: 0,
    milestones: [
      {
        id: 'm9',
        title: 'Application Submission',
        status: 'not_started',
        critical: true,
        tasks: [
          { id: 't29', title: 'Create university accounts', completed: false },
          { id: 't30', title: 'Fill application forms', completed: false },
          { id: 't31', title: 'Upload documents', completed: false },
          { id: 't32', title: 'Pay application fees', completed: false, priority: 'high' },
          { id: 't33', title: 'Submit applications', completed: false, priority: 'high' }
        ]
      },
      {
        id: 'm10',
        title: 'Post-Application',
        status: 'not_started',
        tasks: [
          { id: 't34', title: 'Send additional documents', completed: false },
          { id: 't35', title: 'Track application status', completed: false },
          { id: 't36', title: 'Prepare for interviews', completed: false }
        ]
      }
    ]
  },
  {
    id: 'admits',
    title: 'Admits & Decision',
    description: 'Receive admits and make final decision',
    icon: <Target className="h-5 w-5" />,
    color: '#ef4444',
    startMonth: 7,
    duration: 2,
    status: 'not_started',
    progress: 0,
    milestones: [
      {
        id: 'm11',
        title: 'Review Offers',
        status: 'not_started',
        tasks: [
          { id: 't37', title: 'Compare admission offers', completed: false },
          { id: 't38', title: 'Evaluate scholarships', completed: false },
          { id: 't39', title: 'Research locations', completed: false }
        ]
      },
      {
        id: 'm12',
        title: 'Final Decision',
        status: 'not_started',
        critical: true,
        deadline: new Date(Date.now() + 240 * 24 * 60 * 60 * 1000),
        tasks: [
          { id: 't40', title: 'Accept offer', completed: false, priority: 'high' },
          { id: 't41', title: 'Pay deposit', completed: false, priority: 'high' },
          { id: 't42', title: 'Decline other offers', completed: false }
        ]
      }
    ]
  },
  {
    id: 'visa_finance',
    title: 'Visa & Finance',
    description: 'Arrange finances and apply for student visa',
    icon: <DollarSign className="h-5 w-5" />,
    color: '#6366f1',
    startMonth: 8,
    duration: 2,
    status: 'not_started',
    progress: 0,
    milestones: [
      {
        id: 'm13',
        title: 'Financial Arrangements',
        status: 'not_started',
        critical: true,
        tasks: [
          { id: 't43', title: 'Calculate total expenses', completed: false },
          { id: 't44', title: 'Arrange education loan', completed: false, priority: 'high' },
          { id: 't45', title: 'Prepare financial documents', completed: false },
          { id: 't46', title: 'Show proof of funds', completed: false }
        ]
      },
      {
        id: 'm14',
        title: 'Visa Application',
        status: 'not_started',
        critical: true,
        tasks: [
          { id: 't47', title: 'Get I-20/CAS', completed: false, priority: 'high' },
          { id: 't48', title: 'Fill visa application', completed: false },
          { id: 't49', title: 'Book visa appointment', completed: false, priority: 'high' },
          { id: 't50', title: 'Attend visa interview', completed: false, priority: 'high' }
        ]
      }
    ]
  },
  {
    id: 'pre_departure',
    title: 'Pre-Departure',
    description: 'Final preparations before departure',
    icon: <Plane className="h-5 w-5" />,
    color: '#14b8a6',
    startMonth: 10,
    duration: 1,
    status: 'not_started',
    progress: 0,
    milestones: [
      {
        id: 'm15',
        title: 'Travel Arrangements',
        status: 'not_started',
        tasks: [
          { id: 't51', title: 'Book flight tickets', completed: false, priority: 'high' },
          { id: 't52', title: 'Arrange accommodation', completed: false, priority: 'high' },
          { id: 't53', title: 'Get travel insurance', completed: false }
        ]
      },
      {
        id: 'm16',
        title: 'Final Preparations',
        status: 'not_started',
        tasks: [
          { id: 't54', title: 'Health checkup', completed: false },
          { id: 't55', title: 'Pack essentials', completed: false },
          { id: 't56', title: 'Attend pre-departure orientation', completed: false }
        ]
      }
    ]
  }
]

export default function RoadmapPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [expandedPhases, setExpandedPhases] = useState<string[]>(['profile_prep'])
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)

  useEffect(() => {
    setLoading(false)
  }, [])

  const togglePhase = (phaseId: string) => {
    setExpandedPhases(prev => 
      prev.includes(phaseId) 
        ? prev.filter(id => id !== phaseId)
        : [...prev, phaseId]
    )
  }

  const getPhasePosition = (startMonth: number) => {
    // Calculate position on timeline (0-100%)
    const totalMonths = 12
    return (startMonth / totalMonths) * 100
  }

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading roadmap...</div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto text-white">
      {/* Header */}
      <div className="border-b border-border/30 backdrop-blur-sm sticky top-0 z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-500" />
              <h1 className="text-xl font-semibold">Study Abroad Roadmap</h1>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Calendar className="h-4 w-4" />
              <span>Timeline: 12 months</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Timeline Overview - Clean Design */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Your Journey Timeline</h2>
            <div className="flex items-center gap-6">
              <p className="text-gray-400">12-month roadmap to study abroad</p>
              <div className="flex items-center gap-2">
                <div className="text-sm font-medium text-orange-500">
                  {Math.round(roadmapPhases.reduce((acc, phase) => acc + (phase.progress || 0), 0) / roadmapPhases.length)}% Complete
                </div>
              </div>
            </div>
          </div>

          {/* Clean Timeline */}
          <div className="relative">
            {/* Timeline Track */}
            <div className="relative h-3 bg-gray-900 rounded-full overflow-visible shadow-inner">
              {/* Animated Progress Fill */}
              <div className="absolute h-full rounded-full overflow-hidden" style={{ width: '25%' }}>
                <div className="h-full bg-gradient-to-r from-orange-500 via-orange-400 to-yellow-500 rounded-full relative">
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                </div>
              </div>
              
              {/* Progress Glow */}
              <div 
                className="absolute h-full rounded-full bg-orange-500/30 blur-md transition-all duration-700"
                style={{ width: '25%' }}
              />
              
              {/* Phase Dots */}
              {roadmapPhases.map((phase, index) => {
                const position = getPhasePosition(phase.startMonth)
                
                return (
                  <div
                    key={phase.id}
                    className="absolute top-1/2 -translate-y-1/2 cursor-pointer group"
                    style={{ left: `${position}%` }}
                    onClick={() => togglePhase(phase.id)}
                  >
                    {/* Outer Ring */}
                    <div className={`absolute -inset-2 rounded-full transition-all ${
                      phase.status === 'in_progress' ? 'bg-orange-500/20' : ''
                    }`} />
                    
                    {/* Dot */}
                    <div 
                      className={`relative w-5 h-5 rounded-full border-2 transition-all shadow-lg ${
                        phase.status === 'completed' ? 'bg-green-500 border-green-500 scale-110' :
                        phase.status === 'in_progress' ? 'bg-orange-500 border-orange-500 scale-125' :
                        'bg-gray-800 border-gray-700 hover:scale-110'
                      }`}
                    >
                      {phase.status === 'in_progress' && (
                        <>
                          <div className="absolute inset-0 rounded-full bg-orange-500 animate-ping opacity-75" />
                          <div className="absolute inset-0 rounded-full bg-orange-500 animate-pulse" />
                        </>
                      )}
                      {phase.status === 'completed' && (
                        <CheckCircle2 className="h-3 w-3 text-white absolute inset-0 m-auto" />
                      )}
                    </div>
                    
                    {/* Tooltip */}
                    <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      <div className="bg-gray-800 text-white text-xs px-3 py-2 rounded-lg whitespace-nowrap">
                        <div className="font-medium">{phase.title}</div>
                        <div className="text-gray-400">Month {phase.startMonth + 1}</div>
                      </div>
                      <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-1">
                        <div className="border-4 border-transparent border-t-gray-800" />
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            
            {/* Month Labels */}
            <div className="flex justify-between mt-6 text-xs text-gray-500">
              <span className="font-medium">Now</span>
              <span>3 months</span>
              <span>6 months</span>
              <span>9 months</span>
              <span className="font-medium">12 months</span>
            </div>
          </div>

          {/* Phase Grid - Simplified */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4 mt-16">
            {roadmapPhases.map((phase) => (
              <button
                key={phase.id}
                onClick={() => togglePhase(phase.id)}
                className={`text-left p-4 rounded-xl border transition-all ${
                  expandedPhases.includes(phase.id) 
                    ? 'border-orange-500 bg-orange-500/10' 
                    : 'border-gray-800 hover:border-gray-700'
                }`}
                style={{ backgroundColor: expandedPhases.includes(phase.id) ? undefined : '#0a0a0a' }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div 
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ 
                      backgroundColor: phase.status === 'completed' ? `${phase.color}20` : 
                                       phase.status === 'in_progress' ? `${phase.color}15` : 
                                       '#141414'
                    }}
                  >
                    <div style={{ 
                      color: phase.status === 'not_started' ? '#6b7280' : phase.color,
                      fontSize: '16px' 
                    }}>
                      {phase.icon}
                    </div>
                  </div>
                  {phase.status === 'completed' && (
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                  )}
                </div>
                
                <h3 className="font-medium text-sm text-white mb-1">
                  {phase.title}
                </h3>
                
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500">
                    Month {phase.startMonth + 1}-{phase.startMonth + phase.duration}
                  </span>
                  {phase.status === 'in_progress' && (
                    <span className="text-xs font-medium text-orange-500">
                      {phase.progress}%
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Phases Detail */}
        <div className="mt-12">
          {roadmapPhases.map((phase, index) => (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="rounded-xl border border-gray-800 overflow-hidden"
              style={{ 
                backgroundColor: '#0a0a0a',
                marginBottom: index < roadmapPhases.length - 1 ? '48px' : '0'
              }}
            >
              {/* Phase Header */}
              <div 
                className="p-6 cursor-pointer"
                onClick={() => togglePhase(phase.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: `${phase.color}20` }}
                    >
                      <div style={{ color: phase.color }}>{phase.icon}</div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                        {phase.title}
                        {phase.status === 'completed' && <CheckCircle2 className="h-5 w-5 text-green-500" />}
                        {phase.status === 'in_progress' && <Clock className="h-5 w-5 text-yellow-500" />}
                      </h3>
                      <p className="text-sm text-gray-400">{phase.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="text-sm text-gray-400">
                        Month {phase.startMonth + 1} - {phase.startMonth + phase.duration}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {phase.milestones.length} milestones
                      </div>
                    </div>
                    {expandedPhases.includes(phase.id) ? (
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    )}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {phase.status !== 'not_started' && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-white">{phase.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-500"
                        style={{ 
                          backgroundColor: phase.color,
                          width: `${phase.progress}%`
                        }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Phase Content */}
              {expandedPhases.includes(phase.id) && (
                <div className="border-t border-gray-800 p-6 pb-10">
                  <div className="space-y-4">
                    {phase.milestones.map((milestone) => (
                      <div 
                        key={milestone.id}
                        className="p-4 rounded-lg border border-gray-800"
                        style={{ backgroundColor: '#141414' }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-start gap-3">
                            {milestone.status === 'completed' ? (
                              <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
                            ) : milestone.status === 'in_progress' ? (
                              <Circle className="h-5 w-5 text-yellow-500 mt-0.5" />
                            ) : (
                              <Circle className="h-5 w-5 text-gray-500 mt-0.5" />
                            )}
                            <div>
                              <h4 className="font-medium text-white flex items-center gap-2">
                                {milestone.title}
                                {milestone.critical && (
                                  <span className="text-xs px-2 py-0.5 bg-red-500/20 text-red-500 rounded">
                                    Critical
                                  </span>
                                )}
                              </h4>
                              {milestone.description && (
                                <p className="text-sm text-gray-400 mt-1">{milestone.description}</p>
                              )}
                              {milestone.deadline && (
                                <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                                  <AlertCircle className="h-3 w-3" />
                                  Due: {new Date(milestone.deadline).toLocaleDateString()}
                                </div>
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedMilestone(
                              selectedMilestone === milestone.id ? null : milestone.id
                            )}
                          >
                            {selectedMilestone === milestone.id ? (
                              <ChevronDown className="h-4 w-4" />
                            ) : (
                              <ChevronRight className="h-4 w-4" />
                            )}
                          </Button>
                        </div>

                        {/* Task Checklist */}
                        {selectedMilestone === milestone.id && (
                          <div className="ml-8 space-y-2 mt-3">
                            {milestone.tasks.map((task) => (
                              <label
                                key={task.id}
                                className="flex items-center gap-3 p-2 rounded hover:bg-gray-800/50 cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={task.completed}
                                  onChange={() => {}}
                                  className="rounded border-gray-600 bg-gray-800 text-orange-500 focus:ring-orange-500"
                                />
                                <span className={`text-sm ${task.completed ? 'text-gray-500 line-through' : 'text-white'}`}>
                                  {task.title}
                                </span>
                                {task.priority && (
                                  <Flag className={`h-3 w-3 ${
                                    task.priority === 'high' ? 'text-red-500' :
                                    task.priority === 'medium' ? 'text-yellow-500' : 'text-green-500'
                                  }`} />
                                )}
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* AI Insights */}
        <div className="mt-16 mb-8 p-6 rounded-xl border border-orange-500/20" style={{ backgroundColor: '#0a0a0a' }}>
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Milestone className="h-5 w-5 text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-white mb-2">Maya's Roadmap Insights</h3>
              <p className="text-sm text-gray-400">
                Based on your profile and timeline, you're currently in the <span className="text-orange-500">Profile Building</span> phase. 
                Focus on completing your standardized tests in the next 2 months to stay on track. 
                The critical path includes GRE/GMAT preparation and university shortlisting by Month 4.
              </p>
              <Button className="mt-3 text-sm" size="sm">
                Get Personalized Advice
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}