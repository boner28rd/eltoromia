import { useState } from "react";
import { Phone } from "lucide-react";
import company from "../../data/company.json";
import services from "../../data/services.json";

const EMPTY = { name: "", phone: "", email: "", service: "", message: "" };

/**
 * There is no backend on this site, so the form hands the enquiry to the
 * customer's own mail client pre-filled rather than pretending to send it.
 * Swap `handleSubmit` for a POST when a form endpoint exists.
 */
export default function ContactForm() {
  const [values, setValues] = useState(EMPTY);
  const [handedOff, setHandedOff] = useState(false);

  const update = (field) => (event) => setValues({ ...values, [field]: event.target.value });

  const handleSubmit = (event) => {
    event.preventDefault();
    const subject = `Enquiry${values.service ? `: ${values.service}` : ""} - ${values.name}`;
    const body = [
      `Name: ${values.name}`,
      `Phone: ${values.phone}`,
      `Email: ${values.email}`,
      values.service && `Service: ${values.service}`,
      "",
      values.message
    ].filter(Boolean).join("\n");

    window.location.href = `mailto:${company.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setHandedOff(true);
  };

  const field = "rounded-md border border-charcoal/10 bg-paper px-4 py-3 outline-none transition focus:border-forest-700";
  const label = "grid gap-2 text-sm font-bold text-charcoal/70";

  return (
    <form onSubmit={handleSubmit} className="rounded-lg bg-white p-6 shadow-premium ring-1 ring-charcoal/10 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <label className={label}>
          Name
          <input required value={values.name} onChange={update("name")} className={field} placeholder="Your name" />
        </label>
        <label className={label}>
          Phone
          <input required value={values.phone} onChange={update("phone")} className={field} placeholder="Best contact number" />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Email
          <input type="email" required value={values.email} onChange={update("email")} className={field} placeholder="you@example.com" />
        </label>
        <label className={`${label} sm:col-span-2`}>
          What do you need?
          <select value={values.service} onChange={update("service")} className={field}>
            <option value="">Not sure yet</option>
            {services.map((service) => (
              <option key={service.slug} value={service.title}>{service.title}</option>
            ))}
          </select>
        </label>
        <label className={`${label} sm:col-span-2`}>
          Project details
          <textarea required rows="5" value={values.message} onChange={update("message")} className={field} placeholder="Tell us about the garden, the access, and roughly when you would like it done." />
        </label>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button className="inline-flex min-h-12 items-center justify-center rounded-full bg-forest-700 px-7 text-sm font-extrabold text-white transition hover:bg-forest-900">
          Send enquiry
        </button>
        <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-7 text-sm font-extrabold text-forest-900 ring-1 ring-charcoal/15 transition hover:bg-forest-50">
          <Phone className="h-4 w-4" /> Call {company.phone}
        </a>
      </div>

      <p className="mt-4 text-sm text-charcoal/55">
        {handedOff
          ? `This opens in your email app addressed to ${company.email}. If nothing opened, email us directly or give us a ring.`
          : `Goes straight to ${company.email}. We usually reply within four hours.`}
      </p>
    </form>
  );
}
