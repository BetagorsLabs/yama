import { Check, X, Minus } from 'lucide-react';

const frameworks = ['Yama', 'NestJS', 'tRPC', 'Express/Fastify'];

const comparisons = [
  {
    feature: 'Lines of code for full CRUD + JWT auth',
    values: ['~80 lines', '~500 lines', '~200 lines', '~400 lines'],
    highlight: 0,
  },
  {
    feature: 'Auto-generated OpenAPI + Swagger UI',
    values: [true, 'manual', false, 'manual'],
    highlight: 0,
  },
  {
    feature: 'Type-safe client SDK out of the box',
    values: [true, false, true, false],
    highlight: 0,
  },
  {
    feature: 'Docker + CI/CD included',
    values: [true, false, false, false],
    highlight: 0,
  },
  {
    feature: 'Runs anywhere (Fly, Railway, VPS...)',
    values: [true, true, true, true],
    highlight: null,
  },
  {
    feature: 'Database migrations built-in',
    values: [true, 'via TypeORM', false, 'manual'],
    highlight: 0,
  },
  {
    feature: 'Zero lock-in · 100% open source',
    values: [true, true, true, true],
    highlight: null,
  },
  {
    feature: 'Learning curve',
    values: ['15 min', '2-3 days', '4-6 hours', '1-2 days'],
    highlight: 0,
  },
];

function CellValue({ value }: { value: string | boolean }) {
  if (typeof value === 'boolean') {
    return value ? (
      <Check className="h-5 w-5 text-secondary mx-auto" />
    ) : (
      <X className="h-5 w-5 text-red-400 mx-auto" />
    );
  }
  
  if (value === 'manual') {
    return (
      <span className="flex items-center justify-center gap-2 text-yellow-400">
        <Minus className="h-4 w-4" />
        <span className="text-sm">Manual</span>
      </span>
    );
  }
  
  return <span className="text-sm text-foreground/80">{value}</span>;
}

export function ComparisonTable() {
  return (
    <section className="relative py-24 bg-gradient-to-b from-background via-secondary/5 to-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Why developers choose Yama
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            See how Yama stacks up against popular backend frameworks
          </p>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <div className="rounded-xl border border-primary/30 bg-card/50 backdrop-blur-sm overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-primary/20 bg-primary/5">
                  <th className="text-left px-6 py-4 text-sm font-semibold text-muted-foreground">
                    Feature
                  </th>
                  {frameworks.map((framework, idx) => (
                    <th 
                      key={framework} 
                      className={`px-6 py-4 text-center text-sm font-semibold ${
                        idx === 0 
                          ? 'text-primary bg-primary/10' 
                          : 'text-muted-foreground'
                      }`}
                    >
                      {framework}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisons.map((row, rowIdx) => (
                  <tr 
                    key={row.feature}
                    className="border-b border-primary/10 hover:bg-primary/5 transition-colors"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-foreground">
                      {row.feature}
                    </td>
                    {row.values.map((value, colIdx) => (
                      <td 
                        key={colIdx} 
                        className={`px-6 py-4 text-center ${
                          row.highlight === colIdx 
                            ? 'bg-secondary/10 font-semibold' 
                            : ''
                        }`}
                      >
                        <CellValue value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile Cards */}
        <div className="md:hidden space-y-6">
          {frameworks.map((framework, fwIdx) => (
            <div 
              key={framework}
              className={`rounded-xl border overflow-hidden ${
                fwIdx === 0
                  ? 'border-primary/50 bg-primary/5'
                  : 'border-primary/20 bg-card/50'
              }`}
            >
              <div className={`px-6 py-4 font-semibold border-b ${
                fwIdx === 0
                  ? 'text-primary bg-primary/10 border-primary/30'
                  : 'text-foreground bg-card/30 border-primary/20'
              }`}>
                {framework}
              </div>
              <div className="divide-y divide-primary/10">
                {comparisons.map((row, rowIdx) => (
                  <div key={rowIdx} className="px-6 py-4">
                    <div className="text-xs text-muted-foreground mb-2">{row.feature}</div>
                    <div className="flex items-center">
                      <CellValue value={row.values[fwIdx]} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <p className="text-lg text-muted-foreground mb-6">
            Stop fighting boilerplate. Start building features.
          </p>
          <div className="inline-flex items-center gap-3 rounded-lg bg-card border border-primary/30 px-6 py-4 font-mono text-primary">
            <span className="text-muted-foreground">$</span>
            <span>npm create yama@latest</span>
          </div>
        </div>
      </div>
    </section>
  );
}
