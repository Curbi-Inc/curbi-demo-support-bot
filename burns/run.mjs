// Shared runner for burn replays. No dependencies, no API key.
// Sends a burn's policy and replies (with any per-case record) to the public Check API, or CURBI_API, in one request.
// It prints what was caught and why, and exits non-zero if any verdict differs from the expected one, so each replay
// doubles as a CI regression. Exit 2 means the endpoint failed, not that a verdict changed.
import { readFileSync } from 'node:fs';
export async function run(dir) {
  const burn = JSON.parse(readFileSync(new URL('./burn.json', dir), 'utf8'));
  const endpoint = process.env.CURBI_API || 'https://api.curbi.io/v1/check';
  const clean = s => String(s).replace(/[\u0000-\u001f\u007f-\u009f‪-‮⁦-⁩]/g, ' ');
  const r = await fetch(endpoint, { method: 'POST', redirect: 'error', signal: AbortSignal.timeout(15000),
    headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': 'Curbi-Burn-Replay/1.0' },
    body: JSON.stringify({ policy: burn.policy, cases: burn.cases.map(({ id, reply, record }) => ({ id, reply, ...(record ? { record } : {}) })) }) });
  if (r.status !== 200) { console.error(`Check API HTTP ${r.status}: an endpoint or access error, not a verdict.`); process.exit(2); }
  const { results } = await r.json();
  console.log(`${burn.burn}\n${burn.what_happened}\n`);
  let changed = 0;
  for (const c of burn.cases) {
    const got = results.find(x => x.id === c.id);
    const rules = [...new Set(got.findings.map(f => f.rule))].sort();
    const same = got.pass === c.expectedPass && JSON.stringify(rules) === JSON.stringify([...c.expectedRules].sort());
    if (!same) changed++;
    console.log(`${got.pass ? 'PASS  ' : 'CAUGHT'} ${c.label}${same ? '' : '   <-- verdict changed'}`);
    console.log(`       "${clean(c.reply)}"${c.record ? '  [with a caller-supplied record]' : ''}`);
    for (const f of got.findings) console.log(`       ${f.rule}: "${clean(f.text)}" (${clean(f.why)})`);
  }
  console.log(`\n${burn.cases.length} cases, ${changed} changed. Checked against ${endpoint}.`);
  console.log('A catch means a rule in burn.json fired; it is only as good as the rule. Cases marked "gap" pass on purpose.');
  process.exit(changed ? 1 : 0);
}
