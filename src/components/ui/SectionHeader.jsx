export default function SectionHeader({ eyebrow, title, text, align = "left", className = "" }) {
  const alignment = align === "center" ? "mx-auto text-center" : "";

  return (
    <div className={`max-w-3xl ${alignment} ${className}`}>
      {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
      <h2 className="heading-lg">{title}</h2>
      {text && <p className="body-lead mt-5">{text}</p>}
    </div>
  );
}
