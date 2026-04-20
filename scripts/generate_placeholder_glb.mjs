import fs from "node:fs";
import * as THREE from "three";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";

const outPath = new URL("../public/models/playrix_door_puzzle.glb", import.meta.url);

// Three's GLTFExporter uses a browser FileReader. In Node we polyfill only what we need.
if (typeof globalThis.FileReader === "undefined") {
  globalThis.FileReader = class FileReaderPolyfill {
    constructor() {
      this.result = null;
      this.onloadend = null;
    }

    readAsArrayBuffer(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          this.result = buf;
          // eslint-disable-next-line no-console
          console.log("FileReaderPolyfill buf", buf?.constructor?.name, {
            isArrayBuffer: buf instanceof ArrayBuffer,
            isView: ArrayBuffer.isView(buf),
            byteLength: buf?.byteLength,
          });
          this.onloadend?.call(this);
        })
        .catch((err) => {
          throw err;
        });
    }

    // Not expected for this placeholder (binary mode), but implemented defensively.
    readAsDataURL(blob) {
      blob
        .arrayBuffer()
        .then((buf) => {
          const base64 = Buffer.from(buf).toString("base64");
          this.result = `data:application/octet-stream;base64,${base64}`;
          this.onloadend?.();
        })
        .catch((err) => {
          throw err;
        });
    }
  };
}

const scene = new THREE.Scene();

// Subtle ground so the player has a reference plane.
{
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(60, 60),
    new THREE.MeshStandardMaterial({ color: 0x0d162e, roughness: 1, metalness: 0 })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
}

// Door: the demo animates DOOR_* nodes around the Y axis.
{
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
  scene.add(door);
}

function makeTrigger(key, x, z, tint) {
  // Trigger volumes: transparent meshes named TRIGGER_<KEY>.
  const trigger = new THREE.Mesh(
    new THREE.BoxGeometry(2.1, 3.0, 2.1),
    new THREE.MeshBasicMaterial({ color: tint, transparent: true, opacity: 0.16 })
  );
  trigger.name = `TRIGGER_${key}`;
  trigger.position.set(x, 1.5, z);
  scene.add(trigger);

  // Lights: emissive-capable meshes named LIGHT_<KEY>.
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
  scene.add(light);
}

// Same path the procedural fallback uses in the React demo.
makeTrigger("A", 0, -3.5, 0x4ecbff);
makeTrigger("B", 2.8, -3.5, 0x44ff88);
makeTrigger("C", 2.8, 0.7, 0xff6b2b);

const exporter = new GLTFExporter();

exporter.parse(
  scene,
  (result) => {
    const resolvedArrayBuffer =
      result instanceof ArrayBuffer
        ? result
        : ArrayBuffer.isView(result)
          ? result.buffer.slice(result.byteOffset, result.byteOffset + result.byteLength)
          : result?.buffer instanceof ArrayBuffer
            ? result.buffer
            : null;

    if (!resolvedArrayBuffer) {
      // eslint-disable-next-line no-console
      console.error("GLTF export produced unexpected result:", {
        type: typeof result,
        ctor: result?.constructor?.name,
        isArrayBuffer: result instanceof ArrayBuffer,
        isView: ArrayBuffer.isView(result),
        byteLength: result?.byteLength,
        bufferByteLength: result?.buffer?.byteLength,
      });
      process.exit(1);
    }

    const buffer = Buffer.from(resolvedArrayBuffer);
    fs.mkdirSync(new URL("../public/models", import.meta.url), { recursive: true });
    fs.writeFileSync(outPath, buffer);
    // eslint-disable-next-line no-console
    console.log(`Wrote placeholder glb to ${outPath.pathname}`);
  },
  (err) => {
    // eslint-disable-next-line no-console
    console.error("GLTF export error:", err);
    process.exit(1);
  },
  { binary: true }
);

