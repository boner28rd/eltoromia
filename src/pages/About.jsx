import { CheckCircle2 } from "lucide-react";
import company from "../data/company.json";
import SEO from "../components/ui/SEO.jsx";
import PageHero from "../components/sections/PageHero.jsx";
import StatsBand from "../components/sections/StatsBand.jsx";
import ProcessTimeline from "../components/sections/ProcessTimeline.jsx";
import CTASection from "../components/sections/CTASection.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";
import Reveal from "../components/ui/Reveal.jsx";
import Icon from "../components/ui/Icon.jsx";

export default function About() {
  return (
    <>
      <SEO title="About Eltoromia | Landscaping Craft, Process & Team" description="Learn about UK landscaping company Eltoromia, its story, team, values and outdoor construction process." image="/images/site/aboutHero.webp" />
      <PageHero compact eyebrow="About Eltoromia" title="Twenty years of doing the groundwork properly." text="Eltoromia is a small Surrey crew that has been building driveways, patios, brickwork, decking and fencing for twenty years." image={company.story.image} />

      <section className="section-padding bg-white">
        <div className="container-page grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <Reveal>
            <p className="eyebrow">Company story</p>
            <h2 className="heading-lg mt-4">{company.story.title}</h2>
            <p className="body-lead mt-5">{company.story.body}</p>
            <div className="mt-8 rounded-lg bg-forest-900 p-6 text-white">
              <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-wheat">Mission</p>
              <p className="mt-3 text-xl font-bold leading-8">{company.mission}</p>
            </div>
          </Reveal>
          <Reveal delay={100}>
            <img src="/images/site/aboutHero.webp" alt="A finished Eltoromia lawn and porcelain terrace" className="aspect-[5/4] rounded-lg object-cover shadow-premium" />
          </Reveal>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <SectionHeader align="center" eyebrow="Values" title="The principles behind every Eltoromia build." />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {company.values.map((value) => (
              <Reveal key={value.title} className="rounded-lg bg-white p-7 shadow-sm ring-1 ring-charcoal/10">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-forest-50 text-forest-700">
                  <Icon name={value.icon} className="h-6 w-6" />
                </div>
                <h3 className="mt-6 font-display text-2xl font-extrabold">{value.title}</h3>
                <p className="mt-3 leading-7 text-charcoal/70">{value.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <StatsBand />

      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader eyebrow="Team" title="The person who quotes your job is the person who builds it." text="Eltoromia runs as a hands-on crew of two to ten depending on the job, rather than a chain of subcontractors." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {company.team.map((person) => (
              <article key={person.name} className="overflow-hidden rounded-lg bg-paper shadow-sm ring-1 ring-charcoal/10">
                <img src={person.image} alt="" className="h-72 w-full object-cover" />
                <div className="p-6">
                  <h3 className="font-display text-2xl font-extrabold">{person.name}</h3>
                  <p className="mt-1 text-sm font-extrabold uppercase tracking-[0.16em] text-clay">{person.role}</p>
                  <p className="mt-4 leading-7 text-charcoal/60">{person.bio}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-page">
          <SectionHeader align="center" eyebrow="Working process" title="Measured planning, tidy sites and a structured handover." />
          <div className="mt-10">
            <ProcessTimeline items={company.process} />
          </div>
          <div className="mt-10 grid gap-3 rounded-lg bg-white p-6 shadow-sm ring-1 ring-charcoal/10 sm:grid-cols-2 lg:grid-cols-3">
            {company.trustIndicators.map((item) => (
              <span key={item} className="flex gap-3 font-semibold text-charcoal/70">
                <CheckCircle2 className="mt-1 h-5 w-5 shrink-0 text-forest-700" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <CTASection />
    </>
  );
}
