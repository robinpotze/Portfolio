# Documentation Tone Rewrite Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (inline). Do NOT use subagent-driven-development: every page task starts with an interview of the author, which a subagent cannot run. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite all informational site copy from sales pitch to first-person project documentation, using facts from an author interview per project.

**Architecture:** Edit each entry page's JSX in place: reorder existing section components into the Context → (per workstream: Problem → Approach → Decision) → Outcome template and replace their text. No new components, no data refactor. About gets text edits in `about.data.js`; Contact is audited only.

**Tech Stack:** React 19 JSX, Vite, oxlint, oxfmt.

Spec: `docs/superpowers/specs/2026-11-18-documentation-tone-design.md`

## Global Constraints

- First person, past tense: "I designed the case overview to show item, storage location and legal status on one screen."
- Headings (`h2`, `h3`, `heading=` props) name the topic ("Case overview", "Search"), never a claim.
- Banned: fragment triplets ("No X. No Y. No Z."), superlatives, "from zero", "finally", dramatic closers ("That workflow ended here."), impact claims without a stated fact.
- Numbers (team size, duration, record counts) only when the author confirms them in the interview.
- Never invent a fact. If the interview gives nothing for a block, omit the block.
- Text-block labels limited to `CONTEXT`, `PROBLEM`, `APPROACH`, `DECISION`, `OUTCOME`. Media components (`FeatureSplit`, `ImageGrid`, `DoubleImage`, `ComparisonBlock`) may carry a descriptive feature name instead (e.g. `SEARCH`, `BEER LABELS`).
- A workstream may have more than one `APPROACH` or `DECISION` block; order is always Problem → Approach → Decision.
- `ComparisonBlock` captions describe the iteration ("V1: TEXT-HEAVY REFERENCE PAGES"), not judge it ("TONED DOWN").
- Alt text: change only where it carries pitch language.
- Opening `EvidenceRow` labels: `ROLE`, `TEAM`, `DURATION`, `OUTPUT`. Closing `EvidenceRow` keeps systems/skills/tools.
- `CaseIntro`: `kicker` = `PROJECT / YEAR`, `heading` = plain description of the project, `subtitle` = author's role.
- Home and Contact decorative flavour text stays unchanged.
- Snippets in this plan use `text` fences: oxfmt reformats `js`/`jsx` fences in Markdown.

## Shared procedures

Every page task uses these. They are repeated by reference only because they are identical commands.

**Banned-pattern check** (run from repo root, `<FILE>` = the file just edited). Expected: no output.

```text
grep -nEi 'No [a-z]+\. No |finally|from (zero|scratch)|every [a-z]+\. every|zero shortcuts|worth |that workflow ended|without lecturing|one (designer|screen)\. ' <FILE>
```

**Build checks** (repo root). Expected: lint 0 errors, fmt:check clean, build succeeds.

```text
npm run lint && npm run fmt:check && npm run build
```

If `fmt:check` fails, run `npx oxfmt <FILE>` and re-run.

**Visual check:** `npm run dev`, open `http://localhost:5173/work/<key>`, scroll the whole page: every section renders, each image sits under the text it illustrates, no empty labels.

**Interview rules:** ask the questions one message at a time or as a short numbered list, as the author prefers. Record answers in the conversation only. Anything the author does not confirm stays out of the copy.

---

### Task 1: Cjib (sets the pattern)

**Files:**

- Modify: `src/routes/Entry/pages/Cjib/Cjib.jsx`
- Modify: `src/routes/Entry/pages/Cjib/cjib.data.js` (`synopsis`, `description`)

- [ ] **Step 1: Interview**

1. Who was your client contact and what teams were you embedded in? How many people per team, and how long were you there (the page says 12 months — correct)?
2. Motion design: what did the presentations look like before, who were they for, and what did you actually deliver (how many sequences, for which teams)?
3. GraphQL animation: whose decision was REST → GraphQL, and what did your animation need to explain to whom?
4. PBS documentation: what did developers lack before the site? What tools did you build it with (Antora, SpectaQL)? Why did you strip the original design down?
5. Beslagportaal: who are the users, what tools did they use before, and what did you design vs. who built it? Was it shipped or still in progress?
6. Search: what search inputs did users actually have, and what did you decide about filters? Any record-count number you can confirm?
7. Outcome: what is in use today, and what would you do differently?

- [ ] **Step 2: Reorder sections to the template**

Target order (existing components, existing media):

