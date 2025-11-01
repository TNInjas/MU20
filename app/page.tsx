import { HeroSection } from "@/components/landing/hero-section";
import { ScrollRoadmap } from "@/components/landing/scroll-roadmap";
import { FeaturesGrid } from "@/components/landing/features-grid";
import { EvidenceSection } from "@/components/landing/evidence-section";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <HeroSection />

      {/* Features - CTA Section */}
      <FeaturesGrid />

      {/* Interactive Roadmap */}
      <section className="container mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="mb-2 text-3xl font-bold text-foreground">
            The 7 Steps to Financial Freedom
          </h2>
          <p className="text-muted-foreground">
            Scroll to reveal your journey
          </p>
        </div>
        <ScrollRoadmap />
        
        {/* CTA in Roadmap Section */}
        <div className="mt-12 text-center">
          <Card className="mx-auto max-w-2xl bg-primary/5">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Start Step 1?</CardTitle>
              <CardDescription className="text-base">
                Begin your financial journey today. Track your progress through all 7 steps.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg" className="h-12 px-8">
                  <Link href="/onboarding">Start Your Journey</Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="h-12 px-8">
                  <Link href="/progress">View Progress</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Evidence Section */}
      <EvidenceSection />

      {/* Final CTA */}
      <section className="bg-gradient-to-r from-primary to-[#5995ED] py-16 text-white">
        <div className="container mx-auto px-4 text-center sm:px-6 lg:px-8">
          <Card className="mx-auto max-w-3xl border-0 bg-white/10 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="mb-4 text-3xl text-white">
                Join 10,000+ Students Building Wealth
              </CardTitle>
              <CardDescription className="text-base text-white/90">
                Start your journey to financial freedom today. No credit card required.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg" variant="secondary" className="h-12 px-8">
                  <Link href="/onboarding">Get Started Free</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="h-12 border-white/20 bg-white/10 px-8 text-white hover:bg-white/20">
                  <Link href="/progress">See How It Works</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}
