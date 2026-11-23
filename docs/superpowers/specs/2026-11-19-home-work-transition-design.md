# Home → Work transition — design

Date: 2026-11-19
Status: approved

## Goal

Make the move from Home to the work overview one continuous, visible transformation instead of a curtain cut. The logo formed on Home unravels into a vertical particle stream that runs down the carousel axis and branches to the active work card. The whole thing is driven by one scroll.

Out of scope: About, Contact and Entry keep the curtain transition; an app-wide persistent canvas (roadmap item 3) is not part of this.

## Decisions

- **Shared layout route** for `/` and `/work`: one canvas and one particle simulation stay mounted while the URL changes.
- **Scroll-scrubbed**: the scroll position drives Home, the morph and the carousel. Programmatic navigation (menu, Back, direct load) animates the scroll position instead of using a separate timed animation.
- **Vertical everywhere**: the carousel scrolls vertically on mobile too; the horizontal swipe goes away.
- **Stream shape**: a vertical trunk on the carousel axis, with a branch to the active (centred) card only. The branch retracts when the card leaves the centre and the next card's branch grows.
- **History**: the first crossing into the carousel pushes `/work`; later crossings in either direction use `replace`.

## Architecture

- `src/app/routes.jsx`: `/` and `/work` become child routes of one layout route.
- New `HomeWorkLayout`: owns the scroll container, the Lenis instance, the segment math, the URL sync, the loading screen, the shared canvas and an `<Outlet/>` for the page overlays.
- New combined scene: composes the existing Home objects (logo particles, background video wall, laser, title, subtitle) and the carousel (`WorkCard` rig, border projection). `HomeCanvas` and `WorkCanvas` are merged into it.
- `Home.jsx` and `Work.jsx` become DOM-only overlays that read segment progress from the layout.
- Removed: `useScrollNavigation` (Home's threshold jump) and Work's scroll-up-to-exit accumulator.

## Scroll timeline

One progress value from 0 to 1 over the whole layout, split into three segments whose lengths live in `src/config/animation.config.js`:

1. `home`: today's Home scroll (dot panel → formed logo, title rises, video wall pauses).
2. `morph`: logo → trunk.
3. `carousel`: today's Work scroll; card snapping only happens inside this segment.

Each part of the scene reads its own 0–1 value for its segment.

## Navigation

- Crossing into the carousel segment sets the URL to `/work` (push the first time, `replace` after); crossing back sets `/` with `replace`.
- `popstate` (Back/Forward) animates the scroll to the start of the matching segment.
- A direct load of `/work` starts at the beginning of the carousel segment.
- Menu Home ↔ Work: animated `scrollTo` to the target segment, so the morph plays.
- Menu from About, Contact or Entry to Home or Work: curtain, then the layout mounts at the matching position.
- The loading screen moves into the layout, so a direct `/work` load shows it too.

## Choreography

1. **Home segment**: unchanged. Home's DOM overlay (name, quote, side decals) fades out over the end of the segment.
2. **Morph segment**:
    - The simulation gets a second target next to grid → logo: the stream. Most particles collapse into a thin trunk on the carousel axis that flows downward; a share forms the branch.
    - The camera blends from Home's end pose (z 10, fov 100) to the carousel pose (z 8, fov 50) while the logo group moves and shrinks onto the axis, so the unravelling stays in view.
    - Home's 3D extras are out of frame by now and unmount when the segment starts.
3. **Carousel segment**:
    - The branch grows from the trunk to the centred card, driven by that card's centeredness.
    - A card resolves, with its existing entry animation, the first time its branch reaches it, and stays visible after.
    - The trunk always flows and speeds up while scrolling.
    - Work's DOM overlays (border frame around the centred card, touch hint) fade in.

Shared:

- One effect chain: ambient occlusion fades out during the morph; bloom values blend from Home's to Work's.
- The particles live in the logo group's local space and the trunk in carousel space; the simulation receives a transform matrix to map stream targets into particle space.

## Fallback

When the GPU cannot run the simulation (no float or half-float render targets, no vertex texture reads), the metallic logo shrinks onto the axis and fades out, and cards reveal by scroll without a stream. Same timeline, no particles.

## Build stages

Each stage is shippable on its own:

1. Shared layout, one canvas, one scroll; the logo fades onto the axis and the carousel appears (removes the curtain cut).
2. Trunk: the logo unravels into the flowing vertical stream.
3. Branches: the branch to the active card and the scroll-driven card reveal.

## Risks

- Merging two scenes can regress the border frame, card clicks and snapping; the staged order keeps each step checkable.
- Both scenes' assets share one GPU context: the carousel mounts as the morph starts, its textures preload during Home, and adaptive quality stays on.
- Snapping must stay inside the carousel segment or it pulls the user out of the morph.
- Back/Forward and a direct `/work` load must land at the right scroll position.

## Testing

- The scroll → segment mapping and the push/replace decision are pure functions with one `node:test` file; the `test` script widens from `workers/` to include it.
- Headless Chrome screenshots at fixed scroll points (top, logo formed, mid-morph, carousel start, card 2), plus direct `/work`, Back, menu Home ↔ Work, mobile width, and the forced no-simulation fallback.
- `npm run lint`, `npm run fmt:check` and `npm run build` pass after each stage.

## Amendment 2026-11-20: fibre stream

After stage 3 the dense dot trunk read as a solid pipe. The user's reference (fibre-optic light trails) replaces its look:

- The stream is a sparse bundle of glowing light trails: about 300 (low), 700 (medium) or 1,200 (high) strands, each a 24-point line with a bright head and a fading tail, drawn additively so overlaps glow.
- Trails are computed in the vertex shader by sampling the stream path slightly back in time; no history textures.
- The bundle sways organically: slow noise along its height and over time for the whole bundle, plus a small per-strand offset. A few loose sparks drift around it.
- Brand cyan only, brightness varying per strand.
- Fibres the whole way (user decision): each fibre follows one logo particle. As the logo dissolves, the dense particles fade out over the first quarter of the stream, and each remaining fibre starts as a glowing dot on the logo surface that stretches into its trail as it travels onto the swaying path. Once the morph completes, the fibres are purely analytic and the particle simulation stops; it resumes when scrolling back.
- The branch uses the same trails while scrolling and hides behind the centred card (no change to the branch geometry).

## Amendment 2026-11-21: organic branch, on-screen cards, cinematic exit

User revisions after reviewing the branch:

- **Branch (variant A):** strands peel off the flowing trunk above and below the centred card and curve outward with the sway onto its four corners, so the card looks held by the flow. The corners sit off the camera axis, so the branch stays visible when the card is centred (replaces "hides behind the centred card"). Only the fibres draw the branch; the particle simulation no longer has a branch (it is never active during the morph).
- **Cards:** a card's size follows its place on screen: it grows from 0 as it enters the frame to full size at the centre and shrinks again as it leaves, both ways, with no one-shot reveal. The first card grows in over the end of the morph.
- **Cinematic exit:** Home's end-of-scroll camera FOV is capped (100 → 75) to remove the warp. The video wall, title, subtitle and laser fade and recede over the first half of the morph instead of switching off in one frame; they stop rendering only once fully faded. The dense logo particles disappear one by one, each at its own moment spread over most of the morph, while the fibres brighten gradually.

## Amendment 2026-11-22: per-card pyramids, dissolving cards, cinematic seek

Supersedes the branch and card bullets of the 2026-11-21 amendment.

- **Branch as a pyramid per card:** each card that is on screen (at most two at once: the centred one and the one entering or leaving) has its own branch: four wide faces of strands from an apex on the trunk behind the card onto the card's four sides, landing slightly inset from the corners, each face bowing slightly inward toward the pyramid's axis. The branch grows with the card's presence on screen, so it is seen at an angle while scrolling and sits behind the card when the card is centred.
- **Cards dissolve in:** a card's presence (0 at the frame edge → 1 near the centre, and over the end of the morph) first grows its branch; then the card materialises with a cell dissolve (square cells in the Home dot-matrix style appear in a noise-driven order, edges first where the branch lands, with a bright brand-cyan edge on the forming cells); the title, year and client fade in with it. Leaving reverses it: the card dissolves into cells, then the branch pulls back. The card keeps its subtle centre/edge size difference but no longer grows from 0. A fully dissolved card is not drawn or hit-tested.
- **Cinematic seek:** menu Home ↔ Work and Back/Forward animate the scroll over about 3 s with an even ease-in-out, so the morph plays at a readable pace.

## Amendment 2026-11-23: fibre beam replaces the laser

The fullscreen laser overlay (drawn over the logo and text, a different visual language, the most expensive pass on Home) is removed. In its place, Home gets a fibre beam: the same brand-cyan light trails as the stream, rising from the bottom of the frame along the centre axis, its visible length growing with the Home scroll (nothing at the top of Home, full height at the end). It is a background element: it sits in the background group between the "ROBIN POTZE" title and the video wall, dimmer than the logo, and never in front of the logo or the DOM text. Over the first half of the morph it fades and recedes with the other Home extras, while the logo-derived fibres take over the same axis. Nothing is drawn while its length is 0 or once it has faded.
