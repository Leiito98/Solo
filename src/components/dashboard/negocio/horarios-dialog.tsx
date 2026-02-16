"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Loader2 } from "lucide-react"

type DayRow = {
  dia_semana: number // 0..6 (0=Domingo)
  cerrado: boolean
  hora_inicio: string | null // "09:00:00"
  hora_fin: string | null // "20:00:00"
}

const DAY_LABEL: Record<number, string> = {
  1: "Lunes",
  2: "Martes",
  3: "Miércoles",
  4: "Jueves",
  5: "Viernes",
  6: "Sábado",
  0: "Domingo",
}

// Orden de visualización (Lunes primero)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

function toHHMM(v: string | null) {
  if (!v) return ""
  return String(v).slice(0, 5) // "HH:MM"
}

function toHHMMSS(v: string) {
  if (!v) return null
  if (/^\d{2}:\d{2}$/.test(v)) return `${v}:00`
  if (/^\d{2}:\d{2}:\d{2}$/.test(v)) return v
  return null
}

function normalize7Days(input: DayRow[]) {
  const byDay = new Map<number, DayRow>()
  for (const r of input || []) byDay.set(Number(r.dia_semana), r)

  return DAY_ORDER.map((d) => {
    const found = byDay.get(d)
    return (
      found || {
        dia_semana: d,
        cerrado: true,
        hora_inicio: null,
        hora_fin: null,
      }
    )
  })
}

type HorariosDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

