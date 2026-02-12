import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

type ConfirmacionEmail = {
  clienteEmail: string
  clienteNombre: string
  negocioNombre: string
  servicioNombre: string
  profesionalNombre: string
  fecha: string
  hora: string
  negocioDireccion?: string | null
  negocioTelefono?: string | null
}

export async function sendConfirmacionReserva(data: ConfirmacionEmail) {
  try {
    const { error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'GetSolo <onboarding@resend.dev>',
      to: data.clienteEmail,
      subject: `Confirmación de turno - ${data.negocioNombre}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <style>
              body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
              }
              .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 30px;
                text-align: center;
                border-radius: 10px 10px 0 0;
              }
              .content {
                background: #f9fafb;
                padding: 30px;
                border: 1px solid #e5e7eb;
                border-top: none;
                border-radius: 0 0 10px 10px;
              }
              .info-box {
                background: white;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                border-left: 4px solid #667eea;
              }
              .info-row {
                display: flex;
                justify-content: space-between;
                padding: 10px 0;
                border-bottom: 1px solid #e5e7eb;
              }
              .info-row:last-child {
                border-bottom: none;
              }
              .label {
                font-weight: bold;
                color: #6b7280;
              }
              .value {
                color: #1f2937;
              }
              .footer {
                text-align: center;
                margin-top: 30px;
                padding-top: 20px;
                border-top: 1px solid #e5e7eb;
                color: #6b7280;
                font-size: 14px;
              }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>✅ ¡Turno Confirmado!</h1>
            </div>
            
            <div class="content">
              <p>Hola <strong>${data.clienteNombre}</strong>,</p>
              
              <p>Tu turno ha sido reservado exitosamente en <strong>${data.negocioNombre}</strong>.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Servicio:</span>
                  <span class="value">${data.servicioNombre}</span>
                </div>
                <div class="info-row">
                  <span class="label">Profesional:</span>
                  <span class="value">${data.profesionalNombre}</span>
                </div>
                <div class="info-row">
                  <span class="label">Fecha:</span>
                  <span class="value">${new Date(data.fecha).toLocaleDateString('es-AR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div class="info-row">
                  <span class="label">Hora:</span>
                  <span class="value">${data.hora}</span>
                </div>
                ${data.negocioDireccion ? `
                <div class="info-row">
                  <span class="label">Dirección:</span>
                  <span class="value">${data.negocioDireccion}</span>
                </div>
                ` : ''}
                ${data.negocioTelefono ? `
                <div class="info-row">
                  <span class="label">Teléfono:</span>
                  <span class="value">${data.negocioTelefono}</span>
                </div>
                ` : ''}
              </div>
              
              <p><strong>Importante:</strong></p>
              <ul>
                <li>Por favor llega 5 minutos antes de tu turno</li>
                <li>Si necesitas cancelar o reprogramar, comunícate con anticipación</li>
                <li>Recibirás un recordatorio 24 horas antes por WhatsApp</li>
              </ul>
              
              <div class="footer">
                <p>Este es un correo automático, por favor no respondas.</p>
                <p>© ${new Date().getFullYear()} ${data.negocioNombre} - Powered by GetSolo</p>
              </div>
            </div>
          </body>
        </html>
      `,
    })

    if (error) {
      console.error('Error sending email:', error)
      return { success: false, error }
    }

    return { success: true }
  } catch (error) {
    console.error('Error sending email:', error)
    return { success: false, error }
  }
}