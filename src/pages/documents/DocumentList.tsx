import { useState, useEffect } from 'react'
import { getAllDocuments, Document, deleteDocument } from '@/services/documents'
import { getClients, Client } from '@/services/clients'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { ReceiptPreview } from '@/components/receipts/ReceiptPreview'
import { Printer, Eye, Search, Download, Trash2, Layers } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { toast } from 'sonner'

export default function DocumentList() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)

  const [searchName, setSearchName] = useState<string>('')
  const [startDate, setStartDate] = useState<string>('')
  const [endDate, setEndDate] = useState<string>('')

  const [previewDocs, setPreviewDocs] = useState<Document[]>([])
  const [isPreviewOpen, setIsPreviewOpen] = useState(false)
  const [autoPrint, setAutoPrint] = useState(false)
  const [docToDelete, setDocToDelete] = useState<Document | null>(null)

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    setLoading(true)
    const [docsRes, clientsRes] = await Promise.all([getAllDocuments(), getClients()])
    if (docsRes.data) setDocuments(docsRes.data as any)
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
    setPreviewDocs([doc])
    setAutoPrint(false)
    setIsPreviewOpen(true)
  }

  const handleDownloadPdf = (doc: Document) => {
    setPreviewDocs([doc])
    setAutoPrint(true)
    setIsPreviewOpen(true)
  }

  const handleBatchExport = () => {
    if (selectedIds.size === 0) return
    toast.success('Iniciando exportação em lote...')
    const docsToExport = documents.filter((d) => selectedIds.has(d.id))
    setPreviewDocs(docsToExport)
    setAutoPrint(true)
    setIsPreviewOpen(true)
  }

  const filteredDocs = documents.filter((doc) => {
    let match = true

    // Filtro por nome do cliente
    if (searchName) {
      const client = clients.find((c) => c.id === doc.client_id)
      const clientName = client?.name || doc.data?.clientName || ''
      if (!clientName.toLowerCase().includes(searchName.toLowerCase())) {
        match = false
      }
    }

    // Filtro por data
    const docDate = doc.created_at.split('T')[0]
    if (startDate && docDate < startDate) match = false
    if (endDate && docDate > endDate) match = false

    return match
  })

  const isAllSelected = filteredDocs.length > 0 && filteredDocs.every((d) => selectedIds.has(d.id))

  const handleSelectAll = (checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) {
      filteredDocs.forEach((d) => newSet.add(d.id))
    } else {
      filteredDocs.forEach((d) => newSet.delete(d.id))
    }
    setSelectedIds(newSet)
  }

  const handleSelectRow = (id: string, checked: boolean) => {
    const newSet = new Set(selectedIds)
    if (checked) newSet.add(id)
    else newSet.delete(id)
    setSelectedIds(newSet)
  }

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)
  }

  const handleDelete = async () => {
    if (!docToDelete) return
    const { error } = await deleteDocument(docToDelete.id)
    if (error) {
      toast.error('Erro ao excluir documento.')
    } else {
      toast.success('Documento excluído com sucesso.')
      setDocuments(documents.filter((d) => d.id !== docToDelete.id))
      const newSet = new Set(selectedIds)
      newSet.delete(docToDelete.id)
      setSelectedIds(newSet)
    }
    setDocToDelete(null)
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('T')[0].split('-')
    return `${day}/${month}/${year}`
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

  const getClientName = (doc: Document) => {
    const client = clients.find((c) => c.id === doc.client_id)
    return client?.name || doc.data?.clientName || 'N/A'
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in print:block print:p-0">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Histórico de Documentos</h1>
          <p className="text-muted-foreground">
            Visualize e exporte seus recibos e documentos emitidos.
          </p>
        </div>
      </div>

      <Card className="print:hidden">
        <CardContent className="p-4 flex flex-col md:flex-row gap-4">
          <div className="flex-1 space-y-2">
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
          <div className="space-y-2 w-full md:w-[200px]">
            <Label>Data Inicial</Label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div className="space-y-2 w-full md:w-[200px]">
            <Label>Data Final</Label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div className="flex items-end gap-2 w-full md:w-auto">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSearchName('')
                setStartDate('')
                setEndDate('')
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between items-center print:hidden">
        <div className="text-sm font-medium text-muted-foreground">
          {selectedIds.size > 0
            ? `${selectedIds.size} documento(s) selecionado(s)`
            : 'Nenhum selecionado'}
        </div>
        <Button disabled={selectedIds.size === 0} onClick={handleBatchExport} className="gap-2">
          <Layers className="h-4 w-4" /> Exportar Selecionados
        </Button>
      </div>

      <div className="border rounded-md print:hidden bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px] text-center">
                <Checkbox
                  checked={isAllSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Selecionar todos"
                />
              </TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>Referente a</TableHead>
              <TableHead className="text-right">Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Criado por</TableHead>
              <TableHead className="text-center w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Carregando documentos...
                </TableCell>
              </TableRow>
            ) : filteredDocs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  Nenhum documento encontrado.
                </TableCell>
              </TableRow>
            ) : (
              filteredDocs.map((doc) => (
                <TableRow key={doc.id}>
                  <TableCell className="text-center">
                    <Checkbox
                      checked={selectedIds.has(doc.id)}
                      onCheckedChange={(checked) => handleSelectRow(doc.id, !!checked)}
                      aria-label={`Selecionar documento ${doc.id}`}
                    />
                  </TableCell>
                  <TableCell>{formatDate(doc.created_at)}</TableCell>
                  <TableCell>{getTypeLabel(doc.type)}</TableCell>
                  <TableCell>{getClientName(doc)}</TableCell>
                  <TableCell className="max-w-[150px] truncate" title={doc.data?.description}>
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
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium">
                        {doc.profiles?.name || 'Desconhecido'}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {doc.profiles?.email || ''}
                      </span>
                    </div>
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                        title="Excluir"
                        onClick={() => setDocToDelete(doc)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Documento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O documento será permanentemente removido do seu
              histórico.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-muted/30 print:p-0 print:border-none print:shadow-none print:bg-white print:max-w-none print:w-full">
          <div className="p-4 border-b bg-background flex justify-between items-center print:hidden">
            <h2 className="font-semibold">
              {previewDocs.length > 1
                ? `Exportando ${previewDocs.length} documentos`
                : 'Visualização do Documento'}
            </h2>
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-2" />
              Imprimir / PDF
            </Button>
          </div>
          <div className="p-6 overflow-y-auto max-h-[80vh] print:max-h-none print:p-0 print:overflow-visible flex flex-col items-center">
            {previewDocs.map((doc, index) => (
              <div
                key={doc.id}
                className={`w-full flex justify-center ${index < previewDocs.length - 1 ? 'print:break-after-page mb-8 print:mb-0' : ''}`}
              >
                <ReceiptPreview data={doc.data} />
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
