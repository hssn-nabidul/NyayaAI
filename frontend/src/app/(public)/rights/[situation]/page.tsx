"use client";

import React from "react";
import { useParams } from "next/navigation";

/**
 * Fundamental Right Situation Page
 * Placeholder for situation-specific rights explanations.
 */
export default function RightSituationPage() {
  const params = useParams();
  const situation = params.situation as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white capitalize">
        {decodeURIComponent(situation).replace(/-/g, " ")}
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <p className="text-gray-600 dark:text-gray-300">
          Your fundamental rights in this specific situation will be explained here soon.
        </p>
      </div>
    </div>
  );
}
