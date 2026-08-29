// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export type UserStatus = 'active' | 'inactive' | 'banned';
export type UserPlan = 'free' | 'pro' | 'enterprise';
export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'critical';
export type LogSeverity = 'info' | 'warning' | 'error' | 'critical';
export type FeedbackType = 'bug' | 'feature' | 'general' | 'complaint';
export type Difficulty = 'easy' | 'medium' | 'hard';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  avatar: string;
  registeredAt: string;
  lastActive: string;
  plan: UserPlan;
  status: UserStatus;
  totalAnalyses: number;
  speechAnalyses: number;
  pptAnalyses: number;
  vivaSessions: number;
}

export interface SpeechReport {
  id: string;
  userId: string;
  userName: string;
  date: string;
  confidenceScore: number;
  fluencyScore: number;
  eyeContactScore: number;
  fillerWords: number;
  overallRating: number;
  duration: number;
}

export interface PptReport {
  id: string;
  userId: string;
  userName: string;
  presentationName: string;
  date: string;
  contentScore: number;
  deliveryScore: number;
  engagementScore: number;
  overallRating: number;
  slideCount: number;
  category: string;
}

export interface VivaSession {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  date: string;
  questionsAsked: number;
  score: number;
  duration: number;
}

export interface VivaQuestion {
  id: string;
  question: string;
  category: string;
  difficulty: Difficulty;
  subject: string;
  createdAt: string;
  timesUsed: number;
}

export interface Subscription {
  id: string;
  name: string;
  price: number;
  interval: 'month' | 'year';
  features: string[];
  userCount: number;
  isPopular?: boolean;
}

export interface Payment {
  id: string;
  userId: string;
  userName: string;
  amount: number;
  plan: string;
  date: string;
  status: 'completed' | 'failed' | 'refunded' | 'pending';
  method: string;
}

export interface Feedback {
  id: string;
  userId: string;
  userName: string;
  type: FeedbackType;
  rating: number;
  message: string;
  date: string;
}

export interface SupportTicket {
  id: string;
  userId: string;
  userName: string;
  subject: string;
  status: TicketStatus;
  priority: TicketPriority;
  createdAt: string;
  lastReply: string;
  messages: number;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  severity: LogSeverity;
  category: string;
  message: string;
  source: string;
  details?: string;
}

export interface ActivityItem {
  id: string;
  type: 'registration' | 'subscription' | 'speech' | 'ppt' | 'viva';
  message: string;
  timestamp: string;
  userName: string;
}

// â”€â”€â”€ Data Arrays â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

export const users: AdminUser[] = [];
export const speechReports: SpeechReport[] = [];
export const pptReports: PptReport[] = [];
export const vivaSessions: VivaSession[] = [];
export const vivaQuestions: VivaQuestion[] = [];
export const subscriptionPlans: Subscription[] = [];
export const payments: Payment[] = [];
export const feedbackItems: Feedback[] = [];
export const supportTickets: SupportTicket[] = [];
export const systemLogs: SystemLog[] = [];
export const activityFeed: ActivityItem[] = [];
export const userGrowthData: any[] = [];
export const revenueData: any[] = [];
export const dailyActiveUsersData: any[] = [];
export const moduleUsageData: any[] = [];
export const scoreTrendsData: any[] = [];
