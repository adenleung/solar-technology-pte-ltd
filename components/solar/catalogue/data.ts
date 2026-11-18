import {
  siliconDefinitions,
  type SiliconDefinition,
} from "../../../lib/solar/siliconModules.ts";

export type FamilyId = "glass" | "tile" | "silicon";
export type Spec = { label: string; value: string };

export interface Product {
  id: string;
  name: string;
  family: FamilyId;
  model: string;
  description: string;
  image: string;
  alt: string;
  powerLabel: string;
  /** Highest published STC rating for this entry. Capacity estimates must identify the selected rating. */
  powerW?: number;
  /** Outer dimensions. Tiles overlap on site and must not use a rectangular panel packing formula. */
  widthMm?: number;
  lengthMm?: number;
  specs: Spec[];
  datasheet: string;
  source: string;
}

export interface Family {
  id: FamilyId;
  name: string;
  description: string;
  image: string;
}

export interface Project {
  id: string;
  name: string;
  location: string;
  capacity: string;
  application: string;
  image: string;
  alt: string;
  source: string;
}

export interface Solution {
  id: string;
  name: string;
  description: string;
  image: string;
}

const origin = "https://solartechnologysg.com";
const image = (file: string) => `/assets/catalog/${file}.webp`;
const pdf = (file: string) => `${origin}/datasheets/${file}.pdf`;
const field = (label: string, value: string): Spec => ({ label, value });

export const sources = {
  home: `${origin}/`,
  products: `${origin}/products`,
  projects: `${origin}/projects`,
  applications: `${origin}/ourfactory`,
  contact: `${origin}/contact_us`,
};

export const contact = {
  company: "Solar Technology Pte. Ltd.",
  email: "bd@solartechnologysg.com",
  displayPhone: "+65 9036 0782",
  phone: "+6590360782",
  address: "2 Shunfu Road #14-02, Jadescape, Singapore 575742",
  whatsapp: "https://wa.me/6590360782",
  linkedin: "https://www.linkedin.com/company/solar-technology-pte-ltd/",
  official: `${origin}/`,
  logo: image("brand"),
};

export const families: Family[] = [
  {
    id: "glass",
    name: "Photovoltaic glass",
    description:
      "Cadmium telluride thin-film glass for architectural surfaces, including façades, glazing and canopies.",
    image: image("glass-marble"),
  },
  {
    id: "tile",
    name: "Power tiles",
    description:
      "Individual roof tiles with a CdTe photovoltaic glass face. Three catalogue sizes suit different roof patterns.",
    image: image("tile-20"),
  },
  {
    id: "silicon",
    name: "Silicon panels",
    description:
      "Framed, bifacial TOPCon modules with glass on both faces and six model ranges to compare.",
    image: image("sp-n16b-132hg"),
  },
];

const glassWarranty = "10-year product and 25-year linear output";
const glassStandards = "IEC 61215 / IEC 61730";
const tileStandards = "IEC/EN 61215-2 and 61730";

