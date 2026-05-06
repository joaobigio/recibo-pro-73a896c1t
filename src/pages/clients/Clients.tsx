import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getClients, createClient, Client } from '@/services/clients'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Users } from 'lucide-react'

export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [document, setDocument] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const loadClients = async () => {
    const { data } = await getClients()
    if (data) setClients(data)
    setLoading(false)
  }

  useEffect(() => {
    loadClients()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      const { error } = await createClient(user.id, { name, document, email, phone, address: null })
      if (error) throw error

      toast.success('Cliente adicionado com sucesso!')
      setOpen(false)
      setName('')
      setDocument('')
      setEmail('')
      setPhone('')
      loadClients()
    } catch (error) {
      toast.error('Erro ao adicionar cliente')
    }
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">Gerencie seus clientes para preenchimento rápido.</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Novo Cliente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Cliente</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAdd} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label>Nome completo / Empresa</Label>
                <Input required value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>CPF ou CNPJ</Label>
                <Input value={document} onChange={(e) => setDocument(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>E-mail</Label>
                <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Telefone / WhatsApp</Label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
              <Button type="submit" className="w-full">
                Salvar Cliente
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Documento</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.document || '-'}</TableCell>
                  <TableCell>
                    <div className="text-sm">{client.email || '-'}</div>
                    <div className="text-xs text-muted-foreground">{client.phone || ''}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {clients.length === 0 && !loading && (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    <div className="flex flex-col items-center justify-center text-muted-foreground">
                      <Users className="h-8 w-8 mb-2 opacity-50" />
                      Nenhum cliente cadastrado.
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
