import { Star } from "lucide-react";
import reviews from "../data/reviews.json";
import company from "../data/company.json";
import SEO from "../components/ui/SEO.jsx";
import PageHero from "../components/sections/PageHero.jsx";
import CTASection from "../components/sections/CTASection.jsx";
import ReviewsCarousel from "../components/sections/ReviewsCarousel.jsx";
import SectionHeader from "../components/ui/SectionHeader.jsx";

export default function Reviews() {
  return (
    <>
      <SEO title="Reviews | Eltoromia Landscaping" description="Read reviews for Eltoromia landscaping, patio, driveway, fencing and garden transformation projects." image={company.hero.image} />
      <PageHero compact eyebrow="Reviews" title="4.8 out of 5, across 33 reviews." text="Every review below is a real one from our Bark profile. Most of them mention the same things: a tidy site, a fair price, and being told what was going to happen before it happened." image="/images/site/reviewsHero.webp" />
      <section className="section-padding">
        <div className="container-page grid gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <SectionHeader eyebrow="Featured reviews" title="What people say once the garden is finished." text="Reviews are shown as they were written, alongside the service they were left against." />
          <ReviewsCarousel reviews={reviews.filter((review) => review.featured)} />
        </div>
      </section>
      <section className="section-padding bg-white">
        <div className="container-page">
          <SectionHeader align="center" eyebrow="All reviews" title={`All ${reviews.length} reviews.`} />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {reviews.map((review, index) => (
              // Name + date is not unique (two reviews share "Lintie Shirley, May 2023"),
              // so the position in the source list is the stable identifier.
              <article key={`${review.name}-${review.date}-${index}`} className="rounded-lg bg-paper p-6 shadow-sm ring-1 ring-charcoal/10">
                <div className="flex gap-1 text-clay">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} className={`h-4 w-4 ${index < review.rating ? "fill-current" : ""}`} />
                  ))}
                </div>
                <p className="mt-5 text-lg font-semibold leading-8 text-charcoal/80">"{review.text}"</p>
                <div className="mt-6 border-t border-charcoal/10 pt-5">
                  <h3 className="font-display text-xl font-extrabold">{review.name}</h3>
                  <p className="mt-1 text-sm font-bold text-charcoal/60">{[review.location, review.service].filter(Boolean).join(" - ")}</p>
                  <p className="mt-1 text-sm text-charcoal/50">{review.date}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CTASection title="Want the same from your garden?" text="Send a few photos and a rough idea of what you want. We will come out and give you a straight price." />
    </>
  );
}
