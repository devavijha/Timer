# Productivity & Wellness Mobile App

A comprehensive React Native Expo application designed for task management, habit tracking, meditation, and productivity enhancement. Built with modern UI/UX principles and featuring a clean, intuitive design.

## Features

### Task Management
- **Categorized Task Boards**: Create custom categories (Groceries, Work, Inspiration, etc.)
- **Interactive Task Lists**: Add, edit, check off, and delete tasks
- **Progress Tracking**: Visual progress indicators for each category
- **Real-time Updates**: Immediate UI feedback for all interactions

###  Habit Tracking
- **Daily Habit Management**: Track habits like "Drink Water", "Exercise", "Meditate"
- **Streak Tracking**: Current streak and longest streak statistics
- **Calendar Integration**: Visual calendar showing completed habit days
- **Progress Visualization**: Weekly and monthly progress charts

###  Meditation & Wellness
- **Guided Sessions**: Multiple meditation types (breathing, relaxation, focus)
- **Timer Functionality**: Customizable meditation timers with visual feedback
- **Mood Selection**: Choose sessions based on current mood or needs
- **Session Library**: Various sessions for different purposes and durations

###  Progress Analytics
- **Weekly Progress**: Visual progress cards for goals and habits
- **Goal Setting**: Set and track personal goals with progress percentages
- **Calendar View**: Month view with habit completion markers
- **Statistics Dashboard**: Comprehensive overview of achievements

### User Experience
- **Onboarding Flow**: Friendly welcome screens with illustrations
- **Personalized Dashboard**: Greeting messages and personalized content
- **Modern UI**: Clean design with smooth animations and transitions
- **Responsive Design**: Optimized for different screen sizes

##  Technology Stack

- **Framework**: React Native with Expo
- **Language**: TypeScript
- **State Management**: Redux Toolkit
- **Navigation**: React Navigation 7
- **UI Components**: Custom components with Material Icons
- **Styling**: React Native StyleSheet with Linear Gradients
- **Persistence**: AsyncStorage for local data

##  Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Expo Go app on your mobile device

### Getting Started

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Timer
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. **Run on your device**:
   - Install Expo Go on your mobile device
   - Scan the QR code displayed in the terminal
   - Or press `w` to open in web browser

### Development Commands

- `npm start` - Start Expo development server
- `npm run android` - Run on Android device/emulator
- `npm run ios` - Run on iOS simulator
- `npm run web` - Run in web browser

##  Design System

### Color Palette
- **Primary**: #4ECDC4 (Teal)
- **Secondary**: #FF9999 (Coral)
- **Accent**: #FFE066 (Yellow)
- **Success**: #95E1A3 (Green)
- **Background**: #F8F9FA (Light Gray)

### Typography
- **Headers**: Bold, dark gray (#2C3E50)
- **Body Text**: Regular, medium gray (#7F8C8D)
- **Accent Text**: Various theme colors

## Project Structure

```
src/
├── components/          # Reusable UI components
├── screens/            # Main application screens
│   ├── OnboardingScreen.tsx
│   ├── HomeScreen.tsx
│   ├── TasksScreen.tsx
│   ├── HabitsScreen.tsx
│   ├── MeditationScreen.tsx
│   ├── ProgressScreen.tsx
│   ├── CalendarScreen.tsx
│   └── ProfileScreen.tsx
├── navigation/         # Navigation configuration
│   ├── AppNavigator.tsx
│   └── MainTabNavigator.tsx
├── store/             # Redux store and slices
│   ├── index.ts
│   ├── tasksSlice.ts
│   ├── habitsSlice.ts
│   ├── goalsSlice.ts
│   ├── userSlice.ts
│   └── meditationSlice.ts
├── types/             # TypeScript type definitions
├── utils/             # Utility functions and hooks
└── App.tsx           # Main application component
```

##  Key Components

### Navigation
- **Bottom Tab Navigation**: Home, Tasks, Habits, Meditation, Progress, Calendar, Profile
- **Stack Navigation**: Onboarding flow and authentication screens
- **Type-safe Navigation**: Full TypeScript support for navigation parameters

### State Management
- **Redux Toolkit**: Efficient state management with slices
- **Typed Selectors**: Type-safe state selection with custom hooks
- **Persistent Storage**: Automatic state persistence with AsyncStorage

### UI Features
- **Smooth Animations**: Expo Linear Gradient and React Native Reanimated
- **Touch Interactions**: Responsive touch feedback throughout the app
- **Loading States**: Proper loading and error state handling
- **Accessibility**: ARIA labels and accessible navigation

##  Data Models

### Tasks
- Categories with custom colors and names
- Individual tasks with completion status
- Progress calculation and statistics

### Habits
- Daily habit tracking with streak calculations
- Calendar integration for visual progress
- Customizable habit icons and colors

### Goals
- Weekly, monthly, and daily goal types
- Progress tracking with percentage completion
- Visual progress indicators

### Meditation
- Session types: breathing, guided, relaxation
- Timers with customizable durations
- Session history and progress tracking

##  Getting Started for Development

1. **Set up your development environment**:
   - Install Node.js and npm
   - Install Expo CLI globally
   - Set up Android Studio (for Android development)
   - Set up Xcode (for iOS development, macOS only)

2. **Run the project**:
   ```bash
   npm start
   ```

3. **Test on different platforms**:
   - Scan QR code with Expo Go (easiest)
   - Run on iOS simulator: `npm run ios`
   - Run on Android emulator: `npm run android`
   - Run in web browser: `npm run web`

##  Future Enhancements

- **Push Notifications**: Habit reminders and motivational messages
- **Social Features**: Share progress with friends and family
- **Data Export**: Export progress data and statistics
- **Themes**: Dark mode and custom theme options
- **Cloud Sync**: Backup and sync data across devices
- **Advanced Analytics**: Detailed insights and trends
- **Integrations**: Connect with fitness trackers and calendars

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

If you encounter any issues or have questions, please create an issue in the repository.

---
