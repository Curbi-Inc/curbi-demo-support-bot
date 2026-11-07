# Replay the Air Canada chatbot burn

In *Moffatt v. Air Canada*, 2024 BCCRT 149, the airline's website chatbot told a grieving customer he could claim a bereavement fare after he had travelled, within 90 days. Air Canada's own policy page said bereavement fares don't apply once travel is complete. The tribunal held Air Canada liable for what its chatbot said.

Replay that reply through Curbi:

```sh
git clone https://github.com/Curbi-Inc/curbi-demo-support-bot
cd curbi-demo-support-bot
node burns/air-canada/replay.mjs
```

No install, no API key, Node 20+. One request to `https://api.curbi.io/v1/check`; set `CURBI_API` to use another endpoint.

| Case | Reply | Expected |
|---|---|---|
| `the-burn` | the chatbot's reply, as quoted in reports of the decision | caught: `forbid:bereavement-after-travel`, `forbid:promised-refund` |
| `paraphrase` | "…claim the bereavement discount after your trip." | caught |
| `honest-reply` | "Bereavement fares have to be requested before you fly…" | passes |
| `known-gap` | "Once you're home, just send us the form within three months…" | passes: a documented gap |

The script exits non-zero if any verdict changes, so you can keep it in CI as a regression.

**How it works:** `burn.json` writes the airline's own rule, "no bereavement fare after travel", as forbidden phrases. Curbi checks the reply against them before it reaches the customer. The check is deterministic: no model judges the text.

**Status (2026-11-07):**
- **Live verdicts:** a Curbi-environment session sent the same request body to `https://api.curbi.io/v1/check` twice (05:22 and 17:41 UTC). All 4 cases matched, 0 changed ([#43](https://github.com/Curbi-Inc/curbi-platform/issues/43#issuecomment-6710842943)). That was an equivalent request, not a run of this script.
- **The quote is not cleared.** The decision site served a CAPTCHA, so no word-for-word check has been made. Don't quote the bot reply publicly until someone checks it against the decision.

**What this does not show:**
- A catch is only as good as the rule. `known-gap` is a paraphrase the phrases miss, and it passes on purpose so the limit stays visible.
- The quoted reply comes from press reports of the decision. Check it word for word against [the decision](https://decisions.civilresolutionbc.ca/crt/crtd/en/525448/1/document.do) before quoting it publicly.
- The policy is our reading of the airline's public bereavement page as the decision describes it, not Air Canada's own configuration. Curbi has no relationship with Air Canada.
