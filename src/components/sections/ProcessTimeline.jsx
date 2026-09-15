export default function ProcessTimeline({ items }) {
  return (
    <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div key={item.step} className="rounded-lg bg-white p-6 shadow-sm ring-1 ring-charcoal/10">
          <span className="font-display text-4xl font-extrabold text-clay">{item.step}</span>
          <h3 className="mt-5 font-display text-xl font-extrabold">{item.title}</h3>
          <p className="mt-3 leading-7 text-charcoal/70">{item.text}</p>
        </div>
      ))}
    </div>
  );
}
