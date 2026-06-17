import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const ARTICLES_DIR = "./content/articles";
const files = fs.readdirSync(ARTICLES_DIR).filter(f => /\.mdx?$/.test(f));

console.log(`Auditing ${files.length} articles...\n`);

const results = [];

const CONJUNCTIONS = /^[ \t]*(Tapi|Dan|Karena|Sehingga)\b/m;
const IN_LINE_CONJUNCTIONS = /\.\s+(Tapi|Dan|Karena|Sehingga)\b/g;
const LAZY_ENDINGS = /\b(Kesimpulannya|Akhir kata|Jadi dapat disimpulkan|Kesimpulan)\b/i;
const EM_DASH = "\u2014";

files.forEach(file => {
  const filePath = path.join(ARTICLES_DIR, file);
  const rawContent = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(rawContent);
  
  const wordCount = content.split(/\s+/).filter(Boolean).length;
  const imageCount = Array.isArray(data.images) ? data.images.length : 0;
  
  // Split into paragraphs
  const paragraphs = content.split(/\n{2,}/).map(p => p.trim()).filter(Boolean);
  
  const longParagraphs = [];
  const conjunctionViolations = [];
  let lazyEndingFound = false;
  let hasEmDash = rawContent.includes(EM_DASH);
  
  paragraphs.forEach((p, idx) => {
    // Check paragraph length
    const words = p.split(/\s+/).filter(Boolean).length;
    if (words > 80 && !p.startsWith("```") && !p.startsWith("|")) {
      longParagraphs.push({ index: idx + 1, wordCount: words, text: p.slice(0, 60) + "..." });
    }
    
    // Check starting conjunctions
    if (CONJUNCTIONS.test(p)) {
      conjunctionViolations.push({ index: idx + 1, type: "start-of-paragraph", text: p.slice(0, 40) + "..." });
    }
    
    const inlineMatches = p.match(IN_LINE_CONJUNCTIONS);
    if (inlineMatches) {
      conjunctionViolations.push({ index: idx + 1, type: "in-line", matches: inlineMatches });
    }
  });
  
  // Check closing paragraph
  if (paragraphs.length > 0) {
    const lastP = paragraphs[paragraphs.length - 1];
    if (LAZY_ENDINGS.test(lastP)) {
      lazyEndingFound = true;
    }
  }
  
  results.push({
    file,
    title: data.title || file,
    wordCount,
    imageCount,
    longParagraphsCount: longParagraphs.length,
    longParagraphs,
    conjunctionViolationsCount: conjunctionViolations.length,
    conjunctionViolations,
    lazyEndingFound,
    hasEmDash
  });
});

// Print summary
console.log("=== AUDIT SUMMARY ===");
results.forEach(r => {
  const issues = [];
  if (r.wordCount < 1200 || r.wordCount > 1400) issues.push(`Word count: ${r.wordCount} (Target: 1200-1400)`);
  if (r.imageCount < 4) issues.push(`Images: ${r.imageCount} (Target: >= 4)`);
  if (r.longParagraphsCount > 0) issues.push(`Long paragraphs: ${r.longParagraphsCount}`);
  if (r.conjunctionViolationsCount > 0) issues.push(`Forbidden starting conjunctions: ${r.conjunctionViolationsCount}`);
  if (r.lazyEndingFound) issues.push(`Lazy ending found`);
  if (r.hasEmDash) issues.push(`EM DASH FOUND! (BANNED)`);
  
  if (issues.length > 0) {
    console.log(`\n📄 ${r.file} (${r.title.slice(0, 40)})`);
    issues.forEach(iss => console.log(`   ⚠️  ${iss}`));
  } else {
    console.log(`✅ ${r.file} - All checks compliant!`);
  }
});
