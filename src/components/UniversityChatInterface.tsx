'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  ArrowLeft,
  GraduationCap,
  MapPin,
  Users,
  Star,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UniversityDetailSkeleton } from './UniversityDetailSkeleton';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ProgramListUI, Program } from '@/components/ProgramListUI';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolData?: {
    tool: string;
    data: any;
  };
}

interface University {
  id: string;
  name: string;
  location: string;
  logo: string;
  logoColor: string;
  description: string;
  specialties: string[];
  ranking: string;
  studentCount: string;
  admissionRate: string;
  counselorName: string;
  counselorTitle: string;
  qsRanking: string;
}

interface UniversityChatInterfaceProps {
  universityId: string;
}

export default function UniversityChatInterface({
  universityId,
}: UniversityChatInterfaceProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [displayedText, setDisplayedText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [university, setUniversity] = useState<University | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUniversity = async () => {
      try {
        const response = await fetch(`/api/universities/${universityId}`);
        if (response.ok) {
          const u = await response.json();
          setUniversity({
            id: u.id,
            name: u.name,
            location: `${u.city}, ${u.state}`,
            logo: u.logo || '',
            logoColor: u.logoColor || 'bg-gray-600',
            description: u.description || '',
            specialties: u.specialties || [],
            ranking: u.ranking ? `#${u.ranking} National Universities` : 'N/A',
            studentCount: `${u.enrollmentSize || 0} students`,
            admissionRate: u.acceptanceRate ? `${u.acceptanceRate}%` : 'N/A',
            counselorName: u.counselorName || 'Admissions Counselor',
            counselorTitle: u.counselorTitle || 'Admissions Office',
            qsRanking: u.qsRanking || 'N/A',
          });
        }
      } catch (error) {
        console.error('Error fetching university:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (universityId) {
      fetchUniversity();
    }
  }, [universityId]);

  // Welcome message typing effect
  useEffect(() => {
    if (!university) return;
    const welcomeText = `Welcome to ${university.name}`;

    if (messages.length === 0) {
      setDisplayedText('');
      let currentIndex = 0;

      const typingInterval = setInterval(() => {
        if (currentIndex < welcomeText.length) {
          setDisplayedText(welcomeText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
        }
      }, 50);

      return () => clearInterval(typingInterval);
    }
  }, [university?.name, messages.length]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [inputMessage]);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, newMessage]);
    setInputMessage('');

    if (!university) return;

    // Call University-scoped Maya API
    try {
      const response = await fetch(`/api/universities/${university.id}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: newMessage.content,
          history: messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      if (response.ok && response.body) {
        // Initialize AI response
        const aiMessageId = Date.now().toString();
        const initialAiResponse: Message = {
          id: aiMessageId,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, initialAiResponse]);

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let done = false;
        let buffer = '';
        while (!done) {
          const { value, done: doneReading } = await reader.read();
          done = doneReading;
          if (value) {
            buffer += decoder.decode(value, { stream: !done });
            let newlineIndex;
            while ((newlineIndex = buffer.indexOf('\n')) >= 0) {
              const line = buffer.slice(0, newlineIndex);
              buffer = buffer.slice(newlineIndex + 1);
              if (line.trim()) {
                try {
                  const parsed = JSON.parse(line);
                  if (parsed.type === 'text') {
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === aiMessageId
                          ? { ...m, content: m.content + parsed.content }
                          : m
                      )
                    );
                  } else if (parsed.type === 'tool' && parsed.tool === 'list_programs') {
                    // Inject tool UI state
                    setMessages((prev) =>
                      prev.map((m) =>
                        m.id === aiMessageId
                          ? { ...m, toolData: { tool: parsed.tool, data: parsed.data } }
                          : m
                      )
                    );
                  }
                } catch (e) {
                  console.error('Failed to parse line:', line, e);
                }
              }
            }
          }
        }
      } else {
        throw new Error('Failed to get response from Maya');
      }
    } catch (error) {
      console.error('Chat Error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content:
          "I'm sorry, I'm having trouble connecting right now. Please try again in a moment.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  if (isLoading || !university) {
    return <UniversityDetailSkeleton />;
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-4 p-6 border-b border-border/30 bg-background/50 backdrop-blur">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="hover:bg-secondary/70"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>

          {/* University Info */}
          <div className="flex items-center gap-4 flex-1">
            <div
              className={cn(
                'w-12 h-12 rounded-lg flex items-center justify-center',
                university.logoColor
              )}
            >
              <span className="text-white font-bold text-lg">
                {university.logo}
              </span>
            </div>

            <div className="flex-1">
              <h1 className="text-xl font-bold text-foreground">
                {university.name}
              </h1>
              <p className="text-sm text-muted-foreground">
                {university.location}
              </p>
            </div>

            {/* New Chat Button */}
            <Button
              variant="outline"
              className="border-primary/50 text-primary hover:bg-primary/10 font-medium px-6"
              onClick={() => {
                if (window.confirm('Are you sure you want to start a new chat? This will clear your current conversation.')) {
                  setMessages([]);
                }
              }}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              New Chat
            </Button>
          </div>
        </div>

        {/* University Stats Banner */}
        <div className="bg-secondary/30 border-b border-border/30 px-6 py-4">
          <div className="flex items-center justify-center gap-16 text-sm">
            <div className="text-center">
              <p className="font-semibold text-foreground">Admission Rate</p>
              <p className="text-muted-foreground">
                {university.admissionRate}
              </p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">QS Ranking</p>
              <p className="text-muted-foreground">{university.qsRanking}</p>
            </div>
            <div className="text-center">
              <p className="font-semibold text-foreground">Student Body</p>
              <p className="text-muted-foreground">{university.studentCount}</p>
            </div>
          </div>
        </div>

        {/* Chat Messages */}
        {messages.length === 0 ? (
          /* Welcome State */
          <div className="flex-1 flex flex-col items-center justify-center px-8">
            <div className="max-w-4xl w-full text-center -mt-20">
              {/* Counselor Avatar */}
              <div className="mb-8">
                <Avatar className="h-24 w-24 mx-auto mb-6">
                  <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
                    {university.counselorName
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-4xl font-bold text-foreground">
                  {displayedText}
                </h2>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 gap-4 mb-8">
                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex flex-col items-start"
                  onClick={() =>
                    setInputMessage('Tell me about your academic programs')
                  }
                >
                  <GraduationCap className="h-5 w-5 mb-2" />
                  <span className="font-medium">Academic Programs</span>
                  <span className="text-xs text-muted-foreground">
                    Learn about our majors and courses
                  </span>
                </Button>

                <Button
                  variant="outline"
                  className="h-auto p-4 text-left flex flex-col items-start"
                  onClick={() =>
                    setInputMessage('What are the admission requirements?')
                  }
                >
                  <Users className="h-5 w-5 mb-2" />
                  <span className="font-medium">Admissions</span>
                  <span className="text-xs text-muted-foreground">
                    Requirements and application process
                  </span>
                </Button>
              </div>

              {/* Input Area */}
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Ask anything about ${university.name}...`}
                  className="min-h-[100px] max-h-[300px] resize-none bg-secondary border-2 border-border/50 rounded-xl text-base leading-relaxed placeholder:text-muted-foreground/70 pl-4 pr-12 py-3 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 w-full transition-all duration-200 hover:border-border/70"
                  rows={1}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim()}
                  size="icon"
                  className="absolute bottom-3 right-3 h-8 w-8 rounded-lg transition-all duration-200 disabled:opacity-40 hover:scale-105 active:scale-95 hover:bg-primary/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-2 opacity-60">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </div>
        ) : (
          /* Chat Messages */
          <>
            <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
              <div className="max-w-6xl mx-auto space-y-4 w-full px-4">
                {messages.map((message, index) => {
                  const prevMessage = index > 0 ? messages[index - 1] : null;
                  const showHeader =
                    !prevMessage ||
                    prevMessage.role !== message.role ||
                    message.timestamp.getTime() -
                      prevMessage.timestamp.getTime() >
                      5 * 60 * 1000; // 5 minutes gap

                  return (
                    <div
                      key={message.id}
                      className={cn(
                        'flex gap-3',
                        message.role === 'user' && 'justify-end'
                      )}
                    >
                      {message.role === 'assistant' && (
                        <Avatar className="h-6 w-6 mt-6">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {university.counselorName
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <div
                        className={cn(
                          'flex flex-col gap-2 max-w-[95%] w-full',
                          message.role === 'user' && 'items-end'
                        )}
                      >
                        {/* Message Header */}
                        {showHeader && (
                          <div
                            className={cn(
                              'flex items-center gap-2 text-sm text-[#A0A0A0]',
                              message.role === 'user' && 'justify-end'
                            )}
                          >
                            <span className="font-semibold tracking-tight">
                              {message.role === 'user'
                                ? session?.user?.name || 'User'
                                : university.counselorName}
                            </span>
                          </div>
                        )}
                        {/* Message Bubble */}
                        <div
                          className={cn(
                            'rounded-lg px-4 py-2',
                            message.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-secondary border border-border'
                          )}
                        >
                          {message.role === 'user' ? (
                            <p className="text-[15px] leading-relaxed whitespace-pre-wrap">
                              {message.content}
                            </p>
                          ) : (
                             <div className="text-[15px] leading-relaxed prose prose-invert max-w-none w-full">
                              {/* Render Generative UI Tool result if present */}
                              {message.toolData && message.toolData.tool === 'list_programs' && (
                                 <div className="mb-4">
                                   <ProgramListUI programs={message.toolData.data as Program[]} />
                                 </div>
                              )}
                              <ReactMarkdown
                                remarkPlugins={[remarkGfm]}
                                components={{
                                  p: ({ node, ...props }) => {
                                    const content = props.children as string;
                                    // Remove citations from text to show them as badges instead
                                    const cleanText = typeof content === 'string' 
                                      ? content.replace(/📄 Source: [^\n]+/g, '').trim()
                                      : content;
                                    
                                    if (!cleanText) return null;
                                    
                                    return <p className="mb-2 last:mb-0" {...props}>{cleanText}</p>;
                                  },
                                  ul: ({ node, ...props }) => (
                                    <ul
                                      className="list-disc pl-4 mb-2"
                                      {...props}
                                    />
                                  ),
                                  ol: ({ node, ...props }) => (
                                    <ol
                                      className="list-decimal pl-4 mb-2"
                                      {...props}
                                    />
                                  ),
                                  li: ({ node, ...props }) => (
                                    <li className="mb-1" {...props} />
                                  ),
                                  h1: ({ node, ...props }) => (
                                    <h1
                                      className="text-lg font-bold mb-2"
                                      {...props}
                                    />
                                  ),
                                  h2: ({ node, ...props }) => (
                                    <h2
                                      className="text-base font-bold mb-2"
                                      {...props}
                                    />
                                  ),
                                  h3: ({ node, ...props }) => (
                                    <h3
                                      className="text-sm font-bold mb-1"
                                      {...props}
                                    />
                                  ),
                                  strong: ({ node, ...props }) => (
                                    <strong
                                      className="font-bold text-primary"
                                      {...props}
                                    />
                                  ),
                                  a: ({ node, ...props }) => (
                                    <a
                                      className="text-primary hover:underline"
                                      {...props}
                                    />
                                  ),
                                  code: ({ node, ...props }) => (
                                    <code
                                      className="bg-muted px-1 rounded text-sm"
                                      {...props}
                                    />
                                  ),
                                }}
                              >
                                {message.content}
                              </ReactMarkdown>

                              {/* Source Badges */}
                              {(() => {
                                const citationRegex = /📄 Source: ([^\n]+)/g;
                                const citations = Array.from(message.content.matchAll(citationRegex)).map(m => m[1]);
                                
                                if (citations.length === 0) return null;

                                return (
                                  <div className="flex flex-wrap gap-2 mt-3 pt-2 border-t border-border/20">
                                    {citations.map((source, i) => (
                                      <div 
                                        key={i}
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 border border-primary/20 text-[11px] font-medium text-primary cursor-default group hover:bg-primary/20 transition-colors"
                                      >
                                        <Star className="h-3 w-3 fill-primary/20 group-hover:fill-primary/40" />
                                        <span>Source: {source}</span>
                                      </div>
                                    ))}
                                  </div>
                                );
                              })()}
                            </div>
                          )}

                        </div>

                        <span className="text-[11px] text-muted-foreground opacity-60">
                          {message.timestamp.toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      {message.role === 'user' && (
                        <Avatar className="h-6 w-6 mt-6">
                          <AvatarFallback className="text-xs">
                            You
                          </AvatarFallback>
                        </Avatar>
                      )}
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* Input Area */}
            <div className="p-6 bg-background border-t border-border/20">
              <div className="max-w-6xl mx-auto w-full px-4">
                <div className="relative">
                  <Textarea
                    ref={textareaRef}
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder={`Continue your conversation about ${university.name}...`}
                    className="min-h-[120px] max-h-[300px] resize-none bg-secondary border-2 border-border/50 rounded-xl text-[16px] leading-relaxed placeholder:text-muted-foreground/70 pl-5 pr-16 py-4 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 w-full transition-all duration-200 hover:border-border/70"
                    rows={1}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim()}
                    size="icon"
                    className="absolute bottom-3 right-3 h-11 w-11 rounded-lg transition-all duration-200 disabled:opacity-40 hover:scale-105 active:scale-95 hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-2 opacity-60">
                  Press Enter to send, Shift+Enter for new line
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
