"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  Save, 
  X, 
  Info, 
  Layers, 
  MapPin, 
  Globe, 
  Trophy, 
  Users, 
  UserCircle,
  Settings,
  Image as ImageIcon,
  GraduationCap,
  Sparkles,
  ChevronLeft
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'

interface UniversityFormProps {
  initialData?: any
  isEditing?: boolean
}

export default function UniversityForm({ initialData, isEditing = false }: UniversityFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    type: initialData?.type || 'PRIVATE',
    website: initialData?.website || '',
    logo: initialData?.logo || '',
    logoColor: initialData?.logoColor || 'bg-primary',
    description: initialData?.description || '',
    specialties: initialData?.specialties?.join(', ') || '',
    ranking: initialData?.ranking || '',
    qsRanking: initialData?.qsRanking || '',
    acceptanceRate: initialData?.acceptanceRate || '',
    enrollmentSize: initialData?.enrollmentSize || '',
    counselorName: initialData?.counselorName || '',
    counselorTitle: initialData?.counselorTitle || '',
    category: initialData?.category || 'tech',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const payload = {
        ...formData,
        id: initialData?.id,
        ranking: parseInt(formData.ranking.toString()) || null,
        enrollmentSize: parseInt(formData.enrollmentSize.toString()) || null,
        acceptanceRate: parseFloat(formData.acceptanceRate.toString()) || null,
        specialties: formData.specialties.split(',').map((s: string) => s.trim()).filter((s: string) => s !== ''),
      }

      const url = isEditing ? `/api/admin/universities/${initialData.id}` : '/api/admin/universities'
      const method = isEditing ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        router.push('/admin/universities')
        router.refresh()
      } else {
        const error = await response.json()
        alert(error.message || 'Something went wrong')
      }
    } catch (error) {
      console.error('Error saving university:', error)
      alert('Failed to save university profile')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const labelStyle = "block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2"
  const inputStyle = "bg-[#111111] border-gray-800 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 h-12 rounded-xl transition-all"
  const sectionCardStyle = "bg-[#0c0c0c] border border-gray-800/50 rounded-2xl p-8 shadow-xl"

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-screen overflow-hidden">
      {/* Premium Header */}
      <div className="shrink-0 px-8 py-6 border-b border-gray-800/50 bg-[#050505]/80 backdrop-blur-xl flex items-center justify-between z-20">
        <div className="flex items-center gap-6">
          <Button 
            type="button" 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="rounded-full hover:bg-white/5 text-gray-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-white tracking-tight">
                {isEditing ? 'Workspace Profile' : 'New University'}
              </h1>
              {isEditing && (
                <div className="px-2 py-0.5 rounded-md bg-primary/10 border border-primary/20 text-[10px] font-bold text-primary uppercase tracking-widest">
                  Editing Mode
                </div>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-0.5">Configure institutional presence and admissions intelligence</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-4 hidden md:block">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">Target Entity</p>
            <p className="text-sm font-bold text-white truncate max-w-[200px]">{formData.name || 'Untitled University'}</p>
          </div>
          <Button 
            type="submit" 
            disabled={loading}
            className="bg-primary hover:bg-primary/90 text-white font-bold h-12 px-8 rounded-xl shadow-lg shadow-primary/20 transition-all active:scale-95 group"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <Save className="h-5 w-5 mr-2 group-hover:rotate-6 transition-transform" />
                {isEditing ? 'Publish Changes' : 'Initialize Profile'}
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto px-8 py-10 scrollbar-hide">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="bg-[#0f0f0f] border border-gray-800/50 p-1 rounded-xl mb-10 h-14 w-full justify-start gap-2 max-w-fit px-2">
              <TabsTrigger value="general" className="rounded-lg px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm">
                General
              </TabsTrigger>
              <TabsTrigger value="branding" className="rounded-lg px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm">
                Branding
              </TabsTrigger>
              <TabsTrigger value="academic" className="rounded-lg px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm">
                Academic
              </TabsTrigger>
              <TabsTrigger value="admissions" className="rounded-lg px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm">
                Admissions
              </TabsTrigger>
              <TabsTrigger value="content" className="rounded-lg px-6 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm">
                Content
              </TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={sectionCardStyle}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-blue-500/10 text-blue-500">
                    <Info className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Institutional Identity</h3>
                    <p className="text-gray-500 text-sm">Basic directory information for the system</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Institutional Name</label>
                    <Input name="name" value={formData.name} onChange={handleChange} required className={inputStyle} placeholder="Full legal name of the university" />
                  </div>
                  <div>
                    <label className={labelStyle}>City</label>
                    <Input name="city" value={formData.city} onChange={handleChange} required className={inputStyle} placeholder="Location city" />
                  </div>
                  <div>
                    <label className={labelStyle}>State / Province Code</label>
                    <Input name="state" value={formData.state} onChange={handleChange} required className={inputStyle} placeholder="e.g. CA, NY, MA" />
                  </div>
                  <div>
                    <label className={labelStyle}>Entity Type</label>
                    <select name="type" value={formData.type} onChange={handleChange} className={cn(inputStyle, "w-full rounded-xl px-4 text-sm font-medium focus:ring-1 appearance-none bg-[#111111]")}>
                      <option value="PRIVATE">Private Research Institute</option>
                      <option value="PUBLIC">Public State University</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelStyle}>Official Portal</label>
                    <Input name="website" type="url" value={formData.website} onChange={handleChange} className={inputStyle} placeholder="https://university.edu" />
                  </div>
                  <div>
                    <label className={labelStyle}>System Classification</label>
                    <Input name="category" value={formData.category} onChange={handleChange} className={inputStyle} placeholder="e.g. ivy, tech, public" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="branding" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={sectionCardStyle}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-500">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Visual Workspace Identity</h3>
                    <p className="text-gray-500 text-sm">How the university appears in discovery and chats</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className={labelStyle}>Card Iconography (Logo Text)</label>
                    <Input name="logo" value={formData.logo} onChange={handleChange} className={inputStyle} placeholder="e.g. MIT, H, UCB" />
                    <p className="text-[10px] text-gray-500 mt-2 font-medium">Short acronym or single character for the brand avatar</p>
                  </div>
                  <div>
                    <label className={labelStyle}>Identity Signature (Tailwind Color)</label>
                    <Input name="logoColor" value={formData.logoColor} onChange={handleChange} className={inputStyle} placeholder="e.g. bg-red-600, bg-blue-900" />
                    <p className="text-[10px] text-gray-500 mt-2 font-medium">Primary brand color class for visual consistency</p>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="academic" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={sectionCardStyle}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-500">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Analytics & Prestige</h3>
                    <p className="text-gray-500 text-sm">Key academic metrics and global standings</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className={labelStyle}>National Rank</label>
                    <Input name="ranking" type="number" value={formData.ranking} onChange={handleChange} className={inputStyle} placeholder="e.g. 1" />
                  </div>
                  <div>
                    <label className={labelStyle}>Global Standing (QS Ranking)</label>
                    <Input name="qsRanking" value={formData.qsRanking} onChange={handleChange} className={inputStyle} placeholder="e.g. #1 QS World Rankings" />
                  </div>
                  <div>
                    <label className={labelStyle}>Acceptance Rate (%)</label>
                    <Input name="acceptanceRate" value={formData.acceptanceRate} onChange={handleChange} className={inputStyle} placeholder="e.g. 4.1" />
                  </div>
                  <div>
                    <label className={labelStyle}>Student Body Size</label>
                    <Input name="enrollmentSize" type="number" value={formData.enrollmentSize} onChange={handleChange} className={inputStyle} placeholder="e.g. 15000" />
                  </div>
                  <div className="md:col-span-2">
                    <label className={labelStyle}>Academic Specializations</label>
                    <Input name="specialties" value={formData.specialties} onChange={handleChange} className={inputStyle} placeholder="e.g. Computer Science, AI, Bio Engineering" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="admissions" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={sectionCardStyle}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-orange-500/10 text-orange-500">
                    <UserCircle className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Intelligence Contact</h3>
                    <p className="text-gray-500 text-sm">Lead admissions representative for AI interaction</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className={labelStyle}>Contact Name</label>
                    <Input name="counselorName" value={formData.counselorName} onChange={handleChange} className={inputStyle} placeholder="e.g. Dr. Sarah Miller" />
                  </div>
                  <div>
                    <label className={labelStyle}>Position / Title</label>
                    <Input name="counselorTitle" value={formData.counselorTitle} onChange={handleChange} className={inputStyle} placeholder="e.g. Director of Global Recruitment" />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="content" className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className={sectionCardStyle}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">Institutional Narrative</h3>
                    <p className="text-gray-500 text-sm">Rich description for search and generation</p>
                  </div>
                </div>

                <div>
                  <label className={labelStyle}>Full University Profile</label>
                  <Textarea 
                    name="description" 
                    value={formData.description} 
                    onChange={handleChange} 
                    rows={12} 
                    className={cn(inputStyle, "resize-none p-6 leading-relaxed")} 
                    placeholder="Provide a comprehensive overview of the university's prestige, campus life, and unique researcher opportunities..." 
                  />
                  <div className="flex justify-between items-center mt-4">
                    <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest leading-none">AI Training Content</p>
                    <p className="text-[10px] text-gray-500 font-bold leading-none">{formData.description.length} characters</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview Sidebar */}
        <div className="w-[450px] shrink-0 border-l border-gray-800/50 bg-[#080808] p-10 overflow-y-auto hidden xl:block">
          <div className="sticky top-0">
            <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-10 border-b border-gray-800/50 pb-4">Real-time Interface Preview</h4>
            
            <div className="space-y-12">
              {/* Card Preview */}
              <div>
                <p className="text-xs font-bold text-gray-400 mb-6 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Discovery Card
                </p>
                <div className="group relative bg-[#0f0f0f] rounded-2xl border border-gray-800/50 overflow-hidden shadow-2xl flex w-full h-[160px]">
                  <div className="w-[130px] h-[160px] shrink-0 p-3">
                    <div className={cn(
                      "w-full h-full rounded-xl flex items-center justify-center shadow-lg transition-colors duration-500",
                      formData.logoColor || 'bg-primary'
                    )}>
                      <span className="text-white font-bold text-3xl drop-shadow-lg">{formData.logo || '?'}</span>
                    </div>
                  </div>
                  <div className="flex-1 pl-4 pr-5 py-6 flex flex-col justify-center">
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-[19px] leading-tight mb-2 truncate">
                        {formData.name || 'University Name'}
                      </h3>
                      <p className="text-[#9CA3AF] text-[14px] mb-2 flex items-center gap-1">
                        <MapPin className="h-3 w-3" /> {formData.city}, {formData.state}
                      </p>
                      <p className="text-[#B0B7C3] text-[13px] leading-relaxed line-clamp-2">
                        {formData.description || 'Provide a description to see it here...'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Preview */}
              <div className="bg-[#0f0f0f] rounded-2xl border border-gray-800/50 p-6">
                <p className="text-xs font-bold text-gray-400 mb-6">Analytic Summary</p>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Rank</p>
                    <p className="text-lg font-bold text-white">#{formData.ranking || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">QS World</p>
                    <p className="text-lg font-bold text-white truncate">{formData.qsRanking?.split(' ').pop() || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Acceptance</p>
                    <p className="text-lg font-bold text-white">{formData.acceptanceRate || '—'}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Enrollment</p>
                    <p className="text-lg font-bold text-white">{formData.enrollmentSize ? parseInt(formData.enrollmentSize.toString()).toLocaleString() : '—'}</p>
                  </div>
                </div>
              </div>

              {/* Counselor Preview */}
              <div className="flex items-center gap-4 bg-[#111111] p-5 rounded-2xl border border-gray-800/50">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <UserCircle className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">{formData.counselorName || 'Admissions Rep'}</p>
                  <p className="text-xs text-gray-500 italic mt-0.5">{formData.counselorTitle || 'Pending configuration'}</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-blue-500/5 border border-blue-500/10">
                <p className="text-[11px] leading-relaxed text-blue-400/80 font-medium">
                  <Info className="h-3 w-3 inline mr-2" />
                  Visual changes in the identity workspace will reflect instantly in student discovery carousels.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  )
}
