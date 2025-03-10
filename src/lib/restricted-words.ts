// Restricted words list in English and Bulgarian
// These words are not allowed in image prompts for safety reasons

// English restricted words
export const RESTRICTED_WORDS_EN = [
  'pussy', 'vagina', 'dick', 'penis', 'fuck', 'sex', 'naked', 'tits', 
  'boobs', 'porn', 'anal', 'ass', 'deepthroat', 'suck', 'fucking', 
  'sexual', 'erotic', 'cock', 'nfsw', 'hentai', 'nigger', 'nigga', 
  'slave', 'hitler', 'racist', 'killing', 'die'
];

// Bulgarian restricted words - translations and variants
export const RESTRICTED_WORDS_BG = [
  'путка', 'вагина', 'кур', 'пенис', 'еба', 'ебане', 'секс', 'гол', 'гола', 'голи',
  'цици', 'гърди', 'порно', 'анален', 'задник', 'смуча', 'ебане', 'ебът', 'ебъл',
  'сексуален', 'сексуално', 'еротичен', 'еротично', 'кур', 'нфсв', 'хентай',
  'нигър', 'негър', 'роб', 'хитлер', 'расист', 'убиване', 'умри', 'умирам', 'цомби',
  'дупе', 'дърт', 'пишка', 'педераст', 'педал', 'гей', 'лесбийка', 'лизбийка', 
  'шибан', 'шибано', 'майната'
];

/**
 * Checks if text contains any restricted words
 * @param text Text to check
 * @returns true if restricted words found, false otherwise
 */
export function containsRestrictedWords(text: string): boolean {
  if (!text) return false;
  
  // Convert to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase();
  
  // Check English restricted words
  for (const word of RESTRICTED_WORDS_EN) {
    if (lowerText.includes(word.toLowerCase())) {
      console.log(`Restricted word found (EN): ${word}`);
      return true;
    }
  }
  
  // Check Bulgarian restricted words
  for (const word of RESTRICTED_WORDS_BG) {
    if (lowerText.includes(word.toLowerCase())) {
      console.log(`Restricted word found (BG): ${word}`);
      return true;
    }
  }
  
  return false;
}