/**
 * Translates English text to Marathi using MyMemory Translation API
 * Free API with no authentication required
 * @param text - English text to translate
 * @returns Promise with Marathi translation
 */
export async function translateToMarathi(text: string): Promise<string> {
  try {
    if (!text.trim()) {
      return '';
    }

    // Using MyMemory API - free, no API key required
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|mr`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      throw new Error('Translation API error');
    }

    const data = await response.json();

    // Check if translation was successful
    if (data.responseStatus === 200 && data.responseData.translatedText) {
      return data.responseData.translatedText;
    } else if (data.responseStatus === 400) {
      // No translation available, return original
      console.warn('Translation not available for this text');
      return text;
    }

    throw new Error('Translation failed');
  } catch (error) {
    console.error('Translation error:', error);
    // Return original text as fallback
    return text;
  }
}

/**
 * Simple translation function using a basic transliteration approach
 * This is a placeholder - in production, integrate with Google Translate API or similar service
 */
export function simplifyMarathiTranslation(englishText: string): string {
  // This is a placeholder - in production, use a proper translation service
  // You can integrate with:
  // 1. Google Translate API
  // 2. Microsoft Translator
  // 3. Other translation services
  
  // For now, return the original text
  // The admin can manually enter Marathi text
  return englishText;
}
