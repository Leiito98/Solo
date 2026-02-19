"use client"

import { useMemo, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { Mail, ShieldCheck, Save } from "lucide-react"

function isEmail(v: string) {
  return /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i.test(v.trim())
}

export default function EmailNotificacionesClient(props: {
  negocioId: string
  ownerEmailDestino: string | null
  initialClienteConfirm: boolean
  initialOwnerNewBooking: boolean
  initialReplyTo: string | null
}) {
  const { toast } = useToast()
  const [clienteConfirm, setClienteConfirm] = useState(props.initialClienteConfirm)
  const [ownerNewBooking, setOwnerNewBooking] = useState(props.initialOwnerNewBooking)
  const [replyTo, setReplyTo] = useState(props.initialReplyTo ?? "")
  const [saving, setSaving] = useState(false)

  const ownerEmailOk = useMemo(() => Boolean(props.ownerEmailDestino?.trim()), [props.ownerEmailDestino])

  async function onSave() {
    const rt = replyTo.trim()

    if (rt && !isEmail(rt)) {
      toast({
        title: "Reply-To inválido",
        description: "Escribí un email válido o dejalo vacío.",
        variant: "destructive",
      })
      return
    }

    setSaving(true)
    try {
      const res = await fetch("/api/negocio/notificaciones/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          notif_email_cliente_confirm: clienteConfirm,
          notif_email_owner_new_booking: ownerNewBooking,
          notif_email_reply_to: rt || null,
        }),
      })

      const json = await res.json().catch(() => null)
      if (!res.ok) throw new Error(json?.error || "No se pudo guardar")

      toast({
        title: "Guardado",
        description: "Tus preferencias de email se actualizaron.",
      })
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message || "No se pudo guardar",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-6 space-y-6">
        {/* Destino del owner */}
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
            <Mail className="w-5 h-5 text-gray-700" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900">Destino de email</p>
            <p className="text-sm text-gray-500">
              Se usa <span className="text-green-700">{props.ownerEmailDestino}</span> como email donde llegan notificaciones.
            </p>

            <div className="mt-2 text-sm">
              {ownerEmailOk ? (
                <div className="inline-flex items-center gap-2 rounded-md bg-green-50 border border-green-200 px-3 py-2">
                  <span className="text-green-700 font-semibold">Configurado:</span>
                  <span className="text-green-700">{props.ownerEmailDestino}</span>
                </div>
              ) : (
                <div className="inline-flex items-center gap-2 rounded-md bg-yellow-50 border border-yellow-200 px-3 py-2">
                  <span className="text-yellow-800 font-semibold">Falta:</span>
                  <span className="text-yellow-800">
                    Completá el email del negocio (negocios.email) para recibir avisos.
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Confirmación al cliente</p>
              <p className="text-sm text-gray-500">
                Envía un email automático al cliente cuando reserva.
              </p>
            </div>
            <Switch checked={clienteConfirm} onCheckedChange={setClienteConfirm} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <p className="font-semibold text-gray-900">Aviso al dueño por nueva reserva</p>
              <p className="text-sm text-gray-500">
                Envía un email al negocio cuando entra una reserva.
                {!ownerEmailOk ? " (Requiere email del negocio)" : ""}
              </p>
            </div>
            <Switch
              checked={ownerNewBooking}
              onCheckedChange={setOwnerNewBooking}
              disabled={!ownerEmailOk}
            />
          </div>
        </div>

        {/* Reply-To */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-gray-900 font-semibold">
            <ShieldCheck className="w-4 h-4" />
            Reply-To (opcional)
          </div>
          <p className="text-sm text-gray-500">
            Si el cliente responde el mail, la respuesta puede ir al email del negocio (o al que definas acá).
          </p>

          <Input
            placeholder="ej: reservas@tudominio.com"
            value={replyTo}
            onChange={(e) => setReplyTo(e.target.value)}
          />

          <p className="text-xs text-gray-400">
            Dejalo vacío si no querés Reply-To.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onSave} disabled={saving} className="gap-2">
            <Save className="w-4 h-4" />
            {saving ? "Guardando..." : "Guardar cambios"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
