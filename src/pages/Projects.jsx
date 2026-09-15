import { useMemo } from "react";
import projects from "../data/projects.json";
import SEO from "../components/ui/SEO.jsx";
import PageHero from "../components/sections/PageHero.jsx";
import ProjectsGrid from "../components/sections/ProjectsGrid.jsx";
import BeforeAfter from "../components/sections/BeforeAfter.jsx";
import CTASection from "../components/sections/CTASection.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";

export default function Projects() {
  const photoCount = useMemo(
    () => projects.items.reduce((total, project) => total + project.gallery.length, 0),
    []
  );
  const comparisons = useMemo(
    () => projects.items.filter((project) => project.beforeImage && project.afterImage),
    []
  );

  return (
    <>
      <SEO
        title="Our Work | Eltoromia Landscaping, Esher"
        description="Real Eltoromia projects across Surrey and South West London: driveways, patios, paths, decking, fencing, brickwork, artificial grass and full garden transformations, with before and after photos."
        image="/images/site/projectsHero.webp"
      />
      <PageHero
        compact
        eyebrow="Our work"
        title="Every photo here is a garden we built."
        text={`${projects.items.length} projects and ${photoCount} photographs taken on our own sites, from the first dig through to handover. No stock imagery.`}
        image="/images/site/projectsHero.webp"
      />

      <section className="section-padding">
        <div className="container-page">
          <SectionHeader
            eyebrow="Gallery"
            title="Filter by the kind of work you are planning."
            text={`Open any project to see the full set of photographs. ${comparisons.length} of them include before and after shots of the same garden.`}
          />
          <div className="mt-10">
            <ProjectsGrid projects={projects.items} categories={projects.categories} masonry />
          </div>
        </div>
      </section>

      <BeforeAfter project={comparisons[0]} eyebrow="Drag to compare" />

      <CTASection
        title="Want your garden in here?"
        text="Send a few photos and a rough idea of what you want it to do. We will come out, look at the ground and give you a straight price."
      />
    </>
  );
}
