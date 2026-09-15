import ButtonLink from "../ui/ButtonLink.jsx";
import { asset } from "../../utils/asset.js";

export default function PageHero({ eyebrow, title, text, image, primary, secondary, compact = false }) {
  return (
    <section className={`relative isolate overflow-hidden ${compact ? "min-h-[460px] lg:min-h-[520px]" : "min-h-[680px]"}`}>
      <img src={asset(image)} alt="" className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="image-overlay absolute inset-0 -z-10" />
      <div className={`container-page flex ${compact ? "min-h-[460px] pt-28 lg:min-h-[520px] lg:pt-44" : "min-h-[680px] pt-36"} items-center pb-16`}>
        <div className="max-w-3xl text-white">
          {eyebrow && <p className="mb-5 text-xs font-extrabold uppercase tracking-[0.24em] text-wheat">{eyebrow}</p>}
          <h1 className="font-display text-4xl font-extrabold leading-[1.02] sm:text-6xl lg:text-7xl">{title}</h1>
          {text && <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">{text}</p>}
          {(primary || secondary) && (
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              {primary && <ButtonLink to={primary.to} variant="light">{primary.label}</ButtonLink>}
              {secondary && <ButtonLink to={secondary.to} variant="outline">{secondary.label}</ButtonLink>}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
