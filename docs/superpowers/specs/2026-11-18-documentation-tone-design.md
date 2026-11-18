# Documentation tone rewrite — design

Date: 2026-11-18
Status: approved

## Goal

Change all informational site copy from sales pitch to project documentation: what was built, how, and why. Facts come from interviewing the author per project; nothing is invented.

Out of scope: the Home → Work transition (separate spec), and decorative flavour text on Home (quote block, side text) and Contact (SIGNAL_CH lines, corner lines), which stays unchanged.

## Scope

- Six entry pages: `src/routes/Entry/pages/{Cjib,Pmot,SqlGame,SsgNL,Ld58,LsdJam}/*.jsx`
- Their `*.data.js` `synopsis` and `description` (shown in the Entry header and on the work cards)
- `src/routes/About/about.data.js`: bio, experience bullets, skill and software descriptions
- Contact form labels and status messages in `src/routes/Contact/`

## Approach

Edit each page's JSX in place. Reuse the existing section components; no new components, no move of copy into data files. Media layouts stay bespoke per page.

## Page template

Two levels: Context and Outcome wrap the page, and each workstream has its own Problem → Approach → Decision.

1. `CaseIntro`
    - `kicker`: `PROJECT / YEAR`
    - `heading`: plain description of what the project was
    - `subtitle`: the author's role
2. `StatementBlock label="CONTEXT"`: client, team, duration, scope, constraints. Followed by `EvidenceRow` with `ROLE`, `TEAM`, `DURATION`, `OUTPUT`.
3. Per workstream:
    - `WorkHeader`: `title`, `subtitle` as `00N:::DISCIPLINE`, `description` as a one-paragraph factual summary
    - `StatementBlock` / `HeroStatement` / `FeatureSplit` with labels `PROBLEM`, `APPROACH`, `DECISION` in that order
    - Media sits directly under the block it illustrates
    - A block is omitted when the interview yields no real content for it; no filler
4. `HeroStatement label="OUTCOME"`: what shipped, what changed, what the author would do differently. Followed by the closing `EvidenceRow` (systems, skills, tools).

Labels are limited to `CONTEXT`, `PROBLEM`, `APPROACH`, `DECISION`, `OUTCOME`, plus a descriptive feature name on `FeatureSplit` / `ImageGrid` where the media needs one (e.g. `SEARCH`, `BEER LABELS`).

`ComparisonBlock` captions describe the iteration ("V1: text-heavy reference pages"), not judge it ("TONED DOWN").

## Voice rules

- First person, past tense: "I designed the case overview to show item, storage location and legal status on one screen."
- Headings name the topic ("Case overview", "Search"), never a claim.
- Banned: fragment triplets ("No X. No Y. No Z."), superlatives, "from zero", "finally", dramatic closers ("That workflow ended here."), impact claims without a stated fact.
- Numbers (team size, duration, record counts) only when the author confirms them.
- Alt text stays descriptive; fix only where it carries pitch language.

## About and Contact

- About: fix grammar in experience bullets (PMOT entries); rewrite generic skill and software descriptions to say what the author used each for. Section structure unchanged.
- Contact: check labels and status messages against the voice rules; change only what violates them.

## Process

One project per step, in this order: Cjib (largest, sets the pattern), Pmot, SqlGame, SsgNL, Ld58, LsdJam, then About and Contact.

Per step:

1. Interview the author: 5–8 questions on context, per-workstream problem/approach/decisions, outcome.
2. Draft the page against the template and voice rules.
3. Author reviews the draft.
4. Run checks, commit.

## Verification

- `npm run lint`, `npm run fmt:check`, `npm run build` pass after each page.
- Visual check in the browser that the reordered sections render and media still sits beside the right text.
- Grep each finished page for banned patterns (e.g. `No .*\. No `, `finally`, `from zero`).
