import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SignaturePad } from '@/components/SignaturePad'
import { ReceiptPreview } from '@/components/receipts/ReceiptPreview'
import { getProfile, Profile } from '@/services/profiles'
import { getClients, Client } from '@/services/clients'
import { createDocument } from '@/services/documents'
import { useAuth } from '@/hooks/use-auth'
import { toast } from 'sonner'
import { Printer, Share2, Save } from 'lucide-react'

export default function Generator() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [saving, setSaving] = useState(false)

  const [formData, setFormData] = useState({
    type: 'receipt',
    amount: 0,
    date: new Date().toISOString().split('T')[0],
    clientName: '',
    clientDocument: '',
    description: 'Serviços prestados',
    issuerName: '',
    issuerDocument: '',
    issuerPixKey: '',
    showPix: false,
    signature: null as string | null,
  })

  const handleClientNameChange = (name: string) => {
    setFormData((p) => ({ ...p, clientName: name }))
    const found = clients.find((c) => c.name.toLowerCase() === name.toLowerCase())
    if (found) {
      setFormData((p) => ({ ...p, clientDocument: found.document || '' }))
    }
  }

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
    }
  }, [user])

  const handleSave = async () => {
    if (!user) return
    setSaving(true)
    try {
      const { error } = await createDocument(user.id, {
        type: formData.type,
        amount: formData.amount,
        data: formData,
      })
      if (error) throw error
      toast.success('Recibo salvo com sucesso no histórico!')
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
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={formData.type === 'receipt' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'receipt' }))}
                  className="w-full"
                  size="sm"
                >
                  Recibo
                </Button>
                <Button
                  variant={formData.type === 'promissory' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'promissory' }))}
                  className="w-full"
                  size="sm"
                >
                  Promissória
                </Button>
                <Button
                  variant={formData.type === 'budget' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'budget' }))}
                  className="w-full"
                  size="sm"
                >
                  Orçamento
                </Button>
                <Button
                  variant={formData.type === 'service_order' ? 'default' : 'outline'}
                  onClick={() => setFormData((p) => ({ ...p, type: 'service_order' }))}
                  className="w-full"
                  size="sm"
                >
                  Ordem de Serviço
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={formData.amount || ''}
                onChange={(e) =>
                  setFormData((p) => ({ ...p, amount: parseFloat(e.target.value) || 0 }))
                }
              />
            </div>
            <div className="space-y-2">
              <Label>Data</Label>
              <Input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData((p) => ({ ...p, date: e.target.value }))}
              />
            </div>
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
                onChange={(e) => setFormData((p) => ({ ...p, clientDocument: e.target.value }))}
                placeholder="000.000.000-00"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Detalhes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Referente a (Descrição)</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="pix-toggle">Incluir QR Code PIX</Label>
              <Switch
                id="pix-toggle"
                checked={formData.showPix}
                onCheckedChange={(c) => setFormData((p) => ({ ...p, showPix: c }))}
              />
            </div>
            {formData.showPix && !formData.issuerPixKey && (
              <p className="text-xs text-destructive">
                Configure sua chave PIX no perfil (ou insira abaixo temporariamente).
              </p>
            )}
            {formData.showPix && (
              <div className="space-y-2 pt-2 border-t">
                <Label>Sua Chave PIX</Label>
                <Input
                  value={formData.issuerPixKey}
                  onChange={(e) => setFormData((p) => ({ ...p, issuerPixKey: e.target.value }))}
                />
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Assinatura</CardTitle>
          </CardHeader>
          <CardContent>
            <SignaturePad
              className="h-32 w-full"
              onSave={(sig) => setFormData((p) => ({ ...p, signature: sig }))}
            />
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
