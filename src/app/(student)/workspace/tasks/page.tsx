"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  MoreVertical,
  Flag,
  GripVertical
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from '@dnd-kit/core'
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Task {
  id: string
  title: string
  description?: string
  status: 'backlog' | 'todo' | 'in_progress' | 'review' | 'completed'
  priority: 'high' | 'medium' | 'low'
  dueDate?: Date
  category: 'documents' | 'application' | 'test_prep' | 'financial' | 'visa' | 'other'
}

const columns = [
  { id: 'backlog', title: 'Backlog', color: '#6b7280' },
  { id: 'todo', title: 'To Do', color: '#3b82f6' },
  { id: 'in_progress', title: 'In Progress', color: '#eab308' },
  { id: 'review', title: 'Review', color: '#8b5cf6' },
  { id: 'completed', title: 'Completed', color: '#10b981' }
]

const categoryColors = {
  documents: { bg: 'bg-blue-500/20', text: 'text-blue-500', label: 'Documents' },
  application: { bg: 'bg-green-500/20', text: 'text-green-500', label: 'Application' },
  test_prep: { bg: 'bg-yellow-500/20', text: 'text-yellow-500', label: 'Test Prep' },
  financial: { bg: 'bg-purple-500/20', text: 'text-purple-500', label: 'Financial' },
  visa: { bg: 'bg-red-500/20', text: 'text-red-500', label: 'Visa' },
  other: { bg: 'bg-gray-500/20', text: 'text-gray-500', label: 'Other' }
}

