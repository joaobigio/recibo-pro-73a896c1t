import { Outlet, Navigate, Link, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Receipt,
  LogOut,
  Loader2,
  Home,
  Users,
  FileText,
  Package,
  Calendar,
  Settings,
} from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Layout() {
  const { session, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground animate-pulse">Carregando aplicação...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const navItems = [
    { name: 'Início', path: '/', icon: Home },
    { name: 'Documentos', path: '/documentos', icon: FileText },
    { name: 'Clientes', path: '/clientes', icon: Users },
    { name: 'Produtos', path: '/produtos', icon: Package },
    { name: 'Agendamentos', path: '/agendamentos', icon: Calendar },
    { name: 'Configurações', path: '/configuracoes', icon: Settings },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-muted/10">
      <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 p-2 rounded-md">
            <Receipt className="h-5 w-5 text-primary" />
          </div>
          <span className="font-semibold text-lg hidden sm:inline-block">Recibo Pro</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/' && location.pathname.startsWith(item.path))
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </Link>
            )
          })}
        </nav>

        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => signOut()}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-4 w-4 sm:mr-2" />
            <span className="hidden sm:inline-block">Sair</span>
          </Button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8 pb-24 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Nav */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t p-2 flex items-center justify-around z-20 pb-safe">
        {navItems.slice(0, 5).map((item) => {
          const Icon = item.icon
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center p-2 rounded-lg ${
                isActive ? 'text-primary bg-primary/5' : 'text-muted-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-[10px] mt-1 font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
