import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { LayoutDashboard, FileText, Users, Settings, LogOut, Receipt } from 'lucide-react'

export default function Layout() {
  const { session, loading, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>
  }

  if (!session) {
    return <Navigate to="/login" />
  }

  const navItems = [
    { title: 'Dashboard', path: '/', icon: LayoutDashboard },
    { title: 'Emitir Recibo', path: '/gerador', icon: FileText },
    { title: 'Clientes', path: '/clientes', icon: Users },
  ]

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
        <Sidebar className="print:hidden border-r">
          <SidebarHeader className="p-4 flex flex-row items-center gap-2 border-b">
            <div className="bg-primary text-primary-foreground p-1.5 rounded-md">
              <Receipt className="h-5 w-5" />
            </div>
            <span className="font-semibold text-lg">Recibo Pro</span>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Menu Principal</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navItems.map((item) => (
                    <SidebarMenuItem key={item.path}>
                      <SidebarMenuButton asChild isActive={location.pathname === item.path}>
                        <Link to={item.path}>
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="p-4 border-t">
            <Button
              variant="ghost"
              className="w-full justify-start text-muted-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </Button>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 overflow-auto bg-transparent">
          <header className="h-14 lg:hidden flex items-center px-4 border-b bg-background print:hidden">
            <SidebarTrigger />
          </header>
          <main className="p-4 md:p-6 print:p-0 h-full">
            <Outlet />
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
