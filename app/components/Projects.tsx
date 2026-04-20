interface Project {
  icon: string;
  iconType: string;
  name: string;
  subtitle: string;
  desc: string;
  tags: { label: string; color?: string }[];
}

const projects: Project[] = [
  {
    icon: "ƒ", iconType: "func", name: "Traverse", subtitle: "Mobile App",
    desc: "Community map app — discover and share local spots, events, and hidden gems with geospatial intelligence.",
    tags: [{ label: "React Native" }, { label: "Supabase", color: "green" }, { label: "Mapbox", color: "orange" }, { label: "PostGIS" }],
  },
  {
    icon: "◎", iconType: "pure", name: "CardioScore", subtitle: "Health Tech",
    desc: "Cardiac health tracker with Apple HealthKit integration, activity rings, trend analysis, and personalized health scoring.",
    tags: [{ label: "React Native" }, { label: "HealthKit", color: "pink" }, { label: "Node.js", color: "green" }, { label: "AWS EC2", color: "orange" }],
  },
  {
    icon: "⚡", iconType: "macro", name: "Swifpay", subtitle: "FinTech",
    desc: "Payment platform with WhatsApp AI bot for natural language transactions. Angular web + Ionic mobile with enterprise security.",
    tags: [{ label: "Angular", color: "orange" }, { label: "OpenAI" }, { label: "Ionic", color: "green" }, { label: "WhatsApp", color: "pink" }],
  },
  {
    icon: "≡", iconType: "var", name: "Waddle Together", subtitle: "Couples App",
    desc: "A personal couples app for shared experiences, memories, and connection — built with love and code.",
    tags: [{ label: "React Native" }, { label: "Supabase", color: "green" }, { label: "Expo", color: "pink" }],
  },
  {
    icon: "ƒ", iconType: "func", name: "Erato", subtitle: "Marketplace",
    desc: "Art commission marketplace — Pinterest meets Tinder for discovering and commissioning custom artwork.",
    tags: [{ label: "React Native" }, { label: "Supabase", color: "green" }, { label: "UI/UX", color: "orange" }],
  },
  {
    icon: "◆", iconType: "event", name: "InsureLearn", subtitle: "EdTech",
    desc: "Gamified health insurance literacy platform for university students. Making insurance fun — yes, really.",
    tags: [{ label: "Gamification", color: "pink" }, { label: "Mobile" }, { label: "Research", color: "green" }],
  },
];

export default function Projects() {
  return (
    <section className="section" id="projects">
      <div className="section-header">
        <div className="sh-icon event">◆</div>
        On Load Projects
        <span className="comment">{"// featured work"}</span>
      </div>

      <div className="projects-grid">
        {projects.map((p) => (
          <div key={p.name} className="bp-node project-node">
            <div className="node-header">
              <div className={`icon ${p.iconType}`}>{p.icon}</div>
              {p.name}
              <span className="subtitle">{p.subtitle}</span>
            </div>
            <div className="node-body">
              <p className="project-desc">{p.desc}</p>
              <div className="project-tags">
                {p.tags.map((t) => (
                  <span key={t.label} className={`project-tag${t.color ? ` ${t.color}` : ""}`}>
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
