'use client';

import React from 'react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
      <h2 className="text-2xl font-bold text-red-500">Something went wrong!</h2>
      <p className="text-cream/60">{error.message}</p>
      <button
        onClick={() => reset()}
        className="px-4 py-2 bg-gold text-ink font-medium rounded hover:bg-gold/80 transition-colors"
      >
        Try again
      </button>
    </div>
  );
}
