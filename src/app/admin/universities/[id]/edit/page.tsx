"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import UniversityForm from '@/components/admin/UniversityForm'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function EditUniversityPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [university, setUniversity] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await fetch(`/api/universities/${id}`)
        if (response.ok) {
          const data = await response.json()
          setUniversity(data)
        }
      } catch (error) {
        console.error('Error fetching university:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (id) {
      fetchUniversity()
    }
  }, [id])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin mb-4" />
        <div className="text-gray-400 font-medium animate-pulse">Retrieving University Profile...</div>
      </div>
    )
  }

  if (!university) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">😕</div>
          <h2 className="text-xl font-bold text-white mb-2">Profile Not Found</h2>
          <p className="text-gray-500 mb-6">The university you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/admin/universities')} variant="outline">
            Back to Directory
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#050505]">
      <div className="max-w-[1600px] mx-auto">
        <UniversityForm initialData={university} isEditing={true} />
      </div>
    </div>
  )
}
