import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import Icon from "../ui/Icon.jsx";
import Reveal from "../ui/Reveal.jsx";

export function ServiceCard({ service, index = 0 }) {
  return (
    <Reveal delay={index * 70} className="h-full">
      <Link to={`/services/${service.slug}`} className="group flex h-full flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-charcoal/10 transition duration-300 hover:-translate-y-1 hover:shadow-premium">
        <div className="relative h-56 overflow-hidden">
          <img src={service.image} alt="" className="h-full w-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-forest-900/70 to-transparent" />
          <div className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-full bg-white text-forest-800">
            <Icon name={service.icon} />
          </div>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-2xl font-extrabold text-charcoal">{service.title}</h3>
          <p className="mt-3 flex-1 leading-7 text-charcoal/70">{service.shortDescription}</p>
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-extrabold text-forest-700">
            Explore service <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
          </span>
        </div>
      </Link>
    </Reveal>
  );
}

export default function ServicesGrid({ services, limit }) {
  const visibleServices = limit ? services.slice(0, limit) : services;
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {visibleServices.map((service, index) => (
        <ServiceCard key={service.slug} service={service} index={index} />
      ))}
    </div>
  );
}
