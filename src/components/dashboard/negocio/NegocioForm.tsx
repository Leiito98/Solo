'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle, Clock, Edit } from 'lucide-react'
import { HorariosDialog } from './horarios-dialog'

function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // tildes
    .replace(/[^a-z0-9]+/g, '-') // espacios/símbolos -> -
    .replace(/^-+|-+$/g, '') // trim -
    .replace(/--+/g, '-') // doble -
}

const VERTICALES = [
  { value: 'barberia', label: 'Barbería' },
  { value: 'belleza', label: 'Belleza (Lashes, Uñas)' },
  { value: 'nutricion', label: 'Nutrición' },
  { value: 'peluqueria', label: 'Peluquería' },
  { value: 'psicologia', label: 'Psicología' },
  { value: 'fitness', label: 'Fitness' },
  { value: 'otros', label: 'Otros' },
] as const

const DAY_LABEL: Record<number, string> = {
  1: "Lun",
  2: "Mar",
  3: "Mié",
  4: "Jue",
  5: "Vie",
  6: "Sáb",
  0: "Dom",
}

const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

function toHHMM(v: string | null) {
  if (!v) return ""
  return String(v).slice(0, 5)
}

export default function NegocioForm({
  negocioId,
  initialNombre,
  initialSlug,
  initialVertical,
  initialDireccion,
  initialTelefono,
  initialEmail,
  initialDescripcion,
}: {
  negocioId: string
  initialNombre: string
  initialSlug: string
  initialVertical: string
  initialDireccion: string
  initialTelefono: string
  initialEmail: string
  initialDescripcion: string
}) {
  const { toast } = useToast()
  const router = useRouter()

  const [nombre, setNombre] = useState(initialNombre)
  const [slug, setSlug] = useState(initialSlug)
  const [vertical, setVertical] = useState(initialVertical)
  const [direccion, setDireccion] = useState(initialDireccion)
  const [telefono, setTelefono] = useState(initialTelefono)
  const [email, setEmail] = useState(initialEmail)
  const [descripcion, setDescripcion] = useState(initialDescripcion)

  const [saving, setSaving] = useState(false)

  // slug check
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugMsg, setSlugMsg] = useState<string>('')

  // horarios dialog
  const [horariosDialogOpen, setHorariosDialogOpen] = useState(false)
  const [horarios, setHorarios] = useState<any[]>([])
  const [loadingHorarios, setLoadingHorarios] = useState(true)

  const slugNormalized = useMemo(() => slugify(slug), [slug])

  // Cargar horarios para mostrar resumen
  async function fetchHorarios() {
    try {
      setLoadingHorarios(true)
      const res = await fetch("/api/configuracion/horarios", { cache: "no-store" })
      const json = await res.json().catch(() => ({}))
      if (res.ok) {
        setHorarios(json.horarios || [])
      }
    } catch (e) {
      console.error("Error loading horarios:", e)
    } finally {
      setLoadingHorarios(false)
    }
  }

  useEffect(() => {
    fetchHorarios()
  }, [])

  // slug check
  useEffect(() => {
    if (!slugNormalized) {
      setSlugAvailable(null)
      setSlugMsg('')
      return
    }
    if (slugNormalized === initialSlug) {
      setSlugAvailable(true)
      setSlugMsg('Este es tu slug actual.')
      return
    }

    const t = setTimeout(async () => {
      try {
        setCheckingSlug(true)
        const res = await fetch(
          `/api/negocio/check-slug?slug=${encodeURIComponent(slugNormalized)}&current=${encodeURIComponent(
            initialSlug
          )}`
        )
        const json = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(json?.error || 'No se pudo chequear')

        setSlugAvailable(!!json.available)
        setSlugMsg(json.available ? 'Disponible ✅' : 'No disponible ❌')
      } catch (e: any) {
        setSlugAvailable(null)
        setSlugMsg(e?.message || 'Error chequeando slug')
      } finally {
        setCheckingSlug(false)
      }
    }, 450)

    return () => clearTimeout(t)
  }, [slugNormalized, initialSlug])

  async function onSave() {
    const nombreClean = nombre.trim()
    const slugClean = slugify(slug)
    const descClean = descripcion.trim()

    if (!nombreClean) {
      toast({
        title: 'Falta el nombre',
        description: 'Ingresá el nombre del negocio.',
        variant: 'destructive',
      })
      return
    }

    if (!slugClean) {
      toast({
        title: 'Slug inválido',
        description: 'Ingresá un slug válido.',
        variant: 'destructive',
      })
      return
    }

    if (descClean.length > 240) {
      toast({
        title: 'Descripción muy larga',
        description: 'Máximo 240 caracteres.',
        variant: 'destructive',
      })
      return
    }

    if (slugClean !== initialSlug && slugAvailable === false) {
      toast({
        title: 'Slug no disponible',
        description: 'Elegí otro slug.',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const res = await fetch('/api/negocio/update', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          negocioId,
          nombre: nombreClean,
          slug: slugClean,
          vertical,
          direccion: direccion.trim() || null,
          telefono: telefono.trim() || null,
          email: email.trim() || null,
          descripcion: descClean || null,
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo guardar')

      toast({ title: 'Guardado', description: 'Datos del negocio actualizados.' })
      router.refresh()
    } catch (e: any) {
      toast({
        title: 'Error',
        description: e?.message || 'No se pudo guardar',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  function onCancel() {
    setNombre(initialNombre)
    setSlug(initialSlug)
    setVertical(initialVertical)
    setDireccion(initialDireccion)
    setTelefono(initialTelefono)
    setEmail(initialEmail)
    setDescripcion(initialDescripcion)

    toast({
      title: 'Cambios descartados',
      description: 'Se restauraron los valores anteriores.',
    })
  }

  // Resumen de horarios
  const horariosResumen = useMemo(() => {
    if (loadingHorarios) return "Cargando..."
    if (!horarios.length) return "Sin configurar"

    const abiertos = horarios.filter(h => !h.cerrado)
    if (abiertos.length === 0) return "Cerrado toda la semana"
    if (abiertos.length === 7) {
      const primero = abiertos[0]
      const todosIguales = abiertos.every(
        h => toHHMM(h.hora_inicio) === toHHMM(primero.hora_inicio) && 
             toHHMM(h.hora_fin) === toHHMM(primero.hora_fin)
      )
      if (todosIguales) {
        return `Todos los días: ${toHHMM(primero.hora_inicio)} - ${toHHMM(primero.hora_fin)}`
      }
    }

    // Mostrar días abiertos
    const diasAbiertos = DAY_ORDER
      .filter(dia => {
        const h = horarios.find(h => h.dia_semana === dia)
        return h && !h.cerrado
      })
      .map(dia => DAY_LABEL[dia])
      .join(", ")

    return diasAbiertos || "Sin horarios configurados"
  }, [horarios, loadingHorarios])

  return (
    <div className="space-y-6">
      {/* Información Básica */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Información Básica</h3>

        {/* Nombre */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Negocio</label>
          <input
            type="text"
            value={nombre}
            onChange={(e) => {
              setNombre(e.target.value)
              if (slug === initialSlug) setSlug(slugify(e.target.value))
            }}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ej: Barbería Elite"
          />
        </div>

        {/* Descripción */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción (se verá en tu página)</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            rows={3}
            maxLength={240}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
            placeholder="Ej: Barbería premium en el corazón de la ciudad. Cortes modernos, fades y atención personalizada."
          />
          <div className="mt-1 text-xs text-gray-500 flex justify-end">{descripcion.length}/240</div>
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Slug (URL personalizada)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="barbershop"
            />
            <span className="text-sm text-gray-500">.getsolo.site</span>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {checkingSlug ? (
              <Badge variant="secondary" className="gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" /> Chequeando...
              </Badge>
            ) : slugAvailable === true ? (
              <Badge variant="secondary" className="gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> {slugMsg || 'OK'}
              </Badge>
            ) : slugAvailable === false ? (
              <Badge variant="destructive" className="gap-2">
                <XCircle className="w-3.5 h-3.5" /> {slugMsg || 'No disponible'}
              </Badge>
            ) : (
              <Badge variant="outline">Ingresá un slug</Badge>
            )}

            <span className="text-xs text-gray-500">
              URL pública: https://{slugNormalized || 'tu-negocio'}.getsolo.site
            </span>
          </div>
        </div>

        {/* Vertical */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de Negocio</label>
          <select
            value={vertical}
            onChange={(e) => setVertical(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {VERTICALES.map((v) => (
              <option key={v.value} value={v.value}>
                {v.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200" />

      {/* Información de Contacto */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Información de Contacto</h3>

        {/* Dirección */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Dirección</label>
          <input
            type="text"
            value={direccion}
            onChange={(e) => setDireccion(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="Ej: Av. Corrientes 1234, CABA"
          />
        </div>

        {/* Teléfono */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Teléfono</label>
          <input
            type="tel"
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="+54 9 11 1234-5678"
          />
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Email de contacto</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            placeholder="contacto@tunegocio.com"
          />
        </div>
      </div>

      {/* Separador */}
      <div className="border-t border-gray-200" />

      {/* Horarios del Local */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Horarios del Local</h3>
            <p className="text-sm text-gray-600 mt-1">
              Configurá los horarios de atención de tu negocio
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setHorariosDialogOpen(true)}
            className="gap-2"
          >
            <Edit className="w-4 h-4" />
            Editar Horarios
          </Button>
        </div>

        {/* Resumen de horarios */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-white rounded-lg border border-gray-200">
              <Clock className="w-5 h-5 text-gray-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">Horario actual</p>
              <p className="text-sm text-gray-600">{horariosResumen}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-4 flex gap-3">
        <Button
          onClick={onSave}
          disabled={saving || checkingSlug || (slugify(slug) !== initialSlug && slugAvailable === false)}
          className="bg-primary hover:bg-primary/90"
        >
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          Cancelar
        </Button>
      </div>

      {/* Dialog de horarios */}
      <HorariosDialog
        open={horariosDialogOpen}
        onOpenChange={setHorariosDialogOpen}
        onSaved={() => {
          fetchHorarios()
          router.refresh()
        }}
      />
    </div>
  )
}