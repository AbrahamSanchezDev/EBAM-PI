import {
  UserGroupIcon,
  HomeIcon,
  DocumentDuplicateIcon,
  GlobeAmericasIcon,
  WrenchScrewdriverIcon,
  IdentificationIcon,
  QrCodeIcon,
} from "@heroicons/react/24/outline";

// Centralized feature keys and link definitions.
export const FEATURES = {
  CALENDARIO: "calendario",
  CONTROL_CALENDARIO: "control_calendario",
  PERFIL: "perfil",
  PERFILES: "perfiles",
  MAPAS: "mapas",
  SCANS: "scans",
  CONSULTAS: "consultas",
};

export const ALL_LINKS = [
  { name: "Calendario", href: "/dashboard/calendario", icon: HomeIcon, feature: FEATURES.CALENDARIO },
  { name: "Control de calendario", href: "/dashboard/control-calendario", icon: DocumentDuplicateIcon, feature: FEATURES.CONTROL_CALENDARIO },
  { name: "Perfil", href: "/dashboard/perfil", icon: IdentificationIcon, feature: FEATURES.PERFIL },
  { name: "Perfiles", href: "/dashboard/perfiles", icon: IdentificationIcon, feature: FEATURES.PERFILES },
  { name: "Mapas", href: "/dashboard/mapas", icon: GlobeAmericasIcon, feature: FEATURES.MAPAS },
  { name: "Registros de Scans", href: "/dashboard/scans", icon: QrCodeIcon, feature: FEATURES.SCANS },
  { name: "Configuracion", href: "/dashboard/consultas", icon: WrenchScrewdriverIcon, feature: FEATURES.CONSULTAS },
];

export function defaultFeaturesForRole(role: string | undefined) {
  if (role === "user") {
    // Small set for non-admin users
    return [FEATURES.CALENDARIO, FEATURES.PERFIL, FEATURES.MAPAS, FEATURES.CONSULTAS];
  }
  // Admin / other roles -> allow all
  return ALL_LINKS.map((l) => l.feature);
}
