'use client'

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { useProjectStore } from "@/lib/store"
import { ScenarioStatus } from "@/components/scenarios"
import { ClientOnly } from "@/components/common"
import { UserProfile } from "@/components/auth/UserProfile"
import {
  Home,
  Settings,
  Package,
  Calculator,
  Grid3x3,
  BarChart3,
  Menu,
  X,
  FolderOpen
} from "lucide-react"

const navigationItems = [
  {
    title: 'Início',
    href: '/',
    icon: Home,
    description: 'Dashboard principal'
  },
  {
    title: 'Configuração',
    href: '/project-config',
    icon: Settings,
    description: 'Dados básicos do projeto'
  },
  {
    title: 'Pacotes',
    href: '/packages',
    icon: Package,
    description: 'Pacotes de trabalho'
  },
  {
    title: 'Calcular',
    href: '/calculate',
    icon: Calculator,
    description: 'Executar cálculos'
  },
  {
    title: 'Matriz',
    href: '/matrix',
    icon: Grid3x3,
    description: 'Visualizar matriz'
  },
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: BarChart3,
    description: 'Análise executiva'
  },
  {
    title: 'Cenários',
    href: '/scenarios',
    icon: FolderOpen,
    description: 'Gerenciar cenários'
  }
]

interface MainLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function MainLayout({ children, title }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false)
  const pathname = usePathname()
  const { getConfigStatus, calculationResult, housesCount, workPackages } = useProjectStore()
  
  const configStatus = getConfigStatus()

  const getBreadcrumbs = () => {
    const currentItem = navigationItems.find(item => item.href === pathname)
    const pageTitle = title || currentItem?.title || 'Página'
    return currentItem || title ? [
      { label: 'Linha de Base', href: '/' },
      { label: pageTitle, href: currentItem?.href || pathname }
    ] : [{ label: 'Linha de Base', href: '/' }]
  }

  const breadcrumbs = getBreadcrumbs()

  return (
    <div className="min-h-screen bg-industrial-background-primary flex">
      {/* Mobile menu overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-industrial-primary text-white industrial-shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 lg:flex-shrink-0",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex flex-col h-screen lg:h-full">
          {/* Sidebar header */}
          <div className="flex items-center justify-between p-6 border-b border-industrial-primary-light border-opacity-20">
            <div>
              <h1 className="text-lg font-bold text-white">
                Linha de Base
              </h1>
              <p className="text-sm text-white text-opacity-70">
                Planejamento de Obras
              </p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden text-white text-opacity-70 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Project status */}
          <div className="p-4 border-b border-industrial-primary-light border-opacity-20">
            <ClientOnly fallback={
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white text-opacity-70">
                    - casas
                  </span>
                  <Badge variant="outline" className="bg-industrial-accent text-white border-industrial-accent-light text-xs px-2 py-1">
                    Config.
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white text-opacity-70">
                    - pacotes
                  </span>
                </div>
              </div>
            }>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white text-opacity-70">
                    {housesCount} casas
                  </span>
                  <Badge variant={configStatus.canCalculate ? 'destructive' : 'outline'} className="bg-industrial-accent text-white border-industrial-accent-light text-xs px-2 py-1">
                    {configStatus.canCalculate ? 'Pronto' : 'Config.'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-white text-opacity-70">
                    {workPackages.length} pacotes
                  </span>
                  {calculationResult && (
                    <Badge variant="outline" className="bg-industrial-success text-white border-green-600 text-xs px-2 py-1">
                      Calculado
                    </Badge>
                  )}
                </div>
              </div>
            </ClientOnly>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {navigationItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-3 text-sm transition-all duration-200",
                        "hover:bg-white hover:bg-opacity-10",
                        isActive 
                          ? "bg-industrial-accent text-white industrial-shadow-sm" 
                          : "text-white text-opacity-80 hover:text-opacity-100"
                      )}
                      onClick={() => setSidebarOpen(false)}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      <div className="flex-1">
                        <div className="font-medium">{item.title}</div>
                        <div className="text-xs opacity-75">{item.description}</div>
                      </div>
                    </Link>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Sidebar footer */}
          <div className="p-4 border-t border-industrial-primary-light border-opacity-20">
            <p className="text-xs text-white text-opacity-50 text-center">
              Versão 1.0.0
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Header */}
        <header className="bg-white industrial-shadow-sm border-b border-industrial-border-primary flex-shrink-0">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden text-industrial-text-muted hover:text-industrial-text-primary"
                >
                  <Menu className="h-6 w-6" />
                </button>
                
                {/* Breadcrumbs */}
                <nav className="flex items-center space-x-2">
                  {breadcrumbs.map((crumb, index) => (
                    <div key={crumb.href} className="flex items-center">
                      {index > 0 && (
                        <span className="mx-2 text-industrial-text-light">/</span>
                      )}
                      <Link
                        href={crumb.href}
                        className={cn(
                          "text-sm transition-colors",
                          index === breadcrumbs.length - 1
                            ? "text-industrial-text-primary font-medium"
                            : "text-industrial-text-secondary hover:text-industrial-text-primary"
                        )}
                      >
                        {crumb.label}
                      </Link>
                    </div>
                  ))}
                </nav>
              </div>
              
              <div className="flex items-center gap-4">
                <ClientOnly>
                  <ScenarioStatus />
                </ClientOnly>
                <ClientOnly>
                  {!configStatus.canCalculate && (
                    <Badge variant="outline" className="bg-industrial-accent text-white border-industrial-accent text-xs">
                      Configuração incompleta
                    </Badge>
                  )}
                </ClientOnly>
                <ClientOnly>
                  <UserProfile />
                </ClientOnly>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-auto">
          <div className="max-w-full">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}