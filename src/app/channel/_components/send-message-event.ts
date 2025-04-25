import { Message } from "@/types";

export const sendMessage = async (
  connectionStatus: string,
  channelId: string,
  content: string,
  sender: string
) => {
  if (!content.trim() || !sender.trim()) return;
  if (connectionStatus !== "connected") {
    console.warn(
      "SSE 연결이 활성화되지 않았습니다. 메시지를 보낼 수 없습니다."
    );
    return;
  }

  const message: Partial<Message> = {
    channelId,
    content,
    sender,
    timestamp: new Date().toISOString(),
  };

  try {
    const response = await fetch(`/api/sse/${channelId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(message),
    });

    if (!response.ok) {
      throw new Error("메시지 전송 실패");
    }

    console.log("메시지 전송됨:", message);
  } catch (error) {
    console.error("메시지 전송 중 오류:", error);
  }
};
