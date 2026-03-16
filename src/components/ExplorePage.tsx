"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Search,
  GraduationCap,
  ChevronRight,
  MapPin,
  Zap,
  Home,
  Compass,
  Plus
} from "lucide-react"
import { cn } from '@/lib/utils'
import type { LucideIcon } from "lucide-react"

interface Person {
  id: string
  name: string
  role: string
  company: string
  location: string
  avatar?: string
  category: "mentor" | "student" | "counselor" | "alumni"
  bio: string
}

export default function ExplorePage() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedFilter, setSelectedFilter] = useState("All")

  // Sample people data
  const people: Person[] = [
    {
      id: "1",
      name: "Sarah Chen",
      role: "Product Manager",
      company: "Google",
      location: "Mountain View, CA",
      category: "mentor",
      bio: "Former Stanford CS student, now leading product teams at Google. Love helping students navigate tech careers!"
    },
    {
      id: "2",
      name: "Marcus Johnson",
      role: "Senior Software Engineer",
      company: "Meta",
      location: "Seattle, WA",
      category: "mentor",
      bio: "Full-stack engineer passionate about mentoring. Specialized in system design and career transitions."
    },
    {
      id: "3",
      name: "Emily Rodriguez",
      role: "Graduate Student",
      company: "MIT",
      location: "Cambridge, MA",
      category: "student",
      bio: "PhD candidate in AI/ML. Happy to share insights about graduate school and research opportunities."
    },
    {
      id: "4",
      name: "Dr. Michael Park",
      role: "Admissions Director",
      company: "Stanford University",
      location: "Stanford, CA",
      category: "counselor",
      bio: "15+ years in admissions. Expert in holistic application review and essay guidance."
    },
    {
      id: "5",
      name: "Alex Kumar",
      role: "Data Scientist",
      company: "Netflix",
      location: "Los Angeles, CA",
      category: "alumni",
      bio: "UC Berkeley alum working in entertainment tech. Passionate about data science and analytics careers."
    },
    {
      id: "6",
      name: "Jessica Wu",
      role: "Investment Banking Analyst",
      company: "Goldman Sachs",
      location: "New York, NY",
      category: "mentor",
      bio: "Wharton MBA helping students break into finance. Specialized in investment banking and consulting prep."
    }
  ]

  const categories = [
    { id: "mentors", title: "Mentors & Industry Experts", people: people.filter(p => p.category === "mentor") },
    { id: "students", title: "Current Students", people: people.filter(p => p.category === "student") },
    { id: "counselors", title: "Admissions Counselors", people: people.filter(p => p.category === "counselor") },
    { id: "alumni", title: "Alumni Network", people: people.filter(p => p.category === "alumni") },
  ]

  const handlePersonClick = (person: Person) => {
    router.push(`/person/${person.id}`)
  }

  const PersonCard = ({ person }: { person: Person }) => (
    <div
      className="group relative bg-[#151515] rounded-2xl border border-gray-800/50 overflow-hidden hover:bg-[#1a1a1a] hover:border-gray-700 hover:shadow-2xl transition-all duration-300 ease-out cursor-pointer flex shrink-0"
      onClick={() => handlePersonClick(person)}
      style={{ width: '480px', height: '160px' }}
    >
      <div className="w-[140px] h-[160px] shrink-0 p-4 bg-orange-500/5 relative flex items-center justify-center">
        <Avatar className="h-20 w-20 ring-4 ring-orange-500/10 transition-all group-hover:ring-orange-500/20">
          <AvatarFallback className="bg-orange-500/10 text-orange-500 text-2xl font-bold">
            {person.name.split(" ").map(n => n[0]).join("")}
          </AvatarFallback>
        </Avatar>
      </div>
      <div className="flex-1 p-5 flex flex-col justify-center">
        <h3 className="font-bold text-white text-[19px] leading-tight mb-1 group-hover:text-orange-500 transition-colors">
          {person.name}
        </h3>
        <p className="text-gray-400 text-[14px] mb-2 font-medium">
          {person.role} <span className="text-gray-600">@</span> {person.company}
        </p>
        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <MapPin className="h-3.5 w-3.5" />
          <span>{person.location}</span>
        </div>
        <p className="text-gray-400 text-[13px] leading-relaxed line-clamp-2 italic">
          "{person.bio}"
        </p>
      </div>
    </div>
  )

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="bg-[#0a0a0a]">
          <div className="px-8 py-12">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  Explore AI Twins
                </h1>
                <p className="text-lg text-gray-400 font-medium">
                  Connect with AI twins of mentors, students, and industry experts
                </p>
              </div>

              <div className="relative w-[450px]">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500" />
                <Input
                  type="text"
                  placeholder="Search people, skills, companies..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-12 h-14 bg-[#151515] border-gray-800 focus:border-orange-500/50 transition-all rounded-2xl text-base shadow-xl"
                />
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-3">
              {['All', 'Mentors', 'Students', 'Counselors', 'Alumni'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={cn(
                    "px-6 py-2.5 rounded-full text-sm font-semibold transition-all duration-300",
                    selectedFilter === filter
                      ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                      : "bg-[#151515] text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800"
                  )}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto bg-[#050505]">
          <div className="p-8">
            <section className="mb-20">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Zap className="h-6 w-6 text-orange-500 animate-pulse" />
                  Featured AI Twins
                </h2>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
              <div className="relative overflow-x-hidden">
                <div 
                  className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide -mx-8 px-8"
                  style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                  {people.slice(0, 5).map((person) => (
                    <PersonCard key={person.id} person={person} />
                  ))}
                </div>
              </div>
            </section>

            {categories.map((category) => (
              <section key={category.id} className="mb-20">
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-bold text-white">{category.title}</h2>
                  <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                    View all <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
                <div className="relative overflow-x-hidden">
                  <div 
                    className="flex gap-4 overflow-x-auto pb-8 scrollbar-hide -mx-8 px-8"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                  >
                    {category.people.map((person) => (
                      <PersonCard key={person.id} person={person} />
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