const glass: Product[] = [
  {
    id: "glass-marble",
    family: "glass",
    name: "Power Glass 2 Layer",
    model: "COM-M1 · Marble series",
    description:
      "A two-pane architectural glass module with a thin-film photovoltaic coating. The front finish can carry a custom colour or pattern.",
    image: image("glass-marble"),
    alt: "Front and rear views of the COM-M1 photovoltaic glass module",
    powerLabel: "250–290 W",
    powerW: 290,
    widthMm: 1200,
    lengthMm: 1600,
    specs: [
      field("Series", "COM-M1, CNBMCOE"),
      field("Rated output at STC", "250, 260, 270, 280 or 290 W"),
      field("Module efficiency at STC", "13.0–15.1% across the series"),
      field("Dimensions", "1600 × 1200 × 6.9 mm"),
      field("Weight", "30 kg"),
      field(
        "Construction",
        "3.2 mm low-iron front glass, CdTe, POE/EVA encapsulation and 3.2 mm rear glass",
      ),
      field("Warranty", glassWarranty),
      field("Standards listed", tileStandards),
    ],
    datasheet: pdf("CdTe"),
    source: sources.products,
  },
  {
    id: "glass-laminated",
    family: "glass",
    name: "Power Glass 3 Layer",
    model: "COM-CBS1-Blue",
    description:
      "Coloured laminated photovoltaic glass for building façades. The publisher gives different ratings for the blue finish in its catalogue and family brochure.",
    image: image("glass-laminated"),
    alt: "Blue architectural power glass with sample finish swatches",
    powerLabel: "Confirm variant",
    specs: [
      field("Catalogue model", "COM-CBS1-Blue"),
      field("Technology", "Three-pane laminated CdTe glass"),
      field("Blue variant in catalogue", "210 W, 10 mm"),
      field("Sky-blue variant in family brochure", "220 W, 11 mm"),
      field(
        "Specification for quotation",
        "Confirm the selected finish and datasheet revision with the supplier.",
      ),
    ],
    datasheet: pdf("cdteprod"),
    source: sources.products,
  },
  {
    id: "glass-hollow",
    family: "glass",
    name: "Power Glass Hollow",
    model: "COM-Z3-Tm",
    description:
      "Daylight can pass through this insulating glass unit. The specification pairs CdTe glazing with a low-emissivity pane and a 12 mm air cavity.",
    image: image("glass-hollow"),
    alt: "Hollow photovoltaic glazing unit with connection leads at the sides",
    powerLabel: "130–210 W",
    powerW: 210,
    widthMm: 1200,
    lengthMm: 1600,
    specs: [
      field("Series", "COM-Z3-Tm, CNBMCOE"),
      field(
        "Rated variants at STC",
        "T20 210 W, T30 180 W, T40 160 W, T50 130 W",
      ),
      field("Dimensions", "1600 × 1200 × 28 mm"),
      field("Weight", "75 kg"),
      field(
        "Construction",
        "CdTe laminated glass, 12 mm air cavity and low-E tempered glass",
      ),
      field("Warranty", glassWarranty),
      field("Standards listed", glassStandards),
    ],
    datasheet: pdf("cdte3"),
    source: sources.products,
  },
];

interface TileDefinition {
  watts: number;
  model: string;
  length: number;
  width: number;
  thickness: number;
  weight: number;
  glass: string;
  description: string;
  alt: string;
}

const tileDefinitions: TileDefinition[] = [
  {
    watts: 20,
    model: "COM-LX-20W",
    length: 480,
    width: 480,
    thickness: 20,
    weight: 4.6,
    glass: "400 × 400 mm",
    description:
      "A diamond-profile CdTe roof tile for overlapping rows. Its photovoltaic glass face measures 400 mm on each side.",
    alt: "Diamond-shaped CdTe photovoltaic roof tile",
  },
  {
    watts: 30,
    model: "COM-XJD-30W",
    length: 670,
    width: 480,
    thickness: 33,
    weight: 7.5,
    glass: "600 × 400 mm",
    description:
      "A rectangular interlocking tile with a 600 × 400 mm photovoltaic glass face.",
    alt: "Dark rectangular 30 W photovoltaic roof tile with interlocking edges",
  },
  {
    watts: 65,
    model: "COM-DJD-65W",
    length: 1270,
    width: 480,
    thickness: 33,
    weight: 17,
    glass: "1200 × 400 mm",
    description:
      "An elongated interlocking tile. Its 1.2 m photovoltaic glass face spans a wider section of a pitched roof.",
    alt: "Elongated 65 W photovoltaic roof tile in a dark finish",
  },
];

function tileProduct(tile: TileDefinition): Product {
  const id = `tile-${tile.watts}`;
  return {
    id,
    name: `Power Tile ${tile.watts}W`,
    family: "tile",
    model: tile.model,
    description: tile.description,
    image: image(id),
    alt: tile.alt,
    powerLabel: `${tile.watts} W`,
    powerW: tile.watts,
    lengthMm: tile.length,
    widthMm: tile.width,
    specs: [
      field("Model", tile.model),
      field("Rated output at STC", `${tile.watts} W`),
      field(
        "Tile dimensions",
        `${tile.length} × ${tile.width} × ${tile.thickness} mm`,
      ),
      field("Solar glass face", tile.glass),
      field("Tile weight", `Approx. ${tile.weight} kg`),
      field(
        "Construction",
        "CdTe photovoltaic glass and rear glass, each 3.2 mm",
      ),
      field("Output warranty", "25-year linear power output"),
      field("Design standards listed", tileStandards),
    ],
    datasheet: pdf("powertile"),
    source: sources.products,
  };
}

