"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Settings,
  CreditCard,
  Store,
  Clock,
  Bell,
  Shield,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

type NavChild = { name: string; href: string };

type NavItem =
  | { name: string; href: string; icon: any; children?: never }
  | { name: string; href: string; icon: any; children: NavChild[] };

const SETTINGS_NAV: NavItem[] = [
  { name: "Regresar al inicio", href: "/dashboard", icon: ArrowLeft },
  {
    name: "Negocio",
    href: "/dashboard/configuracion/negocio",
    icon: Store,
    children: [
      { name: "Perfil del negocio", href: "/dashboard/configuracion/negocio" },
      // si querés después:
      // { name: "Branding / Logo", href: "/dashboard/configuracion/negocio/branding" },
      // { name: "Landing", href: "/dashboard/configuracion/negocio/landing" },
    ],
  },
  { name: "Horario del local", href: "/dashboard/configuracion/horarios", icon: Clock },
  { name: "Configurar MercadoPago", href: "/dashboard/configuracion/mercadopago", icon: CreditCard },
  { name: "Notificaciones", href: "/dashboard/configuracion/notificaciones", icon: Bell },
  { name: "Políticas", href: "/dashboard/configuracion/politicas", icon: Shield },
];

function isGroupRoute(pathname: string, groupHref: string) {
  return pathname === groupHref || pathname.startsWith(groupHref + "/");
}

function isItemActive(pathname: string, href: string) {
  // para /dashboard
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(href + "/");
}

export function SettingsSidebar({
  negocio,
}: {
  negocio: { nombre: string; slug: string };
}) {
  const pathname = usePathname();

  const initials =
    (negocio?.nombre || "N")
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "N";

  const groups = useMemo(() => SETTINGS_NAV.filter((i) => "children" in i), []);
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({});

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
  }, [pathname, groups]);

  function toggleGroup(href: string) {
    setOpenGroups((prev) => ({ ...prev, [href]: !prev[href] }));
  }

  return (
    <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
      {/* Header */}
      <div className="h-16 px-6 flex items-center justify-between border-b border-gray-200">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-white font-bold text-sm">S</span>
          </div>
          <span className="font-semibold text-gray-900">Solo</span>
        </div>
      </div>

      {/* Negocio (simple, sin dropdown) */}
      <div className="px-4 py-4 border-b border-gray-200">
        <div className="w-full flex items-center gap-3 px-3 py-2 rounded-lg bg-gray-50 border border-gray-200">
          <Avatar className="w-9 h-9">
            <AvatarFallback className="bg-primary-100 text-primary-700 text-sm font-medium">
              {initials}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 text-left min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {negocio?.nombre}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {negocio?.slug}.getsolo.site
            </p>
          </div>
        </div>

        <p className="mt-3 text-xs text-gray-500">
          Ajustá integraciones, branding y reglas del negocio.
        </p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {SETTINGS_NAV.map((item) => {
            const Icon = item.icon;

            // GROUP (acordeón)
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
                        const childActive = isItemActive(pathname, c.href);
                        return (
                          <Link
                            key={c.href}
                            href={c.href}
                            className={`
                              block px-3 py-2 rounded-lg text-sm transition-colors
                              ${childActive ? "bg-primary/10 text-primary font-medium" : "text-gray-600 hover:bg-gray-50"}
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

      {/* Footer mini */}
      <div className="p-4 border-t border-gray-200">
        <div className="text-xs text-gray-500">
          <p className="font-medium text-gray-700">Configuración</p>
          <p>Guardá cambios antes de salir.</p>
        </div>
      </div>
    </aside>
  );
}
