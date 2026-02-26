/**
 * EmotionMatrix
 * Phase 4.1: Map content metadata to emotional states
 * Fuse user interaction sentiment with prediction weighting
 */

import { PrismaClient } from '@prisma/client';

export interface EmotionalState {
  primary: string; // Primary emotion
  secondary: string[]; // Secondary emotions
  intensity: number; // 0.0 to 1.0
  valence: number; // -1.0 (negative) to 1.0 (positive)
  arousal: number; // 0.0 (calm) to 1.0 (excited)
}

export interface ContentEmotionalProfile {
  movieId: string;
  emotionalStates: EmotionalState[];
  tone: 'dark' | 'light' | 'neutral' | 'mixed';
  soundtrack: 'energetic' | 'melancholic' | 'uplifting' | 'tense' | 'neutral';
  visuals: 'vibrant' | 'muted' | 'stylized' | 'realistic';
  emotionalTags: string[];
}

export interface EmotionWeightedPrediction {
  prediction: any; // Original prediction
  emotionalLikelihood: number; // 0.0 to 1.0 - how likely given emotional state
  emotionalResonance: number; // 0.0 to 1.0 - how well it resonates
  adjustedConfidence: number; // Original confidence adjusted by emotion
}

/**
 * EmotionMatrix - Maps content to emotional states and fuses sentiment
 */
