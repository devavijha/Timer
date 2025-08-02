# 🎵 Meditation Music Integration Guide

## Overview
This guide provides step-by-step instructions for users to add meditation music to the app and configure it properly.

## 📁 Step 1: Create Music Folder Structure

1. **Create the assets folder** (if it doesn't exist):
   ```
   Timer/
   ├── assets/
   │   └── sounds/
   │       ├── meditation/
   │       │   ├── nature/
   │       │   ├── ambient/
   │       │   ├── zen/
   │       │   ├── breathing/
   │       │   ├── focus/
   │       │   └── sleep/
   ```

## 🎼 Step 2: Download Recommended Music

### **Nature Sounds Category:**
- **forest.mp3** - Forest ambience with birds
- **rain.mp3** - Gentle rain sounds
- **ocean.mp3** - Ocean waves
- **river.mp3** - Flowing water

### **Ambient Category:**
- **ambient1.mp3** - Soft atmospheric tones
- **ambient2.mp3** - Ethereal soundscapes
- **ambient3.mp3** - Minimal electronic

### **Zen Garden Category:**
- **tibetan.mp3** - Tibetan singing bowls
- **chimes.mp3** - Wind chimes
- **bells.mp3** - Temple bells

### **Breathing Category:**
- **guided_breathing.mp3** - 4-7-8 breathing guide
- **box_breathing.mp3** - Box breathing pattern
- **deep_breathing.mp3** - Deep breathing guide

### **Focus Category:**
- **binaural.mp3** - Binaural beats for focus
- **white_noise.mp3** - White noise
- **brown_noise.mp3** - Brown noise

### **Sleep Category:**
- **lullaby.mp3** - Soft instrumental
- **night_sounds.mp3** - Night ambience
- **delta_waves.mp3** - Delta wave frequencies

## 🔗 Recommended Sources

### **Free Sources:**
1. **Freesound.org** - High-quality royalty-free sounds
2. **YouTube Audio Library** - Free music for creators
3. **OpenGameArt.org** - Free game audio assets
4. **BBC Sound Effects** - Professional sound library

### **Premium Sources:**
1. **Epidemic Sound** - Professional meditation music
2. **AudioJungle** - Royalty-free meditation tracks
3. **Pond5** - High-quality ambient music
4. **Artlist** - Premium background music

## 📝 Step 3: File Requirements

### **Audio Format:**
- **Preferred:** MP3 (best compatibility)
- **Alternative:** M4A, WAV
- **Avoid:** FLAC, OGG (limited React Native support)

### **Quality Settings:**
- **Bitrate:** 128-192 kbps (good quality, smaller file size)
- **Sample Rate:** 44.1 kHz
- **Duration:** 5-30 minutes (loopable)
- **File Size:** <10MB per file recommended

### **Naming Convention:**
```
nature_forest_01.mp3
ambient_ethereal_02.mp3
zen_singing_bowls_01.mp3
breathing_4_7_8_guide.mp3
focus_binaural_40hz.mp3
sleep_night_sounds.mp3
```

## 🏷️ Step 4: Tag Matching System

The app uses specific tags to match music with sessions. Ensure your files match these categories:

### **Session Type → Music Category Mapping:**
```javascript
const musicMapping = {
  'guided': 'zen',        // Guided meditations → Zen music
  'breathing': 'breathing', // Breathing exercises → Breathing guides
  'relaxation': 'ambient',  // Relaxation → Ambient sounds
  'focus': 'focus',        // Focus sessions → Focus beats
  'sleep': 'sleep',        // Sleep prep → Sleep sounds
  'nature': 'nature'       // General → Nature sounds
};
```

### **Icon → Music Type Mapping:**
```javascript
const iconMapping = {
  'spa': 'zen',           // Spa icon → Zen garden music
  'nature': 'nature',     // Nature icon → Nature sounds
  'air': 'breathing',     // Air icon → Breathing guides
  'psychology': 'focus',  // Psychology → Focus music
  'bedtime': 'sleep',     // Bedtime → Sleep sounds
  'waves': 'ambient'      // Waves → Ambient music
};
```

## ⚙️ Step 5: File Placement

1. **Copy your downloaded music files** to the appropriate folders:
   ```
   assets/sounds/meditation/nature/forest_ambience.mp3
   assets/sounds/meditation/ambient/ethereal_pad.mp3
   assets/sounds/meditation/zen/singing_bowls.mp3
   ```

2. **Verify file permissions** (ensure files are readable)

3. **Test file sizes** (should load quickly on mobile devices)

## 🔧 Step 6: Configuration Update

The app will automatically detect files in the meditation folders. No code changes required for basic usage.

### **Advanced Configuration** (Optional):
Create a `music_config.json` file:
```json
{
  "categories": {
    "nature": {
      "displayName": "Nature Sounds",
      "files": ["forest_ambience.mp3", "rain_gentle.mp3"],
      "defaultVolume": 0.7
    },
    "ambient": {
      "displayName": "Ambient",
      "files": ["ethereal_pad.mp3", "soft_drone.mp3"],
      "defaultVolume": 0.5
    }
  }
}
```

## 🎯 Step 7: Usage Instructions

### **For Users:**
1. **Open Meditation Screen** in the app
2. **Select a meditation session** (Morning Clarity, Deep Breathing, etc.)
3. **Tap the music selector** in the timer screen
4. **Choose your preferred music category**:
   - Nature Sounds → Forest, rain, ocean
   - Ambient → Atmospheric, ethereal
   - Zen Garden → Singing bowls, chimes
   - Breathing Guide → Guided breathing audio
   - Focus Beats → Binaural beats, white noise
   - Sleep Sounds → Lullabies, night ambience

5. **Start your session** - music will play automatically
6. **Adjust volume** using device controls

### **Music Controls:**
- **Play/Pause:** Tap music icon in timer
- **Change Track:** Tap music selector
- **Mute:** Select "No Music" option
- **Loop:** Music automatically loops during session

## 🎨 Step 8: Customization Tips

### **Creating Playlists:**
- Group similar tracks in folders
- Use descriptive filenames
- Keep consistent volume levels
- Test on actual devices

### **Optimizing Performance:**
- Compress audio files appropriately
- Use consistent sample rates
- Preload popular tracks
- Monitor memory usage

### **Legal Considerations:**
- Only use royalty-free or properly licensed music
- Keep records of music sources and licenses
- Respect copyright and attribution requirements
- Consider creating original content

## 🔍 Troubleshooting

### **Common Issues:**

**Music Not Playing:**
- Check file format (MP3 recommended)
- Verify file path and spelling
- Ensure proper folder structure
- Check device audio permissions

**Poor Audio Quality:**
- Use higher bitrate files (192 kbps+)
- Check source quality
- Avoid over-compression
- Test on different devices

**Large File Sizes:**
- Compress audio appropriately
- Use streaming for longer tracks
- Consider progressive loading
- Optimize for mobile bandwidth

**Sync Issues:**
- Ensure consistent timing
- Use fade-in/fade-out effects
- Test session transitions
- Verify loop points

## 📱 Testing Checklist

- [ ] All music categories have files
- [ ] Files play without errors
- [ ] Volume levels are consistent
- [ ] Music loops seamlessly
- [ ] No audio interruptions
- [ ] Works on different devices
- [ ] Proper tag matching
- [ ] Session transitions smooth

## 🎵 Conclusion

Following this guide will provide users with a comprehensive meditation music experience that seamlessly integrates with the app's session types and enhances the overall mindfulness journey.

For questions or support, contact the development team or refer to the app's help section.
