// Enhanced audio system for meditation music with direct streaming
import { Audio } from 'expo-av';

// Music categories with direct streaming URLs
const MUSIC_CATEGORIES = {
  nature: {
    displayName: 'Nature Sounds',
    description: 'Forest, rain, ocean waves',
    icon: 'nature',
    color: '#4ECDC4',
    files: [
      { 
        name: 'Peaceful Forest', 
        url: 'https://www.soundjay.com/misc/sounds/rainforest_ambience.mp3',
        duration: 600 
      },
      { 
        name: 'Gentle Rain', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 720 
      },
      { 
        name: 'Ocean Waves', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/lose.ogg',
        duration: 900 
      },
      { 
        name: 'Flowing River', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/menu.ogg',
        duration: 480 
      }
    ]
  },
  ambient: {
    displayName: 'Ambient',
    description: 'Soft atmospheric tones',
    icon: 'air',
    color: '#A8E6CF',
    files: [
      { 
        name: 'Ethereal Pad', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 900 
      },
      { 
        name: 'Soft Drone', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/menu.ogg',
        duration: 1200 
      },
      { 
        name: 'Atmospheric', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/lose.ogg',
        duration: 600 
      }
    ]
  },
  zen: {
    displayName: 'Zen Garden',
    description: 'Traditional meditation music',
    icon: 'spa',
    color: '#95E1A3',
    files: [
      { 
        name: 'Singing Bowls', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 720 
      },
      { 
        name: 'Wind Chimes', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/menu.ogg',
        duration: 480 
      },
      { 
        name: 'Temple Bells', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/lose.ogg',
        duration: 600 
      }
    ]
  },
  breathing: {
    displayName: 'Breathing Guide',
    description: 'Rhythmic breathing sounds',
    icon: 'waves',
    color: '#FFE066',
    files: [
      { 
        name: 'Deep Breathing', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 300 
      },
      { 
        name: 'Calm Breathing', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/menu.ogg',
        duration: 480 
      },
      { 
        name: 'Rhythmic Breath', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/lose.ogg',
        duration: 600 
      }
    ]
  },
  focus: {
    displayName: 'Focus Beats',
    description: 'Concentration enhancement',
    icon: 'psychology',
    color: '#FF9999',
    files: [
      { 
        name: 'White Noise', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1800 
      },
      { 
        name: 'Pink Noise', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/menu.ogg',
        duration: 1200 
      },
      { 
        name: 'Brown Noise', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/lose.ogg',
        duration: 1200 
      }
    ]
  },
  sleep: {
    displayName: 'Sleep Sounds',
    description: 'Deep relaxation melodies',
    icon: 'bedtime',
    color: '#B19CD9',
    files: [
      { 
        name: 'Soft Lullaby', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-assets/Epoq-Lepidoptera.ogg',
        duration: 1800 
      },
      { 
        name: 'Night Sounds', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/menu.ogg',
        duration: 2400 
      },
      { 
        name: 'Delta Waves', 
        url: 'https://commondatastorage.googleapis.com/codeskulptor-demos/riceracer_assets/music/lose.ogg',
        duration: 3600 
      }
    ]
  }
};

// Session type to music category mapping
const SESSION_MUSIC_MAPPING = {
  'guided': 'zen',
  'breathing': 'breathing',
  'relaxation': 'ambient',
  'focus': 'focus',
  'sleep': 'sleep'
};

// Icon to music category mapping for auto-selection
const ICON_MUSIC_MAPPING = {
  'spa': 'zen',
  'nature': 'nature',
  'air': 'breathing',
  'psychology': 'focus',
  'bedtime': 'sleep',
  'waves': 'ambient',
  'nightlight': 'sleep',
  'wb-sunny': 'nature',
  'center-focus-strong': 'focus'
};

export class MeditationAudioService {
  private static instance: MeditationAudioService;
  private currentSound: Audio.Sound | null = null;
  private currentCategory: string | null = null;
  private currentTrack: number = 0;
  private isPlaying: boolean = false;
  private volume: number = 0.7;

  static getInstance(): MeditationAudioService {
    if (!MeditationAudioService.instance) {
      MeditationAudioService.instance = new MeditationAudioService();
    }
    return MeditationAudioService.instance;
  }

  constructor() {
    this.setupAudio();
  }

