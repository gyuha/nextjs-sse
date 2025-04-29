"use client";

import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMobile } from "@/hooks/use-mobile";
import { useChattingContext } from "./chat-provider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { useChannelContext } from "@/app/(room)/_components/channel-provider";
interface ChatHeaderProps {
  toggleSidebar: () => void;
}

export function ChatHeader({ toggleSidebar }: ChatHeaderProps) {
  const { currentChannelId, channels } = useChannelContext();
  const { connectionCount, channelUsers } =
    useChattingContext();
  const isMobile = useMobile();

  // 채널 이름 가져오기
  const getCurrentChannelName = () => {
    const channel = channels.find((c) => c.id === currentChannelId);
    if (channel) return channel.name;

    return "Unknown";
  };

  const isChannelType = channels.some((c) => c.id === currentChannelId);

  // 접속 시간 포맷팅 함수
  const formatJoinTime = (joinTime: string) => {
    try {
      return format(new Date(joinTime), "yyyy-MM-dd HH:mm:ss", { locale: ko });
    } catch (error) {
      return joinTime;
    }
  };

  return (
    <div className="flex items-center justify-between px-4 py-3 border-b">
      <h2 className="font-semibold text-lg">
        {isMobile && (
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            <Menu className="h-5 w-5" />
          </Button>
        )}
        {isChannelType
          ? `# ${getCurrentChannelName()}`
          : getCurrentChannelName()}
      </h2>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <span>접속자</span>
            <Badge variant="secondary">{connectionCount}</Badge>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-2 font-medium border-b">
            채널 접속자 목록 ({channelUsers.length}명)
          </div>
          <div className="max-h-[300px] overflow-y-auto">
            {channelUsers.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                접속자가 없습니다
              </div>
            ) : (
              <ul className="divide-y">
                {channelUsers.map((user) => (
                  <li key={user.id} className="p-3 hover:bg-muted/50">
                    <div className="font-medium">{user.name}</div>
                    <div className="text-xs text-muted-foreground">
                      접속 시간: {formatJoinTime(user.joinTime)}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
