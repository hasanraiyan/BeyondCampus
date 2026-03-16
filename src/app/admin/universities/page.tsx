"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Search, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  ExternalLink,
  GraduationCap,
  Filter,
  ArrowUpDown
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

export default function UniversitiesListing() {
  const [universities, setUniversities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchUniversities()
  }, [])

  const fetchUniversities = async () => {
    try {
      const response = await fetch('/api/universities')
      if (response.ok) {
        const data = await response.json()
        setUniversities(data)
      }
    } catch (error) {
      console.error('Error fetching universities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this university? This action cannot be undone.')) return
    
    try {
      const response = await fetch(`/api/admin/universities/${id}`, { method: 'DELETE' })
      if (response.ok) {
        setUniversities(prev => prev.filter(u => u.id !== id))
      }
    } catch (error) {
      console.error('Error deleting university:', error)
    }
  }

  const filteredUniversities = universities.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         u.city.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesFilter = filter === 'all' || u.category === filter
    return matchesSearch && matchesFilter
  })

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Universities</h1>
            <p className="text-gray-400">Manage all university profiles and their programs</p>
          </div>
          <Link href="/admin/universities/create">
            <Button className="bg-primary hover:bg-primary/90 text-white gap-2">
              <Plus className="h-4 w-4" /> Add University
            </Button>
          </Link>
        </div>

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
            <Input 
              placeholder="Search universities..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#0f0f0f] border-gray-800 focus:border-primary/50 transition-all text-white w-full"
            />
          </div>
          <div className="flex gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="border-gray-800 text-gray-400 gap-2">
                  <Filter className="h-4 w-4" /> Filter: {filter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-gray-800 text-white">
                <DropdownMenuItem onClick={() => setFilter('all')}>All Categories</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('tech')}>Tech</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('ivy')}>Ivy League</DropdownMenuItem>
                <DropdownMenuItem onClick={() => setFilter('public')}>Public</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table/List View */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-800 bg-[#151515]/50">
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">University</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Ranking</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Programs</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Location</th>
                <th className="px-6 py-4 text-sm font-semibold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex items-center justify-center gap-3">
                      <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                      Loading universities...
                    </div>
                  </td>
                </tr>
              ) : filteredUniversities.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    No universities found.
                  </td>
                </tr>
              ) : (
                filteredUniversities.map((u) => (
                  <tr key={u.id} className="hover:bg-[#151515] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold", u.logoColor || 'bg-gray-700')}>
                          {u.logo}
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-primary transition-colors">{u.name}</p>
                          <p className="text-xs text-gray-500 capitalize">{u.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      #{u.ranking || 'N/A'}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {u._count?.programs || 0} Programs
                    </td>
                    <td className="px-6 py-4 text-gray-500 text-sm">
                      {u.city}, {u.state}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link href={`/admin/universities/${u.id}/edit`}>
                          <Button variant="ghost" size="icon" className="hover:text-white hover:bg-white/10 h-8 w-8">
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:text-white hover:bg-white/10 h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-[#0f0f0f] border-gray-800 text-white">
                            <Link href={`/admin/universities/${u.id}/programs`}>
                              <DropdownMenuItem className="gap-2 cursor-pointer">
                                <GraduationCap className="h-4 w-4" /> Manage Programs
                              </DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem className="gap-2" onClick={() => window.open(u.website, '_blank')}>
                              <ExternalLink className="h-4 w-4" /> Visit Website
                            </DropdownMenuItem>
                            <DropdownMenuItem className="gap-2 text-red-400 focus:text-red-400 focus:bg-red-500/10" onClick={() => handleDelete(u.id)}>
                              <Trash2 className="h-4 w-4" /> Delete Profile
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
