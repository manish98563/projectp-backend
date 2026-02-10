import HeroSection from "@/components/HeroSection";
import ScrollingTicker from "@/components/ScrollingTicker";
import ServicesSection from "@/components/ServicesSection";
import JobPostings from "@/components/JobPostings";
import AboutPreview from "@/components/AboutPreview";

export default function Home() {
  return (
    <main data-testid="home-page" className="pt-[72px]">
      <HeroSection />
      <ScrollingTicker />
      <ServicesSection />
      <JobPostings />
      <AboutPreview />
    </main>
  );
}