export function HorariosDialog({ open, onOpenChange, onSaved }: HorariosDialogProps) {
  const router = useRouter()
  const { toast } = useToast()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [rows, setRows] = useState<DayRow[]>([])

  const rowsByDay = useMemo(() => {
    const m = new Map<number, DayRow>()
    rows.forEach((r) => m.set(Number(r.dia_semana), r))
    return m
  }, [rows])

  async function fetchHorarios() {
    try {
      const res = await fetch("/api/configuracion/horarios", { cache: "no-store" })
      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "Error cargando horarios")
      const got = (json.horarios || []) as DayRow[]
      setRows(normalize7Days(got))
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      setLoading(true)
      fetchHorarios()
    }
  }, [open])

  function updateDay(dia: number, patch: Partial<DayRow>) {
    setRows((prev) =>
      prev.map((r) => (r.dia_semana === dia ? { ...r, ...patch } : r))
    )
  }

  function copyToAll(sourceDay: number) {
    const source = rowsByDay.get(sourceDay)
    if (!source) return

    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        cerrado: source.cerrado,
        hora_inicio: source.hora_inicio,
        hora_fin: source.hora_fin,
      }))
    )

    toast({
      title: "Horarios copiados",
      description: `Se aplicó el horario de ${DAY_LABEL[sourceDay]} a todos los días.`,
    })
  }

  async function handleSave() {
    setSaving(true)
    try {
      const payload = rows.map((r) => ({
        dia_semana: r.dia_semana,
        cerrado: !!r.cerrado,
        hora_inicio: r.cerrado ? null : r.hora_inicio,
        hora_fin: r.cerrado ? null : r.hora_fin,
      }))

      const res = await fetch("/api/configuracion/horarios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ horarios: payload }),
      })

      const json = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar")

      toast({ 
        title: "Guardado", 
        description: "Horario del local actualizado." 
      })

      router.refresh()
      onSaved?.()
      onOpenChange(false)
    } catch (e) {
      toast({
        title: "Error",
        description: e instanceof Error ? e.message : "Error",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Horario de inicio y fin de la jornada</DialogTitle>
          <DialogDescription>
            Activá los días en que atendés y configurá tus horas laborales.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-10 flex items-center justify-center text-gray-500">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Cargando...
          </div>
        ) : (
          <div className="space-y-4">
            {/* Tabla de horarios */}
            <div className="border rounded-lg overflow-hidden">
              {/* Header */}
              <div className="grid grid-cols-[120px,80px,1fr,1fr] gap-4 p-4 bg-gray-50 border-b text-sm font-medium text-gray-700">
                <div>Día</div>
                <div>Estado</div>
                <div>Inicio de la jornada</div>
                <div>Fin de la jornada</div>
              </div>

              {/* Rows */}
              {DAY_ORDER.map((dia) => {
                const r = rowsByDay.get(dia) || {
                  dia_semana: dia,
                  cerrado: true,
                  hora_inicio: null,
                  hora_fin: null,
                }

                return (
                  <div
                    key={dia}
                    className="grid grid-cols-[120px,80px,1fr,1fr] gap-4 p-4 border-b last:border-b-0 items-center bg-white hover:bg-gray-50 transition-colors"
                  >
                    {/* Día */}
                    <div className="font-medium text-gray-900">
                      {DAY_LABEL[dia]}
                    </div>

                    {/* Switch Estado */}
                    <div className="flex items-center">
                      <Switch
                        checked={!r.cerrado}
                        onCheckedChange={(checked) => {
                          if (!checked) {
                            updateDay(dia, { 
                              cerrado: true, 
                              hora_inicio: null, 
                              hora_fin: null 
                            })
                          } else {
                            const defaultInicio = r.hora_inicio || "09:00:00"
                            const defaultFin = r.hora_fin || "20:00:00"
                            updateDay(dia, {
                              cerrado: false,
                              hora_inicio: defaultInicio,
                              hora_fin: defaultFin,
                            })
                          }
                        }}
                      />
                    </div>

                    {/* Inicio */}
                    <div>
                      {r.cerrado ? (
                        <span className="text-sm text-gray-400">Cerrado</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded-md px-2 py-1.5 text-sm w-20"
                            value={toHHMM(r.hora_inicio).split(':')[0] || '09'}
                            onChange={(e) => {
                              const hh = e.target.value.padStart(2, '0')
                              const mm = toHHMM(r.hora_inicio).split(':')[1] || '00'
                              updateDay(dia, { hora_inicio: toHHMMSS(`${hh}:${mm}`) })
                            }}
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          <span className="text-gray-400">:</span>
                          <select
                            className="border rounded-md px-2 py-1.5 text-sm w-20"
                            value={toHHMM(r.hora_inicio).split(':')[1] || '00'}
                            onChange={(e) => {
                              const hh = toHHMM(r.hora_inicio).split(':')[0] || '09'
                              const mm = e.target.value.padStart(2, '0')
                              updateDay(dia, { hora_inicio: toHHMMSS(`${hh}:${mm}`) })
                            }}
                          >
                            {['00', '15', '30', '45'].map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

                    {/* Fin */}
                    <div>
                      {r.cerrado ? (
                        <span className="text-sm text-gray-400">Cerrado</span>
                      ) : (
                        <div className="flex items-center gap-2">
                          <select
                            className="border rounded-md px-2 py-1.5 text-sm w-20"
                            value={toHHMM(r.hora_fin).split(':')[0] || '20'}
                            onChange={(e) => {
                              const hh = e.target.value.padStart(2, '0')
                              const mm = toHHMM(r.hora_fin).split(':')[1] || '00'
                              updateDay(dia, { hora_fin: toHHMMSS(`${hh}:${mm}`) })
                            }}
                          >
                            {Array.from({ length: 24 }, (_, i) => (
                              <option key={i} value={i.toString().padStart(2, '0')}>
                                {i.toString().padStart(2, '0')}
                              </option>
                            ))}
                          </select>
                          <span className="text-gray-400">:</span>
                          <select
                            className="border rounded-md px-2 py-1.5 text-sm w-20"
                            value={toHHMM(r.hora_fin).split(':')[1] || '00'}
                            onChange={(e) => {
                              const hh = toHHMM(r.hora_fin).split(':')[0] || '20'
                              const mm = e.target.value.padStart(2, '0')
                              updateDay(dia, { hora_fin: toHHMMSS(`${hh}:${mm}`) })
                            }}
                          >
                            {['00', '15', '30', '45'].map((m) => (
                              <option key={m} value={m}>
                                {m}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Botón copiar */}
            <div className="flex justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => copyToAll(1)} // Copiar lunes a todos
                disabled={saving}
              >
                Copiar horario de Lunes a todos los días
              </Button>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={saving}
              >
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Guardando...
                  </>
                ) : (
                  "Guardar"
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}