import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { getAllDocuments } from '@/services/documents'
import { getProfiles } from '@/services/profiles'
import { ShieldAlert, Users, FileText, DollarSign } from 'lucide-react'
import { format } from 'date-fns'

export default function AdminDashboard() {
  const [documents, setDocuments] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getAllDocuments(), getProfiles()]).then(([docsRes, profilesRes]) => {
      if (docsRes.data) setDocuments(docsRes.data)
      if (profilesRes.data) setUsers(profilesRes.data)
      setLoading(false)
    })
  }, [])

  const totalEmitted = documents.reduce((acc, doc) => acc + Number(doc.amount), 0)

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-destructive flex items-center gap-2">
          <ShieldAlert className="h-8 w-8" />
          Painel Administrativo
        </h1>
        <p className="text-muted-foreground">Visão global da plataforma e transações.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Volume Total Transacionado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalEmitted)}</div>
            <p className="text-xs text-muted-foreground mt-1">Na plataforma</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recibos Emitidos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Documentos totais</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{users.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Inscritos na plataforma</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimas Emissões (Global)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {documents.slice(0, 10).map((doc) => (
              <div
                key={doc.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between border-b pb-4 last:border-0"
              >
                <div className="space-y-1 mb-2 sm:mb-0">
                  <p className="text-sm font-medium leading-none">
                    Emissor: {doc.profiles?.name || 'Desconhecido'} ({doc.profiles?.email})
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Cliente: {doc.data?.clientName || 'S/N'} • Data:{' '}
                    {format(new Date(doc.created_at), 'dd/MM/yyyy')}
                  </p>
                </div>
                <div className="font-medium sm:text-right">
                  {formatCurrency(doc.amount)}
                  <p className="text-xs text-muted-foreground uppercase">{doc.type}</p>
                </div>
              </div>
            ))}
            {documents.length === 0 && !loading && (
              <div className="text-center text-sm text-muted-foreground py-4">
                Nenhum documento emitido na plataforma.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
