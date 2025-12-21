import { Hero, Comparison, HowItWorks, Features, Admin, CTA, Footer } from "@/components/landing";

export default function HomePage() {
  return (
    <main className="relative">
      <Hero />
      <Comparison />
      <HowItWorks />
      <Features />
      <Admin />
      <CTA />
      <Footer />
    </main>
  );
}
