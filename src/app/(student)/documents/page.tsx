"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  FileText,
  Upload,
  Download,
  Eye,
  Trash2,
  Search,
  Filter,
  Lock,
  Unlock,
  FolderOpen,
  File,
  FileCheck,
  FileClock,
  Plus,
  Grid,
  List,
  CheckCircle2,
  Clock,
  X
} from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Document {
  id: string
  name: string
  type: 'sop' | 'resume' | 'transcript' | 'lor' | 'other'
  status: 'completed' | 'pending' | 'review'
  size: string
  lastModified: Date
  university?: string
  description?: string
  locked?: boolean
}

const documentCategories = {
  sop: { label: 'Statement of Purpose', color: 'bg-blue-500' },
  resume: { label: 'Resume/CV', color: 'bg-green-500' },
  transcript: { label: 'Transcripts', color: 'bg-purple-500' },
  lor: { label: 'Letters of Recommendation', color: 'bg-orange-500' },
  other: { label: 'Other Documents', color: 'bg-gray-500' }
}

export default function DocumentsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)

  // Mock documents data
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      name: 'Statement of Purpose - Stanford',
      type: 'sop',
      status: 'completed',
      size: '245 KB',
      lastModified: new Date('2024-11-20'),
      university: 'Stanford University',
      description: 'Final version for MS Computer Science application'
    },
    {
      id: '2',
      name: 'Resume_MS_Applications_v3',
      type: 'resume',
      status: 'completed',
      size: '156 KB',
      lastModified: new Date('2024-11-18'),
      description: 'Updated with latest internship experience'
    },
    {
      id: '3',
      name: 'Official_Transcript_Fall2024',
      type: 'transcript',
      status: 'completed',
      size: '1.2 MB',
      lastModified: new Date('2024-11-10'),
      description: 'Official sealed transcript from university',
      locked: true
    },
    {
      id: '4',
      name: 'LOR_Prof_Smith',
      type: 'lor',
      status: 'pending',
      size: '0 KB',
      lastModified: new Date('2024-11-22'),
      description: 'Awaiting letter from Prof. Smith'
    },
    {
      id: '5',
      name: 'Statement of Purpose - MIT',
      type: 'sop',
      status: 'review',
      size: '238 KB',
      lastModified: new Date('2024-11-21'),
      university: 'MIT',
      description: 'Under review - needs final edits'
    },
    {
      id: '6',
      name: 'Financial_Documents',
      type: 'other',
      status: 'completed',
      size: '3.4 MB',
      lastModified: new Date('2024-11-15'),
      description: 'Bank statements and sponsor letters'
    }
  ])

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    } else {
      setLoading(false)
    }
  }, [session, status, router])

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesSearch
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading documents...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-white">
      {/* Header */}
      <div className="border-b border-gray-800 backdrop-blur-sm sticky top-0 z-10" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/workspace')}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Workspace
              </Button>
              <div className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-orange-500" />
                <h1 className="text-xl font-semibold">Document Locker</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                className="bg-orange-500 hover:bg-orange-600"
                onClick={() => {/* Handle upload */}}
              >
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
              className="border-gray-800"
            >
              {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Documents Container */}
        <div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                {filteredDocuments.map((doc) => {
                  const category = documentCategories[doc.type]
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="group relative bg-gray-900/50 rounded-xl p-6 hover:bg-gray-900 transition-all cursor-pointer border border-gray-800"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      {/* Lock Icon */}
                      {doc.locked && (
                        <div className="absolute top-4 right-4">
                          <Lock className="h-4 w-4 text-gray-500" />
                        </div>
                      )}
                      
                      {/* Document Type Badge */}
                      <div className={`inline-flex items-center justify-center w-16 h-16 rounded-lg ${category.color} bg-opacity-20 mb-4`}>
                        <FileText className={`h-8 w-8 ${category.color.replace('bg-', 'text-')}`} />
                      </div>
                      
                      {/* Document Info */}
                      <h4 className="font-semibold text-white mb-1 truncate">{doc.name}</h4>
                      <p className="text-sm text-gray-400 mb-3 truncate">{doc.description}</p>
                      
                      {/* Status Badge */}
                      <div className="flex items-center justify-between mb-3">
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          doc.status === 'completed' 
                            ? 'bg-green-500/20 text-green-500' 
                            : doc.status === 'review'
                            ? 'bg-yellow-500/20 text-yellow-500'
                            : 'bg-gray-500/20 text-gray-500'
                        }`}>
                          {doc.status === 'completed' ? 'Ready' : 
                           doc.status === 'review' ? 'In Review' : 'Pending'}
                        </span>
                        <span className="text-xs text-gray-500">{doc.size}</span>
                      </div>
                      
                      {/* Footer */}
                      <div className="text-xs text-gray-500">
                        Modified {doc.lastModified.toLocaleDateString()}
                      </div>
                      
                      {/* Hover Actions */}
                      <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
                
                {/* Add Document Card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-gray-900/50 rounded-xl p-6 hover:bg-gray-900 transition-all cursor-pointer border border-gray-800 border-dashed flex flex-col items-center justify-center min-h-[200px]"
                  onClick={() => {/* Handle add document */}}
                >
                  <Plus className="h-8 w-8 text-gray-500 mb-2" />
                  <span className="text-gray-400 font-medium">Add Document</span>
                </motion.div>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredDocuments.map((doc) => {
                  const category = documentCategories[doc.type]
                  return (
                    <motion.div
                      key={doc.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-gray-900/50 rounded-lg p-4 hover:bg-gray-900 transition-all cursor-pointer border border-gray-800"
                      onClick={() => setSelectedDocument(doc)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${category.color} bg-opacity-20`}>
                            <FileText className={`h-5 w-5 ${category.color.replace('bg-', 'text-')}`} />
                          </div>
                          <div>
                            <h4 className="font-semibold text-white">{doc.name}</h4>
                            <p className="text-sm text-gray-400">{doc.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            doc.status === 'completed' 
                              ? 'bg-green-500/20 text-green-500' 
                              : doc.status === 'review'
                              ? 'bg-yellow-500/20 text-yellow-500'
                              : 'bg-gray-500/20 text-gray-500'
                          }`}>
                            {doc.status === 'completed' ? 'Ready' : 
                             doc.status === 'review' ? 'In Review' : 'Pending'}
                          </span>
                          <span className="text-sm text-gray-500 min-w-[60px] text-right">{doc.size}</span>
                          <span className="text-sm text-gray-500 min-w-[80px]">
                            {doc.lastModified.toLocaleDateString()}
                          </span>
                          <div className="flex gap-2">
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" className="h-8 w-8">
                              <Download className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
        </div>
      </div>

      {/* Document Detail Modal */}
      {selectedDocument && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-gray-900 rounded-xl p-6 max-w-lg w-full"
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Document Details</h3>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setSelectedDocument(null)}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-gray-400">Name</label>
                <p className="text-white font-medium">{selectedDocument.name}</p>
              </div>
              
              <div>
                <label className="text-sm text-gray-400">Type</label>
                <p className="text-white">{documentCategories[selectedDocument.type].label}</p>
              </div>
              
              {selectedDocument.description && (
                <div>
                  <label className="text-sm text-gray-400">Description</label>
                  <p className="text-white">{selectedDocument.description}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-400">Size</label>
                  <p className="text-white">{selectedDocument.size}</p>
                </div>
                <div>
                  <label className="text-sm text-gray-400">Modified</label>
                  <p className="text-white">{selectedDocument.lastModified.toLocaleDateString()}</p>
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button className="flex-1">
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button variant="outline" className="flex-1">
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}