function siliconProduct(module: SiliconDefinition): Product {
  const series = module.model.split("/")[0];
  const powerLabel = `${module.low}–${module.high} W`;
  return {
    id: module.id,
    name: `${series} ${module.high}W`,
    family: "silicon",
    model: module.model,
    description: `A ${module.cells}-cell bifacial TOPCon module from Solar N Plus with glass on both faces and an anodised aluminium frame.`,
    image: image(module.id),
    alt: `Front and rear views of the ${module.model} bifacial silicon module`,
    powerLabel,
    powerW: module.high,
    widthMm: module.width,
    lengthMm: module.length,
    specs: [
      field("Manufacturer and model", `Solar N Plus · ${module.model}`),
      field("Rated output at STC", powerLabel),
      field(
        "Module efficiency at STC",
        `${module.lowEfficiency}–${module.highEfficiency}%`,
      ),
      field(
        "Dimensions",
        `${module.length} × ${module.width} × ${module.thickness} mm`,
      ),
      field("Weight", `${module.weight} kg`),
      field(
        "Construction",
        `${module.cells} silicon cells, 2.0 mm glass on each face, aluminium frame`,
      ),
      field("Product warranty", "15 years for materials and workmanship"),
      field("Output warranty", "30-year linear power output"),
    ],
    datasheet: pdf(module.file),
    source: sources.products,
  };
}

export const products: Product[] = [
  ...glass,
  ...tileDefinitions.map(tileProduct),
  ...siliconDefinitions.map(siliconProduct),
];

export const solutions: Solution[] = [
  {
    id: "residential",
    name: "Home energy",
    description:
      "Explore rooftop modules and roof-integrated tiles for a landed property.",
    image: image("solution-residential"),
  },
  {
    id: "commercial",
    name: "Business energy",
    description:
      "Plan photovoltaic roof and façade surfaces for an office, factory or commercial building.",
    image: image("solution-commercial"),
  },
  {
    id: "utility",
    name: "Large-scale energy",
    description:
      "Discuss ground-mounted installations and solar power agreements for large sites.",
    image: image("solution-utility"),
  },
];

export const applications: Solution[] = [
  {
    id: "roof",
    name: "Roof",
    description:
      "Use a roof surface for photovoltaic glazing, integrated tiles or mounted modules.",
    image: image("application-roof"),
  },
  {
    id: "fence",
    name: "Fence",
    description:
      "Explore how photovoltaic glass can be incorporated into a site boundary.",
    image: image("application-fence"),
  },
  {
    id: "curtain-wall",
    name: "Curtain wall",
    description: "Use power glass as part of a glazed exterior envelope.",
    image: image("application-curtain-wall"),
  },
  {
    id: "awning",
    name: "Awning",
    description:
      "Integrate photovoltaic glass into a canopy or external shade.",
    image: image("application-awning"),
  },
];

export const serviceStages = [
  "Design, verification and documentation",
  "Supply and installation",
  "Testing and commissioning",
  "Operation and maintenance",
  "Product warranty support",
];

function project(
  id: string,
  name: string,
  location: string,
  capacity: string,
  application: string,
  alt: string,
): Project {
  return {
    id,
    name,
    location,
    capacity,
    application,
    image: image(id),
    alt,
    source: sources.projects,
  };
}

