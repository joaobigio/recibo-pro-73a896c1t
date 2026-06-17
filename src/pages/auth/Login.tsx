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
import { toast } from 'sonner'
import { Receipt, Loader2 } from 'lucide-react'

export default function Login() {
  const { signIn, signUp, session, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

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
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await signIn(email.trim(), password)
        if (error) throw error
        toast.success('Bem-vindo de volta!')
        // A navegação será feita automaticamente pela condicional "if (session)" no topo do componente, evitando race conditions.
      } else {
        const { error, data } = await signUp(email.trim(), password, name.trim())
        if (error) throw error

        if (data?.session) {
          toast.success('Conta criada com sucesso!')
          // A navegação será feita automaticamente pela condicional "if (session)"
        } else {
          // Attempt to login immediately since the backend auto-confirms users
          const { error: signInError } = await signIn(email.trim(), password)

          if (!signInError) {
            toast.success('Conta criada com sucesso!')
            // A navegação será feita automaticamente pela condicional "if (session)"
          } else {
            toast.success('Conta criada com sucesso! Você já pode fazer login.', {
              duration: 6000,
            })
            setIsLogin(true)
          }
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error)
      let message = error.message || 'Ocorreu um erro'

      // Translate generic Supabase auth errors to Portuguese
      if (message.includes('Password should be at least')) {
        message = 'A senha deve ter pelo menos 6 caracteres.'
      } else if (message.includes('User already registered')) {
        message = 'Este e-mail já está cadastrado. Faça login.'
      } else if (message.includes('Invalid login credentials')) {
        message = 'E-mail ou senha incorretos.'
      } else if (message.includes('Email not confirmed')) {
        message = 'E-mail não confirmado. Verifique sua caixa de entrada.'
      }

      toast.error(message)
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
                  Aguarde...
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
