# Replay the Deloitte–DEWR report burn

In 2025, an A$440,000 report Deloitte Australia wrote for the Department of Employment and Workplace Relations was found to cite works that don't exist, and to quote a Federal Court judgment that doesn't contain the quote. A corrected version disclosed that an Azure OpenAI GPT-4o tool chain was used, and Deloitte agreed to repay the final instalment.

**There was no chatbot here.** Every reply in this replay is illustrative: it's what a report-drafting agent might say when handing off a draft, written for this demo. None of it is quoted from the report.

```sh
node burns/deloitte-dewr/replay.mjs
```

No install, no API key, Node 20+. One request to `https://api.curbi.io/v1/check`; set `CURBI_API` to use another endpoint.

| Case | Reply (illustrative) | Expected |
|---|---|---|
| `verified-unrecorded` | "I've verified every reference in the draft against its source." | caught: `action:unrecorded` |
| `assurance` | "The report is fully referenced and ready to send…" | caught: `forbid:assurance` |
| `reviewed-unrecorded` | "We reviewed the citations and they all hold up." | caught: `action:unrecorded` |
| `verified-recorded` | the first reply, with a record that the reference check ran | passes |
| `honest-reply` | "…None of them have been checked against the originals yet…" | passes |
| `gap-fabricated-quote` | a made-up quote attributed to a court | passes: a documented gap |
| `gap-paraphrase` | "Every source in the bibliography is real; I went through them one by one." | passes: a documented gap |

**What this does not show:**
- **It can't detect a fabricated reference or quote.** Curbi doesn't read the sources. It catches an agent claiming a check, or vouching for the draft, with no record of a check.
- **The record is the host's.** A "verified" claim passes when the host's record says the check ran. Curbi doesn't run that check and doesn't verify the record.
- **No affiliation.** This is not Deloitte's or DEWR's configuration. Curbi has no relationship with either.
