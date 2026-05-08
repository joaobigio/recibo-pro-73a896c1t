import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { getProduct, createProduct, updateProduct } from '@/services/products'
import { toast } from 'sonner'
import { ArrowLeft, Loader2, Save } from 'lucide-react'

export default function ProductForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const isEditing = !!id
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(isEditing)

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    type: 'product' as 'product' | 'service',
  })

  useEffect(() => {
    if (isEditing) {
      loadProduct()
    }
  }, [id])

  const loadProduct = async () => {
    const { data } = await getProduct(id!)
    if (data) {
      setFormData({
        name: data.name,
        description: data.description || '',
        price: data.price.toString(),
        type: data.type,
      })
    } else {
      toast.error('Item não encontrado')
      navigate('/produtos')
    }
    setFetching(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name) {
      toast.error('O nome é obrigatório')
      return
    }

    setLoading(true)
    const payload = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price.replace(',', '.')) || 0,
      type: formData.type,
    }

    try {
      if (isEditing) {
        const { error } = await updateProduct(id!, payload)
        if (error) throw error
        toast.success('Item atualizado com sucesso!')
      } else {
        const { error } = await createProduct(payload)
        if (error) throw error
        toast.success('Item cadastrado com sucesso!')
      }
      navigate('/produtos')
    } catch (error) {
      toast.error('Erro ao salvar item')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="p-8 text-center text-muted-foreground">Carregando...</div>
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/produtos')}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEditing ? 'Editar Item' : 'Novo Item'}
          </h1>
          <p className="text-muted-foreground">Preencha os dados do produto ou serviço.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="space-y-3">
              <Label>Tipo de Item</Label>
              <RadioGroup
                value={formData.type}
                onValueChange={(v: any) => setFormData((p) => ({ ...p, type: v }))}
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="product" id="type-product" />
                  <Label htmlFor="type-product" className="cursor-pointer">
                    Produto
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service" id="type-service" />
                  <Label htmlFor="type-service" className="cursor-pointer">
                    Serviço
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="name">Nome do Item *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                  placeholder="Ex: Consultoria, Teclado Mecânico..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço Padrão (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData((p) => ({ ...p, price: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData((p) => ({ ...p, description: e.target.value }))}
                placeholder="Detalhes adicionais sobre o produto ou serviço..."
                rows={4}
              />
            </div>

            <div className="pt-4 flex justify-end">
              <Button type="submit" disabled={loading} className="min-w-[120px]">
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Salvar
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}
