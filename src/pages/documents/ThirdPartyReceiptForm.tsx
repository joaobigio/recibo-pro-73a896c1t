import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAuth } from '@/hooks/use-auth'
import { getClients, Client } from '@/services/clients'
import { createDocument } from '@/services/documents'
import { toast } from 'sonner'
import { Plus, X, Loader2 } from 'lucide-react'

export default function ThirdPartyReceiptForm() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)

  const [formData, setFormData] = useState({
    template: 'classic',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    client_id: '',
    reference: 'à',
    description: '',
    observations: '',
    payment_methods: [{ type: 'Dinheiro' }],
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    const { data } = await getClients()
    if (data) setClients(data)
  }

  const addPaymentMethod = () => {
    setFormData((p) => ({
      ...p,
      payment_methods: [...p.payment_methods, { type: 'Dinheiro' }],
    }))
  }

  const removePaymentMethod = (index: number) => {
    setFormData((p) => ({
      ...p,
      payment_methods: p.payment_methods.filter((_, i) => i !== index),
    }))
  }

  const updatePaymentMethod = (index: number, type: string) => {
    setFormData((p) => {
      const newMethods = [...p.payment_methods]
      newMethods[index].type = type
      return { ...p, payment_methods: newMethods }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.amount || !formData.client_id) {
      toast.error('Preencha os campos obrigatórios (Valor e Cliente)')
      return
    }

    setLoading(true)
    try {
      const client = clients.find((c) => c.id === formData.client_id)

      const amountParsed = parseFloat(formData.amount.replace(/\./g, '').replace(',', '.')) || 0

      const docData = {
        type: 'third_party',
        amount: amountParsed,
        client_id: formData.client_id,
        data: {
          template: formData.template,
          amount: amountParsed,
          date: formData.date,
          clientName: client?.name || '',
          clientDocument: client?.document || '',
          referencePrefix: formData.reference,
          description: formData.description,
          observations: formData.observations,
          paymentMethods: formData.payment_methods,
          type: 'third_party',
        },
      }

      const { error } = await createDocument(user.id, docData)
      if (error) throw error

      toast.success('Recibo emitido com sucesso!')
      navigate('/gerador?type=third_party')
    } catch (error) {
      toast.error('Erro ao salvar recibo')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto py-6 animate-fade-in">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
            <span>Recibos</span>
            <span>{'>'}</span>
            <span>Novo</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary">
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Recibo para Terceiros</h1>
              <p className="text-sm text-muted-foreground">
                Preencha os campos abaixo para emitir um recibo para terceiros
              </p>
            </div>
          </div>
        </div>
        <Button variant="outline" onClick={() => navigate('/gerador?type=third_party')}>
          Listar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Valor *</Label>
            <Input
              id="amount"
              required
              value={formData.amount}
              onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
              placeholder="R$ 0,00"
              className="text-lg font-medium"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Data de pagamento *</Label>
            <Input
              id="date"
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Layout do Recibo</Label>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={formData.template === 'classic' ? 'default' : 'outline'}
              onClick={() => setFormData((p) => ({ ...p, template: 'classic' }))}
              className={formData.template === 'classic' ? 'bg-slate-800 text-white' : ''}
            >
              Clássico
            </Button>
            <Button
              type="button"
              variant={formData.template === 'modern' ? 'default' : 'outline'}
              onClick={() => setFormData((p) => ({ ...p, template: 'modern' }))}
              className={formData.template === 'modern' ? 'bg-slate-800 text-white' : ''}
            >
              Moderno
            </Button>
            <Button
              type="button"
              variant={formData.template === 'minimalist' ? 'default' : 'outline'}
              onClick={() => setFormData((p) => ({ ...p, template: 'minimalist' }))}
              className={formData.template === 'minimalist' ? 'bg-slate-800 text-white' : ''}
            >
              Minimalista
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Cliente *</Label>
          <div className="flex gap-2">
            <div className="flex-1">
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
            <Button type="button" variant="outline" onClick={() => navigate('/clientes/cadastrar')}>
              <Plus className="h-4 w-4 mr-2" />
              Novo cliente
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          <Label>Referente *</Label>
          <RadioGroup
            value={formData.reference}
            onValueChange={(v) => setFormData((p) => ({ ...p, reference: v }))}
            className="flex gap-6"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="à" id="ref-a" />
              <Label htmlFor="ref-a" className="font-normal cursor-pointer">
                à
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="às" id="ref-as" />
              <Label htmlFor="ref-as" className="font-normal cursor-pointer">
                às
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="ao" id="ref-ao" />
              <Label htmlFor="ref-ao" className="font-normal cursor-pointer">
                ao
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="aos" id="ref-aos" />
              <Label htmlFor="ref-aos" className="font-normal cursor-pointer">
                aos
              </Label>
            </div>
          </RadioGroup>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="description">Descrição *</Label>
            <Button type="button" variant="ghost" size="sm" className="h-8 text-xs text-primary">
              <Plus className="h-3 w-3 mr-1" /> Digitar manual
            </Button>
          </div>
          <Input
            id="description"
            required
            value={formData.description}
            onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
            placeholder="Ex: Prestação de serviços..."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="observations">Observações</Label>
          <Textarea
            id="observations"
            value={formData.observations}
            onChange={(e) => setFormData((p) => ({ ...p, observations: e.target.value }))}
            placeholder="Observações adicionais..."
            className="resize-none"
            rows={4}
            maxLength={510}
          />
          <div className="text-xs text-muted-foreground text-right">
            {formData.observations.length} / 510 caracteres
          </div>
        </div>

        <div className="space-y-4 pt-4">
          <h3 className="font-medium text-sm text-muted-foreground">Formas de Pagamento</h3>

          <div className="space-y-3">
            {formData.payment_methods.map((pm, idx) => (
              <div key={idx} className="flex gap-2 items-center">
                <div className="flex-1">
                  <Select value={pm.type} onValueChange={(v) => updatePaymentMethod(idx, v)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Forma de pagamento" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Pix">Pix</SelectItem>
                      <SelectItem value="Cartão de crédito">Cartão de crédito</SelectItem>
                      <SelectItem value="Cartão de débito">Cartão de débito</SelectItem>
                      <SelectItem value="Transferência bancária">Transferência bancária</SelectItem>
                      <SelectItem value="Cheque">Cheque</SelectItem>
                      <SelectItem value="Boleto">Boleto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {idx > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removePaymentMethod(idx)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full border-dashed"
            onClick={addPaymentMethod}
          >
            <Plus className="h-4 w-4 mr-2" />
            Adicionar outra forma de pagamento
          </Button>
        </div>

        <div className="flex justify-end pt-6">
          <Button
            type="submit"
            size="lg"
            disabled={loading}
            className="w-full md:w-auto min-w-[150px]"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </div>
  )
}
