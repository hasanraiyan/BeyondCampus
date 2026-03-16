"use client"

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowUp, Mic, MicOff, Command } from 'lucide-react'
import { cn } from '@/lib/utils'


interface MayaCommandBarProps {
  context?: 'universities' | 'profile' | 'applications' | 'general'
  onAction?: (action: any) => void
  placeholder?: string
  className?: string
}


export default function MayaCommandBar({ 
  context = 'general', 
  onAction,
  placeholder = "Ask Maya anything or type a command...",
  className
}: MayaCommandBarProps) {

  const [query, setQuery] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)

  // Context-specific suggestions
  const contextSuggestions = {
    universities: [
      "Show me universities in Germany under 20k",
      "Compare MIT vs Stanford for Computer Science",
      "What are the admission requirements for Harvard?",
      "Find universities with strong AI programs"
    ],
    profile: [
      "What documents do I need to upload?",
      "How can I improve my profile?",
      "Calculate my GPA in 4.0 scale"
    ],
    applications: [
      "Show my upcoming deadlines",
      "What's the status of my MIT application?",
      "Generate SOP for Stanford"
    ],
    general: [
      "Take me to universities page",
      "Show my profile",
      "What should I do next?"
    ]
  }

  // Keyboard shortcut (Cmd/Ctrl + K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Update suggestions based on query
  useEffect(() => {
    if (query.length > 0) {
      const filtered = contextSuggestions[context].filter(s => 
        s.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered)
    } else {
      setSuggestions([])
    }
  }, [query, context])

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!query.trim()) return

    // Handle command vs question
    if (query.startsWith('/')) {
      // It's a command
      handleCommand(query)
    } else {
      // It's a question for Maya
      handleQuestion(query)
    }

    setQuery('')
    setSuggestions([])
  }

  const handleCommand = (command: string) => {
    const cmd = command.slice(1).toLowerCase()
    
    const commands: Record<string, () => void> = {
      'universities': () => onAction?.({ type: 'navigate', page: '/universities' }),
      'profile': () => onAction?.({ type: 'navigate', page: '/profile' }),
      'applications': () => onAction?.({ type: 'navigate', page: '/applications' }),
      'help': () => onAction?.({ type: 'show_help' }),
    }

    const action = commands[cmd]
    if (action) {
      action()
    } else {
      onAction?.({ type: 'unknown_command', command: cmd })
    }
  }

  const handleQuestion = (question: string) => {
    onAction?.({ type: 'question', content: question, context })
  }

  return (
    <div className={cn("relative w-full max-w-4xl mx-auto", className)}>

      <motion.div
        initial={false}
        animate={{
          boxShadow: isFocused 
            ? '0 0 0 2px rgba(255, 255, 255, 0.1)' 
            : 'none'
        }}
        className="relative bg-[#202123] rounded-full border border-gray-600/50 overflow-hidden"
      >
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex items-center">
            {/* Input */}
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 200)}
              placeholder={placeholder}
              className="flex-1 py-4 px-6 bg-transparent text-gray-100 placeholder-gray-500 focus:outline-none text-lg"
            />

            {/* Right side controls */}
            <div className="flex items-center pr-4">
              {/* Submit button - ChatGPT style */}
              <button
                type="submit"
                disabled={!query.trim()}
                className={`p-2.5 rounded-full transition-all ${
                  query.trim()
                    ? 'bg-white text-black hover:bg-gray-100' 
                    : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                }`}
              >
                <ArrowUp className="w-6 h-6" />
              </button>
            </div>
          </div>
        </form>

        {/* Suggestions dropdown */}
        <AnimatePresence>
          {suggestions.length > 0 && isFocused && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full left-0 right-0 mt-2 bg-[#2f2f2f] rounded-2xl shadow-xl overflow-hidden z-50"
            >
              {suggestions.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setQuery(suggestion)
                    handleSubmit()
                  }}
                  className="w-full px-6 py-4 text-left text-gray-300 hover:bg-[#3f3f3f] transition-colors text-base"
                >
                  {suggestion}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

    </div>
  )
}