export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="hero-cluster">

        {/* Left column */}
        <div className="hero-left">
          <div className="bp-node" style={{ animationDelay: "0.1s" }}>
            <div className="node-header">
              <div className="icon event">◆</div>
              Event Begin Play
              <span className="subtitle">Actor</span>
            </div>
            <div className="node-body">
              <div className="node-row output">
                Exec <div className="pin exec filled"><div className="pin-glow" /></div>
              </div>
            </div>
          </div>

          <div className="bp-node" style={{ animationDelay: "0.3s" }}>
            <div className="node-header">
              <div className="icon var">≡</div>
              Get Portfolio Data
              <span className="subtitle">Variable</span>
            </div>
            <div className="node-body">
              <div className="node-row output">
                Projects <div className="pin object filled"><div className="pin-glow" /></div>
              </div>
              <div className="node-row output">
                Skills <div className="pin float filled"><div className="pin-glow" /></div>
              </div>
              <div className="node-row output">
                3D Models <div className="pin string filled"><div className="pin-glow" /></div>
              </div>
            </div>
          </div>
        </div>

        {/* Center column */}
        <div className="hero-center">
          <div className="bp-node hero-title-node" style={{ animationDelay: "0.2s" }}>
            <div className="node-header">
              <div className="icon func">ƒ</div>
              Initialize Portfolio
              <span className="subtitle">Blueprint</span>
            </div>
            <div className="node-body">
              <div className="node-row">
                <div className="pin exec filled"><div className="pin-glow" /></div> Exec
              </div>
              <div className="node-divider" />
              <div style={{ padding: "12px 18px", textAlign: "center" }}>
                <div className="hero-name">KIMANI<br />McLEISH</div>
                <div className="hero-tagline">
                  Software Engineer · <span>3D Artist</span> · Creative Developer
                </div>
              </div>
              <div className="node-divider" />
              <div className="node-row output">
                Return Value <div className="pin bool filled"><div className="pin-glow" /></div>
              </div>
            </div>
            <div style={{ textAlign: "center", padding: "0 18px 14px" }}>
              <a href="#projects" className="exec-btn">
                <div className="exec-arrow" />
                Execute
              </a>
            </div>
          </div>

          {/* Mini 3D preview node */}
          <div className="bp-node" style={{ animationDelay: "0.45s", minWidth: 200, maxWidth: 200 }}>
            <div className="node-header">
              <div className="icon pure">◎</div>
              Preview
            </div>
            <div className="node-preview">
              <div className="preview-box">
                <div className="cube-scene">
                  <div className="cube">
                    <div className="cube-face front">▲</div>
                    <div className="cube-face back">◆</div>
                    <div className="cube-face right">●</div>
                    <div className="cube-face left">■</div>
                    <div className="cube-face top">✦</div>
                    <div className="cube-face bottom">✧</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right column */}
        <div className="hero-right">
          <div className="bp-node" style={{ animationDelay: "0.35s" }}>
            <div className="node-header">
              <div className="icon macro">⚡</div>
              Set Display Mode
            </div>
            <div className="node-body">
              <div className="node-row">
                <div className="pin exec filled" /> Exec
              </div>
              <div className="node-row">
                <div className="pin object filled" /> Target
              </div>
              <div className="node-row">
                <div className="pin bool" /> Dark Mode ✓
              </div>
              <div className="node-divider" />
              <div className="node-row output">
                Rendered <div className="pin exec filled" />
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Floating comments */}
      <div className="bp-comment" style={{ top: "12%", left: "5%" }}>
        TODO: Add more projects to the graph
      </div>
      <div className="bp-comment" style={{ bottom: "18%", right: "4%" }}>
        This is where the magic happens ✨
      </div>

      <div className="scroll-hint">
        <span>Scroll to explore</span>
        <div className="scroll-arrow" />
      </div>
    </section>
  );
}
