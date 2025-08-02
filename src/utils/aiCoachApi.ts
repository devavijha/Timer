// Enhanced Wellness Coach AI - Advanced Local Implementation
// Provides comprehensive, personalized responses to wellness, health, and motivation queries

interface CoachResponse {
  answer: string;
  tips?: string[];
  resources?: string[];
  followUp?: string[];
}

interface UserContext {
  timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  dayOfWeek: string;
  recentActivity?: string;
}

export async function getCoachAnswer(question: string, context?: UserContext): Promise<string> {
  try {
    // Get enhanced local response with context
    const localResponse = getLocalCoachResponse(question, context);
    if (localResponse) {
      return localResponse;
    }

    // Fallback to external API if available
    const response = await fetch('http://localhost:8000/ai-coach', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context })
    });
    
    if (!response.ok) throw new Error('API error');
    const data = await response.json();
    return data.answer || getLocalCoachResponse(question, context) || 'Let me help you with that wellness question.';
  } catch (err) {
    // Always fallback to local coach
    return getLocalCoachResponse(question, context) || 'I\'m here to help with your wellness journey. Could you rephrase your question?';
  }
}

// Get current context for personalized responses
function getCurrentContext(): UserContext {
  const now = new Date();
  const hour = now.getHours();
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  
  let timeOfDay: 'morning' | 'afternoon' | 'evening' | 'night';
  if (hour >= 5 && hour < 12) timeOfDay = 'morning';
  else if (hour >= 12 && hour < 17) timeOfDay = 'afternoon';
  else if (hour >= 17 && hour < 22) timeOfDay = 'evening';
  else timeOfDay = 'night';
  
  return {
    timeOfDay,
    dayOfWeek: days[now.getDay()]
  };
}

// Helper function for time-appropriate greetings
function getTimeGreeting(timeOfDay: string): string {
  switch (timeOfDay) {
    case 'morning': return 'Good morning';
    case 'afternoon': return 'Good afternoon';
    case 'evening': return 'Good evening';
    case 'night': return 'Hello there';
    default: return 'Hello';
  }
}

// Contextual suggestions based on time/day
function getContextualSuggestion(context: UserContext): string {
  if (context.timeOfDay === 'morning') {
    return "🌅 **Perfect timing!** Mornings are great for setting intentions, meditation, or planning your day.";
  } else if (context.timeOfDay === 'afternoon') {
    return "☀️ **Afternoon energy check!** This is a great time to tackle productivity challenges or take a mindful break.";
  } else if (context.timeOfDay === 'evening') {
    return "🌆 **Evening reflection time!** Perfect for unwinding, planning tomorrow, or discussing stress management.";
  } else {
    return "🌙 **Late night wisdom!** Let's focus on relaxation, sleep hygiene, or gentle evening routines.";
  }
}

