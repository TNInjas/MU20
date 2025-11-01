"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const stats = [
  { label: "Students Using Lumos", value: "10,000+", icon: "👥" },
  { label: "Steps Completed", value: "50,000+", icon: "✅" },
  { label: "Average Debt Paid", value: "$5,000", icon: "💰" },
  { label: "Success Rate", value: "87%", icon: "📈" },
];

const testimonials = [
  {
    name: "Sarah M.",
    role: "College Senior",
    content: "Lumos helped me save my first $1,000 emergency fund in just 3 months! The step-by-step guidance made it so easy.",
    rating: 5,
  },
  {
    name: "Alex T.",
    role: "Graduate Student",
    content: "As a student, money management was overwhelming. Lumos broke it down into simple steps I could actually follow.",
    rating: 5,
  },
  {
    name: "Jordan K.",
    role: "Recent Grad",
    content: "I paid off $8,000 in student loans using Lumos's debt snowball method. Life-changing!",
    rating: 5,
  },
];

export function EvidenceSection() {
  return (
    <section className="border-t bg-muted/50 py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="mb-16">
          <h2 className="mb-8 text-center text-3xl font-bold">
            Trusted by Thousands of Students
          </h2>
          <div className="grid gap-6 md:grid-cols-4">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center">
                <CardHeader>
                  <div className="mb-2 text-4xl">{stat.icon}</div>
                  <CardTitle className="text-3xl font-bold text-primary">
                    {stat.value}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Testimonials */}
        <div>
          <h2 className="mb-8 text-center text-3xl font-bold">
            What Students Are Saying
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="mb-2 flex gap-1">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-[#FFAD05]">
                        ★
                      </span>
                    ))}
                  </div>
                  <CardDescription className="text-base">
                    {testimonial.content}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {testimonial.role}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

