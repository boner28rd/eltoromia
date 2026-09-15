import faqs from "../data/faq.json";
import company from "../data/company.json";
import SEO from "../components/ui/SEO.jsx";
import PageHero from "../components/sections/PageHero.jsx";
import FAQAccordion from "../components/sections/FAQAccordion.jsx";
import CTASection from "../components/sections/CTASection.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";

export default function FAQs() {
  const categories = [...new Set(faqs.map((item) => item.category))];

  return (
    <>
      <SEO title="FAQs | Eltoromia Landscaping" description="Answers to common landscaping project questions about design, drainage, paving, permissions, waste, phasing and aftercare." image={company.hero.image} />
      <PageHero compact eyebrow="FAQs" title="Clear answers before the first shovel goes in." text="Practical information about planning, materials, construction, site care and aftercare for landscaping and outdoor construction projects." image="/images/site/faqHero.webp" />
      <section className="section-padding">
        <div className="container-page grid gap-10 lg:grid-cols-[0.72fr_1.28fr]">
          <aside>
            <SectionHeader eyebrow="Categories" title="Project questions, grouped simply." />
            <div className="mt-7 flex flex-wrap gap-3">
              {categories.map((category) => (
                <span key={category} className="rounded-full bg-white px-4 py-2 text-sm font-extrabold text-charcoal/60 shadow-sm ring-1 ring-charcoal/10">{category}</span>
              ))}
            </div>
          </aside>
          <FAQAccordion items={faqs} />
        </div>
      </section>
      <CTASection title="Still weighing up options for your garden?" text="Send a short brief and Eltoromia can advise whether design, phased works or a focused service is the right next step." />
    </>
  );
}
