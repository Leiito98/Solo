"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  Settings,
  CreditCard,
  Store,
  Bell,
  Shield,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  User,
  Zap,
  Menu,
  X,
  ExternalLink,
  LogOut,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type NavChild = { name: string; href: string };

type NavItem =
  | { name: string; href: string; icon: any; children?: never }
  | { name: string; href: string; icon: any; children: NavChild[] };

const SETTINGS_NAV: NavItem[] = [
  { name: "Regresar al dashboard", href: "/dashboard", icon: ArrowLeft },
  { name: "Home", href: "/dashboard/configuracion", icon: Settings },
  {
    name: "Mi Negocio",
    href: "/dashboard/configuracion/negocio",
    icon: Store,
    children: [
      { name: "Información general", href: "/dashboard/configuracion/negocio" },
      { name: "Branding y logo", href: "/dashboard/configuracion/negocio/branding" },
    ],
  },
  {
    name: "Cuenta y Seguridad",
    href: "/dashboard/configuracion/cuenta",
    icon: User,
    children: [
      { name: "Mi perfil", href: "/dashboard/configuracion/cuenta" },
      { name: "Cambiar contraseña", href: "/dashboard/configuracion/cuenta/password" },
      { name: "Autenticación", href: "/dashboard/configuracion/cuenta/seguridad" },
    ],
  },
  {
    name: "Integraciones",
    href: "/dashboard/configuracion/integraciones",
    icon: Zap,
    children: [
      { name: "Inicio", href: "/dashboard/configuracion/integraciones" },
      { name: "MercadoPago", href: "/dashboard/configuracion/integraciones/mercadopago" },
      { name: "Redes Sociales", href: "/dashboard/configuracion/integraciones/redes-sociales" },
      { name: "WhatsApp", href: "/dashboard/configuracion/integraciones/whatsapp" },
    ],
  },
  {
    name: "Notificaciones",
    href: "/dashboard/configuracion/notificaciones",
    icon: Bell,
    children: [
      { name: "Email", href: "/dashboard/configuracion/notificaciones/email" },
      { name: "Recordatorios", href: "/dashboard/configuracion/notificaciones/recordatorios" },
      { name: "Alertas", href: "/dashboard/configuracion/notificaciones/alertas" },
    ],
  },
  {
    name: "Políticas y Legal",
    href: "/dashboard/configuracion/politicas",
    icon: Shield,
    children: [
      { name: "Política de cancelación", href: "/dashboard/configuracion/politicas" },
      { name: "Términos del servicio", href: "/dashboard/configuracion/politicas/terminos" },
      { name: "Privacidad de datos", href: "/dashboard/configuracion/politicas/privacidad" },
    ],
  },
  {
    name: "Plan y Facturación",
    href: "/dashboard/configuracion/plan",
    icon: CreditCard,
    children: [
      { name: "Plan actual", href: "/dashboard/configuracion/plan" },
      { name: "Métodos de pago", href: "/dashboard/configuracion/plan/pagos" },
      { name: "Historial de facturas", href: "/dashboard/configuracion/plan/facturas" },
    ],
  },
];

function isGroupRoute(pathname: string, groupHref: string) {
  return pathname === groupHref || pathname.startsWith(groupHref + "/");
}

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

function isChildActive(pathname: string, href: string) {
  return pathname === href;
}