function getLocalCoachResponse(question: string, context?: UserContext): string {
  const lowerQuestion = question.toLowerCase().trim();
  const currentContext = context || getCurrentContext();
  
  // Add contextual greetings
  const timeGreeting = getTimeGreeting(currentContext.timeOfDay);
  
  // Enhanced pattern matching with context awareness

  // Greeting and small talk
  if (isAbout(lowerQuestion, ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'])) {
    return `${timeGreeting}! I'm your personal wellness coach 🌟

I'm here to support you with evidence-based guidance on:

🧘 **Mental Wellness** - Stress, anxiety, mindfulness, meditation
💪 **Physical Health** - Exercise, nutrition, sleep, energy
🎯 **Personal Growth** - Habits, goals, motivation, productivity
❤️ **Relationships** - Communication, boundaries, social wellness
🧠 **Cognitive Health** - Focus, memory, learning, mental clarity
⚖️ **Work-Life Balance** - Time management, burnout prevention

${getContextualSuggestion(currentContext)}

What's on your mind today? Feel free to share what you're working on or any challenges you're facing! 💙`;
  }

  // Weather and mood check-ins
  if (isAbout(lowerQuestion, ['how are you', 'what\'s up', 'how\'s it going'])) {
    return `${timeGreeting}! I'm doing well and excited to help you today! 😊

More importantly - how are YOU feeling? I'd love to check in:

🌡️ **Energy Level** - Feeling energized or need a boost?
😌 **Stress Level** - Calm and centered or a bit overwhelmed?
🎯 **Focus** - Sharp and clear or scattered thoughts?
💤 **Sleep** - Well-rested or could use better sleep?

Share what's going on with you, and I'll provide personalized guidance to help you feel your best! What would you like to work on together? ✨`;
  }

  // Enhanced Wellness and Health Topics with context awareness
  if (isAbout(lowerQuestion, ['stress', 'anxiety', 'worry', 'overwhelmed', 'panic', 'nervous'])) {
    const timeSpecificTip = currentContext.timeOfDay === 'morning' 
      ? "\n🌅 **Morning Stress Relief:** Start with 5 deep breaths and set 3 realistic intentions for the day."
      : currentContext.timeOfDay === 'evening'
      ? "\n🌆 **Evening Calm:** Try our guided meditation or write down 3 things that went well today."
      : "\n⏰ **Quick Relief:** Step outside for fresh air or do 10 jumping jacks to reset your energy.";

    return `${timeGreeting}! Stress is your body's natural response, and you can learn to manage it effectively! 💙

🆘 **Immediate Relief (2-5 minutes):**
• **4-7-8 Breathing:** Inhale for 4, hold for 7, exhale for 8
• **5-4-3-2-1 Grounding:** 5 things you see, 4 hear, 3 feel, 2 smell, 1 taste
• **Progressive muscle relaxation:** Tense and release each muscle group
• **Cold water on wrists** or splash face to activate parasympathetic response

🧘 **Daily Stress Prevention:**
• Morning meditation (even 5 minutes counts!)
• Regular exercise - even a 10-minute walk helps
• Consistent sleep schedule (7-9 hours)
• Limit caffeine after 2 PM and news/social media
• Practice saying "no" to overcommitment

📱 **Use Our App:**
• Try our "Breath Awareness" or "Focus Builder" sessions
• Set stress-relief reminders
• Track your mood patterns

🧠 **Mindset Shifts:**
• Ask: "Will this matter in 5 years?"
• Focus on what you can control vs. what you can't
• Practice self-compassion - treat yourself like a good friend
• Remember: Stress often means you care deeply about something

💪 **Building Resilience:**
• Build a support network of trusted friends
• Practice gratitude daily (3 specific things)
• Learn to reframe negative thoughts
• Develop hobbies that bring you joy${timeSpecificTip}

🚨 **Seek Professional Help If:**
• Stress interferes with daily activities
• You feel overwhelmed most days
• Physical symptoms persist (headaches, stomach issues)
• You're using substances to cope

Remember: You're stronger than your stress. What specific situation is causing you stress right now? I can help you create a personalized action plan! 🌟`;
  }

  if (isAbout(lowerQuestion, ['sleep', 'insomnia', 'tired', 'fatigue', 'energy', 'exhausted', 'sleepy'])) {
    const sleepTip = currentContext.timeOfDay === 'morning'
      ? "\n🌅 **Morning Energy Boost:** Get 15+ minutes of natural sunlight to regulate your circadian rhythm!"
      : currentContext.timeOfDay === 'evening'
      ? "\n🌆 **Evening Wind-Down:** Perfect timing! Start your pre-sleep routine 1-2 hours before bed."
      : currentContext.timeOfDay === 'night'
      ? "\n🌙 **Late Night Tip:** If you can't sleep, avoid screens and try reading or gentle stretching instead."
      : "\n☀️ **Afternoon Slump:** Skip the nap! Get moving with a quick walk or some light stretching.";

    return `${timeGreeting}! Quality sleep is the foundation of wellness - let's optimize yours! 😴✨

💤 **Sleep Hygiene Essentials:**
• **Consistent schedule:** Same bedtime/wake time daily (yes, weekends too!)
• **Cool environment:** 65-68°F (18-20°C) is optimal
• **Dark room:** Blackout curtains or eye mask
• **Quiet space:** Earplugs or white noise if needed
• **Comfortable mattress/pillows:** Invest in quality sleep gear

🚫 **What's Sabotaging Your Sleep:**
• Caffeine after 2 PM (6-hour half-life!)
• Large meals 3 hours before bed
• Alcohol (disrupts REM sleep)
• Screens 1-2 hours before bed (blue light suppresses melatonin)
• Irregular sleep schedule
• Bedroom too warm/bright/noisy

🌙 **Pre-Sleep Routine (1-2 hours before bed):**
• Dim the lights throughout your home
• Try our meditation sessions (especially "Evening Calm")
• Gentle stretching or yoga
• Reading a physical book
• Journaling or gratitude practice
• Warm bath with Epsom salts

⚡ **For More Daytime Energy:**
• Morning sunlight exposure (15-30 minutes)
• Regular exercise (but not 4 hours before bed)
• Stay hydrated throughout the day
• Balanced meals with protein and complex carbs
• Power naps only if needed (20 minutes max, before 3 PM)

🧠 **If Your Mind Races:**
• Keep a notepad by your bed for racing thoughts
• Practice 4-7-8 breathing technique
• Try progressive muscle relaxation
• Listen to sleep stories or meditation
• Challenge yourself to count backwards from 1000 by 7s

📱 **Track & Improve:**
• Use our sleep tracking features
• Note what helps/hurts your sleep
• Monitor energy levels throughout the day
• Set gentle wake-up alarms

🩺 **See a Doctor If:**
• You snore loudly or stop breathing during sleep
• You're tired despite 7-9 hours of sleep
• You can't fall asleep after 30 minutes regularly
• Daytime fatigue affects your safety or relationships${sleepTip}

What specific sleep challenge are you facing? I can help create a personalized sleep improvement plan! 🌟`;
  }

  if (isAbout(lowerQuestion, ['confidence', 'self esteem', 'self-esteem', 'insecure', 'not good enough', 'imposter', 'doubt'])) {
    return `${timeGreeting}! Building genuine confidence is a journey of self-discovery and growth! 💪✨

🌟 **Understanding True Confidence:**
• Confidence isn't about being perfect or never feeling doubt
• It's about trusting your ability to handle whatever comes
• It grows through taking action despite fear
• It's built on self-acceptance, not comparison to others

🧠 **Mindset Shifts:**
• **From "I'm not good enough"** → "I'm learning and growing"
• **From "I failed"** → "I learned valuable lessons"
• **From "Everyone's better"** → "Everyone has their own journey"
• **From "I can't do this"** → "I can't do this YET"

💪 **Daily Confidence Builders:**
• Celebrate small wins (seriously, write them down!)
• Step outside your comfort zone in tiny ways
• Practice power posture for 2 minutes before challenges
• Speak to yourself like you would a best friend
• Keep a "wins journal" - document your daily achievements

🎯 **Practical Exercises:**
• List 10 things you're genuinely good at
• Ask trusted friends what they see as your strengths
• Practice saying "thank you" instead of deflecting compliments
• Set and achieve tiny goals to build momentum
• Learn a new skill to prove you CAN grow

🤝 **Social Confidence:**
• Make eye contact and smile genuinely
• Ask questions about others (people love talking about themselves)
• Practice active listening
• Share your authentic thoughts and opinions
• Remember: Most people are thinking about themselves, not judging you

🧘 **Inner Work:**
• Practice mindfulness to catch negative self-talk
• Challenge limiting beliefs with evidence
• Focus on your values and what matters to you
• Develop self-compassion through meditation
• Use our app's progress tracking to see your growth

🚀 **Building on Success:**
• Keep a record of challenges you've overcome
• Notice patterns in what makes you feel confident
• Surround yourself with supportive people
• Take on projects that align with your strengths
• Help others - it builds your sense of capability

Remember: Confidence isn't about never feeling nervous - it's about feeling nervous and doing it anyway! What specific situation would you like to feel more confident about? 🌟`;
  }

  if (isAbout(lowerQuestion, ['procrastination', 'procrastinating', 'delay', 'putting off', 'avoidance', 'lazy'])) {
    return `${timeGreeting}! Procrastination isn't about laziness - it's often about fear, perfectionism, or feeling overwhelmed! Let's tackle this together! 🎯

🧠 **Why We Procrastinate:**
• **Fear of failure** - "What if I'm not good enough?"
• **Fear of success** - "What if expectations increase?"
• **Perfectionism** - "If I can't do it perfectly, why start?"
• **Overwhelm** - Task feels too big or complex
• **Lack of clarity** - Unclear about next steps
• **Low energy** - Not feeling mentally/physically ready

⚡ **Instant Action Techniques:**
• **2-minute rule** - If it takes less than 2 minutes, do it now
• **15-minute sprint** - Commit to just 15 minutes, often you'll continue
• **One tiny step** - What's the smallest possible action you can take?
• **Change your environment** - Move to a different space
• **Use momentum** - Start with something easy to build energy

🎯 **The Anti-Procrastination System:**
1. **Break it down** - Make tasks ridiculously specific and small
2. **Time block** - Schedule tasks like important appointments
3. **Remove friction** - Eliminate barriers to starting
4. **Add accountability** - Tell someone your commitment
5. **Reward progress** - Celebrate completion, not just perfection

🧘 **Mindset Techniques:**
• **Reframe the story** - "I get to work on this" vs "I have to"
• **Future self visualization** - How will completing this help you?
• **Progress over perfection** - Done is better than perfect
• **Self-compassion** - Treat yourself kindly when you slip up

📱 **Use Our App:**
• Break large tasks into smaller ones
• Set realistic deadlines
• Track your completion streaks
• Use habit stacking to build momentum

⚠️ **Common Procrastination Traps:**
• Waiting for the "right mood" or motivation
• Researching endlessly instead of starting
• Cleaning/organizing as avoidance
• Social media "breaks" that become hours
• Perfectionism disguised as "just not ready yet"

🔥 **Emergency Motivation:**
• Set a timer for 10 minutes and start anywhere
• Work alongside someone (body doubling)
• Change your physical state (stand up, move around)
• Remember your "why" - connect to your deeper purpose
• Use the "I'll just open the document" trick

What specific task are you avoiding? Let's create a step-by-step plan to make it happen! 🚀`;
  }

  if (isAbout(lowerQuestion, ['motivation', 'unmotivated', 'discipline', 'drive', 'ambition'])) {
    return `${timeGreeting}! Motivation comes and goes, but systems create lasting change! 💪✨

🔥 **Understanding Motivation:**
• Motivation is a feeling - it's temporary and unreliable
• Discipline is a skill - it can be built and strengthened
• Systems beat goals - focus on consistent daily actions
• Identity drives behavior - "I am someone who exercises daily"

🎯 **Build Unstoppable Momentum:**
• **Start tiny** - 2-minute rule for new habits
• **Celebrate wins** - Every small victory counts!
• **Track progress** - Visual progress boosts motivation
• **Stack habits** - Attach new habits to existing ones
• **Focus on showing up** - Consistency beats intensity

🧠 **Overcome Mental Resistance:**
• **Reframe thoughts** - "I get to" vs "I have to"
• **Connect to purpose** - Remember your deeper why
• **Use implementation intentions** - "When X happens, I will do Y"
• **Prepare for obstacles** - If-then planning
• **Practice self-compassion** - Perfectionism kills motivation

⚡ **Energy Management:**
• **Identify peak hours** - When is your energy highest?
• **Match tasks to energy** - Hard tasks during peak times
• **Take real breaks** - Rest is productive too
• **Fuel properly** - Nutrition affects motivation
• **Move your body** - Exercise boosts mental energy

🎮 **Gamify Your Progress:**
• Create streaks and challenges
• Use our app's progress tracking
• Set up rewards for milestones
• Find an accountability partner
• Join communities with similar goals

📅 **Weekly Motivation Boost:**
• Review your progress every Sunday
• Plan your week with 3 main priorities
• Schedule your most important tasks first
• Prepare for potential obstacles
• Visualize your successful week

🚀 **When Motivation is Low:**
• Do the minimum viable action
• Change your environment
• Review your progress so far
• Remember past challenges you've overcome
• Start with something you actually enjoy

Remember: You don't need to feel motivated to take action. Action creates motivation! What specific area would you like to build more consistency in? 🌟`;
  }

  if (isAbout(lowerQuestion, ['exercise', 'workout', 'fitness', 'physical activity', 'movement'])) {
    return `${timeGreeting}! Movement is medicine for body and mind! Let's get you started: 💪

🏃 **For Beginners:**
• Start with 10-15 minutes daily
• Walking counts as exercise!
• Bodyweight exercises (push-ups, squats, planks)
• YouTube yoga or fitness videos
• Dance to your favorite music

💪 **Building a Routine:**
• Schedule it like an important meeting
• Choose activities you actually enjoy
• Mix cardio, strength, and flexibility
• Start slow and gradually increase intensity
• Find a workout buddy for accountability

🧠 **Mental Health Benefits:**
• Releases endorphins (natural mood boosters)
• Reduces stress hormones
• Improves sleep quality
• Boosts self-confidence
• Enhances cognitive function

⏰ **Time-Efficient Options:**
• 7-minute HIIT workouts
• Take stairs instead of elevators
• Walk/bike for short errands
• Desk exercises during work breaks
• Active hobbies (gardening, cleaning)

🎯 **Staying Consistent:**
• Track workouts in our app
• Prepare gear the night before
• Celebrate weekly achievements
• Focus on how you feel after exercise
• Have backup plans for bad weather

Remember: The best exercise is the one you'll actually do consistently! What type of movement interests you most? 🌟`;
  }

  if (isAbout(lowerQuestion, ['nutrition', 'diet', 'eating', 'food', 'healthy eating', 'weight'])) {
    return `${timeGreeting}! Nutrition fuels your wellness journey! Here are evidence-based principles: 🥗

🍎 **Fundamentals:**
• Eat mostly whole, unprocessed foods
• Include protein, healthy fats, and complex carbs
• Aim for 5-9 servings of fruits/vegetables daily
• Stay hydrated (half your body weight in ounces)
• Listen to hunger and fullness cues

🔄 **Simple Swaps:**
• Whole grains instead of refined
• Nuts/seeds instead of processed snacks
• Water instead of sugary drinks
• Lean proteins (fish, chicken, legumes, tofu)
• Fresh fruit instead of candy

⏰ **Timing Matters:**
• Eat a protein-rich breakfast
• Don't skip meals (leads to overeating)
• Stop eating 2-3 hours before bed
• Eat regularly to maintain energy
• Pre-plan healthy snacks

🧠 **Mindful Eating:**
• Eat without distractions
• Chew slowly and thoroughly
• Notice flavors, textures, aromas
• Check in with your body's signals
• Practice gratitude for your food

💡 **Pro Tips:**
• Plan and prep meals when possible
• Read nutrition labels
• Allow for occasional treats (80/20 rule)
• Focus on adding healthy foods, not just restricting
• Cook more meals at home

Small, consistent changes create lasting results! What aspect of nutrition would you like to focus on first? 🌟`;
  }

  if (isAbout(lowerQuestion, ['focus', 'concentration', 'attention', 'distracted', 'mind wandering'])) {
    return `${timeGreeting}! Building laser focus is a skill you can develop! Let's sharpen your concentration: 🎯

🧠 **Understanding Focus:**
• Focus is like a muscle - it gets stronger with practice
• Average attention span is 8-12 minutes
• Multitasking is a myth - it's actually task-switching
• Your brain needs breaks to maintain peak performance

⚡ **Immediate Focus Boosters:**
• **Pomodoro Technique** - 25 min focus, 5 min break
• **Single-tasking** - One thing at a time
• **Environment design** - Remove distractions
• **Phone in another room** - Out of sight, out of mind
• **Clear workspace** - Physical clutter = mental clutter

🧘 **Train Your Focus:**
• Daily meditation (even 5 minutes helps!)
• Practice sustained attention on one task
• Notice when your mind wanders (without judgment)
• Use our Focus Builder meditation
• Read physical books for longer periods

🎯 **Deep Work Strategies:**
• **Time blocking** - Schedule focused work sessions
• **Batch similar tasks** - Group like activities
• **Energy matching** - Hard tasks during peak hours
• **Notification blocking** - Use focus modes
• **Ritual creation** - Same routine signals focus time

💊 **Lifestyle Factors:**
• **Quality sleep** - 7-9 hours for optimal cognition
• **Regular exercise** - Boosts brain function
• **Proper nutrition** - Brain fuel matters
• **Hydration** - Even mild dehydration affects focus
• **Limit caffeine** - Too much causes jitters

📱 **Use Our App:**
• Try our "Focus Builder" meditation sessions
• Track your focused work sessions
• Set focus reminders throughout the day
• Use breathing exercises for mental reset

🎮 **Focus Challenges:**
• Start with 10-minute focused sessions
• Gradually increase duration
• Track your progress
• Reward yourself for milestones
• Make it a daily habit

What specific situation requires better focus? Let's create a personalized concentration plan! 🌟`;
  }

  // Default response for unmatched queries
  return `Great question! As your wellness coach, I'm here to help with:

🧘 **Mental Wellness:** Stress, anxiety, meditation, mindfulness, confidence
💪 **Physical Health:** Exercise, nutrition, sleep, energy, fitness
🎯 **Personal Growth:** Habits, goals, motivation, productivity, procrastination
❤️ **Relationships:** Communication, conflict resolution, social wellness
🧠 **Cognitive Health:** Focus, memory, learning, mental clarity
📱 **App Features:** How to use our wellness tools effectively

Feel free to ask me about any of these topics, or share what specific wellness challenge you're facing. I'm here to provide personalized guidance for your journey!

Some examples:
• "How can I sleep better?"
• "I'm feeling stressed at work"
• "How do I build better habits?"
• "I need motivation to exercise"
• "Help me manage my time better"
• "I'm procrastinating on a big project"
• "How can I feel more confident?"
• "I can't focus on my work"

What would you like to explore today? 🌟`;
}

// Helper function to check if question matches topics
function isAbout(question: string, keywords: string[]): boolean {
  return keywords.some(keyword => question.includes(keyword));
}
