import { FileCode, Zap, Rocket } from 'lucide-react';

const steps = [
  {
    icon: FileCode,
    title: 'Write YAML',
    description: 'Define your entities, schemas, endpoints, and auth rules in yama.yaml',
    code: `entities:
  Todo:
    fields:
      id: uuid!
      title: string!
    crud: true`,
    color: 'cyan',
  },
  {
    icon: Zap,
    title: 'Add TS handlers',
    description: 'Write minimal TypeScript for custom logic. Types are auto-generated.',
    code: `export async function handler(ctx) {
  return ctx.db.select('todos')
    .where({ userId: ctx.user.id });
}`,
    color: 'green',
  },
  {
    icon: Rocket,
    title: 'Deploy',
    description: 'docker compose up or fly deploy. Your API, docs, and SDK are ready.',
    code: `$ yama dev
✨ Server: localhost:4000
📚 Docs: localhost:4000/docs
🚀 Ready in 847ms`,
    color: 'purple',
  },
];

export function HowItWorks() {
  return (
    <section className="relative py-24 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Three steps to production
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            No scaffolding. No boilerplate. Just config, logic, and deploy.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            const colorClasses = {
              cyan: 'from-primary to-primary/80 border-primary/50 bg-primary/10 text-primary',
              green: 'from-secondary to-secondary/80 border-secondary/50 bg-secondary/10 text-secondary',
              purple: 'from-purple-500 to-purple-600 border-purple-500/50 bg-purple-500/10 text-purple-400',
            };
            
            return (
              <div key={step.title} className="relative">
                {/* Connector Line */}
                {idx < steps.length - 1 && (
                  <div className="hidden md:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-primary/30 to-transparent" />
                )}
                
                <div className="relative group">
                  {/* Card */}
                  <div className="rounded-xl border border-primary/20 bg-card/50 p-6 hover:border-primary/40 transition-all hover:shadow-lg hover:shadow-primary/20">
                    {/* Icon + Number */}
                    <div className="flex items-center gap-4 mb-4">
                      <div className={`flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br border ${colorClasses[step.color as keyof typeof colorClasses]}`}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 border border-primary/30 text-sm font-bold text-primary">
                        {idx + 1}
                      </div>
                    </div>
                    
                    {/* Title & Description */}
                    <h3 className="text-xl font-bold text-foreground mb-2">
                      {step.title}
                    </h3>
                    <p className="text-muted-foreground mb-4 text-sm leading-relaxed">
                      {step.description}
                    </p>
                    
                    {/* Code Preview */}
                    <div className="rounded-lg bg-background border border-primary/20 p-4 font-mono text-xs text-foreground/80 overflow-x-auto">
                      <pre className="whitespace-pre">{step.code}</pre>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Timeline alternative for mobile */}
        <div className="md:hidden mt-12 flex flex-col items-center">
          <div className="h-full w-0.5 bg-gradient-to-b from-primary via-secondary to-purple-500 opacity-30" />
        </div>
      </div>
    </section>
  );
}
