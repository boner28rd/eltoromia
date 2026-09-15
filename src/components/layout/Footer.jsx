import { Link } from "react-router-dom";
import { Mail, MapPin, Phone } from "lucide-react";
import company from "../../data/company.json";
import navigation from "../../data/navigation.json";
import services from "../../data/services.json";
import socialLinks from "../../data/social-links.json";
import Icon from "../ui/Icon.jsx";

export default function Footer() {
  return (
    <footer className="bg-forest-900 text-white">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr_0.8fr_0.8fr_1fr]">
        <div>
          <Link to="/" className="inline-flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-clay text-lg font-black">E</span>
            <span className="font-display text-2xl font-extrabold">Eltoromia</span>
          </Link>
          <p className="mt-5 max-w-md leading-7 text-white/70">{company.description}</p>
          <div className="mt-6 flex gap-3">
            {socialLinks.map((link) => (
              <a key={link.label} href={link.url} className="grid h-10 w-10 place-items-center rounded-full border border-white/15 text-white/80 transition hover:border-clay hover:text-clay" aria-label={link.label}>
                <Icon name={link.icon} className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-wheat">Navigation</h2>
          <ul className="mt-5 grid gap-3">
            {navigation.map((item) => (
              <li key={item.path}>
                <Link to={item.path} className="text-white/70 transition hover:text-white">{item.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-wheat">Services</h2>
          <ul className="mt-5 grid gap-3">
            {services.slice(0, 7).map((service) => (
              <li key={service.slug}>
                <Link to={`/services/${service.slug}`} className="text-white/70 transition hover:text-white">{service.navigationLabel}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-extrabold uppercase tracking-[0.18em] text-wheat">Contact</h2>
          <ul className="mt-5 grid gap-4 text-white/70">
            <li className="flex gap-3"><MapPin className="mt-1 h-4 w-4 shrink-0 text-clay" /> <span>{company.address.display}</span></li>
            <li className="flex gap-3"><Phone className="mt-1 h-4 w-4 shrink-0 text-clay" /> <a href={`tel:${company.phone.replace(/\s/g, "")}`}>{company.phone}</a></li>
            <li className="flex gap-3"><Mail className="mt-1 h-4 w-4 shrink-0 text-clay" /> <a href={`mailto:${company.email}`}>{company.email}</a></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="container-page flex flex-col gap-2 text-sm text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>Copyright &copy; {new Date().getFullYear()} Eltoromia. {company.legalDescriptor}.</p>
          <p>Serving {company.serviceAreas.slice(0, 3).join(", ")} and the surrounding area.</p>
        </div>
      </div>
    </footer>
  );
}