export class EmotionMatrix {
  private prisma: PrismaClient;
  private contentProfiles: Map<string, ContentEmotionalProfile> = new Map();
  private readonly EMPATHY_CALIBRATION_THRESHOLD = 0.6; // Threshold for high empathy
  private readonly MOOD_DRIVEN_DECAY_CONSTANT = 0.05; // How quickly mood influence decays

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  /**
   * Get emotional profile for content
   */
  async getEmotionalProfile(movieId: string): Promise<ContentEmotionalProfile> {
    if (this.contentProfiles.has(movieId)) {
      return this.contentProfiles.get(movieId)!;
    }

    // Analyze movie to determine emotional profile
    const movie = await this.prisma.movie.findUnique({
      where: { id: movieId },
      include: {
        categories: {
          include: { category: true }
        },
        reviews: {
          take: 10,
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!movie) {
      // Default profile
      return this.createDefaultProfile(movieId);
    }

    const profile = this.analyzeContentEmotions(movie);
    this.contentProfiles.set(movieId, profile);
    return profile;
  }

  /**
   * Analyze content to extract emotional profile
   */
  private analyzeContentEmotions(movie: any): ContentEmotionalProfile {
    const genres = movie.categories.map((c: any) => c.category.name);
    const rating = movie.rating || 5.0;
    const reviews = movie.reviews || [];

    // Determine tone from genres and rating
    let tone: ContentEmotionalProfile['tone'] = 'neutral';
    if (genres.includes('Horror') || genres.includes('Thriller')) {
      tone = 'dark';
    } else if (genres.includes('Comedy') || genres.includes('Romance')) {
      tone = 'light';
    } else if (genres.length > 2) {
      tone = 'mixed';
    }

    // Infer soundtrack from genres
    let soundtrack: ContentEmotionalProfile['soundtrack'] = 'neutral';
    if (genres.includes('Action') || genres.includes('Adventure')) {
      soundtrack = 'energetic';
    } else if (genres.includes('Drama') || genres.includes('Romance')) {
      soundtrack = rating > 7 ? 'uplifting' : 'melancholic';
    } else if (genres.includes('Horror') || genres.includes('Thriller')) {
      soundtrack = 'tense';
    }

    // Infer visuals from genres
    let visuals: ContentEmotionalProfile['visuals'] = 'realistic';
    if (genres.includes('Sci-Fi') || genres.includes('Fantasy')) {
      visuals = 'stylized';
    } else if (genres.includes('Action') || genres.includes('Adventure')) {
      visuals = 'vibrant';
    } else if (genres.includes('Drama') || genres.includes('Thriller')) {
      visuals = 'muted';
    }

    // Extract emotional states
    const emotionalStates = this.extractEmotionalStates(genres, rating, reviews);

    // Generate emotional tags
    const emotionalTags = this.generateEmotionalTags(genres, tone, emotionalStates);

    return {
      movieId: movie.id,
      emotionalStates,
      tone,
      soundtrack,
      visuals,
      emotionalTags
    };
  }

  /**
   * Extract emotional states from content
   */
  private extractEmotionalStates(
    genres: string[],
    rating: number,
    reviews: any[]
  ): EmotionalState[] {
    const states: EmotionalState[] = [];

    // Genre-based emotions
    if (genres.includes('Horror')) {
      states.push({
        primary: 'fear',
        secondary: ['suspense', 'anxiety'],
        intensity: 0.8,
        valence: -0.6,
        arousal: 0.9
      });
    }

    if (genres.includes('Comedy')) {
      states.push({
        primary: 'joy',
        secondary: ['amusement', 'lightness'],
        intensity: 0.7,
        valence: 0.8,
        arousal: 0.6
      });
    }

    if (genres.includes('Drama')) {
      states.push({
        primary: rating > 7 ? 'empathy' : 'melancholy',
        secondary: ['contemplation', 'reflection'],
        intensity: 0.6,
        valence: rating > 7 ? 0.5 : -0.3,
        arousal: 0.4
      });
    }

    if (genres.includes('Action')) {
      states.push({
        primary: 'excitement',
        secondary: ['adrenaline', 'energy'],
        intensity: 0.9,
        valence: 0.7,
        arousal: 0.95
      });
    }

    if (genres.includes('Romance')) {
      states.push({
        primary: 'love',
        secondary: ['warmth', 'tenderness'],
        intensity: 0.7,
        valence: 0.9,
        arousal: 0.5
      });
    }

    // Default if no specific emotions
    if (states.length === 0) {
      states.push({
        primary: 'curiosity',
        secondary: ['interest'],
        intensity: 0.5,
        valence: 0.3,
        arousal: 0.5
      });
    }

    return states;
  }

  /**
   * Generate emotional tags
   */
  private generateEmotionalTags(
    genres: string[],
    tone: string,
    emotionalStates: EmotionalState[]
  ): string[] {
    const tags: string[] = [];

    // Add tone
    tags.push(tone);

    // Add primary emotions
    emotionalStates.forEach(state => {
      tags.push(state.primary);
      tags.push(...state.secondary);
    });

    // Add genre-based tags
    genres.forEach(genre => {
      tags.push(genre.toLowerCase());
    });

    return [...new Set(tags)]; // Deduplicate
  }

  /**
   * Create default emotional profile
   */
  private createDefaultProfile(movieId: string): ContentEmotionalProfile {
    return {
      movieId,
      emotionalStates: [{
        primary: 'curiosity',
        secondary: ['interest'],
        intensity: 0.5,
        valence: 0.3,
        arousal: 0.5
      }],
      tone: 'neutral',
      soundtrack: 'neutral',
      visuals: 'realistic',
      emotionalTags: ['neutral', 'curiosity']
    };
  }

  /**
   * Fuse user sentiment with prediction weighting
   */
  async fuseSentimentWithPrediction(
    prediction: any,
    userEmotionalState: EmotionalState,
    contentProfile: ContentEmotionalProfile
  ): Promise<EmotionWeightedPrediction> {
    // Calculate emotional likelihood (how likely is this prediction given emotional state)
    const emotionalLikelihood = this.calculateEmotionalLikelihood(
      userEmotionalState,
      contentProfile
    );

    // Calculate emotional resonance (how well does it resonate)
    const emotionalResonance = this.calculateEmotionalResonance(
      userEmotionalState,
      contentProfile
    );

    // Adjust confidence based on emotional factors
    const baseConfidence = prediction.confidence || 0.5;
    const emotionalBoost = (emotionalLikelihood + emotionalResonance) / 2;
    const adjustedConfidence = Math.min(1.0, baseConfidence * (1 + emotionalBoost * 0.3));

    return {
      prediction,
      emotionalLikelihood,
      emotionalResonance,
      adjustedConfidence
    };
  }

  /**
   * Calculate emotional likelihood
   */
  private calculateEmotionalLikelihood(
    userState: EmotionalState,
    contentProfile: ContentEmotionalProfile
  ): number {
    // Match user's emotional state with content's emotional profile
    let match = 0;
    let total = 0;

    contentProfile.emotionalStates.forEach(contentState => {
      // Valence match (positive/negative alignment)
      const valenceMatch = 1 - Math.abs(userState.valence - contentState.valence) / 2;
      
      // Arousal match (energy level alignment)
      const arousalMatch = 1 - Math.abs(userState.arousal - contentState.arousal);
      
      // Primary emotion match
      const emotionMatch = userState.primary === contentState.primary ? 1.0 : 0.5;
      
      const combined = (valenceMatch + arousalMatch + emotionMatch) / 3;
      match += combined * contentState.intensity;
      total += contentState.intensity;
    });

    return total > 0 ? match / total : 0.5;
  }

  /**
   * Calculate emotional resonance
   */
  private calculateEmotionalResonance(
    userState: EmotionalState,
    contentProfile: ContentEmotionalProfile
  ): number {
    // Resonance is about complementarity, not just matching
    // Sometimes users want content that complements their mood
    // (e.g., sad mood might want uplifting content)

    // For now, use similarity (can be enhanced with complementarity logic)
    return this.calculateEmotionalLikelihood(userState, contentProfile);
  }

  /**
   * Get empathy calibration status
   */
  getEmpathyCalibration(): {
    threshold: number;
    currentLevel: number;
    status: 'calibrated' | 'under_calibrated' | 'over_calibrated';
  } {
    // Simplified - in production, would track actual empathy metrics
    const currentLevel = 0.65; // Example
    
    let status: 'calibrated' | 'under_calibrated' | 'over_calibrated';
    if (currentLevel >= this.EMPATHY_CALIBRATION_THRESHOLD) {
      status = 'calibrated';
    } else if (currentLevel < this.EMPATHY_CALIBRATION_THRESHOLD * 0.8) {
      status = 'under_calibrated';
    } else {
      status = 'over_calibrated';
    }

    return {
      threshold: this.EMPATHY_CALIBRATION_THRESHOLD,
      currentLevel,
      status
    };
  }

  /**
   * Get mood-driven decay constant
   */
  getMoodDecayConstant(): number {
    return this.MOOD_DRIVEN_DECAY_CONSTANT;
  }
}

