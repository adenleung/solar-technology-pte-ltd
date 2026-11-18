# Architectural sequence

The pavilion is original concept imagery generated for this experience. It illustrates a building and its mounting arrangement. The archive photography in the projects gallery is the source for completed installations.

## Media and registration

The original 1881 × 836 frame is supplied as an optimized WebP in `public/assets/arch/scene-1881.webp`. The 1280, 960 and 800-pixel variants have the same optical centre, crop and colour treatment. Responsive copies range from about 37 KB to 195 KB. The registered drawing uses the original pixel coordinate system. Its roof, gable, window mullions and floor slab were traced from this image. One projective mapping generates the module array and its mounting rails. The roof lifts along the vertical in the same coordinate system. All states use the same photograph and camera.

`Scene.tsx` takes a normalized numerical scroll position in `progress`. Render the component in a positioned full-bleed container, with titles, navigation, chapter text and controls in the layer above it. The first photograph is ordinary server-rendered responsive HTML. No additional canvas context, GLB or video decoder is required. The CSS reframes the registered drawing and image together on tall screens. Passing zero holds the initial photograph for readers who prefer reduced motion.

## Technology detail

The diagram isolates the front glass, cell array and rear glass of the Solar N Plus SP-N16B/96HG TOPCon bifacial module. The manufacturer's mechanical specification lists 2.0 mm antireflection-coated, heat-strengthened front glass, 96 cells in a 6 × 16 arrangement, and 2.0 mm heat-strengthened rear glass. The drawing separates those three documented components for clarity. Its separation distances are illustrative. The electrical trace shows the principle of connecting a rooftop array through an inverter to a building load. It is unsuitable for electrical installation design.

Source: [SP-N16B/96HG manufacturer datasheet, page 3](https://solartechnologysg.com/datasheets/SP-N16B-96HG435-450W.pdf).

## Replacing the art

For a new commission, obtain one original wide frame with the full roof, eaves and facade visible. Keep overhead space for the heading and foreground space for the chapter navigation. Match the three responsive exports. Update the viewBox dimensions, roof and array corners, facade geometry and selected panel close-up against that frame. If the building uses another module, update the example, cell layout and labels after checking the matching datasheet. A site-specific CAD sequence can replace the drawing component while preserving the same normalized progress contract.

The photographic source was generated from the supplied reference using built-in image generation. Direction for the image was a clean, fully rendered three-quarter panorama of a tropical single-storey glazed pavilion at blue hour, with a legible silicon array, still reflecting pool, restrained golden interior light, a dark blue sky reserved for the HTML title and a complete roof in frame. All UI, roof sketches and animated elements are separate.

## Rendering checks

Two hundred and one normalized scroll positions between 0 and 1 were rendered with React server rendering. Eight representative SVG frames were rasterized over the photograph and visually inspected, including the initial and final building, sketch, lifted roof, rails, seated panels, module detail and energy diagram. A single scene state determines the result in either scroll direction.
