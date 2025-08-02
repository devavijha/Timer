// Adaptive soundscape system
import { Audio } from 'expo-av';

// Soundscape categories with local music files
export const SOUNDSCAPES = {
  focus: {
    id: 'focus',
    name: 'Focus',
    description: 'Boosts your productivity by helping you concentrate for longer',
    color: '#FF6B6B',
    icon: 'psychology',
    scientificBenefit: '7x increase in sustained focus',
    adaptiveFactors: ['time_of_day', 'circadian_rhythm', 'heart_rate'],
    musicFile: require('../Music/meditation-159124.mp3'),
    tracks: [
      { name: 'Deep Focus', intensity: 'high', duration: 3600, file: require('../Music/meditation-159124.mp3') },
      { name: 'Gentle Focus', intensity: 'medium', duration: 2400, file: require('../Music/meditation-154980.mp3') },
      { name: 'Flow State', intensity: 'adaptive', duration: 5400, file: require('../Music/417-hz-eliminate-negativity-183310.mp3') }
    ]
  },
  relax: {
    id: 'relax',
    name: 'Relax',
    description: 'Calms your mind to create feelings of comfort and safety',
    color: '#4ECDC4',
    icon: 'spa',
    scientificBenefit: '3.6x decrease in stress',
    adaptiveFactors: ['weather', 'location', 'stress_level'],
    musicFile: require('../Music/meditation-amp-relax-238980.mp3'),
    tracks: [
      { name: 'Deep Calm', intensity: 'low', duration: 1800, file: require('../Music/meditation-amp-relax-238980.mp3') },
      { name: 'Gentle Waves', intensity: 'medium', duration: 2700, file: require('../Music/396-hz-eliminate-fear-183307.mp3') },
      { name: 'Peaceful Sanctuary', intensity: 'adaptive', duration: 3600, file: require('../Music/285-hz-heals-tissues-and-organs-183306.mp3') }
    ]
  },
  sleep: {
    id: 'sleep',
    name: 'Sleep',
    description: 'Soothes you into a deep sleep with soft, gentle sounds',
    color: '#6C5CE7',
    icon: 'bedtime',
    scientificBenefit: '95% maintained listening time',
    adaptiveFactors: ['time_of_day', 'light_exposure', 'sleep_cycle'],
    musicFile: require('../Music/deep-sleep-308846.mp3'),
    tracks: [
      { name: 'Sleep Induction', intensity: 'very_low', duration: 2700, file: require('../Music/deep-sleep-308846.mp3') },
      { name: 'Deep Sleep', intensity: 'minimal', duration: 28800, file: require('../Music/sleep-music-vol16-195422.mp3') },
      { name: 'Dawn Transition', intensity: 'gentle', duration: 1800, file: require('../Music/meditation-relax-deep-sleep-quotc-majorquot-music-150647.mp3') }
    ]
  },
  activity: {
    id: 'activity',
    name: 'Activity',
    description: 'Powers your movement with sounds to keep you present and grounded',
    color: '#00B894',
    icon: 'directions-walk',
    scientificBenefit: 'Enhanced mindful movement',
    adaptiveFactors: ['movement_cadence', 'heart_rate', 'location'],
    musicFile: require('../Music/yoga-meditation-252461.mp3'),
    tracks: [
      { name: 'Walking Meditation', intensity: 'rhythmic', duration: 3600, file: require('../Music/yoga-meditation-252461.mp3') },
      { name: 'Mindful Movement', intensity: 'flowing', duration: 2400, file: require('../Music/meditation-159124.mp3') },
      { name: 'Grounding Steps', intensity: 'steady', duration: 1800, file: require('../Music/meditation-154980.mp3') }
    ]
  }
};

