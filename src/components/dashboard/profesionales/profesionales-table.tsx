'use client'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Pencil, Trash2, KeyRound, Mail, Eye, EyeOff, ShieldCheck, Link2Off, AlertTriangle } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { EditProfesionalDialog } from './edit-profesional-dialog'
import { DeleteProfesionalDialog } from './delete-profesional-dialog'
import { useEffect, useState } from 'react'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

type Profesional = {
  id: string
  nombre: string
  email: string | null
  telefono: string | null
  especialidad: string | null
  foto_url: string | null
  bio: string | null
  activo: boolean
  auth_user_id?: string | null
}

function genTempPassword(len = 10) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$'
  let out = ''
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)]
  return out
}

function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export function ProfesionalesTable({ profesionales }: { profesionales: Profesional[] }) {
  const [editingProfesional, setEditingProfesional] = useState<Profesional | null>(null)
  const [deletingProfesional, setDeletingProfesional] = useState<Profesional | null>(null)

  // dialog acceso
  const [accessOpen, setAccessOpen] = useState(false)
  const [accessProf, setAccessProf] = useState<Profesional | null>(null)
  const [accessEmail, setAccessEmail] = useState('')
  const [accessPassword, setAccessPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [creatingAccess, setCreatingAccess] = useState(false)

  // dialog desvincular
  const [unlinkOpen, setUnlinkOpen] = useState(false)
  const [unlinkProf, setUnlinkProf] = useState<Profesional | null>(null)
  const [unlinkDeleteUser, setUnlinkDeleteUser] = useState(false)
  const [unlinking, setUnlinking] = useState(false)

  const { toast } = useToast()
  const router = useRouter()

  function openAccessDialog(prof: Profesional) {
    setAccessProf(prof)
    setAccessEmail((prof.email || '').trim())
    setAccessPassword(genTempPassword(10))
    setShowPassword(false)
    setAccessOpen(true)
  }

  function closeAccessDialog() {
    setAccessOpen(false)
    setAccessProf(null)
    setAccessEmail('')
    setAccessPassword('')
    setShowPassword(false)
    setCreatingAccess(false)
  }

  function openUnlinkDialog(prof: Profesional) {
    setUnlinkProf(prof)
    setUnlinkDeleteUser(false)
    setUnlinkOpen(true)
  }

  function closeUnlinkDialog() {
    setUnlinkOpen(false)
    setUnlinkProf(null)
    setUnlinkDeleteUser(false)
    setUnlinking(false)
  }

  async function handleCreateAccess() {
    if (!accessProf) return

    const email = accessEmail.trim().toLowerCase()
    const password = accessPassword.trim()

    if (!email || !emailLooksValid(email)) {
      toast({
        title: 'Email inválido',
        description: 'Ingresá un email válido para crear el acceso.',
        variant: 'destructive',
      })
      return
    }

    if (password.length < 6) {
      toast({
        title: 'Contraseña muy corta',
        description: 'Debe tener al menos 6 caracteres.',
        variant: 'destructive',
      })
      return
    }

    try {
      setCreatingAccess(true)

      const res = await fetch('/api/profesionales/create-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profesionalId: accessProf.id,
          email,
          password,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo crear el acceso')

      toast({
        title: 'Acceso creado',
        description: 'El profesional ya puede ingresar con su email y contraseña.',
      })

      router.refresh()
      closeAccessDialog()
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'No se pudo crear el acceso',
        variant: 'destructive',
      })
      setCreatingAccess(false)
    }
  }

  async function handleUnlink() {
    if (!unlinkProf) return

    try {
      setUnlinking(true)

      const res = await fetch('/api/profesionales/unlink-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          profesionalId: unlinkProf.id,
          deleteUser: unlinkDeleteUser,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo desvincular')

      toast({
        title: unlinkDeleteUser ? 'Acceso eliminado' : 'Acceso desvinculado',
        description: unlinkDeleteUser
          ? 'Se desvinculó y se eliminó el usuario del profesional.'
          : 'Se desvinculó el acceso (el profesional ya no podrá entrar).',
      })

      router.refresh()
      closeUnlinkDialog()
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'No se pudo desvincular',
        variant: 'destructive',
      })
      setUnlinking(false)
    }
  }

  async function copyToClipboard(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: 'Copiado', description: `${label} copiado al portapapeles.` })
    } catch {
      toast({
        title: 'No se pudo copiar',
        description: 'Tu navegador bloqueó el portapapeles. Copiá manualmente.',
        variant: 'destructive',
      })
    }
  }

  if (profesionales.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border">
        <p className="text-gray-500">No hay profesionales registrados</p>
        <p className="text-sm text-gray-400 mt-2">Agrega tu primer profesional para comenzar</p>
      </div>
    )
  }

  return (
    <>
      <div className="bg-white rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Profesional</TableHead>
              <TableHead>Contacto</TableHead>
              <TableHead>Especialidad</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Cuenta</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {profesionales.map((profesional) => {
              const hasAccess = !!profesional.auth_user_id

              return (
                <TableRow key={profesional.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={profesional.foto_url || undefined} />
                        <AvatarFallback>
                          {profesional.nombre
                            .split(' ')
                            .map((n) => n[0])
                            .join('')
                            .toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{profesional.nombre}</span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      {profesional.email && <div>{profesional.email}</div>}
                      {profesional.telefono && <div className="text-gray-500">{profesional.telefono}</div>}
                      {!profesional.email && <div className="text-gray-400">Sin email</div>}
                    </div>
                  </TableCell>

                  <TableCell>{profesional.especialidad || '-'}</TableCell>

                  <TableCell>
                    <Badge variant={profesional.activo ? 'default' : 'secondary'}>
                      {profesional.activo ? 'Activo' : 'Inactivo'}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {hasAccess ? <Badge variant="secondary">Vinculado</Badge> : <Badge variant="outline">Sin cuenta</Badge>}
                  </TableCell>

                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      {!hasAccess ? (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openAccessDialog(profesional)}
                          disabled={!profesional.email}
                          title={!profesional.email ? 'Agregá un email para crear cuenta' : 'Crear cuenta (email + contraseña)'}
                        >
                          <KeyRound className="w-4 h-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openUnlinkDialog(profesional)}
                          title="Desvincular / eliminar acceso"
                        >
                          <Link2Off className="w-4 h-4" />
                        </Button>
                      )}

                      <Button variant="ghost" size="sm" onClick={() => setEditingProfesional(profesional)} title="Editar">
                        <Pencil className="w-4 h-4" />
                      </Button>

                      <Button variant="ghost" size="sm" onClick={() => setDeletingProfesional(profesional)} title="Eliminar">
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
          </TableBody>
        </Table>
      </div>

      {/* Dialog Crear Acceso */}
      <Dialog open={accessOpen} onOpenChange={(v) => (!v ? closeAccessDialog() : null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              Crear cuenta para profesional
            </DialogTitle>
            <DialogDescription>
              Se creará un usuario para que el profesional pueda iniciar sesión y ver <b>solo</b> sus turnos y ganancias.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-gray-50 p-3">
              <div className="text-sm font-medium text-gray-900">{accessProf?.nombre || 'Profesional'}</div>
              <div className="text-xs text-gray-600">Acceso privado del profesional</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prof-email">Email</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <Input
                    id="prof-email"
                    value={accessEmail}
                    onChange={(e) => setAccessEmail(e.target.value)}
                    placeholder="profesional@email.com"
                    className="pl-9"
                    autoComplete="off"
                  />
                </div>
                <Button type="button" variant="outline" onClick={() => copyToClipboard(accessEmail.trim(), 'Email')} disabled={!accessEmail.trim()}>
                  Copiar
                </Button>
              </div>
              <p className="text-xs text-gray-500">Usá el email del profesional (será su usuario).</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prof-pass">Contraseña temporal</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    id="prof-pass"
                    type={showPassword ? 'text' : 'password'}
                    value={accessPassword}
                    onChange={(e) => setAccessPassword(e.target.value)}
                    placeholder="mínimo 6 caracteres"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <Button type="button" variant="outline" onClick={() => setAccessPassword(genTempPassword(10))}>
                  Generar
                </Button>

                <Button
                  type="button"
                  variant="outline"
                  onClick={() => copyToClipboard(accessPassword.trim(), 'Contraseña')}
                  disabled={!accessPassword.trim()}
                >
                  Copiar
                </Button>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={closeAccessDialog} disabled={creatingAccess}>
                Cancelar
              </Button>
              <Button type="button" onClick={handleCreateAccess} disabled={creatingAccess || !accessEmail.trim() || !accessPassword.trim()}>
                {creatingAccess ? 'Creando...' : 'Crear cuenta'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Desvincular / Eliminar acceso */}
      <Dialog open={unlinkOpen} onOpenChange={(v) => (!v ? closeUnlinkDialog() : null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2Off className="w-5 h-5 text-amber-600" />
              Desvincular acceso
            </DialogTitle>
            <DialogDescription>
              Esto corta el acceso del profesional a su dashboard. Podés <b>solo desvincular</b> o también <b>eliminar</b> el usuario.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-lg border bg-amber-50 p-3">
              <div className="text-sm font-medium text-gray-900">{unlinkProf?.nombre || 'Profesional'}</div>
              <div className="text-xs text-gray-700">
                {unlinkProf?.email ? unlinkProf.email : 'Sin email'}
              </div>
            </div>

            <div className="rounded-lg border p-3 bg-white">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-900">Eliminar usuario</div>
                  <p className="text-xs text-gray-600 mt-1">
                    Se recomienda realizar esto para desvincular totalmente.
                  </p>

                  <label className="mt-3 flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={unlinkDeleteUser}
                      onChange={(e) => setUnlinkDeleteUser(e.target.checked)}
                      className="h-4 w-4"
                    />
                    <span className="text-gray-900">También eliminar el usuario</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={closeUnlinkDialog} disabled={unlinking}>
                Cancelar
              </Button>
              <Button
                type="button"
                variant={unlinkDeleteUser ? 'destructive' : 'default'}
                onClick={handleUnlink}
                disabled={unlinking}
                title={unlinkDeleteUser ? 'Desvincular y eliminar usuario' : 'Solo desvincular'}
              >
                {unlinking ? 'Procesando...' : unlinkDeleteUser ? 'Desvincular y eliminar' : 'Desvincular'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {editingProfesional && <EditProfesionalDialog profesional={editingProfesional} onClose={() => setEditingProfesional(null)} />}

      {deletingProfesional && <DeleteProfesionalDialog profesional={deletingProfesional} onClose={() => setDeletingProfesional(null)} />}
    </>
  )
}
