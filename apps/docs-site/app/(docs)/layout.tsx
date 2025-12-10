import { Sidebar } from '../components/Sidebar';

export default function DocsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col md:flex-row bg-background text-foreground">
            <Sidebar />
            <main className="flex-1 min-w-0 py-8 px-6 lg:px-12">
                <div className="prose prose-neutral dark:prose-invert max-w-4xl mx-auto prose-headings:font-semibold prose-a:text-primary prose-code:bg-primary/10 prose-code:text-primary prose-code:rounded prose-code:px-1.5 prose-code:py-0.5 prose-code:border prose-code:border-primary/20 prose-pre:bg-card prose-pre:border prose-pre:border-primary/20">
                    {children}
                </div>
            </main>
        </div>
    );
}
