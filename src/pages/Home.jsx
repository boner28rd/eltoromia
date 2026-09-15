import company from "../data/company.json";
import services from "../data/services.json";
import faqs from "../data/faq.json";
import projects from "../data/projects.json";
import { getFeaturedProjects, getFeaturedReviews } from "../utils/content.js";
import SEO from "../components/ui/SEO.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import ButtonLink from "../components/ui/ButtonLink.jsx";
import PageHero from "../components/sections/PageHero.jsx";
import ServicesGrid from "../components/sections/ServicesGrid.jsx";
import ProjectsGrid from "../components/sections/ProjectsGrid.jsx";
import BeforeAfter from "../components/sections/BeforeAfter.jsx";
import StatsBand from "../components/sections/StatsBand.jsx";
import ReviewsCarousel from "../components/sections/ReviewsCarousel.jsx";
import FAQAccordion from "../components/sections/FAQAccordion.jsx";
import ProcessTimeline from "../components/sections/ProcessTimeline.jsx";
import CTASection from "../components/sections/CTASection.jsx";
import TrustBar from "../components/sections/TrustBar.jsx";
import { Check } from "lucide-react";
import { asset } from "../utils/asset.js";

export default function Home() {
  const featuredProjects = getFeaturedProjects().slice(0, 6);
  const comparison = projects.items.find((project) => project.beforeImage && project.afterImage);
  const featuredReviews = getFeaturedReviews();

  return (
    <>
      <SEO title={company.seo.title} description={company.seo.description} image={company.hero.image} />
      <PageHero
        eyebrow={company.hero.eyebrow}
        title={company.hero.title}
        text={company.hero.intro}
        image={company.hero.image}
        primary={{ label: "Plan your project", to: "/contact" }}
        secondary={{ label: "View our work", to: "/projects" }}
      />
      <TrustBar />

      <section className="section-padding">
        <div className="container-page">
          <SectionHeader eyebrow="What we build" title="Driveways, patios, fencing, turf and everything underneath them." text="Every job starts with the same things: access, levels, drainage and a base built to carry what goes on top of it." />
          <div className="mt-10">
            <ServicesGrid services={services} limit={6} />
          </div>
          <div className="mt-10 text-center">
            <ButtonLink to="/services" variant="ghost">View all services</ButtonLink>
          </div>
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <img src={asset(company.story.image)} alt="" className="aspect-[4/5] w-full rounded-lg object-cover shadow-premium" />
          </Reveal>
          <Reveal delay={120}>
            <p className="eyebrow">{company.story.eyebrow}</p>
            <h2 className="heading-lg mt-4">{company.story.title}</h2>
            <p className="body-lead mt-5">{company.story.body}</p>
            <ul className="mt-7 grid gap-3">
              {company.whyChoose.slice(0, 4).map((item) => (
                <li key={item} className="flex gap-3 font-semibold text-charcoal/75">
                  <Check className="mt-1 h-5 w-5 shrink-0 text-forest-700" /> {item}
                </li>
              ))}
            </ul>
            <ButtonLink to="/about" className="mt-8">About Eltoromia</ButtonLink>
          </Reveal>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <div className="mb-10 flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <SectionHeader eyebrow="Featured work" title="Recent gardens, driveways and terraces we have built." />
            <ButtonLink to="/projects" variant="ghost">Open gallery</ButtonLink>
          </div>
          <ProjectsGrid projects={featuredProjects} />
        </div>
      </section>

      <BeforeAfter project={comparison} eyebrow="Drag to compare" />

      <section className="section-padding bg-surface-grid bg-[length:28px_28px]">
        <div className="container-page">
          <SectionHeader align="center" eyebrow="Why choose us" title="A premium finish starts with practical decisions." text="Good gardens depend on what you see and what you never see: clear levels, correct bases, tidy detailing and sequencing that respects your home." />
          <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {company.whyChoose.map((item, index) => (
              <Reveal key={item} delay={index * 50} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-charcoal/10">
                <span className="font-display text-3xl font-extrabold text-clay">0{index + 1}</span>
                <p className="mt-4 font-bold leading-7 text-charcoal/80">{item}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StatsBand />

      <section className="section-padding">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <SectionHeader eyebrow="Client words" title="What customers actually say about the work." text="Every review below is a real one, taken from our Bark profile where we hold a 4.8 average across 33 reviews." />
          <ReviewsCarousel reviews={featuredReviews} />
        </div>
      </section>

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader align="center" eyebrow="How it works" title="A clear process from first survey to final sweep." />
          <div className="mt-10">
            <ProcessTimeline items={company.process} />
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader eyebrow="Quick answers" title="Common questions before a garden build begins." text="Get a feel for lead times, design input, drainage, materials and aftercare before booking a consultation." />
          <FAQAccordion items={faqs} limit={5} />
        </div>
      </section>

      <CTASection />
    </>
  );
}
