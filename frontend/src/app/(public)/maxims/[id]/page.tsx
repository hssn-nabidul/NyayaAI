"use client";

import React from "react";
import { useParams } from "next/navigation";

/**
 * Maxim Detail Page
 * Placeholder for legal maxim explanations.
 */
export default function MaximPage() {
  const params = useParams();
  const id = params.id as string;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white capitalize">
        Legal Maxim Details
      </h1>
      
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
        <p className="text-gray-600 dark:text-gray-300">
          Detailed explanation and case law for maxim ID: {id} will be available here soon.
        </p>
      </div>
    </div>
  );
}
