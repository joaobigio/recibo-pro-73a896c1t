import { Outlet, Link, useLocation, Navigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  LogOut,
  LayoutDashboard,
  FileText,
  Users,
  ShieldAlert,
  Receipt,
  FileSignature,
  FileSpreadsheet,
  Building,
  Package,
  AlignLeft,
  FileBadge,
  BarChart3,
  HelpCircle,
  ChevronUp,
  UserCircle,
  CalendarClock,
} from 'lucide-react'

function NavItem({
  to,
  icon: Icon,
  children,
  isActive,
}: {
  to: string
  icon: any
  children: React.ReactNode
  isActive: boolean
}) {
  return (
    <Link to={to} className="block relative group">
      {isActive && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 rounded-r-full" />
      )}
      <div
        className={cn(
          'flex items-center gap-3 px-4 py-2 mx-3 rounded-md text-sm transition-colors',
          isActive
            ? 'bg-blue-600/10 text-blue-400 font-medium'
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50',
        )}
      >
        <Icon
          className={cn(
            'h-[18px] w-[18px]',
            isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-300',
          )}
        />
        {children}
      </div>
    </Link>
  )
}

export default function Layout() {
  const { user, loading, isAdmin, signOut } = useAuth()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Carregando...</div>
  }

  if (!user) {
    return <Navigate to="/login" />
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-muted/20">
      <aside className="w-full md:w-[260px] bg-[#1a1e27] border-r border-slate-800 flex flex-col print:hidden h-screen font-sans shrink-0 transition-all">
        <div className="p-5 flex items-center gap-3 border-b border-slate-800/50">
          <div className="bg-blue-600 p-2 rounded-lg text-white shadow-sm shadow-blue-900/20">
            <Receipt className="h-5 w-5" />
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">Recibo Online</h2>
        </div>

        <div className="flex-1 overflow-y-auto py-4 space-y-6 custom-scrollbar">
          <div className="space-y-1">
            <NavItem to="/" icon={LayoutDashboard} isActive={location.pathname === '/'}>
              Painel
            </NavItem>
          </div>

          <div className="space-y-1.5">
            <div className="px-5 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Documentos
            </div>
            <NavItem
              to="/gerador?type=receipt"
              icon={FileText}
              isActive={
                location.pathname === '/gerador' &&
                (!searchParams.get('type') || searchParams.get('type') === 'receipt')
              }
            >
              Recibo Tradicional
            </NavItem>
            <NavItem
              to="/gerador?type=third_party"
              icon={FileSignature}
              isActive={
                location.pathname === '/gerador' && searchParams.get('type') === 'third_party'
              }
            >
              Recibo para Terceiros
            </NavItem>
            <NavItem
              to="/gerador?type=items"
              icon={FileSpreadsheet}
              isActive={location.pathname === '/gerador' && searchParams.get('type') === 'items'}
            >
              Recibo com Itens
            </NavItem>
            <NavItem
              to="/gerador?type=rent"
              icon={Building}
              isActive={location.pathname === '/gerador' && searchParams.get('type') === 'rent'}
            >
              Recibo de Aluguel
            </NavItem>
            <NavItem
              to="/gerador?type=promissory"
              icon={Receipt}
              isActive={
                location.pathname === '/gerador' && searchParams.get('type') === 'promissory'
              }
            >
              Promissória
            </NavItem>
            <NavItem
              to="/gerador?type=budget"
              icon={FileBadge}
              isActive={location.pathname === '/gerador' && searchParams.get('type') === 'budget'}
            >
              Orçamentos
            </NavItem>
            <NavItem
              to="/documentos"
              icon={FileText}
              isActive={location.pathname === '/documentos'}
            >
              Histórico de Documentos
            </NavItem>
            <NavItem
              to="/agendamentos"
              icon={CalendarClock}
              isActive={location.pathname.startsWith('/agendamentos')}
            >
              Recibos Programados
            </NavItem>
          </div>

          <div className="space-y-1.5">
            <div className="px-5 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Cadastros
            </div>
            <NavItem to="/clientes" icon={Users} isActive={location.pathname === '/clientes'}>
              Clientes
            </NavItem>
            <NavItem to="/produtos" icon={Package} isActive={location.pathname === '/produtos'}>
              Produtos e Serviços
            </NavItem>
            <NavItem
              to="/propriedades"
              icon={Building}
              isActive={location.pathname === '/propriedades'}
            >
              Propriedades
            </NavItem>
            <NavItem
              to="/descricoes"
              icon={AlignLeft}
              isActive={location.pathname === '/descricoes'}
            >
              Descrições
            </NavItem>
            <NavItem to="/termos" icon={FileSignature} isActive={location.pathname === '/termos'}>
              Termos de Orçamento
            </NavItem>
          </div>

          <div className="space-y-1.5">
            <div className="px-5 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Relatórios
            </div>
            <NavItem
              to="/relatorios"
              icon={BarChart3}
              isActive={location.pathname === '/relatorios'}
            >
              Relatórios
            </NavItem>
          </div>

          {isAdmin && (
            <div className="space-y-1.5">
              <div className="px-5 mb-2 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Administração
              </div>
              <NavItem
                to="/admin"
                icon={ShieldAlert}
                isActive={location.pathname.startsWith('/admin')}
              >
                Painel Global
              </NavItem>
            </div>
          )}
        </div>

        <div className="border-t border-slate-800 p-3 space-y-2 bg-[#1a1e27]">
          <Link
            to="/ajuda"
            className="flex items-center gap-3 px-4 py-2 mx-1 rounded-md text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            <HelpCircle className="h-[18px] w-[18px]" />
            Ajuda
          </Link>

          <Link to="/configuracoes">
            <div className="flex items-center justify-between p-2 rounded-md bg-[#222834] hover:bg-[#2a3140] border border-slate-800 transition-colors cursor-pointer group">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="bg-slate-800 p-1.5 rounded-full flex-shrink-0 group-hover:bg-slate-700 transition-colors">
                  <UserCircle className="h-6 w-6 text-slate-300" />
                </div>
                <div className="truncate">
                  <p className="text-sm font-medium text-slate-200 truncate" title={user.email}>
                    {user.email}
                  </p>
                  <p className="text-[11px] text-slate-500">Configurações e Conta</p>
                </div>
              </div>
              <ChevronUp className="h-4 w-4 text-slate-500 flex-shrink-0 mr-1" />
            </div>
          </Link>

          <Button
            variant="ghost"
            className="w-full justify-start text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </aside>

      <main className="flex-1 p-6 md:p-8 overflow-y-auto h-screen print:p-0 print:h-auto print:overflow-visible">
        <Outlet />
      </main>
    </div>
  )
}
