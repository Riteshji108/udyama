export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'archived';
export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskCategory = 'roadmap_study' | 'coding_practice' | 'mock_test' | 'revision' | 'interview_prep' | 'general';

export interface Task {
  id: string;
  userId: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  category: TaskCategory;
  trackSlug?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  dueDate?: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserProfile {
  userId: string;
  email: string;
  displayName: string;
  photoURL?: string;
  targetRole: string;
  weeklyHoursGoal: number;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string;
  createdAt: string;
  updatedAt: string;
}

export type DeviceType = 'desktop' | 'tablet' | 'mobile' | 'web';

export interface ActiveDevice {
  id: string;
  userId: string;
  deviceId: string;
  deviceName: string;
  deviceType: DeviceType;
  lastSeenAt: string;
  ipHint?: string;
  isCurrent?: boolean;
}

export interface StudySession {
  id: string;
  userId: string;
  durationSeconds: number;
  category: string;
  taskTitle?: string;
  deviceName?: string;
  createdAt: string;
}

export type MistakeCause = 'concept_gap' | 'careless_slip' | 'misread' | 'time_pressure' | 'guess';

export interface ReviewCard {
  id: string;
  userId: string;
  questionId: string;
  questionTitle: string;
  causeTag: MistakeCause;
  skillSlug: string;
  intervalDays: number;
  easeFactor: number;
  lapses: number;
  dueAt: string;
  createdAt: string;
  updatedAt: string;
}

export interface PracticeAttempt {
  id: string;
  userId: string;
  questionId: string;
  verdict: 'accepted' | 'wrong_answer' | 'syntax_error' | 'timeout';
  score?: number;
  timeSpentSeconds?: number;
  createdAt: string;
}

export interface LearningTrack {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  hoursMin: number;
  hoursMax: number;
  difficultyLevel: 'Foundation' | 'Beginner' | 'Intermediate' | 'Advanced';
  domains: string[];
  skills: { slug: string; name: string; category: string }[];
  modulesCount: number;
  questionsCount: number;
  recommendedWeeklyHours: number;
}

export interface PracticeQuestion {
  id: string;
  title: string;
  trackSlug: string;
  domain: string;
  skillSlug: string;
  difficulty: 1 | 2 | 3 | 4 | 5;
  cognitiveDemand: 'recall' | 'understanding' | 'application' | 'analysis' | 'evaluation' | 'creation';
  questionType: 'sql_coding' | 'mcq' | 'metric_diagnosis' | 'business_case';
  prompt: string;
  datasetContext?: string;
  codeTemplate?: string;
  expectedOutputHint?: string;
  options?: string[];
  correctOptionIndex?: number;
  explanation: string;
  hints: string[];
}
