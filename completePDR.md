# RedditPro AI – Product Requirements Document (MVP, No Auth / Payments)

**Version:** 0.9 (Hackathon / 8‑Hour Build)
**Goal:** Ship a functional prototype that: (1) collects Reddit data for selected subreddits & keywords, (2) discovers relevant subreddits, (3) asks structured questions to learn the user’s business & target, (4) summarizes threads, (5) drafts compliant reply suggestions, (6) flags rule / tone issues, (7) provides minimal monitoring & basic analytics counters. **No login, no payment, minimal styling.**

---

## 1. Scope & Non-Goals

**In-Scope (MVP):**

* Onboarding Q\&A wizard (collect business context: brand, product, target users, tone, keywords, competitors, prohibited topics).
* Subreddit discovery (from seed keywords; list & allow selection).
* Keyword + subreddit monitoring loop (polling only, simple interval).
* Mention feed (new posts/comments matching patterns) with status (NEW / RESPONDED / IGNORED).
* Thread detail view with: raw excerpt, AI summary, extracted sentiments, key questions, recommended action.
* AI reply draft generator (uses brand tone & context; includes disclosure template variable).
* Compliance checker (against subreddit rule text + internal guidelines: no spam, transparent affiliation, avoid prohibited words list).
* Minimal analytics: counts (mentions by keyword, sentiment distribution, response time avg, replies posted count *manual*), top subreddits by volume.
* Export / copy functionality (copy reply to clipboard; no direct posting required for MVP).

**Explicit Non-Goals (defer):** Auth, team roles, multi-user persistence beyond in-memory or single local JSON, advanced scheduling, full sentiment modeling, post publishing via OAuth (optional v1.1), advanced charts, mobile UI, rate-limit optimization, deep historical ingestion.

---

## 2. Primary User & Core Journey

1. Land on app → Onboarding wizard auto-opens → user answers short series of business questions.
2. System generates: keyword set, initial subreddit recommendations.
3. User selects relevant subreddits & finalizes monitored keywords.
4. Monitoring loop begins (poll every N minutes) and populates Mentions Feed.
5. User clicks a mention → Thread Detail modal → sees summary + key points → presses “Draft Reply.”
6. AI generates reply + compliance report; user edits & copies to clipboard to post manually on Reddit.
7. User marks mention as Responded. Analytics auto-update.

---

## 3. High-Level Architecture (MVP Simplified)

**Frontend:** Single-page app (SPA) in React (or Lovable generated). State managed locally; optional simple REST backend.
**Backend:** Lightweight FastAPI / Express service providing: subreddit discovery, monitoring poller, summarization + reply endpoints (proxying to LLM), compliance checks, rudimentary in-memory / file-based storage (JSON).
**LLM Provider:** Claude (or interchangeable) via single service module `ai_service` with methods: `summarize_thread(comments)`, `draft_reply(thread_context, brand_context)`, `check_compliance(draft, rules, guidelines)`.
**Data Flow:**

* Poller pulls new posts/comments → filters → stores mention objects → frontend fetch.
* On thread open: backend fetches latest full comments for that thread (limit) → summarization.
* Reply drafting passes brand context + thread summary to LLM → returns draft + rationale.
* Compliance pass uses rules text scraped earlier + heuristics.

---

## 4. Data Model (JSON / In-Memory)

```jsonc
BrandContext {
  "brandName": "string",
  "oneLine": "string",
  "products": ["string"],
  "targetUsers": ["string"],
  "valueProps": ["string"],
  "tone": {"formality": "casual|neutral|formal", "voiceKeywords": ["friendly","helpful"]},
  "keywords": ["string"],
  "competitors": ["string"],
  "prohibited": ["string"],
  "disclosureTemplate": "I work at {{brandName}}..."
}

SubredditProfile {
  "name": "r/xyz",
  "description": "string",
  "memberCount": number,
  "activityScore": number, // heuristic posts/day
  "relevanceScore": number, // keyword match weighting
  "status": "selected|candidate"
}

Mention {
  "id": "reddit_post_or_comment_id",
  "type": "post|comment",
  "subreddit": "r/xyz",
  "title": "string", // for posts
  "url": "string",
  "author": "string",
  "createdUTC": number,
  "matchedKeywords": ["keyword"],
  "snippet": "string",
  "status": "NEW|RESPONDED|IGNORED",
  "summary": "string|null",
  "sentiment": "positive|neutral|negative|null",
  "priority": "high|normal|low",
  "replyDraftId": "string|null"
}

ReplyDraft {
  "id": "uuid",
  "mentionId": "id",
  "originalPrompt": "string",
  "draftText": "string",
  "compliance": {"issues": ["string"], "score": 0-100},
  "createdUTC": number
}

AnalyticsSnapshot {
  "timestamp": number,
  "mentionTotals": number,
  "bySentiment": {"positive": n, "neutral": n, "negative": n},
  "bySubreddit": [{"name": "r/xyz", "count": n}],
  "respondedCount": number,
  "avgResponseMinutes": number
}
```

