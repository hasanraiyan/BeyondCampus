"use client"

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { 
  Plus, 
  ArrowLeft, 
  Search, 
  Edit2, 
  Trash2, 
  BookOpen,
  DollarSign,
  Clock,
  Briefcase
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import ProgramFormModal from '../../../../../components/admin/ProgramFormModal'

export default function ProgramManagementPage() {
  const router = useRouter()
  const params = useParams()
  const universityId = params.id as string
  
  const [university, setUniversity] = useState<any>(null)
  const [programs, setPrograms] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProgram, setEditingProgram] = useState<any>(null)

  useEffect(() => {
    fetchData()
  }, [universityId])

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/universities/${universityId}`)
      if (response.ok) {
        const data = await response.json()
        setUniversity(data)
        setPrograms(data.programs || [])
      }
    } catch (error) {
      console.error('Error fetching university/programs:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this program?')) return
    
    try {
      const response = await fetch(`/api/admin/programs/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setPrograms(prev => prev.filter(p => p.id !== id))
      }
    } catch (error) {
      console.error('Error deleting program:', error)
    }
  }

  const handleOpenCreateModal = () => {
    setEditingProgram(null)
    setIsModalOpen(true)
  }

  const handleOpenEditModal = (program: any) => {
    setEditingProgram(program)
    setIsModalOpen(true)
  }

  const filteredPrograms = programs.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.department?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          Loading programs...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <Link 
            href="/admin/universities" 
            className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors mb-4 text-sm"
          >
            <ArrowLeft className="h-4 w-4" /> Back to Universities
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-lg", university?.logoColor || 'bg-gray-700')}>
                {university?.logo}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white mb-1">Manage Programs</h1>
                <p className="text-gray-400">{university?.name}</p>
              </div>
            </div>
            <Button 
                onClick={handleOpenCreateModal}
                className="bg-primary hover:bg-primary/90 text-white gap-2"
            >
              <Plus className="h-4 w-4" /> Add Program
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search programs..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f0f0f] border-gray-800 focus:border-primary/50 text-white w-full"
            />
          </div>
        </div>

        {/* Programs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPrograms.length === 0 ? (
            <div className="col-span-full py-20 text-center bg-[#0f0f0f] border border-gray-800 rounded-2xl text-gray-500">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No programs found for this university.</p>
            </div>
          ) : (
            filteredPrograms.map((p) => (
              <div key={p.id} className="bg-[#0f0f0f] border border-gray-800 rounded-2xl p-6 hover:border-primary/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-wider rounded border border-primary/20">
                      {p.degreeType}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-2 group-hover:text-primary transition-colors">{p.name}</h3>
                    <p className="text-sm text-gray-500">{p.department || 'General Department'}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleOpenEditModal(p)}
                        className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => handleDelete(p.id)}
                        className="h-8 w-8 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-800/50">
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <Clock className="h-4 w-4 text-gray-600" />
                    <span>Duration: {p.durationMonths ? `${p.durationMonths} Months` : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-400">
                    <DollarSign className="h-4 w-4 text-gray-600" />
                    <span>Tuition: {p.tuitionPerYear ? `$${p.tuitionPerYear.toLocaleString()}/Year` : 'Check Site'}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ProgramFormModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchData}
        universityId={universityId}
        program={editingProgram}
      />
    </div>
  )
}
