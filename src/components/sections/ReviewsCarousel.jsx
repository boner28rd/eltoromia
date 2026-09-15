import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

export default function ReviewsCarousel({ reviews }) {
  const [active, setActive] = useState(0);
  const review = reviews[active];

  useEffect(() => {
    const timer = window.setInterval(() => setActive((index) => (index + 1) % reviews.length), 5500);
    return () => window.clearInterval(timer);
  }, [reviews.length]);

  return (
    <div className="rounded-lg bg-forest-900 p-6 text-white shadow-premium sm:p-8 lg:p-10">
      <div className="flex gap-1 text-wheat" aria-label={`${review.rating} star review`}>
        {Array.from({ length: 5 }).map((_, index) => (
          <Star key={index} className={`h-5 w-5 ${index < review.rating ? "fill-current" : ""}`} />
        ))}
      </div>
      <blockquote className="mt-7 font-display text-2xl font-bold leading-snug sm:text-3xl">"{review.text}"</blockquote>
      <div className="mt-8 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-lg font-extrabold">{review.name}</p>
          <p className="mt-1 text-white/60">{review.location} - {review.service}</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setActive((index) => (index - 1 + reviews.length) % reviews.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 hover:bg-white hover:text-forest-900" aria-label="Previous review">
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button onClick={() => setActive((index) => (index + 1) % reviews.length)} className="grid h-11 w-11 place-items-center rounded-full border border-white/20 hover:bg-white hover:text-forest-900" aria-label="Next review">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