```text
CaseIntro                     src Presentation.mp4
StatementBlock CONTEXT        (was ROLE)
EvidenceRow                   ROLE / TEAM / DURATION / OUTPUT
WorkHeader COMMUNICATING SYSTEMS  001:::MOTION_DESIGN
  StatementBlock PROBLEM      new, from Q2
  FeatureSplit MOTION LANGUAGE   McDonalds_Logo.webp   (approach)
  StatementBlock DECISION     GraphQL text, then FullImage GraphQLTransition.webp
WorkHeader PBS                002:::DOCUMENTATION
  FullImage LANDING TMI.png
  StatementBlock PROBLEM      new, from Q4
  HeroStatement APPROACH      (was SYSTEM OVERVIEW) + INFOGRAPHIC LARGE.png
  StatementBlock APPROACH     (was API STATES) + INFOGRAPHIC.png + ERROR INFO.png
  ComparisonBlock DECISION    (was API DOCUMENTATION)
WorkHeader BESLAGPORTAAL      003:::UX_DESIGN
  StatementBlock PROBLEM
  StatementBlock APPROACH     (was CASE OVERVIEW) + Zaakoverzicht-v1.png
  StatementBlock APPROACH     (was SEARCH) + Zoeken.png
  ComparisonBlock DECISION    (was ITERATION)
  FeatureSplit DETAIL VIEW    Beslagvoorwerp.png
HeroStatement OUTCOME
EvidenceRow                   SYSTEMS / SKILLS / IMPLEMENTATION
```

Move JSX blocks only; keep `src`/`alt`/`className` props.

- [ ] **Step 3: Rewrite the text**

Replace every `heading`, `subtitle`, `description`, `h2`/`h3`, `ScrollReveal` body and `ComparisonBlock` caption using interview answers and the Global Constraints. Example of the target register (from the current Beslagportaal problem block, facts pending Q5):

```text
before: Every case meant rebuilding context from scratch.
after:  <h2>Case context</h2>
        Officers looked up what was seized, where it was stored and its legal
        status in separate systems. I designed one case overview that shows
        all three.
```

Update `cjib.data.js` `synopsis` (one plain line, e.g. "UX, documentation and motion design for the Dutch central fine-collection agency.") and `description` (2–3 first-person sentences matching the CONTEXT block).

- [ ] **Step 4: Run banned-pattern check** on both files. Expected: no output.

- [ ] **Step 5: Run build checks.** Expected: pass.

- [ ] **Step 6: Visual check** at `/work/cjib`.

- [ ] **Step 7: Author review.** Show the diff (`git diff src/routes/Entry/pages/Cjib`). Apply corrections, re-run Steps 4–5.

- [ ] **Step 8: Commit**

```text
git add src/routes/Entry/pages/Cjib
git commit -m "docs(cjib): rewrite case page in documentation tone"
```

---

### Task 2: Pmot

**Files:**

- Modify: `src/routes/Entry/pages/Pmot/Pmot.jsx`
- Modify: `src/routes/Entry/pages/Pmot/pmot.data.js`

- [ ] **Step 1: Interview**

1. What was PMOT, who were its customers (teachers? schools?), your role, team and duration?
2. Webstore problem: where does "low clickthrough, hard navigation" come from — data, client complaint, your own review?
3. How did you decide the category structure ("how teachers think")? Any research or teacher input?
4. Learning platform: built from nothing or replacing something? Who made the lessons?
5. How were products and lessons linked, and whose idea was that?
6. Prototyping: what tools, and what did testing show?
7. Outcome: "validated proof of concept" — validated how? Did it go to production?

- [ ] **Step 2: Reorder sections to the template**

```text
CaseIntro
StatementBlock CONTEXT        (was CHALLENGE; challenge text moves to webstore PROBLEM)
EvidenceRow                   ROLE / TEAM / DURATION / OUTPUT
StatementBlock DESIGN CHALLENGE  -> becomes a DECISION block under WEBSTORE (visual style)
WorkHeader WEBSTORE           001:::RETAIL_PLATFORM
  StatementBlock PROBLEM      (old CHALLENGE text)
  existing media + FeatureSplit PRODUCT BROWSING / CATEGORIES (approach)
  DoubleImage ACCOUNT EXPERIENCE
  StatementBlock DECISION     (old DESIGN CHALLENGE: child-friendly vs professional)
WorkHeader LEARNING PLATFORM  002:::EDUCATION
  StatementBlock PROBLEM      new, from Q4
  HeroStatement APPROACH      (was INTEGRATION)
  FeatureSplit LESSON MATERIALS, LESSON DETAIL
WorkHeader PROTOTYPING        003:::BEHIND_THE_SCENES
  existing DoubleImage(s), text as APPROACH
HeroStatement OUTCOME
EvidenceRow (closing)
```

