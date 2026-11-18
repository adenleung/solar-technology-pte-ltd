# Release verification

The release was exercised in Chromium on 18 November 2026. A synthetic enquiry submitted through the planner returned a receipt. The local database contained the selected module, 40-module count, 18 kWp estimate and received status. The public receipt excludes the private drawing key.

| Viewport | Horizontal overflow | Seven architecture stages and reversal | Navigation, product filters, search, planner and enquiry handoff | axe WCAG A/AA findings |
| --- | ---: | --- | --- | ---: |
| 1920 × 1080 | 0 px | Passed | Passed | 0 |
| 1440 × 900 | 0 px | Passed | Passed | 0 |
| 1366 × 768 | 0 px | Passed | Passed | 0 |
| 1024 × 768 | 0 px | Passed | Passed | 0 |
| 768 × 1024 | 0 px | Passed | Passed | 0 |
| 390 × 844 | 0 px | Passed | Passed | 0 |

At 390 px and 1440 px, axe also audited the open quotation dialog. The browser tests compared the actual drawing markup at an identical position after backward scrolling. The reduced-motion fixture exercised the compiled preference styles and the component's media-query branch. The scene unpinned, the chapter rail disappeared and the transcript exposed all seven stages. The keyboard search dialog and Escape focus restoration were exercised separately.

## Automated tests

TypeScript and the production build passed. Fifteen Node tests cover the module catalogue, source images, rectangular packing, sizing bounds, yield estimates and lack of invented storage gains. The enquiry tests cover input validation, body limits, file validation, a failed and retried upload, same-key concurrency, rate limiting and protected drawing retrieval. The sizing tests exercise both orientations and all six verified module series.

## Performance

The homepage is pre-rendered. The opening photograph has responsive 800, 960, 1280 and 1881 px WebP assets. The font and photograph are preloaded, lower-page images load lazily and the film requires neither a video decoder nor WebGL.

Browser Web Vitals 4.2.4 sampled the compiled homepage with warmed local assets, without network or CPU throttling. On desktop at 1363 × 936, first and largest contentful paint measured 196–260 ms, with initial CLS of zero. A 390 × 844 frame recorded 144 ms for first and largest contentful paint, also with initial CLS of zero. Navigation through the local Worker instead of the warm static fixture reached 3.34 s LCP in the earlier mobile run. The instrumented warm-page samples should not be used as a public-hosting forecast.

Interaction latency exceeded the 200 ms target in several instrumented runs, including 240 ms on the phone layout and 280 ms for a desktop menu. A desktop search sample across browser-tab changes recorded an 8.95 s outlier. Changes after those measurements reduced menu-image sizes, the initial number of search results and overlay blur. Field INP, sustained frame rate and public-domain performance have not been established. A separate Lighthouse process could not start Chromium in this environment. No Lighthouse score is claimed. Safari, Firefox and physical phones were not independently tested.

## Reproduction

Run the commands in the README. To instrument the compiled homepage, stage the local QA assets, build and run `node scripts/stage-compiled-qa.mjs`. Serve the compiled build locally. The `/__qa/measured.html` and `/__qa/phone.html` fixtures log Web Vitals with the prefix `SOLAR-LAB`. The reduced-motion fixture is `/__qa/reduced.html`. Clean local QA and rebuild before deploying.

