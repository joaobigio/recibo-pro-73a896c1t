import { useState } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate, useNavigate, useLocation } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Receipt, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'

export default function Login() {
  const { signUp, session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const { toast } = useToast()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)

  const from = location.state?.from?.pathname || '/'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="bg-primary/10 p-4 rounded-full animate-pulse">
            <Receipt className="h-8 w-8 text-primary" />
          </div>
          <p className="text-muted-foreground animate-pulse">Verificando sessão...</p>
        </div>
      </div>
    )
  }

  if (session) {
    return <Navigate to={from} replace />
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!email.trim() || !password || (!isLogin && !name.trim())) {
      toast({
        variant: 'destructive',
        description: 'Por favor, preencha todos os campos obrigatórios.',
      })
      return
    }

    setLoading(true)

    try {
      if (isLogin) {
        const { error, data } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        })

        if (error) throw error

        if (data?.session) {
          toast({ description: 'Bem-vindo de volta!' })
          navigate(from, { replace: true })
        } else {
          throw new Error('Não foi possível estabelecer a sessão.')
        }
      } else {
        const { error, data } = await signUp(email.trim(), password, name.trim())
        if (error) throw error

        if (data?.session) {
          const { data: sessionData } = await supabase.auth.getSession()
          if (sessionData.session) {
            toast({ description: 'Conta criada com sucesso!' })
            navigate(from, { replace: true })
          }
        } else {
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          })

          if (!signInError) {
            const { data: sessionData } = await supabase.auth.getSession()
            if (sessionData.session) {
              toast({ description: 'Conta criada com sucesso!' })
              navigate(from, { replace: true })
            }
          } else {
            toast({ description: 'Conta criada com sucesso! Você já pode fazer login.' })
            setIsLogin(true)
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error detailed:', {
        error,
        name: error?.name,
        status: error?.status,
        code: error?.code,
        message: error?.message,
      })

      let message = error?.message || 'Ocorreu um erro ao fazer login'
      if (
        error?.status === 400 ||
        error?.status === 401 ||
        message.includes('Invalid login credentials')
      ) {
        message = 'E-mail ou senha incorretos'
      } else if (message.includes('Email not confirmed')) {
        message = 'E-mail não confirmado. Por favor, verifique sua caixa de entrada.'
      } else if (
        message.includes('Failed to fetch') ||
        message.includes('NetworkError') ||
        error?.message === 'Load failed'
      ) {
        message = 'Erro de conexão com o servidor. Tente novamente mais tarde.'
      }

      toast({
        variant: 'destructive',
        title: error?.code ? `Falha na Autenticação (${error.code})` : 'Erro',
        description: message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1 items-center">
          <div className="bg-primary/10 p-3 rounded-full mb-2">
            <Receipt className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-center">Recibo Pro</CardTitle>
          <CardDescription>
            {isLogin ? 'Faça login na sua conta' : 'Crie sua conta para começar'}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Nome completo</Label>
                <Input
                  id="name"
                  required={!isLogin}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="João Silva"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isLogin ? 'Entrando...' : 'Criando conta...'}
                </>
              ) : isLogin ? (
                'Entrar'
              ) : (
                'Criar conta'
              )}
            </Button>
            <Button
              type="button"
              variant="link"
              className="w-full text-sm text-muted-foreground"
              onClick={() => setIsLogin(!isLogin)}
            >
              {isLogin ? 'Não tem uma conta? Cadastre-se' : 'Já tem uma conta? Faça login'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
