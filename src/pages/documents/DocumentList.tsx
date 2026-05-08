import { useState, useEffect } from 'react'
import { getMyDocuments, Document } from '@/services/documents'
import { getClients, Client } from '@/services/clients'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog'
import { ReceiptPreview } from '@/components/receipts/ReceiptPreview'
import { Printer, Eye, Search } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function DocumentList() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [filterClient, setFilterClient] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('')

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [docsRes, clientsRes] = await Promise.all([getMyDocuments(user!.id), getClients()])
    if (docsRes.data) setDocuments(docsRes.data)
    if (clientsRes.data) setClients(clientsRes.data)
    setLoading(false)
  }

  const filteredDocs = documents.filter((doc) => {
    let match = true
    if (filterClient !== 'all' && doc.client_id !== filterClient) match = false
    if (filterDate && doc.created_at.split('T')[0] !== filterDate) match = false
    return match
  })

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const date = new Date(dateStr)
    return new Intl.DateTimeFormat('pt-BR').format(date)
  }

  const getTypeLabel = (type: string) => {
    const types: Record<string, string> = {
      receipt: 'Recibo',
      third_party: 'Terceiros',
      items: 'Com Itens',
      rent: 'Aluguel',
      promissory: 'Promissória',
      budget: 'Orçamento',
    }
    return types[type] || type
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in print:block print:p-0">
      <div className="flex justify-between items-center print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico de Documentos</h1>
          <p className="text-muted-foreground">
            Visualize e imprima seus recibos e documentos emitidos.
          </p>
        </div>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Filtrar por Cliente</Label>
            <Select value={filterClient} onValueChange={setFilterClient}>
              <SelectTrigger>
                <SelectValue placeholder="Todos os clientes" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os clientes</SelectItem>
                {clients.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Filtrar por Data</Label>
            <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} />
          </div>
          <div className="flex items-end gap-2">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setFilterClient('all')
                setFilterDate('')
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded-md print:hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Referente a</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead className="text-center w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Carregando documentos...
                </TableCell>
              </TableRow>
            ) : filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhum documento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>{getTypeLabel(doc.type)}</TableCell>
                  <TableCell>{doc.data?.clientName || 'N/A'}</TableCell>
                  <TableCell className="max-w-[200px] truncate" title={doc.data?.description}>
                    {doc.data?.description || '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(doc.amount)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-muted/30 print:p-0 print:border-none print:shadow-none print:bg-white print:max-w-none print:w-full">
                        <div className="p-4 border-b bg-background flex justify-between items-center print:hidden">
                          <h2 className="font-semibold">Visualização do Documento</h2>
                          <Button size="sm" onClick={() => window.print()}>
                            <Printer className="h-4 w-4 mr-2" />
                            Imprimir / PDF
                          </Button>
                        </div>
                        <div className="p-6 overflow-y-auto max-h-[80vh] print:max-h-none print:p-0 print:overflow-visible">
                          <ReceiptPreview data={doc.data} />
                        </div>
                      </DialogContent>
                    </Dialog>
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