- [ ] **Step 3: Rewrite the text** per Global Constraints; update `synopsis` (replace "Webstore meets learning platform." with a plain line) and `description`.
- [ ] **Step 4: Banned-pattern check** on both files. Expected: no output.
- [ ] **Step 5: Build checks.** Expected: pass.
- [ ] **Step 6: Visual check** at `/work/pmot`.
- [ ] **Step 7: Author review** of `git diff src/routes/Entry/pages/Pmot`; apply corrections, re-run 4–5.
- [ ] **Step 8: Commit**

```text
git add src/routes/Entry/pages/Pmot
git commit -m "docs(pmot): rewrite case page in documentation tone"
```

---

### Task 3: SqlGame

**Files:**

- Modify: `src/routes/Entry/pages/SqlGame/SqlGame.jsx`
- Modify: `src/routes/Entry/pages/SqlGame/sqlgame.data.js`

- [ ] **Step 1: Interview**

1. Who commissioned the game, who are the players, team composition ("one designer, one developer" — who was who?), duration?
2. Query tool: does it run real SQL? What feedback does the player get on a wrong query?
3. World map: what problem did it solve for navigation?
4. Quests: how are SQL concepts mapped to quests? Who wrote the content?
5. Reference book: why an in-game reference instead of external docs?
6. Iteration: what changed between wireframe and final, and why ("stripped down, then built back up")?
7. Outcome: is it in use, by how many / which groups, any feedback you can cite? What would you change?

- [ ] **Step 2: Reorder sections to the template**

```text
CaseIntro
StatementBlock CONTEXT        (was ROLE)
EvidenceRow                   ROLE / TEAM / DURATION / OUTPUT
WorkHeader QUERY TOOL         001:::CORE_MECHANIC
  StatementBlock PROBLEM      new, from Q2
  FeatureSplit QUERY EDITOR, INTERACTIVE (approach)
WorkHeader WORLD MAP          002:::NAVIGATION   + PROBLEM/APPROACH text from Q3
WorkHeader QUESTS             003:::PROGRESSION
  FeatureSplit QUEST PAGE, QUEST COMPONENTS
WorkHeader REFERENCE BOOK     004:::KNOWLEDGE_BASE  + DECISION text from Q5
WorkHeader ITERATION          005:::PROCESS
  DoubleImage EVOLUTION, REFINEMENT  (headings become DECISION-style descriptions)
HeroStatement OUTCOME
EvidenceRow (closing)
```

- [ ] **Step 3: Rewrite the text** per Global Constraints; update `synopsis` ("Learn SQL by playing it." becomes a plain description) and `description`.
- [ ] **Step 4: Banned-pattern check** on both files. Expected: no output.
- [ ] **Step 5: Build checks.** Expected: pass.
- [ ] **Step 6: Visual check** at `/work/sqlgame`.
- [ ] **Step 7: Author review** of `git diff src/routes/Entry/pages/SqlGame`; apply corrections, re-run 4–5.
- [ ] **Step 8: Commit**

```text
git add src/routes/Entry/pages/SqlGame
git commit -m "docs(sqlgame): rewrite case page in documentation tone"
```

---

### Task 4: SsgNL

**Files:**

- Modify: `src/routes/Entry/pages/SsgNL/SsgNL.jsx`
- Modify: `src/routes/Entry/pages/SsgNL/ssgnl.data.js`

- [ ] **Step 1: Interview**

1. Your role at Sopra Steria for these four products, period, and who you worked with on each.
2. AUTO|Q branding: what is AUTO|Q, what was the brief, what did you deliver?
3. Cybersecurity board game: audience, goal, why five domains on one board? Was it played/tested?
4. Agile Maturity game: audience, how the situation/question cards and tokens work, why that mechanic?
5. Chatbot: what does it do, why two themes, did you design only or also build?
6. Outcome: which of the four are in use, and what would you change?

- [ ] **Step 2: Reorder sections to the template**

