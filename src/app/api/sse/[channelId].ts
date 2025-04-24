import { Message } from "@/components/chatting/types";
import { NextRequest, NextResponse } from "next/server";

// 채널별 SSE 연결을 관리하는 클래스
class SSEConnectionManager {
  private static instance: SSEConnectionManager;
  private channelControllers: Map<string, Set<ReadableStreamController<Uint8Array>>>;

  private constructor() {
    this.channelControllers = new Map();
  }

  // 싱글톤 패턴 사용
  public static getInstance(): SSEConnectionManager {
    if (!SSEConnectionManager.instance) {
      SSEConnectionManager.instance = new SSEConnectionManager();
    }
    return SSEConnectionManager.instance;
  }

  // 새 컨트롤러 등록 (채널별)
  public registerController(channelId: string, controller: ReadableStreamController<Uint8Array>): void {
    if (!this.channelControllers.has(channelId)) {
      this.channelControllers.set(channelId, new Set());
    }
    
    this.channelControllers.get(channelId)?.add(controller);
    console.log(`새 연결 등록됨. 채널: ${channelId}, 현재 연결 수: ${this.getChannelConnectionCount(channelId)}`);
  }

  // 컨트롤러 제거 (채널별)
  public removeController(channelId: string, controller: ReadableStreamController<Uint8Array>): void {
    const controllers = this.channelControllers.get(channelId);
    if (controllers) {
      controllers.delete(controller);
      console.log(`연결 종료됨. 채널: ${channelId}, 현재 연결 수: ${this.getChannelConnectionCount(channelId)}`);
      
      // 채널에 연결이 하나도 없으면 Map에서 제거
      if (controllers.size === 0) {
        this.channelControllers.delete(channelId);
        console.log(`채널 ${channelId}에 연결이 없어 채널 정리됨`);
      }
    }
  }

  // 특정 채널의 모든 클라이언트에 메시지 전송
  public broadcastToChannel(channelId: string, data: any): void {
    const controllers = this.channelControllers.get(channelId);
    if (!controllers || controllers.size === 0) {
      console.log(`채널 ${channelId}에 활성 연결이 없습니다.`);
      return;
    }

    // SSE 형식에 맞춘 메시지 포맷팅
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(message);
    
    console.log(`채널 ${channelId}로 메시지 브로드캐스트: ${JSON.stringify(data)}`);
    console.log(`채널 ${channelId}의 현재 연결된 클라이언트 수: ${controllers.size}`);
    
    controllers.forEach(controller => {
      try {
        controller.enqueue(encoded);
      } catch (error) {
        console.error(`채널 ${channelId} 메시지 전송 중 오류 발생:`, error);
        this.removeController(channelId, controller);
      }
    });
  }

  // 현재 특정 채널의 연결 수 반환
  public getChannelConnectionCount(channelId: string): number {
    return this.channelControllers.get(channelId)?.size || 0;
  }

  // 전체 채널 목록 반환
  public getChannels(): string[] {
    return Array.from(this.channelControllers.keys());
  }
  
  // 전체 연결 수 반환
  public get totalConnectionCount(): number {
    let count = 0;
    for (const controllers of this.channelControllers.values()) {
      count += controllers.size;
    }
    return count;
  }
}

// 싱글톤 인스턴스 가져오기
const connectionManager = SSEConnectionManager.getInstance();

// GET 요청 처리 - SSE 연결 설정
export async function GET(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const channelId = params.channelId;
  console.log(`채널 ${channelId}에 SSE 연결 요청 받음`);
  
  // 클라이언트에 주기적으로 핑 메시지를 보내기 위한 타이머 ID
  let pingInterval: NodeJS.Timeout | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      // 클라이언트 연결 등록 (채널별)
      connectionManager.registerController(channelId, controller);
      
      // 연결 시작 메시지
      const connectMessage = `data: ${JSON.stringify({ 
        type: "connect", 
        message: "연결됨", 
        channelId: channelId,
        connectionCount: connectionManager.getChannelConnectionCount(channelId) 
      })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMessage));
      
      // 15초마다 핑 메시지 전송하여 연결 유지
      pingInterval = setInterval(() => {
        try {
          const pingMessage = `data: ${JSON.stringify({ 
            type: "ping", 
            channelId: channelId,
            timestamp: new Date().toISOString() 
          })}\n\n`;
          controller.enqueue(new TextEncoder().encode(pingMessage));
        } catch (error) {
          console.error(`채널 ${channelId} 핑 메시지 전송 중 오류:`, error);
          connectionManager.removeController(channelId, controller);
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          controller.close();
        }
      }, 15000);
      
      // 연결이 종료될 때 컨트롤러 제거 및 리소스 정리
      request.signal.addEventListener("abort", () => {
        console.log(`채널 ${channelId} 클라이언트 연결 종료됨`);
        connectionManager.removeController(channelId, controller);
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        controller.close();
      });
    },
    cancel() {
      console.log(`채널 ${channelId} 스트림 취소됨`);
      if (pingInterval) {
        clearInterval(pingInterval);
        pingInterval = null;
      }
    }
  });

  return new NextResponse(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

// POST 요청 처리 - 메시지 브로드캐스트
export async function POST(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  const channelId = params.channelId;
  
  try {
    console.log(`채널 ${channelId}로 새 메시지 수신됨`);
    const message: Message = await request.json();
    
    console.log("받은 메시지:", message);
    
    // 채널 ID가 다른 경우 요청 URL의 채널 ID로 덮어쓰기
    if (message.channelId !== channelId) {
      console.log(`메시지 채널 ID(${message.channelId})와 요청 URL 채널 ID(${channelId})가 다릅니다. URL 채널 ID로 덮어씁니다.`);
      message.channelId = channelId;
    }
    
    // 필요한 필드 검증
    if (!message.content || !message.sender) {
      console.error("유효하지 않은 메시지 형식:", message);
      return NextResponse.json(
        { error: "유효하지 않은 메시지 형식입니다" },
        { status: 400 }
      );
    }
    
    // 타임스탬프 없으면 현재 시간 추가
    if (!message.timestamp) {
      message.timestamp = new Date().toISOString();
    }
    
    // ID가 없으면 임시 ID 생성
    if (!message.id) {
      message.id = crypto.randomUUID();
    }
    
    // 해당 채널의 모든 클라이언트에 메시지 브로드캐스트
    connectionManager.broadcastToChannel(channelId, {
      type: "message",
      channelId: channelId,
      data: message
    });
    
    return NextResponse.json({ success: true, message }, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      }
    });
  } catch (error) {
    console.error(`채널 ${channelId} 메시지 처리 중 오류 발생:`, error);
    return NextResponse.json(
      { error: "메시지 처리 중 오류가 발생했습니다" },
      { 
        status: 500,
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
      }
    );
  }
}

// OPTIONS 요청 처리 - CORS 프리플라이트 요청 대응
export async function OPTIONS(
  request: NextRequest,
  { params }: { params: { channelId: string } }
) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  });
}