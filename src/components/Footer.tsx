import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">N</span>
            </div>
            <span className="font-newsreader text-xl font-bold">News Briefing</span>
            {/* <span className="text-muted-foreground">Morning Brief</span> */}
          </div>
          <div className="mb-4">
            <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 News Briefing. All rights reserved by <a href="https://tokendance.ai" target="_blank" className="text-primary hover:underline">Tokendance</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
