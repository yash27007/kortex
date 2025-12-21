import { Hero, Features, HowItWorks, CTA, Footer } from "@/components/landing";

export default function HomePage() {
  return (
    <main className="relative">
      <Hero />
      <Features />
      <HowItWorks />
      <CTA />
      <Footer />
    </main>
  );
}
