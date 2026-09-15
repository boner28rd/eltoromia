import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, Phone, X } from "lucide-react";
import company from "../../data/company.json";
import navigation from "../../data/navigation.json";
import ButtonLink from "../ui/ButtonLink.jsx";

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const transparent = location.pathname === "/" && !scrolled && !open;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 32);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [location.pathname]);

  const linkClass = ({ isActive }) =>
    `text-sm font-bold transition ${isActive ? "text-clay" : transparent ? "text-white/90 hover:text-white" : "text-charcoal/75 hover:text-forest-700"}`;

  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${transparent ? "text-white" : "bg-paper/95 text-charcoal shadow-sm backdrop-blur-xl"}`}>
      <div className={`hidden border-b lg:block ${transparent ? "border-white/15" : "border-charcoal/10"}`}>
        <div className="container-page flex h-10 items-center justify-between text-xs font-semibold">
          <p className={transparent ? "text-white/75" : "text-charcoal/60"}>Serving {company.serviceAreas.join(", ")}</p>
          <div className="flex items-center gap-6">
            <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="inline-flex items-center gap-2">
              <Phone className="h-3.5 w-3.5" /> {company.phone}
            </a>
            <span>{company.email}</span>
          </div>
        </div>
      </div>

      <nav className="container-page flex h-20 items-center justify-between" aria-label="Main navigation">
        <Link to="/" className="flex items-center gap-3" aria-label="Eltoromia home">
          <span className={`grid h-11 w-11 place-items-center rounded-full border text-lg font-black ${transparent ? "border-white/40 bg-white/10" : "border-forest-900/10 bg-forest-900 text-white"}`}>E</span>
          <span>
            <span className="block font-display text-xl font-extrabold leading-none">Eltoromia</span>
            <span className={`block text-[11px] font-bold uppercase tracking-[0.22em] ${transparent ? "text-white/60" : "text-charcoal/50"}`}>Landscapes</span>
          </span>
        </Link>

        <div className="hidden items-center gap-7 lg:flex">
          {navigation.map((item) => (
            <NavLink key={item.path} to={item.path} className={linkClass}>
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden lg:block">
          <ButtonLink to="/contact" variant={transparent ? "light" : "primary"}>Get a quote</ButtonLink>
        </div>

        <button
          className={`inline-grid h-11 w-11 place-items-center rounded-full border lg:hidden ${transparent ? "border-white/40 bg-white/10" : "border-charcoal/10 bg-white"}`}
          onClick={() => setOpen((value) => !value)}
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </nav>

      {open && (
        <div className="border-t border-charcoal/10 bg-paper shadow-lift lg:hidden">
          <div className="container-page grid gap-2 py-5">
            {navigation.map((item) => (
              <NavLink key={item.path} to={item.path} className={({ isActive }) => `rounded-xl px-3 py-3 text-base font-bold ${isActive ? "bg-forest-900 text-white" : "text-charcoal hover:bg-white"}`}>
                {item.label}
              </NavLink>
            ))}
            <ButtonLink to="/contact" className="mt-2 w-full">Request a consultation</ButtonLink>
          </div>
        </div>
      )}
    </header>
  );
}
