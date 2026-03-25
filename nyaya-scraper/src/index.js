const JUDIS_BASE = "https://judis.nic.in";

const HEADERS = {
	"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
	"Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
	"Accept-Language": "en-IN,en-US;q=0.9,en;q=0.8",
};

export default {
	async fetch(request, env) {

		const incoming_secret = request.headers.get("X-Scraper-Secret");
		if (incoming_secret !== env.SCRAPER_SECRET) {
			return new Response("Unauthorized", { status: 401 });
		}

		const url = new URL(request.url);
		const action = url.searchParams.get("action");

		try {
			if (action === "search") {
				return await handleSearch(url);
			} else if (action === "document") {
				return await handleDocument(url);
			} else {
				return new Response(
					JSON.stringify({ error: "Unknown action" }),
					{ status: 400, headers: { "Content-Type": "application/json" } }
				);
			}
		} catch (err) {
			return new Response(
				JSON.stringify({ error: err.message }),
				{ status: 500, headers: { "Content-Type": "application/json" } }
			);
		}
	}
};


async function handleSearch(url) {
  const query = url.searchParams.get("query") || "";

  const sciUrl = new URL("https://www.sci.gov.in/judgements");
  sciUrl.searchParams.set("q", query);

  const resp = await fetch(sciUrl.toString(), { headers: HEADERS });

  if (!resp.ok) {
    return new Response(
      JSON.stringify({ error: `SCI returned ${resp.status}` }),
      { status: resp.status, headers: { "Content-Type": "application/json" } }
    );
  }

  const html = await resp.text();
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}


async function handleDocument(url) {
	const doc_id = url.searchParams.get("doc_id") || "";
	const raw_id = doc_id.replace("judis_", "");

	const judisUrl = new URL(`${JUDIS_BASE}/supremecourt/jugement.aspx`);
	judisUrl.searchParams.set("filename", raw_id);

	const resp = await fetch(judisUrl.toString(), { headers: HEADERS });

	if (!resp.ok) {
		return new Response(
			JSON.stringify({ error: `JUDIS returned ${resp.status}` }),
			{ status: resp.status, headers: { "Content-Type": "application/json" } }
		);
	}

	const html = await resp.text();

	return new Response(html, {
		status: 200,
		headers: {
			"Content-Type": "text/html; charset=utf-8",
			"X-Source": "judis"
		}
	});
}