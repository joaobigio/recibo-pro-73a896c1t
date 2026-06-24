import { useEffect, useState, useMemo } from 'react'
import { getProfiles } from '@/services/profiles'
import { getAllDocuments } from '@/services/documents'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { DatePickerWithRange } from '@/components/ui/date-range-picker'
import { addDays, isWithinInterval, parseISO, startOfDay, endOfDay } from 'date-fns'
import { DateRange } from 'react-day-picker'
import { ShieldOff, BarChart3, Receipt, DollarSign } from 'lucide-react'

export default function Dashboard() {
  const { isAdmin } = useAuth()
  const [documents, setDocuments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  })

  useEffect(() => {
    if (isAdmin) {
      Promise.all([getAllDocuments(), getProfiles()]).then(([docsRes, profilesRes]) => {
        if (docsRes.data) setDocuments(docsRes.data)
        if (profilesRes.data) setUsers(profilesRes.data)
        setLoading(false)
      })
    }
  }, [isAdmin])

  const filteredDocs = useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) return documents

    return documents.filter((doc) => {
      const docDate = parseISO(doc.created_at)
      return isWithinInterval(docDate, {
        start: startOfDay(dateRange.from!),
        end: endOfDay(dateRange.to!),
      })
    })
  }, [documents, dateRange])

  const userStats = useMemo(() => {
    return users
      .map((user) => {
        const userDocs = filteredDocs.filter((d) => d.user_id === user.id)
        const totalAmount = userDocs.reduce((acc, d) => acc + Number(d.amount), 0)
        return {
          ...user,
          docCount: userDocs.length,
          totalAmount,
        }
      })
      .sort((a, b) => b.docCount - a.docCount)
  }, [users, filteredDocs])

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <ShieldOff className="h-12 w-12 text-muted-foreground mx-auto" />
          <h2 className="text-xl font-semibold">Acesso Negado</h2>
          <p className="text-muted-foreground">Apenas administradores podem acessar esta página.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in-up">
      <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Produtividade da Equipe
          </h1>
          <p className="text-muted-foreground">
            Acompanhe a emissão de recibos e volume gerado por cada membro.
          </p>
        </div>
        <DatePickerWithRange date={dateRange} setDate={setDateRange} />
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-16 bg-muted/50 rounded-t-lg" />
              <CardContent className="h-24" />
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {userStats.map((stat) => (
            <Card key={stat.id}>
              <CardHeader className="pb-2 border-b mb-4">
                <CardTitle className="text-lg font-medium">{stat.name || stat.email}</CardTitle>
                <div className="text-xs text-muted-foreground">{stat.email}</div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Receipt className="h-3 w-3 mr-1" /> Documentos
                    </div>
                    <div className="text-2xl font-bold">{stat.docCount}</div>
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center text-xs text-muted-foreground">
                      <DollarSign className="h-3 w-3 mr-1" /> Volume Gerado
                    </div>
                    <div className="text-lg font-bold">{formatCurrency(stat.totalAmount)}</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
