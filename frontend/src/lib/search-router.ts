/**
 * Intelligent Search Routing Utility
 * 
 * Detects legal terms and keywords in search queries and routes to the
 * most appropriate page. Used by both the global Navbar search and the
 * page-level SearchBar component.
 */

export type SearchRoute = {
  path: string;
  reason: string;
};

/**
 * Determine the best route for a search query based on its content.
 * Returns the target path and a reason string for debugging.
 */
export function determineSearchRoute(query: string): SearchRoute {
  const q = query.trim().toLowerCase();
  if (!q) return { path: '/search', reason: 'empty-query' };

  // Legal maxims / Latin terms
  if (
    q.includes('maxim') ||
    q.includes('latin') ||
    q.includes('nemo') ||
    q.includes('audi') ||
    q.includes('caveat') ||
    q.includes('res ipsa') ||
    q.includes('prima facie') ||
    q.includes('ex parte') ||
    q.includes('de facto') ||
    q.includes('de jure') ||
    q.includes('habeas') ||
    q.includes('sub judice')
  ) {
    return { path: `/maxims?q=${encodeURIComponent(q)}`, reason: 'legal-maxim' };
  }

  // Bare acts / sections
  if (
    q.includes('act') ||
    q.includes('section') ||
    q.includes('bns') ||
    q.includes('bsa') ||
    q.includes('bnss') ||
    q.includes('ipc') ||
    q.includes('crpc') ||
    q.includes('constitution')
  ) {
    return { path: `/acts`, reason: 'bare-act' };
  }

  // Dictionary / definitions
  if (
    q.includes('define') ||
    q.includes('meaning') ||
    q.includes('dictionary') ||
    q.includes('term') ||
    q.includes('defines')
  ) {
    // Strip the "define/meaning/dictionary" prefix for cleaner URL
    const cleanQuery = q.replace(/^(define|meaning|dictionary|term)\s+/i, '').trim();
    return { path: `/dictionary?q=${encodeURIComponent(cleanQuery || q)}`, reason: 'dictionary' };
  }

  // Fundamental rights
  if (
    q.includes('right') ||
    q.includes('fundamental') ||
    q.includes('article 14') ||
    q.includes('article 21') ||
    q.includes('article 19')
  ) {
    return { path: `/rights?q=${encodeURIComponent(q)}`, reason: 'rights' };
  }

  // Judge profiles
  if (
    q.includes('judge') ||
    q.includes('justice') ||
    q.includes('bench')
  ) {
    return { path: `/judges?q=${encodeURIComponent(q)}`, reason: 'judge' };
  }

  // Default: case search
  return { path: `/search?q=${encodeURIComponent(q)}`, reason: 'case-search' };
}
