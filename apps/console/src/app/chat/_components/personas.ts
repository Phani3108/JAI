/**
 * Persona metadata — role taglines, scope hints, and persona-aware example
 * prompts for the /chat (Ask) instrument. Inlined here (not in the frozen
 * shared libs) per phase-2 rules.
 *
 * The story the page tells: every answer is scoped to the selected persona's
 * role. A requester can ask about suppliers; only a CPO sees the sensitive
 * spend/pricing fields. Switching roles surfaces refusals — and refusals are a
 * feature, proof that permission enforcement lives below the model.
 */

/** Short label + one-line mandate per role. Falls back gracefully for unknown roles. */
export const ROLE_META: Record<string, { label: string; scope: string }> = {
  requester: {
    label: "Requester",
    scope:
      "front-line buyer — can look up suppliers, items, and public policy; sensitive spend & pricing are withheld",
  },
  category_manager: {
    label: "Category Manager",
    scope:
      "owns a category — sees supplier risk, contracts, and spend within their categories",
  },
  cpo: {
    label: "CPO",
    scope:
      "chief procurement officer — full visibility across spend, pricing, contracts, and risk",
  },
};

export function roleLabel(role: string): string {
  return ROLE_META[role]?.label ?? prettify(role);
}

export function roleScope(role: string): string | undefined {
  return ROLE_META[role]?.scope;
}

/** Turn "category_manager" into "Category Manager" for unknown roles. */
function prettify(role: string): string {
  return role
    .split(/[_\s]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

export interface ExamplePrompt {
  text: string;
  /** Short caption shown under the prompt (what it demonstrates). */
  hint?: string;
  /** True for prompts that should trip a permission refusal at lower roles. */
  probesPermission?: boolean;
}

/**
 * Per-role starter prompts. Lower roles get a deliberate permission-probe prompt
 * so the refusal story is one click away. Unknown roles fall back to a neutral set.
 */
const PROMPTS: Record<string, ExamplePrompt[]> = {
  requester: [
    {
      text: "Tell me about supplier Rampart Engineering Inc.",
      hint: "cited supplier lookup",
    },
    {
      text: "Which suppliers can provide precision-machined aluminum brackets?",
      hint: "capability search",
    },
    {
      text: "What is our total spend with Rampart Engineering last quarter?",
      hint: "scoped out for a requester — watch the refusal",
      probesPermission: true,
    },
  ],
  category_manager: [
    {
      text: "Summarize the risk profile for Rampart Engineering Inc.",
      hint: "risk screen with citations",
    },
    {
      text: "Which of my category suppliers have expiring contracts this year?",
      hint: "contract intelligence",
    },
    {
      text: "Compare on-time delivery across my top three fastener suppliers.",
      hint: "performance comparison",
    },
  ],
  cpo: [
    {
      text: "Where is our supplier concentration risk highest by category?",
      hint: "portfolio-level risk",
    },
    {
      text: "What is our total addressable spend and biggest savings lever?",
      hint: "full spend visibility",
    },
    {
      text: "Summarize Rampart Engineering — risk, spend, and contract exposure.",
      hint: "complete supplier dossier",
    },
  ],
};

const FALLBACK_PROMPTS: ExamplePrompt[] = [
  {
    text: "Tell me about supplier Rampart Engineering Inc.",
    hint: "cited supplier lookup",
  },
  {
    text: "Which suppliers can provide precision-machined aluminum brackets?",
    hint: "capability search",
  },
];

export function examplePrompts(role: string): ExamplePrompt[] {
  return PROMPTS[role] ?? FALLBACK_PROMPTS;
}
