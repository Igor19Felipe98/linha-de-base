import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../styles/globals.css'
import { AuthProvider } from '@/components/auth/AuthProvider'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { MainLayout } from '@/components/layout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Linha de Base - Planejamento de Obras',
  description: 'Sistema de planejamento e controle de cronogramas para obras residenciais usando metodologia Lean Construction',
  keywords: 'construção civil, lean construction, cronograma, planejamento, linha de base',
  authors: [{ name: 'Sistema de Gestão' }],
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <body className={inter.className}>
        <AuthProvider>
          <AuthGuard>
            <MainLayout>
              {children}
            </MainLayout>
          </AuthGuard>
        </AuthProvider>
      </body>
    </html>
  )
}