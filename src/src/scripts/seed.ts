import { config } from "dotenv";
import path from "path";

// Load environment variables from .env.local BEFORE any other imports
config({ path: path.resolve(process.cwd(), ".env.local") });

// Check if MONGODB_URI is set
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is not set in .env.local");
  console.error("   Please create a .env.local file with MONGODB_URI=mongodb://localhost:27017/yt-auto");
  process.exit(1);
}

// Use dynamic imports after env is loaded
async function main() {
  const mongoose = (await import("mongoose")).default;
  const bcrypt = (await import("bcryptjs")).default;
  const { connectDB } = await import("../lib/db/mongoose");
  const User = (await import("../lib/db/models/User")).default;
  const Project = (await import("../lib/db/models/Project")).default;

  // Test user data
  const testUsers = [
    {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      preferences: {
        defaultLLM: "openai" as const,
        defaultImageProvider: "pexels" as const,
        subtitleStyle: "sentence" as const,
      },
    },
    {
      name: "Demo User",
      email: "demo@example.com",
      password: "demo123456",
      preferences: {
        defaultLLM: "anthropic" as const,
        defaultImageProvider: "segmind" as const,
        subtitleStyle: "word-by-word" as const,
      },
    },
  ];

  // Sample project data factory
  function createSampleProjects(userId: mongoose.Types.ObjectId) {
    return [
      // Draft project
      {
        userId,
      title: "10 Mind-Blowing Space Facts",
      reelIdea: "Create a short video about fascinating space facts that will amaze viewers",
      status: "draft" as const,
      aspectRatio: "9:16" as const,
      timeline: { totalDuration: 0, scenes: [] },
    },
    // Project with research done
    {
      userId,
      title: "The Science of Sleep",
      reelIdea: "Explain why we need sleep and what happens to our brain during sleep",
      status: "script-ready" as const,
      aspectRatio: "9:16" as const,
      researchData: {
        sources: [
          {
            title: "Why We Sleep - Matthew Walker",
            url: "https://example.com/sleep-science",
            snippet: "Sleep is the single most effective thing we can do to reset our brain and body health each day.",
          },
          {
            title: "National Sleep Foundation",
            url: "https://example.com/nsf",
            snippet: "Adults need 7-9 hours of sleep per night for optimal health.",
          },
          {
            title: "Harvard Medical School Sleep Research",
            url: "https://example.com/harvard-sleep",
            snippet: "During deep sleep, the brain clears out toxins that accumulate during waking hours.",
          },
        ],
        keywords: ["sleep", "REM", "circadian rhythm", "brain health", "rest"],
        generatedAt: new Date(),
      },
      script: {
        fullText: "Did you know your brain does something incredible while you sleep? Every night, your brain goes through a deep cleaning process, flushing out toxins that build up during the day. This is why you feel so refreshed after a good night's rest. Scientists call this the glymphatic system, and it only activates during deep sleep. So next time you think about skipping sleep, remember - your brain is literally cleaning itself!",
        scenes: [
          {
            id: "scene-1",
            text: "Did you know your brain does something incredible while you sleep?",
            visualDescription: "A person peacefully sleeping in bed at night with soft moonlight",
          },
          {
            id: "scene-2",
            text: "Every night, your brain goes through a deep cleaning process, flushing out toxins that build up during the day.",
            visualDescription: "Animated visualization of brain neurons with glowing cleaning waves",
          },
          {
            id: "scene-3",
            text: "This is why you feel so refreshed after a good night's rest.",
            visualDescription: "Person waking up stretching with sunlight coming through window",
          },
          {
            id: "scene-4",
            text: "Scientists call this the glymphatic system, and it only activates during deep sleep.",
            visualDescription: "Scientific diagram of brain with labeled glymphatic system",
          },
          {
            id: "scene-5",
            text: "So next time you think about skipping sleep, remember - your brain is literally cleaning itself!",
            visualDescription: "Split screen showing tired vs well-rested person",
          },
        ],
        generatedAt: new Date(),
      },
      timeline: { totalDuration: 0, scenes: [] },
    },
    // Project with voiceover uploaded
    {
      userId,
      title: "5 Productivity Hacks That Actually Work",
      reelIdea: "Share practical productivity tips backed by science",
      status: "voiceover-uploaded" as const,
      aspectRatio: "9:16" as const,
      researchData: {
        sources: [
          {
            title: "Deep Work - Cal Newport",
            url: "https://example.com/deep-work",
            snippet: "The ability to perform deep work is becoming increasingly rare and increasingly valuable.",
          },
        ],
        keywords: ["productivity", "focus", "time management", "efficiency"],
        generatedAt: new Date(Date.now() - 86400000),
      },
      script: {
        fullText: "Here are 5 productivity hacks that actually work. Number one: The two-minute rule. If something takes less than two minutes, do it now. Number two: Time blocking. Schedule specific blocks for focused work. Number three: The Pomodoro technique. Work for 25 minutes, then take a 5-minute break. Number four: Eat the frog. Do your hardest task first thing in the morning. Number five: Digital detox. Turn off notifications during deep work sessions.",
        scenes: [
          {
            id: "scene-1",
            text: "Here are 5 productivity hacks that actually work.",
            visualDescription: "Energetic intro with productivity icons and checklist",
          },
          {
            id: "scene-2",
            text: "Number one: The two-minute rule. If something takes less than two minutes, do it now.",
            visualDescription: "Timer showing 2 minutes with quick task completion animation",
          },
          {
            id: "scene-3",
            text: "Number two: Time blocking. Schedule specific blocks for focused work.",
            visualDescription: "Calendar with colored time blocks",
          },
          {
            id: "scene-4",
            text: "Number three: The Pomodoro technique. Work for 25 minutes, then take a 5-minute break.",
            visualDescription: "Tomato timer with 25:00 countdown",
          },
          {
            id: "scene-5",
            text: "Number four: Eat the frog. Do your hardest task first thing in the morning.",
            visualDescription: "Cartoon frog on a plate with sunrise background",
          },
          {
            id: "scene-6",
            text: "Number five: Digital detox. Turn off notifications during deep work sessions.",
            visualDescription: "Phone being put in drawer with do not disturb icon",
          },
        ],
        generatedAt: new Date(Date.now() - 86400000),
      },
      voiceover: {
        filePath: "/uploads/voiceover-productivity.mp3",
        duration: 45,
        uploadedAt: new Date(),
      },
      whisperAnalysis: {
        fullTranscript: "Here are 5 productivity hacks that actually work. Number one: The two-minute rule. If something takes less than two minutes, do it now. Number two: Time blocking. Schedule specific blocks for focused work.",
        words: [
          { word: "Here", start: 0.0, end: 0.3 },
          { word: "are", start: 0.3, end: 0.5 },
          { word: "5", start: 0.5, end: 0.8 },
          { word: "productivity", start: 0.8, end: 1.4 },
          { word: "hacks", start: 1.4, end: 1.8 },
          { word: "that", start: 1.8, end: 2.0 },
          { word: "actually", start: 2.0, end: 2.5 },
          { word: "work", start: 2.5, end: 2.9 },
        ],
        segments: [
          { id: 1, start: 0, end: 3, text: "Here are 5 productivity hacks that actually work." },
          { id: 2, start: 3, end: 8, text: "Number one: The two-minute rule." },
          { id: 3, start: 8, end: 12, text: "If something takes less than two minutes, do it now." },
        ],
        analyzedAt: new Date(),
      },
      timeline: { totalDuration: 45, scenes: [] },
    },
    // Project with images ready
    {
      userId,
      title: "The History of Coffee in 60 Seconds",
      reelIdea: "Quick history of how coffee became the world's favorite drink",
      status: "images-ready" as const,
      aspectRatio: "9:16" as const,
      researchData: {
        sources: [
          {
            title: "Coffee History - Smithsonian",
            url: "https://example.com/coffee-history",
            snippet: "Coffee was discovered in Ethiopia around the 9th century.",
          },
        ],
        keywords: ["coffee", "history", "Ethiopia", "caffeine", "beverage"],
        generatedAt: new Date(Date.now() - 172800000),
      },
      script: {
        fullText: "Coffee: The drink that runs the world. It all started in Ethiopia over 1000 years ago, when a goat herder noticed his goats dancing after eating red berries. Those berries were coffee cherries. By the 15th century, coffee spread to the Middle East, then to Europe, and eventually became the second most traded commodity on Earth after oil.",
        scenes: [
          {
            id: "scene-1",
            text: "Coffee: The drink that runs the world.",
            visualDescription: "Steaming cup of coffee with world map in background",
          },
          {
            id: "scene-2",
            text: "It all started in Ethiopia over 1000 years ago",
            visualDescription: "Ancient Ethiopian landscape with coffee plants",
          },
          {
            id: "scene-3",
            text: "when a goat herder noticed his goats dancing after eating red berries.",
            visualDescription: "Goats jumping around near red coffee cherries",
          },
          {
            id: "scene-4",
            text: "Those berries were coffee cherries.",
            visualDescription: "Close-up of red coffee cherries on branch",
          },
          {
            id: "scene-5",
            text: "By the 15th century, coffee spread to the Middle East, then to Europe",
            visualDescription: "Map showing coffee trade routes from Ethiopia to Middle East to Europe",
          },
          {
            id: "scene-6",
            text: "and eventually became the second most traded commodity on Earth after oil.",
            visualDescription: "Modern coffee shop with barista making espresso",
          },
        ],
        generatedAt: new Date(Date.now() - 172800000),
      },
      voiceover: {
        filePath: "/uploads/voiceover-coffee.mp3",
        duration: 35,
        uploadedAt: new Date(Date.now() - 86400000),
      },
      whisperAnalysis: {
        fullTranscript: "Coffee: The drink that runs the world. It all started in Ethiopia over 1000 years ago.",
        words: [
          { word: "Coffee", start: 0.0, end: 0.5 },
          { word: "The", start: 0.6, end: 0.8 },
          { word: "drink", start: 0.8, end: 1.1 },
          { word: "that", start: 1.1, end: 1.3 },
          { word: "runs", start: 1.3, end: 1.6 },
          { word: "the", start: 1.6, end: 1.8 },
          { word: "world", start: 1.8, end: 2.2 },
        ],
        segments: [
          { id: 1, start: 0, end: 2.5, text: "Coffee: The drink that runs the world." },
          { id: 2, start: 2.5, end: 6, text: "It all started in Ethiopia over 1000 years ago." },
        ],
        analyzedAt: new Date(Date.now() - 86400000),
      },
      timeline: {
        totalDuration: 35,
        scenes: [
          {
            id: "scene-1",
            order: 0,
            startTime: 0,
            endTime: 2.5,
            duration: 2.5,
            sceneText: "Coffee: The drink that runs the world.",
            sceneDescription: "Steaming cup of coffee with world map in background",
            imagePrompt: "A steaming cup of coffee in the foreground with a stylized world map in the background, warm lighting, cinematic",
            imagePath: "/images/coffee-scene-1.jpg",
            imageSource: "ai-generated" as const,
            subtitles: [
              { id: "sub-1", start: 0.0, end: 0.5, text: "Coffee:" },
              { id: "sub-2", start: 0.6, end: 2.2, text: "The drink that runs the world." },
            ],
          },
          {
            id: "scene-2",
            order: 1,
            startTime: 2.5,
            endTime: 6,
            duration: 3.5,
            sceneText: "It all started in Ethiopia over 1000 years ago",
            sceneDescription: "Ancient Ethiopian landscape with coffee plants",
            imagePrompt: "Ancient Ethiopian highlands with wild coffee plants, misty mountains, historical setting, cinematic lighting",
            imagePath: "/images/coffee-scene-2.jpg",
            imageSource: "ai-generated" as const,
            subtitles: [
              { id: "sub-3", start: 2.5, end: 6, text: "It all started in Ethiopia over 1000 years ago" },
            ],
          },
        ],
      },
    },
    // Completed project
    {
      userId,
      title: "Why Do We Dream?",
      reelIdea: "Explore the science behind dreams and their purpose",
      status: "completed" as const,
      aspectRatio: "9:16" as const,
      researchData: {
        sources: [
          {
            title: "The Science of Dreams",
            url: "https://example.com/dream-science",
            snippet: "Dreams occur during REM sleep and may help process emotions.",
          },
        ],
        keywords: ["dreams", "REM", "sleep", "psychology", "brain"],
        generatedAt: new Date(Date.now() - 604800000),
      },
      script: {
        fullText: "Why do we dream? Scientists believe dreams help us process emotions, consolidate memories, and solve problems. During REM sleep, your brain is almost as active as when you're awake. Some researchers think dreams are your brain's way of taking out the mental trash, clearing out unnecessary information. Others believe dreams help us rehearse for real-life situations. Whatever the reason, we all dream - even if we don't remember it!",
        scenes: [
          {
            id: "scene-1",
            text: "Why do we dream?",
            visualDescription: "Person sleeping with dream clouds above their head",
          },
          {
            id: "scene-2",
            text: "Scientists believe dreams help us process emotions, consolidate memories, and solve problems.",
            visualDescription: "Brain illustration with glowing neural connections",
          },
        ],
        generatedAt: new Date(Date.now() - 604800000),
      },
      voiceover: {
        filePath: "/uploads/voiceover-dreams.mp3",
        duration: 42,
        uploadedAt: new Date(Date.now() - 518400000),
      },
      whisperAnalysis: {
        fullTranscript: "Why do we dream? Scientists believe dreams help us process emotions.",
        words: [
          { word: "Why", start: 0.0, end: 0.3 },
          { word: "do", start: 0.3, end: 0.5 },
          { word: "we", start: 0.5, end: 0.7 },
          { word: "dream", start: 0.7, end: 1.1 },
        ],
        segments: [
          { id: 1, start: 0, end: 1.5, text: "Why do we dream?" },
          { id: 2, start: 1.5, end: 6, text: "Scientists believe dreams help us process emotions." },
        ],
        analyzedAt: new Date(Date.now() - 518400000),
      },
      timeline: {
        totalDuration: 42,
        scenes: [
          {
            id: "scene-1",
            order: 0,
            startTime: 0,
            endTime: 1.5,
            duration: 1.5,
            sceneText: "Why do we dream?",
            sceneDescription: "Person sleeping with dream clouds above their head",
            imagePrompt: "Person peacefully sleeping with colorful dream clouds floating above, surreal artistic style",
            imagePath: "/images/dreams-scene-1.jpg",
            imageSource: "ai-generated" as const,
            subtitles: [
              { id: "sub-1", start: 0.0, end: 1.1, text: "Why do we dream?" },
            ],
          },
        ],
      },
      output: {
        videoPath: "/output/why-do-we-dream.mp4",
        thumbnailPath: "/output/why-do-we-dream-thumb.jpg",
        hashtags: ["#dreams", "#sleep", "#science", "#psychology", "#facts"],
        generatedAt: new Date(Date.now() - 432000000),
      },
    },
  ];
}

async function seed() {
  console.log("🌱 Starting seed process...\n");

  try {
    await connectDB();
    console.log("✅ Connected to MongoDB\n");

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await User.deleteMany({});
    await Project.deleteMany({});
    console.log("✅ Cleared existing data\n");

    // Create users
    console.log("👤 Creating test users...");
    const createdUsers = [];
    for (const userData of testUsers) {
      const hashedPassword = await bcrypt.hash(userData.password, 10);
      const user = await User.create({
        ...userData,
        password: hashedPassword,
      });
      createdUsers.push(user);
      console.log(`   ✅ Created user: ${user.email}`);
    }
    console.log("");

    // Create projects for first user
    console.log("📁 Creating sample projects...");
    const sampleProjects = createSampleProjects(createdUsers[0]._id);
    for (const projectData of sampleProjects) {
      const project = await Project.create(projectData);
      console.log(`   ✅ Created project: "${project.title}" (${project.status})`);
    }
    console.log("");

    // Create one project for demo user
    const demoProject = {
      userId: createdUsers[1]._id,
      title: "AI Revolution: What's Coming in 2026",
      reelIdea: "Explore upcoming AI trends and predictions for 2026",
      status: "draft" as const,
      aspectRatio: "9:16" as const,
      timeline: { totalDuration: 0, scenes: [] },
    };
    await Project.create(demoProject);
    console.log(`   ✅ Created project for demo user: "${demoProject.title}"`);

    console.log("\n" + "=".repeat(50));
    console.log("🎉 Seed completed successfully!\n");
    console.log("Test Accounts:");
    console.log("  📧 Email: test@example.com");
    console.log("  🔑 Password: password123\n");
    console.log("  📧 Email: demo@example.com");
    console.log("  🔑 Password: demo123456\n");
    console.log("=".repeat(50));

    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error);
    process.exit(1);
  }
  }

  seed();
}

main();
