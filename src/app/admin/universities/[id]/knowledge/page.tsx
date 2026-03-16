'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Upload,
  FileText,
  CheckCircle2,
  Brain,
  Cpu,
  RefreshCw,
  Library,
  BookOpen,
  Map,
  BadgeDollarSign,
  UsersRound,
  MoreVertical,
  ExternalLink,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

type KnowledgeDocCategory =
  | 'ADMISSIONS'
  | 'COURSES'
  | 'CAMPUS_LIFE'
  | 'SCHOLARSHIPS'
  | 'STAFF';

interface DocStatus {
  id: string;
  category: KnowledgeDocCategory;
  fileName: string;
  embeddedAt: string | null;
  processedAt: string | null;
}

const CATEGORY_LABELS: Record<KnowledgeDocCategory, string> = {
  ADMISSIONS: 'Admissions Requirements & Deadlines',
  COURSES: 'Academic Programs & Degrees',
  CAMPUS_LIFE: 'Campus & Facilities',
  SCHOLARSHIPS: 'Financial Aid & Scholarships',
  STAFF: 'Faculty & Administration',
};

const CATEGORIES: KnowledgeDocCategory[] = [
  'ADMISSIONS',
  'COURSES',
  'CAMPUS_LIFE',
  'SCHOLARSHIPS',
  'STAFF',
];

// Helper to auto-match filenames to categories
const matchCategory = (fileName: string): KnowledgeDocCategory | null => {
  const f = fileName.toLowerCase();
  if (f.includes('admission')) return 'ADMISSIONS';
  if (f.includes('course') || f.includes('program') || f.includes('academic')) return 'COURSES';
  if (f.includes('campus') || f.includes('life') || f.includes('facilit')) return 'CAMPUS_LIFE';
  if (f.includes('scholarship') || f.includes('aid') || f.includes('finance')) return 'SCHOLARSHIPS';
  if (f.includes('staff') || f.includes('faculty') || f.includes('admin')) return 'STAFF';
  return null;
};

