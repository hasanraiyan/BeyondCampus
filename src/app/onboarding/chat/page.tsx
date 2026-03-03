"use client"

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Mic, MicOff, Volume2, VolumeX, X, Plus, Trash2, SkipForward } from 'lucide-react'

interface TestScoreEntry {
  examType: string
  overallScore: string
}

interface OnboardingData {
  location?: string
  degreeLevel?: string
  degreeLevelCustom?: string
  fieldOfStudy?: string
  currentEducation?: string
  targetCountry?: string
  intakeYear?: string
  intakeSeason?: string
  budgetRange?: string
  hasGivenTests?: boolean
  testScores: TestScoreEntry[]
}

type StepType = 'options' | 'text' | 'yes_no' | 'test_scores'

interface OnboardingStep {
  id: string
  question: string
  field: keyof OnboardingData
  type: StepType
  options?: string[]
  optionMap?: Record<string, string>
  hasOther?: boolean
  otherPlaceholder?: string
}

const DEGREE_OPTIONS: Record<string, string> = {
  'Undergraduate (UG)': 'UG',
  'Postgraduate (PG)': 'PG',
  'MBA': 'MBA',
  'PhD': 'PHD',
}

const SEASON_OPTIONS: Record<string, string> = {
  'Fall': 'FALL',
  'Spring': 'SPRING',
  'Summer': 'SUMMER',
}

const BUDGET_OPTIONS: Record<string, string> = {
  'Under $20K/year': 'UNDER_20K',
  '$20K – $40K/year': 'USD_20K_40K',
  '$40K – $60K/year': 'USD_40K_60K',
  '$60K+/year': 'USD_60K_PLUS',
}

const EXAM_OPTIONS = ['GRE', 'GMAT', 'IELTS', 'TOEFL', 'SAT', 'ACT']

const currentYear = new Date().getFullYear()
const YEAR_OPTIONS = [
  String(currentYear),
  String(currentYear + 1),
  String(currentYear + 2),
  String(currentYear + 3),
  'Not Decided',
]

const ALL_STEPS: OnboardingStep[] = [
  {
    id: 'degreeLevel',
    question: "Hi! I'm Maya, your AI study abroad counselor. Let's get to know you. What degree are you planning to pursue?",
    field: 'degreeLevel',
    type: 'options',
    options: [...Object.keys(DEGREE_OPTIONS), 'Not Decided', 'Other'],
    optionMap: DEGREE_OPTIONS,
    hasOther: true,
    otherPlaceholder: 'Type your degree type...',
  },
  {
    id: 'fieldOfStudy',
    question: "What field do you want to study?",
    field: 'fieldOfStudy',
    type: 'options',
    options: ['Computer Science', 'Engineering', 'Business & Finance', 'Data Science & AI', 'Medicine & Health', 'Arts & Design', 'Law', 'Other'],
    hasOther: true,
    otherPlaceholder: 'Type your field of study...',
  },
  {
    id: 'currentEducation',
    question: "What's your current education? For example, 'B.Tech in CS from IIT Delhi'",
    field: 'currentEducation',
    type: 'text',
  },
  {
    id: 'location',
    question: "Which city and state are you from?",
    field: 'location',
    type: 'text',
  },
  {
    id: 'targetCountry',
    question: "Which country are you looking to study in?",
    field: 'targetCountry',
    type: 'options',
    options: ['US', 'UK', 'Canada', 'Australia', 'Germany'],
  },
  {
    id: 'intakeYear',
    question: "Which year are you planning to start?",
    field: 'intakeYear',
    type: 'options',
    options: YEAR_OPTIONS,
  },
  {
    id: 'intakeSeason',
    question: "Which intake do you plan?",
    field: 'intakeSeason',
    type: 'options',
    options: Object.keys(SEASON_OPTIONS),
    optionMap: SEASON_OPTIONS,
  },
  {
    id: 'budgetRange',
    question: "What's your tuition budget per year?",
    field: 'budgetRange',
    type: 'options',
    options: Object.keys(BUDGET_OPTIONS),
    optionMap: BUDGET_OPTIONS,
  },
  {
    id: 'hasGivenTests',
    question: "Have you taken any standardized tests like GRE, IELTS, or TOEFL?",
    field: 'hasGivenTests',
    type: 'yes_no',
  },
  {
    id: 'testScores',
    question: "Add your test scores below. Click 'Add Exam' for each test you've taken.",
    field: 'testScores',
    type: 'test_scores',
  },
]

