"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import {
  LayoutDashboard,
  Calendar,
  Users,
  Briefcase,
  Package,
  GraduationCap,
  Settings,
  LogOut,
  ExternalLink,
  ChevronDown,
  DollarSign,
  ChevronUp,
  Menu,
  X,
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

const NAVIGATION: NavItem[] = [
  { name: "Inicio", href: "/dashboard", icon: LayoutDashboard },
  { name: "Agenda", href: "/dashboard/agenda", icon: Calendar },
  { name: "Clientes", href: "/dashboard/clientes", icon: Users },
  { name: "Servicios", href: "/dashboard/servicios", icon: Briefcase },
  {
    name: "Profesionales",
    href: "/dashboard/profesionales",
    icon: Users,
    children: [
      { name: "Agregar Profesionales", href: "/dashboard/profesionales" },
      { name: "Configurar Comisiones", href: "/dashboard/profesionales/comisiones" },
      { name: "Subir Foto del Profesional", href: "/dashboard/profesionales/fotos" },
    ],
  },
  {
    name: "Finanzas",
    href: "/dashboard/finanzas",
    icon: DollarSign,
    children: [
      { name: "Resumen", href: "/dashboard/finanzas" },
      { name: "Comisiones", href: "/dashboard/finanzas/comisiones" },
      { name: "Gastos", href: "/dashboard/finanzas/gastos" },
    ],
  },
  {
    name: "Inventario",
    href: "/dashboard/inventario",
    icon: Package,
    children: [
      { name: "Dashboard", href: "/dashboard/inventario" },
      { name: "Productos", href: "/dashboard/inventario/productos" },
      { name: "Proveedores", href: "/dashboard/inventario/proveedores" },
      { name: "Movimientos", href: "/dashboard/inventario/movimientos" },
      { name: "Órdenes", href: "/dashboard/inventario/ordenes" },
    ],
  },
  { name: "Cursos", href: "/dashboard/cursos", icon: GraduationCap },
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
  user,
  pathname,
  openGroups,
  toggleGroup,
  handleLogout,
  onNavigate,
  variant = "desktop",
  showBrandHeader = true,
}: {
  negocio: any;
  user: any;
  pathname: string;
  openGroups: Record<string, boolean>;
  toggleGroup: (href: string) => void;
  handleLogout: () => Promise<void>;
  onNavigate?: () => void;
  variant?: "desktop" | "mobile";
  showBrandHeader?: boolean;
}) {
  const initials =
    (negocio?.nombre || "N")
      .split(" ")
      .map((n: string) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "N";

  // ✅ FIX: en mobile el aside debe ser w-full (si no, te queda columna blanca)
  const asideWidth = variant === "mobile" ? "w-full" : "w-64";
  const asideHeight = variant === "mobile" ? "h-full" : "h-screen";

  return (
    <aside className={`${asideHeight} ${asideWidth} bg-white border-r border-gray-200 flex flex-col`}>
      {/* Header con Logo (solo si querés mostrarlo) */}
      {showBrandHeader && (
        <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
          <div className="flex items-center gap-2.5">
            <div className="relative w-8 h-8">
              <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" priority />
            </div>
            <span
              className="font-bold text-gray-900 text-lg tracking-tight"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              GetSolo
            </span>
          </div>
        </div>
      )}

      {/* Dropdown negocio */}
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
          {NAVIGATION.map((item) => {
            const Icon = item.icon;

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
                      <ChevronDown
                        className={`w-4 h-4 ${active ? "text-white/90" : "text-gray-400"}`}
                      />
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

      {/* Configuración */}
      <div className="px-3 pb-3 border-t border-gray-200 pt-3">
        <Link
          href="/dashboard/configuracion"
          onClick={onNavigate}
          className={`
            group flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
            transition-all duration-150
            ${
              isItemActive(pathname, "/dashboard/configuracion")
                ? "bg-primary text-white shadow-sm"
                : "text-gray-700 hover:bg-gray-100"
            }
          `}
        >
          <Settings
            className={`w-5 h-5 ${
              isItemActive(pathname, "/dashboard/configuracion")
                ? "text-white"
                : "text-gray-500 group-hover:text-gray-700"
            }`}
          />
          <span>Configuración</span>
        </Link>
      </div>

      {/* User + Logout */}
      <div className="p-4 border-t border-gray-200">
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
                <p className="text-sm font-medium text-gray-900 truncate">{user?.email}</p>
              </div>

              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="start" className="w-56">
            <DropdownMenuLabel>Mi Cuenta</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
              <LogOut className="w-4 h-4 mr-2" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}

export function DashboardNav({ negocio, user }: { negocio: any; user: any }) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  const groups = useMemo(() => NAVIGATION.filter((i) => "children" in i), []);
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

    // cerrar drawer al navegar
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
            aria-label="Abrir menú"
          >
            <Menu className="w-5 h-5 text-gray-700" />
          </button>

          <div className="flex items-center gap-2.5">
            <div className="relative w-7 h-7">
              <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" priority />
            </div>
            <span
              className="font-bold text-gray-900 text-base tracking-tight"
              style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
            >
              GetSolo
            </span>
          </div>

          <div className="w-10" />
        </div>
      </div>

      {/* SIDEBAR DESKTOP */}
      <div className="hidden md:block">
        <SidebarContent
          negocio={negocio}
          user={user}
          pathname={pathname}
          openGroups={openGroups}
          toggleGroup={toggleGroup}
          handleLogout={handleLogout}
          variant="desktop"
          showBrandHeader
        />
      </div>

      {/* DRAWER MOBILE */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          {/* overlay */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />

          {/* panel */}
          <div
            className="
              absolute left-0 top-0 h-full
              w-[88vw] max-w-[360px]
              bg-white shadow-2xl border-r border-gray-200
              flex flex-col
            "
            style={{ paddingTop: "env(safe-area-inset-top)" }}
          >
            {/* drawer header (único) */}
            <div className="h-14 px-4 flex items-center justify-between border-b border-gray-200">
              <div className="flex items-center gap-2.5">
                <div className="relative w-7 h-7">
                  <Image src="/logo/solo.png" alt="GetSolo" fill className="object-contain" priority />
                </div>
                <span
                  className="font-bold text-gray-900 text-base tracking-tight"
                  style={{ fontFamily: "'Cabinet Grotesk', sans-serif" }}
                >
                  GetSolo
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

            {/* contenido */}
            <div className="flex-1 min-h-0">
              <SidebarContent
                negocio={negocio}
                user={user}
                pathname={pathname}
                openGroups={openGroups}
                toggleGroup={toggleGroup}
                handleLogout={handleLogout}
                onNavigate={() => setMobileOpen(false)}
                variant="mobile"
                showBrandHeader={false} // ✅ no repetir header dentro
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}