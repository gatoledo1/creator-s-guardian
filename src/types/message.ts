export type MessageIntent = 'partnership' | 'question' | 'fan' | 'hate' | 'spam';

export type MessagePriority = 'high' | 'medium' | 'low';

export interface Message {
  id: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    followers?: number;
  };
  content: string;
  intent: MessageIntent;
  priority: MessagePriority;
  channel: 'instagram' | 'tiktok' | 'youtube';
  context?: string;
  timestamp: Date;
  isRead: boolean;
  suggestedReply?: string;
  isOpportunity?: boolean;
}
