# Interface design system

The site alternates a dark architectural film and engineering workspaces with light editorial sections for applications and completed projects. Photographs carry the visual narrative. Controls share a consistent shape, label and keyboard focus treatment across the site.

| Token | Value | Use |
| --- | --- | --- |
| Ink | `#0B1117` | Navigation, footer, dark section backgrounds |
| Graphite | `#101923` | Technical workspaces and overlays |
| Paper | `#EFEFEA` | Solutions and project portfolio |
| Warm white | `#F6F7F5` | Reading text on dark surfaces |
| Steel | `#A9B5BE` | Supporting technical labels |
| Warm amber | `#E8C28F` | Active chapter, focus and selected engineering details |
| Interface typography | Geist variable | Navigation, headlines, controls and paragraphs |
| Technical typography | IBM Plex Mono regular | Model references, units and engineering labels |

## Layout

The main reading width is capped near 1,430 px. Section boundaries share a single horizontal inset, from 22 px on small phones to a wide desktop gutter. Editorial sections use a two-column composition and collapse into a single reading order on phones. The planning workspace has three desktop columns and its own tablet and mobile arrangements.

## Motion and controls

The sticky frame uses natural scrolling. The controller maps scroll distance to normalized progress and calculates every layer from that value. Scrolling backward restores the same geometry. Chapter controls offer optional jumps. A skip link takes visitors directly to the showroom. Reduced-motion preferences produce an unpinned photograph and an expandable, seven-stage text description.

Primary actions use a light pill or the outlined navigation quotation button. Text links use an arrow and an underline or explicit link label. Family and drawing controls expose their selected state. Native dialogs manage focus containment, Escape and focus restoration. Desktop navigation disclosures close on outside click, blur or Escape.

## Components and assets

See `app/globals.css` for shared tokens, layout and component styles. The roof drawing and architectural sequence have their own scoped styles. Branded imagery is local. Keep the supplied wordmark intact, use model-specific units and place all text and controls in the HTML layer.

