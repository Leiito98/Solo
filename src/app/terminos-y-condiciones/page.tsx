import Link from 'next/link'
import Image from 'next/image'

export const metadata = {
  title: 'Términos y Condiciones · Solo',
  description: 'Términos y condiciones de uso de la plataforma Solo.',
}

const sections = [
  { id: 'generalidades', title: '1. Generalidades' },
  { id: 'definiciones', title: '2. Definiciones' },
  { id: 'servicios', title: '3. Servicios de Solo' },
  { id: 'acceso', title: '4. Condiciones de acceso' },
  { id: 'planes', title: '5. Planes y forma de pago' },
  { id: 'tarifas', title: '6. Tarifas' },
  { id: 'agenda', title: '7. Funcionalidad de agenda' },
  { id: 'pagos', title: '8. Procesamiento de pagos' },
  { id: 'responsabilidades', title: '9. Responsabilidades del negocio' },
  { id: 'limitaciones', title: '10. Limitaciones de responsabilidad' },
  { id: 'propiedad', title: '11. Propiedad intelectual' },
  { id: 'terminacion', title: '12. Vigencia y terminación' },
  { id: 'varios', title: '13. Varios' },
]

export default function TerminosPage() {
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
        .toc-link:hover { color: rgba(147,197,253,1); border-left-color: rgba(96,165,250,0.4); padding-left: 1rem; }
        .prose h2 { font-family: 'Cabinet Grotesk', sans-serif; font-weight: 800; font-size: 1.125rem; color: white; margin-top: 2.5rem; margin-bottom: 0.875rem; padding-top: 2rem; border-top: 1px solid rgba(255,255,255,0.06); }
        .prose h2:first-child { margin-top: 0; padding-top: 0; border-top: none; }
        .prose h3 { font-family: 'Cabinet Grotesk', sans-serif; font-weight: 700; font-size: 0.8rem; color: rgba(255,255,255,0.55); margin-top: 1.25rem; margin-bottom: 0.5rem; text-transform: uppercase; letter-spacing: 0.07em; }
        .prose p { font-size: 0.9rem; line-height: 1.8; margin-bottom: 0.875rem; color: rgba(255,255,255,0.45); }
        .prose ul { list-style: none; padding: 0; margin: 0 0 1rem 0; }
        .prose ul li { font-size: 0.9rem; line-height: 1.75; padding-left: 1.25rem; position: relative; margin-bottom: 0.375rem; color: rgba(255,255,255,0.45); }
        .prose ul li::before { content: '·'; position: absolute; left: 0; color: rgba(96,165,250,0.5); font-size: 1.1rem; line-height: 1.5; }
        .prose strong { color: rgba(255,255,255,0.78); font-weight: 600; }
        .prose a { color: rgba(96,165,250,0.8); text-decoration: underline; text-underline-offset: 2px; transition: color 0.15s; }
        .prose a:hover { color: rgba(147,197,253,1); }
        .info-box { background: rgba(59,130,246,0.05); border: 1px solid rgba(59,130,246,0.14); border-radius: 12px; padding: 1rem 1.125rem; margin-bottom: 0.875rem; }
        .info-box p { margin-bottom: 0; }
        .info-box p:first-child { margin-bottom: 0.35rem; }
      `}</style>

      {/* Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="blob w-[500px] h-[500px] bg-blue-600/8 top-[-150px] left-[-150px]" />
        <div className="blob w-[350px] h-[350px] bg-violet-600/6 bottom-[-100px] right-[-100px]" />
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
            <Link href="/politica-de-privacidad" className="text-xs text-white/30 hover:text-white/60 transition-colors hidden sm:block">
              Privacidad
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
              <Link href="/politica-de-privacidad" className="toc-link" style={{ color: 'rgba(96,165,250,0.6)', borderLeftColor: 'rgba(96,165,250,0.15)' }}>
                → Política de Privacidad
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
              Términos y<br />Condiciones
            </h1>
            <p className="text-sm text-white/30 leading-relaxed">
              Última actualización: enero de 2026 · Vigente para todos los negocios registrados en Solo.
            </p>
          </div>

          <div className="prose">

            <section id="generalidades">
              <h2>1. Generalidades</h2>
              <p>Las relaciones contractuales con <strong>Solo</strong> (en adelante, <strong>"Solo"</strong> o <strong>"la Plataforma"</strong>) se rigen por los siguientes Términos y Condiciones, constituyendo un contrato vinculante con cualquier Negocio que acceda, use o navegue la Plataforma y sus Servicios.</p>
              <p>Cualquier Negocio que no acepte estos Términos, los cuales tienen carácter obligatorio, deberá abstenerse de utilizar la Plataforma. No está permitido el uso de los Servicios por menores de dieciocho (18) años.</p>
              <p>Estos Términos hacen referencia a la <Link href="/politica-de-privacidad">Política de Privacidad</Link> de Solo, la cual es parte integrante de los mismos.</p>
            </section>

            <section id="definiciones">
              <h2>2. Definiciones</h2>
              <ul>
                <li><strong>"Solo":</strong> empresa proveedora de los Servicios y operadora de la Plataforma.</li>
                <li><strong>"Plataforma":</strong> sitio web <strong>getsolo.site</strong>, sus subdominios y aplicaciones web asociadas.</li>
                <li><strong>"Negocio":</strong> persona humana o jurídica que contrata los Servicios de Solo para gestionar su actividad de prestación de servicios. También denominado "Comercio".</li>
                <li><strong>"Profesional":</strong> persona física que presta servicios dentro del Negocio y cuya actividad es gestionada en la Plataforma (barbero, esteticista, nutricionista, psicólogo, etc.).</li>
                <li><strong>"Cliente Final":</strong> persona que consume los servicios del Negocio y puede realizar reservas a través de la Plataforma.</li>
                <li><strong>"Cuenta":</strong> acceso exclusivo del Negocio a la Plataforma, identificado por su email y contraseña.</li>
                <li><strong>"Turno" / "Reserva":</strong> agendamiento de un servicio específico en un horario determinado, realizado por un Cliente Final o por el Negocio.</li>
                <li><strong>"Seña":</strong> pago anticipado parcial requerido al Cliente Final al confirmar una Reserva, procesado vía MercadoPago.</li>
                <li><strong>"Comisión":</strong> porcentaje de facturación asignado a cada Profesional por el Negocio, calculado automáticamente por la Plataforma.</li>
                <li><strong>"Dashboard":</strong> panel de control del Negocio con métricas, turnos, finanzas y equipo en tiempo real.</li>
                <li><strong>"Slug":</strong> identificador único del Negocio que forma su URL pública (ej: <em>mi-negocio.getsolo.site</em>).</li>
                <li><strong>"Plan":</strong> modalidad de suscripción contratada, que determina funcionalidades y límites disponibles.</li>
                <li><strong>"Vertical":</strong> rubro del Negocio (barbería, spa, nutrición, psicología, fitness, belleza, etc.).</li>
              </ul>
            </section>

            <section id="servicios">
              <h2>3. Servicios de Solo</h2>
              <p>Solo es una plataforma ERP entregada como SaaS, orientada a negocios de servicios que trabajan con turnos, profesionales y clientes recurrentes. Opera bajo arquitectura <strong>multi-tenant</strong>: cada Negocio tiene su propio espacio de datos aislado, accesible desde su URL única.</p>

              <h3>3.1 Agenda y reservas online</h3>
              <ul>
                <li>Sistema de agenda 24/7 para que los Clientes Finales reserven turnos de forma autónoma.</li>
                <li>URL pública personalizada por Negocio (<em>slug.getsolo.site</em>) como página de reservas y landing page.</li>
                <li>Recordatorios automáticos por email al Cliente Final 24 horas antes de cada turno.</li>
                <li>Gestión de disponibilidad horaria por Profesional y por servicio.</li>
                <li>Confirmación, modificación y cancelación de turnos desde el panel de administración.</li>
              </ul>

              <h3>3.2 Pagos y señas</h3>
              <ul>
                <li>Integración con MercadoPago para cobro de señas al momento de la reserva.</li>
                <li>Seña configurable como obligatoria u opcional por el Negocio.</li>
                <li>Seguimiento del estado de pago de cada turno (sin seña / seña pagada / pago completo).</li>
              </ul>

              <h3>3.3 Gestión financiera</h3>
              <ul>
                <li>Caja del día: ingresos en tiempo real.</li>
                <li>Ingresos mensuales consolidados y evolución de facturación.</li>
                <li>Registro y control de gastos fijos.</li>
                <li>Cálculo automático de comisiones por Profesional.</li>
                <li>Exportación de reportes a Excel/PDF (plan Pro).</li>
              </ul>

              <h3>3.4 Gestión de equipo</h3>
              <ul>
                <li>Alta y gestión de Profesionales ilimitados (plan Pro) o hasta 2 (plan Solo).</li>
                <li>Asignación de servicios, precios y comisiones individuales.</li>
                <li>Ranking mensual de performance por turnos y facturación.</li>
              </ul>

              <h3>3.5 Dashboard</h3>
              <ul>
                <li>KPIs en tiempo real: caja del día, turnos, ingresos del mes, clientes atendidos.</li>
                <li>Próximo turno con cuenta regresiva y datos del cliente.</li>
                <li>Gráfico de ingresos de los últimos 7 días.</li>
                <li>Alertas de turnos atrasados.</li>
              </ul>

              <h3>3.6 Landing page del Negocio</h3>
              <ul>
                <li>Página web pública generada automáticamente con el nombre y datos del Negocio.</li>
                <li>Botón de reserva integrado con el sistema de agenda.</li>
              </ul>
            </section>

            <section id="acceso">
              <h2>4. Condiciones de acceso</h2>

              <h3>4.1 Registro</h3>
              <p>El registro en la Plataforma se realiza en dos pasos: (i) creación de cuenta con email y contraseña, confirmada mediante link de email; (ii) configuración del negocio con nombre del responsable, tipo de negocio, nombre comercial y slug único. La persona que actúe en representación del Negocio declara tener facultades para obligarlo.</p>

              <h3>4.2 Veracidad de la información</h3>
              <p>El Negocio garantiza que toda la información proporcionada es verdadera, exacta y actualizada. El Negocio será el único responsable por los perjuicios causados por información falsa o inexacta.</p>

              <h3>4.3 Confidencialidad de credenciales</h3>
              <p>El Negocio es responsable de mantener la confidencialidad de sus credenciales. Toda operación realizada desde su Cuenta se considerará realizada por el propio Negocio. Ante sospechas de acceso no autorizado, debe notificar a Solo de inmediato.</p>

              <h3>4.4 Facultades de Solo</h3>
              <p>Solo puede suspender o cancelar una Cuenta ante: información falsa, uso fraudulento, violación de estos Términos, falta de pago reiterada o actividades que perjudiquen a la Plataforma u otros usuarios.</p>
            </section>

            <section id="planes">
              <h2>5. Planes y forma de pago</h2>
              <p>Solo ofrece los siguientes planes de suscripción mensual:</p>

              <div className="info-box">
                <p><strong>Plan Solo — $20.000/mes</strong></p>
                <p>Para negocios de hasta 2 profesionales. Incluye agenda online ilimitada, landing personalizada, pagos con MercadoPago, recordatorios automáticos y soporte por WhatsApp.</p>
              </div>

              <div className="info-box">
                <p><strong>Plan Pro — $28.000/mes</strong></p>
                <p>Para negocios con equipo ilimitado. Incluye todo lo del plan Solo, más sistema de comisiones, control de gastos, analytics avanzados, exportación a Excel/PDF y soporte prioritario.</p>
              </div>

              <p>Todos los planes incluyen <strong>14 días de prueba gratuita</strong> sin tarjeta de crédito. Solo puede modificar precios con aviso previo de <strong>30 días por email</strong>; ante ese caso, el Negocio puede cancelar sin cargo.</p>
            </section>

            <section id="tarifas">
              <h2>6. Tarifas</h2>
              <p>El cobro se realiza mensualmente de forma automática mediante el método de pago registrado. El Negocio debe mantener un método de pago válido y vigente. Ante fallo en el cobro, Solo podrá suspender temporalmente el acceso hasta regularizar la situación.</p>
              <p>Los impuestos derivados del uso de la Plataforma y de la actividad del Negocio son responsabilidad exclusiva del Negocio. El cambio de plan puede realizarse en cualquier momento; la diferencia de valor se prorrateará o acreditará según corresponda.</p>
            </section>

            <section id="agenda">
              <h2>7. Funcionalidad de agenda y turnos</h2>
              <p>El Negocio puede configurar su disponibilidad horaria y la de sus Profesionales. Los Clientes Finales reservan desde la URL pública del Negocio seleccionando servicio, Profesional y horario.</p>
              <p>Una vez confirmado un turno, el Negocio se compromete a respetar el horario. Si se configura la obligatoriedad de seña, el turno se confirma únicamente cuando el pago es procesado exitosamente vía MercadoPago.</p>
              <p>Solo no es responsable por los servicios prestados por el Negocio a sus Clientes Finales; su rol se limita a proveer el software de gestión.</p>
            </section>

            <section id="pagos">
              <h2>8. Procesamiento de pagos</h2>
              <p>Los cobros se procesan a través de <strong>MercadoPago</strong>. Solo actúa como intermediario tecnológico y no es responsable por fallas, demoras o disputas atribuibles a MercadoPago o emisores de tarjetas.</p>
              <p>El Negocio debe configurar correctamente su cuenta de MercadoPago y cumplir sus términos. Las disputas o contracargos deben resolverse entre el Negocio y MercadoPago. Solo no retiene fondos ni actúa como entidad financiera; los montos cobrados se acreditan directamente en la cuenta del Negocio.</p>
            </section>

            <section id="responsabilidades">
              <h2>9. Responsabilidades del Negocio</h2>
              <p>El Negocio se compromete a:</p>
              <ul>
                <li>Brindar los servicios comprometidos a los Clientes Finales con Reserva confirmada.</li>
                <li>Mantener actualizada la información de servicios, precios y disponibilidad en la Plataforma.</li>
                <li>Gestionar adecuadamente los datos personales de sus Clientes Finales conforme a la normativa vigente.</li>
                <li>No utilizar la Plataforma para actividades ilícitas, fraudulentas o contrarias a la moral.</li>
                <li>No intentar acceder a cuentas de otros Negocios ni a información ajena.</li>
                <li>No reproducir, distribuir ni modificar el software de la Plataforma.</li>
                <li>Notificar a Solo ante cualquier uso no autorizado de su Cuenta.</li>
                <li>Cumplir con todas las obligaciones fiscales, laborales y comerciales derivadas de su actividad.</li>
              </ul>
            </section>

            <section id="limitaciones">
              <h2>10. Limitaciones de responsabilidad</h2>
              <p>Solo proporciona la Plataforma "tal como está" y no garantiza disponibilidad ininterrumpida. No será responsable por interrupciones causadas por mantenimiento, fallas de terceros proveedores, eventos de fuerza mayor u otras causas fuera de su control razonable.</p>
              <p>Solo no será responsable por pérdidas de ingresos, daños indirectos, lucro cesante o pérdida de datos derivados del uso o imposibilidad de uso de la Plataforma.</p>
              <p>La responsabilidad máxima de Solo frente al Negocio estará limitada al monto abonado durante los últimos <strong>tres (3) meses</strong> de suscripción activa.</p>
            </section>

            <section id="propiedad">
              <h2>11. Propiedad intelectual</h2>
              <p>Todos los derechos de propiedad intelectual sobre la Plataforma —software, diseño, marca, logotipos, textos y funcionalidades— pertenecen exclusivamente a Solo.</p>
              <p>El Negocio recibe una licencia de uso limitada, no exclusiva, intransferible y revocable para utilizar la Plataforma durante la vigencia de su suscripción activa.</p>
              <p>Queda prohibida la reproducción, distribución, modificación o ingeniería inversa de la Plataforma sin el consentimiento expreso de Solo. El Negocio conserva la propiedad sobre los datos que ingresa (clientes, servicios, precios, etc.).</p>
            </section>

            <section id="terminacion">
              <h2>12. Vigencia y terminación</h2>
              <p>Estos Términos entran en vigencia al completar el registro y se mantienen mientras la Cuenta esté activa.</p>
              <p>El Negocio puede cancelar su suscripción en cualquier momento sin penalidades. La cancelación toma efecto al finalizar el período de facturación en curso. Tras la baja, Solo podrá eliminar los datos del Negocio conforme a su Política de Privacidad.</p>
              <p>Solo puede dar de baja una Cuenta ante: violación de estos Términos, uso fraudulento, falta de pago reiterada o actividades ilícitas. En casos graves la baja puede ser inmediata y sin previo aviso.</p>
            </section>

            <section id="varios">
              <h2>13. Varios</h2>
              <p><strong>Modificaciones.</strong> Solo podrá modificar estos Términos notificando al Negocio por email con al menos 30 días de anticipación. El uso continuado implica aceptación de los nuevos Términos.</p>
              <p><strong>Jurisdicción.</strong> Estos Términos se rigen por las leyes de la República Argentina. Cualquier controversia será sometida a los tribunales ordinarios con sede en la Ciudad Autónoma de Buenos Aires.</p>
              <p><strong>Divisibilidad.</strong> Si alguna cláusula fuera inválida, el resto continuará vigente.</p>
              <p><strong>Contacto.</strong> Consultas sobre estos Términos: canal de soporte en la Plataforma o vía WhatsApp.</p>
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
              <Link href="/politica-de-privacidad" className="hover:text-white/60 transition-colors">Política de Privacidad</Link>
              <Link href="/" className="hover:text-white/60 transition-colors">Volver al inicio</Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}