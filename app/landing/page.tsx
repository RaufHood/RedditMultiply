"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Zap,
  Target,
  MessageSquare,
  BarChart3,
  Shield,
  Clock,
  Users,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
} from "lucide-react"
import Link from "next/link"

const features = [
  {
    icon: Target,
    title: "Smart Brand Discovery",
    description: "AI-powered subreddit discovery finds the perfect communities for your brand in minutes.",
  },
  {
    icon: MessageSquare,
    title: "Intelligent Reply Generation",
    description: "Generate contextual, compliant replies that sound natural and drive engagement.",
  },
  {
    icon: BarChart3,
    title: "Advanced Analytics",
    description: "Track sentiment, engagement rates, and ROI across all your Reddit marketing efforts.",
  },
  {
    icon: Shield,
    title: "Compliance Monitoring",
    description: "Built-in compliance scoring ensures your engagement follows Reddit's community guidelines.",
  },
  {
    icon: Clock,
    title: "Real-time Monitoring",
    description: "Never miss a mention with instant notifications and priority-based alerts.",
  },
  {
    icon: Users,
    title: "Community Insights",
    description: "Deep insights into community behavior, trends, and optimal engagement times.",
  },
]

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Marketing Director",
    company: "TechFlow Solutions",
    content: "RedditReach helped us increase our Reddit engagement by 300% while maintaining authentic conversations.",
    rating: 5,
  },
  {
    name: "Mike Rodriguez",
    role: "Founder",
    company: "StartupBoost",
    content: "The AI-powered replies are incredibly natural. We've generated over $50k in leads from Reddit alone.",
    rating: 5,
  },
  {
    name: "Emily Watson",
    role: "Growth Manager",
    company: "CloudScale",
    content: "Finally, a tool that understands Reddit culture. Our community engagement has never been better.",
    rating: 5,
  },
]

const pricingPlans = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    description: "Perfect for small businesses getting started with Reddit marketing",
    features: [
      "Monitor up to 5 subreddits",
      "100 AI-generated replies/month",
      "Basic analytics dashboard",
      "Email notifications",
      "Community guidelines checker",
    ],
    popular: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/month",
    description: "Ideal for growing companies with active Reddit presence",
    features: [
      "Monitor up to 25 subreddits",
      "500 AI-generated replies/month",
      "Advanced analytics & reporting",
      "Real-time notifications",
      "Sentiment analysis",
      "Team collaboration tools",
      "Priority support",
    ],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$399",
    period: "/month",
    description: "For large organizations with comprehensive Reddit strategies",
    features: [
      "Unlimited subreddit monitoring",
      "Unlimited AI-generated replies",
      "Custom analytics dashboards",
      "API access",
      "Advanced compliance tools",
      "Dedicated account manager",
      "Custom integrations",
      "SLA guarantee",
    ],
    popular: false,
  },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-xl">RedditReach</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900">
                Features
              </a>
              <a href="#pricing" className="text-gray-600 hover:text-gray-900">
                Pricing
              </a>
              <a href="#testimonials" className="text-gray-600 hover:text-gray-900">
                Testimonials
              </a>
              <Button variant="outline">Sign In</Button>
              <Link href="/">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <Badge className="mb-4" variant="secondary">
              🚀 Now with AI-Powered Reply Generation
            </Badge>
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Automate Your
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                {" "}
                Reddit Marketing
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Discover trending conversations, engage authentically, and grow your brand on Reddit with AI-powered
              automation that respects community guidelines.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Link href="/">
                <Button size="lg" className="flex items-center gap-2">
                  Start Free Trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="flex items-center gap-2 bg-transparent">
                <Play className="h-4 w-4" />
                Watch Demo
              </Button>
            </div>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                14-day free trial
              </div>
              <div className="flex items-center gap-1">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Cancel anytime
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to succeed on Reddit
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              From discovery to engagement, our AI-powered platform handles every aspect of your Reddit marketing
              strategy.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">10M+</div>
              <div className="text-blue-100">Reddit posts analyzed</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">500+</div>
              <div className="text-blue-100">Active brands</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">95%</div>
              <div className="text-blue-100">Compliance rate</div>
            </div>
            <div>
              <div className="text-3xl md:text-4xl font-bold text-white mb-2">3.2x</div>
              <div className="text-blue-100">Average engagement increase</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Loved by marketing teams worldwide</h2>
            <p className="text-xl text-gray-600">See how RedditReach is transforming Reddit marketing for businesses</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                    ))}
                  </div>
                  <p className="text-gray-600 mb-4">"{testimonial.content}"</p>
                  <div>
                    <div className="font-semibold text-gray-900">{testimonial.name}</div>
                    <div className="text-sm text-gray-500">
                      {testimonial.role} at {testimonial.company}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-xl text-gray-600">Choose the plan that fits your Reddit marketing needs</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`relative border-0 shadow-lg ${
                  plan.popular ? "ring-2 ring-blue-500 shadow-xl scale-105" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-500 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-gray-500">{plan.period}</span>
                  </div>
                  <CardDescription className="mt-4">{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Link href="/">
                    <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
                      Get Started
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to transform your Reddit marketing?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join hundreds of brands already using RedditReach to grow their presence on Reddit.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/">
              <Button size="lg" variant="secondary" className="flex items-center gap-2">
                Start Your Free Trial
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 bg-transparent"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="font-bold text-xl">RedditReach</span>
              </div>
              <p className="text-gray-400">Automate your Reddit marketing with AI-powered insights and engagement.</p>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    API
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Blog
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Careers
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Contact
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white">
                    Status
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RedditReach. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
