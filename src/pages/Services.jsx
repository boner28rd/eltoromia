import company from "../data/company.json";
import services from "../data/services.json";
import SEO from "../components/ui/SEO.jsx";
import PageHero from "../components/sections/PageHero.jsx";
import ServicesGrid from "../components/sections/ServicesGrid.jsx";
import CTASection from "../components/sections/CTASection.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";

export default function Services() {
  return (
    <>
      <SEO title="Landscaping Services | Patios, Paving, Fencing & Driveways | Eltoromia" description="Explore Eltoromia's landscaping services including patios, paving, fencing, decking, brickwork, driveways and full garden transformations." image={services[0].heroImage} />
      <PageHero compact eyebrow="Services" title="Everything from a dropped kerb to a whole garden." text="Twelve services, all of them built by the same crew. Most jobs start with the same conversation about access, levels and drainage." image="/images/site/servicesHero.webp" />
      <section className="section-padding">
        <div className="container-page">
          <SectionHeader eyebrow="Service menu" title="Choose a focused service or combine them into a full garden plan." text={company.description} />
          <div className="mt-10">
            <ServicesGrid services={services} />
          </div>
        </div>
      </section>
      <CTASection title="Need help deciding what your garden needs first?" text="Share photos and rough goals. Eltoromia can recommend a sensible first phase or a complete outdoor construction plan." />
    </>
  );
}
