import { useState, useEffect } from 'react'
import { getMyDocuments, Document } from '@/services/documents'
import { getClients, Client } from '@/services/clients'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { ReceiptPreview } from '@/components/receipts/ReceiptPreview'
import { Printer, Eye, Search, Download } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function DocumentList() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [searchName, setSearchName] = useState<string>('')
  const [filterDate, setFilterDate] = useState<string>('')

  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [autoPrint, setAutoPrint] = useState(false)

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

  useEffect(() => {
    if (isPreviewOpen && autoPrint) {
      const timer = setTimeout(() => {
        window.print()
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [isPreviewOpen, autoPrint])

  const handleOpenPreview = (doc: Document) => {
    setSelectedDoc(doc)
    setAutoPrint(false)
    setIsPreviewOpen(true)
  }

  const handleDownloadPdf = (doc: Document) => {
    setSelectedDoc(doc)
    setAutoPrint(true)
    setIsPreviewOpen(true)
  }

  const filteredDocs = documents.filter((doc) => {
    let match = true
    if (searchName) {
      const clientName = doc.data?.clientName || ''
      if (!clientName.toLowerCase().includes(searchName.toLowerCase())) {
        match = false
      }
    }
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
            <Label>Buscar por Cliente</Label>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Nome do cliente..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="pl-8"
              />
            </div>
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
                setSearchName('')
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
              <TableHead>Status</TableHead>
              <TableHead className="text-center w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Carregando documentos...
                </TableCell>
              </TableRow>
            ) : filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
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
                  <TableCell>
                    <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 text-foreground">
                      {doc.status === 'issued' ? 'Emitido' : doc.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex justify-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Visualizar"
                        onClick={() => handleOpenPreview(doc)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        title="Baixar PDF"
                        onClick={() => handleDownloadPdf(doc)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-muted/30 print:p-0 print:border-none print:shadow-none print:bg-white print:max-w-none print:w-full">
          <div className="p-4 border-b bg-background flex justify-between items-center print:hidden">
            <h2 className="font-semibold">Visualização do Documento</h2>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir / PDF
            </Button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh] print:max-h-none print:p-0 print:overflow-visible flex justify-center">
            {selectedDoc && <ReceiptPreview data={selectedDoc.data} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
