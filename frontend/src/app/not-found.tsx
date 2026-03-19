export default function NotFound() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-ink">
      <div className="flex flex-col items-center gap-4 text-center">
        <h1 className="text-6xl font-serif text-gold">404</h1>
        <h2 className="text-xl font-sans text-cream">Page Not Found</h2>
        <p className="text-cream-dim text-sm max-w-md">
          The page you are looking for does not exist or has been moved.
        </p>
        <a href="/" className="text-gold underline text-sm">
          Return to Home
        </a>
      </div>
    </div>
  );
}
