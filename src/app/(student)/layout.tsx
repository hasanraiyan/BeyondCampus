"use client"

import { usePathname } from "next/navigation"
import { Home, Compass, GraduationCap, LayoutDashboard, Target, Lock, User, Settings, Plus } from "lucide-react"
import AppSidebar from "@/components/AppSidebar"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { SidebarProvider, useSidebar } from "@/contexts/SidebarContext"

function StudentLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { headerAction, middleContent, bottomContent } = useSidebar()
  const { data: session, status } = useSession()
  const router = useRouter()

  // Protection logic moved to middleware generally, but extra safety here
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
    }
  }, [status, router])

  const navItems = [
    { label: "Home", icon: Home, href: "/" },
    { label: "Explore People", icon: Compass, href: "/explore" },
    { label: "Universities", icon: GraduationCap, href: "/universities" },
    { label: "My Workspace", icon: LayoutDashboard, href: "/workspace" },
    { label: "Roadmap", icon: Target, href: "/roadmap" },
    { label: "Applications", icon: GraduationCap, href: "/applications" },
    { label: "Documents", icon: Lock, href: "/documents" },
  ]

  // Determine active item based on pathname
  const activeItem = navItems.find(item => 
    item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
  )?.label || "Home"

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <div className="animate-pulse text-primary font-medium">Initializing Workspace...</div>
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden text-foreground">
      <AppSidebar
        navItems={navItems}
        activeItem={activeItem}
        headerAction={headerAction}
        middleContent={middleContent}
        bottomContent={bottomContent}
      />
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {children}
      </main>
    </div>
  )
}

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <StudentLayoutContent>{children}</StudentLayoutContent>
    </SidebarProvider>
  )
}
