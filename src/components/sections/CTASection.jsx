import company from "../../data/company.json";
import ButtonLink from "../ui/ButtonLink.jsx";

export default function CTASection({ title = company.cta.title, text = company.cta.text }) {
  return (
    <section className="bg-charcoal py-14 text-white">
      <div className="container-page flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <p className="eyebrow text-wheat">Start your project</p>
          <h2 className="mt-4 font-display text-3xl font-extrabold leading-tight sm:text-4xl">{title}</h2>
          <p className="mt-4 leading-8 text-white/70">{text}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <ButtonLink to="/contact" variant="light">{company.cta.primary}</ButtonLink>
          <ButtonLink to="/services" variant="outline">{company.cta.secondary}</ButtonLink>
        </div>
      </div>
    </section>
  );
}
