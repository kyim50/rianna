const links = [
  {
    icon: "GH", label: "GitHub · @kimani-mcleish", href: "#",
    style: {},
  },
  {
    icon: "LI", label: "LinkedIn · Kimani McLeish", href: "#",
    style: { background: "rgba(255,107,43,0.1)", color: "var(--accent-playrix)", borderColor: "rgba(255,107,43,0.15)" },
  },
  {
    icon: "EM", label: "Email · hello@kimani.dev", href: "mailto:hello@kimani.dev",
    style: { background: "rgba(68,255,136,0.1)", color: "var(--accent-green)", borderColor: "rgba(68,255,136,0.15)" },
  },
  {
    icon: "AT", label: "ArtStation · Portfolio", href: "#",
    style: { background: "rgba(255,102,204,0.1)", color: "var(--pin-string)", borderColor: "rgba(255,102,204,0.15)" },
  },
];

export default function Contact() {
  return (
    <section className="contact-section" id="contact">
      <div className="bp-node contact-node">
        <div className="node-header">
          <div className="icon event">◆</div>
          On Send Message
          <span className="subtitle">Event Dispatcher</span>
        </div>
        <div className="node-body">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="contact-link">
              <div className="cl-icon" style={l.style}>{l.icon}</div>
              {l.label}
            </a>
          ))}
          <div className="node-divider" />
          <div style={{ textAlign: "center", paddingTop: 6 }}>
            <a href="mailto:hello@kimani.dev" className="exec-btn">
              <div className="exec-arrow" />
              Send Message
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
