// LanguageTool's free public API: no key needed, limited to 20 requests/minute and 20,000 characters per request
const API_URL = 'https://api.languagetool.org/v2/check';
const LANGUAGE = 'en-US';

// thrown for failures that have a message worth showing to the user as-is
export class ProofreadError extends Error {}

// a flagged capitalised word in the middle of a sentence is more likely a character or place name than a typo
function looksLikeName(story, match) {
  if (match.rule.issueType !== 'misspelling') return false;
  const word = story.slice(match.offset, match.offset + match.length);
  if (!/^\p{Lu}/u.test(word)) return false;
  const before = story.slice(0, match.offset).trimEnd();
  const startsSentence = before === '' || /[.!?…:"“‘'(\n]$/.test(before);
  return !startsSentence;
}

// LanguageTool ranks suggestions by likelihood, but often puts a proper noun first ("forrest" -> "Forrest"),
// so prefer the first suggestion that keeps the original's capitalisation
function pickReplacement(original, replacements) {
  if (replacements.length === 0) return null;
  const isUpper = (text) => /^\p{Lu}/u.test(text);
  const sameCase = replacements.find((r) => isUpper(r.value) === isUpper(original));
  return (sameCase ?? replacements[0]).value;
}

// returns { correctedText, issues: [{ category, original, correction, explanation, applied }] }
// correction is null when LanguageTool has no suggestion; applied is false when the fix was left out of correctedText
export async function proofreadStory(story) {
  let response;
  try {
    response = await fetch(API_URL, {
      method: 'POST',
      body: new URLSearchParams({ text: story, language: LANGUAGE }),
      signal: AbortSignal.timeout(30_000),
    });
  } catch (error) {
    console.error('LanguageTool request failed:', error);
    throw new ProofreadError("Couldn't reach the proofreading service. Try again in a moment.");
  }

  if (response.status === 429) {
    throw new ProofreadError('The proofreader is being rate limited right now. Try again in a minute.');
  }
  if (!response.ok) {
    throw new Error(`LanguageTool responded ${response.status}: ${await response.text()}`);
  }

  const { matches } = await response.json();

  const issues = matches.map((match) => {
    const original = story.slice(match.offset, match.offset + match.length);
    const correction = pickReplacement(original, match.replacements);
    const isName = looksLikeName(story, match);
    return {
      category: match.rule.category.name,
      original,
      correction,
      explanation: isName ? `${match.message} Left unchanged in case it's a name.` : match.message,
      applied: correction !== null && !isName,
      offset: match.offset,
      length: match.length,
    };
  });

  // apply from the end backwards so earlier offsets stay valid
  let correctedText = story;
  let lastStart = Infinity;
  for (const issue of [...issues].sort((a, b) => b.offset - a.offset)) {
    if (!issue.applied) continue;
    // two rules can flag overlapping text; keep the later one and only report the other
    if (issue.offset + issue.length > lastStart) {
      issue.applied = false;
      continue;
    }
    correctedText = correctedText.slice(0, issue.offset) + issue.correction + correctedText.slice(issue.offset + issue.length);
    lastStart = issue.offset;
  }

  return { correctedText, issues };
}
