import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Política de Privacidad · Solo',
  description: 'Política de privacidad y tratamiento de datos de la plataforma Solo.',
}

const sections = [
  { id: 'introduccion', title: '1. Introducción' },
  { id: 'responsable', title: '2. Responsable del tratamiento' },
  { id: 'datos-negocio', title: '3. Datos del Negocio' },
  { id: 'datos-clientes', title: '4. Datos de Clientes Finales' },
  { id: 'uso-datos', title: '5. Uso de los datos' },
  { id: 'compartir', title: '6. Compartir información' },
  { id: 'almacenamiento', title: '7. Almacenamiento y seguridad' },
  { id: 'multitenant', title: '8. Arquitectura multi-tenant' },
  { id: 'cookies', title: '9. Cookies' },
  { id: 'derechos', title: '10. Tus derechos' },
  { id: 'terceros', title: '11. Servicios de terceros' },
  { id: 'menores', title: '12. Menores de edad' },
  { id: 'cambios', title: '13. Cambios a esta política' },
  { id: 'contacto', title: '14. Contacto' },
]

export default function PrivacidadPage() {
  return (
    <div
      className="min-h-screen bg-[#0a0a0a] text-white"
      style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700;800&family=Cabinet+Grotesk:wght@400;500;700;800;900&display=swap');
        .heading-font { font-family: 'Cabinet Grotesk', 'DM Sans', system-ui, sans-serif; }
        .blob { filter: blur(80px); border-radius: 50%; position: absolute; pointer-events: none; }
        .toc-link { transition: all 0.15s; color: rgba(255,255,255,0.3); display: block; font-size: 0.75rem; padding: 0.375rem 0 0.375rem 0.75rem; border-left: 1px solid rgba(255,255,255,0.07); }
        .toc-link:hover { color: rgba(167,243,208,1); border-left-color: rgba(52,211,153,0.4); padding-left: 1rem; }
        .prose h2 { font-family: 'Cabinet Grotesk', sans-serif; font-weight: 800; font-size: 1.125rem; color: white; margin-top: 2.5rem; margin-bottom: 0.875rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .prose h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
        .prose h3 { font-family: 'Cabinet Grotesk', sans-serif; font-weight: 700; font-size: 0.8rem; color: rgba(255,255,255,0.55); margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.07em; }
        .prose p { font-size: 0.9rem; line-height: 1.8; margin-bottom: 0.875rem; color: rgba(255,255,255,0.45); }
        .prose ul { list-style: none; padding: 0; margin: 0 0 1rem 0; }
        .prose ul li { font-size: 0.9rem; line-height: 1.75; padding-left: 1.25rem; position: relative; margin-bottom: 0.375rem; color: rgba(255,255,255,0.45); }
        .prose ul li::before { content: '·'; position: absolute; left: 0; color: rgba(52,211,153,0.5); font-size: 1.1rem; line-height: 1.5; }
        .prose strong { color: rgba(255,255,255,0.78); font-weight: 600; }
        .prose a { color: rgba(96,165,250,0.8); text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
        .prose a:hover { color: rgba(147,197,253,1); }
        .info-box { background: rgba(52,211,153,0.04); border: 1px solid rgba(52,211,153,0.12); border-radius: 12px; padding: 1rem 1.125rem; margin-bottom: 0.875rem; }
        .info-box p { margin-bottom: 0; color: rgba(255,255,255,0.48); }
        .warn-box { background: rgba(251,191,36,0.04); border: 1px solid rgba(251,191,36,0.12); border-radius: 12px; padding: 1rem 1.125rem; margin-bottom: 0.875rem; }
        .warn-box p { margin-bottom: 0; color: rgba(255,255,255,0.48); }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob w-[500px] h-[500px] bg-emerald-600/7 top-[-150px] right-[-150px]" />
        <div className="blob w-[400px] h-[400px] bg-blue-600/6 bottom-[-100px] left-[-100px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:48px_48px]" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 border-b border-white/[0.06] bg-[#0a0a0a]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
            </div>
            <span className="heading-font text-base font-800 text-white">Solo</span>
          </Link>
          <div className="flex items-center gap-5">
            <Link href="/terminos-y-condiciones" className="text-xs text-white/30 hover:text-white/60 transition-colors hidden sm:block">
              Términos
            </Link>
            <Link href="/register" className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/20 px-3 py-1.5 rounded-lg font-semibold transition-all">
              Empezar gratis
            </Link>
          </div>
        </div>
      </nav>

      <div className="relative z-10 max-w-6xl mx-auto px-5 py-12 flex gap-12">

        {/* TOC Sidebar */}
        <aside className="hidden lg:block w-52 flex-shrink-0">
          <div className="sticky top-20 space-y-0.5">
            <p className="text-[10px] font-semibold text-white/20 uppercase tracking-widest mb-4 pl-3">Contenido</p>
            {sections.map((s) => (
              <a key={s.id} href={`#${s.id}`} className="toc-link">{s.title}</a>
            ))}
            <div className="pt-5 mt-4 border-t border-white/[0.06]">
              <Link href="/terminos-y-condiciones" className="toc-link" style={{ color: 'rgba(96,165,250,0.6)', borderLeftColor: 'rgba(96,165,250,0.15)' }}>
                → Términos y Condiciones
              </Link>
            </div>
          </div>
        </aside>

        {/* Main */}
        <main className="flex-1 min-w-0 max-w-2xl">
          <div className="mb-10">
            <div className="inline-flex items-center gap-2 mb-5 px-3 py-1 rounded-full bg-white/[0.04] border border-white/[0.07] text-white/25 text-[11px] font-semibold uppercase tracking-widest">
              Legal
            </div>
            <h1 className="heading-font text-4xl sm:text-5xl font-900 text-white leading-tight mb-4">
              Política de<br />Privacidad
            </h1>
            <p className="text-sm text-white/30 leading-relaxed">
              Última actualización: enero de 2026 · En Solo nos tomamos la privacidad de tus datos muy en serio.
            </p>
          </div>

          <div className="prose">

            <section id="introduccion">
              <h2>1. Introducción</h2>
              <p>
                Esta Política de Privacidad describe cómo <strong>Solo</strong> recopila, usa, almacena y protege la información personal de los Negocios que utilizan la Plataforma y de los Clientes Finales cuyos datos son gestionados a través de ella.
              </p>
              <p>
                Al registrarse y usar la Plataforma, el Negocio acepta las prácticas descritas en esta Política. Esta Política se integra con los <Link href="/terminos-y-condiciones">Términos y Condiciones</Link> de Solo y ambos documentos deben leerse en conjunto.
              </p>
              <div className="info-box">
                <p>
                  <strong>Resumen:</strong> Solo solo recopila los datos necesarios para prestar el servicio. No vendemos datos personales a terceros. Cada Negocio tiene su propio espacio aislado de datos. Podés solicitar la eliminación de tus datos en cualquier momento.
                </p>
              </div>
            </section>

            <section id="responsable">
              <h2>2. Responsable del tratamiento</h2>
              <p>
                El responsable del tratamiento de los datos de los Negocios es <strong>Solo</strong>, operadora de la Plataforma <strong>getsolo.site</strong>. Para consultas relacionadas con privacidad, podés contactarnos a través del canal de soporte disponible en la Plataforma o vía WhatsApp.
              </p>
              <p>
                Respecto de los datos de los Clientes Finales, el Negocio actúa como <strong>responsable del tratamiento</strong>, y Solo actúa como <strong>encargado del tratamiento</strong> (procesador de datos), almacenando y procesando dichos datos únicamente para prestar el servicio al Negocio.
              </p>
            </section>

            <section id="datos-negocio">
              <h2>3. Datos que recopilamos del Negocio</h2>
              <p>Al registrarte y usar la Plataforma, recopilamos:</p>

              <h3>3.1 Datos de registro</h3>
              <ul>
                <li>Nombre del responsable del Negocio (nombre y apellido).</li>
                <li>Dirección de correo electrónico.</li>
                <li>Contraseña (almacenada en formato encriptado, nunca en texto plano).</li>
                <li>Nombre del negocio, tipo de negocio (vertical) y slug único.</li>
                <li>Datos opcionales: dirección física, teléfono, email de contacto del negocio.</li>
              </ul>

              <h3>3.2 Datos de uso y actividad</h3>
              <ul>
                <li>Turnos creados, modificados o cancelados.</li>
                <li>Servicios y precios configurados.</li>
                <li>Profesionales dados de alta y sus comisiones.</li>
                <li>Gastos fijos registrados.</li>
                <li>Registros de acceso a la Cuenta (fecha, hora, IP).</li>
              </ul>

              <h3>3.3 Datos de facturación</h3>
              <ul>
                <li>Método de pago para la suscripción (procesado y almacenado por el proveedor de pagos; Solo no almacena datos de tarjetas).</li>
                <li>Historial de pagos y facturas.</li>
              </ul>
            </section>

            <section id="datos-clientes">
              <h2>4. Datos de Clientes Finales</h2>
              <p>
                Los Clientes Finales son las personas que reservan turnos con el Negocio. Los datos de Clientes Finales son ingresados y gestionados por el Negocio a través de la Plataforma. Solo actúa como encargado del tratamiento de estos datos.
              </p>
              <p>Los datos de Clientes Finales que pueden almacenarse en la Plataforma incluyen:</p>
              <ul>
                <li>Nombre y apellido.</li>
                <li>Número de teléfono y/o email (para envío de recordatorios).</li>
                <li>Historial de turnos realizados con el Negocio.</li>
                <li>Estado de pago de cada turno.</li>
              </ul>
              <div className="warn-box">
                <p>
                  <strong>Importante para el Negocio:</strong> el Negocio es responsable de informar a sus Clientes Finales sobre el uso de sus datos y de obtener el consentimiento necesario conforme a la normativa de protección de datos aplicable en su jurisdicción.
                </p>
              </div>
            </section>

            <section id="uso-datos">
              <h2>5. Uso de los datos</h2>
              <p>Solo usa los datos recopilados para los siguientes fines:</p>

              <h3>5.1 Prestación del servicio</h3>
              <ul>
                <li>Operar y mantener la Plataforma.</li>
                <li>Gestionar la Cuenta del Negocio y sus turnos.</li>
                <li>Enviar recordatorios automáticos de turno a los Clientes Finales del Negocio.</li>
                <li>Calcular métricas, ingresos y comisiones en el Dashboard.</li>
              </ul>

              <h3>5.2 Comunicación</h3>
              <ul>
                <li>Enviar notificaciones relacionadas con el servicio (cambios en la Plataforma, actualizaciones de planes, alertas de seguridad).</li>
                <li>Responder consultas de soporte técnico.</li>
                <li>Informar sobre cambios en estos Términos o en la Política de Privacidad.</li>
              </ul>

              <h3>5.3 Mejora del producto</h3>
              <ul>
                <li>Analizar patrones de uso de forma agregada y anónima para mejorar las funcionalidades.</li>
                <li>Detectar y corregir errores técnicos.</li>
              </ul>

              <h3>5.4 Facturación</h3>
              <ul>
                <li>Procesar el cobro mensual de la suscripción.</li>
                <li>Mantener registros de facturación requeridos por obligaciones legales.</li>
              </ul>

              <p>Solo <strong>no usa</strong> los datos de los Negocios ni de los Clientes Finales para publicidad de terceros, ni los vende o cede a terceros con fines comerciales propios.</p>
            </section>

            <section id="compartir">
              <h2>6. Compartir información con terceros</h2>
              <p>Solo comparte datos únicamente en los siguientes casos:</p>
              <ul>
                <li><strong>Proveedores de infraestructura:</strong> servicios de hosting y base de datos (como Supabase) que almacenan los datos bajo acuerdos de confidencialidad y seguridad.</li>
                <li><strong>MercadoPago:</strong> datos necesarios para procesar el cobro de señas (nombre del cliente, monto) según sus términos y condiciones.</li>
                <li><strong>Servicios de email:</strong> dirección de email del Cliente Final para enviar recordatorios de turnos en nombre del Negocio.</li>
                <li><strong>Obligaciones legales:</strong> cuando sea requerido por ley, orden judicial o autoridad gubernamental competente.</li>
              </ul>
              <p>
                Todos los proveedores con los que Solo comparte datos están obligados a tratar dicha información de forma confidencial y únicamente para la prestación del servicio contratado.
              </p>
            </section>

            <section id="almacenamiento">
              <h2>7. Almacenamiento y seguridad</h2>
              <p>
                Los datos de la Plataforma se almacenan en servidores con cifrado en tránsito (HTTPS/TLS) y en reposo. Solo implementa medidas técnicas y organizativas razonables para proteger los datos contra acceso no autorizado, pérdida o alteración.
              </p>
              <ul>
                <li>Las contraseñas se almacenan usando hashing seguro (bcrypt/Argon2); Solo no puede ver ni recuperar contraseñas.</li>
                <li>El acceso a los datos está restringido al personal técnico necesario para operar la Plataforma.</li>
                <li>Los datos de cada Negocio están lógicamente aislados de los de otros Negocios.</li>
              </ul>
              <p>
                <strong>Retención:</strong> los datos se conservan mientras la Cuenta esté activa. Ante la cancelación de una Cuenta, los datos podrán eliminarse en un plazo de hasta 90 días, salvo que exista obligación legal de conservarlos por mayor tiempo.
              </p>
            </section>

            <section id="multitenant">
              <h2>8. Arquitectura multi-tenant y aislamiento de datos</h2>
              <p>
                Solo opera bajo una arquitectura <strong>multi-tenant</strong>: múltiples Negocios comparten la misma infraestructura técnica, pero sus datos están <strong>lógicamente aislados</strong> mediante políticas de seguridad a nivel de base de datos (Row Level Security).
              </p>
              <p>
                Esto significa que:
              </p>
              <ul>
                <li>Ningún Negocio puede acceder a los datos de otro Negocio.</li>
                <li>Los turnos, clientes, servicios y métricas de cada Negocio son visibles únicamente para ese Negocio.</li>
                <li>El personal técnico de Solo solo accede a datos de un Negocio específico cuando es estrictamente necesario para resolver un problema técnico, bajo protocolos internos de acceso controlado.</li>
              </ul>
              <div className="info-box">
                <p>Cada Negocio tiene su propio espacio (<em>tenant</em>) completamente separado del resto, identificado por su <em>owner_id</em> único en nuestra base de datos.</p>
              </div>
            </section>

            <section id="cookies">
              <h2>9. Cookies y tecnologías de seguimiento</h2>
              <p>La Plataforma utiliza cookies y tecnologías similares para:</p>
              <ul>
                <li><strong>Cookies esenciales:</strong> mantener la sesión del Negocio activa mientras usa la Plataforma. Sin estas cookies, el servicio no puede funcionar.</li>
                <li><strong>Cookies de preferencias:</strong> recordar configuraciones del usuario.</li>
                <li><strong>Cookies analíticas:</strong> analizar el uso de la Plataforma de forma agregada para mejorar la experiencia (datos no vinculados a identidades personales).</li>
              </ul>
              <p>
                El Negocio puede gestionar las cookies desde la configuración de su navegador. Desactivar las cookies esenciales puede impedir el correcto funcionamiento de la Plataforma.
              </p>
            </section>

            <section id="derechos">
              <h2>10. Tus derechos sobre los datos</h2>
              <p>
                El Negocio tiene derecho a:
              </p>
              <ul>
                <li><strong>Acceso:</strong> solicitar una copia de los datos personales que Solo tiene sobre su Cuenta.</li>
                <li><strong>Rectificación:</strong> corregir datos inexactos o incompletos directamente desde la configuración de la Cuenta o solicitándolo a Solo.</li>
                <li><strong>Eliminación:</strong> solicitar la eliminación de su Cuenta y todos los datos asociados.</li>
                <li><strong>Portabilidad:</strong> solicitar la exportación de sus datos en formato estructurado.</li>
                <li><strong>Oposición:</strong> oponerse al tratamiento de sus datos para fines de comunicación comercial.</li>
              </ul>
              <p>
                Para ejercer cualquiera de estos derechos, el Negocio puede contactar a Solo a través del canal de soporte en la Plataforma. Solo responderá en un plazo máximo de <strong>30 días hábiles</strong>.
              </p>
            </section>

            <section id="terceros">
              <h2>11. Servicios de terceros</h2>
              <p>La Plataforma se integra con los siguientes servicios de terceros, cuyos términos y políticas de privacidad aplican de forma independiente:</p>
              <ul>
                <li><strong>Supabase:</strong> base de datos y autenticación. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer">Ver política de privacidad</a></li>
                <li><strong>MercadoPago:</strong> procesamiento de pagos. <a href="https://www.mercadopago.com.ar/privacidad" target="_blank" rel="noopener noreferrer">Ver política de privacidad</a></li>
              </ul>
              <p>
                Solo no controla las prácticas de privacidad de estos terceros y recomienda revisar sus políticas de privacidad independientemente.
              </p>
            </section>

            <section id="menores">
              <h2>12. Menores de edad</h2>
              <p>
                La Plataforma no está dirigida a menores de 18 años. Solo no recopila conscientemente datos personales de menores. Si el Negocio detecta que un menor ha utilizado su URL pública para realizar una reserva, debe notificar a Solo para gestionar la situación.
              </p>
            </section>

            <section id="cambios">
              <h2>13. Cambios a esta Política</h2>
              <p>
                Solo puede actualizar esta Política de Privacidad en cualquier momento. Los cambios serán notificados al Negocio por email con al menos <strong>15 días de anticipación</strong> antes de su entrada en vigencia.
              </p>
              <p>
                El uso continuado de la Plataforma tras la entrada en vigencia de la nueva Política implica su aceptación. Si el Negocio no acepta los cambios, puede cancelar su Cuenta antes de la fecha de vigencia.
              </p>
            </section>

            <section id="contacto">
              <h2>14. Contacto</h2>
              <p>
                Para consultas, solicitudes de acceso, rectificación o eliminación de datos, y cualquier otra cuestión relacionada con privacidad, podés contactarte con Solo a través de:
              </p>
              <ul>
                <li><strong>Canal de soporte:</strong> disponible dentro de la Plataforma una vez que iniciás sesión.</li>
                <li><strong>WhatsApp:</strong> indicado en el footer de la Plataforma.</li>
              </ul>
              <p>
                Intentaremos responder todas las consultas de privacidad en un plazo máximo de 30 días hábiles.
              </p>
            </section>

          </div>

          {/* Footer */}
          <div className="mt-16 pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-6 h-6">
                <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" />
              </div>
              <span className="text-xs text-white/25">© 2026 Solo. Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center gap-5 text-xs text-white/25">
              <Link href="/terminos-y-condiciones" className="hover:text-white/60 transition-colors">Términos y Condiciones</Link>
              <Link href="/" className="hover:text-white/60 transition-colors">Volver al inicio</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}