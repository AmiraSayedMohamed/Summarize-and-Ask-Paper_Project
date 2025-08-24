import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, FileText, BarChart3, Brain, Zap, Shield } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Brain className="h-8 w-8 text-primary" />
              <h1 className="text-2xl font-serif font-bold text-foreground">ResearchAI</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/auth/login">
                <Button variant="ghost">Sign In</Button>
              </Link>
              <Link href="/auth/register">
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <h2 className="text-5xl font-serif font-bold text-foreground mb-6">
            Transform Scientific Literature Analysis with AI
          </h2>
          <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
            Upload research papers, extract key insights, identify research gaps, and generate academic content with
            GPT-5 powered analysis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/register">
              <Button size="lg" className="text-lg px-8">
                <Upload className="mr-2 h-5 w-5" />
                Start Analyzing
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-lg px-8 bg-transparent">
              View Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto max-w-6xl">
          <h3 className="text-3xl font-serif font-bold text-center mb-12">Powerful Research Tools</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <FileText className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-serif">Literature Analysis</CardTitle>
                <CardDescription>
                  Upload PDFs and get comprehensive summaries, methodology extraction, and research gap identification.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Brain className="h-12 w-12 text-secondary mb-4" />
                <CardTitle className="font-serif">Paper Structure Generation</CardTitle>
                <CardDescription>
                  Generate detailed outlines with Introduction, Literature Review, Methodology, Results, and Discussion
                  sections.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-accent mb-4" />
                <CardTitle className="font-serif">Content Drafting</CardTitle>
                <CardDescription>
                  Transform preliminary points into academic-quality text with precise language and proper citations.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <BarChart3 className="h-12 w-12 text-chart-2 mb-4" />
                <CardTitle className="font-serif">Data Analysis</CardTitle>
                <CardDescription>
                  Upload datasets and get Python/R code generation with statistical analysis and result interpretation.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Shield className="h-12 w-12 text-primary mb-4" />
                <CardTitle className="font-serif">Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security with role-based access control and comprehensive audit trails.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-border hover:shadow-lg transition-shadow">
              <CardHeader>
                <Upload className="h-12 w-12 text-secondary mb-4" />
                <CardTitle className="font-serif">Easy Integration</CardTitle>
                <CardDescription>
                  Seamless file upload, cloud storage, and API integration for your existing research workflow.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-3xl">
          <h3 className="text-4xl font-serif font-bold text-foreground mb-6">Ready to Accelerate Your Research?</h3>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of researchers who are already using AI to enhance their academic work.
          </p>
          <Link href="/auth/register">
            <Button size="lg" className="text-lg px-12">
              Get Started Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/50 py-8 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Brain className="h-6 w-6 text-primary" />
            <span className="font-serif font-bold text-foreground">ResearchAI</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 ResearchAI. Empowering scientific discovery through AI.
          </p>
        </div>
      </footer>
    </div>
  )
}
