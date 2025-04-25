"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Users, MessageSquare } from "lucide-react"

// Sample chat channel data
const chatChannels = [
  { id: 1, name: "일반 채팅", users: 12 },
  { id: 2, name: "게임 토론", users: 8 },
  { id: 3, name: "음악 이야기", users: 5 },
  { id: 4, name: "영화 팬", users: 15 },
  { id: 5, name: "여행 정보", users: 7 },
  { id: 6, name: "요리 레시피", users: 9 },
  { id: 7, name: "스포츠 토크", users: 11 },
]

export default function ChatChannelEntry() {
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null)
  const [username, setUsername] = useState("")
  const [error, setError] = useState("")

  const handleJoin = () => {
    if (!username.trim()) {
      setError("이름을 입력해주세요")
      return
    }

    if (selectedChannel === null) {
      setError("채팅방을 선택해주세요")
      return
    }

    setError("")
    // Here you would typically navigate to the chat channel or connect to a socket
    alert(`${username}님이 "${chatChannels.find((channel) => channel.id === selectedChannel)?.name}" 채팅방에 입장합니다`)
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">채팅방 목록</CardTitle>
          <CardDescription>채팅방을 선택하고 이름을 입력하여 입장하세요</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[300px] rounded-md border p-2">
            <div className="space-y-2">
              {chatChannels.map((channel) => (
                <div
                  key={channel.id}
                  className={`flex items-center justify-between rounded-lg p-3 cursor-pointer transition-colors ${
                    selectedChannel === channel.id ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                  }`}
                  onClick={() => setSelectedChannel(channel.id)}
                >
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    <span className="font-medium">{channel.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm">
                    <Users className="h-4 w-4" />
                    <span>{channel.users}</span>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>

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
            채팅방 입장하기
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
