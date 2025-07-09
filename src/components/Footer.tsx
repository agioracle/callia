export default function Footer() {
  return (
    <footer className="border-t py-12">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">B</span>
            </div>
            <span className="font-newsreader text-xl font-bold">Briefily</span>
            {/* <span className="text-muted-foreground">Morning Brief</span> */}
          </div>
          <p className="text-muted-foreground text-sm">
            © 2025 Briefily. All rights reserved by <a href="https://tokendance.ai" target="_blank" className="text-primary hover:underline">Tokendance</a>.
          </p>
        </div>
      </div>
    </footer>
  );
}