// Scenarios (timed sessions with specific purposes) - Fixed durations in minutes
export const SCENARIOS = {
  power_nap: {
    id: 'power_nap',
    name: 'Power Nap',
    description: '20-minute energy restoration',
    duration: 20,
    phases: ['wind_down', 'deep_rest', 'gentle_wake'],
    color: '#E17055',
    category: 'sleep',
    icon: '😴'
  },
  deep_work: {
    id: 'deep_work',
    name: 'Deep Work',
    description: '45-minute focus session',
    duration: 45,
    phases: ['warmup', 'peak_focus', 'sustained_attention'],
    color: '#0984E3',
    category: 'focus',
    icon: '🧠'
  },
  stress_relief: {
    id: 'stress_relief',
    name: 'Stress Relief',
    description: '15-minute quick relaxation',
    duration: 15,
    phases: ['breathing', 'tension_release', 'calm_restoration'],
    color: '#00CEC9',
    category: 'relax',
    icon: '🌿'
  },
  morning_boost: {
    id: 'morning_boost',
    name: 'Morning Boost',
    description: '10-minute energy activation',
    duration: 10,
    phases: ['awakening', 'energizing', 'focus_prep'],
    color: '#FDCB6E',
    category: 'activity',
    icon: '☀️'
  },
  bedtime_routine: {
    id: 'bedtime_routine',
    name: 'Bedtime Routine',
    description: '30-minute sleep preparation',
    duration: 30,
    phases: ['evening_wind_down', 'sleep_preparation', 'drift_off'],
    color: '#A29BFE',
    category: 'sleep',
    icon: '🌙'
  }
};

// Biometric and environmental data structure
interface BiometricData {
  heartRate?: number;
  stressLevel: number; // 1-10 scale
  energyLevel: number; // 1-10 scale
  timeOfDay: string;
  circadianPhase: number; // 0-1 representing daily cycle
  weather?: string;
  location?: string;
  lightExposure?: number; // lux
}

// Adaptive soundscape engine
export class SoundscapeEngine {
  private static instance: SoundscapeEngine;
  private currentSound: Audio.Sound | null = null;
  private currentSoundscape: string | null = null;
  private currentScenario: string | null = null;
  private isPlaying: boolean = false;
  private volume: number = 0.7;
  private biometricData: BiometricData;
  private autoplayEnabled: boolean = false;

  static getInstance(): SoundscapeEngine {
    if (!SoundscapeEngine.instance) {
      SoundscapeEngine.instance = new SoundscapeEngine();
    }
    return SoundscapeEngine.instance;
  }

  constructor() {
    this.biometricData = this.initializeBiometricData();
    this.setupAudio();
    this.startAdaptiveMonitoring();
  }

  private initializeBiometricData(): BiometricData {
    const now = new Date();
    const hour = now.getHours();
    
    return {
      timeOfDay: now.toTimeString(),
      circadianPhase: this.calculateCircadianPhase(),
      energyLevel: 5,
      stressLevel: 3
    };
  }

