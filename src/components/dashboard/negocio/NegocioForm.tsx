'use client'

import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { useRouter } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle2, XCircle } from 'lucide-react'

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

export default function NegocioForm({
  negocioId,
  initialNombre,
  initialSlug,
  initialVertical,
  initialDireccion,
  initialTelefono,
  initialEmail,
}: {
  negocioId: string
  initialNombre: string
  initialSlug: string
  initialVertical: string
  initialDireccion: string
  initialTelefono: string
  initialEmail: string
}) {
  const { toast } = useToast()
  const router = useRouter()

  const [nombre, setNombre] = useState(initialNombre)
  const [slug, setSlug] = useState(initialSlug)
  const [vertical, setVertical] = useState(initialVertical)
  const [direccion, setDireccion] = useState(initialDireccion)
  const [telefono, setTelefono] = useState(initialTelefono)
  const [email, setEmail] = useState(initialEmail)

  const [saving, setSaving] = useState(false)

  // slug check
  const [checkingSlug, setCheckingSlug] = useState(false)
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugMsg, setSlugMsg] = useState<string>('')

  const slugNormalized = useMemo(() => slugify(slug), [slug])

  // si el slug no cambió, lo marcamos ok sin consultar
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
        const res = await fetch(`/api/negocio/check-slug?slug=${encodeURIComponent(slugNormalized)}&current=${encodeURIComponent(initialSlug)}`)
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

    if (!nombreClean) {
      toast({ title: 'Falta el nombre', description: 'Ingresá el nombre del negocio.', variant: 'destructive' })
      return
    }

    if (!slugClean) {
      toast({ title: 'Slug inválido', description: 'Ingresá un slug válido.', variant: 'destructive' })
      return
    }

    // si cambió y sabemos que no está disponible
    if (slugClean !== initialSlug && slugAvailable === false) {
      toast({ title: 'Slug no disponible', description: 'Elegí otro slug.', variant: 'destructive' })
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
        }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || 'No se pudo guardar')

      toast({ title: 'Guardado', description: 'Datos del negocio actualizados.' })
      router.refresh()
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'No se pudo guardar', variant: 'destructive' })
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
    toast({ title: 'Cambios descartados', description: 'Se restauraron los valores anteriores.' })
  }

  return (
    <div className="space-y-4">
      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Nombre del Negocio</label>
        <input
          type="text"
          value={nombre}
          onChange={(e) => {
            setNombre(e.target.value)
            // opcional: autogenerar slug si el user no tocó el slug
            if (slug === initialSlug) setSlug(slugify(e.target.value))
          }}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder="Ej: Barbería Elite"
        />
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
          {VERTICALES.map(v => (
            <option key={v.value} value={v.value}>{v.label}</option>
          ))}
        </select>
      </div>

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
    </div>
  )
}
