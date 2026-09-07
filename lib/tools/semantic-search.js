// In-house AI Semantic Search & Intent Matching Engine
// 100% Client-side, zero external API dependencies, zero latency, offline-ready.

// Levenshtein distance for fuzzy typo tolerance
function levenshtein(a, b) {
  if (a === b) return 0;
  if (!a) return b.length;
  if (!b) return a.length;

  const matrix = Array.from({ length: a.length + 1 }, () =>
    new Array(b.length + 1).fill(0)
  );

  for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
  for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1, // deletion
        matrix[i][j - 1] + 1, // insertion
        matrix[i - 1][j - 1] + cost // substitution
      );
    }
  }

  return matrix[a.length][b.length];
}

// Common natural language stop words to filter out intent
const STOP_WORDS = new Set([
  "i", "want", "to", "can", "you", "a", "an", "the", "for", "in", "on", "of",
  "and", "or", "is", "it", "my", "me", "how", "do", "make", "create", "need",
  "please", "help", "tool", "tools", "online", "free", "best", "some", "with",
  "from", "into", "give", "show", "open", "use", "generator", "builder", "any"
]);

// Semantic Concept Clusters / Knowledge Graph
const SEMANTIC_CLUSTERS = {
  "qr-code": [
    "qr", "barcode", "bar code", "scan", "scanner", "scanning", "wifi", "wi fi",
    "link", "url", "website", "vcard", "contact", "phone", "sms", "whatsapp",
    "location", "map", "menu", "restaurant", "table", "payment", "upi", "matrix",
    "quick response", "encode", "code", "square code", "serial", "upc", "ean"
  ],
  "image-resizer": [
    "image", "photo", "picture", "pic", "chobi", "resize", "resizer", "crop",
    "cropper", "cutting", "trim", "aspect ratio", "dimension", "pixel", "pixels",
    "resolution", "scale", "scaling", "compress", "compression", "shrink",
    "reduce size", "reduce mb", "reduce kb", "avatar", "profile", "thumbnail",
    "youtube thumbnail", "instagram", "facebook", "banner", "passport size", "dpi", "jpg", "png", "webp"
  ],
  "cv-builder": [
    "cv", "resume", "curriculum vitae", "biodata", "bio data", "job", "career",
    "employment", "hiring", "apply", "applicant", "application", "ats",
    "ats friendly", "interview", "work", "profession", "portfolio", "fresher",
    "experience", "cover letter", "chakri", "biodata maker", "resume builder"
  ],
  "bg-remover": [
    "background", "bg", "remove background", "remove bg", "transparent",
    "cutout", "cut out", "isolate", "isolation", "magic erase", "eraser",
    "clean background", "white background", "product photo", "portrait",
    "enhance", "enhancer", "upscale", "retouch", "ai photo", "ecommerce",
    "clarity", "face clean", "clear picture"
  ],
  "pdf-converter": [
    "pdf", "convert", "converter", "conversion", "image to pdf", "jpg to pdf",
    "png to pdf", "pdf to image", "pdf to jpg", "combine", "merge", "combine pdf",
    "extract", "pages", "document", "documents", "adobe", "acrobat", "reader",
    "print", "scan to pdf", "office doc", "ebook"
  ],
  "invoice-generator": [
    "invoice", "receipt", "bill", "billing", "quote", "quotation", "estimate",
    "client", "freelance", "freelancer", "payment", "due", "tax", "vat", "gst",
    "accounting", "pos", "cash memo", "memo", "money", "charges", "hisab",
    "financial", "voucher", "commercial bill"
  ]
};

