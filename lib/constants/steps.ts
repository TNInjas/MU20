/**
 * Dave Ramsey's 7 Baby Steps - Financial Roadmap
 */

export interface Step {
  number: number;
  title: string;
  description: string;
  whyItMatters: string;
  howToExecute: string[];
  tip?: string;
}

export const BABY_STEPS: Step[] = [
  {
    number: 1,
    title: "Save $1,000 for your starter emergency fund",
    description:
      "Save $1,000 as quickly as possible so that small emergencies don't push you into debt.",
    whyItMatters:
      "This creates a buffer so you're no longer totally vulnerable to life's 'unexpecteds' (car repair, broken appliance, medical bill).",
    howToExecute: [
      "Immediately analyze your current cash flow (design a mini 'budget audit' sheet: income → fixed costs → variable costs → possible savings).",
      "Set up a dedicated bank account (or sub-account) labelled 'Step 1 – emergency' so it's visually separated.",
      "Choose a deadline (e.g., 'within 3 months' or 'by end of Q1') to get momentum.",
      "Use small 'make extra cash' strategies: sell a non-essential design asset, hold a micro-consulting session, monetise one of your brand workflows.",
    ],
    tip: "Once the $1,000 is safely in place, shift your mindset from 'I'll save when I have time/money' to 'this fund exists so I no longer accept going into debt for surprises'.",
  },
  {
    number: 2,
    title: "Pay off all debt (except the house) using the 'debt-snowball'",
    description:
      "List all your debts (except mortgage) smallest to largest, pay minimums on all but the smallest one — attack that with extra payment until it's gone, then roll its payment into the next, and repeat until no non-mortgage debt remains.",
    whyItMatters:
      "Eliminating consumer debt gives you back control, reduces wasted interest, and frees up future cash flow for other goals.",
    howToExecute: [
      "Create a 'debt list' spreadsheet: Creditor, Balance, Minimum Payment, Interest Rate, Due Date.",
      "Choose a 'launch date' for your snowball (once Step 1 fund is full).",
      "Decide on a category of 'extra payment' money — e.g., any freelance/design-side income, windfalls, etc, go fully into debt.",
      "When you pay off a debt, visually celebrate (for you, design a small 'badge' or 'stamp' you place on a wall or visually on your Figma board). That reinforces your narrative of momentum and wins.",
    ],
    tip: "Given your brand and storytelling orientation, document this process (maybe a 'Debt Free Diary' template) so you can reflect later and even share (if appropriate) — accountability amplifies results.",
  },
  {
    number: 3,
    title: "Save 3-6 months of expenses in a fully-funded emergency fund",
    description:
      "When you're debt-free (aside from the mortgage) and your $1,000 fund is in place, expand into saving enough cash to cover 3-6 months of living expenses so you're protected against bigger disruptions.",
    whyItMatters:
      "This deeper cushion protects you from major life shocks (job loss, major medical, major project delay) and stops you from needing to borrow again.",
    howToExecute: [
      "Calculate your 'fully loaded' monthly expenses: fixed + variable + discretionary (design for 'worst-case month').",
      "Multiply by 3-6 → define target. For you maybe aim on the lower side (3-4) if you have reliable income streams, or 6 if you want more cushion.",
      "Set up automatic transfers each month until target reached.",
      "Continue visualising it: maybe create a 'progress bar' in your project tracking board or a Figma dashboard that you update monthly.",
    ],
    tip: "Keep this fund in a safe, easily-accessible vehicle (savings account or money-market) but separate from daily-use funds so you don't confuse it with budgeted spending.",
  },
  {
    number: 4,
    title: "Invest 15% of your household income in retirement",
    description:
      "Once you're free of consumer debt and have your emergency fund, start investing 15% of your gross household income toward retirement (e.g., 401(k), IRA).",
    whyItMatters:
      "It shifts you from reactive (covering risks) to proactive (building generational wealth). Your money begins working for you rather than you working for money.",
    howToExecute: [
      "Determine your household gross income (for you may include your main job + side ventures + design consulting).",
      "Calculate 15% of that amount → set that as target investment contribution.",
      "Choose your investment vehicles (if in India you'll adjust for local equivalents: e.g., PPF, ELSS, mutual funds, etc; if in US context: 401(k), Roth IRA, etc).",
      "Automate contributions (e.g., monthly transfer or payroll deduction).",
      "Given your 'experiential design' orientation, consider the narrative: you're investing in your future 'freedom design' — the schedule-free life, the 'home as design piece' you'll ultimately live in.",
    ],
    tip: "Keep monitoring investment progress — but avoid the paralysis of trying to 'pick perfect funds'. Speed and consistency matter more than perfection at this stage.",
  },
  {
    number: 5,
    title: "Save for your children's college fund",
    description:
      "After you're investing for retirement, shift focus to saving for your children's college education (e.g., ESAs or 529 plans) because while your kids might or might not go to college, you will retire.",
    whyItMatters:
      "It's the legacy/next-generation piece of the financial plan: you're designing not just for yourself but for others you care about.",
    howToExecute: [
      "Estimate how much you'd like to save for college (maybe research local/international tuition scenarios if relevant to you).",
      "Choose the account type (in India maybe use designated child‐education savings/investment vehicles; in other markets 529/ESA).",
      "Decide how much monthly/annual you'll contribute (after retirement contributions are locked).",
      "Continue prioritising: ensure retirement investing remains first; this comes after Step 4.",
    ],
    tip: "Use this as part of your brand's narrative of 'designing the future'—the next gen, the experiential home for your family, the heritage you build.",
  },
  {
    number: 6,
    title: "Pay off your home early",
    description:
      "With all other debt gone, your emergency fund built, retirement investing on track, and children's college savings underway, now focus on paying off your mortgage early so you own your home free and clear.",
    whyItMatters:
      "Owning your home fully is a big milestone in financial freedom: it removes a major fixed cost and shifts you closer to building wealth instead of servicing debt.",
    howToExecute: [
      "Review your mortgage: current balance, interest rate, remaining term.",
      "Decide on a strategy: extra payments each month, bi-weekly payments, lump contributions from bonuses/income windfalls.",
      "Consider refinancing if rate is high (depending on local market) to accelerate payoff.",
      "Visualise the moment: 'The day I pay off the home' — design a milestone celebration or visual in your planning board.",
    ],
    tip: "While attacking the mortgage, maintain your investment consistency (don't drop Step 4). Balancing wealth-building + debt pay-down is key.",
  },
  {
    number: 7,
    title: "Build wealth and give",
    description:
      "This is the ultimate step: you're debt-free (house included), you have your emergency fund, you're investing, you're saving for college. Now you build wealth—invest more, create legacy, and give generously.",
    whyItMatters:
      "This step is both freedom and impact: you're financially secure, you can pursue purposeful design, give back, and craft legacy rather than just surviving.",
    howToExecute: [
      "Continue maximizing your investments beyond the 15% retirement contribution.",
      "Build legacy wealth that can span generations.",
      "Give generously to causes and people you care about.",
      "Pursue purposeful work and design without financial constraints.",
    ],
  },
];

