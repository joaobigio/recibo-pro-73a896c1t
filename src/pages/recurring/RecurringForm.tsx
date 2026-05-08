import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { getClients, Client } from '@/services/clients'
import { createRecurringDocument } from '@/services/recurring'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

export default function RecurringForm() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [clients, setClients] = useState<Client[]>([])

  const [formData, setFormData] = useState({
    title: '',
    client_id: '',
    amount: '',
    frequency: 'monthly',
    next_date: new Date().toISOString().split('T')[0],
    description: '',
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    const { data } = await getClients()
    if (data) setClients(data)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!formData.client_id) {
      toast.error('Selecione um cliente')
      return
    }

    setLoading(true)
    const amountParsed = parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')) || 0

    const client = clients.find((c) => c.id === formData.client_id)

    const payload = {
      title: formData.title,
      client_id: formData.client_id,
      amount: amountParsed,
      frequency: formData.frequency,
      next_date: formData.next_date,
      active: true,
      document_data: {
        template: 'classic',
        amount: amountParsed,
        clientName: client?.name || '',
        clientDocument: client?.document || '',
        description: formData.description,
        type: 'receipt',
        paymentMethods: [{ type: 'Pix' }],
      },
    }

    try {
      const { error } = await createRecurringDocument(user.id, payload)
      if (error) throw error
      toast.success('Agendamento criado com sucesso!')
      navigate('/agendamentos')
    } catch (error) {
      toast.error('Erro ao salvar agendamento')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/agendamentos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Novo Agendamento</h1>
          <p className="text-muted-foreground">
            Configure um recibo para ser gerado automaticamente.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="title">Título do Agendamento *</Label>
                <Input
                  id="title"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
                  placeholder="Ex: Mensalidade Consultoria"
                />
              </div>

              <div className="space-y-2">
                <Label>Cliente *</Label>
                <Select
                  value={formData.client_id}
                  onValueChange={(v) => setFormData((p) => ({ ...p, client_id: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cliente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor do Recibo (R$) *</Label>
                <Input
                  id="amount"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
                  placeholder="0,00"
                />
              </div>
              <div className="space-y-2">
                <Label>Frequência *</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(v) => setFormData((p) => ({ ...p, frequency: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="next_date">Data do 1º Envio *</Label>
                <Input
                  id="next_date"
                  type="date"
                  required
                  value={formData.next_date}
                  onChange={(e) => setFormData((p) => ({ ...p, next_date: e.target.value }))}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição Padrão do Recibo</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Ex: Referente a prestação de serviços de manutenção mensal..."
                rows={3}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar Agendamento
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