// Normalize text for matching
function cleanText(text) {
  return (text || "")
    .toLowerCase()
    .replace(/[^\w\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * AI Semantic Matcher for Rootixa Tools
 * Evaluates semantic concepts, keyword expansion, intent phrases, and typo tolerance.
 * Returns an array of matched tools annotated with `matchReason` and `relevanceScore`.
 */
export function searchToolsSemantic(tools, query) {
  const normalizedQuery = cleanText(query);
  if (!normalizedQuery) {
    return tools.map((t) => ({ ...t, relevanceScore: 100, matchReason: null }));
  }

  // Tokenize and filter stop words
  const allTokens = normalizedQuery.split(" ").filter(Boolean);
  const meaningfulTokens = allTokens.filter((t) => !STOP_WORDS.has(t));
  const tokensToUse = meaningfulTokens.length > 0 ? meaningfulTokens : allTokens;

  const scoredResults = [];

  for (const tool of tools) {
    let score = 0;
    const matchReasons = new Set();

    const toolNameNorm = cleanText(tool.name);
    const toolDescNorm = cleanText(tool.desc);
    const toolCatNorm = cleanText(tool.category);
    const cluster = SEMANTIC_CLUSTERS[tool.id] || [];
    const toolKeywords = (tool.keywords || []).map(cleanText);
    const toolIntents = (tool.intents || []).map(cleanText);

    // 1. Direct Whole Query Match in Title, Keywords or Category
    if (toolNameNorm === normalizedQuery || toolNameNorm.startsWith(normalizedQuery)) {
      score += 150;
      matchReasons.add(`Matches tool name: "${tool.name}"`);
    } else if (toolNameNorm.includes(normalizedQuery)) {
      score += 120;
      matchReasons.add(`Matches tool name: "${tool.name}"`);
    } else if (toolCatNorm.includes(normalizedQuery)) {
      score += 90;
      matchReasons.add(`Category match: ${tool.category}`);
    }

    // 2. Exact phrase in Intents
    for (const intent of toolIntents) {
      if (intent.includes(normalizedQuery) || normalizedQuery.includes(intent)) {
        score += 110;
        matchReasons.add(`Matches intent: "${intent}"`);
        break;
      }
    }

    // 3. Token-by-token Semantic Matching
    for (const token of tokensToUse) {
      if (token.length < 2) continue;

      // Token in title
      if (toolNameNorm.includes(token)) {
        score += 60;
        matchReasons.add(`Title keyword: "${token}"`);
        continue;
      }

      // Token in category
      if (toolCatNorm.includes(token)) {
        score += 45;
        matchReasons.add(`Category: ${tool.category}`);
        continue;
      }

      // Token exact match in semantic cluster
      let clusterMatchFound = false;
      for (const keyword of cluster) {
        if (keyword === token) {
          score += 55;
          matchReasons.add(`Related concept: "${keyword}"`);
          clusterMatchFound = true;
          break;
        } else if (keyword.length > 3 && keyword.includes(token)) {
          score += 35;
          matchReasons.add(`Related to: "${keyword}"`);
          clusterMatchFound = true;
          break;
        }
      }

      // Token in custom keywords
      if (!clusterMatchFound) {
        for (const kw of toolKeywords) {
          if (kw === token) {
            score += 50;
            matchReasons.add(`Related task: "${kw}"`);
            break;
          } else if (kw.length > 3 && kw.includes(token)) {
            score += 30;
            matchReasons.add(`Related task: "${kw}"`);
            break;
          }
        }
      }

      // Token in description (word boundary match only)
      const descWords = toolDescNorm.split(" ");
      if (descWords.includes(token)) {
        score += 25;
        if (matchReasons.size === 0) {
          matchReasons.add(`Matches description`);
        }
      }

      // 4. Fuzzy Typo Matching (Levenshtein distance <= 2 for words >= 4 chars)
      if (score === 0 && token.length >= 4) {
        for (const keyword of cluster) {
          if (keyword.length >= 4 && Math.abs(keyword.length - token.length) <= 1) {
            const dist = levenshtein(token, keyword);
            if (dist === 1) {
              score += 65; // High confidence typo
              matchReasons.add(`Recognized as "${keyword}"`);
              break;
            } else if (dist === 2 && token.length >= 6) {
              score += 35;
              matchReasons.add(`Close to "${keyword}"`);
              break;
            }
          }
        }
      }
    }

    // If score > 0, include in candidate list
    if (score > 0) {
      scoredResults.push({
        ...tool,
        relevanceScore: score,
        matchReason: Array.from(matchReasons).slice(0, 2).join(" • "),
      });
    }
  }

  if (scoredResults.length === 0) return [];

  // Sort by highest relevance score first
  scoredResults.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // Dynamic relevance thresholding: filter out low-scoring noise
  const maxScore = scoredResults[0].relevanceScore;
  const threshold = Math.max(35, maxScore * 0.4);

  return scoredResults.filter((r) => r.relevanceScore >= threshold);
}
