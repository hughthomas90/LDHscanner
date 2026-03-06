import type { SourcePreprintRecord } from "./types";

interface ApiResponse {
  messages?: Array<{
    total?: number | string;
  }>;
  collection?: SourcePreprintRecord[];
}

const BASE_URL = "https://api.medrxiv.org/details";

async function fetchPage(server: "medrxiv" | "biorxiv", startDate: string, endDate: string, cursor: number) {
  const url = `${BASE_URL}/${server}/${startDate}/${endDate}/${cursor}/json`;
  const response = await fetch(url, {
    cache: "no-store",
    headers: {
      "user-agent": "LDH-Scout/0.1 (+editorial preprint scouting)",
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch ${server} preprints: ${response.status}`);
  }

  return (await response.json()) as ApiResponse;
}

export async function fetchPreprintsForDateRange(
  server: "medrxiv" | "biorxiv",
  startDate: string,
  endDate: string,
) {
  const results: SourcePreprintRecord[] = [];
  let cursor = 0;

  while (true) {
    const payload = await fetchPage(server, startDate, endDate, cursor);
    const collection = payload.collection || [];
    const total = Number(payload.messages?.[0]?.total || collection.length);

    if (collection.length === 0) {
      break;
    }

    results.push(...collection.map((item) => ({ ...item, server })));
    cursor += collection.length;

    if (cursor >= total) {
      break;
    }
  }

  return results;
}