export default function OnboardingChat() {
  const router = useRouter()
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({ testScores: [] })
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [currentCaption, setCurrentCaption] = useState('')
  const [userCaption, setUserCaption] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [showOptions, setShowOptions] = useState(false)
  const [textInput, setTextInput] = useState('')
  const [showOtherInput, setShowOtherInput] = useState(false)
  const [otherInput, setOtherInput] = useState('')

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<any>(null)
  const finalTranscriptRef = useRef<string>('')

  const getVisibleSteps = useCallback(() => {
    return ALL_STEPS.filter(step => {
      if (step.id === 'intakeSeason' && onboardingData.intakeYear === 'Not Decided') return false
      if (step.id === 'testScores' && onboardingData.hasGivenTests === false) return false
      return true
    })
  }, [onboardingData.intakeYear, onboardingData.hasGivenTests])

  const visibleSteps = getVisibleSteps()
  const currentStepData = visibleSteps[currentStepIndex]
  const totalSteps = visibleSteps.length
  const progress = ((currentStepIndex + 1) / totalSteps) * 100

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        try {
          const transcript = Array.from(event.results)
            .map((result: any) => result[0].transcript)
            .join('')
          setUserCaption(transcript)
          if (event.results[0].isFinal) {
            finalTranscriptRef.current = transcript
          }
        } catch (error) {
          console.error('Speech recognition error:', error)
        }
      }

      recognitionRef.current.onerror = () => setIsListening(false)
      recognitionRef.current.onend = () => {
        setIsListening(false)
        if (finalTranscriptRef.current) {
          handleUserInput(finalTranscriptRef.current)
          finalTranscriptRef.current = ''
        }
      }
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis
      setTimeout(() => speakMessage(ALL_STEPS[0].question), 1000)
    }

    return () => {
      try { recognitionRef.current?.stop() } catch {}
      synthRef.current?.cancel()
    }
  }, [])

  const speakMessage = (text: string) => {
    setCurrentCaption(text)
    setShowOptions(true)
    setShowOtherInput(false)
    setOtherInput('')

    if (!soundEnabled || !synthRef.current) return

    try {
      setIsSpeaking(true)
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1.1
      utterance.volume = 1

      const voices = synthRef.current.getVoices()
      const femaleVoice = voices.find((voice: any) =>
        voice.name.includes('Female') ||
        voice.name.includes('Samantha') ||
        voice.name.includes('Victoria') ||
        voice.name.includes('Karen')
      )
      if (femaleVoice) utterance.voice = femaleVoice

      utterance.onend = () => setIsSpeaking(false)
      utterance.onerror = () => setIsSpeaking(false)
      synthRef.current.speak(utterance)
    } catch {
      setIsSpeaking(false)
    }
  }

  const startListening = () => {
    if (!recognitionRef.current || isListening || isSpeaking) return
    setUserCaption('')
    setIsListening(true)
    recognitionRef.current.start()
  }

  const stopListening = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const advanceToNext = () => {
    const steps = getVisibleSteps()
    const nextIndex = currentStepIndex + 1

    if (nextIndex >= steps.length) {
      completeOnboarding()
      return
    }

    setCurrentStepIndex(nextIndex)
    setTimeout(() => {
      setUserCaption('')
      speakMessage(steps[nextIndex].question)
    }, 1500)
  }

  const handleUserInput = (input: string) => {
    if (!currentStepData) return
    setOnboardingData(prev => ({ ...prev, [currentStepData.field]: input }))
    setShowOptions(false)
    advanceToNext()
  }

  const handleOptionClick = (option: string) => {
    if (!currentStepData) return

    if (option === 'Other' && currentStepData.hasOther) {
      setShowOtherInput(true)
      return
    }

    if (option === 'Not Decided') {
      setUserCaption('Not Decided')
      setOnboardingData(prev => {
        const updated = { ...prev }
        if (currentStepData.id === 'degreeLevel') {
          updated.degreeLevel = undefined
        } else if (currentStepData.id === 'intakeYear') {
          updated.intakeYear = 'Not Decided'
        }
        return updated
      })
      setShowOptions(false)
      advanceToNext()
      return
    }

    setUserCaption(option)
    const value = currentStepData.optionMap ? currentStepData.optionMap[option] : option
    setOnboardingData(prev => ({ ...prev, [currentStepData.field]: value }))
    setShowOptions(false)
    advanceToNext()
  }

  const handleOtherSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!otherInput.trim() || !currentStepData) return
    setUserCaption(otherInput.trim())
    if (currentStepData.id === 'degreeLevel') {
      setOnboardingData(prev => ({ ...prev, degreeLevel: undefined, degreeLevelCustom: otherInput.trim() }))
    } else {
      setOnboardingData(prev => ({ ...prev, [currentStepData.field]: otherInput.trim() }))
    }
    setShowOptions(false)
    setShowOtherInput(false)
    setOtherInput('')
    advanceToNext()
  }

  const handleYesNo = (answer: boolean) => {
    setUserCaption(answer ? 'Yes' : 'No')
    setOnboardingData(prev => ({ ...prev, hasGivenTests: answer }))
    setShowOptions(false)

    if (!answer) {
      setTimeout(() => completeOnboarding(), 1500)
    } else {
      const steps = getVisibleSteps()
      const nextIndex = currentStepIndex + 1
      if (nextIndex < steps.length) {
        setCurrentStepIndex(nextIndex)
        setTimeout(() => {
          setUserCaption('')
          speakMessage(steps[nextIndex].question)
        }, 1500)
      }
    }
  }

  const handleTestScoreChange = (index: number, field: keyof TestScoreEntry, value: string) => {
    setOnboardingData(prev => {
      const updated = [...prev.testScores]
      updated[index] = { ...updated[index], [field]: value }
      return { ...prev, testScores: updated }
    })
  }

  const addTestScore = () => {
    setOnboardingData(prev => ({
      ...prev,
      testScores: [...prev.testScores, { examType: '', overallScore: '' }],
    }))
  }

  const removeTestScore = (index: number) => {
    setOnboardingData(prev => ({
      ...prev,
      testScores: prev.testScores.filter((_, i) => i !== index),
    }))
  }

  const handleTestScoresSubmit = () => {
    const valid = onboardingData.testScores.filter(ts => ts.examType && ts.overallScore)
    if (valid.length === 0) return
    setOnboardingData(prev => ({ ...prev, testScores: valid }))
    setShowOptions(false)
    completeOnboarding()
  }

  const handleTestScoresSkip = () => {
    setOnboardingData(prev => ({ ...prev, testScores: [] }))
    setShowOptions(false)
    completeOnboarding()
  }

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!textInput.trim() || isSpeaking) return
    setUserCaption(textInput)
    handleUserInput(textInput.trim())
    setTextInput('')
  }

  const completeOnboarding = async () => {
    setIsProcessing(true)
    speakMessage("Excellent! I've got everything I need. Let me set up your personalized experience...")

    try {
      const degreeRaw = onboardingData.degreeLevel
      const isStandardDegree = degreeRaw && ['UG', 'PG', 'MBA', 'PHD'].includes(degreeRaw)

      const payload: Record<string, any> = {
        location: onboardingData.location,
        degreeLevel: isStandardDegree ? degreeRaw : null,
        fieldOfStudy: onboardingData.fieldOfStudy,
        currentEducation: onboardingData.currentEducation,
        targetCountry: onboardingData.targetCountry,
        intakeSeason: onboardingData.intakeSeason,
        intakeYear: onboardingData.intakeYear === 'Not Decided' ? null : onboardingData.intakeYear,
        budgetRange: onboardingData.budgetRange,
        hasGivenTests: onboardingData.hasGivenTests,
      }

      if (onboardingData.hasGivenTests && onboardingData.testScores.length > 0) {
        payload.testScores = onboardingData.testScores
          .filter(ts => ts.examType && ts.overallScore)
          .map(ts => ({
            examType: ts.examType,
            overallScore: parseFloat(ts.overallScore),
          }))
      }

      const response = await fetch('/api/user/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        setTimeout(() => router.push('/onboarding/preparing'), 3000)
      } else {
        const errorData = await response.json().catch(() => ({}))
        console.error('Onboarding failed:', response.status, errorData)
        if (response.status === 401) {
          localStorage.setItem('pendingOnboarding', JSON.stringify(payload))
          setTimeout(() => router.push('/onboarding/preparing'), 3000)
        } else {
          setIsProcessing(false)
        }
      }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      setIsProcessing(false)
    }
  }

  if (!currentStepData) return null

  const hasValidScores = onboardingData.testScores.some(ts => ts.examType && ts.overallScore)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-yellow-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      </div>

      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-900">
        <motion.div
          className="h-full bg-gradient-to-r from-orange-500 to-yellow-500"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      <button
        onClick={() => router.push('/')}
        className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors z-20"
      >
        <X className="h-6 w-6" />
      </button>

      <div className="relative z-10 flex flex-col items-center w-full max-w-4xl px-4 pb-48">
        {/* Orb */}
        <motion.div
          className="relative w-48 h-48 mb-8"
          animate={{ scale: isSpeaking ? [1, 1.1, 1] : isListening ? [1, 1.05, 1] : 1 }}
          transition={{ duration: isSpeaking ? 1.5 : 2, repeat: isSpeaking || isListening ? Infinity : 0, ease: "easeInOut" }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-orange-400 via-orange-500 to-yellow-500 opacity-80 blur-xl" />
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-orange-300 via-white to-yellow-400 opacity-60 blur-md" />
          <div className="relative w-full h-full rounded-full bg-gradient-to-br from-orange-400/90 via-white/80 to-yellow-500/90 shadow-2xl">
            <div className="absolute inset-4 rounded-full bg-white/30 blur-xl" />
            {(isSpeaking || isListening) && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="flex gap-1">
                  {[0, 1, 2, 3, 4].map((i) => (
                    <motion.div
                      key={`wave-${i}`}
                      className="w-1 bg-white/60 rounded-full"
                      animate={{ height: isSpeaking ? ['20px', '40px', '20px'] : ['15px', '30px', '15px'] }}
                      transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>

        {/* Captions */}
        <div className="w-full max-w-2xl px-4 mb-6">
          <AnimatePresence mode="wait">
            {currentCaption && (
              <motion.div key={`caption-${currentStepIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center mb-4">
                <p className="text-xl text-white/90 leading-relaxed">{currentCaption}</p>
              </motion.div>
            )}
            {userCaption && (
              <motion.div key="user-caption" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center">
                <p className="text-lg text-gray-400 italic">&ldquo;{userCaption}&rdquo;</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Interactive area */}
        <AnimatePresence mode="wait">
          {/* Options */}
          {showOptions && !isProcessing && currentStepData.type === 'options' && currentStepData.options && (
            <motion.div key={`options-${currentStepIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-3xl px-4 mb-8">
              {!showOtherInput && (
                <>
                  <p className="text-center text-sm text-gray-400 mb-6">Choose an option:</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {currentStepData.options.map((option, index) => {
                      const isSecondary = option === 'Not Decided' || option === 'Other'
                      return (
                        <motion.button
                          key={`${currentStepIndex}-${option}`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.08 }}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleOptionClick(option)}
                          className={`px-6 py-4 backdrop-blur-sm rounded-2xl text-white transition-all font-medium shadow-lg ${
                            isSecondary
                              ? 'bg-white/5 border border-dashed border-white/20 hover:border-white/40 text-gray-300'
                              : 'bg-gradient-to-b from-white/10 to-white/5 border border-orange-500/40 hover:from-orange-500/20 hover:to-orange-500/10 hover:border-orange-500/60 hover:shadow-orange-500/20'
                          }`}
                        >
                          {option}
                        </motion.button>
                      )
                    })}
                  </div>
                </>
              )}

              {showOtherInput && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <p className="text-center text-sm text-gray-400 mb-4">Tell us more:</p>
                  <form onSubmit={handleOtherSubmit} className="flex gap-3">
                    <input
                      type="text"
                      value={otherInput}
                      onChange={(e) => setOtherInput(e.target.value)}
                      placeholder={currentStepData.otherPlaceholder || 'Type here...'}
                      autoFocus
                      className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50 text-lg"
                    />
                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!otherInput.trim()}
                      className="px-8 py-4 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Continue
                    </motion.button>
                  </form>
                  <button onClick={() => setShowOtherInput(false)} className="mt-3 text-sm text-gray-500 hover:text-gray-300 transition-colors mx-auto block">
                    &larr; Back to options
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}

          {/* Yes/No */}
          {showOptions && !isProcessing && currentStepData.type === 'yes_no' && (
            <motion.div key={`yesno-${currentStepIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-md px-4 mb-8">
              <div className="grid grid-cols-2 gap-4">
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleYesNo(true)}
                  className="px-6 py-4 bg-gradient-to-b from-green-500/20 to-green-500/10 backdrop-blur-sm border border-green-500/40 rounded-2xl text-white hover:border-green-500/60 transition-all font-medium shadow-lg"
                >
                  Yes, I have
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.08 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleYesNo(false)}
                  className="px-6 py-4 bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-sm border border-white/20 rounded-2xl text-white hover:border-white/40 transition-all font-medium shadow-lg"
                >
                  Not yet
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* Test Scores */}
          {showOptions && !isProcessing && currentStepData.type === 'test_scores' && (
            <motion.div key={`scores-${currentStepIndex}`} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="w-full max-w-2xl px-4 mb-8">
              <div className="space-y-4">
                {onboardingData.testScores.map((ts, index) => (
                  <motion.div key={index} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-3">
                    <select
                      value={ts.examType}
                      onChange={(e) => handleTestScoreChange(index, 'examType', e.target.value)}
                      className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:outline-none focus:border-orange-500/50"
                    >
                      <option value="" className="bg-gray-900">Select Exam</option>
                      {EXAM_OPTIONS.map(exam => (
                        <option key={exam} value={exam} className="bg-gray-900">{exam}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      placeholder="Score"
                      value={ts.overallScore}
                      onChange={(e) => handleTestScoreChange(index, 'overallScore', e.target.value)}
                      className="w-32 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-orange-500/50"
                    />
                    <button onClick={() => removeTestScore(index)} className="p-2 text-gray-400 hover:text-red-400 transition-colors">
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </motion.div>
                ))}

                <div className="flex gap-3 pt-2">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={addTestScore}
                    className="flex items-center gap-2 px-5 py-3 bg-white/10 border border-dashed border-white/30 rounded-xl text-gray-300 hover:text-white hover:border-orange-500/50 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Add Exam
                  </motion.button>
                  {hasValidScores && (
                    <motion.button
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleTestScoresSubmit}
                      className="flex-1 px-5 py-3 bg-orange-500 hover:bg-orange-600 text-black font-semibold rounded-xl transition-all"
                    >
                      Continue
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleTestScoresSkip}
                    className="flex items-center gap-2 px-5 py-3 bg-white/5 border border-white/20 rounded-xl text-gray-400 hover:text-white hover:border-white/40 transition-all"
                  >
                    <SkipForward className="h-4 w-4" />
                    Skip
                  </motion.button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!isSpeaking && !isListening && !userCaption && !showOptions && !isProcessing && (
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 text-sm mt-6">
            Tap the microphone to speak or type below
          </motion.p>
        )}
      </div>

      {/* Bottom Controls */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/95 to-black/50 backdrop-blur-sm z-20">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-center gap-6 mb-6">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking || isProcessing}
              className={`p-5 rounded-full transition-all ${
                isListening
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isListening ? <MicOff className="h-7 w-7 text-white" /> : <Mic className="h-7 w-7 text-white" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => { setSoundEnabled(!soundEnabled); synthRef.current?.cancel() }}
              className="p-5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-all"
            >
              {soundEnabled ? <Volume2 className="h-7 w-7 text-white" /> : <VolumeX className="h-7 w-7 text-white" />}
            </motion.button>
          </div>

          {currentStepData.type === 'text' && (
            <form onSubmit={handleTextSubmit}>
              <div className="relative">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="Type your answer here..."
                  disabled={isSpeaking || isProcessing}
                  className="w-full px-6 py-4 pr-16 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-orange-500/50 focus:bg-white/15 transition-all disabled:opacity-50"
                />
                <button
                  type="submit"
                  disabled={!textInput.trim() || isSpeaking || isProcessing}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                </button>
              </div>
              <p className="text-center text-xs text-gray-500 mt-2">Press Enter to send</p>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