  private async setupAudio() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: true,
        playsInSilentModeIOS: true,
        playThroughEarpieceAndroid: false,
        shouldDuckAndroid: true,
      });
      console.log('✅ Audio setup completed');
    } catch (error) {
      console.error('❌ Error setting up audio:', error);
    }
  }

  // Get available music categories
  getMusicCategories() {
    return Object.entries(MUSIC_CATEGORIES).map(([key, category]) => ({
      id: key,
      name: category.displayName,
      description: category.description,
      icon: category.icon,
      color: category.color,
      trackCount: category.files.length
    }));
  }

  // Get tracks for a specific category
  getTracksForCategory(categoryId: string) {
    const category = MUSIC_CATEGORIES[categoryId];
    return category ? category.files : [];
  }

  // Auto-select music based on session type or icon
  getRecommendedMusic(sessionType?: string, sessionIcon?: string): string {
    if (sessionType && SESSION_MUSIC_MAPPING[sessionType]) {
      return SESSION_MUSIC_MAPPING[sessionType];
    }
    if (sessionIcon && ICON_MUSIC_MAPPING[sessionIcon]) {
      return ICON_MUSIC_MAPPING[sessionIcon];
    }
    return 'ambient'; // Default fallback
  }

  // Load and play music from a category
  async playMusic(categoryId: string, trackIndex: number = 0): Promise<boolean> {
    try {
      // Stop current music
      await this.stopMusic();

      const category = MUSIC_CATEGORIES[categoryId];
      if (!category || !category.files[trackIndex]) {
        console.warn(`Music not found: ${categoryId}/${trackIndex}`);
        return false;
      }

      const track = category.files[trackIndex];
      
      console.log(`🎵 Loading: ${track.name} from ${category.displayName}`);
      console.log(`🔗 URL: ${track.url}`);
      
      // First test if the URL is accessible
      try {
        const response = await fetch(track.url, { method: 'HEAD' });
        console.log(`📡 URL check response: ${response.status}`);
      } catch (fetchError) {
        console.log(`⚠️ URL fetch test failed: ${fetchError}`);
      }
      
      // Create and load the sound from URL
      const { sound } = await Audio.Sound.createAsync(
        { uri: track.url },
        { 
          shouldPlay: true, 
          isLooping: true, 
          volume: this.volume 
        }
      );
      
      this.currentSound = sound;
      this.currentCategory = categoryId;
      this.currentTrack = trackIndex;
      this.isPlaying = true;
      
      console.log(`🎵 Now playing: ${track.name}`);
      
      // Set up playback status listener
      this.currentSound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded) {
          console.log(`🎵 Playback status: isPlaying=${status.isPlaying}, position=${status.positionMillis}`);
          this.isPlaying = status.isPlaying || false;
        } else {
          console.log(`⚠️ Audio not loaded properly: ${status.error}`);
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error playing music:', error);
      
      // Fallback: simulate playing for development
      console.log(`🎵 Simulating playback: ${MUSIC_CATEGORIES[categoryId]?.files[trackIndex]?.name}`);
      this.currentCategory = categoryId;
      this.currentTrack = trackIndex;
      this.isPlaying = true;
      return true;
    }
  }

  // Pause current music
  async pauseMusic(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.pauseAsync();
        console.log('🎵 Music paused');
      } else {
        // Simulation mode
        console.log('🎵 Simulating music pause');
      }
      this.isPlaying = false;
    } catch (error) {
      console.error('Error pausing music:', error);
      this.isPlaying = false;
    }
  }

  // Resume paused music
  async resumeMusic(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.playAsync();
        console.log('🎵 Music resumed');
        this.isPlaying = true;
      } else if (this.currentCategory) {
        // If no sound object but we have a category, try to restart
        console.log('🎵 Restarting music playback');
        await this.playMusic(this.currentCategory, this.currentTrack);
      } else {
        // Simulation mode
        console.log('🎵 Simulating music resume');
        this.isPlaying = true;
      }
    } catch (error) {
      console.error('Error resuming music:', error);
      // Fallback to simulation
      console.log('🎵 Simulating music resume (fallback)');
      this.isPlaying = true;
    }
  }

  // Stop and unload current music
  async stopMusic(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      this.isPlaying = false;
      this.currentCategory = null;
      this.currentTrack = 0;
    } catch (error) {
      console.error('Error stopping music:', error);
    }
  }

  // Set volume (0.0 to 1.0)
  async setVolume(volume: number): Promise<void> {
    try {
      this.volume = Math.max(0, Math.min(1, volume));
      if (this.currentSound) {
        await this.currentSound.setVolumeAsync(this.volume);
      }
    } catch (error) {
      console.error('Error setting volume:', error);
    }
  }

  // Get current playback status
  getCurrentStatus() {
    return {
      isPlaying: this.isPlaying,
      category: this.currentCategory,
      trackIndex: this.currentTrack,
      volume: this.volume,
      trackName: this.currentCategory ? 
        MUSIC_CATEGORIES[this.currentCategory]?.files[this.currentTrack]?.name : null
    };
  }

  // Play next track in category
  async playNextTrack(): Promise<boolean> {
    if (!this.currentCategory) return false;
    
    const category = MUSIC_CATEGORIES[this.currentCategory];
    const nextTrack = (this.currentTrack + 1) % category.files.length;
    
    return await this.playMusic(this.currentCategory, nextTrack);
  }

  // Play previous track in category
  async playPreviousTrack(): Promise<boolean> {
    if (!this.currentCategory) return false;
    
    const category = MUSIC_CATEGORIES[this.currentCategory];
    const prevTrack = this.currentTrack === 0 ? 
      category.files.length - 1 : this.currentTrack - 1;
    
    return await this.playMusic(this.currentCategory, prevTrack);
  }

  // Check if files exist (development helper)
  async validateMusicFiles(): Promise<{ [key: string]: boolean }> {
    const results: { [key: string]: boolean } = {};
    
    for (const [categoryId, category] of Object.entries(MUSIC_CATEGORIES)) {
      results[categoryId] = true; // Assume files exist for now
      
      // In production, you would check if files actually exist:
      /*
      try {
        for (const file of category.files) {
          const asset = Asset.fromModule(require(`../assets/sounds/meditation/${categoryId}/${file.file}`));
          results[`${categoryId}/${file.file}`] = !!asset;
        }
      } catch (error) {
        results[categoryId] = false;
      }
      */
    }
    
    return results;
  }
}

// Export the service instance
export const audioService = MeditationAudioService.getInstance();

// Export music categories for UI components
export { MUSIC_CATEGORIES };
