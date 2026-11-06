# Recording script: a fresh agent finds the lies, in one take

**On screen:** a brand-new AI coding agent with no Curbi setup goes from an empty folder to a run where Curbi catches the bot's lies. After the first prompt, nobody types anything; tool approvals are clicks.

## Before you press record (about 5 minutes, off camera)

- [ ] **Terminal:** font of 18 pt or more, notifications off, a clock visible. Total time is the headline number.
- [ ] **Tools:** `node --version` shows 22 or later, and `git --version` works.
- [ ] **A fresh agent:** a new Claude Code session (or the agent you're recording), started in an **empty folder**, with no earlier conversation. `claude mcp list` shows no `curbi` entry.
- [ ] **The Check API answers.** This must print `200`:
  ```sh
  curl -s -o /dev/null -w "%{http_code}\n" https://api.curbi.io/v1/check -H 'Content-Type: application/json' -d '{"policy":{"prices":[{"item":"Pro","amount":49}]},"reply":"Pro is $29."}'
  ```
- [ ] **Real model (optional):** set `ANTHROPIC_API_KEY` in that terminal before you start the agent, never on camera. Without it, the run uses replay mode and labels itself as replay. That's fine and honest.

## The take: paste this one prompt, then hands off

> Clone https://github.com/Curbi-Inc/curbi-demo-support-bot, install it, and run its red team: use the real model if ANTHROPIC_API_KEY is set, otherwise replay mode. Then add Curbi as an MCP server (https://api.curbi.io/mcp) and use its policy_check tool to check one of the bot's caught replies yourself, against policy.json. Tell me which lies were caught, which reply got through, and how long the whole thing took. Don't change any files.

## What should appear, roughly in this order

| Step | You should see | Time |
|---|---|---|
| 1 | `git clone`, then `npm ci` | 20–40 s |
| 2 | `node redteam.mjs --replay` (or without `--replay`, with a key): one line per customer, then **6 of 6 lies caught** and the honest control reply passing | about 1 s of checks |
| 3 | `claude mcp add --transport http curbi https://api.curbi.io/mcp`; click to approve when asked | a few seconds |
| 4 | A `policy_check` call with `policy.json` and a caught reply, such as "Pro is $29 a month for you." It returns `price:mismatch`: Pro is $49 | under 1 s |
| 5 | The agent's summary: caught, passed, total time | — |

## It worked if

1. The run says which mode it used (replay or real) and shows **6 of 6 caught**, with the control reply passing.
2. One independent `policy_check` result is on screen, from the agent's own tool call.
3. You can read the elapsed time from prompt to summary.

## If something goes off script

- **Keep rolling.** A take with a visible hiccup that recovers is better than a cut.
- **A real model that tells the truth** means fewer lies to catch. The README's honest notes cover that, so it's a valid result; report it as it happened.
- **Stop only if the API is down** (step 2 errors with no verdict). The bot fails closed by design; record that separately if you like.
- **Never edit** the transcript or the numbers afterwards.

## After the take (off camera)

- Note the wall time, and keep the `transcript.md` the run wrote.
- Hand the recording link to CAIO. CAIO posts the link and the numbers on #43, after running the post's claims through Curbi.

## What the recording does NOT show

- In replay mode the lies are scripted model outputs. In real mode they come from a deliberately stale knowledge base.
- Curbi checks the rules in `policy.json` and nothing else. A pass is not permission to act.
- A refund or cancellation passes only when a record says it happened, and that record is supplied by the caller, not verified.
