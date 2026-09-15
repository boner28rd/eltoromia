import { useEffect } from "react";
import company from "../../data/company.json";

function upsertMeta(selector, attributes) {
  let element = document.head.querySelector(selector);
  if (!element) {
    element = document.createElement("meta");
    document.head.appendChild(element);
  }
  Object.entries(attributes).forEach(([key, value]) => element.setAttribute(key, value));
}

export default function SEO({ title, description, image }) {
  const pageTitle = title || company.seo.title;
  const pageDescription = description || company.seo.description;
  const ogImage = image || company.hero.image;

  useEffect(() => {
    document.title = pageTitle;
    upsertMeta('meta[name="description"]', { name: "description", content: pageDescription });
    upsertMeta('meta[property="og:title"]', { property: "og:title", content: pageTitle });
    upsertMeta('meta[property="og:description"]', { property: "og:description", content: pageDescription });
    upsertMeta('meta[property="og:type"]', { property: "og:type", content: "website" });
    upsertMeta('meta[property="og:image"]', { property: "og:image", content: ogImage });
    upsertMeta('meta[name="twitter:card"]', { name: "twitter:card", content: "summary_large_image" });
  }, [pageTitle, pageDescription, ogImage]);

  return null;
}
