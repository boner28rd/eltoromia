import { useState } from "react";
import { Plus } from "lucide-react";

export default function FAQAccordion({ items, limit }) {
  const [open, setOpen] = useState(0);
  const visible = limit ? items.slice(0, limit) : items;

  return (
    <div className="divide-y divide-charcoal/10 rounded-lg bg-white shadow-sm ring-1 ring-charcoal/10">
      {visible.map((item, index) => (
        <div key={item.question}>
          <button className="flex w-full items-center justify-between gap-5 px-5 py-5 text-left sm:px-7" onClick={() => setOpen(open === index ? -1 : index)} aria-expanded={open === index}>
            <span className="font-display text-lg font-extrabold text-charcoal">{item.question}</span>
            <Plus className={`h-5 w-5 shrink-0 text-clay transition ${open === index ? "rotate-45" : ""}`} />
          </button>
          {open === index && <p className="px-5 pb-6 leading-7 text-charcoal/70 sm:px-7">{item.answer}</p>}
        </div>
      ))}
    </div>
  );
}