---

## 5. Feature Requirements (Core)

### F1. Onboarding Wizard (Business Context Capture)

**Goal:** Collect essential brand context to drive keyword generation & tone.
**Inputs (user fields):** brandName, oneLine, products (chips), targetUsers (chips), valueProps, tone (slider or select), competitors, prohibited (optional), initial seed keywords (optional).
**Derived Outputs:** consolidated keywords list = user keywords + brandName + products + competitor names; disclosureTemplate generated (editable).
**Logic:** After final step, call F2 (subreddit discovery) with top keywords.
**Acceptance Criteria:** User can finish wizard under 2 minutes; brandContext JSON stored in memory; UI shows generated keyword list for confirmation.

### F2. Subreddit Discovery & Selection

**Goal:** Recommend relevant subreddits.
**Logic:** For each keyword K, search Reddit (API `/subreddits/search`); compute relevanceScore = (keyword frequency in description + weight \* memberCount normalized). Return top N unique subreddits.
**User Actions:** Select / deselect; manual add field.
**Output:** `selectedSubreddits[]` stored; triggers F3 monitoring config.
**Acceptance:** At least 5 candidate subreddits appear for common keyword; user can select; selected stored.

### F3. Monitoring Configuration & Poller

**Goal:** Continuously fetch new posts/comments.
**Config:** pollInterval (default 180s), maxItemsPerPoll, lookbackHours initial fetch.
**Logic:** For each selected subreddit:

* Fetch new posts via `new` endpoint, filter if body/title contains any keyword (case-insensitive, simple regex). Optionally fetch comments for high-priority posts (if brand mentioned exactly).
* Each match becomes Mention (status NEW). Deduplicate by Reddit ID.
  **Acceptance:** New mentions appear within one poll cycle after being created on Reddit (subject to API delay). Deduplication prevents duplicates.

### F4. Mention Feed & Prioritization

**Display Fields:** subreddit badge, age (relative), snippet, matchedKeywords, sentiment (once calculated), status, priority indicator.
**Priority Logic (heuristic):**

* HIGH if direct brandName mention + question mark OR negative sentiment words (list) OR competitor + brand mention.
* NORMAL default.
  **Actions:** Open (Thread Detail), Mark Responded, Ignore.
  **Acceptance:** Sorting by newest AND toggle for priority-only works.

### F5. Thread Detail + AI Summary

**Trigger:** User opens a mention.
**Backend:** Fetch full post + top N comments (e.g. 30) → pass to ai\_service.summarize\_thread.
**Summary Format:** paragraphs: Overview, Main Points (bullets), Sentiment breakdown, Actionable Opportunities, Potential Risks.
**Acceptance:** Summary returns < 1200 characters (truncate if necessary) within 5s (assuming LLM latency). If token overflow, fallback: summarize top-level post only.

### F6. AI Reply Draft Generation

**Inputs:** thread summary, raw snippet, brandContext (valueProps, tone, disclosureTemplate), classification (question/complaint/praise).
**Prompt Template (abstract):** "You are a helpful, transparent representative of {{brandName}}. Tone: {{tone descriptors}}. User context: {{summary}}. Draft a reply (120-180 words max)... Must disclose with: {{disclosureTemplate}}."
**Post-processing:** ensure disclosure present; replace prohibited words; wrap code blocks if technical.
**Acceptance:** Draft appears under 7s; includes disclosure; no prohibited words.

### F7. Compliance Checker

