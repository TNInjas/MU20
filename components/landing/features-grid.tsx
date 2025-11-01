"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const features = [
  {
    title: "Smart Alerts",
    description: "Get notified when you're about to exceed your budget",
    icon: "🔔",
    cta: "Set Budget",
    href: "/dashboard",
  },
  {
    title: "Auto-Save",
    description: "Leftover money automatically goes to goals and investments",
    icon: "💰",
    cta: "View Surplus",
    href: "/surplus",
  },
  {
    title: "Track Progress",
    description: "Visualize your journey through all 7 steps",
    icon: "📊",
    cta: "See Progress",
    href: "/progress",
  },
];

export function FeaturesGrid() {
  return (
    <section className="border-t bg-muted/50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold">How Lumos Works</h2>
          <p className="text-muted-foreground">
            Everything you need to build financial freedom
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature, index) => (
            <Card key={index} className="flex flex-col">
              <CardHeader>
                <div className="mb-4 text-4xl">{feature.icon}</div>
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent className="mt-auto">
                <Button asChild variant="outline" className="w-full">
                  <Link href={feature.href}>{feature.cta}</Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