  private calculateCircadianPhase(): number {
    const hour = new Date().getHours();
    // Return 0-1 representing daily circadian cycle
    // Morning peak: 0.8-1.0, Afternoon dip: 0.3-0.5, Evening peak: 0.6-0.8, Night low: 0.0-0.3
    if (hour >= 6 && hour < 10) return 0.9; // morning peak
    if (hour >= 10 && hour < 14) return 0.4; // afternoon dip  
    if (hour >= 14 && hour < 22) return 0.7; // evening peak
    return 0.2; // night low
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
      console.log('🎵 Audio system initialized');
    } catch (error) {
      console.error('❌ Audio setup failed:', error);
    }
  }

  // Core functionality: Adaptive soundscape selection
  getRecommendedSoundscape(): string {
    const { circadianPhase, timeOfDay, stressLevel, energyLevel } = this.biometricData;
    const hour = new Date().getHours();

    // Automatic selection based on context
    if (hour >= 22 || hour <= 6) {
      return 'sleep';
    } else if (stressLevel > 6) {
      return 'relax';
    } else if (energyLevel < 4 && circadianPhase < 0.5) {
      return 'relax';
    } else if (hour >= 9 && hour <= 17) {
      return 'focus';
    } else {
      return 'activity';
    }
  }

  // Autoplay feature - automatically switches soundscapes
  enableAutoplay() {
    this.autoplayEnabled = true;
    console.log('🤖 Autoplay enabled');
    
    // Check every 30 minutes if soundscape should change
    setInterval(() => {
      if (this.autoplayEnabled) {
        const recommended = this.getRecommendedSoundscape();
        if (recommended !== this.currentSoundscape) {
          console.log(`🔄 Autoplay switching to ${recommended}`);
          this.playSoundscape(recommended);
        }
      }
    }, 1800000); // 30 minutes
  }

  disableAutoplay() {
    this.autoplayEnabled = false;
    console.log('🤖 Autoplay disabled');
  }

  // Adaptive soundscape playback with music
  async playSoundscape(soundscapeId: string): Promise<boolean> {
    try {
      await this.stopAll();

      const soundscape = SOUNDSCAPES[soundscapeId];
      if (!soundscape) {
        console.warn(`Soundscape not found: ${soundscapeId}`);
        return false;
      }

      // Select track based on current biometric data
      const selectedTrack = this.selectAdaptiveTrack(soundscape);
      
      console.log(`🎵 Playing ${soundscape.name}: ${selectedTrack.name}`);
      console.log(`📊 Adapted for: ${soundscape.adaptiveFactors.join(', ')}`);

      // Load and play the actual music with looping
      if (soundscape.musicFile) {
        const { sound } = await Audio.Sound.createAsync(
          soundscape.musicFile,
          { 
            isLooping: true, // Enable looping
            volume: this.volume,
            shouldPlay: true 
          }
        );
        
        this.currentSound = sound;
        console.log(`🎶 Audio loaded and playing with loop: ${soundscape.name}`);
      }

      this.currentSoundscape = soundscapeId;
      this.isPlaying = true;

      // Start adaptive monitoring for this soundscape
      this.simulateAdaptivePlayback(soundscape, selectedTrack);

      return true;
    } catch (error) {
      console.error('Error playing soundscape:', error);
      return false;
    }
  }

  // Scenario-based timed sessions with music
  async playScenario(scenarioId: string): Promise<boolean> {
    try {
      await this.stopAll();

      const scenario = SCENARIOS[scenarioId];
      if (!scenario) {
        console.warn(`Scenario not found: ${scenarioId}`);
        return false;
      }

      console.log(`🎯 Starting Scenario: ${scenario.name}`);
      console.log(`⏱️ Duration: ${scenario.duration} minutes`);
      console.log(`🎼 Phases: ${scenario.phases.join(' → ')}`);

      // Load appropriate soundscape music for the scenario category
      const categorySound = SOUNDSCAPES[scenario.category];
      if (categorySound && categorySound.musicFile) {
        const { sound } = await Audio.Sound.createAsync(
          categorySound.musicFile,
          { 
            isLooping: true, // Enable looping
            volume: this.volume,
            shouldPlay: true 
          }
        );
        
        this.currentSound = sound;
        console.log(`🎶 Scenario audio loaded with loop: ${categorySound.musicUrl}`);
      }

      this.currentScenario = scenarioId;
      this.isPlaying = true;

      // Execute scenario phases
      this.executeScenarioPhases(scenario);

      return true;
    } catch (error) {
      console.error('Error playing scenario:', error);
      return false;
    }
  }

  private selectAdaptiveTrack(soundscape: any) {
    const { circadianPhase, stressLevel, energyLevel } = this.biometricData;
    
    // Adaptive selection
    if (circadianPhase < 0.3 || stressLevel > 7) {
      return soundscape.tracks.find(t => t.intensity === 'low') || soundscape.tracks[0];
    } else if (energyLevel > 7 && circadianPhase > 0.8) {
      return soundscape.tracks.find(t => t.intensity === 'high') || soundscape.tracks[0];
    } else {
      return soundscape.tracks.find(t => t.intensity === 'adaptive') || soundscape.tracks[1];
    }
  }

  private simulateAdaptivePlayback(soundscape: any, track: any) {
    // Simulate real-time adaptation
    setInterval(() => {
      if (this.isPlaying && this.currentSoundscape === soundscape.id) {
        this.updateBiometricData();
        console.log(`🔄 Adapting ${soundscape.name} to current state`);
        console.log(`📈 Energy: ${this.biometricData.energyLevel}/10, Stress: ${this.biometricData.stressLevel}/10`);
      }
    }, 60000); // Update every minute
  }

  private executeScenarioPhases(scenario: any) {
    const phaseDurationMinutes = scenario.duration / scenario.phases.length;
    const phaseDurationMs = phaseDurationMinutes * 60 * 1000; // Convert minutes to milliseconds
    let currentPhase = 0;

    const phaseInterval = setInterval(() => {
      if (currentPhase < scenario.phases.length && this.currentScenario === scenario.id) {
        console.log(`🎼 Phase ${currentPhase + 1}/${scenario.phases.length}: ${scenario.phases[currentPhase]}`);
        currentPhase++;
      } else {
        clearInterval(phaseInterval);
        if (this.currentScenario === scenario.id) {
          console.log(`✅ Scenario ${scenario.name} completed`);
          this.currentScenario = null;
          this.isPlaying = false;
        }
      }
    }, phaseDurationMs);
  }

  // Biometric monitoring (simulated)
  private startAdaptiveMonitoring() {
    setInterval(() => {
      this.updateBiometricData();
    }, 300000); // Update every 5 minutes
  }

  private updateBiometricData() {
    const now = new Date();
    const hour = now.getHours();
    
    // Simulate realistic biometric changes
    this.biometricData.timeOfDay = now.toTimeString();
    this.biometricData.circadianPhase = this.calculateCircadianPhase();
    
    // Simulate gradual changes in energy and stress
    if (Math.random() > 0.7) {
      this.biometricData.energyLevel = Math.max(1, Math.min(10, 
        this.biometricData.energyLevel + (Math.random() - 0.5) * 2
      ));
    }
    
    if (Math.random() > 0.8) {
      this.biometricData.stressLevel = Math.max(1, Math.min(10,
        this.biometricData.stressLevel + (Math.random() - 0.5) * 1.5
      ));
    }
  }

  // Control methods
  async pauseSoundscape(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.pauseAsync();
      }
      this.isPlaying = false;
      console.log('⏸️ Soundscape paused');
    } catch (error) {
      console.error('Error pausing:', error);
    }
  }

  async resumeSoundscape(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.playAsync();
      } else if (this.currentSoundscape) {
        // Restart current soundscape
        await this.playSoundscape(this.currentSoundscape);
        return;
      }
      this.isPlaying = true;
      console.log('▶️ Soundscape resumed');
    } catch (error) {
      console.error('Error resuming:', error);
    }
  }

  async stopAll(): Promise<void> {
    try {
      if (this.currentSound) {
        await this.currentSound.stopAsync();
        await this.currentSound.unloadAsync();
        this.currentSound = null;
      }
      this.currentSoundscape = null;
      this.currentScenario = null;
      this.isPlaying = false;
      console.log('🛑 All audio stopped');
    } catch (error) {
      console.error('Error stopping:', error);
    }
  }

  // Status and data access
  getCurrentStatus() {
    return {
      isPlaying: this.isPlaying,
      currentSoundscape: this.currentSoundscape,
      currentScenario: this.currentScenario,
      autoplayEnabled: this.autoplayEnabled,
      biometricData: this.biometricData,
      recommended: this.getRecommendedSoundscape(),
      volume: this.volume
    };
  }

  getBiometricData(): BiometricData {
    return { ...this.biometricData };
  }

  getSoundscapes() {
    return Object.values(SOUNDSCAPES);
  }

  getScenarios() {
    return Object.values(SCENARIOS);
  }

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
}

// Export the singleton instance
export const soundscapeEngine = SoundscapeEngine.getInstance();
