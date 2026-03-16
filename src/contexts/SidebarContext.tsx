"use client"

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface SidebarContextType {
  headerAction: ReactNode | null
  setHeaderAction: (action: ReactNode | null) => void
  middleContent: ReactNode | null
  setMiddleContent: (content: ReactNode | null) => void
  bottomContent: ReactNode | null
  setBottomContent: (content: ReactNode | null) => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [headerAction, setHeaderAction] = useState<ReactNode | null>(null)
  const [middleContent, setMiddleContent] = useState<ReactNode | null>(null)
  const [bottomContent, setBottomContent] = useState<ReactNode | null>(null)

  return (
    <SidebarContext.Provider 
      value={{ 
        headerAction, 
        setHeaderAction, 
        middleContent, 
        setMiddleContent, 
        bottomContent, 
        setBottomContent 
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider')
  }
  return context
}
