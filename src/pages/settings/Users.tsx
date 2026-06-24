import { useState, useEffect } from 'react'
import { getProfiles, updateProfile, Profile } from '@/services/profiles'
import { adminAuthClient } from '@/services/admin'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
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
import { Loader2, Plus, Shield, ShieldOff, Trash2, Edit, Mail } from 'lucide-react'
import { sendWelcomeEmail } from '@/services/email'
import { toast } from 'sonner'

export default function Users() {
  const { isAdmin, user: currentUser } = useAuth()
  const [users, setUsers] = useState<Profile[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null)

  const [formData, setFormData] = useState({ name: '', email: '', password: '', is_admin: false })
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (isAdmin) {
      loadUsers()
    }
  }, [isAdmin])

  const loadUsers = async () => {
    setLoading(true)
    const { data, error } = await getProfiles()
    if (data) setUsers(data)
    setLoading(false)
  }

  const handleAddUser = async () => {
    if (!formData.email || !formData.password || !formData.name) {
      toast.error('Preencha todos os campos obrigatórios')
      return
    }

    setIsSubmitting(true)

    try {
      // Create auth user using secondary client
      const { data: authData, error: authError } = await adminAuthClient.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { name: formData.name },
        },
      })

      if (authError) throw authError

      const newUserId = authData.user?.id
      if (newUserId) {
        // Wait a moment for trigger to create profile
        await new Promise((r) => setTimeout(r, 1000))

        await updateProfile(newUserId, {
          name: formData.name,
          is_admin: formData.is_admin,
        })

        await sendWelcomeEmail({ name: formData.name, email: formData.email })

        toast.success('Usuário criado e convite enviado!')
        setIsAddOpen(false)
        setFormData({ name: '', email: '', password: '', is_admin: false })
        loadUsers()
      }
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || 'Erro ao criar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleEditUser = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      await updateProfile(selectedUser.id, { is_admin: formData.is_admin })
      toast.success('Permissões atualizadas com sucesso!')
      setIsEditOpen(false)
      loadUsers()
    } catch (error: any) {
      toast.error('Erro ao atualizar usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDeleteUser = async () => {
    if (!selectedUser) return
    setIsSubmitting(true)
    try {
      await supabase.from('profiles').delete().eq('id', selectedUser.id)
      toast.success('Acesso removido com sucesso!')
      setIsDeleteOpen(false)
      loadUsers()
    } catch (error: any) {
      toast.error('Erro ao remover usuário')
    } finally {
      setIsSubmitting(false)
    }
  }

  const openEdit = (user: Profile) => {
    setSelectedUser(user)
    setFormData({ ...formData, is_admin: !!user.is_admin })
    setIsEditOpen(true)
  }

  const openDelete = (user: Profile) => {
    setSelectedUser(user)
    setIsDeleteOpen(true)
  }

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
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Gestão de Equipe</h1>
          <p className="text-muted-foreground">
            Gerencie os usuários e permissões da sua organização.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Adicionar Usuário
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-center w-[120px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                    Carregando usuários...
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    Nenhum usuário encontrado.
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.name || '-'}</TableCell>
                    <TableCell>{u.email}</TableCell>
                    <TableCell>
                      {u.is_admin ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 text-primary px-2.5 py-0.5 text-xs font-semibold">
                          <Shield className="h-3 w-3" /> Admin
                        </span>
                      ) : (
                        <span className="inline-flex items-center rounded-full bg-muted text-muted-foreground px-2.5 py-0.5 text-xs font-semibold">
                          Funcionário
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="inline-flex items-center gap-1 text-xs">
                        <span className="h-2 w-2 rounded-full bg-green-500"></span>
                        {u.id === currentUser?.id ? 'Online' : 'Convite Enviado'}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex justify-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Reenviar Convite"
                          onClick={async () => {
                            if (u.email) {
                              const promise = sendWelcomeEmail({
                                name: u.name || '',
                                email: u.email,
                              })
                              toast.promise(promise, {
                                loading: 'Enviando convite...',
                                success: 'Convite reenviado com sucesso!',
                                error: 'Erro ao enviar convite',
                              })
                            }
                          }}
                        >
                          <Mail className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          title="Editar permissões"
                          onClick={() => openEdit(u)}
                          disabled={u.id === currentUser?.id}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                          title="Remover acesso"
                          onClick={() => openDelete(u)}
                          disabled={u.id === currentUser?.id}
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
      </Card>

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novo Usuário</DialogTitle>
            <DialogDescription>Crie um novo acesso para sua equipe.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                placeholder="Ex: João Silva"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="email@empresa.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Senha Temporária</Label>
              <Input
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div className="space-y-0.5">
                <Label>Acesso Administrador</Label>
                <div className="text-sm text-muted-foreground">
                  Permite gerenciar outros usuários e ver todos os documentos
                </div>
              </div>
              <Switch
                checked={formData.is_admin}
                onCheckedChange={(c) => setFormData({ ...formData, is_admin: c })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleAddUser} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Permissões</DialogTitle>
            <DialogDescription>Alterar nível de acesso de {selectedUser?.name}.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="flex items-center justify-between border rounded-lg p-3">
              <div className="space-y-0.5">
                <Label>Acesso Administrador</Label>
                <div className="text-sm text-muted-foreground">
                  Permite gerenciar outros usuários e ver todos os documentos
                </div>
              </div>
              <Switch
                checked={formData.is_admin}
                onCheckedChange={(c) => setFormData({ ...formData, is_admin: c })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditOpen(false)} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover Acesso?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover o acesso de <strong>{selectedUser?.name}</strong>? Esta
              ação removerá o perfil do usuário, impedindo-o de acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isSubmitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
              Remover Acesso
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