function SidebarContent({
  negocio,
  userEmail,
  pathname,
  openGroups,
  toggleGroup,
  onNavigate,
  onLogout,
  variant = "desktop",
  showBrandHeader = true,
}: {
  negocio: { nombre: string; slug: string; logo_url: string | null };
  userEmail?: string | null;
  pathname: string;
  openGroups: Record<string, boolean>;
  toggleGroup: (href: string) => void;
  onNavigate?: () => void;
  onLogout: () => Promise<void>;
  variant?: "desktop" | "mobile";
  showBrandHeader?: boolean;
}) {
  const initials =
    (negocio?.nombre || "N")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "N";

  const asideWidth = variant === "mobile" ? "w-full" : "w-64";

  return (
    <aside className={`${asideWidth} h-full bg-white border-gray-200 flex flex-col min-h-0 overflow-hidden`}>
      {/* Header marca */}
      {showBrandHeader && (
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" priority />
            </div>
            <span
              className="font-bold text-gray-900 text-lg tracking-tight"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              Configuración
            </span>
          </div>
        </div>
      )}

      {/* Dropdown negocio + Ver mi página */}
      <div className="px-4 py-4 border-b border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Avatar className="w-9 h-9">
                {negocio.logo_url && <AvatarImage src={negocio.logo_url} className="object-cover" />}
                <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{negocio?.nombre}</p>
                <p className="text-xs text-gray-500 truncate">{negocio?.slug}.getsolo.site</p>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Mi Negocio</DropdownMenuLabel>
            <DropdownMenuSeparator />

            <DropdownMenuItem asChild>
              <a
                href={`https://${negocio?.slug}.getsolo.site`}
                target="_blank"
                className="flex items-center gap-2 cursor-pointer"
                rel="noreferrer"
              >
                <ExternalLink className="w-4 h-4" />
                Ver mi página
              </a>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;

            // GROUP
            if ("children" in item) {
              const active = isGroupRoute(pathname, item.href);
              const isOpen = !!openGroups[item.href];

              return (
                <div key={item.href} className="space-y-1">
                  <button
                    type="button"
                    onClick={() => toggleGroup(item.href)}
                    aria-expanded={isOpen}
                    className={`
                      group w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                      transition-all duration-150
                      ${active ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}
                    `}
                  >
                    <span className="flex items-center gap-3">
                      <Icon
                        className={`w-5 h-5 ${
                          active ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                        }`}
                      />
                      <span>{item.name}</span>
                    </span>

                    {isOpen ? (
                      <ChevronUp className={`w-4 h-4 ${active ? "text-white/90" : "text-gray-400"}`} />
                    ) : (
                      <ChevronDown className={`w-4 h-4 ${active ? "text-white/90" : "text-gray-400"}`} />
                    )}
                  </button>

                  {isOpen ? (
                    <div
                      className={`ml-2 pl-3 border-l ${
                        active ? "border-primary/30" : "border-gray-200"
                      } space-y-1`}
                    >
                      {item.children?.map((c) => {
                        const childActive = isChildActive(pathname, c.href);
                        return (
                          <Link
                            key={c.href}
                            href={c.href}
                            onClick={onNavigate}
                            className={`
                              block px-3 py-2 rounded-lg text-sm transition-colors
                              ${
                                childActive
                                  ? "bg-primary/10 text-primary font-medium"
                                  : "text-gray-600 hover:bg-gray-50"
                              }
                            `}
                          >
                            {c.name}
                          </Link>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            }

            // ITEM simple
            const active = isItemActive(pathname, item.href);
            return (
              <div key={item.href} className="space-y-1">
                <Link
                  href={item.href}
                  onClick={onNavigate}
                  className={`
                    group flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                    transition-all duration-150
                    ${active ? "bg-primary text-white shadow-sm" : "text-gray-700 hover:bg-gray-100"}
                  `}
                >
                  <span className="flex items-center gap-3">
                    <Icon
                      className={`w-5 h-5 ${
                        active ? "text-white" : "text-gray-500 group-hover:text-gray-700"
                      }`}
                    />
                    <span>{item.name}</span>
                  </span>
                </Link>
              </div>
            );
          })}
        </div>
      </nav>

      {/* Cuenta + Logout */}
      <div className="mt-auto p-4 border-t border-gray-200">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors">
              <Avatar className="w-9 h-9">
                {negocio.logo_url && <AvatarImage src={negocio.logo_url} className="object-cover" />}
                <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{userEmail || "Mi cuenta"}</p>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function SettingsSidebar({
  negocio,
  hideSoloHeader = false, // lo dejamos por compatibilidad, pero en mobile no lo usamos
  userEmail, // opcional: pasalo desde layout si querés
}: {
  negocio: { nombre: string; slug: string; logo_url: string | null };
  hideSoloHeader?: boolean;
  userEmail?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const groups = useMemo(() => SETTINGS_NAV.filter((i) => "children" in i), []);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});
  const [mobileOpen, setMobileOpen] = useState(false);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  useEffect(() => {
    setOpenGroups((prev) => {
      const next: Record<string, boolean> = { ...prev };
      for (const g of groups) {
        const shouldOpen = isGroupRoute(pathname, g.href);
        if (shouldOpen) next[g.href] = true;
        else if (next[g.href] === undefined) next[g.href] = false;
      }
      return next;
    });

    setMobileOpen(false);
  }, [pathname, groups]);

  function toggleGroup(href: string) {
    setOpenGroups((prev) => ({ ...prev, [href]: !prev[href] }));
  }

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setMobileOpen(false);
    }
    if (mobileOpen) window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  return (
    <>
      {/* TOPBAR MOBILE */}
      <div className="md:hidden sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="h-14 px-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100"
            aria-label="Abrir menú de configuración"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" priority />
            </div>
            <span
              className="font-bold text-gray-900 text-base tracking-tight"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              Configuración
            </span>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block h-full">
        <SidebarContent
          negocio={negocio}
          userEmail={userEmail}
          pathname={pathname}
          openGroups={openGroups}
          toggleGroup={toggleGroup}
          onLogout={handleLogout}
          variant="desktop"
          showBrandHeader={!hideSoloHeader}
        />
      </div>

      {/* DRAWER MOBILE */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          <div
            className="
              absolute left-0 top-0 h-full
              w-[88vw] max-w-[360px]
              bg-white shadow-2xl border-r border-gray-200
              flex flex-col
            "
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="relative w-7 h-7">
                  <Image src="/logo/solo.png" alt="Solo" fill className="object-contain" priority />
                </div>
                <span
                  className="font-bold text-gray-900 text-base tracking-tight"
                  style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
                >
                  Configuración
                </span>
              </div>

              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="inline-flex items-center justify-center rounded-lg p-2 hover:bg-gray-100"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5 text-gray-700" />
              </button>
            </div>

            <div className="flex-1 min-h-0">
              <SidebarContent
                negocio={negocio}
                userEmail={userEmail}
                pathname={pathname}
                openGroups={openGroups}
                toggleGroup={toggleGroup}
                onNavigate={() => setMobileOpen(false)}
                onLogout={handleLogout}
                variant="mobile"
                showBrandHeader={false}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}