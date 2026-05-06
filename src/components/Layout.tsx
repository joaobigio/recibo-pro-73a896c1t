import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { LogOut, LayoutDashboard, FileText, Users, ShieldAlert } from 'lucide-react'

export default function Layout() {
  const { user, loading, isAdmin, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      <aside className="w-full md:w-64 bg-background border-r flex flex-col print:hidden">
        <div className="p-4 border-b">
          <h2 className="text-2xl font-bold flex items-center gap-2 text-primary">
            <FileText className="h-6 w-6" />
            Recibo Pro
          </h2>
        </div>
        <nav className="flex-1 p-4 space-y-2">
          <Link to="/">
            <Button
              variant={location.pathname === '/' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <LayoutDashboard className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
          </Link>
          <Link to="/gerador">
            <Button
              variant={location.pathname === '/gerador' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <FileText className="mr-2 h-4 w-4" />
              Gerar Documento
            </Button>
          </Link>
          <Link to="/clientes">
            <Button
              variant={location.pathname === '/clientes' ? 'secondary' : 'ghost'}
              className="w-full justify-start"
            >
              <Users className="mr-2 h-4 w-4" />
              Meus Clientes
            </Button>
          </Link>

          {isAdmin && (
            <>
              <div className="pt-4 pb-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Administração
                </p>
              </div>
              <Link to="/admin">
                <Button
                  variant={location.pathname.startsWith('/admin') ? 'secondary' : 'ghost'}
                  className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10"
                >
                  <ShieldAlert className="mr-2 h-4 w-4" />
                  Painel Global
                </Button>
              </Link>
            </>
          )}
        </nav>
        <div className="p-4 border-t">
          <Button variant="outline" className="w-full justify-start" onClick={() => signOut()}>
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen print:p-0 print:h-auto">
        <Outlet />
      </main>
    </div>
  )
}
