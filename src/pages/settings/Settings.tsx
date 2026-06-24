import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { getProfile, updateProfile } from '@/services/profiles'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { Upload, Loader2, Image as ImageIcon } from 'lucide-react'
import { maskCpfCnpj, maskPhone } from '@/lib/format'

export default function Settings() {
  const { user, refreshProfile } = useAuth()
  const { toast } = useToast()

  const [loading, setLoading] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [uploading, setUploading] = useState(false)

  const [doc, setDoc] = useState('')
  const [phone, setPhone] = useState('')

  useEffect(() => {
    if (!user) return

    let isMounted = true
    let retryCount = 0
    const maxRetries = 3

    const fetchProfile = async () => {
      try {
        const { data, error } = await getProfile(user.id)

        if (error && error.code !== 'PGRST116') {
          throw error
        }

        if (!data) {
          if (retryCount < maxRetries) {
            retryCount++
            setTimeout(fetchProfile, 1000)
            return
          }

          const newProfile = {
            id: user.id,
            user_id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || '',
          }
          const { data: createdProfile, error: insertError } = await supabase
            .from('profiles')
            .upsert([newProfile], { onConflict: 'id' })
            .select()
            .single()

          if (!isMounted) return

          if (!insertError && createdProfile) {
            setProfile(createdProfile)
            setDoc(maskCpfCnpj(createdProfile.document || ''))
            setPhone(maskPhone(createdProfile.phone || ''))
          } else {
            console.error('Failed to provision/fetch profile:', insertError)
            toast({
              title: 'Aviso',
              description:
                'Ocorreu um erro ao carregar os dados completos. Tente recarregar a página ou verifique sua conexão.',
              variant: 'destructive',
            })
            setProfile(newProfile)
          }
        } else {
          if (!isMounted) return
          setProfile(data)
          setDoc(maskCpfCnpj(data.document || ''))
          setPhone(maskPhone(data.phone || ''))
        }
      } catch (err) {
        if (!isMounted) return
        if (retryCount < maxRetries) {
          retryCount++
          setTimeout(fetchProfile, 1000)
        } else {
          console.error('Error fetching profile:', err)
          toast({
            title: 'Aviso',
            description:
              'Ocorreu um erro ao carregar os dados completos. Tente recarregar a página ou verifique sua conexão.',
            variant: 'destructive',
          })
          setProfile({
            id: user.id,
            user_id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || '',
          })
        }
      }
    }

    fetchProfile()

    return () => {
      isMounted = false
    }
  }, [user])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0 || !user) return

    const file = e.target.files[0]

    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ter no máximo 2MB.',
        variant: 'destructive',
      })
      return
    }

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      toast({
        title: 'Erro',
        description: 'A imagem deve ser PNG ou JPG.',
        variant: 'destructive',
      })
      return
    }

    const fileExt = file.name.split('.').pop()
    const filePath = `${user.id}/logo.${fileExt}`

    setUploading(true)
    try {
      const { error: uploadError } = await supabase.storage
        .from('logos')
        .upload(filePath, file, { upsert: true })

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from('logos').getPublicUrl(filePath)

      const newUrl = `${publicUrl}?t=${Date.now()}`
      const { error: updateError } = await updateProfile(user.id, { logo_url: newUrl })
      if (updateError) throw updateError

      setProfile({ ...profile, logo_url: newUrl })
      await refreshProfile()

      toast({ title: 'Sucesso', description: 'Logotipo atualizado com sucesso!' })
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message || 'Falha ao atualizar logotipo',
        variant: 'destructive',
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    const updates = {
      name: formData.get('name') as string,
      document: formData.get('document') as string,
      phone: formData.get('phone') as string,
      pix_key: formData.get('pix_key') as string,
    }

    const { error } = await updateProfile(user.id, updates)
    setLoading(false)

    if (error) {
      toast({
        title: 'Erro',
        description: `Erro ao salvar: ${error.message || 'Permissão negada'}`,
        variant: 'destructive',
      })
    } else {
      setProfile({ ...profile, ...updates })
      await refreshProfile()
      toast({ title: 'Sucesso', description: 'Configurações atualizadas com sucesso!' })
    }
  }

  if (!profile)
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )

  return (
    <div className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações e personalize seus recibos.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Logotipo da Empresa</CardTitle>
          <CardDescription>
            Este logotipo será exibido no cabeçalho dos seus recibos e documentos.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-lg border-2 border-dashed flex items-center justify-center overflow-hidden bg-muted">
              {profile.logo_url ? (
                <img src={profile.logo_url} alt="Logo" className="w-full h-full object-contain" />
              ) : (
                <ImageIcon className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="logo" className="cursor-pointer">
                <div className="bg-primary text-primary-foreground hover:bg-primary/90 inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2">
                  {uploading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Upload className="mr-2 h-4 w-4" />
                  )}
                  {uploading ? 'Enviando...' : 'Carregar nova imagem'}
                </div>
              </Label>
              <Input
                id="logo"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleUpload}
                disabled={uploading}
              />
              <p className="text-xs text-muted-foreground">
                Recomendado: PNG ou JPG, tamanho máximo 2MB.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dados Pessoais / Empresa</CardTitle>
          <CardDescription>
            Estas informações serão usadas como emissor nos documentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSave} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo ou Razão Social</Label>
              <Input id="name" name="name" defaultValue={profile.name || ''} required />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="document">CPF ou CNPJ</Label>
                <Input
                  id="document"
                  name="document"
                  value={doc}
                  onChange={(e) => setDoc(maskCpfCnpj(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone / WhatsApp</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={phone}
                  onChange={(e) => setPhone(maskPhone(e.target.value))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="pix_key">Chave PIX (Para recebimentos)</Label>
              <Input
                id="pix_key"
                name="pix_key"
                defaultValue={profile.pix_key || ''}
                placeholder="CPF, E-mail, Celular ou Aleatória"
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Salvar Alterações
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