/** The publisher supplies application, location and capacity, without public client names or dates. */
export const projects: Project[] = [
  project(
    "singapore-awning",
    "Photovoltaic awning",
    "Singapore",
    "11 kW",
    "Building-integrated awning",
    "Close view of glazed awning panels reflecting a tree in Singapore",
  ),
  project(
    "shanghai-curtain-wall",
    "Curtain wall in Shanghai",
    "Shanghai, China",
    "397.5 kW",
    "Building-integrated curtain wall",
    "Dark photovoltaic façades on a Shanghai building under a cloud-streaked sky",
  ),
  project(
    "bosaso-power-station",
    "Bosaso solar power station",
    "Bosaso, Somalia",
    "5 MW",
    "Ground-mounted power station",
    "Rows of ground-mounted photovoltaic arrays in an open landscape in Bosaso",
  ),
  project(
    "singapore-silicon",
    "Roof-mounted silicon array",
    "Singapore",
    "11 kW",
    "Building-applied silicon photovoltaics",
    "Silicon modules mounted above a red-tiled roof in Singapore",
  ),
  project(
    "sichuan-roof-curtain",
    "Integrated roof and façade",
    "Sichuan, China",
    "50.07 kW",
    "Building-integrated roof and curtain wall",
    "Light and dark façade surfaces beneath a pitched roof in Sichuan",
  ),
  project(
    "zhangbei-ground-tracking",
    "Ground-tracking array",
    "Zhangbei, China",
    "7.38 MW",
    "Ground-tracking photovoltaics",
    "Rows of tilted ground-tracking solar arrays under a blue sky",
  ),
  project(
    "chengdu-wall",
    "Wall-mounted photovoltaics",
    "Chengdu, China",
    "270 kW",
    "Building-applied wall photovoltaics",
    "Street view of a Chengdu building with dark vertical façade panels",
  ),
  project(
    "wuhan-wall",
    "Wall-mounted photovoltaics",
    "Wuhan, China",
    "47 kW",
    "Building-applied wall photovoltaics",
    "Two street-level views of panelled façades in Wuhan",
  ),
  project(
    "lijiang-integrated",
    "Architectural photovoltaics",
    "Lijiang, China",
    "20 kW",
    "Building-integrated photovoltaics",
    "Colourful cylindrical façades at the Lijiang installation",
  ),
  project(
    "bengbu-wall",
    "Power-generating façade",
    "Bengbu, China",
    "300 kW",
    "Building-integrated wall",
    "Long, dark photovoltaic façade beside a street in Bengbu",
  ),
  project(
    "hebei-curtain-wall-500",
    "Industrial curtain wall",
    "Hebei, China",
    "500 kW",
    "Building-integrated curtain wall",
    "A broad grey façade with red trim at the Hebei installation",
  ),
  project(
    "hebei-curtain-wall-92",
    "Illuminated curtain wall",
    "Hebei, China",
    "92 kW",
    "Building-integrated curtain wall",
    "A building lit with a turquoise and red pattern at night",
  ),
  project(
    "xian-curtain-wall",
    "Curved curtain wall",
    "Xi’an, China",
    "285 kW",
    "Building-integrated curtain wall",
    "A curved glass-fronted building beyond a lawn in Xi’an",
  ),
  project(
    "anhui-roof-curtain",
    "Roof and curtain wall",
    "Anhui, China",
    "10 MW",
    "Building-integrated roof and curtain wall",
    "Aerial view of an expansive industrial roof in Anhui",
  ),
  project(
    "taiyuan-rooftop",
    "Rooftop photovoltaics",
    "Taiyuan, China",
    "50 kW",
    "Building-integrated rooftop",
    "Panoramic photograph of the Taiyuan project in its urban setting",
  ),
  project(
    "shenzhen-rooftop",
    "Glazed solar rooftop",
    "Shenzhen, China",
    "57 kW",
    "Building-integrated rooftop",
    "Installed photovoltaic roof glass photographed along a building in Shenzhen",
  ),
  project(
    "chengdu-rooftop",
    "Integrated solar roof",
    "Chengdu, China",
    "1.72 MW",
    "Building-integrated rooftop",
    "Underside of a photovoltaic roof with exposed structural beams in Chengdu",
  ),
  project(
    "chengdu-curtain-wall",
    "Blue photovoltaic façade",
    "Chengdu, China",
    "26 kW",
    "Building-integrated curtain wall",
    "Blue glass façade beneath an overhanging roof in Chengdu",
  ),
];
