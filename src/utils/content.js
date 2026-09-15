import services from "../data/services.json";
import projects from "../data/projects.json";
import reviews from "../data/reviews.json";

export const getService = (slug) => services.find((service) => service.slug === slug);

export const getRelatedServices = (service) =>
  (service?.related || []).map(getService).filter(Boolean);

// Projects tag themselves with a service slug. Fall back to a loose word match on
// tags and category so a service still shows relevant work when nothing is tagged
// to it directly (for example clearance that ran straight into a build).
export const getProjectsForService = (slug) => {
  const direct = projects.items.filter((project) => project.serviceSlug === slug);
  if (direct.length) return direct;

  const words = slug.split("-").filter((word) => word.length > 3);
  return projects.items.filter((project) => {
    const haystack = [project.category, ...project.tags].join(" ").toLowerCase();
    return words.some((word) => haystack.includes(word));
  });
};

export const getFeaturedProjects = () => projects.items.filter((project) => project.featured);

export const getComparisonProjects = () =>
  projects.items.filter((project) => project.beforeImage && project.afterImage);

export const getFeaturedReviews = () => reviews.filter((review) => review.featured);
