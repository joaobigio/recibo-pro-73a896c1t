import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ReceiptPreview } from '@/components/receipts/ReceiptPreview'
import { useSearchParams } from 'react-router-dom'
import { getProfile, Profile } from '@/services/profiles'
import { getClients, Client } from '@/services/clients'
import { createDocument, getNextDocumentNumber } from '@/services/documents'
import { useAuth } from '@/hooks/use-auth'
import { maskCpfCnpj } from '@/lib/format'
import { toast } from 'sonner'
import { Printer, Share2, Save, Search, Plus, Trash2 } from 'lucide-react'

export default function Generator() {
  const { user } = useAuth()
  const [searchParams] = useSearchParams()
  const initialType = searchParams.get('type') || 'receipt'
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)
  const [nextDocNumber, setNextDocNumber] = useState<number>(1)

  const [formData, setFormData] = useState<any>({
    type: initialType,
    template: 'classic',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientDocument: '',
    clientPixKey: '',
    clientPixKeyType: '',
    clientStreet: '',
    clientNumber: '',
    clientNeighborhood: '',
    clientCity: '',
    clientState: '',
    clientCep: '',
    description: 'Serviços prestados',
    issuerName: '',
    issuerDocument: '',
    issuerPixKey: '',
    paymentMethod: '',
    paymentMethodDetails: '',
    documentNumber: '',
    observations: '',
    items: [] as { id: string; description: string; quantity: number; unitPrice: number }[],
    discount: 0,
    surcharge: 0,
    subtotal: 0,
  })

  const [searchingCep, setSearchingCep] = useState(false)

  const handleCepSearch = async () => {
    const cleanCep = formData.clientCep.replace(/\D/g, '')
    if (cleanCep.length !== 8) {
      toast.error('CEP inválido')
      return
    }

    setSearchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setFormData((p: any) => ({
          ...p,
          clientStreet: data.logradouro || '',
          clientNeighborhood: data.bairro || '',
          clientCity: data.localidade || '',
          clientState: data.uf || '',
        }))
        toast.success('Endereço preenchido via CEP!')
      } else {
        toast.error('CEP não encontrado')
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setSearchingCep(false)
    }
  }

  const addItem = () => {
    setFormData((p: any) => ({
      ...p,
      items: [...p.items, { id: crypto.randomUUID(), description: '', quantity: 1, unitPrice: 0 }],
    }))
  }

  const removeItem = (id: string) => {
    setFormData((p: any) => ({
      ...p,
      items: p.items.filter((i: any) => i.id !== id),
    }))
  }

  const updateItem = (id: string, field: string, value: any) => {
    setFormData((p: any) => ({
      ...p,
      items: p.items.map((i: any) => (i.id === id ? { ...i, [field]: value } : i)),
    }))
  }

  useEffect(() => {
    if (formData.items && formData.items.length > 0) {
      const subtotal = formData.items.reduce(
        (acc: number, item: any) =>
          acc + (Number(item.quantity) || 0) * (Number(item.unitPrice) || 0),
        0,
      )
      const discount = Number(formData.discount) || 0
      const surcharge = Number(formData.surcharge) || 0
      const total = subtotal - discount + surcharge

      if (formData.subtotal !== subtotal || formData.amount !== total) {
        setFormData((p: any) => ({ ...p, subtotal, amount: total > 0 ? total : 0 }))
      }
    }
  }, [formData.items, formData.discount, formData.surcharge])

  const handleClientNameChange = (name: string) => {
    setFormData((p: any) => ({ ...p, clientName: name }))
    const found = clients.find((c) => c.name.toLowerCase() === name.toLowerCase())
    if (found) {
      setFormData((p: any) => ({
        ...p,
        clientDocument: found.document || '',
        clientPixKey: found.pix_key || '',
        clientPixKeyType: found.pix_key_type || '',
        clientStreet: found.street || '',
        clientNumber: found.number || '',
        clientNeighborhood: found.neighborhood || '',
        clientCity: found.city || '',
        clientState: found.state || '',
        clientCep: found.cep || '',
      }))
    } else if (name.trim() === '') {
      setFormData((p: any) => ({
        ...p,
        clientDocument: '',
        clientPixKey: '',
        clientPixKeyType: '',
        clientStreet: '',
        clientNumber: '',
        clientNeighborhood: '',
        clientCity: '',
        clientState: '',
        clientCep: '',
      }))
    }
  }

  useEffect(() => {
    const type = searchParams.get('type')
    if (type) {
      setFormData((p) => ({ ...p, type }))
    }
  }, [searchParams])

  useEffect(() => {
    if (user) {
      getProfile(user.id).then(({ data }) => {
        if (data) {
          setProfile(data)
          setFormData((prev) => ({
            ...prev,
            issuerName: data.name || '',
            issuerDocument: data.document || '',
            issuerPixKey: data.pix_key || '',
          }))
        }
      })
      getClients().then(({ data }) => {
        if (data) setClients(data)
      })
      getNextDocumentNumber(user.id).then((num) => {
        setNextDocNumber(num)
        setFormData((prev: any) => ({
          ...prev,
          documentNumber: String(num).padStart(3, '0'),
        }))
      })
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return

    if ((formData.description || '').length > 150) {
      toast.error('O campo "Referente a" deve ter no máximo 150 caracteres.')
      return
    }

    if ((formData.observations || '').length > 300) {
      toast.error('O campo "Observações" deve ter no máximo 300 caracteres.')
      return
    }

    setSaving(true)
    try {
      const foundClient = clients.find(
        (c) => c.name.toLowerCase() === formData.clientName.toLowerCase(),
      )

      const { error } = await createDocument(user.id, {
        type: formData.type,
        amount: formData.amount,
        client_id: foundClient ? foundClient.id : undefined,
        document_number: nextDocNumber,
        data: {
          ...formData,
          documentNumber: String(nextDocNumber).padStart(3, '0'),
          payment_method: formData.paymentMethod,
          pix_key: formData.issuerPixKey,
          client_pix_key: formData.clientPixKey,
          client_pix_key_type: formData.clientPixKeyType,
        },
      })
      if (error) throw error
      toast.success('Recibo salvo com sucesso no histórico!')

      const newNum = nextDocNumber + 1
      setNextDocNumber(newNum)
      setFormData((prev: any) => ({
        ...prev,
        documentNumber: String(newNum).padStart(3, '0'),
      }))
    } catch (error) {
      toast.error('Erro ao salvar o recibo.')
    } finally {
      setSaving(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="h-full flex flex-col xl:flex-row gap-6 animate-fade-in print:block print:p-0">
      {/* Form Area - Hidden on print */}
      <div className="w-full xl:w-1/3 flex flex-col gap-4 print:hidden overflow-y-auto pb-8">
        <div>
          <h1 className="text-2xl font-bold">Gerar Documento</h1>
          <p className="text-muted-foreground">Preencha os dados e veja o preview ao lado.</p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Dados Principais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Label>Tipo de Documento</Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Button
                  variant={formData.type === 'receipt' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'receipt' }))}
                  size="sm"
                >
                  Tradicional
                </Button>
                <Button
                  variant={formData.type === 'third_party' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'third_party' }))}
                  size="sm"
                >
                  Terceiros
                </Button>
                <Button
                  variant={formData.type === 'items' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'items' }))}
                  size="sm"
                >
                  Com Itens
                </Button>
                <Button
                  variant={formData.type === 'rent' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'rent' }))}
                  size="sm"
                >
                  Aluguel
                </Button>
                <Button
                  variant={formData.type === 'promissory' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'promissory' }))}
                  size="sm"
                >
                  Promissória
                </Button>
                <Button
                  variant={formData.type === 'budget' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'budget' }))}
                  size="sm"
                >
                  Orçamento
                </Button>
              </div>
            </div>
            <div className="space-y-3">
              <Label>Layout do Documento</Label>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant={formData.template === 'classic' ? 'default' : 'outline'}
                  onClick={() => setFormData((p: any) => ({ ...p, template: 'classic' }))}
                  size="sm"
                  className={formData.template === 'classic' ? 'bg-slate-800 text-white' : ''}
                >
                  Clássico
                </Button>
                <Button
                  variant={formData.template === 'modern' ? 'default' : 'outline'}
                  onClick={() => setFormData((p: any) => ({ ...p, template: 'modern' }))}
                  size="sm"
                  className={formData.template === 'modern' ? 'bg-slate-800 text-white' : ''}
                >
                  Moderno
                </Button>
                <Button
                  variant={formData.template === 'minimalist' ? 'default' : 'outline'}
                  onClick={() => setFormData((p: any) => ({ ...p, template: 'minimalist' }))}
                  size="sm"
                  className={formData.template === 'minimalist' ? 'bg-slate-800 text-white' : ''}
                >
                  Minimalista
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nº do Recibo/Documento</Label>
                <Input
                  value={formData.documentNumber || ''}
                  readOnly
                  disabled
                  className="bg-muted font-medium"
                />
              </div>
              <div className="space-y-2">
                <Label>Data</Label>
                <Input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData((p: any) => ({ ...p, date: e.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor Total (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                disabled={formData.items && formData.items.length > 0}
                value={
                  formData.amount === 0 && (!formData.items || formData.items.length === 0)
                    ? ''
                    : formData.amount
                }
                onChange={(e) =>
                  setFormData((p: any) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))
                }
                placeholder={
                  formData.items && formData.items.length > 0 ? 'Calculado automaticamente' : '0.00'
                }
              />
              {formData.items && formData.items.length > 0 && (
                <p className="text-xs text-muted-foreground">Valor calculado com base nos itens.</p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Forma de Pagamento</Label>
              <Select
                value={formData.paymentMethod || undefined}
                onValueChange={(val) => setFormData((p: any) => ({ ...p, paymentMethod: val }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">Pix</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="cartao_credito">Cartão de Crédito</SelectItem>
                  <SelectItem value="cartao_debito">Cartão de Débito</SelectItem>
                  <SelectItem value="transferencia">Transferência Bancária</SelectItem>
                  <SelectItem value="boleto">Boleto</SelectItem>
                  <SelectItem value="outros">Outros</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {formData.paymentMethod === 'outros' && (
              <div className="space-y-2">
                <Label>Especifique a forma de pagamento</Label>
                <Input
                  value={formData.paymentMethodDetails || ''}
                  onChange={(e) =>
                    setFormData((p: any) => ({ ...p, paymentMethodDetails: e.target.value }))
                  }
                  placeholder="Ex: Cheque"
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Cliente</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nome do Cliente</Label>
              <div className="relative group">
                <Input
                  value={formData.clientName}
                  onChange={(e) => handleClientNameChange(e.target.value)}
                  placeholder="Digite para buscar ou adicionar novo..."
                  className="peer"
                  autoComplete="off"
                />
                {formData.clientName &&
                  clients.filter(
                    (c) =>
                      c.name.toLowerCase().includes(formData.clientName.toLowerCase()) &&
                      c.name.toLowerCase() !== formData.clientName.toLowerCase(),
                  ).length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg opacity-0 invisible peer-focus:opacity-100 peer-focus:visible hover:opacity-100 hover:visible transition-all max-h-48 overflow-y-auto">
                      {clients
                        .filter(
                          (c) =>
                            c.name.toLowerCase().includes(formData.clientName.toLowerCase()) &&
                            c.name.toLowerCase() !== formData.clientName.toLowerCase(),
                        )
                        .map((client) => (
                          <div
                            key={client.id}
                            className="px-3 py-2 cursor-pointer hover:bg-muted text-sm border-b last:border-0"
                            onMouseDown={(e) => {
                              // Usamos onMouseDown para engatilhar antes do onBlur do input
                              e.preventDefault()
                              handleClientNameChange(client.name)
                            }}
                          >
                            <p className="font-medium">{client.name}</p>
                            {client.document && (
                              <p className="text-xs text-muted-foreground">{client.document}</p>
                            )}
                          </div>
                        ))}
                    </div>
                  )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>CPF/CNPJ do Cliente</Label>
              <Input
                value={formData.clientDocument}
                onChange={(e) =>
                  setFormData((p: any) => ({ ...p, clientDocument: maskCpfCnpj(e.target.value) }))
                }
                placeholder="000.000.000-00 ou 00.000.000/0000-00"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>CEP</Label>
                <div className="flex gap-2">
                  <Input
                    value={formData.clientCep}
                    onChange={(e) => setFormData((p: any) => ({ ...p, clientCep: e.target.value }))}
                    placeholder="00000-000"
                    onBlur={(e) => {
                      if (e.target.value.replace(/\D/g, '').length === 8) {
                        handleCepSearch()
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={handleCepSearch}
                    disabled={searchingCep}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Rua / Logradouro</Label>
                <Input
                  value={formData.clientStreet}
                  onChange={(e) =>
                    setFormData((p: any) => ({ ...p, clientStreet: e.target.value }))
                  }
                  placeholder="Nome da rua"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Número</Label>
                <Input
                  value={formData.clientNumber}
                  onChange={(e) =>
                    setFormData((p: any) => ({ ...p, clientNumber: e.target.value }))
                  }
                  placeholder="123"
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Bairro</Label>
                <Input
                  value={formData.clientNeighborhood}
                  onChange={(e) =>
                    setFormData((p: any) => ({ ...p, clientNeighborhood: e.target.value }))
                  }
                  placeholder="Bairro"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Input
                  value={formData.clientCity}
                  onChange={(e) => setFormData((p: any) => ({ ...p, clientCity: e.target.value }))}
                  placeholder="Cidade"
                />
              </div>
              <div className="space-y-2">
                <Label>Estado (UF)</Label>
                <Input
                  value={formData.clientState}
                  onChange={(e) => setFormData((p: any) => ({ ...p, clientState: e.target.value }))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Chave PIX</Label>
                <Select
                  value={formData.clientPixKeyType || undefined}
                  onValueChange={(val) =>
                    setFormData((p: any) => ({ ...p, clientPixKeyType: val }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="phone">Telefone</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Chave PIX</Label>
                <Input
                  value={formData.clientPixKey || ''}
                  onChange={(e) =>
                    setFormData((p: any) => ({ ...p, clientPixKey: e.target.value }))
                  }
                  placeholder="Chave PIX do cliente"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3 flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Itens do Documento</CardTitle>
            <Button type="button" variant="outline" size="sm" onClick={addItem}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Item
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {formData.items && formData.items.length > 0 ? (
              <div className="space-y-4">
                {formData.items.map((item: any) => (
                  <div
                    key={item.id}
                    className="grid grid-cols-12 gap-2 items-end border p-3 rounded-md bg-muted/20"
                  >
                    <div className="col-span-12 md:col-span-5 space-y-1">
                      <Label className="text-xs">Descrição</Label>
                      <Input
                        value={item.description}
                        onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                        placeholder="Nome do item/serviço"
                      />
                    </div>
                    <div className="col-span-4 md:col-span-2 space-y-1">
                      <Label className="text-xs">Qtd</Label>
                      <Input
                        type="number"
                        min="1"
                        step="0.01"
                        value={item.quantity}
                        onChange={(e) =>
                          updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="col-span-6 md:col-span-3 space-y-1">
                      <Label className="text-xs">Valor Unit.</Label>
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.unitPrice}
                        onChange={(e) =>
                          updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)
                        }
                      />
                    </div>
                    <div className="col-span-2 md:col-span-2 flex justify-end">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        className="text-red-500 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>Desconto (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.discount === 0 ? '' : formData.discount}
                      onChange={(e) =>
                        setFormData((p: any) => ({
                          ...p,
                          discount: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Acréscimo (R$)</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={formData.surcharge === 0 ? '' : formData.surcharge}
                      onChange={(e) =>
                        setFormData((p: any) => ({
                          ...p,
                          surcharge: parseFloat(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2 flex flex-col justify-end">
                    <div className="text-sm font-medium flex justify-between">
                      <span>Subtotal:</span>
                      <span>R$ {(formData.subtotal || 0).toFixed(2)}</span>
                    </div>
                    <div className="text-base font-bold flex justify-between text-primary">
                      <span>Total:</span>
                      <span>R$ {(formData.amount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                <p className="text-sm">Nenhum item adicionado.</p>
                <p className="text-xs mt-1">O valor total será manual se não houver itens.</p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detalhes Adicionais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Referente a (Descrição Resumida)</Label>
                <span className="text-xs text-muted-foreground">
                  {(formData.description || '').length}/150
                </span>
              </div>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p: any) => ({ ...p, description: e.target.value }))}
                maxLength={150}
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Observações</Label>
                <span className="text-xs text-muted-foreground">
                  {(formData.observations || '').length}/300
                </span>
              </div>
              <Textarea
                value={formData.observations || ''}
                onChange={(e) => setFormData((p: any) => ({ ...p, observations: e.target.value }))}
                placeholder="Observações que aparecerão no rodapé do documento..."
                maxLength={300}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Preview Area */}
      <div className="w-full xl:w-2/3 flex flex-col bg-muted/30 p-4 md:p-8 rounded-lg overflow-y-auto print:p-0 print:bg-white border print:border-none relative">
        <div className="absolute top-4 right-4 flex gap-2 print:hidden flex-wrap justify-end">
          <Button variant="outline" size="sm" onClick={handleSave} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const titles: Record<string, string> = {
                receipt: 'Recibo',
                promissory: 'Nota Promissória',
                budget: 'Orçamento',
                service_order: 'Ordem de Serviço',
              }
              const title = titles[formData.type] || 'Documento'
              const text = `Olá ${formData.clientName}! Aqui está o seu ${title} no valor de R$ ${formData.amount.toFixed(2).replace('.', ',')}.\nReferente a: ${formData.description}`
              window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
            }}
            className="text-green-600 hover:text-green-700 hover:bg-green-50 border-green-200"
          >
            <Share2 className="h-4 w-4 mr-2" />
            WhatsApp
          </Button>
          <Button variant="default" size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4 mr-2" />
            Imprimir / PDF
          </Button>
        </div>

        <div className="mt-12 xl:mt-0 print:mt-0 flex-1 flex justify-center">
          <ReceiptPreview data={formData} />
        </div>
      </div>
    </div>
  )
}
