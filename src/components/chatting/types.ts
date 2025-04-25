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

export type Room = {
  id: string;
  name: string;
  userCount: number;
};

export type RoomEvent = {
  type: "room-created" | "room-updated" | "room-deleted";
  room: Room;
};