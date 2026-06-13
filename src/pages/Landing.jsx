import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Services from "../components/landing/Services";
// import Stats from "../components/landing/Stats";
import Marquee from "../components/landing/Marquee";
// import FAQ from "../components/landing/FAQ";
import Pricing from "../components/landing/Pricing";

export default function Landing() {
  return (
    <>
      <Hero />
      <Marquee />
      <Features />
      <Services />
      <Pricing />
      {/* <Stats /> */}
      {/* <FAQ /> */}
    </>
  );
}