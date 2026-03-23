"use client";

import React from "react";
import { useParams } from "next/navigation";

/**
 * Term Detail Page
 * Placeholder for legal term definitions.
 */
export default function TermPage() {
  const params = useParams();
  const term = params.term as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white capitalize">
        {decodeURIComponent(term).replace(/-/g, " ")}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <p className="text-gray-600 dark:text-gray-300">
          Explanation and usage for this term will be available here soon.
        </p>
      </div>
    </div>
  );
}
