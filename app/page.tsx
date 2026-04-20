import GridBackground from "./components/GridBackground";
import ParticleCanvas from "./components/ParticleCanvas";
import WireLayer from "./components/WireLayer";
import Nav from "./components/Nav";
import Hero from "./components/Hero";
import Projects from "./components/Projects";
import ModelsViewport from "./components/ModelsViewport";
import Skills from "./components/Skills";
import Contact from "./components/Contact";
import PlayrixDoorPuzzleDemo from "./components/PlayrixDoorPuzzleDemo";

export default function Home() {
  return (
    <>
      <GridBackground />
      <ParticleCanvas />
      <WireLayer />
      <Nav />
      <div className="content">
        <Hero />
        <Projects />
        <ModelsViewport />
        <PlayrixDoorPuzzleDemo />
        <Skills />
        <Contact />
      </div>
    </>
  );
}