**Inputs:** draft reply, subreddit rules text (fetched once & cached), internal guidelines (disclosure required, no aggressive sales, no excessive links >1, length < 220 words).
**Output:** issues\[] with severity (ERROR/WARN), compliance score (100 - penalties).
**Penalties Example:** missing disclosure -40, >1 link -10, prohibited word -15 each, rule keyword violation (e.g. "no self promotion") -30.
**Acceptance:** Score computed and displayed; issues list rendered; user sees green check if score >=80 & no ERRORs.

### F8. Basic Analytics

**Metrics:** total mentions (session), responded%, average first response time (difference between createdUTC and markResponded time), top 5 subreddits by volume, sentiment split.
**Computation:** recompute on each state change; ephemeral.
**Acceptance:** Dashboard counters update <1s after status change.

---

## 6. UI / Page Specifications (Lovable Prompt Friendly)

> **Instruction:** Each page spec includes: Purpose, Components, Interactions. Provide a copy-ready **“Lovable Build Prompt”** code block.

### Page A. Onboarding Wizard

**Purpose:** Sequential capture of business context.
**Components:** Progress steps (1–4), form fields per step, dynamic keywords preview sidebar, "Generate Recommendations" button final.
**Interactions:** Real-time update of aggregated keyword list; Next/Back navigation; Finish triggers subreddit discovery & navigates to Discovery page.
**Lovable Build Prompt:**

```text
Build an Onboarding Wizard with 4 steps: (1) Brand Basics (fields: Brand Name [text], One Liner [textarea], Products [tags input]). (2) Target & Value (Target Users [tags], Value Propositions [tags], Tone Selector [pill buttons: Casual, Neutral, Formal]). (3) Market Context (Competitors [tags], Prohibited Topics [tags optional]). (4) Keywords Review (Editable Keywords [multi-tag], Disclosure Template [readonly textarea], Generate Button). Sidebar shows dynamic Keyword Preview list updating as user types. Use clean cards, next/back buttons, disable next until required fields filled. On Finish call `POST /discover_subreddits` with keywords payload then route to Discovery page.
```

### Page B. Subreddit Discovery & Selection

**Purpose:** Present recommended subreddits & allow selection.
**Components:** Search bar (add manual), table/grid of subreddit cards (name, members, relevance score bar, activity score, checkbox), Selected list sidebar, "Start Monitoring" button.
**Lovable Build Prompt:**

```text
Create a Subreddit Discovery page. Top search input for manual subreddit search (enter keyword -> call `/search_subreddits?query=`). Below, show a responsive grid of cards each with: Subreddit Name (r/xxx), Member Count, Relevance Score (horizontal bar), Activity (posts/day), Select checkbox. Right side sticky panel: Selected Subreddits list with remove icons and count. Button 'Start Monitoring' disabled until >=1 selected; clicking calls `POST /monitor/config` with selected list then navigates to Dashboard.
```

### Page C. Dashboard (Mentions & Analytics)

**Purpose:** Central workspace after monitoring starts.
**Layout:** Two-column: Left narrow panel (Tracked Keywords, Add Keyword inline), Right main with tabs \[Mentions | Analytics].
**Mentions Tab Components:** Filter bar (Search text, Priority toggle, Status filter dropdown), Mention list (rows/cards) showing: subreddit badge, title/snippet, age, matched keywords chips, sentiment pill (once available), status dropdown.
**Interactions:** Click row -> open Thread Detail modal. Status change inline. Auto-refresh (websocket or polling of `/mentions`).
**Analytics Tab Components:** Simple stat cards (Total Mentions, Responded %, Avg Response Time), bar list (Top Subreddits), donut or simple bar for Sentiment (ok to placeholder text list for MVP), table of keyword counts.
**Lovable Build Prompt:**

```text
Build a Dashboard with two main tabs: Mentions and Analytics. Left side vertical panel: Tracked Keywords list (each chip removable), Add Keyword input (on enter call `POST /keywords`). Mentions Tab: Top filter bar (Text filter, Priority Only toggle, Status dropdown [All/New/Responded/Ignored], Refresh button). Below, scrollable list of Mention Cards: show subreddit (badge), snippet/title, age (e.g. '12m'), matched keywords (chips), sentiment pill (blank if null), status dropdown. Clicking a card opens a modal (Thread Detail). Analytics Tab: 3 metric cards (Total Mentions, Responded %, Avg Response Time), section 'Top Subreddits' listing top 5 with counts, section 'Sentiment Split' listing counts per sentiment, section 'Keyword Volume' table (keyword, count). Clean minimal styling.
```

