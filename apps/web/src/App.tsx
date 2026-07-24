import { useMemo, useState } from "react";
import {
  CreditBand,
  prequalify,
  type ListingCriteria,
  type PreQualResult,
} from "@workspace/shared";

// Sample listings mirror services/api fixtures so the web demo and the API
// return the same pre-qualification answer for the same inputs.
type DemoListing = {
  id: string;
  label: string;
  monthlyRentCents: number;
  criteria: ListingCriteria;
};

const LISTINGS: DemoListing[] = [
  {
    id: "20000000-0000-0000-0000-000000000001",
    label: "1042 Guerrero St #2, San Francisco — $3,200/mo",
    monthlyRentCents: 3_200_00,
    criteria: { minIncomeMultiple: 2.5, minCreditScore: 680, vouchersAccepted: true },
  },
  {
    id: "20000000-0000-0000-0000-000000000002",
    label: "88 Prospect Ave, Oakland — $2,450/mo",
    monthlyRentCents: 2_450_00,
    criteria: { minIncomeMultiple: 2.5, vouchersAccepted: true },
  },
];

const CREDIT_LABELS: Record<CreditBand, string> = {
  poor: "Poor (< 580)",
  fair: "Fair (580–669)",
  good: "Good (670–739)",
  very_good: "Very good (740–799)",
  excellent: "Excellent (800+)",
};

const usd = (cents: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    cents / 100,
  );

const FEATURES = [
  {
    title: "The Deposit Meter",
    body: "Move-in photos are already mandatory (AB 2801). Turn that baseline into a running ledger: the tenant sees what their deposit returns today and exactly why each deduction exists.",
  },
  {
    title: "Free pre-qualification",
    body: "Meets / doesn't-meet against the posted criteria before any fee — pure arithmetic, no credit pull, deliberately outside FCRA. Try it below.",
  },
  {
    title: "Buyer's true-cost sheet",
    body: "Every for-sale listing shows carry cost at the reassessed property tax, not the seller's Prop 13 basis — the number that causes the most post-purchase regret.",
  },
];

export default function App() {
  const [listingId, setListingId] = useState<string>(LISTINGS[0].id);
  const [income, setIncome] = useState<string>("7000");
  const [creditBand, setCreditBand] = useState<CreditBand>("good");

  const listing = LISTINGS.find((l) => l.id === listingId) ?? LISTINGS[0];

  const result: PreQualResult | null = useMemo(() => {
    const monthlyIncomeCents = Math.round(Number(income) * 100);
    if (!Number.isFinite(monthlyIncomeCents) || monthlyIncomeCents < 0) return null;
    return prequalify(listing.criteria, listing.monthlyRentCents, { monthlyIncomeCents, creditBand });
  }, [income, creditBand, listing]);

  return (
    <main className="page">
      <header className="masthead">
        <p className="eyebrow">Milton's Properties</p>
        <h1>The only rental platform where the tenant sees the same record the landlord sees.</h1>
        <p className="lede">
          Owner, realtor, and renter on one system. The compliance work every California landlord
          already owes becomes the product — surfaced, not buried.
        </p>
      </header>

      <section className="features">
        {FEATURES.map((f) => (
          <article key={f.title} className="card">
            <h3>{f.title}</h3>
            <p>{f.body}</p>
          </article>
        ))}
      </section>

      <section className="demo">
        <h2>Free pre-qualification</h2>
        <p className="demo-note">
          Runs the exact <code>prequalify()</code> from <code>@workspace/shared</code> — the same
          function the API serves. No report, no inquiry.
        </p>

        <div className="form">
          <label>
            Unit
            <select value={listingId} onChange={(e) => setListingId(e.target.value)}>
              {LISTINGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </label>

          <label>
            Monthly income (USD)
            <input
              type="number"
              inputMode="decimal"
              min={0}
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </label>

          <label>
            Credit band (self-reported)
            <select value={creditBand} onChange={(e) => setCreditBand(e.target.value as CreditBand)}>
              {CreditBand.options.map((band) => (
                <option key={band} value={band}>
                  {CREDIT_LABELS[band]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {result && (
          <div className={`result ${result.meets ? "pass" : "fail"}`}>
            <p className="verdict">{result.meets ? "Meets criteria" : "Does not meet criteria"}</p>
            <p className="required">
              This unit requires about <strong>{usd(result.requiredMonthlyIncomeCents)}/mo</strong> in income.
            </p>
            {result.reasons.length > 0 && (
              <ul>
                {result.reasons.map((r) => (
                  <li key={r}>{r}</li>
                ))}
              </ul>
            )}
            <p className="disclaimer">{result.disclaimer}</p>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>
          Architecture and compliance rationale in <code>docs/build-plan.md</code> and{" "}
          <code>docs/features.md</code>. The iOS shell and the interactive prototype live in{" "}
          <code>apps/ios</code>.
        </p>
        <p className="fine">
          Prototype for demonstration. Not legal advice — statutory mechanics warrant counsel review
          before launch.
        </p>
      </footer>
    </main>
  );
}
