import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { getDocuments, Document } from '@/services/documents'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { FileText, DollarSign, Users } from 'lucide-react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export default function Index() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDocuments().then(({ data }) => {
      if (data) setDocuments(data)
      setLoading(false)
    })
  }, [])

  const totalEmitted = documents.reduce((acc, doc) => acc + Number(doc.amount), 0)
  const thisMonthDocs = documents.filter(
    (doc) => new Date(doc.created_at).getMonth() === new Date().getMonth(),
  )
  const monthTotal = thisMonthDocs.reduce((acc, doc) => acc + Number(doc.amount), 0)

  // Chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - (6 - i))
    const dayStr = format(d, 'dd/MM')
    const dayDocs = documents.filter((doc) => format(new Date(doc.created_at), 'dd/MM') === dayStr)
    return {
      name: format(d, 'EEE', { locale: ptBR }),
      total: dayDocs.reduce((acc, doc) => acc + Number(doc.amount), 0),
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Visão geral das suas emissões.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Emitido (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              +{thisMonthDocs.length} recibos este mês
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Histórico Total</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEmitted)}</div>
            <p className="text-xs text-muted-foreground mt-1">{documents.length} recibos gerados</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Atendidos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {
                new Set(
                  documents.filter((d) => d.data?.clientDocument).map((d) => d.data.clientDocument),
                ).size
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">Clientes únicos</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Emissões (Últimos 7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ total: { label: 'Total (R$)', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={last7Days}>
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Últimos Recibos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {documents.slice(0, 5).map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between border-b pb-2 last:border-0"
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {doc.data?.clientName || 'Sem nome'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(doc.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                  <div className="font-medium">{formatCurrency(doc.amount)}</div>
                </div>
              ))}
              {documents.length === 0 && !loading && (
                <div className="text-center text-sm text-muted-foreground py-4">
                  Nenhum recibo emitido ainda.
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
