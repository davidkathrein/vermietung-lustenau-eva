export function SectionIntro({ block }: { block: { eyebrow?: string | null; headline: string; intro?: string | null } }) {
  return <div className="site-section-intro">
    {block.eyebrow && <p className="site-eyebrow">{block.eyebrow}</p>}
    <h2>{block.headline}</h2>
    {block.intro && <p className="site-section-intro__text">{block.intro}</p>}
  </div>
}
