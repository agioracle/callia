import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Image src="/logo.png" alt="News Briefing Logo" width={32} height={32} className="rounded-lg" />
            <span className="font-newsreader text-xl font-bold">News Briefing</span>
            {/* <span className="text-muted-foreground">Morning Brief</span> */}
          </div>
          <div className="mb-4">
            <Link href="/terms" className="text-muted-foreground hover:text-primary text-sm transition-colors">
              Terms of Service
            </Link>
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 News Briefing. All rights reserved by <a href="https://tokendance.ai" target="_blank" className="text-primary hover:underline">TokenDance</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
