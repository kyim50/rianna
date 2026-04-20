"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

type DoorPuzzleEvent = {
  id: string;
  text: string;
  t: number;
};

function randomColor01() {
  // Portfolio-friendly palette: still "random floats", but avoids near-black.
  const r = Math.random();
  const g = Math.random();
  const b = Math.random();
  const min = 0.15;
  return new THREE.Color(
    Math.max(min, r),
    Math.max(min, g),
    Math.max(min, b)
  );
}

function getMaterialList(material: unknown): THREE.Material[] {
  if (!material) return [];
  if (Array.isArray(material)) return material as THREE.Material[];
  return [material as THREE.Material];
}

function trySetEmissiveOrColor(node: THREE.Object3D, color: THREE.Color) {
  let didSomething = false;
  node.traverse((child) => {
    if (!(child instanceof THREE.Mesh)) return;
    const materials = getMaterialList(child.material);
    for (const mat of materials) {
      const maybeMat = mat as unknown as {
        emissive?: THREE.Color;
        color?: THREE.Color;
      };
      if (maybeMat?.emissive?.set) {
        maybeMat.emissive.set(color);
        didSomething = true;
      } else if (maybeMat?.color?.set) {
        maybeMat.color.set(color);
        didSomething = true;
      }
    }
  });
  return didSomething;
}

function captureLightBaseline(node: THREE.Object3D): THREE.Color | null {
  // We look for the first mesh material that has emissive or color we can restore.
  let baseline: THREE.Color | null = null;
  node.traverse((child) => {
    if (!(child instanceof THREE.Mesh) || baseline) return;
    const materials = getMaterialList(child.material);
    for (const mat of materials) {
      if (!mat) continue;
      const maybeMat = mat as unknown as {
        emissive?: THREE.Color;
        color?: THREE.Color;
      };
      if (maybeMat?.emissive?.clone) {
        baseline = maybeMat.emissive.clone();
        return;
      }
      if (maybeMat?.color?.clone) {
        baseline = maybeMat.color.clone();
        return;
      }
    }
  });
  return baseline;
}

type LightTarget = {
  key: string;
  node: THREE.Object3D;
  baseline: THREE.Color | null;
};

type TriggerTarget = {
  key: string;
  node: THREE.Object3D;
  inside: boolean;
  box: THREE.Box3;
  center: THREE.Vector3;
  lights: LightTarget[];
};

type Particle = {
  mesh: THREE.Mesh;
  vel: THREE.Vector3;
  life: number;
};

