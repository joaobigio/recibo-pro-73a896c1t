import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { getMyDocuments, Document } from '@/services/documents'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts'
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart'
import { FileText, DollarSign, Users, TrendingUp } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'

export default function Index() {
  const { user } = useAuth()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      getMyDocuments(user.id).then(({ data }) => {
        if (data) setDocuments(data)
        setLoading(false)
      })
    }
  }, [user])

  const totalEmitted = documents.reduce((acc, doc) => acc + Number(doc.amount), 0)
  const thisMonthDocs = documents.filter(
    (doc) =>
      new Date(doc.created_at).getMonth() === new Date().getMonth() &&
      new Date(doc.created_at).getFullYear() === new Date().getFullYear(),
  )
  const monthTotal = thisMonthDocs.reduce((acc, doc) => acc + Number(doc.amount), 0)

  // Chart data (last 7 days)
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = subDays(new Date(), 6 - i)
    const dayStr = format(d, 'dd/MM')
    const dayDocs = documents.filter((doc) => format(new Date(doc.created_at), 'dd/MM') === dayStr)
    return {
      name: format(d, 'EEE', { locale: ptBR }),
      total: dayDocs.reduce((acc, doc) => acc + Number(doc.amount), 0),
    }
  })

  // Chart data (Category Distribution)
  const revenueByCategory = documents.reduce(
    (acc, doc) => {
      let category = 'Outros'
      if (doc.type === 'third_party') category = 'Recibos Terceiros'
      else if (doc.type === 'rent') category = 'Aluguéis'
      else if (doc.type === 'promissory') category = 'Promissórias'
      else if (doc.type === 'receipt') category = 'Recibos Gerais'

      // Attempt to extract categories from items if present
      if (doc.data?.items && Array.isArray(doc.data.items)) {
        doc.data.items.forEach((item: any) => {
          const cat = item.category || (item.type === 'service' ? 'Serviços' : 'Produtos')
          acc[cat] = (acc[cat] || 0) + Number(item.price) * Number(item.quantity || 1)
        })
      } else {
        acc[category] = (acc[category] || 0) + Number(doc.amount)
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const pieData = Object.entries(revenueByCategory)
    .map(([name, value]) => ({ name, value }))
    .filter((d) => d.value > 0)
    .sort((a, b) => b.value - a.value)

  const PIE_COLORS = [
    'hsl(var(--primary))',
    'hsl(210, 100%, 60%)',
    'hsl(150, 80%, 40%)',
    'hsl(40, 90%, 60%)',
    'hsl(280, 70%, 50%)',
    'hsl(330, 60%, 50%)',
  ]

  // Chart data (Annual Monthly)
  const currentYear = new Date().getFullYear()
  const annualData = Array.from({ length: 12 }, (_, i) => {
    const monthDocs = documents.filter((doc) => {
      const d = new Date(doc.created_at)
      return d.getFullYear() === currentYear && d.getMonth() === i
    })
    return {
      name: format(new Date(currentYear, i, 1), 'MMM', { locale: ptBR }),
      faturamento: monthDocs.reduce((acc, doc) => acc + Number(doc.amount), 0),
      volume: monthDocs.length,
    }
  })

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Acompanhamento de emissões e faturamento.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Faturado (Mês)</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthTotal)}</div>
            <p className="text-xs text-muted-foreground mt-1">Referente ao mês atual</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume (Mês)</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthDocs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Documentos emitidos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faturamento Anual</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEmitted)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {documents.length} registros no total
            </p>
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
            <p className="text-xs text-muted-foreground mt-1">Clientes únicos no sistema</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-8">
        <Card className="col-span-4 lg:col-span-5">
          <CardHeader>
            <CardTitle>Faturamento Anual ({currentYear})</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ faturamento: { label: 'Faturamento', color: 'hsl(var(--primary))' } }}
              className="h-[300px] w-full"
            >
              <AreaChart data={annualData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorFaturamento" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-faturamento)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="var(--color-faturamento)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                  width={60}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Area
                  type="monotone"
                  dataKey="faturamento"
                  stroke="var(--color-faturamento)"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorFaturamento)"
                />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>
        <Card className="col-span-4 lg:col-span-3">
          <CardHeader>
            <CardTitle>Receita por Categoria</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-center pb-4">
            {pieData.length > 0 ? (
              <ChartContainer config={{}} className="h-[300px] w-full">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => formatCurrency(value)} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                Sem dados suficientes
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-1 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Emissões Recentes (7 dias)</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ChartContainer
              config={{ total: { label: 'Total (R$)', color: 'hsl(210, 100%, 50%)' } }}
              className="h-[300px] w-full"
            >
              <BarChart data={last7Days} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                <XAxis
                  dataKey="name"
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                />
                <YAxis
                  stroke="#888888"
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `R$${value}`}
                  width={60}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="total"
                  fill="var(--color-total)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