```text
CaseIntro
StatementBlock CONTEXT        (was ROLE)
EvidenceRow                   ROLE / TEAM / DURATION / OUTPUT
WorkHeader AUTO|Q             001:::BRANDING        PROBLEM -> APPROACH (existing DoubleImages)
WorkHeader CYBERSECURITY      002:::BOARD_GAME      PROBLEM -> FeatureSplit BOARD DESIGN -> DoubleImage
WorkHeader AGILE MATURITY     003:::BOARD_GAME      PROBLEM -> DoubleImage -> FeatureSplit CARD SYSTEM -> DoubleImage EVENT CARDS
WorkHeader CHATBOT            004:::CONVERSATIONAL_UI  PROBLEM -> DoubleImage THEME (DECISION)
HeroStatement OUTCOME
EvidenceRow (closing)
```

PROBLEM blocks are new `StatementBlock`s; add only where the interview gives content.

- [ ] **Step 3: Rewrite the text** per Global Constraints; update `synopsis` ("The world is how we shape it." becomes a plain description) and `description`.
- [ ] **Step 4: Banned-pattern check** on both files. Expected: no output.
- [ ] **Step 5: Build checks.** Expected: pass.
- [ ] **Step 6: Visual check** at `/work/ssgnl`.
- [ ] **Step 7: Author review** of `git diff src/routes/Entry/pages/SsgNL`; apply corrections, re-run 4–5.
- [ ] **Step 8: Commit**

```text
git add src/routes/Entry/pages/SsgNL
git commit -m "docs(ssgnl): rewrite case page in documentation tone"
```

---

### Task 5: Ld58

**Files:**

- Modify: `src/routes/Entry/pages/Ld58/Ld58.jsx`
- Modify: `src/routes/Entry/pages/Ld58/ld58.data.js`

- [ ] **Step 1: Interview**

1. Ludum Dare 58: theme, team size, your role vs. teammates', engine?
2. The pad environment: what did you model, what was the art direction and why?
3. Television: what is its gameplay role, and how does the tutorial work?
4. Brand and beer labels: why knock-off brands, how many did you make (page says sixteen — correct)?
5. Audio: what did you make?
6. Outcome: ranking or feedback you can cite, and what you would change?

- [ ] **Step 2: Reorder sections to the template**

```text
CaseIntro
StatementBlock CONTEXT        (was ROLE)
EvidenceRow                   ROLE / TEAM / DURATION / OUTPUT
WorkHeader THE PAD            001:::ENVIRONMENT  APPROACH text -> DoubleImage CONSTRUCTION, THE TV CORNER
WorkHeader TELEVISION         002:::GAME_DESIGN  PROBLEM/APPROACH text -> ImageGrid TUTORIAL, CHANNELS
WorkHeader BRAND              003:::IDENTITY     APPROACH -> FeatureSplit LOGOTYPE -> ImageGrid BEER LABELS
HeroStatement OUTCOME
EvidenceRow (closing)
```

The image arrays above the component (`TUTORIAL_IMAGES` etc.) stay unchanged except pitch language in `alt`.

- [ ] **Step 3: Rewrite the text** per Global Constraints; update `synopsis` and `description`.
- [ ] **Step 4: Banned-pattern check** on both files. Expected: no output.
- [ ] **Step 5: Build checks.** Expected: pass.
- [ ] **Step 6: Visual check** at `/work/ld58`.
- [ ] **Step 7: Author review** of `git diff src/routes/Entry/pages/Ld58`; apply corrections, re-run 4–5.
- [ ] **Step 8: Commit**

```text
git add src/routes/Entry/pages/Ld58
git commit -m "docs(ld58): rewrite case page in documentation tone"
```

---

### Task 6: LsdJam

**Files:**

- Modify: `src/routes/Entry/pages/LsdJam/LsdJam.jsx`
- Modify: `src/routes/Entry/pages/LsdJam/lsdjam.data.js`

- [ ] **Step 1: Interview**

1. Which jam, theme, team size, duration, engine, your role vs. teammates'?
2. The game premise in one or two plain sentences ("which reality is yours?" — what does the player do?).
3. Command room, bridge, cassette room: what is each room's role in the game, and what did you build for each?
4. Why analog controls on the bridge?
5. Outcome: result or feedback you can cite, and what you would change?

- [ ] **Step 2: Reorder sections to the template**

```text
CaseIntro
StatementBlock CONTEXT        (was ROLE)
EvidenceRow                   ROLE / TEAM / DURATION / OUTPUT
WorkHeader COMMAND_ROOM       001:::HIBERNATION      APPROACH -> DoubleImage
WorkHeader THE BRIDGE         002:::COMMAND_CENTER   FeatureSplit DETAIL (DECISION: analog controls) -> DoubleImage PROCESS
WorkHeader CASSETTE_ROOM      003:::ALTERNATE_REALITY APPROACH -> DoubleImage
HeroStatement OUTCOME
EvidenceRow (closing)
```