export default function KnowledgeIngestionPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [docs, setDocs] = useState<DocStatus[]>([]);
  const [uploadingCategory, setUploadingCategory] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processResult, setProcessResult] = useState<any>(null);
  const [bulkProgress, setBulkProgress] = useState<{ current: number; total: number } | null>(null);

  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const bulkInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDocs();
  }, [id]);

  const fetchDocs = async () => {
    try {
      setIsLoadingDocs(true);
      const res = await fetch(`/api/admin/universities/${id}/knowledge`);
      if (res.ok) {
        const data = await res.json();
        setDocs(data);
      }
    } catch (error) {
      console.error('Failed to fetch docs:', error);
    } finally {
      setIsLoadingDocs(false);
    }
  };

  const getDocForCategory = (category: KnowledgeDocCategory) => {
    return docs.find((d) => d.category === category);
  };

  const uploadFile = async (file: File, category: KnowledgeDocCategory) => {
    const text = await file.text();
    const payload = {
      category,
      content: text,
      fileName: file.name,
    };

    const res = await fetch(`/api/admin/universities/${id}/knowledge`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.message || `Failed to upload ${file.name}`);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    category: KnowledgeDocCategory
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.md')) {
      alert('Only Markdown (.md) files are currently supported.');
      return;
    }

    setUploadingCategory(category);
    try {
      await uploadFile(file, category);
      await fetchDocs();
    } catch (error: any) {
      alert(error.message);
    } finally {
      setUploadingCategory(null);
      if (fileInputRefs.current[category]) {
        fileInputRefs.current[category]!.value = '';
      }
    }
  };

  const handleBulkUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const mdFiles = files.filter(f => f.name.endsWith('.md'));

    if (mdFiles.length === 0) {
      alert('No markdown files found in selection.');
      return;
    }

    setBulkProgress({ current: 0, total: mdFiles.length });
    
    let successCount = 0;
    for (let i = 0; i < mdFiles.length; i++) {
      const file = mdFiles[i];
      const category = matchCategory(file.name);
      
      if (category) {
        try {
          await uploadFile(file, category);
          successCount++;
        } catch (error) {
          console.error(`Bulk upload failed for ${file.name}:`, error);
        }
      }
      setBulkProgress({ current: i + 1, total: mdFiles.length });
    }

    await fetchDocs();
    alert(`Bulk Upload Complete. Successfully matched and vectorized ${successCount} files.`);
    setBulkProgress(null);
    if (bulkInputRef.current) bulkInputRef.current.value = '';
  };

  const handleProcessAll = async () => {
    if (
      !confirm(
        'This will send all knowledge docs to Gemini for unified data extraction (Programs, Scholarships, Campus Intel). Proceed?'
      )
    ) {
      return;
    }

    setIsProcessing(true);
    setProcessResult(null);

    try {
      const res = await fetch(
        `/api/admin/universities/${id}/knowledge/process`,
        { method: 'POST' }
      );
      
      const data = await res.json();
      
      if (res.ok) {
        setProcessResult({ 
          success: true, 
          message: `Intelligence Hub Synced: ${data.stats.programs} programs, ${data.stats.scholarships} scholarships extracted.` 
        });
        await fetchDocs();
      } else {
        setProcessResult({ success: false, message: data.message || 'Failed to process' });
      }
    } catch (error: any) {
      console.error('Error processing docs:', error);
      setProcessResult({ success: false, message: error.message || 'Network error' });
    } finally {
      setIsProcessing(false);
      setTimeout(() => setProcessResult(null), 8000);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-gray-800 text-gray-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1 flex items-center gap-2">
                Knowledge Ingestion
              </h1>
              <p className="text-gray-400">
                Manage and process university documents for AI counselor context
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="file"
              multiple
              className="hidden"
              ref={bulkInputRef}
              onChange={handleBulkUpload}
            />
            <Button
              variant="outline"
              onClick={() => bulkInputRef.current?.click()}
              disabled={bulkProgress !== null}
              className="border-gray-800 text-gray-400 gap-2 font-semibold"
            >
              {bulkProgress ? (
                 <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Matching {bulkProgress.current}/{bulkProgress.total}...
                 </>
              ) : (
                <>
                  <Upload className="h-4 w-4" /> Bulk Upload
                </>
              )}
            </Button>
            <Button 
                onClick={handleProcessAll}
                disabled={isProcessing}
                className="bg-primary hover:bg-primary/90 text-white gap-2 font-bold shadow-lg shadow-primary/10"
            >
              {isProcessing ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Cpu className="h-4 w-4" />
              )}
              {isProcessing ? 'Processing Hub...' : 'Sync with Intelligence AI'}
            </Button>
          </div>
        </div>

        {processResult && (
          <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className={cn(
                    "mb-6 p-4 rounded-xl border flex items-center gap-3 font-semibold shadow-sm",
                    processResult.success 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" 
                        : "bg-red-500/10 border-red-500/20 text-red-400"
                )}
            >
              {processResult.success ? <CheckCircle2 className="h-5 w-5" /> : <RefreshCw className="h-5 w-5" />}
              {processResult.message}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Categories Table */}
        <div className="bg-[#0f0f0f] border border-gray-800 rounded-xl overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-800 bg-[#151515]/50">
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Knowledge Category
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Uploaded Document
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  Vector Status
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">
                  AI Extraction
                </th>
                <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest text-right">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {isLoadingDocs ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-6 py-4 h-16 bg-white/[0.02]" />
                  </tr>
                ))
              ) : (
                CATEGORIES.map((category) => {
                  const doc = getDocForCategory(category);
                  const isUploading = uploadingCategory === category;

                  return (
                    <tr key={category} className="hover:bg-[#151515] transition-colors group">
                      <td className="px-6 py-5">
                        <div className="flex flex-col">
                          <span className="text-white font-bold tracking-tight">
                            {CATEGORY_LABELS[category]}
                          </span>
                          <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5">
                            {category.replace('_', ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5">
                        {doc ? (
                          <div className="flex items-center gap-2 text-gray-300 font-medium">
                            <FileText className="h-4 w-4 text-gray-500" />
                            <span className="truncate max-w-[200px]">{doc.fileName}</span>
                          </div>
                        ) : (
                          <span className="text-gray-600 italic text-sm">No document yet</span>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {doc?.embeddedAt ? (
                          <Badge variant="outline" className="bg-emerald-500/5 text-emerald-500 border-emerald-500/20 font-bold px-2 py-0.5 gap-1.5 uppercase text-[10px]">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                            Vectorized
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/5 text-gray-500 border-gray-500/10 font-bold px-2 py-0.5 uppercase text-[10px]">
                            Pending
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        {doc?.processedAt ? (
                          <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 font-bold px-2 py-0.5 gap-1.5 uppercase text-[10px]">
                            <Brain className="h-3 w-3" />
                            Extracted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-500/5 text-gray-500 border-gray-500/10 font-bold px-2 py-0.5 uppercase text-[10px]">
                            -
                          </Badge>
                        )}
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <input
                            type="file"
                            accept=".md"
                            className="hidden"
                            ref={(el) => {
                              fileInputRefs.current[category] = el;
                            }}
                            onChange={(e) => handleFileUpload(e, category)}
                          />
                          <Button
                            variant="ghost"
                            size="sm"
                            disabled={isUploading || isProcessing}
                            onClick={() => fileInputRefs.current[category]?.click()}
                            className="text-gray-400 hover:text-white hover:bg-white/10 font-bold text-xs gap-2"
                          >
                            {isUploading ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Upload className="h-3 w-3" />
                            )}
                            {doc ? 'Replace' : 'Upload'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-8 border border-amber-500/20 bg-amber-500/5 rounded-xl p-6 flex gap-4 items-start">
            <div className="p-2 rounded-lg bg-amber-500/10">
                <Brain className="h-5 w-5 text-amber-500" />
            </div>
            <div>
                <h4 className="text-amber-500 font-bold mb-1 tracking-tight uppercase text-xs tracking-widest">AI Hub Synchronization</h4>
                <p className="text-gray-400 text-sm leading-relaxed">
                    Once documents are vectorized, they are available for the AI Counselor in chat. Use the <strong>"Sync with Intelligence AI"</strong> button at the top to process 
                    Admissions, Courses, and Scholarships into structured database records.
                </p>
            </div>
        </div>
      </div>
    </div>
  );
}
