// Audio Utils - Helper functions for handling audio files in both dev and production
import { AudioSource } from 'expo-audio';

/**
 * Converts a require() result to a proper AudioSource for expo-audio
 * Handles both development (where require() returns objects) and production (where require() returns numbers)
 * @param requireResult - The result of require('./path/to/audio.mp3')
 * @returns AudioSource that can be used with expo-audio
 */
export function createAudioSourceFromRequire(requireResult: any): AudioSource {
  // In production builds, require() returns a number (asset reference)
  if (typeof requireResult === 'number') {
    return requireResult;
  }
  
  // In development, require() might return an object with uri property
  if (requireResult && typeof requireResult === 'object') {
    if (requireResult.uri) {
      return { uri: requireResult.uri };
    }
    
    // Some cases it might be the object itself
    return requireResult;
  }
  
  // Fallback: treat as direct source
  return requireResult;
}

/**
 * Creates an AudioSource from a URI string
 * @param uri - The URI string to the audio file
 * @returns AudioSource that can be used with expo-audio
 */
export function createAudioSourceFromUri(uri: string): AudioSource {
  return { uri };
}

/**
 * Validates if an audio source is properly formatted
 * @param audioSource - The audio source to validate
 * @returns true if valid, false otherwise
 */
export function isValidAudioSource(audioSource: any): boolean {
  if (typeof audioSource === 'number') {
    return true; // Asset reference
  }
  
  if (audioSource && typeof audioSource === 'object' && audioSource.uri) {
    return typeof audioSource.uri === 'string'; // URI object
  }
  
  return false;
}

/**
 * Logs audio source information for debugging
 * @param audioSource - The audio source to debug
 * @param context - Context string for logging
 */
export function debugAudioSource(audioSource: any, context: string = 'Audio') {
  console.log(`🎵 ${context} Source Debug:`, {
    type: typeof audioSource,
    value: audioSource,
    isNumber: typeof audioSource === 'number',
    hasUri: audioSource && typeof audioSource === 'object' && audioSource.uri,
    isValid: isValidAudioSource(audioSource)
  });
}