export default function PlayrixDoorPuzzleDemo() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [events, setEvents] = useState<DoorPuzzleEvent[]>([]);
  const [activatedCount, setActivatedCount] = useState(0);
  const [doorUnlocked, setDoorUnlocked] = useState(false);

  const requiredTriggerKeys = useMemo<string[]>(
    () => ["A", "B", "C"],
    []
  );

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(60, 1, 0.1, 200);
    camera.position.set(0, 6, 12);
    const cameraYaw = { value: 0 }; // mutated in key handler

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(mount!.clientWidth, 420);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    mount!.appendChild(renderer.domElement);

    // Lights for general scene readability.
    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xffffff, 0.35);
    dir.position.set(3, 8, 2);
    scene.add(dir);

    // Ground plane (so the player movement feels "gamey").
    const ground = new THREE.Mesh(
      new THREE.PlaneGeometry(60, 60),
      new THREE.MeshStandardMaterial({ color: 0x0d162e, roughness: 1, metalness: 0 })
    );
    ground.rotation.x = -Math.PI / 2;
    scene.add(ground);

    // Player proxy (circle in 3D that "overlaps" trigger volumes).
    const playerRadius = 0.35;
    const player = new THREE.Mesh(
      new THREE.SphereGeometry(playerRadius, 18, 18),
      new THREE.MeshStandardMaterial({ color: 0x44ff88, roughness: 0.45, metalness: 0.2 })
    );
    player.position.set(0, playerRadius, 0);
    scene.add(player);

    // Door group + triggers/lights are loaded from glTF (if present).
    const triggers: TriggerTarget[] = [];
    const lights: LightTarget[] = [];
    const doorMeshes: THREE.Object3D[] = [];

    const doorInitial = new Map<THREE.Object3D, THREE.Quaternion>();
    const doorTarget = new Map<THREE.Object3D, THREE.Quaternion>();

    const particles: Particle[] = [];
    const particleRoot = new THREE.Group();
    scene.add(particleRoot);

    const boxScratch = new THREE.Box3();
    const expandedScratch = new THREE.Box3();
    const tmpCenter = new THREE.Vector3();

    let requiredKeys: string[] = requiredTriggerKeys.slice();
    const activated = new Set<string>();
    const insideByKey = new Map<string, boolean>();
    let doorOpening = false;
    const doorAnim = { t: 0 };
    let fallbackRoot: THREE.Group | null = null;
    let fallbackRegistered = false;
    const resetGameplayState = () => {
      activated.clear();
      insideByKey.clear();
      doorOpening = false;
      setActivatedCount(0);
      setDoorUnlocked(false);
      doorAnim.t = 0;
    };

    function pushEvent(text: string) {
      const item: DoorPuzzleEvent = {
        id: `${Date.now()}_${Math.random().toString(16).slice(2)}`,
        text,
        t: Date.now(),
      };
      setEvents((prev) => [item, ...prev].slice(0, 8));
    }

    function spawnBurst(at: THREE.Vector3) {
      const count = 18;
      for (let i = 0; i < count; i++) {
        const geom = new THREE.SphereGeometry(0.06, 10, 10);
        const mat = new THREE.MeshStandardMaterial({
          color: new THREE.Color().setHSL(Math.random(), 0.9, 0.6),
          emissive: new THREE.Color(0xffffff),
          emissiveIntensity: 0.6,
        });
        const mesh = new THREE.Mesh(geom, mat);
        mesh.position.copy(at);
        particleRoot.add(mesh);

        const dir = new THREE.Vector3(
          Math.random() - 0.5,
          Math.random() * 0.8 + 0.2,
          Math.random() - 0.5
        ).normalize();
        const speed = 1.2 + Math.random() * 1.2;
        const vel = dir.multiplyScalar(speed);

        particles.push({ mesh, vel, life: 0.55 + Math.random() * 0.25 });
      }
    }

    function applyLightColor(light: LightTarget, color: THREE.Color) {
      // Update emissive/color. Baseline is used on overlap end.
      trySetEmissiveOrColor(light.node, color);
    }

    function restoreLightColor(light: LightTarget) {
      if (!light.baseline) return;
      trySetEmissiveOrColor(light.node, light.baseline);
    }

    function computeDoorAnimationSetup() {
      // Precompute door initial/target quaternions so we can slerp.
      doorMeshes.forEach((mesh) => {
        doorInitial.set(mesh, mesh.quaternion.clone());
        const q0 = doorInitial.get(mesh) ?? new THREE.Quaternion();
        const e = new THREE.Euler().setFromQuaternion(q0, "YXZ");
        // Default: swing "open" around Y.
        e.y += Math.PI / 2;
        doorTarget.set(mesh, new THREE.Quaternion().setFromEuler(e));
      });
    }

    function unlockDoor() {
      if (doorOpening) return;
      doorOpening = true;
      setDoorUnlocked(true);
      pushEvent("Door unlocked (all required triggers activated).");
    }

    function ensureProceduralFallback() {
      if (fallbackRegistered && fallbackRoot) return;

      // If the glb is missing, we still want an interactive portfolio demo.
      // This fallback generates a door + 3 triggers and 3 "emissive lights".
      fallbackRoot = new THREE.Group();
      const root = fallbackRoot;

      const door = new THREE.Mesh(
        new THREE.BoxGeometry(1.8, 3.5, 0.1),
        new THREE.MeshStandardMaterial({
          color: 0x2a3355,
          metalness: 0.3,
          roughness: 0.25,
          emissive: 0x000000,
        })
      );
      door.name = "DOOR_MAIN";
      door.position.set(5, 1.75, -2);
      root.add(door);

      const makeTrigger = (key: string, x: number, z: number, color: number) => {
        const trigger = new THREE.Mesh(
          new THREE.BoxGeometry(2.1, 3.0, 2.1),
          new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.16 })
        );
        trigger.name = `TRIGGER_${key}`;
        trigger.position.set(x, 1.5, z);
        root.add(trigger);

        const light = new THREE.Mesh(
          new THREE.BoxGeometry(0.6, 0.6, 0.6),
          new THREE.MeshStandardMaterial({
            color: 0x111111,
            emissive: new THREE.Color(0.3, 0.7, 0.3),
            emissiveIntensity: 1.7,
            roughness: 0.3,
            metalness: 0.2,
          })
        );
        light.name = `LIGHT_${key}`;
        light.position.set(x, 2.7, z);
        root.add(light);
      };

      // Walk path: player starts near A, then moves to B and C.
      makeTrigger("A", 0, -3.5, 0x4ecbff);
      makeTrigger("B", 2.8, -3.5, 0x44ff88);
      makeTrigger("C", 2.8, 0.7, 0xff6b2b);

      scene.add(root);

      // Register from fallback.
      root.traverse((obj) => {
        const name = obj.name || "";
        if (name.startsWith("LIGHT_")) {
          const key = name.replace(/^LIGHT_/, "");
          const baseline = captureLightBaseline(obj);
          lights.push({ key, node: obj, baseline });
        }
        if (name.startsWith("DOOR_")) doorMeshes.push(obj);
        if (name.startsWith("TRIGGER_") && obj instanceof THREE.Mesh) {
          const key = name.replace(/^TRIGGER_/, "");
          triggers.push({
            key,
            node: obj,
            inside: false,
            box: new THREE.Box3(),
            center: new THREE.Vector3(),
            lights: [],
          });
        }
      });

      fallbackRegistered = true;
    }

    function registerFromLoadedModel(gltfScene: THREE.Object3D) {
      // Reset arrays (if we hot-load or retry).
      triggers.length = 0;
      lights.length = 0;
      doorMeshes.length = 0;

      gltfScene.traverse((obj) => {
        const name = obj.name || "";
        if (name.startsWith("LIGHT_")) {
          const key = name.replace(/^LIGHT_/, "");
          lights.push({ key, node: obj, baseline: captureLightBaseline(obj) });
        } else if (name.startsWith("TRIGGER_")) {
          const key = name.replace(/^TRIGGER_/, "");
          if (obj instanceof THREE.Mesh || obj.children.length > 0) {
            triggers.push({
              key,
              node: obj,
              inside: false,
              box: new THREE.Box3(),
              center: new THREE.Vector3(),
              lights: [],
            });
          }
        } else if (name.startsWith("DOOR_")) {
          doorMeshes.push(obj);
        }
      });

      // If Blender only exported triggers as meshes and lights as separate objects,
      // we map LIGHT_{X} to TRIGGER_{X}.
      triggers.forEach((tr) => {
        const scoped = lights.filter((l) => l.key === tr.key);
        tr.lights = scoped.length > 0 ? scoped : lights.slice();
      });

      // Choose required triggers based on what's present.
      const presentKeys = triggers.map((t) => t.key);
      if (presentKeys.length > 0) {
        const preferred = requiredTriggerKeys.filter((k) => presentKeys.includes(k));
        requiredKeys =
          preferred.length >= 2 ? preferred.slice(0, 3) : presentKeys.slice(0, 3);
      }

      // Reset so fallback-trigger activations don't carry into the real model.
      resetGameplayState();
    }

    function createOrUpdateTriggerBoxes() {
      triggers.forEach((tr) => {
        tr.box.setFromObject(tr.node);
        tr.box.getCenter(tmpCenter);
        tr.center.copy(tmpCenter);
        const insideNow = expandedScratch
          .copy(tr.box)
          .expandByScalar(playerRadius)
          .containsPoint(player.position);

        const prev = insideByKey.get(tr.key) ?? false;
        if (!prev && insideNow) {
          insideByKey.set(tr.key, true);
          onTriggerEnter(tr);
        } else if (prev && !insideNow) {
          insideByKey.set(tr.key, false);
          onTriggerExit(tr);
        } else {
          insideByKey.set(tr.key, insideNow);
        }
      });
    }

    function onTriggerEnter(tr: TriggerTarget) {
      const key = tr.key;
      pushEvent(`Event On Overlap Begin -> Trigger_${key}`);

      const c = randomColor01();
      tr.lights.forEach((l) => applyLightColor(l, c));
      spawnBurst(tr.center);

      if (requiredKeys.includes(key) && !activated.has(key)) {
        activated.add(key);
        setActivatedCount(activated.size);
        if (activated.size >= requiredKeys.length) unlockDoor();
      }
    }

    function onTriggerExit(tr: TriggerTarget) {
      pushEvent(`Event On Overlap End -> Trigger_${tr.key}`);
      tr.lights.forEach((l) => restoreLightColor(l));
    }

    // Animation loop.
    const keysDown = new Set<string>();
    function onKeyDown(e: KeyboardEvent) {
      keysDown.add(e.code);
      // Rotate camera yaw quickly.
      if (e.code === "ArrowLeft") cameraYaw.value -= 0.06;
      if (e.code === "ArrowRight") cameraYaw.value += 0.06;
    }
    function onKeyUp(e: KeyboardEvent) {
      keysDown.delete(e.code);
    }

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);

    const clock = new THREE.Clock();
    let raf = 0;

    const loader = new GLTFLoader();

    // Try loading Blender-exported glb; if not present, fallback procedurally.
    loader.load(
      "/models/playrix_door_puzzle.glb",
      (gltf) => {
        const gltfScene = gltf.scene;
        scene.add(gltfScene);

        // Remove fallback visuals if we created them.
        if (fallbackRoot) {
          scene.remove(fallbackRoot);
          fallbackRoot = null;
          fallbackRegistered = false;
        }

        registerFromLoadedModel(gltfScene);
        computeDoorAnimationSetup();
        pushEvent("Loaded glTF scene (triggers/lights registered).");
      },
      undefined,
      () => {
        ensureProceduralFallback();
        computeDoorAnimationSetup();
        pushEvent("glTF missing; running procedural fallback demo.");
      }
    );

    // Create a fallback immediately so the demo feels alive while glb loads.
    ensureProceduralFallback();
    computeDoorAnimationSetup();
    resetGameplayState();

    function animate() {
      raf = requestAnimationFrame(animate);
      const dt = Math.min(clock.getDelta(), 0.033);

      // Move player proxy with WASD (X/Z), keep above ground.
      const moveSpeed = 3.4;
      const forward = new THREE.Vector3(Math.sin(cameraYaw.value), 0, Math.cos(cameraYaw.value));
      const right = new THREE.Vector3(forward.z, 0, -forward.x);

      const move = new THREE.Vector3();
      if (keysDown.has("KeyW")) move.add(forward);
      if (keysDown.has("KeyS")) move.add(forward.clone().multiplyScalar(-1));
      if (keysDown.has("KeyD")) move.add(right);
      if (keysDown.has("KeyA")) move.add(right.clone().multiplyScalar(-1));
      if (move.lengthSq() > 0) move.normalize().multiplyScalar(moveSpeed * dt);

      player.position.add(move);
      player.position.y = playerRadius;

      // Camera follows player.
      const camOffset = new THREE.Vector3(0, 6.8, 12.0).applyAxisAngle(
        new THREE.Vector3(0, 1, 0),
        cameraYaw.value
      );
      camera.position.copy(player.position).add(camOffset);
      camera.lookAt(player.position);

      // Expand/limit within the playable "arena".
      player.position.x = THREE.MathUtils.clamp(player.position.x, -6, 10);
      player.position.z = THREE.MathUtils.clamp(player.position.z, -10, 10);

      // Overlap detection (Blueprint-style).
      createOrUpdateTriggerBoxes();

      // Door animation.
      if (doorOpening) {
        doorAnim.t = Math.min(1, doorAnim.t + dt * 0.9);
      } else {
        doorAnim.t = Math.max(0, doorAnim.t - dt * 0.4);
      }
      const eased = doorAnim.t < 1 ? (1 - Math.pow(1 - doorAnim.t, 2)) : 1;
      doorMeshes.forEach((mesh) => {
        const q0 = doorInitial.get(mesh);
        const q1 = doorTarget.get(mesh);
        if (!q0 || !q1) return;
        mesh.quaternion.copy(q0).slerp(q1, eased);
      });

      // Particle updates.
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life -= dt;
        if (p.life <= 0) {
          particleRoot.remove(p.mesh);
          p.mesh.geometry.dispose();
            const mat = p.mesh.material;
            if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
            else mat.dispose();
          particles.splice(i, 1);
          continue;
        }
        p.vel.multiplyScalar(0.98);
        p.mesh.position.add(p.vel.clone().multiplyScalar(dt * 10));
        const s = Math.max(0.01, p.life);
        p.mesh.scale.setScalar(s * 1.1);
      }

      const width = mount!.clientWidth;
      const height = 420;
      if (renderer.domElement.width !== width || renderer.domElement.height !== height) {
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      renderer.render(scene, camera);
    }

    raf = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);

      renderer.dispose();
      mount!.removeChild(renderer.domElement);

      // Dispose any geometries/materials created in fallback.
      scene.traverse((obj) => {
        if (obj instanceof THREE.Mesh) {
          obj.geometry?.dispose?.();
          const mat = obj.material;
          if (mat) {
            const mats = getMaterialList(mat);
            mats.forEach((m) => m?.dispose?.());
          }
        }
      });
    };
  }, [requiredTriggerKeys]);

  return (
    <section className="section" id="door-demo">
      <div className="section-header">
        <div className="sh-icon func">ƒ</div>
        Playrix-Style Door Puzzle
        <span className="comment">{"// Blender triggers -> overlap events"}</span>
      </div>

      <div
        ref={mountRef}
        className="door-demo-mount"
        style={{
          position: "relative",
          width: "100%",
          height: 420,
          borderRadius: 8,
          overflow: "hidden",
          border: "1.5px solid var(--border-node)",
          background: "rgba(26,31,53,0.75)",
          boxShadow: "var(--shadow-node)",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 12,
            top: 12,
            zIndex: 10,
            background: "rgba(10,14,26,0.55)",
            border: "1px solid rgba(78,203,255,0.15)",
            borderRadius: 8,
            padding: "10px 12px",
            maxWidth: 320,
          }}
        >
          <div style={{ fontFamily: "Orbitron, sans-serif", fontSize: 12, fontWeight: 800, letterSpacing: "0.08em" }}>
            Blueprint Events
          </div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>
            {requiredTriggerKeys.map((k, i) => (
              <span key={k} style={{ marginRight: 10 }}>
                Trigger_{k}: {i < activatedCount ? "✓" : "•"}
              </span>
            ))}
          </div>
          <div style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>
            {events.length === 0 ? "Events will appear here when you overlap triggers." : null}
            {events.map((e) => (
              <div key={e.id} style={{ color: "var(--text-primary)", marginTop: 4 }}>
                {e.text}
              </div>
            ))}
          </div>
          {doorUnlocked ? (
            <div style={{ marginTop: 10, color: "var(--accent-green)", fontWeight: 700 }}>
              Door is open. Great loop design.
            </div>
          ) : (
            <div style={{ marginTop: 10, color: "var(--text-secondary)" }}>
              Move: <span style={{ color: "var(--accent-glow)" }}>WASD</span> • Rotate: <span style={{ color: "var(--accent-glow)" }}>Left/Right</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

