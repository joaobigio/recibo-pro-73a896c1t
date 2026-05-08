import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  getRecurringDocuments,
  toggleRecurringActive,
  deleteRecurringDocument,
} from '@/services/recurring'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Plus, Search, Trash2, CalendarClock } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function RecurringList() {
  const { user } = useAuth()
  const [recurring, setRecurring] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    if (user) loadRecurring()
  }, [user])

  const loadRecurring = async () => {
    setLoading(true)
    const { data } = await getRecurringDocuments(user!.id)
    if (data) setRecurring(data)
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    const { error } = await deleteRecurringDocument(id)
    if (error) {
      toast.error('Erro ao excluir agendamento')
      return
    }
    toast.success('Agendamento excluído com sucesso')
    setRecurring(recurring.filter((r) => r.id !== id))
  }

  const handleToggleActive = async (id: string, active: boolean) => {
    setRecurring(recurring.map((r) => (r.id === id ? { ...r, active } : r)))
    const { error } = await toggleRecurringActive(id, active)
    if (error) {
      toast.error('Erro ao atualizar status')
      setRecurring(recurring.map((r) => (r.id === id ? { ...r, active: !active } : r)))
    } else {
      toast.success(active ? 'Agendamento ativado' : 'Agendamento pausado')
    }
  }

  const filtered = recurring.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      r.client?.name?.toLowerCase().includes(search.toLowerCase()),
  )

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const getFrequencyLabel = (freq: string) => {
    const map: Record<string, string> = {
      weekly: 'Semanal',
      monthly: 'Mensal',
      yearly: 'Anual',
    }
    return map[freq] || freq
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-600/20 flex items-center justify-center text-blue-500">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Recibos Programados</h1>
              <p className="text-muted-foreground">
                Automatize a geração de recibos para clientes recorrentes.
              </p>
            </div>
          </div>
        </div>
        <Button asChild>
          <Link to="/agendamentos/novo">
            <Plus className="mr-2 h-4 w-4" />
            Novo Agendamento
          </Link>
        </Button>
      </div>

      <div className="flex items-center gap-2 max-w-sm">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por cliente ou título..."
            className="pl-8"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Frequência</TableHead>
              <TableHead>Próximo Envio</TableHead>
              <TableHead className="text-right">Valor (R$)</TableHead>
              <TableHead className="text-center">Ativo</TableHead>
              <TableHead className="w-[80px] text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Carregando agendamentos...
                </TableCell>
              </TableRow>
            ) : filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum agendamento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((item) => (
                <TableRow key={item.id} className={!item.active ? 'opacity-60' : ''}>
                  <TableCell className="font-medium">{item.title}</TableCell>
                  <TableCell>{item.client?.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{getFrequencyLabel(item.frequency)}</Badge>
                  </TableCell>
                  <TableCell>
                    {item.next_date
                      ? format(new Date(item.next_date + 'T00:00:00'), "dd 'de' MMM, yyyy", {
                          locale: ptBR,
                        })
                      : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(item.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Switch
                      checked={item.active}
                      onCheckedChange={(val) => handleToggleActive(item.id, val)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center">
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Excluir agendamento</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o agendamento "{item.title}"? Esta ação
                              não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(item.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