- [ ] **Step 3: Rewrite the text** per Global Constraints; update `synopsis` ("Where games meet drugs" becomes a plain description of the jam entry) and `description`.
- [ ] **Step 4: Banned-pattern check** on both files. Expected: no output.
- [ ] **Step 5: Build checks.** Expected: pass.
- [ ] **Step 6: Visual check** at `/work/lsdjam`.
- [ ] **Step 7: Author review** of `git diff src/routes/Entry/pages/LsdJam`; apply corrections, re-run 4–5.
- [ ] **Step 8: Commit**

```text
git add src/routes/Entry/pages/LsdJam
git commit -m "docs(lsdjam): rewrite case page in documentation tone"
```

---

### Task 7: About

**Files:**

- Modify: `src/routes/About/about.data.js` (`ABOUT_INTRO.bio`, `ABOUT_DATA.EXP[*].details[*].text`, `ABOUT_DATA.SKL[*].description`, `ABOUT_DATA.SFT[*].description`)

- [ ] **Step 1: Interview**

1. For each skill (UI design, brand identity, 3D modeling, VFX, software development): one project or use where you applied it.
2. For each tool (Illustrator, After Effects, Figma, Blender, Unity, Unreal): what you used it for in your own work.
3. Sopra Steria: anything to add to the three bullets (which clients/sectors you may name)?

- [ ] **Step 2: Fix grammar in EXP bullets.** Known fixes:

```text
PMOT 1: "...revamped brand colouring and adhered to industry standard UX practices"
     -> "Designed a new webstore with a mascot, redesigned the logo and brand colours, and applied standard e-commerce UX patterns."
PMOT 3: "Created a link between the products and the learning materials to create a USP"
     -> "Linked products to the learning materials that use them."
```

Final wording follows interview answers; keep each bullet one sentence, past tense, ending in a full stop.

- [ ] **Step 3: Rewrite SKL and SFT descriptions** from generic ("Creating vector graphics and illustrations.") to specific use, e.g. "Logos, icons and infographics for CJIB and PMOT." — only with interview-confirmed facts.
- [ ] **Step 4: Banned-pattern check** on `src/routes/About/about.data.js`. Expected: no output.
- [ ] **Step 5: Build checks.** Expected: pass.
- [ ] **Step 6: Visual check** at `/about`: open each ticket section (EXP, SKL, SFT, EDU); longer text does not overflow its ticket.
- [ ] **Step 7: Author review** of `git diff src/routes/About`; apply corrections.
- [ ] **Step 8: Commit**

```text
git add src/routes/About/about.data.js
git commit -m "docs(about): factual skill and software descriptions, fix bullet grammar"
```

---

### Task 8: Contact audit and final sweep

**Files:**

- Read: `src/routes/Contact/Contact.jsx`, `src/routes/Contact/contact.data.jsx`
- Modify: only if a violation is found

- [ ] **Step 1: Audit Contact.** Placeholders (`USR.NAME`, `MSG.PAYLOAD`, `IDENTIFY@DOMAIN.COM`) and `SEND_ERROR_CONFIG` messages are terminal-style flavour, not pitch. Expected outcome: no change. If any human-readable sentence uses banned patterns, fix it in place.
- [ ] **Step 2: Site-wide banned-pattern check**

```text
grep -rnEi 'No [a-z]+\. No |finally|from (zero|scratch)|every [a-z]+\. every|zero shortcuts|worth |that workflow ended|without lecturing|one (designer|screen)\. ' src/routes
```

Expected: no output.

- [ ] **Step 3: Label check.** Every text-block label is one of the five template labels:

```text
grep -rnoE '<(StatementBlock|HeroStatement) label="[^"]*"' src/routes/Entry/pages | grep -vE '"(CONTEXT|PROBLEM|APPROACH|DECISION|OUTCOME)"'
```

Expected: no output.

- [ ] **Step 4: Build checks.** Expected: pass.
- [ ] **Step 5: Visual check** of `/work` cards: new synopses fit the card layout.
- [ ] **Step 6: Commit** (only if Step 1 changed anything)

```text
git add src/routes/Contact
git commit -m "docs(contact): align copy with documentation tone"
```
