import SEO from "../components/ui/SEO.jsx";
import ButtonLink from "../components/ui/ButtonLink.jsx";

export default function NotFound() {
  return (
    <section className="grid min-h-screen place-items-center bg-paper px-4 pt-28 text-center">
      <SEO title="Page not found | Eltoromia" description="The requested Eltoromia website page could not be found." />
      <div className="max-w-xl">
        <p className="eyebrow">404</p>
        <h1 className="heading-lg mt-4">This garden path does not lead anywhere.</h1>
        <p className="body-lead mt-5">The page may have moved, or the service route might not exist in the current content data.</p>
        <ButtonLink to="/" className="mt-8">Return home</ButtonLink>
      </div>
    </section>
  );
}
