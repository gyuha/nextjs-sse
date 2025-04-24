export type Channel = {
  id: string;
  name: string;
  unreadCount?: number;
};

export type DirectMessage = {
  id: string;
  name: string;
  online: boolean;
  initial: string;
};

export type Message = {
  id: string;
  content: string;
  sender: string;
  timestamp: string;
  channelId: string;
};