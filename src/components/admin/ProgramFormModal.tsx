"use client"

import { useState, useEffect } from 'react'
import { 
  X, 
  Save, 
  BookOpen, 
  Building2, 
  GraduationCap, 
  Calendar, 
  CircleDollarSign 
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface ProgramFormModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  universityId: string
  program?: any
}

export default function ProgramFormModal({ 
  isOpen, 
  onClose, 
  onSuccess, 
  universityId, 
  program 
}: ProgramFormModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    department: '',
    degreeType: 'MS',
    durationMonths: '',
    tuitionPerYear: '',
  })

  useEffect(() => {
    if (program) {
      setFormData({
        name: program.name || '',
        department: program.department || '',
        degreeType: program.degreeType || 'MS',
        durationMonths: program.durationMonths?.toString() || '',
        tuitionPerYear: program.tuitionPerYear?.toString() || '',
      })
    } else {
      setFormData({
        name: '',
        department: '',
        degreeType: 'MS',
        durationMonths: '',
        tuitionPerYear: '',
      })
    }
  }, [program, isOpen])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        durationMonths: parseInt(formData.durationMonths) || null,
        tuitionPerYear: parseFloat(formData.tuitionPerYear) || null,
      }

      const url = program 
        ? `/api/admin/programs/${program.id}` 
        : `/api/admin/universities/${universityId}/programs`
      
      const method = program ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        onSuccess()
        onClose()
      } else {
        const error = await response.json()
        alert(error.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error saving program:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const labelStyle = "block text-sm font-medium text-gray-400 mb-2"
  const inputStyle = "bg-[#050505] border-gray-800 text-white focus:border-primary/50"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      <div className="relative bg-[#0f0f0f] border border-gray-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between bg-[#151515]">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            {program ? 'Edit Program' : 'Add New Program'}
          </h2>
          <Button variant="ghost" size="icon" onClick={onClose} className="text-gray-500 hover:text-white">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className={labelStyle}>Program Name</label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                name="name" 
                value={formData.name} 
                onChange={handleChange} 
                required 
                className={cn(inputStyle, "pl-10")} 
                placeholder="e.g. MS in Computer Science" 
              />
            </div>
          </div>

          <div>
            <label className={labelStyle}>Department</label>
            <div className="relative">
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                name="department" 
                value={formData.department} 
                onChange={handleChange} 
                className={cn(inputStyle, "pl-10")} 
                placeholder="e.g. School of Engineering" 
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelStyle}>Degree Type</label>
              <select 
                name="degreeType" 
                value={formData.degreeType} 
                onChange={handleChange} 
                className={cn(inputStyle, "w-full rounded-md h-10 px-3 py-2 text-sm outline-none border focus:border-primary/50 transition-all")}
              >
                <option value="BS">BS (Bachelors)</option>
                <option value="MS">MS (Masters)</option>
                <option value="MBA">MBA</option>
                <option value="PHD">PhD</option>
                <option value="ASSOCIATE">Associate</option>
                <option value="CERTIFICATE">Certificate</option>
              </select>
            </div>
            <div>
              <label className={labelStyle}>Duration (Months)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                <Input 
                  name="durationMonths" 
                  type="number" 
                  value={formData.durationMonths} 
                  onChange={handleChange} 
                  className={cn(inputStyle, "pl-10")} 
                  placeholder="e.g. 24" 
                />
              </div>
            </div>
          </div>

          <div>
            <label className={labelStyle}>Tuition per Year ($)</label>
            <div className="relative">
              <CircleDollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <Input 
                name="tuitionPerYear" 
                type="number" 
                step="0.01" 
                value={formData.tuitionPerYear} 
                onChange={handleChange} 
                className={cn(inputStyle, "pl-10")} 
                placeholder="e.g. 55000" 
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1 border-gray-800 text-gray-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white gap-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {program ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
