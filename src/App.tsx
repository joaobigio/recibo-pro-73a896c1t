import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider, useAuth } from '@/hooks/use-auth'
import { Receipt } from 'lucide-react'

import Layout from './components/Layout'
import Index from './pages/Index'
import Login from './pages/auth/Login'
import Generator from './pages/documents/Generator'
import ThirdPartyReceiptForm from './pages/documents/ThirdPartyReceiptForm'
import DocumentList from './pages/documents/DocumentList'
import Clients from './pages/clients/Clients'
import ClientForm from './pages/clients/ClientForm'
import Products from './pages/products/Products'
import ProductForm from './pages/products/ProductForm'
import RecurringList from './pages/recurring/RecurringList'
import RecurringForm from './pages/recurring/RecurringForm'
import AdminDashboard from './pages/admin/AdminDashboard'
import Settings from './pages/settings/Settings'
import Users from './pages/settings/Users'
import NotFound from './pages/NotFound'
import ComingSoon from './pages/ComingSoon'

const ProtectedRoute = () => {
  const { session, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full animate-pulse">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground animate-pulse">Carregando...</p>
        </div>
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Index />} />
              <Route path="/gerador" element={<Generator />} />
              <Route path="/clientes" element={<Clients />} />
              <Route path="/clientes/cadastrar" element={<ClientForm />} />
              <Route path="/clientes/:id/editar" element={<ClientForm />} />
              <Route path="/historico" element={<DocumentList />} />
              <Route path="/documentos" element={<Navigate to="/historico" replace />} />
              <Route path="/recibos-terceiros/cadastrar" element={<ThirdPartyReceiptForm />} />
              <Route path="/produtos" element={<Products />} />
              <Route path="/produtos/cadastrar" element={<ProductForm />} />
              <Route path="/produtos/:id/editar" element={<ProductForm />} />
              <Route path="/agendamentos" element={<RecurringList />} />
              <Route path="/agendamentos/novo" element={<RecurringForm />} />
              <Route path="/propriedades" element={<ComingSoon />} />
              <Route path="/descricoes" element={<ComingSoon />} />
              <Route path="/termos" element={<ComingSoon />} />
              <Route path="/relatorios" element={<ComingSoon />} />
              <Route path="/ajuda" element={<ComingSoon />} />
              <Route path="/configuracoes" element={<Settings />} />
              <Route path="/configuracoes/usuarios" element={<Users />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
