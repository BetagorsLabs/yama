import Link from 'next/link';

const features = [
  {
    title: 'YAML-first, type-safe',
    description:
      'Describe schemas, endpoints, and auth in one config. Yama turns it into validated routes, OpenAPI, and types.',
  },
  {
    title: 'IR-powered SDKs',
    description:
      'A single intermediate representation powers client SDKs and docs, so every change ships consistently.',
  },
  {
    title: 'Batteries-included runtime',
    description:
      'Handlers, plugins, JWT auth, migrations, and platform utilities are ready out of the box—no scaffolding drama.',
  },
  {
    title: 'CLI built for flow',
    description:
      'Spin up dev servers, generate code, and migrate with one CLI. Everything stays in sync with your config.',
  },
];

const steps = [
  {
    title: 'Describe',
    copy: 'Capture your API surface in yama.yaml—schemas, entities, endpoints, plugins, and auth rules.',
  },
  {
    title: 'Implement',
    copy: 'Write TypeScript handlers for the bits that need logic. Yama wires routing, validation, and types.',
  },
  {
    title: 'Ship',
    copy: 'Generate SDKs and docs from the IR. Publish with confidence knowing contracts and code match.',
  },
];

export default function HomePage() {
  return (
    <div className="relative isolate overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),transparent_45%),radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.2),transparent_32%)] opacity-70 dark:bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.12),transparent_40%),radial-gradient(circle_at_20%_20%,rgba(129,140,248,0.18),transparent_30%)]" />

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-16 px-4 pb-20 pt-12 sm:pt-16">
        <header className="flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="flex-1 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200/80 bg-white/70 px-3 py-1 text-xs font-semibold text-neutral-700 shadow-sm backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:text-neutral-200">
              <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500" />
              Configuration-first backend platform
            </div>
            <div className="space-y-4">
              <h1 className="text-4xl font-semibold leading-tight text-neutral-900 dark:text-white sm:text-5xl">
                Build APIs the Next.js way—fast, typed, and in sync.
              </h1>
              <p className="text-lg text-neutral-600 dark:text-neutral-300 sm:text-xl">
                Yama reads your YAML config, generates type-safe routes, SDKs, and docs from a single IR, and lets you
                keep all your logic in clean TypeScript handlers.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center justify-center rounded-full bg-[#0070f3] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Get started
              </Link>
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300/80 bg-white/80 px-5 py-2.5 text-sm font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:bg-neutral-900/70 dark:text-neutral-100 dark:hover:border-neutral-700"
              >
                View docs
              </Link>
            </div>
            <div className="flex flex-wrap gap-3 text-sm text-neutral-600 dark:text-neutral-300">
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200/70 backdrop-blur dark:bg-neutral-900/70 dark:text-neutral-200 dark:ring-neutral-800/70">
                <span className="font-mono text-xs text-emerald-500">IR</span>
                One source of truth for SDKs, docs, and runtime
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/70 px-3 py-1 font-medium text-neutral-700 shadow-sm ring-1 ring-neutral-200/70 backdrop-blur dark:bg-neutral-900/70 dark:text-neutral-200 dark:ring-neutral-800/70">
                <span className="font-mono text-xs text-sky-500">TS</span>
                Handlers stay in TypeScript
              </span>
            </div>
          </div>

          <div className="flex-1">
            <div className="rounded-2xl border border-neutral-200/80 bg-white/90 p-5 shadow-2xl shadow-sky-100/60 ring-1 ring-white/80 backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-900/80 dark:shadow-none dark:ring-neutral-900">
              <div className="mb-4 flex items-center justify-between text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  yama.yaml
                </span>
                <span className="rounded-full bg-neutral-100 px-2 py-1 font-mono text-[10px] text-neutral-500 dark:bg-neutral-800 dark:text-neutral-400">
                  synced → IR → SDK
                </span>
              </div>
              <pre className="overflow-hidden rounded-xl border border-neutral-200/70 bg-neutral-900 px-4 py-4 text-sm text-neutral-50 shadow-inner shadow-black/20 dark:border-neutral-800">
                <code className="block leading-relaxed">
{`name: yamajs-demo
version: 0.1.0

schemas:
  Todo:
    type: object
    properties:
      id: { type: string, format: uuid }
      title: { type: string }
      completed: { type: boolean, default: false }

endpoints:
  /todos:
    get:
      handler: handlers/listTodos
      response:
        type: array
        items: { $ref: '#/schemas/Todo' }
    post:
      handler: handlers/createTodo
      request:
        body: { $ref: '#/schemas/Todo' }`}
                </code>
              </pre>
              <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-neutral-600 dark:text-neutral-300">
                <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  CLI: <code className="font-mono">yama dev</code>
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  Docs: <code className="font-mono">yama docs</code>
                </span>
                <span className="rounded-full bg-neutral-100 px-3 py-1 font-medium text-neutral-700 dark:bg-neutral-800 dark:text-neutral-200">
                  SDK: <code className="font-mono">yama sdk --lang ts</code>
                </span>
              </div>
            </div>
          </div>
        </header>

        <section className="grid gap-5 md:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-neutral-200/80 bg-white/80 p-6 shadow-sm ring-1 ring-white/80 backdrop-blur transition hover:-translate-y-1 hover:shadow-lg dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:ring-neutral-900"
            >
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">{feature.title}</h3>
              <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-300">{feature.description}</p>
            </div>
          ))}
        </section>

        <section className="rounded-2xl border border-neutral-200/80 bg-white/90 p-8 shadow-lg ring-1 ring-white/80 backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:ring-neutral-900">
          <div className="grid gap-8 md:grid-cols-2 md:items-start">
            <div className="space-y-4">
              <h2 className="text-2xl font-semibold text-neutral-900 dark:text-white">From config to runtime</h2>
              <p className="text-base text-neutral-600 dark:text-neutral-300">
                Yama keeps structure and logic cleanly separated. Configuration defines the contract; TypeScript defines
                the behavior. The IR ensures SDKs, docs, and runtime stay aligned.
              </p>
              <div className="grid gap-3">
                {steps.map((step, index) => (
                  <div key={step.title} className="flex gap-3 rounded-xl border border-neutral-200/80 bg-white/90 p-4 dark:border-neutral-800/80 dark:bg-neutral-900/70">
                    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-neutral-900 text-sm font-semibold text-white dark:bg-white dark:text-neutral-900">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-neutral-900 dark:text-white">{step.title}</div>
                      <p className="text-sm text-neutral-600 dark:text-neutral-300">{step.copy}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/docs/guides"
                  className="inline-flex items-center justify-center rounded-full border border-neutral-300/80 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-100 dark:hover:border-neutral-700"
                >
                  Browse guides
                </Link>
                <Link
                  href="/docs/examples"
                  className="inline-flex items-center justify-center rounded-full bg-neutral-900 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:bg-white dark:text-neutral-900"
                >
                  See examples
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-950 p-6 text-neutral-50 shadow-inner shadow-black/30 dark:border-neutral-800">
              <div className="text-sm font-semibold text-neutral-300">Handler example</div>
              <pre className="overflow-auto rounded-xl bg-neutral-900/70 p-4 text-sm text-neutral-50 ring-1 ring-neutral-800">
                <code className="block leading-relaxed">
{`import { HandlerContext } from '@betagors/yama-core';

export async function listTodos(ctx: HandlerContext) {
  return ctx.db.select('todos').orderBy('createdAt', 'desc');
}

export async function createTodo(ctx: HandlerContext) {
  const todo = await ctx.db.insert('todos', ctx.body);
  return { id: todo.id, ...ctx.body };
}`}
                </code>
              </pre>
              <p className="text-sm text-neutral-300">
                Keep logic in TypeScript, while validation, routing, and typing come straight from your YAML contract.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-neutral-200/80 bg-white/90 p-8 shadow-sm ring-1 ring-white/80 backdrop-blur dark:border-neutral-800/80 dark:bg-neutral-900/70 dark:ring-neutral-900">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">Ready to build?</h3>
              <p className="text-sm text-neutral-600 dark:text-neutral-300">
                Install the CLI, start the dev server, and open the docs to ship your first endpoint in minutes.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/docs"
                className="inline-flex items-center justify-center rounded-full bg-[#0070f3] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                Open docs
              </Link>
              <Link
                href="/docs/getting-started"
                className="inline-flex items-center justify-center rounded-full border border-neutral-300/80 px-4 py-2 text-sm font-semibold text-neutral-800 transition hover:-translate-y-0.5 hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-800 dark:text-neutral-100 dark:hover:border-neutral-700"
              >
                Getting started
              </Link>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto rounded-xl border border-dashed border-neutral-300/80 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-800 dark:border-neutral-800/80 dark:bg-neutral-950 dark:text-neutral-200">
            npm install -g @betagors/yama-cli
          </div>
        </section>
      </div>
    </div>
  );
}