### Page D. Thread Detail Modal

**Purpose:** Deep dive & actions.
**Components:** Header (Subreddit, Age, Link to Reddit), Original Post snippet, Collapsible Top Comments preview (first 5), Summary box (AI output with sections), Sentiment badges, Action buttons: \[Draft Reply] \[Mark Responded] \[Ignore]. Reply Draft area appears after generation: text editor, Compliance panel (score + issues list), Buttons \[Copy Reply] \[Regenerate].
**Lovable Build Prompt:**

```text
Create a Thread Detail modal. Sections: Header (subreddit badge, age, external link icon opens original URL). Original Content card (title + body snippet). Top Comments accordion (list first 5). Summary card with headings: Overview, Main Points (bullets), Opportunities, Risks, Sentiment. Action bar buttons: Draft Reply, Mark Responded, Ignore. When Draft Reply clicked call `POST /reply/draft?mentionId=`; show loading skeleton then a Reply Editor (textarea) + Compliance Panel (score badge large, issues list with severity). Provide buttons: Copy Reply (copies textarea), Regenerate Draft (calls same endpoint with `?regen=1`). If Mark Responded clicked, call `POST /mention/status` update and close modal.
```

### Page E. Settings Side Panel (Slide-over)

**Purpose:** Adjust brand context & tone quickly.
**Components:** Toggleable drawer with fields: Tone Selector, Edit Disclosure Template, Value Props tags, Competitors tags, Prohibited tags. Save button re-validates & persists.
**Lovable Build Prompt:**

```text
Add a slide-over Settings panel accessible via gear icon. Fields: Tone (pill buttons), Disclosure Template (textarea), Value Props (tags), Competitors (tags), Prohibited Topics (tags). Save button calls `POST /brand_context` and closes panel. Provide subtle helper text under Disclosure Template reminding user to keep transparent.
```

---

## 7. Backend API (Initial Endpoints)

| Endpoint              | Method | Purpose                                   | Input                               | Output                      |
| --------------------- | ------ | ----------------------------------------- | ----------------------------------- | --------------------------- |
| /brand\_context       | POST   | Save/update brand context                 | BrandContext JSON (partial allowed) | 200 + merged JSON           |
| /discover\_subreddits | POST   | Return recommended subreddits             | {"keywords": \[..]}                 | \[{SubredditProfile}]       |
| /search\_subreddits   | GET    | Manual search                             | query param `query`                 | \[{SubredditProfile}]       |
| /monitor/config       | POST   | Set selected subreddits + keywords        | {subreddits:\[], keywords:\[]}      | 200 OK                      |
| /mentions             | GET    | List mentions + filters                   | query: status, priority, q          | \[Mention]                  |
| /mention/{id}         | GET    | Get full mention (fresh fetch)            | path                                | Mention (possibly enriched) |
| /mention/status       | POST   | Update status                             | {id, status}                        | 200                         |
| /thread/{id}/summary  | POST   | Summarize thread (fallback if not cached) | {id}                                | {summary, sentiment}        |
| /reply/draft          | POST   | Create or regenerate reply                | {mentionId, regen?}                 | ReplyDraft                  |
| /compliance/check     | POST   | Validate draft                            | {draftId or text, subreddit}        | {score, issues\[]}          |
| /keywords             | POST   | Add keyword                               | {keyword}                           | {keywords\[]}               |
| /analytics            | GET    | Return current metrics                    | none                                | AnalyticsSnapshot           |

---

## 8. Incremental Implementation Plan (8-Hour Sprint)

**Hour 0–0.5: Environment & Skeleton**

* Initialize repo, basic FastAPI/Express app, CORS enabled.
* Define data models (Python dataclasses / JS objects) & in-memory stores.

**Hour 0.5–1.5: Reddit API Read (Discovery & Fetch)**

* Implement subreddit search (`/discover_subreddits`, `/search_subreddits`).
* Implement simple polling function (script or background task) for selected subs (initially none). Use environment variables for Reddit credentials.

**Hour 1.5–2.5: Mention Detection & Storage**

* Implement filter logic; create Mention objects; expose `/mentions` GET.
* Basic priority heuristic.

**Hour 2.5–3.5: Summarization Service**