// Task Card Component
function TaskCard({ task, isDragging }: { task: Task; isDragging?: boolean }) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-500'
      case 'medium': return 'text-yellow-500'
      case 'low': return 'text-green-500'
      default: return 'text-gray-500'
    }
  }

  return (
    <div
      className={`rounded-lg border border-gray-800 p-4 cursor-pointer transition-all group ${
        isDragging ? 'opacity-50 rotate-2 scale-105' : 'hover:border-gray-700'
      }`}
      style={{ 
        backgroundColor: '#0a0a0a',
        boxShadow: isDragging ? '0 10px 30px rgba(0,0,0,0.3)' : undefined
      }}
    >
      {/* Task Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-start gap-2 flex-1">
          <GripVertical className="h-4 w-4 text-gray-500 group-hover:text-gray-400 mt-0.5 cursor-move" />
          <h4 className="font-medium text-white text-sm flex-1">{task.title}</h4>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 -mr-2 -mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <MoreVertical className="h-3 w-3" />
        </Button>
      </div>

      {/* Task Description */}
      {task.description && (
        <p className="text-xs text-gray-400 mb-3 ml-6">{task.description}</p>
      )}

      {/* Task Meta */}
      <div className="flex items-center justify-between ml-6">
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-1 rounded-full ${categoryColors[task.category].bg} ${categoryColors[task.category].text}`}>
            {categoryColors[task.category].label}
          </span>
        </div>
        <Flag className={`h-3 w-3 ${getPriorityColor(task.priority)}`} />
      </div>

      {/* Due Date */}
      {task.dueDate && (
        <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 ml-6">
          <Clock className="h-3 w-3" />
          {new Date(task.dueDate).toLocaleDateString()}
        </div>
      )}
    </div>
  )
}

// Sortable Task Component
function SortableTask({ task }: { task: Task }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      <TaskCard task={task} isDragging={isDragging} />
    </div>
  )
}

// Column Component
function Column({ 
  column, 
  tasks, 
  isActive 
}: { 
  column: typeof columns[0]
  tasks: Task[]
  isActive: boolean
}) {
  const {
    setNodeRef,
    isOver,
  } = useSortable({
    id: column.id,
    data: {
      type: 'column',
    },
  })

  return (
    <div className="flex flex-col h-full">
      {/* Column Header */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-white">{column.title}</h3>
          <span className="text-sm text-gray-400 bg-gray-800 px-2 py-1 rounded">
            {tasks.length}
          </span>
        </div>
        <div className="h-1 rounded-full" style={{ backgroundColor: column.color, opacity: 0.3 }}>
          <div 
            className="h-1 rounded-full transition-all duration-300"
            style={{ 
              backgroundColor: column.color,
              width: `${Math.min((tasks.length / 10) * 100, 100)}%`
            }}
          />
        </div>
      </div>

      {/* Tasks Container */}
      <div 
        ref={setNodeRef}
        className={`flex-1 space-y-3 p-2 rounded-lg transition-all ${
          isOver ? 'bg-gray-800/30 ring-2 ring-gray-700' : ''
        } ${isActive ? 'bg-gray-800/10' : ''}`}
        style={{ minHeight: '200px' }}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map((task) => (
            <SortableTask key={task.id} task={task} />
          ))}
        </SortableContext>

        {/* Empty State */}
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-gray-800 rounded-lg">
            <p className="text-gray-500 text-sm">Drop tasks here</p>
          </div>
        )}
      </div>

      {/* Add Task Button */}
      <button className="mt-3 w-full p-2 text-left text-sm text-gray-400 hover:text-white hover:bg-gray-800 rounded transition-colors flex items-center gap-2">
        <Plus className="h-4 w-4" />
        Add a task
      </button>
    </div>
  )
}

export default function TasksPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const [loading, setLoading] = useState(true)
  const [tasks, setTasks] = useState<Task[]>([])
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/signin')
    } else {
      setLoading(false)
      loadMockTasks()
    }
  }, [session, status, router])

  const loadMockTasks = () => {
    const mockTasks: Task[] = [
      {
        id: '1',
        title: 'Complete SOP for Stanford',
        description: 'Write and finalize Statement of Purpose',
        status: 'in_progress',
        priority: 'high',
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        category: 'documents'
      },
      {
        id: '2',
        title: 'Request LOR from Prof. Smith',
        description: 'Send email with draft and deadline info',
        status: 'todo',
        priority: 'high',
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        category: 'documents'
      },
      {
        id: '3',
        title: 'Take IELTS Mock Test',
        description: 'Complete full practice test',
        status: 'todo',
        priority: 'medium',
        category: 'test_prep'
      },
      {
        id: '4',
        title: 'Research Scholarships',
        description: 'Find applicable scholarships for US universities',
        status: 'backlog',
        priority: 'medium',
        category: 'financial'
      },
      {
        id: '5',
        title: 'Upload Transcripts',
        description: 'Scan and upload official transcripts',
        status: 'completed',
        priority: 'high',
        category: 'documents'
      },
      {
        id: '6',
        title: 'Book IELTS Test Date',
        description: 'Register for IELTS exam',
        status: 'review',
        priority: 'high',
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        category: 'test_prep'
      }
    ]
    setTasks(mockTasks)
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter(task => task.status === status)
  }

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event
    
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    const overTask = tasks.find(t => t.id === over.id)

    if (!activeTask) return

    // If dropping over a task, use its status
    if (overTask && activeTask.status !== overTask.status) {
      setTasks(tasks.map(task =>
        task.id === activeTask.id
          ? { ...task, status: overTask.status }
          : task
      ))
    }

    // If dropping over a column
    if (over.data.current?.type === 'column') {
      const columnId = over.id as Task['status']
      if (activeTask.status !== columnId) {
        setTasks(tasks.map(task =>
          task.id === activeTask.id
            ? { ...task, status: columnId }
            : task
        ))
      }
    }
  }

  const handleDragEnd = () => {
    setActiveId(null)
  }

  const activeTask = activeId ? tasks.find(t => t.id === activeId) : null

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-gray-400">Loading tasks...</div>
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
                <Calendar className="h-5 w-5 text-orange-500" />
                <h1 className="text-xl font-semibold">Task Management</h1>
              </div>
            </div>
            <Button className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4" />
              Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="flex-1 overflow-hidden">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCorners}
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="h-full p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 h-full">
              <SortableContext
                items={columns.map(col => col.id)}
                strategy={verticalListSortingStrategy}
              >
                {columns.map((column) => (
                  <Column
                    key={column.id}
                    column={column}
                    tasks={getTasksByStatus(column.id)}
                    isActive={!!activeId}
                  />
                ))}
              </SortableContext>
            </div>
          </div>

          {/* Drag Overlay */}
          <DragOverlay>
            {activeTask ? <TaskCard task={activeTask} isDragging /> : null}
          </DragOverlay>
        </DndContext>
      </div>
    </div>
  )
}