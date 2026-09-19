import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import Services from "../components/landing/Services";
import Stats from "../components/landing/Stats";
import FAQ from "../components/landing/FAQ";
import Pricing from "../components/landing/Pricing";
import BlogSection from "../components/landing/BlogSection";
import FeaturedCourses from "../components/landing/FeaturedCourses";
import useLandingPageSettings from "../hooks/useLandingPageSettings";

export default function Landing() {
  const { sections, stats } = useLandingPageSettings();

  return (
    <main className="landing-page">
      {sections.hero && <Hero />}
      {sections.featuredCourses && <FeaturedCourses />}
      {sections.pricing && <Pricing />}
      {sections.stats && <Stats stats={stats} />}
      {sections.features && <Features />}
      {sections.blog && <BlogSection />}
      {sections.services && <Services />}
      {sections.faq && <FAQ />}
    </main>
  );
}
