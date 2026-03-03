"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ArrowLeft,
  Edit2,
  Save,
  GraduationCap,
  Globe,
  BookOpen,
  DollarSign,
  User,
  Shield,
  ClipboardList,
  Plus,
  Trash2,
  Calendar,
  FileText,
} from 'lucide-react'

// ── Types ────────────────────────────────────────────────

interface TestScore {
  id: string
  examType: string
  overallScore: number
  subScores: Record<string, number> | null
  dateTaken: string | null
}

interface ProfileField {
  id: string
  title: string
  value: string
  category: string
  extractedBy: string
  sourceDocumentId: string | null
}

interface UserProfile {
  id: string
  email: string
  firstName: string
  lastName: string
  onboardingCompleted: boolean
  degreeLevel: string | null
  fieldOfStudy: string | null
  currentEducation: string | null
  targetCountry: string | null
  intakeSeason: string | null
  intakeYear: number | null
  budgetRange: string | null
  hasGivenTests: boolean | null
  testScores: TestScore[]
  profileFields: ProfileField[]
}

interface EditableTestScore {
  examType: string
  overallScore: string
}

// ── Option Maps ──────────────────────────────────────────

const DEGREE_LABELS: Record<string, string> = {
  UG: 'Undergraduate',
  PG: 'Postgraduate',
  MBA: 'MBA',
  PHD: 'PhD',
}

const SEASON_LABELS: Record<string, string> = {
  FALL: 'Fall',
  SPRING: 'Spring',
  SUMMER: 'Summer',
}

const BUDGET_LABELS: Record<string, string> = {
  UNDER_20K: 'Under $20K/year',
  USD_20K_40K: '$20K – $40K/year',
  USD_40K_60K: '$40K – $60K/year',
  USD_60K_PLUS: '$60K+/year',
}

const DEGREE_OPTIONS = ['UG', 'PG', 'MBA', 'PHD']
const SEASON_OPTIONS = ['FALL', 'SPRING', 'SUMMER']
const BUDGET_OPTIONS = ['UNDER_20K', 'USD_20K_40K', 'USD_40K_60K', 'USD_60K_PLUS']
const COUNTRY_OPTIONS = ['US', 'UK', 'Canada', 'Australia', 'Germany']
const EXAM_OPTIONS = ['GRE', 'GMAT', 'IELTS', 'TOEFL', 'SAT', 'ACT']
const FIELD_OPTIONS = ['Computer Science', 'Engineering', 'Business & Finance', 'Data Science & AI', 'Medicine & Health', 'Arts & Design', 'Law', 'Other']

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = Array.from({ length: 4 }, (_, i) => currentYear + i)

const CATEGORY_LABELS: Record<string, string> = {
  ACADEMIC: 'Academic',
  TEST_SCORE: 'Test Score',
  PERSONAL: 'Personal',
  IMMIGRATION: 'Immigration',
  FINANCIAL: 'Financial',
}

// ── Helpers ──────────────────────────────────────────────

function computeCompleteness(p: UserProfile): number {
  const checks = [
    !!p.firstName,
    !!p.email,
    !!p.degreeLevel,
    !!p.fieldOfStudy,
    !!p.currentEducation,
    !!p.targetCountry,
    !!p.intakeSeason,
    !!p.intakeYear,
    !!p.budgetRange,
    p.hasGivenTests !== null,
    p.hasGivenTests ? p.testScores.length > 0 : true,
  ]
  return Math.round((checks.filter(Boolean).length / checks.length) * 100)
}

// ── Select Component ─────────────────────────────────────

