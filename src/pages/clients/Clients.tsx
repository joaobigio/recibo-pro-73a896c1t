import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { getClients, createClient, updateClient, deleteClient, Client } from '@/services/clients'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Plus, Search, Edit2, Trash2 } from 'lucide-react'

export default function Clients() {
  const { user } = useAuth()
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [isOpen, setIsOpen] = useState(false)
  const [editingClient, setEditingClient] = useState<Client | null>(null)

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    address: '',
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    setLoading(true)
    const { data } = await getClients()
    if (data) setClients(data)
    setLoading(false)
  }

  const handleOpenDialog = (client?: Client) => {
    if (client) {
      setEditingClient(client)
      setFormData({
        name: client.name,
        document: client.document || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || '',
      })
    } else {
      setEditingClient(null)
      setFormData({ name: '', document: '', email: '', phone: '', address: '' })
    }
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    try {
      if (editingClient) {
        const { error } = await updateClient(editingClient.id, formData)
        if (error) throw error
        toast.success('Cliente atualizado com sucesso!')
      } else {
        const { error } = await createClient({ ...formData, user_id: user.id })
        if (error) throw error
        toast.success('Cliente cadastrado com sucesso!')
      }
      setIsOpen(false)
      loadClients()
    } catch (error) {
      toast.error('Erro ao salvar cliente.')
    }
  }

  const handleDelete = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      const { error } = await deleteClient(id)
      if (error) {
        toast.error('Erro ao excluir cliente.')
      } else {
        toast.success('Cliente excluído.')
        loadClients()
      }
    }
  }

  const filteredClients = clients.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.document && c.document.includes(search)),
  )

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Meus Clientes</h1>
          <p className="text-muted-foreground">
            Gerencie sua base de clientes para facilitar a emissão de recibos.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()}>
          <Plus className="h-4 w-4 mr-2" />
          Novo Cliente
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Buscar por nome ou documento..."
              className="pl-9 max-w-md"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <div className="grid grid-cols-12 text-sm font-medium text-muted-foreground p-3 border-b bg-muted/50">
              <div className="col-span-5">Nome / Empresa</div>
              <div className="col-span-3">Documento</div>
              <div className="col-span-3">Contato</div>
              <div className="col-span-1 text-right">Ações</div>
            </div>

            {loading ? (
              <div className="p-8 text-center text-muted-foreground">Carregando clientes...</div>
            ) : filteredClients.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                Nenhum cliente encontrado.
              </div>
            ) : (
              <div className="divide-y">
                {filteredClients.map((client) => (
                  <div
                    key={client.id}
                    className="grid grid-cols-12 items-center p-3 text-sm hover:bg-muted/30 transition-colors"
                  >
                    <div className="col-span-5 font-medium">{client.name}</div>
                    <div className="col-span-3">{client.document || '-'}</div>
                    <div className="col-span-3 truncate text-muted-foreground">
                      {client.email && <div>{client.email}</div>}
                      {client.phone && <div>{client.phone}</div>}
                      {!client.email && !client.phone && '-'}
                    </div>
                    <div className="col-span-1 flex justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => handleOpenDialog(client)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive"
                        onClick={() => handleDelete(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>{editingClient ? 'Editar Cliente' : 'Novo Cliente'}</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente para utilizá-los rapidamente na emissão de documentos.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome Completo / Razão Social *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document">CPF ou CNPJ</Label>
                <Input
                  id="document"
                  value={formData.document}
                  onChange={(e) => setFormData((p) => ({ ...p, document: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefone / WhatsApp</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Endereço Completo</Label>
                <Input
                  id="address"
                  value={formData.address}
                  onChange={(e) => setFormData((p) => ({ ...p, address: e.target.value }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Salvar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
