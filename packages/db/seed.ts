import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from './generated/prisma/client';

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...\n');

  // ==========================================
  // CREATE USERS (Admin + Learners)
  // ==========================================
  console.log('👥 Creating users...');

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@kortex.com' },
    update: {},
    create: {
      clerkId: 'clerk_admin_kortex_001',
      email: 'admin@kortex.com',
      firstName: 'Admin',
      lastName: 'Kortex',
      imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      totalXp: 50000,
      level: 25,
      currentStreak: 30,
      longestStreak: 45,
      lastActiveAt: new Date(),
    },
  });
  console.log(`  ✅ Admin user: ${adminUser.email}`);

  // Sample learners
  const learners = await Promise.all([
    prisma.user.upsert({
      where: { email: 'john.doe@example.com' },
      update: {},
      create: {
        clerkId: 'clerk_learner_001',
        email: 'john.doe@example.com',
        firstName: 'John',
        lastName: 'Doe',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
        totalXp: 2500,
        level: 5,
        currentStreak: 7,
        longestStreak: 14,
        lastActiveAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'jane.smith@example.com' },
      update: {},
      create: {
        clerkId: 'clerk_learner_002',
        email: 'jane.smith@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
        totalXp: 4200,
        level: 8,
        currentStreak: 12,
        longestStreak: 21,
        lastActiveAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'alex.johnson@example.com' },
      update: {},
      create: {
        clerkId: 'clerk_learner_003',
        email: 'alex.johnson@example.com',
        firstName: 'Alex',
        lastName: 'Johnson',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex',
        totalXp: 1800,
        level: 4,
        currentStreak: 3,
        longestStreak: 10,
        lastActiveAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
    }),
    prisma.user.upsert({
      where: { email: 'sarah.wilson@example.com' },
      update: {},
      create: {
        clerkId: 'clerk_learner_004',
        email: 'sarah.wilson@example.com',
        firstName: 'Sarah',
        lastName: 'Wilson',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
        totalXp: 6500,
        level: 12,
        currentStreak: 21,
        longestStreak: 28,
        lastActiveAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'mike.brown@example.com' },
      update: {},
      create: {
        clerkId: 'clerk_learner_005',
        email: 'mike.brown@example.com',
        firstName: 'Mike',
        lastName: 'Brown',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
        totalXp: 950,
        level: 2,
        currentStreak: 1,
        longestStreak: 5,
        lastActiveAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
    }),
    prisma.user.upsert({
      where: { email: 'emily.davis@example.com' },
      update: {},
      create: {
        clerkId: 'clerk_learner_006',
        email: 'emily.davis@example.com',
        firstName: 'Emily',
        lastName: 'Davis',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emily',
        totalXp: 3200,
        level: 6,
        currentStreak: 5,
        longestStreak: 15,
        lastActiveAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'chris.taylor@example.com' },
      update: {},
      create: {
        clerkId: 'clerk_learner_007',
        email: 'chris.taylor@example.com',
        firstName: 'Chris',
        lastName: 'Taylor',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=chris',
        totalXp: 8900,
        level: 15,
        currentStreak: 45,
        longestStreak: 45,
        lastActiveAt: new Date(),
      },
    }),
    prisma.user.upsert({
      where: { email: 'lisa.anderson@example.com' },
      update: {},
      create: {
        clerkId: 'clerk_learner_008',
        email: 'lisa.anderson@example.com',
        firstName: 'Lisa',
        lastName: 'Anderson',
        imageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
        totalXp: 5600,
        level: 10,
        currentStreak: 8,
        longestStreak: 20,
        lastActiveAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
    }),
  ]);
  console.log(`  ✅ Created ${learners.length} learners\n`);

  // Create sample badges
  console.log('📛 Creating badges...');
  const badges = await Promise.all([
    prisma.badge.upsert({
      where: { name: 'First Lesson' },
      update: {},
      create: {
        name: 'First Lesson',
        description: 'Complete your first lesson',
        imageUrl: '/badges/first-lesson.svg',
        requirement: 'FIRST_LESSON',
        threshold: 1,
        xpBonus: 50,
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Course Pioneer' },
      update: {},
      create: {
        name: 'Course Pioneer',
        description: 'Complete your first course',
        imageUrl: '/badges/first-course.svg',
        requirement: 'FIRST_COURSE',
        threshold: 1,
        xpBonus: 200,
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Week Warrior' },
      update: {},
      create: {
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak',
        imageUrl: '/badges/streak-7.svg',
        requirement: 'STREAK_DAYS',
        threshold: 7,
        xpBonus: 150,
      },
    }),
    prisma.badge.upsert({
      where: { name: 'Perfect Score' },
      update: {},
      create: {
        name: 'Perfect Score',
        description: 'Get 100% on a quiz',
        imageUrl: '/badges/perfect-score.svg',
        requirement: 'QUIZ_PERFECT_SCORE',
        threshold: 1,
        xpBonus: 100,
      },
    }),
  ]);
  console.log(`  ✅ Created ${badges.length} badges\n`);

  // Create sample course: Introduction to Machine Learning
  console.log('📚 Creating sample course: Introduction to Machine Learning...');

  const mlCourse = await prisma.course.upsert({
    where: { slug: 'intro-to-machine-learning' },
    update: {},
    create: {
      title: 'Introduction to Machine Learning',
      slug: 'intro-to-machine-learning',
      description: 'Master the fundamentals of machine learning. From basic concepts to building your first models, this course will give you a solid foundation in ML.',
      imageUrl: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800',
      category: 'AI & Machine Learning',
      difficulty: 'BEGINNER',
      courseOutcomes: [
        'Understand the core concepts of machine learning',
        'Differentiate between supervised and unsupervised learning',
        'Build and evaluate simple ML models',
        'Apply ML algorithms to real-world problems',
      ],
      prerequisites: ['Basic Python knowledge', 'High school mathematics'],
      targetAudience: 'Developers and students interested in AI',
      estimatedHours: 15,
      isPublished: true,
      isFeatured: true,
    },
  });

  // Module 1: What is Machine Learning?
  const module1 = await prisma.module.upsert({
    where: {
      courseId_order: {
        courseId: mlCourse.id,
        order: 1,
      },
    },
    update: {},
    create: {
      courseId: mlCourse.id,
      title: 'What is Machine Learning?',
      description: 'Understand the fundamental concepts and terminology of machine learning.',
      order: 1,
      bloomLevel: 'REMEMBER',
      courseOutcome: 'Students will be able to define machine learning and identify its key components.',
      estimatedMinutes: 45,
    },
  });

  // Lessons for Module 1
  await prisma.lesson.upsert({
    where: {
      moduleId_order: {
        moduleId: module1.id,
        order: 1,
      },
    },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'The AI Revolution',
      description: 'Explore how AI and ML are transforming industries.',
      order: 1,
      mdxContent: `
# The AI Revolution

Machine Learning (ML) is a subset of Artificial Intelligence (AI) that enables computers to learn from data without being explicitly programmed.

## What Makes ML Special?

Traditional programming requires explicit rules:
\`\`\`
if email contains "free money" → spam
if email contains "meeting" → not spam
\`\`\`

But what about emails with "free lunch meeting"? 🤔

**Machine Learning** learns patterns from examples, making it more flexible and powerful.

## Real-World Applications

- 🎵 **Spotify** recommends music based on your listening habits
- 📧 **Gmail** filters spam with 99.9% accuracy
- 🚗 **Tesla** powers autonomous driving systems
- 🏥 **Healthcare** detects diseases from medical images

> "Machine learning is the last invention humanity will ever need to make." — Nick Bostrom
      `,
      type: 'TEXT',
      duration: 10,
      xpReward: 50,
      bloomLevel: 'REMEMBER',
      keyConcepts: ['Artificial Intelligence', 'Machine Learning', 'Pattern Recognition'],
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_order: {
        moduleId: module1.id,
        order: 2,
      },
    },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'Types of Machine Learning',
      description: 'Learn about supervised, unsupervised, and reinforcement learning.',
      order: 2,
      mdxContent: `
# Types of Machine Learning

Machine Learning can be categorized into three main types based on how algorithms learn from data.

## 1. Supervised Learning 📊

The algorithm learns from **labeled data** - examples with known answers.

**Use Cases:**
- Email spam detection (spam / not spam)
- House price prediction (input → price)
- Image classification (cat / dog)

## 2. Unsupervised Learning 🔍

The algorithm finds **hidden patterns** in data without labels.

**Use Cases:**
- Customer segmentation
- Anomaly detection
- Topic modeling in documents

## 3. Reinforcement Learning 🎮

The algorithm learns by **trial and error**, receiving rewards for good actions.

**Use Cases:**
- Game AI (AlphaGo, OpenAI Five)
- Robotics
- Autonomous vehicles

## Quick Comparison

| Type | Data | Goal | Example |
|------|------|------|---------|
| Supervised | Labeled | Predict | Spam filter |
| Unsupervised | Unlabeled | Discover | Customer groups |
| Reinforcement | Rewards | Optimize | Game AI |
      `,
      type: 'TEXT',
      duration: 15,
      xpReward: 50,
      bloomLevel: 'UNDERSTAND',
      keyConcepts: ['Supervised Learning', 'Unsupervised Learning', 'Reinforcement Learning'],
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_order: {
        moduleId: module1.id,
        order: 3,
      },
    },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'The ML Pipeline',
      description: 'Understand the end-to-end process of building ML models.',
      order: 3,
      mdxContent: `
# The Machine Learning Pipeline

Building a machine learning model involves several key stages.

## 1. Data Collection 📥

Gather relevant data from various sources:
- Databases
- APIs
- Web scraping
- Sensors & IoT devices

## 2. Data Preprocessing 🧹

Clean and prepare data for training:
- Handle missing values
- Remove duplicates
- Normalize/standardize features
- Encode categorical variables

## 3. Feature Engineering ⚙️

Create meaningful features:
- Select important variables
- Create new features from existing ones
- Reduce dimensionality

## 4. Model Training 🎯

Choose and train the model:
- Split data (train/test/validation)
- Select algorithm
- Train on training data
- Tune hyperparameters

## 5. Evaluation 📊

Assess model performance:
- Accuracy, Precision, Recall
- Confusion matrix
- Cross-validation

## 6. Deployment 🚀

Put model into production:
- API endpoints
- Batch processing
- Edge deployment

> Remember: **Garbage in, garbage out!** Data quality is crucial.
      `,
      type: 'TEXT',
      duration: 12,
      xpReward: 50,
      bloomLevel: 'UNDERSTAND',
      keyConcepts: ['Data Pipeline', 'Preprocessing', 'Feature Engineering', 'Model Training'],
    },
  });

  // Quiz for Module 1
  await prisma.quiz.upsert({
    where: { moduleId: module1.id },
    update: {},
    create: {
      moduleId: module1.id,
      title: 'Module 1 Assessment',
      description: 'Test your understanding of machine learning fundamentals.',
      passingScore: 80,
      timeLimit: 10,
      xpReward: 100,
      questions: [
        {
          id: 'q1',
          text: 'What is Machine Learning?',
          type: 'multiple_choice',
          options: [
            'A type of programming where rules are explicitly coded',
            'A subset of AI where computers learn from data',
            'A hardware component in modern computers',
            'A programming language for data science',
          ],
          correctAnswer: 'A subset of AI where computers learn from data',
          explanation: 'ML enables computers to learn patterns from data without explicit programming.',
        },
        {
          id: 'q2',
          text: 'Which type of ML uses labeled data?',
          type: 'multiple_choice',
          options: [
            'Unsupervised Learning',
            'Reinforcement Learning',
            'Supervised Learning',
            'Deep Learning',
          ],
          correctAnswer: 'Supervised Learning',
          explanation: 'Supervised learning uses labeled examples to train the model.',
        },
        {
          id: 'q3',
          text: 'Customer segmentation is an example of:',
          type: 'multiple_choice',
          options: [
            'Supervised Learning',
            'Unsupervised Learning',
            'Reinforcement Learning',
            'Transfer Learning',
          ],
          correctAnswer: 'Unsupervised Learning',
          explanation: 'Clustering customers into groups is done without predefined labels.',
        },
        {
          id: 'q4',
          text: 'AlphaGo uses which type of learning?',
          type: 'multiple_choice',
          options: [
            'Supervised Learning',
            'Unsupervised Learning',
            'Reinforcement Learning',
            'Semi-supervised Learning',
          ],
          correctAnswer: 'Reinforcement Learning',
          explanation: 'AlphaGo learns by playing games and receiving rewards for winning.',
        },
        {
          id: 'q5',
          text: 'What is the first step in the ML pipeline?',
          type: 'multiple_choice',
          options: [
            'Model Training',
            'Feature Engineering',
            'Data Collection',
            'Deployment',
          ],
          correctAnswer: 'Data Collection',
          explanation: 'Before anything else, you need data to work with.',
        },
      ],
    },
  });

  // Module 2: Supervised Learning Deep Dive
  const module2 = await prisma.module.upsert({
    where: {
      courseId_order: {
        courseId: mlCourse.id,
        order: 2,
      },
    },
    update: {},
    create: {
      courseId: mlCourse.id,
      title: 'Supervised Learning Deep Dive',
      description: 'Master the techniques of supervised learning including classification and regression.',
      order: 2,
      bloomLevel: 'APPLY',
      courseOutcome: 'Students will be able to implement basic supervised learning algorithms.',
      estimatedMinutes: 60,
    },
  });

  // Lessons for Module 2
  await prisma.lesson.upsert({
    where: {
      moduleId_order: {
        moduleId: module2.id,
        order: 1,
      },
    },
    update: {},
    create: {
      moduleId: module2.id,
      title: 'Linear Regression',
      description: 'Learn the foundation of predictive modeling.',
      order: 1,
      mdxContent: `
# Linear Regression

Linear regression is the simplest and most widely used statistical technique for predictive modeling.

## The Concept

Linear regression finds the **best-fitting line** through data points.

The equation:
$$y = mx + b$$

Where:
- **y** = predicted value
- **m** = slope (coefficient)
- **b** = y-intercept
- **x** = input feature

## Example: House Prices

\`\`\`python
from sklearn.linear_model import LinearRegression

# Features: square footage
X = [[1000], [1500], [2000], [2500]]
# Labels: prices
y = [200000, 300000, 400000, 500000]

model = LinearRegression()
model.fit(X, y)

# Predict price for 1800 sq ft house
prediction = model.predict([[1800]])
print(f"Predicted price: \${prediction[0]:,.0f}")
\`\`\`

## Key Metrics

- **R² Score**: How well the model explains variance (0-1)
- **Mean Squared Error (MSE)**: Average squared difference
- **Root MSE**: Square root of MSE (same units as target)
      `,
      type: 'TEXT',
      duration: 20,
      xpReward: 75,
      bloomLevel: 'APPLY',
      keyConcepts: ['Linear Regression', 'Coefficients', 'R² Score', 'MSE'],
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_order: {
        moduleId: module2.id,
        order: 2,
      },
    },
    update: {},
    create: {
      moduleId: module2.id,
      title: 'Classification with Logistic Regression',
      description: 'Binary classification for yes/no predictions.',
      order: 2,
      mdxContent: `
# Logistic Regression

Despite its name, logistic regression is a **classification** algorithm, not regression!

## The Concept

Logistic regression predicts the **probability** of a binary outcome (0 or 1).

It uses the **sigmoid function** to squash outputs between 0 and 1:
$$\\sigma(z) = \\frac{1}{1 + e^{-z}}$$

## Example: Email Spam Detection

\`\`\`python
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer

# Sample emails
emails = [
    "Win free money now!!!",
    "Meeting at 3pm tomorrow",
    "You've won a lottery!",
    "Project deadline extended"
]
labels = [1, 0, 1, 0]  # 1=spam, 0=not spam

# Convert text to features
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(emails)

# Train model
model = LogisticRegression()
model.fit(X, labels)

# Predict new email
new_email = vectorizer.transform(["Free gift inside!"])
prediction = model.predict(new_email)
probability = model.predict_proba(new_email)
\`\`\`

## Decision Boundary

The model creates a **decision boundary** to separate classes:
- Probability > 0.5 → Class 1 (spam)
- Probability ≤ 0.5 → Class 0 (not spam)
      `,
      type: 'TEXT',
      duration: 25,
      xpReward: 75,
      bloomLevel: 'APPLY',
      keyConcepts: ['Logistic Regression', 'Sigmoid Function', 'Binary Classification', 'Decision Boundary'],
    },
  });

  // Quiz for Module 2
  await prisma.quiz.upsert({
    where: { moduleId: module2.id },
    update: {},
    create: {
      moduleId: module2.id,
      title: 'Module 2 Assessment',
      description: 'Test your understanding of supervised learning techniques.',
      passingScore: 80,
      timeLimit: 10,
      xpReward: 150,
      questions: [
        {
          id: 'q1',
          text: 'Linear regression is used for:',
          type: 'multiple_choice',
          options: [
            'Classification problems',
            'Continuous value prediction',
            'Clustering data',
            'Dimensionality reduction',
          ],
          correctAnswer: 'Continuous value prediction',
          explanation: 'Linear regression predicts continuous numerical values.',
        },
        {
          id: 'q2',
          text: 'What does R² score measure?',
          type: 'multiple_choice',
          options: [
            'Accuracy of classification',
            'How well the model explains variance',
            'The number of features',
            'Training speed',
          ],
          correctAnswer: 'How well the model explains variance',
          explanation: 'R² indicates how much variance in the target is explained by the model.',
        },
        {
          id: 'q3',
          text: 'Logistic regression outputs:',
          type: 'multiple_choice',
          options: [
            'A continuous value',
            'A probability between 0 and 1',
            'Multiple categories',
            'A ranking',
          ],
          correctAnswer: 'A probability between 0 and 1',
          explanation: 'The sigmoid function outputs probabilities for binary classification.',
        },
        {
          id: 'q4',
          text: 'The sigmoid function is also called:',
          type: 'multiple_choice',
          options: [
            'ReLU function',
            'Softmax function',
            'Logistic function',
            'Tanh function',
          ],
          correctAnswer: 'Logistic function',
          explanation: 'The sigmoid is also known as the logistic function.',
        },
      ],
    },
  });

  console.log(`  ✅ Created course: ${mlCourse.title}`);
  console.log(`  📦 Created 2 modules with ${5} lessons total`);
  console.log(`  📝 Created 2 quizzes with ${9} questions total\n`);

  // Create second sample course: Web Development Fundamentals
  console.log('📚 Creating sample course: Web Development Fundamentals...');

  const webDevCourse = await prisma.course.upsert({
    where: { slug: 'web-development-fundamentals' },
    update: {},
    create: {
      title: 'Web Development Fundamentals',
      slug: 'web-development-fundamentals',
      description: 'Learn the core technologies of the web: HTML, CSS, and JavaScript. Build beautiful, interactive websites from scratch.',
      imageUrl: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800',
      category: 'Web Development',
      difficulty: 'BEGINNER',
      courseOutcomes: [
        'Build responsive web pages with HTML & CSS',
        'Add interactivity with JavaScript',
        'Understand the DOM and event handling',
        'Deploy your first website',
      ],
      prerequisites: ['No prior experience required'],
      targetAudience: 'Complete beginners to web development',
      estimatedHours: 20,
      isPublished: true,
      isFeatured: true,
    },
  });

  // Module 1: HTML Basics
  const webModule1 = await prisma.module.upsert({
    where: {
      courseId_order: {
        courseId: webDevCourse.id,
        order: 1,
      },
    },
    update: {},
    create: {
      courseId: webDevCourse.id,
      title: 'HTML: The Structure of the Web',
      description: 'Learn HTML to create the skeleton of web pages.',
      order: 1,
      bloomLevel: 'REMEMBER',
      courseOutcome: 'Students will be able to create basic HTML documents with proper structure.',
      estimatedMinutes: 45,
    },
  });

  await prisma.lesson.upsert({
    where: {
      moduleId_order: {
        moduleId: webModule1.id,
        order: 1,
      },
    },
    update: {},
    create: {
      moduleId: webModule1.id,
      title: 'Your First HTML Page',
      description: 'Create your very first web page!',
      order: 1,
      mdxContent: `
# Your First HTML Page 🌐

Welcome to web development! Let's create your first webpage.

## What is HTML?

**HTML** (HyperText Markup Language) is the standard language for creating web pages. It describes the *structure* of a webpage using **elements**.

## Basic Structure

Every HTML page has this skeleton:

\`\`\`html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My First Page</title>
</head>
<body>
    <h1>Hello, World!</h1>
    <p>This is my first webpage.</p>
</body>
</html>
\`\`\`

## Key Elements

| Element | Purpose |
|---------|---------|
| \`<!DOCTYPE html>\` | Tells browser this is HTML5 |
| \`<html>\` | Root element |
| \`<head>\` | Metadata (title, links, scripts) |
| \`<body>\` | Visible content |

## Try It Yourself! 

1. Open a text editor (VS Code, Notepad++)
2. Paste the code above
3. Save as \`index.html\`
4. Open in your browser 🎉
      `,
      type: 'TEXT',
      duration: 15,
      xpReward: 50,
      bloomLevel: 'REMEMBER',
      keyConcepts: ['HTML', 'Elements', 'Tags', 'Document Structure'],
    },
  });

  // Quiz for Web Module 1
  await prisma.quiz.upsert({
    where: { moduleId: webModule1.id },
    update: {},
    create: {
      moduleId: webModule1.id,
      title: 'HTML Basics Quiz',
      description: 'Test your knowledge of HTML fundamentals.',
      passingScore: 80,
      xpReward: 100,
      questions: [
        {
          id: 'q1',
          text: 'What does HTML stand for?',
          type: 'multiple_choice',
          options: [
            'Hyper Text Markup Language',
            'High Tech Modern Language',
            'Home Tool Markup Language',
            'Hyperlink Text Making Language',
          ],
          correctAnswer: 'Hyper Text Markup Language',
        },
        {
          id: 'q2',
          text: 'Which element contains the visible content?',
          type: 'multiple_choice',
          options: [
            '<head>',
            '<body>',
            '<html>',
            '<meta>',
          ],
          correctAnswer: '<body>',
        },
        {
          id: 'q3',
          text: 'What is the correct tag for the largest heading?',
          type: 'multiple_choice',
          options: ['<h6>', '<heading>', '<h1>', '<head>'],
          correctAnswer: '<h1>',
        },
      ],
    },
  });

  console.log(`  ✅ Created course: ${webDevCourse.title}\n`);

  // ==========================================
  // CREATE ENROLLMENTS & PROGRESS FOR LEARNERS
  // ==========================================
  console.log('📊 Creating enrollments and progress...');

  // Get all lessons for progress tracking
  const mlLessons = await prisma.lesson.findMany({
    where: { module: { courseId: mlCourse.id } },
    orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
  });

  const webLessons = await prisma.lesson.findMany({
    where: { module: { courseId: webDevCourse.id } },
    orderBy: [{ module: { order: 'asc' } }, { order: 'asc' }],
  });

  // Enroll learners in courses with varying progress
  const enrollmentData = [
    // John - ML course: 60% complete
    { userId: learners[0].id, courseId: mlCourse.id, progress: 60, lessons: mlLessons.slice(0, 3) },
    // Jane - ML course: 100% complete, Web: 40% complete
    { userId: learners[1].id, courseId: mlCourse.id, progress: 100, lessons: mlLessons },
    { userId: learners[1].id, courseId: webDevCourse.id, progress: 40, lessons: webLessons.slice(0, 1) },
    // Alex - Web course: 20% complete
    { userId: learners[2].id, courseId: webDevCourse.id, progress: 20, lessons: [] },
    // Sarah - Both courses: ML 100%, Web 80%
    { userId: learners[3].id, courseId: mlCourse.id, progress: 100, lessons: mlLessons },
    { userId: learners[3].id, courseId: webDevCourse.id, progress: 80, lessons: webLessons },
    // Mike - ML course: 10% (just started)
    { userId: learners[4].id, courseId: mlCourse.id, progress: 10, lessons: mlLessons.slice(0, 1) },
    // Emily - Web course: 60%
    { userId: learners[5].id, courseId: webDevCourse.id, progress: 60, lessons: webLessons },
    // Chris - Both courses: 100%
    { userId: learners[6].id, courseId: mlCourse.id, progress: 100, lessons: mlLessons },
    { userId: learners[6].id, courseId: webDevCourse.id, progress: 100, lessons: webLessons },
    // Lisa - ML: 40%
    { userId: learners[7].id, courseId: mlCourse.id, progress: 40, lessons: mlLessons.slice(0, 2) },
  ];

  for (const enrollment of enrollmentData) {
    const isComplete = enrollment.progress === 100;
    
    await prisma.enrollment.upsert({
      where: {
        userId_courseId: {
          userId: enrollment.userId,
          courseId: enrollment.courseId,
        },
      },
      update: {},
      create: {
        userId: enrollment.userId,
        courseId: enrollment.courseId,
        progressPercent: enrollment.progress,
        completedLessons: enrollment.lessons.length,
        totalXpEarned: enrollment.lessons.reduce((sum, l) => sum + l.xpReward, 0),
        status: isComplete ? 'COMPLETED' : 'ACTIVE',
        completedAt: isComplete ? new Date() : null,
        currentModuleId: enrollment.lessons[0]?.moduleId,
        currentLessonId: enrollment.lessons[enrollment.lessons.length - 1]?.id,
      },
    });

    // Create lesson progress for completed lessons
    for (const lesson of enrollment.lessons) {
      await prisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: enrollment.userId,
            lessonId: lesson.id,
          },
        },
        update: {},
        create: {
          userId: enrollment.userId,
          lessonId: lesson.id,
          status: 'COMPLETED',
          progress: 100,
          xpAwarded: lesson.xpReward,
          startedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
          completedAt: new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000),
        },
      });
    }
  }
  console.log(`  ✅ Created ${enrollmentData.length} enrollments with progress\n`);

  // ==========================================
  // AWARD BADGES TO LEARNERS
  // ==========================================
  console.log('🏆 Awarding badges...');

  const badgeAwards = [
    // Everyone gets First Lesson badge
    ...learners.map(l => ({ userId: l.id, badgeId: badges[0].id })),
    // Completed course users get Course Pioneer
    { userId: learners[1].id, badgeId: badges[1].id }, // Jane
    { userId: learners[3].id, badgeId: badges[1].id }, // Sarah
    { userId: learners[6].id, badgeId: badges[1].id }, // Chris
    // High streak users get Week Warrior
    { userId: learners[1].id, badgeId: badges[2].id }, // Jane (12 day streak)
    { userId: learners[3].id, badgeId: badges[2].id }, // Sarah (21 day streak)
    { userId: learners[6].id, badgeId: badges[2].id }, // Chris (45 day streak)
    { userId: learners[7].id, badgeId: badges[2].id }, // Lisa (8 day streak)
    // Perfect score badges
    { userId: learners[6].id, badgeId: badges[3].id }, // Chris
    { userId: learners[3].id, badgeId: badges[3].id }, // Sarah
  ];

  for (const award of badgeAwards) {
    await prisma.userBadge.upsert({
      where: {
        userId_badgeId: {
          userId: award.userId,
          badgeId: award.badgeId,
        },
      },
      update: {},
      create: {
        userId: award.userId,
        badgeId: award.badgeId,
        earnedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
      },
    });
  }
  console.log(`  ✅ Awarded ${badgeAwards.length} badges\n`);

  // ==========================================
  // CREATE QUIZ ATTEMPTS
  // ==========================================
  console.log('📝 Creating quiz attempts...');

  const quizzes = await prisma.quiz.findMany();
  
  const quizAttempts = [
    // Jane passed ML quiz
    { userId: learners[1].id, quizId: quizzes[0].id, score: 100, passed: true },
    // Sarah passed ML quiz
    { userId: learners[3].id, quizId: quizzes[0].id, score: 90, passed: true },
    // Chris passed both
    { userId: learners[6].id, quizId: quizzes[0].id, score: 100, passed: true },
    { userId: learners[6].id, quizId: quizzes[1].id, score: 95, passed: true },
    // John attempted but failed
    { userId: learners[0].id, quizId: quizzes[0].id, score: 60, passed: false },
  ];

  for (const attempt of quizAttempts) {
    await prisma.quizAttempt.create({
      data: {
        userId: attempt.userId,
        quizId: attempt.quizId,
        score: attempt.score,
        passed: attempt.passed,
        answers: {},
        xpAwarded: attempt.passed ? 100 : 0,
        timeTaken: Math.floor(Math.random() * 300) + 120,
      },
    });
  }
  console.log(`  ✅ Created ${quizAttempts.length} quiz attempts\n`);

  console.log('✨ Database seeding complete!');
  console.log(`
Summary:
--------
👤 1 admin user: admin@kortex.com
👥 ${learners.length} learner accounts
📛 ${badges.length} badges created
📚 2 courses created
📦 3 modules with lessons
📝 3 quizzes with questions
📊 ${enrollmentData.length} enrollments
🏆 ${badgeAwards.length} badges awarded
📝 ${quizAttempts.length} quiz attempts

Admin Login:
------------
Email: admin@kortex.com
(Note: Create this user in Clerk with clerkId: clerk_admin_kortex_001)
  `);
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
