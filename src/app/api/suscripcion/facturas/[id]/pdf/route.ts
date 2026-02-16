// src/app/api/suscripcion/facturas/[id]/pdf/route.ts
import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

function formatMetodoPago(raw: string | null): string {
  if (!raw) return 'MercadoPago'
  const lower = raw.toLowerCase()
  if (lower.startsWith('account_money')) return 'Saldo en cuenta MercadoPago'
  if (lower.includes('visa')) return 'Tarjeta Visa'
  if (lower.includes('master')) return 'Tarjeta Mastercard'
  if (lower.includes('amex')) return 'American Express'
  if (lower.includes('debit')) return 'Tarjeta de débito'
  if (lower.includes('rapipago')) return 'Rapipago'
  if (lower.includes('pagofacil')) return 'Pago Fácil'
  return raw.replace(/_/g, ' ').replace(/\s*\(\d+\)$/, '').trim()
}

function formatFecha(iso: string | null): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('es-AR', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

function formatMonto(cents: number, moneda: string): string {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: moneda || 'ARS',
    minimumFractionDigits: 0,
  }).format(cents)
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('No autorizado', { status: 401 })

  const admin = createAdminClient()

  // Obtener datos del negocio y datos de facturación
  const { data: negocio } = await admin
    .from('negocios')
    .select('id, nombre, email, telefono, direccion')
    .eq('owner_id', user.id)
    .single()

  if (!negocio) return new NextResponse('Negocio no encontrado', { status: 404 })

  // Obtener la factura (debe pertenecer al negocio del usuario)
  const { data: factura } = await admin
    .from('negocio_facturas')
    .select('id, numero, concepto, monto, moneda, estado, metodo_pago, emitida_en, pagada_en, mp_payment_id')
    .eq('id', id)
    .eq('negocio_id', negocio.id)
    .single()

  if (!factura) return new NextResponse('Factura no encontrada', { status: 404 })

  // Datos de facturación opcionales (CUIT, razón social, etc.)
  const { data: facturacion } = await admin
    .from('negocio_facturacion')
    .select('razon_social, cuit, direccion, ciudad, codigo_postal')
    .eq('negocio_id', negocio.id)
    .maybeSingle()

  const estadoColor = factura.estado === 'pagado'
    ? '#16a34a'
    : factura.estado === 'pendiente'
    ? '#d97706'
    : '#dc2626'

  const estadoLabel = factura.estado === 'pagado'
    ? 'PAGADO'
    : factura.estado === 'pendiente'
    ? 'PENDIENTE'
    : 'VENCIDO'

  const razonSocial = facturacion?.razon_social || negocio.nombre
  const cuit = facturacion?.cuit || null
  const direccionFacturacion = facturacion?.ciudad
    ? `${facturacion.direccion || ''}, ${facturacion.ciudad}${facturacion.codigo_postal ? ` (${facturacion.codigo_postal})` : ''}`.replace(/^,\s*/, '')
    : facturacion?.direccion || negocio.direccion || null

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Recibo ${factura.numero || factura.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f8fafc;
      color: #1e293b;
      padding: 40px 20px;
    }
    .page {
      max-width: 680px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      overflow: hidden;
    }
    /* Header */
    .header {
      background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
      color: #fff;
      padding: 36px 40px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }
    .header-brand { }
    .header-brand .app-name {
      font-size: 22px;
      font-weight: 700;
      letter-spacing: -0.5px;
      color: #fff;
    }
    .header-brand .app-sub {
      font-size: 12px;
      color: #94a3b8;
      margin-top: 2px;
    }
    .header-right { text-align: right; }
    .header-right .doc-type {
      font-size: 13px;
      text-transform: uppercase;
      letter-spacing: 1.5px;
      color: #94a3b8;
      margin-bottom: 4px;
    }
    .header-right .doc-number {
      font-size: 26px;
      font-weight: 700;
      color: #fff;
    }
    /* Estado badge */
    .status-bar {
      background: #f1f5f9;
      padding: 12px 40px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 1px solid #e2e8f0;
    }
    .status-badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 100px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
      color: #fff;
      background: ${estadoColor};
    }
    .status-date {
      font-size: 13px;
      color: #64748b;
    }
    /* Body */
    .body { padding: 36px 40px; }
    /* Grid de dos columnas */
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 24px;
      margin-bottom: 32px;
    }
    .info-block {}
    .info-block .label {
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #94a3b8;
      margin-bottom: 6px;
    }
    .info-block .value {
      font-size: 14px;
      color: #1e293b;
      line-height: 1.5;
    }
    .info-block .value.large {
      font-size: 28px;
      font-weight: 700;
      color: #0f172a;
    }
    /* Tabla de detalle */
    .table-wrap {
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      overflow: hidden;
      margin-bottom: 28px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
    }
    thead tr {
      background: #f8fafc;
    }
    th {
      padding: 12px 16px;
      text-align: left;
      font-size: 11px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      border-bottom: 1px solid #e2e8f0;
    }
    th:last-child { text-align: right; }
    td {
      padding: 16px;
      font-size: 14px;
      color: #334155;
      border-bottom: 1px solid #f1f5f9;
    }
    td:last-child { text-align: right; font-weight: 600; }
    tr:last-child td { border-bottom: none; }
    /* Total row */
    .total-row {
      background: #f8fafc;
    }
    .total-row td {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
      padding: 14px 16px;
    }
    /* Footer */
    .footer {
      padding: 20px 40px;
      border-top: 1px solid #e2e8f0;
      background: #f8fafc;
      text-align: center;
    }
    .footer p {
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.6;
    }
    /* Print */
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; }
      .print-btn { display: none !important; }
    }
    /* Print button */
    .print-btn {
      display: block;
      margin: 24px auto 0;
      padding: 12px 32px;
      background: #1e293b;
      color: #fff;
      border: none;
      border-radius: 8px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      letter-spacing: 0.3px;
    }
    .print-btn:hover { background: #334155; }
  </style>
</head>
<body>
  <div class="page">

    <!-- Header -->
    <div class="header">
      <div class="header-brand">
        <div class="app-name">Solo</div>
        <div class="app-sub">Plataforma de gestión para profesionales</div>
      </div>
      <div class="header-right">
        <div class="doc-type">Recibo de Pago</div>
        <div class="doc-number">${factura.numero || factura.id.slice(0, 8).toUpperCase()}</div>
      </div>
    </div>

    <!-- Estado bar -->
    <div class="status-bar">
      <span class="status-badge">${estadoLabel}</span>
      <span class="status-date">
        Emitida el ${formatFecha(factura.emitida_en)}
        ${factura.pagada_en ? ` · Pagada el ${formatFecha(factura.pagada_en)}` : ''}
      </span>
    </div>

    <!-- Body -->
    <div class="body">

      <!-- Grid info -->
      <div class="grid-2">
        <div class="info-block">
          <div class="label">Facturado a</div>
          <div class="value">
            <strong>${razonSocial}</strong><br/>
            ${cuit ? `CUIT: ${cuit}<br/>` : ''}
            ${direccionFacturacion ? `${direccionFacturacion}<br/>` : ''}
            ${negocio.email || ''}
          </div>
        </div>
        <div class="info-block">
          <div class="label">Método de pago</div>
          <div class="value">${formatMetodoPago(factura.metodo_pago)}</div>
          ${factura.mp_payment_id ? `
          <div class="label" style="margin-top:14px">ID de transacción</div>
          <div class="value" style="font-size:12px;color:#64748b;word-break:break-all">${factura.mp_payment_id}</div>
          ` : ''}
        </div>
      </div>

      <!-- Tabla detalle -->
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Descripción</th>
              <th>Período</th>
              <th>Importe</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${factura.concepto}</td>
              <td style="color:#64748b">${formatFecha(factura.emitida_en)}</td>
              <td>${formatMonto(factura.monto, factura.moneda)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="2" style="text-align:right;color:#64748b;">Total</td>
              <td>${formatMonto(factura.monto, factura.moneda)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Monto destacado -->
      <div class="info-block" style="text-align:center;margin-bottom:8px;">
        <div class="label">Total pagado</div>
        <div class="value large">${formatMonto(factura.monto, factura.moneda)}</div>
      </div>

    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Este documento es un comprobante de pago emitido por Solo.</p>
      <p>Para consultas: <a href="mailto:support@getsolo.app" style="color:#64748b">support@getsolo.app</a></p>
    </div>

  </div>

  <!-- Botón imprimir (solo visible en pantalla) -->
  <button class="print-btn" onclick="window.print()">⬇ Descargar / Imprimir PDF</button>

  <script>
    // Auto-trigger print dialog para que el usuario pueda "Guardar como PDF"
    // Sólo si viene con ?print=1
    if (new URLSearchParams(location.search).get('print') === '1') {
      window.addEventListener('load', () => setTimeout(() => window.print(), 400))
    }
  </script>
</body>
</html>`

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}