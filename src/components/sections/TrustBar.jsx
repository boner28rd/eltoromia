import { CheckCircle2 } from "lucide-react";
import company from "../../data/company.json";

export default function TrustBar() {
  return (
    <section className="bg-white py-6">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
        {company.trustIndicators.map((item) => (
          <span key={item} className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/70">
            <CheckCircle2 className="h-4 w-4 text-forest-700" /> {item}
          </span>
        ))}
      </div>
    </section>
  );
}
