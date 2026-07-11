export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4">
      <main className="w-full max-w-[1100px] flex flex-col items-start gap-8 py-16">
        <div className="flex flex-col gap-4 max-w-2xl">
          <h1 className="text-4xl font-medium tracking-tight text-text-primary">
            TrustScore AI
          </h1>
          <p className="text-lg text-text-secondary">
            A startup validation platform. Build credibility profiles with verifiable evidence and connect with backers.
          </p>
        </div>
        
        <div className="p-8 border border-border-hairline bg-surface rounded-card max-w-md w-full">
          <h2 className="text-lg font-medium text-text-primary mb-2">
            Workspace scaffolded successfully
          </h2>
          <p className="text-sm text-text-secondary mb-4">
            Next.js app router, TypeScript, and Tailwind CSS configured with the designated design tokens.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-accent"></span>
            <span className="text-xs font-medium text-text-secondary">
              Tokens initialized
            </span>
          </div>
        </div>
      </main>
    </div>
  );
}

