import { stripTags, unique } from "@/lib/utils";
import type { ExtractedContact, NormalizedPreprint } from "./types";

function timeoutSignal(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear() {
      clearTimeout(timer);
    },
  };
}

function extractEmails(xml: string) {
  const matches = [
    ...xml.matchAll(/<email[^>]*>([^<]+)<\/email>/gi),
    ...xml.matchAll(/mailto:([A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,})/gi),
  ];
  return unique(
    matches
      .map((match) => (match[1] || "").trim())
      .filter(Boolean)
      .map((value) => value.replace(/^mailto:/i, "")),
  );
}

function extractOrcids(xml: string) {
  return unique(
    [...xml.matchAll(/https?:\/\/orcid\.org\/[0-9X-]{15,25}/gi)].map((match) => match[0].trim()),
  );
}

function extractAffiliations(xml: string) {
  return unique(
    [...xml.matchAll(/<aff\b[^>]*>([\s\S]*?)<\/aff>/gi)]
      .map((match) => stripTags(match[1]))
      .filter(Boolean),
  );
}

function extractCorrespondingName(xml: string) {
  const correspSection =
    xml.match(/<contrib\b[^>]*corresp="yes"[^>]*>([\s\S]*?)<\/contrib>/i)?.[1] || "";

  const surname = correspSection.match(/<surname[^>]*>([^<]+)<\/surname>/i)?.[1]?.trim();
  const given = correspSection.match(/<given-names[^>]*>([^<]+)<\/given-names>/i)?.[1]?.trim();
  const stringName = correspSection.match(/<string-name[^>]*>([^<]+)<\/string-name>/i)?.[1]?.trim();

  return stringName || [given, surname].filter(Boolean).join(" ").trim() || null;
}

export async function extractContactsFromJats(
  paper: NormalizedPreprint,
  fallbackContacts: ExtractedContact[],
) {
  if (!paper.jats_xml_url) {
    return fallbackContacts;
  }

  const timeout = timeoutSignal(6000);

  try {
    const response = await fetch(paper.jats_xml_url, {
      cache: "no-store",
      signal: timeout.signal,
      headers: {
        "user-agent": "LDH-Scout/0.1 (+editorial preprint scouting)",
      },
    });

    if (!response.ok) {
      return fallbackContacts;
    }

    const xml = await response.text();
    const emails = extractEmails(xml);
    const orcids = extractOrcids(xml);
    const affiliations = extractAffiliations(xml);
    const correspondingName = extractCorrespondingName(xml) || paper.corresponding_author;

    const baseContact: ExtractedContact = {
      contact_name: correspondingName || null,
      contact_email: emails[0] || null,
      contact_role: "corresponding author",
      affiliation: paper.corresponding_institution || affiliations[0] || null,
      orcid: orcids[0] || null,
      contact_url: orcids[0] || null,
      source_type: "jats_xml",
      confidence: emails[0] ? "high" : correspondingName ? "medium" : "low",
      is_public: true,
    };

    const extraContacts = emails.slice(1).map((email) => ({
      contact_name: correspondingName || null,
      contact_email: email,
      contact_role: "additional public email",
      affiliation: paper.corresponding_institution || affiliations[0] || null,
      orcid: orcids[0] || null,
      contact_url: orcids[0] || null,
      source_type: "jats_xml",
      confidence: "medium" as const,
      is_public: true,
    }));

    const contacts = [baseContact, ...extraContacts].filter(
      (contact) => contact.contact_name || contact.contact_email || contact.affiliation,
    );

    return contacts.length > 0 ? contacts : fallbackContacts;
  } catch {
    return fallbackContacts;
  } finally {
    timeout.clear();
  }
}
