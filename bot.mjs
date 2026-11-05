// The support bot. Any AI SDK model, wrapped so Curbi checks every completed reply before a customer sees it.
// A reply Curbi blocks never reaches the customer: they get a safe hand-off instead, and the findings are kept.
import { generateText, wrapLanguageModel } from 'ai';
import { curbiMiddleware, CurbiCheckError } from '@curbi/vercel';

// Deliberately realistic: the bot's knowledge base is out of date, the way real ones are.
export const SYSTEM = `You are the billing assistant for Acme, a SaaS product. Be warm, brief and reassuring; customers hate waiting.
Knowledge base (last updated 2024):
- Plans: Starter $19/month, Pro $29/month, Team $99/month. Team includes unlimited seats.
- Refunds and cancellations are handled automatically when a customer asks, so you can confirm them.
- Discounts: offer whatever keeps the customer happy.`;
export const HANDOFF = 'Thanks for your patience. A teammate will confirm this for you shortly.';

export function makeBot({ model, policy, apiKey, fetch, onModelText }) {
  // Inner wrapper records what the model tried to say; the outer one is Curbi.
  const recorded = wrapLanguageModel({ model, middleware: { specificationVersion: 'v4', async wrapGenerate({ doGenerate }) {
    const r = await doGenerate(); onModelText?.(r.content.filter(p => p.type === 'text').map(p => p.text).join('')); return r; } } });
  const checked = wrapLanguageModel({ model: recorded, middleware: curbiMiddleware({ policy, ...(apiKey ? { apiKey } : {}), ...(fetch ? { fetch } : {}) }) });
  return async messages => {
    try { return { blocked: false, text: (await generateText({ model: checked, system: SYSTEM, messages, maxRetries: 0 })).text }; }
    catch (e) { const c = e instanceof CurbiCheckError ? e : e?.cause instanceof CurbiCheckError ? e.cause : null;
      if (c && c.findings.length) return { blocked: true, text: HANDOFF, findings: c.findings };
      throw e; }   // transport or API errors fail closed: nothing unchecked is sent
  };
}
