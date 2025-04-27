"use client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MessageSquare, Users } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from 'react';
import ChannelMakeButton from "./channel-make-button";
import { useChannelContext } from "./channel-provider";

const ChannelContainer = (): React.JSX.Element | null => {
  const {
    username,
    currentChannelId,
    setCurrentChannelId,
    channels,
    totalConnectionCount,
    setUsername,
  } = useChannelContext();
  const router = useRouter();
  const [error, setError] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  const handleJoin = () => {
    if (!username.trim()) {
      setError("이름을 입력해주세요");
      return;
    }

    if (currentChannelId === null) {
      setError("채팅방을 선택해주세요");
      return;
    }

    setError("");
    
    // 사용자 이름을 localStorage에 저장 (채팅 화면에서 사용하기 위함)
    localStorage.setItem("chatUsername", username);
    
    // 선택한 채널로 이동
    router.push(`/channel?id=${currentChannelId}&username=${encodeURIComponent(username)}`);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">채팅채널 목록</CardTitle>
          <CardDescription className="flex justify-between items-center">
            <span>채널을 선택하고 이름을 입력하여 입장하세요</span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              총 {totalConnectionCount}명
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[300px] rounded-md border p-2">
            <div className="space-y-2">
              {channels.map((channel) => (
                <div
                  key={channel.id}
                  className={`flex items-center justify-between rounded-lg p-3 cursor-pointer transition-colors ${
                    currentChannelId === channel.id
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
                  onClick={() => {
                    console.log("selected channel", channel);
                    setCurrentChannelId(channel.id);
                  }}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{channel.userCount}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

          <ChannelMakeButton />

          <div className="space-y-2">
            <label htmlFor="username" className="text-sm font-medium">
              이름
            </label>
            <Input
              id="username"
              placeholder="채팅에서 사용할 이름을 입력하세요"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button onClick={handleJoin} className="w-full">
            채팅채널 입장하기
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ChannelContainer;
