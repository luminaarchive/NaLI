import type { ArticleMeta } from "./types";

/**
 * Wikipedia-style auto-linking. We build an index of known entities (article
 * subjects, a curated gazetteer of places/terms, and shared topics), then a remark
 * plugin turns the first mention of each entity in an article body into a blue
 * internal link. It runs on the markdown AST, so it never breaks syntax and skips
 * headings, code, and text that is already a link.
 */

export interface Entity {
  id: string;
  phrase: string;
  href: string;
}

/**
 * Curated cross-references: place names and terms that do not match an article
 * title directly but clearly belong to one. Only real, existing slugs.
 */
const GAZETTEER: { phrase: string; slug: string }[] = [
  { phrase: "Sungai Mahakam", slug: "pesut-mahakam-populasi-terakhir" },
  { phrase: "Pesut", slug: "pesut-mahakam-populasi-terakhir" },
  { phrase: "Selat Sunda", slug: "anak-krakatau-2018-runtuhan-tsunami" },
  { phrase: "Ujung Kulon", slug: "badak-jawa-benteng-terakhir" },
  { phrase: "Kawah Ijen", slug: "api-biru-kawah-ijen" },
  { phrase: "Sungai Citarum", slug: "citarum-sungai-tercemar" },
  { phrase: "Danau Toba", slug: "toba-supervolcano-perdebatan-dampak" },
  { phrase: "Banda Neira", slug: "banda-neira-pala-kekerasan-kolonial-arsip" },
  { phrase: "Kutai", slug: "prasasti-yupa-kutai-dokumen-tertua" },
  { phrase: "Prasasti Yupa", slug: "prasasti-yupa-kutai-dokumen-tertua" },
  { phrase: "kantong semar", slug: "nepenthes-pitopangii-kantong-semar-paling-langka-sulawesi" },
  { phrase: "Nepenthes", slug: "nepenthes-pitopangii-kantong-semar-paling-langka-sulawesi" },
  { phrase: "Megachile pluto", slug: "lebah-raksasa-wallace-megachile-pluto" },
  { phrase: "lebah Wallace", slug: "lebah-raksasa-wallace-megachile-pluto" },
  { phrase: "Lazarus", slug: "lazarus-taxon-bagaimana-kepunahan-dinyatakan" },
  { phrase: "spesies Lazarus", slug: "lazarus-taxon-bagaimana-kepunahan-dinyatakan" },
  { phrase: "Coelacanth", slug: "coelacanth-sulawesi-fosil-hidup-laut-dalam" },
  { phrase: "Echidna", slug: "echidna-attenborough-papua-ditemukan-kembali" },
  { phrase: "Mangrove", slug: "mangrove-indonesia-karbon-biru" },
  { phrase: "Borobudur", slug: "borobudur-arsip-restorasi-batu-air-pelestarian" },
  { phrase: "Batavia", slug: "batavia-kota-tua-jakarta" },
  { phrase: "Kota Tua Jakarta", slug: "batavia-kota-tua-jakarta" },
  { phrase: "Orangutan Tapanuli", slug: "orangutan-tapanuli-spesies-baru-habitat-terbatas" },
  { phrase: "Wallacea", slug: "babirusa-evolusi-aneh-wallacea" },
  { phrase: "Krakatau", slug: "krakatau-1883-tsunami-arsip-global" },
  { phrase: "Tambora", slug: "tambora-1815-iklim-dunia" },
  { phrase: "Samalas", slug: "samalas-1257-babad-geologi" },
];

/** Single-word topics too generic to deserve a blue link. */
const GENERIC_TOPICS = new Set([
  "bahaya",
  "dunia",
  "besar",
  "dampak",
  "kuasa",
  "tahun",
  "masa",
  "hari",
  "hidup",
  "umum",
  "lain",
  "data",
]);

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** Strip a trailing year so "Krakatau 1883" also yields "Krakatau". */
function stripYear(subject: string): string | null {
  const m = subject.match(/^(.*?)[\s,]+\d{3,4}$/);
  return m && m[1].length >= 4 ? m[1].trim() : null;
}

