'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  ChevronLeft,
  AlertTriangle,
  Trash2,
  ExternalLink,
  CheckCircle2,
  BadgeCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface UniversityFormProps {
  initialData?: any;
  isEditing?: boolean;
}

export default function UniversityForm({
  initialData,
  isEditing = false,
}: UniversityFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
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
  });

  // Track changes to show "Unsaved Changes" indicator
  useEffect(() => {
    if (!initialData) return;
    const isDifferent = Object.keys(formData).some((key) => {
      const val = formData[key as key_of_formData];
      const initVal =
        key === 'specialties' ? initialData[key]?.join(', ') : initialData[key];
      return val !== (initVal || '');
    });
    setHasChanges(isDifferent);
  }, [formData, initialData]);

  type key_of_formData = keyof typeof formData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        id: initialData?.id,
        ranking: parseInt(formData.ranking.toString()) || null,
        enrollmentSize: parseInt(formData.enrollmentSize.toString()) || null,
        acceptanceRate: parseFloat(formData.acceptanceRate.toString()) || null,
        specialties: formData.specialties
          .split(',')
          .map((s: string) => s.trim())
          .filter((s: string) => s !== ''),
      };

      const url = isEditing
        ? `/api/admin/universities/${initialData.id}`
        : '/api/admin/universities';
      const method = isEditing ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setHasChanges(false);
        router.push('/admin/universities');
        router.refresh();
      } else {
        const error = await response.json();
        alert(error.message || 'Something went wrong');
      }
    } catch (error) {
      console.error('Error saving university:', error);
      alert('Failed to save university profile');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (
      !confirm(
        'Are you absolutely sure you want to delete this university? This action cannot be undone.'
      )
    )
      return;

    setLoading(true);
    try {
      const response = await fetch(
        `/api/admin/universities/${initialData.id}`,
        { method: 'DELETE' }
      );
      if (response.ok) {
        router.push('/admin/universities');
        router.refresh();
      }
    } catch (error) {
      console.error('Delete error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const labelStyle =
    'block text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-3';
  const inputStyle =
    'bg-[#111111] border-gray-800 text-white focus:border-primary/50 focus:ring-1 focus:ring-primary/20 h-14 rounded-2xl transition-all placeholder:text-gray-700 font-medium px-5';
  const sectionCardStyle =
    'bg-[#0c0c0c] border border-gray-800/50 rounded-3xl p-10 shadow-2xl relative overflow-hidden group';

  const TabContentWrapper = ({ children }: { children: React.ReactNode }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
      className="space-y-8"
    >
      {children}
    </motion.div>
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col h-screen overflow-hidden bg-[#050505] selection:bg-primary/30"
    >
      {/* Premium Header */}
      <div className="shrink-0 px-8 py-6 border-b border-gray-800/30 bg-[#050505]/70 backdrop-blur-2xl flex items-center justify-between z-30">
        <div className="flex items-center gap-8">
          <Button
            type="button"
            variant="outline"
            size="icon"
            onClick={() => router.back()}
            className="rounded-2xl border-gray-800 h-12 w-12 hover:bg-white/5 text-gray-400 hover:text-white transition-all hover:scale-105 active:scale-95"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <div className="relative">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-black text-white tracking-tight">
                {isEditing ? 'Workspace Profile' : 'New University'}
              </h1>
              {hasChanges && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center gap-1.5"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                    Unsaved Changes
                  </span>
                </motion.div>
              )}
            </div>
            <p className="text-gray-500 text-sm mt-1 font-medium italic">
              institutional identity and machine learning training
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right mr-6 hidden 2xl:block">
            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] mb-1">
              Active Target
            </p>
            <div className="flex items-center justify-end gap-2">
              <span className="text-sm font-bold text-white truncate max-w-[250px]">
                {formData.name || 'Untitled Entity'}
              </span>
              <div
                className={cn(
                  'w-2 h-2 rounded-full',
                  formData.name
                    ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                    : 'bg-gray-800'
                )}
              />
            </div>
          </div>
          {isEditing && (
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push(`/admin/universities/${initialData.id}/knowledge`)}
              className="mr-2 border-primary/20 hover:bg-primary/10 text-primary transition-all rounded-2xl h-14 px-6 font-bold"
            >
              Manage Knowledge
            </Button>
          )}
          <Button
            type="submit"
            disabled={loading || (!hasChanges && isEditing)}
            className={cn(
              'font-black h-14 px-10 rounded-2xl shadow-2xl transition-all active:scale-95 group relative overflow-hidden',
              hasChanges || !isEditing
                ? 'bg-primary text-black hover:bg-primary/90 shadow-primary/20'
                : 'bg-gray-900 text-gray-500 cursor-not-allowed border border-gray-800'
            )}
          >
            {loading ? (
              <div className="w-6 h-6 border-3 border-black/20 border-t-black rounded-full animate-spin" />
            ) : (
              <div className="flex items-center gap-3">
                <Save className="h-5 w-5 transition-transform group-hover:rotate-12" />
                <span className="tracking-tight">
                  {isEditing ? 'Sync Profile' : 'Initialize Entity'}
                </span>
              </div>
            )}
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex">
        {/* Main Form Content */}
        <div className="flex-1 overflow-y-auto px-12 py-12 scrollbar-hide">
          <Tabs defaultValue="general" className="w-full">
            <div className="flex items-center justify-between mb-12">
              <TabsList className="bg-[#0f0f0f] border border-gray-800/50 p-2 rounded-2xl h-16 gap-2">
                <TabsTrigger
                  value="general"
                  className="rounded-xl px-8 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm transition-all h-full"
                >
                  General
                </TabsTrigger>
                <TabsTrigger
                  value="branding"
                  className="rounded-xl px-8 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm transition-all h-full"
                >
                  Branding
                </TabsTrigger>
                <TabsTrigger
                  value="academic"
                  className="rounded-xl px-8 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm transition-all h-full"
                >
                  Academic
                </TabsTrigger>
                <TabsTrigger
                  value="admissions"
                  className="rounded-xl px-8 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm transition-all h-full"
                >
                  Admissions
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="rounded-xl px-8 data-[state=active]:bg-gray-800 data-[state=active]:text-white font-bold text-sm transition-all h-full"
                >
                  Training
                </TabsTrigger>
                {isEditing && (
                  <TabsTrigger
                    value="danger"
                    className="rounded-xl px-8 data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500 font-bold text-sm transition-all h-full text-gray-600 hover:text-red-400"
                  >
                    <AlertTriangle className="h-4 w-4 mr-2" />
                    Danger
                  </TabsTrigger>
                )}
              </TabsList>
            </div>

            <AnimatePresence mode="wait">
              <TabsContent value="general" key="general" className="mt-0">
                <TabContentWrapper>
                  <div className={sectionCardStyle}>
                    <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                      <GraduationCap className="h-32 w-32 -rotate-12" />
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3.5 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20">
                        <Info className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                          Institutional Identity
                        </h3>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                          Core registry data and domain mapping
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="md:col-span-2">
                        <label className={labelStyle}>
                          Full Institutional Name
                        </label>
                        <Input
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                          className={inputStyle}
                          placeholder="e.g. Stanford University"
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>Location City</label>
                        <Input
                          name="city"
                          value={formData.city}
                          onChange={handleChange}
                          required
                          className={inputStyle}
                          placeholder="e.g. Palo Alto"
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>
                          State / Province Code
                        </label>
                        <Input
                          name="state"
                          value={formData.state}
                          onChange={handleChange}
                          required
                          className={inputStyle}
                          placeholder="e.g. CA"
                        />
                      </div>
                      <div>
                        <label className={labelStyle}>
                          Resource Classification
                        </label>
                        <div className="relative group/select">
                          <select
                            name="type"
                            value={formData.type}
                            onChange={handleChange}
                            className={cn(
                              inputStyle,
                              'w-full appearance-none bg-[#111111] font-bold cursor-pointer pr-12'
                            )}
                          >
                            <option value="PRIVATE">
                              Private Research Body
                            </option>
                            <option value="PUBLIC">Public State Entity</option>
                          </select>
                          <ChevronLeft className="h-4 w-4 absolute right-5 top-1/2 -translate-y-1/2 -rotate-90 text-gray-600 group-hover/select:text-primary transition-colors pointer-events-none" />
                        </div>
                      </div>
                      <div>
                        <label className={labelStyle}>Domain Portal</label>
                        <div className="relative">
                          <Input
                            name="website"
                            type="url"
                            value={formData.website}
                            onChange={handleChange}
                            className={cn(inputStyle, 'pr-14')}
                            placeholder="https://..."
                          />
                          {formData.website && (
                            <a
                              href={formData.website}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-primary p-1"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          )}
                        </div>
                      </div>
                      <div className="md:col-span-2">
                        <label className={labelStyle}>
                          Search Taxonomy (Category Tags)
                        </label>
                        <Input
                          name="category"
                          value={formData.category}
                          onChange={handleChange}
                          className={inputStyle}
                          placeholder="e.g. tech, ivy, research, competitive"
                        />
                        <p className="text-[10px] text-gray-600 mt-3 font-bold uppercase tracking-widest">
                          Influence: Discovery rank and AI categorization
                        </p>
                      </div>
                    </div>
                  </div>
                </TabContentWrapper>
              </TabsContent>

              <TabsContent value="branding" key="branding" className="mt-0">
                <TabContentWrapper>
                  <div className={sectionCardStyle}>
                    <div className="absolute top-0 right-0 p-8 text-white/5 pointer-events-none">
                      <Sparkles className="h-32 w-32 rotate-12" />
                    </div>

                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3.5 rounded-2xl bg-purple-500/10 text-purple-500 border border-purple-500/20">
                        <Layers className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                          Visual Identity System
                        </h3>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                          Aesthetic parameters for the student interface
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="bg-[#050505] p-8 rounded-2xl border border-gray-800/50">
                        <label className={labelStyle}>
                          Brand Avatar (Acronym)
                        </label>
                        <Input
                          name="logo"
                          value={formData.logo}
                          onChange={handleChange}
                          className={cn(
                            inputStyle,
                            'text-center text-xl font-black'
                          )}
                          placeholder="e.g. MIT"
                          maxLength={4}
                        />
                        <div className="mt-6 flex justify-center">
                          <motion.div
                            key={formData.logo + formData.logoColor}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className={cn(
                              'w-24 h-24 rounded-[30%] flex items-center justify-center shadow-2xl',
                              formData.logoColor || 'bg-primary'
                            )}
                          >
                            <span className="text-white text-3xl font-black drop-shadow-md">
                              {formData.logo || '?'}
                            </span>
                          </motion.div>
                        </div>
                      </div>

                      <div className="bg-[#050505] p-8 rounded-2xl border border-gray-800/50">
                        <label className={labelStyle}>
                          Primary Signature Color
                        </label>
                        <Input
                          name="logoColor"
                          value={formData.logoColor}
                          onChange={handleChange}
                          className={inputStyle}
                          placeholder="Tailwind class: bg-red-600"
                        />
                        <div className="mt-6 grid grid-cols-4 gap-3">
                          {[
                            'bg-red-600',
                            'bg-blue-600',
                            'bg-emerald-600',
                            'bg-amber-600',
                            'bg-purple-600',
                            'bg-orange-600',
                            'bg-pink-600',
                            'bg-indigo-600',
                          ].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({ ...p, logoColor: color }))
                              }
                              className={cn(
                                'h-10 rounded-lg transition-all active:scale-90 border-2',
                                color,
                                formData.logoColor === color
                                  ? 'border-white'
                                  : 'border-transparent'
                              )}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabContentWrapper>
              </TabsContent>

              <TabsContent value="academic" key="academic" className="mt-0">
                <TabContentWrapper>
                  <div className={sectionCardStyle}>
                    <div className="flex items-center justify-between mb-10">
                      <div className="flex items-center gap-4">
                        <div className="p-3.5 rounded-2xl bg-amber-500/10 text-amber-500 border border-amber-500/20">
                          <Trophy className="h-6 w-6" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                            Analytics & Standing
                          </h3>
                          <p className="text-gray-500 text-sm font-medium mt-1">
                            Prestige markers and historical performance
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                      <div className="bg-[#050505] p-8 rounded-3xl border border-gray-800/50 relative group/stat">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">
                          Market Dominance
                        </p>
                        <div className="grid grid-cols-2 gap-8">
                          <div>
                            <label className={labelStyle}>National Rank</label>
                            <Input
                              name="ranking"
                              type="number"
                              value={formData.ranking}
                              onChange={handleChange}
                              className={inputStyle}
                              placeholder="e.g. 1"
                            />
                          </div>
                          <div>
                            <label className={labelStyle}>QS World Rank</label>
                            <Input
                              name="qsRanking"
                              value={formData.qsRanking}
                              onChange={handleChange}
                              className={inputStyle}
                              placeholder="e.g. #1"
                            />
                          </div>
                        </div>
                        <div className="mt-8 pt-8 border-t border-gray-800/80">
                          <label className={labelStyle}>
                            Acceptance Rate (%)
                          </label>
                          <div className="flex items-center gap-6">
                            <Input
                              name="acceptanceRate"
                              value={formData.acceptanceRate}
                              onChange={handleChange}
                              className={cn(inputStyle, 'w-32')}
                              placeholder="e.g. 4.1"
                            />
                            <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-gray-800">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{
                                  width: `${Math.min(parseFloat(formData.acceptanceRate) || 0, 100)}%`,
                                }}
                                className="h-full bg-primary"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-[#050505] p-8 rounded-3xl border border-gray-800/50">
                        <p className="text-[10px] font-black text-gray-600 uppercase tracking-widest mb-6">
                          Academic Reach
                        </p>
                        <label className={labelStyle}>Total Population</label>
                        <Input
                          name="enrollmentSize"
                          type="number"
                          value={formData.enrollmentSize}
                          onChange={handleChange}
                          className={inputStyle}
                          placeholder="e.g. 20000"
                        />

                        <div className="mt-10">
                          <label className={labelStyle}>
                            Institutional Specialisms
                          </label>
                          <Textarea
                            name="specialties"
                            value={formData.specialties}
                            onChange={handleChange}
                            className={cn(
                              inputStyle,
                              'h-32 pt-4 resize-none leading-relaxed'
                            )}
                            placeholder="Engineering, AI, Quantum Physics..."
                          />
                          <div className="flex gap-2 mt-4 flex-wrap">
                            {formData.specialties.split(',').map(
                              (s: string, i: number) =>
                                s.trim() && (
                                  <div
                                    key={i}
                                    className="px-3 py-1.5 rounded-xl bg-primary/5 border border-primary/10 text-[10px] font-bold text-primary/80 uppercase"
                                  >
                                    {s.trim()}
                                  </div>
                                )
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </TabContentWrapper>
              </TabsContent>

              <TabsContent value="admissions" key="admissions" className="mt-0">
                <TabContentWrapper>
                  <div className={sectionCardStyle}>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3.5 rounded-2xl bg-orange-500/10 text-orange-500 border border-orange-500/20">
                        <UserCircle className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                          Intelligence Representation
                        </h3>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                          Personnel mapping for AI personality emulation
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-12">
                      <div className="flex-1 space-y-10 group/con">
                        <div className="relative">
                          <label className={labelStyle}>
                            Strategic Representative
                          </label>
                          <Input
                            name="counselorName"
                            value={formData.counselorName}
                            onChange={handleChange}
                            className={cn(inputStyle, 'pl-14')}
                            placeholder="e.g. Elena Rodriguez"
                          />
                          <UserCircle className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-hover/con:text-orange-500 transition-colors" />
                        </div>
                        <div className="relative">
                          <label className={labelStyle}>
                            Corporate Designation
                          </label>
                          <Input
                            name="counselorTitle"
                            value={formData.counselorTitle}
                            onChange={handleChange}
                            className={cn(inputStyle, 'pl-14')}
                            placeholder="e.g. Dean of Strategic Recruitment"
                          />
                          <BadgeCheck className="h-5 w-5 absolute left-5 top-1/2 -translate-y-1/2 text-gray-500 group-hover/con:text-orange-500 transition-colors" />
                        </div>
                      </div>

                      <div className="w-full md:w-80 p-8 rounded-3xl bg-orange-500/5 border border-orange-500/10 flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-orange-500/10 border-2 border-orange-500/30 flex items-center justify-center text-orange-500 mb-6 group-hover/con:scale-110 transition-transform">
                          <Users className="h-8 w-8" />
                        </div>
                        <p className="text-lg font-black text-white">
                          {formData.counselorName || 'Entity Rep'}
                        </p>
                        <p className="text-xs font-bold text-orange-500/60 uppercase tracking-widest mt-1 mb-6 leading-tight">
                          {formData.counselorTitle || 'Awaiting Designation'}
                        </p>
                        <div className="w-full h-px bg-orange-500/10 mb-6" />
                        <p className="text-[10px] text-gray-500 font-medium leading-relaxed">
                          This identity will be used by the AI Agent to emulate
                          a personal touch during student interactions.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabContentWrapper>
              </TabsContent>

              <TabsContent value="content" key="content" className="mt-0">
                <TabContentWrapper>
                  <div className={sectionCardStyle}>
                    <div className="flex items-center gap-4 mb-10">
                      <div className="p-3.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                        <Sparkles className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                          Machine Learning Narrative
                        </h3>
                        <p className="text-gray-500 text-sm font-medium mt-1">
                          Core corpus for institutional knowledge generation
                        </p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <label className={labelStyle}>
                          Full Corpus Description
                        </label>
                        <div className="px-3 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[9px] font-black text-emerald-500 uppercase tracking-widest">
                          {formData.description.length} Units
                        </div>
                      </div>
                      <div className="relative group/text">
                        <Textarea
                          name="description"
                          value={formData.description}
                          onChange={handleChange}
                          rows={15}
                          className={cn(
                            inputStyle,
                            'resize-none p-8 text-base leading-relaxed h-[500px] border-2 group-hover/text:border-emerald-500/30'
                          )}
                          placeholder="Inject the complete institutional history, campus dynamics, and strategic advantages..."
                        />
                        <div className="absolute top-6 left-6 pointer-events-none opacity-10 group-focus-within/text:opacity-0 transition-opacity">
                          <Settings className="h-10 w-10 animate-spin-slow" />
                        </div>
                      </div>
                      <div className="flex items-center gap-3 p-5 rounded-2xl bg-[#050505] border border-gray-800/80">
                        <div className="h-2 w-2 rounded-full bg-emerald-500" />
                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-tighter">
                          Verified Content: This narrative forms the base for
                          all AI-student dialog.
                        </p>
                      </div>
                    </div>
                  </div>
                </TabContentWrapper>
              </TabsContent>

              {isEditing && (
                <TabsContent value="danger" key="danger" className="mt-0">
                  <TabContentWrapper>
                    <div className="bg-red-500/5 border border-red-500/20 rounded-[40px] p-20 flex flex-col items-center text-center">
                      <div className="w-24 h-24 rounded-[30%] bg-red-500/10 border-2 border-red-500/20 flex items-center justify-center text-red-500 mb-10 shadow-[0_0_40px_rgba(239,68,68,0.1)]">
                        <Trash2 className="h-10 w-10" />
                      </div>
                      <h3 className="text-3xl font-black text-white mb-6 tracking-tight">
                        Erase Institution
                      </h3>
                      <p className="text-gray-500 max-w-lg text-lg font-medium leading-relaxed mb-12">
                        All programs, student applications, and historical
                        training data associated with{' '}
                        <span className="text-white font-bold">
                          {formData.name}
                        </span>{' '}
                        will be permanently deleted across all nodes.
                      </p>

                      <div className="flex flex-col gap-6 w-full max-w-sm">
                        <Button
                          type="button"
                          variant="destructive"
                          onClick={handleDelete}
                          disabled={loading}
                          className="h-16 rounded-2xl font-black text-base shadow-2xl shadow-red-500/20 active:scale-95 transition-all"
                        >
                          {loading ? (
                            <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                          ) : (
                            'Authorize Permanent Deletion'
                          )}
                        </Button>
                        <p className="text-[10px] font-black text-gray-700 uppercase tracking-[0.3em]">
                          Critical Action: Node Confirmation Required
                        </p>
                      </div>
                    </div>
                  </TabContentWrapper>
                </TabsContent>
              )}
            </AnimatePresence>
          </Tabs>
        </div>

        {/* Dynamic Interface Preview */}
        <div className="w-[500px] shrink-0 border-l border-gray-900 bg-[#050505] p-12 overflow-y-auto hidden xl:block scrollbar-hide">
          <div className="sticky top-0">
            <h4 className="text-[11px] font-black text-gray-600 uppercase tracking-[0.3em] mb-12 flex items-center gap-3">
              <span className="w-8 h-px bg-gray-800" />
              Real-time Simulation
            </h4>

            <div className="space-y-16">
              {/* Discovery Card Preview */}
              <div className="space-y-8">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-3">
                  <span className="w-2 h-2 rounded-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]" />
                  Discovery Card Simulation
                </p>
                <motion.div
                  layout
                  className="group relative bg-[#111111] rounded-[32px] border border-gray-800/80 overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.8)] flex w-full h-[180px] hover:border-primary/30 transition-colors"
                >
                  <div className="w-[150px] h-[180px] shrink-0 p-4">
                    <div
                      className={cn(
                        'w-full h-full rounded-2xl flex items-center justify-center shadow-2xl transition-all duration-700 ease-out font-black text-4xl text-white',
                        formData.logoColor || 'bg-primary'
                      )}
                    >
                      {formData.logo || '?'}
                    </div>
                  </div>
                  <div className="flex-1 py-8 pr-8 pl-4 flex flex-col justify-center">
                    <h3 className="font-black text-white text-xl leading-tight mb-3 truncate group-hover:text-primary transition-colors">
                      {formData.name || 'Entity Name'}
                    </h3>
                    <p className="text-[#9CA3AF] text-xs font-bold uppercase tracking-wider mb-3 flex items-center gap-2">
                      <MapPin className="h-3 w-3 text-primary" />{' '}
                      {formData.city || '...'}, {formData.state || '...'}
                    </p>
                    <p className="text-gray-500 text-[13px] leading-relaxed line-clamp-2 font-medium">
                      {formData.description ||
                        'Provide a descriptor to generate a corpus preview...'}
                    </p>
                  </div>
                </motion.div>
              </div>

              {/* Strategic Analytics Preview */}
              <div className="bg-[#0c0c0c] rounded-[32px] border border-gray-800/50 p-10 space-y-10 shadow-2xl relative overflow-hidden group/stats">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-[60px] rounded-full pointer-events-none group-hover/stats:bg-primary/10 transition-colors" />

                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                    Strategic Metrics
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                      Profile Health
                    </span>
                    <div className="w-12 h-1 bg-gray-800 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${(Object.values(formData).filter((v) => v !== '').length / Object.keys(formData).length) * 100}%`,
                        }}
                        className="h-full bg-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-y-12 gap-x-10">
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                      Global Rank
                    </p>
                    <p className="text-3xl font-black text-white tracking-tight">
                      #{formData.ranking || '—'}
                    </p>
                    <div className="h-1 w-8 bg-primary/20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                      QS Status
                    </p>
                    <p className="text-3xl font-black text-white tracking-tight truncate">
                      {formData.qsRanking?.split(' ').pop() || '—'}
                    </p>
                    <div className="h-1 w-8 bg-blue-500/20 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                      Selectivity
                    </p>
                    <div className="flex items-baseline gap-1">
                      <p className="text-3xl font-black text-white tracking-tight">
                        {formData.acceptanceRate || '—'}
                      </p>
                      <span className="text-sm font-bold text-gray-600">%</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[10px] font-bold text-gray-700 uppercase tracking-widest">
                      Capacity
                    </p>
                    <p className="text-3xl font-black text-white tracking-tight">
                      {formData.enrollmentSize
                        ? (
                            parseInt(formData.enrollmentSize.toString()) / 1000
                          ).toFixed(1) + 'K'
                        : '—'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Entity Location Simulation */}
              <div className="bg-[#0c0c0c] rounded-[32px] border border-gray-800/50 p-8 shadow-2xl space-y-6">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em]">
                    Geospatial Node
                  </p>
                  <MapPin className="h-4 w-4 text-primary animate-bounce-slow" />
                </div>
                <div className="h-32 bg-[#111111] rounded-2xl border border-gray-800/50 flex items-center justify-center relative overflow-hidden group/map">
                  <div className="absolute inset-0 opacity-20 group-hover:opacity-30 transition-opacity">
                    <div
                      className="w-full h-full"
                      style={{
                        backgroundImage:
                          'radial-gradient(circle at 2px 2px, #333 1px, transparent 0)',
                        backgroundSize: '24px 24px',
                      }}
                    />
                  </div>
                  <div className="relative z-10 text-center">
                    <p className="text-white font-black text-lg tracking-tight">
                      {formData.city || 'Undetermined'}
                    </p>
                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">
                      {formData.state || 'Local Node'}
                    </p>
                  </div>
                </div>
              </div>

              {/* AI Representative Preview */}
              <div className="flex items-center gap-6 bg-[#0c0c0c] p-8 rounded-[32px] border border-gray-800/50 shadow-2xl group/rep">
                <div className="w-16 h-16 rounded-[30%] bg-orange-500/10 border-2 border-orange-500/20 flex items-center justify-center text-orange-500 shadow-inner group-hover/rep:scale-110 transition-transform duration-500">
                  <UserCircle className="h-8 w-8" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-base font-black text-white leading-none">
                      {formData.counselorName || 'Admissions Rep'}
                    </p>
                    <div className="w-2 h-2 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]" />
                  </div>
                  <p className="text-xs text-orange-500/60 font-black uppercase tracking-widest mt-1">
                    {formData.counselorTitle || 'Strategic Liaison'}
                  </p>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                key={hasChanges ? 'unsaved' : 'saved'}
                className={cn(
                  'p-8 rounded-[32px] border-2 transition-all duration-500',
                  hasChanges
                    ? 'bg-amber-500/5 border-amber-500/10'
                    : 'bg-emerald-500/5 border-emerald-500/10'
                )}
              >
                <div className="flex items-start gap-4">
                  {hasChanges ? (
                    <AlertTriangle className="h-5 w-5 text-amber-500 shrink-0 mt-1" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0 mt-1" />
                  )}
                  <p
                    className={cn(
                      'text-xs leading-relaxed font-bold tracking-tight',
                      hasChanges ? 'text-amber-500/80' : 'text-emerald-500/80'
                    )}
                  >
                    {hasChanges
                      ? 'System detects local modifications. Deploy changes to update institutional corpus across discovery nodes.'
                      : 'Workspace synced. Institutional parameters are currently live on discovery carousels.'}
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
