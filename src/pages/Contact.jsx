import { Clock, Mail, MapPin, Phone } from "lucide-react";
import company from "../data/company.json";
import SEO from "../components/ui/SEO.jsx";
import PageHero from "../components/sections/PageHero.jsx";
import ContactForm from "../components/sections/ContactForm.jsx";
import CTASection from "../components/sections/CTASection.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";

export default function Contact() {
  const address = company.address.display;

  return (
    <>
      <SEO title="Contact Eltoromia | Landscaping Consultation" description="Contact UK landscaping company Eltoromia for patio, paving, fencing, decking, driveway and garden transformation enquiries." image={company.hero.image} />
      <PageHero compact eyebrow="Contact" title="Tell us what your outdoor space needs to become." text="Share your ideas, rough timing and site details. We will shape the next step around your garden, access and preferred season." image="/images/site/contactHero.webp" />

      <section className="section-padding">
        <div className="container-page grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeader eyebrow="Get in touch" title="Book a landscaping consultation." text="Every detail below is managed from the company data file for straightforward future replacement." />
            <div className="mt-8 grid gap-4">
              <a href={`tel:${company.phone.replace(/\s/g, "")}`} className="flex gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-charcoal/10">
                <Phone className="mt-1 h-5 w-5 text-clay" />
                <span><strong className="block">Phone</strong>{company.phone}</span>
              </a>
              <a href={`mailto:${company.email}`} className="flex gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-charcoal/10">
                <Mail className="mt-1 h-5 w-5 text-clay" />
                <span><strong className="block">Email</strong>{company.email}</span>
              </a>
              <div className="flex gap-4 rounded-lg bg-white p-5 shadow-sm ring-1 ring-charcoal/10">
                <MapPin className="mt-1 h-5 w-5 text-clay" />
                <span><strong className="block">Based in</strong>{address}</span>
              </div>
              <div className="rounded-lg bg-forest-900 p-5 text-white">
                <div className="flex gap-4">
                  <Clock className="mt-1 h-5 w-5 text-wheat" />
                  <div>
                    <strong className="block">Business hours</strong>
                    <div className="mt-3 grid gap-2 text-white/75">
                      {company.hours.map((item) => (
                        <p key={item.day} className="flex justify-between gap-6"><span>{item.day}</span><span>{item.time}</span></p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ContactForm />
        </div>
      </section>

      <section className="bg-white py-14">
        <div className="container-page">
          <div className="grid min-h-[360px] place-items-center rounded-lg bg-forest-50 bg-surface-grid bg-[length:28px_28px] p-8 text-center ring-1 ring-charcoal/10">
            <div>
              <MapPin className="mx-auto h-10 w-10 text-forest-700" />
              <h2 className="mt-4 font-display text-3xl font-extrabold">Service area map</h2>
              <p className="mx-auto mt-3 max-w-xl leading-7 text-charcoal/60">We cover {company.serviceAreas.slice(0, -1).join(", ")} and {company.serviceAreas.slice(-1)}. Drop a map embed in here when you are ready.</p>
            </div>
          </div>
        </div>
      </section>

      <CTASection title="Prefer to start with photos?" text="Send a few garden photos with rough measurements and Eltoromia can advise what information is needed before a site survey." />
    </>
  );
}