/** The subject is the part of a title before the first colon. */
function subjectOf(title: string): string {
  return title.split(":")[0].trim();
}

/**
 * Build the entity index from real content. Articles win over the gazetteer, which
 * wins over topics, so the most specific destination is used for a given phrase.
 */
export function buildEntityIndex(articles: ArticleMeta[]): Entity[] {
  const byPhrase = new Map<string, Entity>();
  const add = (phrase: string, href: string) => {
    const key = phrase.trim();
    if (key.length < 4) return;
    if (byPhrase.has(key)) return;
    byPhrase.set(key, { id: href, phrase: key, href });
  };

  for (const a of articles) {
    const href = `/articles/${a.slug}`;
    const subject = subjectOf(a.title);
    add(subject, href);
    const bare = stripYear(subject);
    if (bare) add(bare, href);
  }

  for (const g of GAZETTEER) add(g.phrase, `/articles/${g.slug}`);

  // shared topics become concept links (like Wikipedia category links). Multiword
  // tags always qualify; single words must be meaningful (not in the generic list)
  // so "bahaya" or "dunia" never turn into noisy blue links.
  const tagCount = new Map<string, number>();
  for (const a of articles) for (const t of a.tags) tagCount.set(t, (tagCount.get(t) ?? 0) + 1);
  for (const [tag, count] of tagCount) {
    if (count < 2) continue;
    if (!tag.includes(" ")) {
      if (tag.length < 5) continue;
      if (GENERIC_TOPICS.has(tag.toLowerCase())) continue;
    }
    const slug = tag
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    add(tag, `/topik/${slug}`);
  }

  // longest phrases first so "Anak Krakatau" beats "Krakatau" at match time
  return [...byPhrase.values()].sort((a, b) => b.phrase.length - a.phrase.length);
}

type MdastNode = {
  type: string;
  value?: string;
  url?: string;
  data?: { hProperties?: Record<string, unknown> };
  children?: MdastNode[];
};

const SKIP = new Set([
  "link",
  "linkReference",
  "code",
  "inlineCode",
  "heading",
  "definition",
  "image",
  "imageReference",
  "html",
]);

/**
 * Remark plugin. Pass `{ entities, selfHref }`. Wraps the first mention of each
 * entity (other than the current article) in a link node carrying a `wikilink`
 * class so it renders blue and clickable.
 */
export function remarkAutolink(options: { entities: Entity[]; selfHref?: string }) {
  const { entities, selfHref } = options;
  if (!entities || entities.length === 0) return () => {};

  const lookup = new Map(entities.map((e) => [e.phrase, e]));
  const body = entities.map((e) => escapeRegExp(e.phrase)).join("|");
  const regex = new RegExp(`(?<![\\p{L}\\p{N}_])(?:${body})(?![\\p{L}\\p{N}_])`, "gu");

  return (tree: MdastNode) => {
    const used = new Set<string>();

    const linkify = (value: string): MdastNode[] => {
      regex.lastIndex = 0;
      const out: MdastNode[] = [];
      let last = 0;
      let m: RegExpExecArray | null;
      while ((m = regex.exec(value)) !== null) {
        const ent = lookup.get(m[0]);
        if (!ent || used.has(ent.id) || ent.href === selfHref) continue;
        used.add(ent.id);
        if (m.index > last) out.push({ type: "text", value: value.slice(last, m.index) });
        out.push({
          type: "link",
          url: ent.href,
          data: { hProperties: { className: ["wikilink"], "data-wikilink": "true" } },
          children: [{ type: "text", value: m[0] }],
        });
        last = m.index + m[0].length;
      }
      if (out.length === 0) return [{ type: "text", value }];
      if (last < value.length) out.push({ type: "text", value: value.slice(last) });
      return out;
    };

    const walk = (node: MdastNode) => {
      if (!node.children || SKIP.has(node.type)) return;
      const next: MdastNode[] = [];
      for (const child of node.children) {
        if (child.type === "text" && typeof child.value === "string") {
          next.push(...linkify(child.value));
        } else {
          walk(child);
          next.push(child);
        }
      }
      node.children = next;
    };

    walk(tree);
  };
}
