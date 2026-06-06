import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowRight, Activity, Zap, Server, Shield } from "lucide-react";
import { motion } from "framer-motion";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="flex items-center gap-2 text-primary font-mono font-bold text-lg tracking-tight">
          <Activity className="h-5 w-5" />
          ORACLEX_ENGINE
        </div>
        <div className="flex items-center gap-4">
          <Link href="/console">
            <Button size="sm" className="font-mono text-xs">
              Access Console <ArrowRight className="ml-2 h-3 w-3" />
            </Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="py-24 md:py-32 px-6">
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                <span className="flex h-2 w-2 rounded-full bg-primary mr-2 animate-pulse"></span>
                v0.1.0 Online
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tighter leading-tight text-foreground">
                Transactional Email.<br />
                <span className="text-muted-foreground">Self-Hosted. Engineer-First.</span>
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl">
                A production-grade infrastructure platform for managing your email delivery pipeline. Monitor SMTP nodes, track every message, and maintain full control over your sending reputation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link href="/console">
                  <Button size="lg" className="h-12 px-8 font-mono">
                    Open Console
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-12 px-8 font-mono">
                  Read Documentation
                </Button>
              </div>
            </motion.div>
          </div>
        </section>

        <section className="py-24 bg-card border-y border-border px-6">
          <div className="max-w-5xl mx-auto">
            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  icon: Server,
                  title: "SMTP Node Pool",
                  description: "Automatically distribute load across multiple relay nodes. Built-in rate limiting and automatic rotation."
                },
                {
                  icon: Zap,
                  title: "Real-time Telemetry",
                  description: "Every queue operation, delivery attempt, and failure is logged and available via API and webhooks."
                },
                {
                  icon: Shield,
                  title: "Deliverability First",
                  description: "Protect your primary domain's reputation by routing automated mail through isolated, monitored IPs."
                }
              ].map((feature, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="space-y-4"
                >
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <feature.icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold tracking-tight">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-24 px-6">
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <h2 className="text-3xl font-bold tracking-tight">Ready to integrate?</h2>
            <div className="bg-card border border-border rounded-lg p-6 text-left overflow-x-auto">
              <pre className="text-sm font-mono text-muted-foreground">
                <code className="language-bash">
                  $ curl -X POST https://api.oraclex.com/v1/email/send \<br/>
                  &nbsp;&nbsp;-H "Authorization: Bearer YOUR_API_KEY" \<br/>
                  &nbsp;&nbsp;-H "Content-Type: application/json" \<br/>
                  &nbsp;&nbsp;-d '&#123;<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;"to": "user@example.com",<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;"template": "welcome-email",<br/>
                  &nbsp;&nbsp;&nbsp;&nbsp;"senderName": "System"<br/>
                  &nbsp;&nbsp;&#125;'
                </code>
              </pre>
            </div>
          </div>
        </section>
      </main>

      <footer className="py-8 border-t border-border px-6 text-center text-sm text-muted-foreground font-mono">
        ORACLEX MAIL ENGINE // v0.1.0
      </footer>
    </div>
  );
}
