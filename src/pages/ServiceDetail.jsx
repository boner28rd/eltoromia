import { Link, useParams } from "react-router-dom";
import { Check, ChevronRight } from "lucide-react";
import faqs from "../data/faq.json";
import services from "../data/services.json";
import projectsData from "../data/projects.json";
import { getProjectsForService, getRelatedServices, getService } from "../utils/content.js";
import SEO from "../components/ui/SEO.jsx";
import PageHero from "../components/sections/PageHero.jsx";
import CTASection from "../components/sections/CTASection.jsx";
import FAQAccordion from "../components/sections/FAQAccordion.jsx";
import ProjectsGrid from "../components/sections/ProjectsGrid.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import NotFound from "./NotFound.jsx";

export default function ServiceDetail() {
  const { slug } = useParams();
  const service = getService(slug);
  if (!service) return <NotFound />;

  const exampleProjects = getProjectsForService(slug);
  const fallbackProjects = projectsData.items.slice(0, 3);
  const related = getRelatedServices(service);
  const serviceFaqs = [...service.faq, ...faqs.slice(0, 3)];

  return (
    <>
      <SEO title={`${service.title} | Eltoromia Landscaping Services`} description={service.shortDescription} image={service.heroImage} />
      <PageHero compact eyebrow="Service detail" title={service.title} text={service.overview} image={service.heroImage} primary={{ label: "Request a quote", to: "/contact" }} secondary={{ label: "View projects", to: "/projects" }} />

      <section className="section-padding bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="eyebrow">Overview</p>
            <h2 className="heading-lg mt-4">{service.title} built with proper preparation.</h2>
            <p className="body-lead mt-5">{service.overview}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {service.benefits.map((benefit) => (
              <div key={benefit} className="rounded-lg bg-paper p-5 ring-1 ring-charcoal/10">
                <Check className="h-5 w-5 text-forest-700" />
                <p className="mt-3 font-bold leading-7 text-charcoal/76">{benefit}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeader eyebrow="Features" title={`What our ${service.navigationLabel.toLowerCase()} service can include.`} />
            <ul className="mt-8 grid gap-4">
              {service.features.map((feature) => (
                <li key={feature} className="flex items-center gap-3 rounded-lg bg-white p-4 font-bold text-charcoal/75 shadow-sm ring-1 ring-charcoal/10">
                  <ChevronRight className="h-5 w-5 text-clay" /> {feature}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <SectionHeader eyebrow="Process" title="A practical sequence for a reliable result." />
            <div className="mt-8 grid gap-4">
              {service.process.map((step, index) => (
                <div key={step} className="rounded-lg bg-forest-900 p-5 text-white">
                  <span className="text-sm font-extrabold uppercase tracking-[0.18em] text-wheat">Step {index + 1}</span>
                  <p className="mt-2 text-xl font-bold">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader eyebrow="Example projects" title={`Relevant ${service.navigationLabel.toLowerCase()} and outdoor construction work.`} />
          <div className="mt-10">
            <ProjectsGrid projects={exampleProjects.length ? exampleProjects : fallbackProjects} />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="Service FAQs" title={`Questions about ${service.navigationLabel.toLowerCase()}.`} />
          <FAQAccordion items={serviceFaqs} />
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader eyebrow="Related services" title="Services that often work well together." />
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.slug} to={`/services/${item.slug}`} className="rounded-lg border border-charcoal/10 bg-paper p-5 transition hover:-translate-y-1 hover:border-forest-700 hover:bg-white">
                <h3 className="font-display text-xl font-extrabold">{item.title}</h3>
                <p className="mt-2 leading-7 text-charcoal/60">{item.shortDescription}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <CTASection title={`Plan your ${service.navigationLabel.toLowerCase()} project with Eltoromia.`} text="Book a consultation for a clear scope, realistic schedule and material advice before work begins." />
    </>
  );
}
