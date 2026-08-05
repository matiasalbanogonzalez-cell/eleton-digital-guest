export default function SectionTitle({ eyebrow, title, subtitle }) {
  return (
    <div className="section-title">
      {eyebrow && <div className="section-title-eyebrow font-mono">{eyebrow}</div>}
      <h2 className="section-title-heading font-display">{title}</h2>
      {subtitle && <p className="section-title-sub">{subtitle}</p>}
    </div>
  );
}
