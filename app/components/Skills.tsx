"use client";

import { useEffect, useRef } from "react";

interface Skill {
  icon: string;
  iconType: string;
  name: string;
  pinType: string;
  barType?: string;
  width: number;
}

const skills: Skill[] = [
  { icon: "ƒ", iconType: "func",  name: "React / React Native",    pinType: "float",  width: 92 },
  { icon: "◎", iconType: "pure",  name: "Node.js / Express",        pinType: "float",  width: 88 },
  { icon: "⚡", iconType: "macro", name: "TypeScript",               pinType: "object", barType: "orange", width: 85 },
  { icon: "≡", iconType: "var",   name: "Blender / 3D",             pinType: "string", barType: "pink",   width: 78 },
  { icon: "◆", iconType: "event", name: "UI/UX Design",             pinType: "bool",   width: 90 },
  { icon: "ƒ", iconType: "func",  name: "Supabase / PostgreSQL",    pinType: "float",  width: 84 },
  { icon: "◎", iconType: "pure",  name: "AWS / Cloud",              pinType: "object", barType: "orange", width: 75 },
  { icon: "⚡", iconType: "macro", name: "Angular / Ionic",          pinType: "color",  barType: "pink",   width: 80 },
];

export default function Skills() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll<HTMLElement>(".skill-bar").forEach((bar) => {
              bar.style.width = bar.dataset.width + "%";
            });
          }
        });
      },
      { threshold: 0.3 }
    );

    container.querySelectorAll(".skill-node").forEach((node) => observer.observe(node));

    return () => observer.disconnect();
  }, []);

  return (
    <section className="section" id="skills">
      <div className="section-header">
        <div className="sh-icon func">ƒ</div>
        Get Skill Tree
        <span className="comment">{"// proficiencies"}</span>
      </div>

      <div className="skills-flow" ref={containerRef}>
        {skills.map((s) => (
          <div key={s.name} className="bp-node skill-node">
            <div className="node-header">
              <div className={`icon ${s.iconType}`}>{s.icon}</div>
              {s.name}
            </div>
            <div className="node-body">
              <div className="node-row">
                <div className={`pin ${s.pinType} filled`} /> Proficiency
              </div>
              <div className="skill-bar-bg">
                <div
                  className={`skill-bar${s.barType ? ` ${s.barType}` : ""}`}
                  data-width={s.width}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
