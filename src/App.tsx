import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import { AuthProvider } from '@/hooks/use-auth'

import Layout from './components/Layout'
import Index from './pages/Index'
import Login from './pages/auth/Login'
import Generator from './pages/documents/Generator'
import ThirdPartyReceiptForm from './pages/documents/ThirdPartyReceiptForm'
import Clients from './pages/clients/Clients'
import ClientForm from './pages/clients/ClientForm'
import AdminDashboard from './pages/admin/AdminDashboard'
import Settings from './pages/settings/Settings'
import NotFound from './pages/NotFound'
import ComingSoon from './pages/ComingSoon'

const App = () => (
  <BrowserRouter future={{ v7_startTransition: false, v7_relativeSplatPath: false }}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route element={<Layout />}>
            <Route path="/" element={<Index />} />
            <Route path="/gerador" element={<Generator />} />
            <Route path="/clientes" element={<Clients />} />
            <Route path="/clientes/cadastrar" element={<ClientForm />} />
            <Route path="/clientes/:id/editar" element={<ClientForm />} />
            <Route path="/recibos-terceiros/cadastrar" element={<ThirdPartyReceiptForm />} />
            <Route path="/produtos" element={<ComingSoon />} />
            <Route path="/propriedades" element={<ComingSoon />} />
            <Route path="/descricoes" element={<ComingSoon />} />
            <Route path="/termos" element={<ComingSoon />} />
            <Route path="/relatorios" element={<ComingSoon />} />
            <Route path="/ajuda" element={<ComingSoon />} />
            <Route path="/configuracoes" element={<Settings />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