* Add `/thread/{id}/summary` endpoint calling LLM (stub first with mock summary).
* Integrate summarization when mention opened (lazy evaluation & caching).

**Hour 3.5–4.5: Reply Draft + Compliance**

* Implement `/reply/draft` with prompt template & brand context merge.
* Implement `/compliance/check` (rules fetched from subreddit about tab once; if fail, stub simple rules list). Basic scoring.

**Hour 4.5–5.5: Analytics Counters**

* Track status change times; compute metrics in `/analytics`.
* Sentiment placeholder (simple word list) then upgrade to LLM classification.

**Hour 5.5–6.5: Frontend Pages (Wizard + Discovery + Dashboard)**

* Build Onboarding wizard & connect to brand\_context & discovery endpoints.
* Build Subreddit Discovery selection & start monitoring.
* Dashboard mentions list pulling `/mentions` on interval.

**Hour 6.5–7.5: Thread Modal & Reply Flow**

* Modal UI, call summary & draft endpoints, show compliance results, copy functionality.
* Status updates & analytics tab basic counters (plain numbers).

**Hour 7.5–8.0: Polish & Testing**

* Edge cases (duplicate mentions, missing data, LLM error fallback strings).
* Add loading states & minimal error banners.
* Smoke test flow end-to-end.

---

## 9. LLM Prompt Guidelines (Abstract)

**Summarize Thread Prompt:** Provide model with: role instructions, truncated ordered list of \[OP Title+Body], \[Top Comments #1..N], ask for structured JSON (sections). Post-process into display text.
**Draft Reply Prompt:** Supply brand context JSON + summary + guidelines. Ask for <=180 words, friendly, includes disclosure, no more than 1 link, no slang unless tone=Casual.
**Compliance Prompt (optional):** Or handle rule regex locally; only call LLM if heuristic uncertain.

---

## 10. Compliance & Ethics Checklist

* Always insert disclosure template if missing.
* Do not auto-post; require manual user action (copy) in MVP.
* Rate limit API calls to respect Reddit terms.
* Avoid storing user PII (none requested) – only brand context.

---

## 11. Acceptance Criteria (Global)

* User completes onboarding → mentions feed visible within 10 minutes (if data exists) or shows “No mentions yet – monitoring…” message.
* Generating a reply never takes longer than 10s median.
* Compliance issues clearly listed; editing draft & re-check updates issues instantly (<1s, local re-run if heuristic only).
* No crashes under typical polling cycle for at least 30 minutes.

---

## 12. Future Enhancements (Annotated for Post-MVP)

* OAuth posting / scheduling.
* Historical backlog ingestion using pushshift-like service (if compliant).
* Advanced ML sentiment & toxicity detection.
* Multi-user + auth + persistence DB.
* Alert channels (email, Slack webhook).
* Rule ingestion automation (scrape /r/sub wiki pages).

---

## 13. Quick Dev Test Scripts (Manual)

1. POST /brand\_context with sample JSON → 200.
2. POST /discover\_subreddits → returns ≥3 items.
3. POST /monitor/config with 1 subreddit & keywords → poller begins (log output).
4. GET /mentions after 3 mins → list includes at least empty array (no error).
5. GET /mention/{id} after manually injecting test object.
6. POST /thread/{id}/summary with stub data → summary JSON.
7. POST /reply/draft → returns draft includes disclosure.
8. POST /compliance/check with inserted link duplication → returns issue.

---

## 14. Copy & Content Guidelines (UI Microcopy)

* Empty Mentions: “Monitoring active. We’ll surface new relevant discussions here.”
* Draft Button tooltip: “Generate an AI reply (you can edit before posting).”
* Compliance Pass: “Ready to post.” / Fail: “Needs tweaks before posting.”

---

## 15. Risks & Mitigations (MVP)

| Risk                 | Impact               | Mitigation                                                        |
| -------------------- | -------------------- | ----------------------------------------------------------------- |
| Reddit rate limits   | Missed mentions      | Keep polling interval ≥120s initially; exponential backoff on 429 |
| LLM latency/timeouts | Slow UX              | Show skeleton + retry once; fallback to minimal template draft    |
| Sparse data early    | Poor demo impression | Provide seed test mode with mock mentions if none found in 5 min  |
| Inaccurate sentiment | Misprioritization    | Allow manual priority override + label editing                    |

---

**End of MVP PRD**
