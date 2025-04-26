export type Channel = {
  id: string;
  name: string;
  userCount?: number;
};

export type DirectMessage = {
  id: string;
  name: string;
  online: boolean;
  initial: string;
};

export type Message = {
  id: string;
  channelId: string;
  content: string;
  sender: string;
  timestamp: string;
};

export type User = {
  id: string;
  name: string;
  joinTime: string;
};

export type ChannelUsers = {
  channelId: string;
  users: User[];
};

export type UserEvent = {
  type: "join" | "leave";
  user: User;
  channelId: string;
};

export type ConnectionStatus = "connected" | "connecting" | "disconnected";

export type ChannelEventType = "connect" | "channel-created" | "channel-updated" | "channel-deleted" | "ping";

export type ChannelEvent = {
  type: ChannelEventType;
  timestamp: string;
  message?: string;
  channels?: Channel[];
  connectionCount: number;
}