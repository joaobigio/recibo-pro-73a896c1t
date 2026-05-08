import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useAuth } from '@/hooks/use-auth'
import { createClient, updateClient, getClients } from '@/services/clients'
import { toast } from 'sonner'
import { Search, Loader2 } from 'lucide-react'

export default function ClientForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [loading, setLoading] = useState(false)
  const [searchingCep, setSearchingCep] = useState(false)
  const [showAddressFields, setShowAddressFields] = useState(false)
  const [noDocument, setNoDocument] = useState(false)

  const [formData, setFormData] = useState({
    name: '',
    document: '',
    email: '',
    phone: '',
    pix_key_type: '',
    pix_key: '',
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
  })

  useEffect(() => {
    if (id) {
      loadClient()
    }
  }, [id])

  const loadClient = async () => {
    setLoading(true)
    const { data } = await getClients()
    const client = data?.find((c) => c.id === id)
    if (client) {
      setFormData({
        name: client.name || '',
        document: client.document || '',
        email: client.email || '',
        phone: client.phone || '',
        pix_key_type: client.pix_key_type || '',
        pix_key: client.pix_key || '',
        cep: client.cep || '',
        street: client.street || '',
        number: client.number || '',
        complement: client.complement || '',
        neighborhood: client.neighborhood || '',
        city: client.city || '',
        state: client.state || '',
      })
      setNoDocument(!client.document)
      if (client.street) setShowAddressFields(true)
    }
    setLoading(false)
  }

  const handleCepSearch = async () => {
    if (!formData.cep || formData.cep.length < 8) return

    setSearchingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${formData.cep.replace(/\D/g, '')}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setFormData((p) => ({
          ...p,
          street: data.logradouro || '',
          neighborhood: data.bairro || '',
          city: data.localidade || '',
          state: data.uf || '',
        }))
        setShowAddressFields(true)
      } else {
        toast.error('CEP não encontrado')
      }
    } catch (error) {
      toast.error('Erro ao buscar CEP')
    } finally {
      setSearchingCep(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const clientData = {
        ...formData,
        document: noDocument ? null : formData.document,
        user_id: user.id,
      }

      if (id) {
        const { error } = await updateClient(id, clientData)
        if (error) throw error
        toast.success('Cliente atualizado com sucesso!')
      } else {
        const { error } = await createClient(clientData)
        if (error) throw error
        toast.success('Cliente cadastrado com sucesso!')
      }
      navigate('/clientes')
    } catch (error) {
      toast.error('Erro ao salvar cliente')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto py-6 animate-fade-in">
      <div className="mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cadastrar Cliente</h1>
          <p className="text-muted-foreground">
            Preencha os campos abaixo para cadastrar um novo cliente
          </p>
        </div>
        <Button variant="outline" onClick={() => navigate('/clientes')}>
          Listar
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Dados Pessoais</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="document">CPF ou CNPJ {!noDocument && '*'}</Label>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="noDocument"
                    checked={noDocument}
                    onCheckedChange={(c) => setNoDocument(c as boolean)}
                  />
                  <Label htmlFor="noDocument" className="font-normal text-sm">
                    Sem documento
                  </Label>
                </div>
              </div>
              <Input
                id="document"
                disabled={noDocument}
                required={!noDocument}
                value={formData.document}
                onChange={(e) => setFormData((p) => ({ ...p, document: e.target.value }))}
                placeholder="CPF ou CNPJ"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nome *</Label>
              <Input
                id="name"
                required
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                placeholder="Nome completo do cliente"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Informações de Contato</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData((p) => ({ ...p, email: e.target.value }))}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Chave PIX</CardTitle>
            <CardDescription>Utilizada nos recibos para terceiros</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo da Chave</Label>
                <Select
                  value={formData.pix_key_type}
                  onValueChange={(v) => setFormData((p) => ({ ...p, pix_key_type: v }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cpf">CPF/CNPJ</SelectItem>
                    <SelectItem value="phone">Celular</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="random">Chave Aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input
                  id="pix_key"
                  value={formData.pix_key}
                  onChange={(e) => setFormData((p) => ({ ...p, pix_key: e.target.value }))}
                  placeholder="Digite a chave PIX"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-card">
          <CardHeader>
            <CardTitle className="text-lg">Endereço</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cep">CEP</Label>
              <div className="flex space-x-2 max-w-xs">
                <Input
                  id="cep"
                  value={formData.cep}
                  onChange={(e) => setFormData((p) => ({ ...p, cep: e.target.value }))}
                  placeholder="00000-000"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={handleCepSearch}
                  disabled={searchingCep}
                >
                  {searchingCep ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Digite o CEP e clique no botão para buscar o endereço
              </p>
              {!showAddressFields && (
                <Button
                  type="button"
                  variant="link"
                  className="px-0 h-auto text-sm"
                  onClick={() => setShowAddressFields(true)}
                >
                  Preencher endereço manualmente
                </Button>
              )}
            </div>

            {showAddressFields && (
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4 pt-4 border-t animate-fade-in-down">
                <div className="space-y-2 md:col-span-4">
                  <Label htmlFor="street">Logradouro</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData((p) => ({ ...p, street: e.target.value }))}
                    placeholder="Rua, Avenida, etc"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="number">Número</Label>
                  <Input
                    id="number"
                    value={formData.number}
                    onChange={(e) => setFormData((p) => ({ ...p, number: e.target.value }))}
                    placeholder="123"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="complement">Complemento</Label>
                  <Input
                    id="complement"
                    value={formData.complement}
                    onChange={(e) => setFormData((p) => ({ ...p, complement: e.target.value }))}
                    placeholder="Apto, Sala, Bloco"
                  />
                </div>
                <div className="space-y-2 md:col-span-3">
                  <Label htmlFor="neighborhood">Bairro</Label>
                  <Input
                    id="neighborhood"
                    value={formData.neighborhood}
                    onChange={(e) => setFormData((p) => ({ ...p, neighborhood: e.target.value }))}
                    placeholder="Bairro"
                  />
                </div>
                <div className="space-y-2 md:col-span-4">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData((p) => ({ ...p, city: e.target.value }))}
                    placeholder="Cidade"
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="state">Estado</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData((p) => ({ ...p, state: e.target.value }))}
                    placeholder="UF"
                    maxLength={2}
                  />
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => navigate('/clientes')}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading} className="min-w-[150px]">
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </div>
      </form>
    </div>
  )
}
