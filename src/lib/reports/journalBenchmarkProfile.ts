export interface JournalBenchmarkProfile {
  benchmarkName: string;
  articleStructure: string[];
  metadataRequirements: string[];
  minimumSectionExpectations: Record<string, string>;
  forbiddenClaims: string[];
  requiredHonestyNotes: string[];
}

export const wildlifeConservationBenchmark: JournalBenchmarkProfile = {
  benchmarkName: "Wildlife Conservation Article Benchmark",
  articleStructure: [
    "Cover Page",
    "Article Title Block",
    "Author Info & Affiliations",
    "Article History Block",
    "Abstract Block",
    "Keywords Block",
    "Introduction",
    "Literature Review / Knowledge Gaps",
    "Materials and Methods",
    "Results and Discussion",
    "Limitations / Future Research",
    "Conclusion",
    "Annexure / Observation Summary",
    "References",
  ],
  metadataRequirements: [
    "title",
    "author",
    "articleType",
    "generatedDate",
    "documentStatus",
    "doiStatus",
    "publicationStatus",
  ],
  minimumSectionExpectations: {
    abstract: "180-300 words target summarize study, method, findings.",
    introduction: "Context of study, gap identification, objective statement.",
    materialsAndMethods: "Study period, study location, observation protocol, ethical limits.",
    results: "Detailed structured observations, figures, tables.",
    discussion: "Broader biological explanation, meaning of findings.",
    conclusion: "Restrained conclusion grounded in physical observations.",
  },
  forbiddenClaims: [
    "Do not claim legal proof.",
    "Do not claim academic peer validation.",
    "Do not claim official publication.",
  ],
  requiredHonestyNotes: [
    "Draft bantuan belajar/penulisan berbasis bukti.",
    "Pengguna wajib memeriksa, mengedit, memverifikasi sumber.",
  ],
};

export const quantitativeConservationAuthorGuideline: JournalBenchmarkProfile = {
  benchmarkName: "Quantitative Conservation Author-Guideline Benchmark",
  articleStructure: [
    "Title Page",
    "Abstract Page",
    "Keywords Block",
    "Introduction",
    "Materials and Methods",
    "Results",
    "Discussion",
    "References",
  ],
  metadataRequirements: [
    "Word limit < 4000 words for research paper",
    "Abstract word count <= 300 words",
    "Keywords count <= 8 (target 4-7)",
  ],
  minimumSectionExpectations: {
    methods: "Must include sample design, animal ethics statement, metric/SI units usage, and replicable data collection protocol.",
    discussion: "Must link to broader conservation implications and conservation policies.",
  },
  forbiddenClaims: [
    "No unpublished data claimed without evidence.",
    "No fake references, fake DOI, or fake ISSN.",
  ],
  requiredHonestyNotes: [
    "Animal ethics compliance statement.",
    "Metric units (SI) mandatory.",
  ],
};

export const combinedNaLiJournalCandidateBenchmark: JournalBenchmarkProfile = {
  benchmarkName: "Combined NaLI Journal Candidate Benchmark",
  articleStructure: [
    "Title Page (NaLI-neutral)",
    "Abstract (Max 300 words)",
    "Keywords (4-7 items, max 8)",
    "Introduction (Context + Gap + Objective)",
    "Literature Review (User-provided references or honest none note)",
    "Materials and Methods (SI units + Ethics safety statement)",
    "Results & Discussion (Evidence-bounded, conservation implications)",
    "Limitations & Future Research",
    "Conclusion (Restrained)",
    "Annexure (Structured observations list)",
    "References (Strictly user-supplied URLs only)",
    "Integrity Footer",
  ],
  metadataRequirements: [
    "articleWordTarget <= 4000",
    "abstractWordCount <= 300",
    "keywordsCount <= 8",
    "publicationClaimAllowed = false",
    "canGenerateJournalPdfNow = false",
  ],
  minimumSectionExpectations: {
    abstract: "180-300 words dense academic summary.",
    introduction: "Research context, knowledge gaps, objective statement.",
    materialsAndMethods: "Observation protocol, time period, location, metric/SI units, ethics safety note.",
    results: "Interpretations separated from evidence, evidence table of physical observations.",
    discussion: "Direct biological analysis and broader conservation implications.",
    limitations: "Specific data limitations, source boundaries.",
    futureResearch: "Explicit next research steps to resolve data gaps.",
    references: "Strictly user-supplied sources or overridden to 'Belum ada referensi yang disediakan'.",
  },
  forbiddenClaims: [
    "No fake DOIs, ISSNs, journal names, editor names, indexations, or publication dates.",
    "No claims of peer-reviewed or ready-to-submit status.",
  ],
  requiredHonestyNotes: [
    "PDF/DOCX public export remains locked/inactive in CP1.",
    "Format ini adalah draf akademik, bukan jurnal terbit.",
    "NaLI tidak membuat DOI/referensi palsu.",
  ],
};
