"use client";

import { useState } from "react";

type ModelKey = "sphere" | "pyramid" | "torus";

interface ModelInfo {
  poly: string;
  tex: string;
  fmt: string;
  status: string;
}

const modelData: Record<ModelKey, ModelInfo> = {
  sphere:  { poly: "12,400", tex: "4K PBR",      fmt: "FBX / GLTF", status: "Game-Ready ✓" },
  pyramid: { poly: "8,200",  tex: "2K Modular",  fmt: "FBX / OBJ",  status: "In Progress ⟳" },
  torus:   { poly: "3,100",  tex: "2K Stylized",  fmt: "GLTF / USD", status: "Game-Ready ✓" },
};

const tabs = ["All Models", "Characters", "Environments", "Props"];

export default function ModelsViewport() {
  const [activeModel, setActiveModel] = useState<ModelKey>("sphere");
  const [activeTab, setActiveTab] = useState(0);

  const detail = modelData[activeModel];

  return (
    <section className="section" id="models">
      <div className="section-header">
        <div className="sh-icon pure">◎</div>
        Render 3D Viewport
        <span className="comment">{"// models & assets"}</span>
      </div>

      <div className="models-viewport">
        <div className="viewport-toolbar">
          {tabs.map((tab, i) => (
            <div
              key={tab}
              className={`viewport-tab${activeTab === i ? " active" : ""}`}
              onClick={() => setActiveTab(i)}
            >
              {tab}
            </div>
          ))}
          <span className="viewport-info">Viewport 1 — Perspective — Lit</span>
        </div>

        <div className="viewport-canvas">
          <div className="model-carousel">

            {/* Sphere */}
            <div
              className={`model-card${activeModel === "sphere" ? " active" : ""}`}
              onClick={() => setActiveModel("sphere")}
            >
              <div className="model-render">
                <div className="wire-sphere" />
                <div
                  className="wire-sphere"
                  style={{
                    width: 80, height: 80,
                    borderColor: "rgba(78,203,255,0.3)",
                    animationDirection: "reverse",
                    animationDuration: "4s",
                  }}
                />
              </div>
              <div className="model-name" style={{ color: "var(--accent-glow)" }}>Character Model</div>
              <div className="model-meta">12.4k tris · PBR</div>
            </div>

            {/* Pyramid */}
            <div
              className={`model-card${activeModel === "pyramid" ? " active" : ""}`}
              onClick={() => setActiveModel("pyramid")}
            >
              <div className="model-render">
                <div className="shape-scene">
                  <div className="wire-pyramid">
                    <div className="pyramid-face" />
                    <div className="pyramid-face" />
                    <div className="pyramid-face" />
                    <div className="pyramid-face" />
                  </div>
                </div>
              </div>
              <div className="model-name" style={{ color: "var(--accent-playrix)" }}>Environment Kit</div>
              <div className="model-meta">8.2k tris · Modular</div>
            </div>

            {/* Torus */}
            <div
              className={`model-card${activeModel === "torus" ? " active" : ""}`}
              onClick={() => setActiveModel("torus")}
            >
              <div className="model-render">
                <div className="wire-torus">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="ring" />
                  ))}
                </div>
              </div>
              <div className="model-name" style={{ color: "var(--accent-green)" }}>Prop Collection</div>
              <div className="model-meta">3.1k tris · Game-ready</div>
            </div>

          </div>
        </div>

        <div className="model-details-panel">
          <div className="detail-node">
            <div className="dl">Polycount</div>
            <div className="dv blue">{detail.poly}</div>
          </div>
          <div className="detail-node">
            <div className="dl">Textures</div>
            <div className="dv green">{detail.tex}</div>
          </div>
          <div className="detail-node">
            <div className="dl">Format</div>
            <div className="dv orange">{detail.fmt}</div>
          </div>
          <div className="detail-node">
            <div className="dl">Status</div>
            <div className="dv blue">{detail.status}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
