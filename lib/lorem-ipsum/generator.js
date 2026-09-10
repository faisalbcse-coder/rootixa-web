import {
  CLASSIC_OPENING,
  CLASSIC_SENTENCE_OPENING,
  CLASSIC_WORDS_OPENING,
  LATIN_VOCABULARY,
  HEADING_TEMPLATES,
} from "./corpus.js";

/**
 * Seeded / pseudo-random helper to pick a random integer between min and max inclusive
 */
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Get a random word from the vocabulary
 */
function getRandomWord(vocab = LATIN_VOCABULARY) {
  return vocab[Math.floor(Math.random() * vocab.length)];
}

/**
 * Capitalize first letter of a string
 */
function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generate a single natural Latin sentence
 */
function generateSentence(vocab = LATIN_VOCABULARY, wordCount = null) {
  const count = wordCount || getRandomInt(8, 18);
  const words = [];

  for (let i = 0; i < count; i++) {
    words.push(getRandomWord(vocab));
  }

  // Add occasional mid-sentence comma if sentence is long enough (10+ words)
  if (count >= 10 && Math.random() > 0.4) {
    const commaPos = getRandomInt(3, count - 4);
    words[commaPos] = words[commaPos] + ",";
  }

  const sentence = words.join(" ") + ".";
  return capitalize(sentence);
}

/**
 * Generate a single natural Latin paragraph (approx 50-100 words)
 */
function generateParagraph(vocab = LATIN_VOCABULARY) {
  const sentenceCount = getRandomInt(4, 7);
  const sentences = [];

  for (let i = 0; i < sentenceCount; i++) {
    sentences.push(generateSentence(vocab));
  }

  return sentences.join(" ");
}

/**
 * Pick a heading for paragraph
 */
function getHeading(index) {
  return HEADING_TEMPLATES[index % HEADING_TEMPLATES.length];
}

/**
 * Main Lorem Ipsum Generator function
 *
 * @param {Object} options
 * @param {'paragraphs' | 'sentences' | 'words'} options.mode - Generator mode
 * @param {number} options.count - Number of items (1-50)
 * @param {boolean} options.startWithLorem - Start with classic "Lorem ipsum..."
 * @param {boolean} options.randomize - Randomize text structure
 * @param {boolean} options.includeHeadings - Include headings before paragraphs
 * @returns {Object} { items: Array<{ heading?: string, text: string }>, rawText: string, stats: Object }
 */
export function generateLoremIpsum({
  mode = "paragraphs",
  count = 3,
  startWithLorem = true,
  randomize = true,
  includeHeadings = false,
} = {}) {
  const num = Number(count);
  const safeCount = isNaN(num) ? 3 : Math.max(1, Math.min(50, num));
  const items = [];

  // Determine vocabulary set (if not random, use stable sequence)
  const vocab = randomize
    ? LATIN_VOCABULARY
    : [...LATIN_VOCABULARY].sort();

  if (mode === "paragraphs") {
    for (let i = 0; i < safeCount; i++) {
      let paragraphText = "";

      if (i === 0 && startWithLorem) {
        paragraphText = CLASSIC_OPENING;
      } else {
        paragraphText = generateParagraph(vocab);
      }

      const item = { text: paragraphText };

      if (includeHeadings) {
        item.heading = getHeading(i);
      }

      items.push(item);
    }
  } else if (mode === "sentences") {
    for (let i = 0; i < safeCount; i++) {
      let sentenceText = "";

      if (i === 0 && startWithLorem) {
        sentenceText = CLASSIC_SENTENCE_OPENING;
      } else {
        sentenceText = generateSentence(vocab);
      }

      items.push({ text: sentenceText });
    }
  } else if (mode === "words") {
    const selectedWords = [];

    if (startWithLorem) {
      for (let i = 0; i < safeCount; i++) {
        if (i < CLASSIC_WORDS_OPENING.length) {
          selectedWords.push(CLASSIC_WORDS_OPENING[i]);
        } else {
          selectedWords.push(getRandomWord(vocab));
        }
      }
    } else {
      for (let i = 0; i < safeCount; i++) {
        selectedWords.push(getRandomWord(vocab));
      }
    }

    if (selectedWords.length > 0) {
      selectedWords[0] = capitalize(selectedWords[0]);
    }

    const wordsText = selectedWords.join(" ");
    items.push({ text: wordsText });
  }

  // Construct raw text for copying and downloading
  const rawText = buildRawText(items, mode, includeHeadings);
  const stats = calculateStats(rawText, items, mode);

  return {
    items,
    rawText,
    stats,
  };
}

/**
 * Format items into clean raw string for clipboard / download
 */
function buildRawText(items, mode, includeHeadings) {
  if (mode === "words") {
    return items.map((i) => i.text).join(" ");
  }

  if (mode === "sentences") {
    return items.map((i) => i.text).join(" ");
  }

  // Paragraphs
  return items
    .map((item) => {
      if (includeHeadings && item.heading) {
        return `${item.heading}\n\n${item.text}`;
      }
      return item.text;
    })
    .join("\n\n");
}

/**
 * Calculate stats (words, characters, paragraphs/sentences)
 */
export function calculateStats(rawText, items = [], mode = "paragraphs") {
  if (!rawText || rawText.trim().length === 0) {
    return {
      words: 0,
      characters: 0,
      charactersWithoutSpaces: 0,
      paragraphs: 0,
      sentences: 0,
    };
  }

  const trimmed = rawText.trim();

  // Word count: split by whitespace
  const wordMatches = trimmed.match(/\b[\w'-]+\b/g);
  const words = wordMatches ? wordMatches.length : 0;

  // Character count
  const characters = trimmed.length;
  const charactersWithoutSpaces = trimmed.replace(/\s+/g, "").length;

  // Paragraph count
  const paragraphs = mode === "paragraphs" ? items.length : (trimmed.split(/\n\s*\n/).filter(Boolean).length || 1);

  // Sentence count (ends with . or ! or ?)
  const sentenceMatches = trimmed.match(/[^.!?]+[.!?]+/g);
  const sentences = sentenceMatches ? sentenceMatches.length : (mode === "sentences" ? items.length : 1);

  return {
    words,
    characters,
    charactersWithoutSpaces,
    paragraphs,
    sentences,
  };
}

/**
 * Client-side plain-text file download utility
 */
export function downloadAsTxt(filename = "lorem-ipsum.txt", content = "") {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename.endsWith(".txt") ? filename : `${filename}.txt`;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}
