export type HuisjeSlug = "retteketet" | "vis-a-vis" | "maison-d-o" | "ribbedepie";

export interface HuisjeFacts {
  slug: HuisjeSlug;
  name: string;
  city: string;
  addressStreet: string;
  addressLocality: string;
  beds: string;
  bicycle: boolean;
  garage: boolean;
  streetParking: boolean;
  neighborhoodParking: boolean;
  wifi: boolean;
  themeClass: "retteketet" | "vis-a-vis" | "maison-d-o" | "ribbedepie";
}

export const huisjeSlugs: HuisjeSlug[] = [
  "retteketet",
  "vis-a-vis",
  "maison-d-o",
  "ribbedepie",
];

export const huisjes: HuisjeFacts[] = [
  {
    slug: "retteketet",
    name: "RettekeTet",
    city: "Nieuwpoort",
    addressStreet: "Ankerstraat 15",
    addressLocality: "Nieuwpoort Stad",
    beds: "5 (2 + 2 + 1)",
    bicycle: false,
    garage: false,
    streetParking: true,
    neighborhoodParking: true,
    wifi: true,
    themeClass: "retteketet",
  },
  {
    slug: "vis-a-vis",
    name: "Vis à Vis",
    city: "Nieuwpoort",
    addressStreet: "Hoogstraat 10",
    addressLocality: "Nieuwpoort Stad",
    beds: "5 (2 + 3)",
    bicycle: true,
    garage: false,
    streetParking: true,
    neighborhoodParking: true,
    wifi: true,
    themeClass: "vis-a-vis",
  },
  {
    slug: "maison-d-o",
    name: "Maison d'O",
    city: "Nieuwpoort",
    addressStreet: "Schipstraat 43",
    addressLocality: "Nieuwpoort Stad",
    beds: "6 (2 + 2 + 1 + 1)",
    bicycle: false,
    garage: false,
    streetParking: true,
    neighborhoodParking: true,
    wifi: true,
    themeClass: "maison-d-o",
  },
  {
    slug: "ribbedepie",
    name: "RibbedePie",
    city: "Hasselt",
    addressStreet: "Nieuwe Eeuwfeeststraat 22",
    addressLocality: "Hasselt",
    beds: "4 (2 + 2)",
    bicycle: false,
    garage: false,
    streetParking: true,
    neighborhoodParking: true,
    wifi: true,
    themeClass: "ribbedepie",
  },
];

export interface ComingSoonHuisje {
  slug: string;
  name: string;
  city?: string;
  frontImage: string;
}

export const comingSoonHuisjes: ComingSoonHuisje[] = [
  {
    slug: "kabinet-walschap",
    name: "Kabinet Walschap",
    frontImage: "/huisjes/kabinet-walschap/img/front.jpg",
  },
  {
    slug: "tete-a-tete",
    name: "Tête-à-tête",
    frontImage: "/huisjes/tete-a-tete/img/front.jpeg",
  },
];

export function getHuisje(slug: string): HuisjeFacts | undefined {
  return huisjes.find((huisje) => huisje.slug === slug);
}

export function getHuisjeBannerImage(slug: string): string {
  return `/huisjes/${slug}/img/banner.jpg`;
}
