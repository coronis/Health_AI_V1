import synonymsData from '../data/synonyms.en-hi.json';
import canonicalData from '../data/canonical_ingredients.json';

export interface FoodSynonym {
  english: string;
  hinglish: string[];
}

export interface CanonicalIngredient {
  names: string[];
  category: string;
  nutrition_id: string;
}

export class FoodMappingService {
  private synonyms: Record<string, string[]>;
  private canonical: Record<string, CanonicalIngredient>;

  constructor() {
    this.synonyms = synonymsData.synonyms;
    this.canonical = this.flattenCanonicalIngredients(canonicalData.ingredients);
  }

  private flattenCanonicalIngredients(ingredients: any): Record<string, CanonicalIngredient> {
    const flattened: Record<string, CanonicalIngredient> = {};
    
    Object.values(ingredients).forEach((category: any) => {
      Object.entries(category).forEach(([key, ingredient]: [string, any]) => {
        flattened[key] = ingredient;
      });
    });
    
    return flattened;
  }

  /**
   * Get all synonyms for a given English food term
   */
  getSynonyms(englishTerm: string): string[] {
    const normalized = englishTerm.toLowerCase().replace(/\s+/g, '_');
    return this.synonyms[normalized] || [];
  }

  /**
   * Find English term from Hinglish/Hindi input
   */
  findEnglishTerm(hinglishTerm: string): string | null {
    const normalized = hinglishTerm.toLowerCase().trim();
    
    for (const [english, synonyms] of Object.entries(this.synonyms)) {
      if (synonyms.some(synonym => 
        synonym.toLowerCase() === normalized || 
        synonym === normalized
      )) {
        return english.replace(/_/g, ' ');
      }
    }
    
    return null;
  }

  /**
   * Get canonical ingredient information
   */
  getCanonicalIngredient(key: string): CanonicalIngredient | null {
    return this.canonical[key] || null;
  }

  /**
   * Search for ingredients by name (supports fuzzy matching)
   */
  searchIngredients(searchTerm: string): Array<{ key: string; ingredient: CanonicalIngredient; score: number }> {
    const normalized = searchTerm.toLowerCase();
    const results: Array<{ key: string; ingredient: CanonicalIngredient; score: number }> = [];

    Object.entries(this.canonical).forEach(([key, ingredient]) => {
      let maxScore = 0;
      
      ingredient.names.forEach(name => {
        const nameLower = name.toLowerCase();
        if (nameLower.includes(normalized)) {
          const score = normalized.length / nameLower.length;
          maxScore = Math.max(maxScore, score);
        }
      });

      if (maxScore > 0) {
        results.push({ key, ingredient, score: maxScore });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  /**
   * Transliterate text from English to Hinglish approximation
   */
  transliterate(englishText: string): string {
    let result = englishText.toLowerCase();
    
    // Simple transliteration rules (can be enhanced)
    const transliterationMap: Record<string, string> = {
      'water': 'paani',
      'rice': 'chawal',
      'bread': 'roti',
      'milk': 'doodh',
      'tea': 'chai',
      'coffee': 'coffee',
      'food': 'khana'
    };

    Object.entries(transliterationMap).forEach(([en, hi]) => {
      result = result.replace(new RegExp(`\\b${en}\\b`, 'g'), hi);
    });

    return result;
  }
}

export default FoodMappingService;