function SelectField({
  label,
  value,
  options,
  labelMap,
  isEditing,
  onChange,
  placeholder,
}: {
  label: string
  value: string | null
  options: string[]
  labelMap?: Record<string, string>
  isEditing: boolean
  onChange: (v: string) => void
  placeholder?: string
}) {
  const display = value ? (labelMap?.[value] ?? value) : 'Not set'
  if (!isEditing) {
    return (
      <div>
        <Label className="text-gray-400 text-sm">{label}</Label>
        <p className="mt-1 text-white">{display}</p>
      </div>
    )
  }
  return (
    <div>
      <Label className="text-gray-400 text-sm">{label}</Label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        className="mt-1 w-full px-3 py-2 bg-background border border-gray-800 rounded-md text-white focus:outline-none focus:border-orange-500"
      >
        <option value="">{placeholder || `Select ${label.toLowerCase()}`}</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {labelMap?.[opt] ?? opt}
          </option>
        ))}
      </select>
    </div>
  )
}

// ── Main Component ───────────────────────────────────────

export default function ProfilePage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  // Editable copies
  const [editFields, setEditFields] = useState<Partial<UserProfile>>({})
  const [editScores, setEditScores] = useState<EditableTestScore[]>([])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) router.push('/auth/signin')
  }, [session, status, router])

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/user/profile')
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
        resetEdits(data)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const resetEdits = (p: UserProfile) => {
    setEditFields({
      firstName: p.firstName,
      lastName: p.lastName,
      degreeLevel: p.degreeLevel,
      fieldOfStudy: p.fieldOfStudy,
      currentEducation: p.currentEducation,
      targetCountry: p.targetCountry,
      intakeSeason: p.intakeSeason,
      intakeYear: p.intakeYear,
      budgetRange: p.budgetRange,
      hasGivenTests: p.hasGivenTests,
    })
    setEditScores(
      p.testScores.map((ts) => ({
        examType: ts.examType,
        overallScore: String(ts.overallScore),
      }))
    )
  }

  const startEditing = () => {
    if (profile) resetEdits(profile)
    setIsEditing(true)
  }

  const cancelEditing = () => {
    if (profile) resetEdits(profile)
    setIsEditing(false)
  }

  const handleSave = async () => {
    if (!profile) return
    setIsSaving(true)
    try {
      const payload: Record<string, any> = { ...editFields }
      payload.testScores = editScores
        .filter((ts) => ts.examType && ts.overallScore)
        .map((ts) => ({ examType: ts.examType, overallScore: parseFloat(ts.overallScore) }))

      const res = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const { user } = await res.json()
        setProfile(user)
        resetEdits(user)
        setIsEditing(false)
      }
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const updateField = (key: string, value: any) => {
    setEditFields((prev) => ({ ...prev, [key]: value || null }))
  }

  const addScore = () => setEditScores((prev) => [...prev, { examType: '', overallScore: '' }])
  const removeScore = (i: number) => setEditScores((prev) => prev.filter((_, idx) => idx !== i))
  const updateScore = (i: number, field: keyof EditableTestScore, value: string) => {
    setEditScores((prev) => {
      const copy = [...prev]
      copy[i] = { ...copy[i], [field]: value }
      return copy
    })
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading...</div>
      </div>
    )
  }

  const completeness = computeCompleteness(profile)

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => router.push('/')} className="flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <h1 className="text-xl font-semibold text-white">My Profile</h1>
            </div>
            {!isEditing ? (
              <Button onClick={startEditing} className="flex items-center gap-2">
                <Edit2 className="h-4 w-4" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" onClick={cancelEditing} disabled={isSaving}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="flex items-center gap-2">
                  {isSaving ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Information */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <User className="h-5 w-5 text-orange-500" />
                Basic Information
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-400 text-sm">First Name</Label>
                  {isEditing ? (
                    <Input
                      value={editFields.firstName || ''}
                      onChange={(e) => updateField('firstName', e.target.value)}
                      className="mt-1 bg-background border-gray-800 text-white"
                    />
                  ) : (
                    <p className="mt-1 text-white">{profile.firstName}</p>
                  )}
                </div>
                <div>
                  <Label className="text-gray-400 text-sm">Last Name</Label>
                  {isEditing ? (
                    <Input
                      value={editFields.lastName || ''}
                      onChange={(e) => updateField('lastName', e.target.value)}
                      className="mt-1 bg-background border-gray-800 text-white"
                    />
                  ) : (
                    <p className="mt-1 text-white">{profile.lastName}</p>
                  )}
                </div>
                <div className="sm:col-span-2">
                  <Label className="text-gray-400 text-sm">Email</Label>
                  <p className="mt-1 text-gray-300">{profile.email}</p>
                </div>
              </div>
            </motion.div>

            {/* Academic Profile */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-orange-500" />
                Academic Profile
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Degree Level"
                  value={isEditing ? (editFields.degreeLevel ?? null) : profile.degreeLevel}
                  options={DEGREE_OPTIONS}
                  labelMap={DEGREE_LABELS}
                  isEditing={isEditing}
                  onChange={(v) => updateField('degreeLevel', v)}
                />
                <SelectField
                  label="Field of Study"
                  value={isEditing ? (editFields.fieldOfStudy ?? null) : profile.fieldOfStudy}
                  options={FIELD_OPTIONS}
                  isEditing={isEditing}
                  onChange={(v) => updateField('fieldOfStudy', v)}
                />
                <div className="sm:col-span-2">
                  <Label className="text-gray-400 text-sm">Current Education</Label>
                  {isEditing ? (
                    <Input
                      value={editFields.currentEducation || ''}
                      onChange={(e) => updateField('currentEducation', e.target.value)}
                      placeholder="e.g., B.Tech in CS from IIT Delhi"
                      className="mt-1 bg-background border-gray-800 text-white"
                    />
                  ) : (
                    <p className="mt-1 text-white">{profile.currentEducation || 'Not set'}</p>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Study Abroad Plans */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <Globe className="h-5 w-5 text-orange-500" />
                Study Abroad Plans
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SelectField
                  label="Target Country"
                  value={isEditing ? (editFields.targetCountry ?? null) : profile.targetCountry}
                  options={COUNTRY_OPTIONS}
                  isEditing={isEditing}
                  onChange={(v) => updateField('targetCountry', v)}
                />
                <SelectField
                  label="Intake Season"
                  value={isEditing ? (editFields.intakeSeason ?? null) : profile.intakeSeason}
                  options={SEASON_OPTIONS}
                  labelMap={SEASON_LABELS}
                  isEditing={isEditing}
                  onChange={(v) => updateField('intakeSeason', v)}
                />
                <SelectField
                  label="Intake Year"
                  value={isEditing ? String(editFields.intakeYear ?? '') : (profile.intakeYear ? String(profile.intakeYear) : null)}
                  options={YEAR_OPTIONS.map(String)}
                  isEditing={isEditing}
                  onChange={(v) => updateField('intakeYear', v ? parseInt(v) : null)}
                />
                <SelectField
                  label="Budget Range"
                  value={isEditing ? (editFields.budgetRange ?? null) : profile.budgetRange}
                  options={BUDGET_OPTIONS}
                  labelMap={BUDGET_LABELS}
                  isEditing={isEditing}
                  onChange={(v) => updateField('budgetRange', v)}
                />
              </div>
            </motion.div>

            {/* Test Scores */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-orange-500" />
                Test Scores
              </h2>

              {isEditing ? (
                <div className="space-y-3">
                  {editScores.map((ts, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <select
                        value={ts.examType}
                        onChange={(e) => updateScore(i, 'examType', e.target.value)}
                        className="flex-1 px-3 py-2 bg-background border border-gray-800 rounded-md text-white focus:outline-none focus:border-orange-500"
                      >
                        <option value="">Select Exam</option>
                        {EXAM_OPTIONS.map((exam) => (
                          <option key={exam} value={exam}>{exam}</option>
                        ))}
                      </select>
                      <Input
                        type="number"
                        placeholder="Score"
                        value={ts.overallScore}
                        onChange={(e) => updateScore(i, 'overallScore', e.target.value)}
                        className="w-28 bg-background border-gray-800 text-white"
                      />
                      <button onClick={() => removeScore(i)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                  <Button variant="outline" size="sm" onClick={addScore} className="flex items-center gap-2 border-dashed border-gray-700">
                    <Plus className="h-4 w-4" />
                    Add Exam
                  </Button>
                </div>
              ) : profile.testScores.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {profile.testScores.map((ts) => (
                    <div key={ts.id} className="flex items-center gap-4 p-4 bg-background rounded-lg border border-gray-800">
                      <div className="h-10 w-10 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
                        <ClipboardList className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{ts.examType}</p>
                        <p className="text-sm text-gray-400">
                          Score: <span className="text-orange-400 font-semibold">{ts.overallScore}</span>
                          {ts.dateTaken && (
                            <span className="ml-2">
                              &middot; {new Date(ts.dateTaken).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No test scores added yet.</p>
              )}
            </motion.div>

            {/* Agent-Extracted Profile Fields */}
            {profile.profileFields.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
              >
                <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                  <FileText className="h-5 w-5 text-orange-500" />
                  Extracted Profile Data
                </h2>
                <div className="space-y-3">
                  {Object.entries(
                    profile.profileFields.reduce<Record<string, ProfileField[]>>((acc, pf) => {
                      const cat = pf.category
                      if (!acc[cat]) acc[cat] = []
                      acc[cat].push(pf)
                      return acc
                    }, {})
                  ).map(([category, fields]) => (
                    <div key={category}>
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        {CATEGORY_LABELS[category] ?? category}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {fields.map((pf) => (
                          <div key={pf.id} className="flex items-center justify-between p-3 bg-background rounded-lg border border-gray-800">
                            <div>
                              <p className="text-sm text-gray-400">{pf.title}</p>
                              <p className="text-white">{pf.value}</p>
                            </div>
                            {pf.extractedBy === 'AGENT' && (
                              <span className="text-[10px] px-2 py-0.5 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20">
                                AI
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Profile Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-6 border border-gray-700 text-center"
            >
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl bg-orange-500/20 text-orange-500">
                  {profile.firstName?.charAt(0)}{profile.lastName?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <h3 className="text-xl font-semibold text-white">
                {profile.firstName} {profile.lastName}
              </h3>
              <p className="text-gray-400 text-sm">{profile.email}</p>

              {profile.degreeLevel && (
                <div className="mt-3 flex items-center justify-center gap-2 text-sm text-gray-300">
                  <GraduationCap className="h-4 w-4 text-orange-500" />
                  {DEGREE_LABELS[profile.degreeLevel]} &middot; {profile.fieldOfStudy || 'Undecided'}
                </div>
              )}

              {(profile.intakeSeason || profile.targetCountry) && (
                <div className="mt-1 flex items-center justify-center gap-2 text-sm text-gray-400">
                  <Calendar className="h-3.5 w-3.5" />
                  {profile.intakeSeason && SEASON_LABELS[profile.intakeSeason]}{' '}
                  {profile.intakeYear} &middot; {profile.targetCountry}
                </div>
              )}

              <div className="mt-6 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Profile Completion</span>
                  <span className="text-orange-500 font-medium">{completeness}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-orange-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${completeness}%` }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Quick Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 border border-gray-800"
            >
              <h2 className="text-lg font-semibold text-white mb-4">Quick Stats</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Test Scores</span>
                  <span className="text-white font-medium">{profile.testScores.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Profile Fields</span>
                  <span className="text-white font-medium">{profile.profileFields.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Budget</span>
                  <span className="text-white font-medium">
                    {profile.budgetRange ? BUDGET_LABELS[profile.budgetRange] : '—'}
                  </span>
                </div>
              </div>
            </motion.div>

            {/* Privacy Notice */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-orange-500/10 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20"
            >
              <div className="flex items-start gap-3">
                <Shield className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-medium text-white mb-1">Your Privacy Matters</h3>
                  <p className="text-sm text-gray-300">
                    Your profile helps Maya and university counselors provide personalized guidance.
                    We never share your data with third parties.
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  )
}
