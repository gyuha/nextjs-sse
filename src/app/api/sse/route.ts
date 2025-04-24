import { Message } from "@/components/chatting/types";
import { NextRequest, NextResponse } from "next/server";

// 모든 SSE 연결을 관리하는 클래스
class SSEConnectionManager {
  private static instance: SSEConnectionManager;
  private controllers: Set<ReadableStreamController<Uint8Array>>;

  private constructor() {
    this.controllers = new Set();
  }

  // 싱글톤 패턴 사용
  public static getInstance(): SSEConnectionManager {
    if (!SSEConnectionManager.instance) {
      SSEConnectionManager.instance = new SSEConnectionManager();
    }
    return SSEConnectionManager.instance;
  }

  // 새 컨트롤러 등록
  public registerController(controller: ReadableStreamController<Uint8Array>): void {
    this.controllers.add(controller);
    console.log(`새 연결 등록됨. 현재 연결 수: ${this.controllers.size}`);
  }

  // 컨트롤러 제거
  public removeController(controller: ReadableStreamController<Uint8Array>): void {
    this.controllers.delete(controller);
    console.log(`연결 종료됨. 현재 연결 수: ${this.controllers.size}`);
  }

  // 모든 연결된 클라이언트에 메시지 전송
  public broadcast(data: any): void {
    // SSE 형식에 맞춘 메시지 포맷팅
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(message);
    
    console.log(`메시지 브로드캐스트: ${JSON.stringify(data)}`);
    console.log(`현재 연결된 클라이언트 수: ${this.controllers.size}`);
    
    this.controllers.forEach(controller => {
      try {
        controller.enqueue(encoded);
      } catch (error) {
        console.error("메시지 전송 중 오류 발생:", error);
        this.removeController(controller);
      }
    });
  }

  // 현재 연결된 클라이언트 수 반환
  public get connectionCount(): number {
    return this.controllers.size;
  }
}

// 싱글톤 인스턴스 가져오기
const connectionManager = SSEConnectionManager.getInstance();

// GET 요청 처리 - SSE 연결 설정
export async function GET(request: NextRequest) {
  console.log("SSE 연결 요청 받음");
  
  // 클라이언트에 주기적으로 핑 메시지를 보내기 위한 타이머 ID
  let pingInterval: NodeJS.Timeout | null = null;
  
  const stream = new ReadableStream({
    start(controller) {
      // 클라이언트 연결 등록
      connectionManager.registerController(controller);
      
      // 연결 시작 메시지
      const connectMessage = `data: ${JSON.stringify({ type: "connect", message: "연결됨", connectionCount: connectionManager.connectionCount })}\n\n`;
      controller.enqueue(new TextEncoder().encode(connectMessage));
      
      // 15초마다 핑 메시지 전송하여 연결 유지
      pingInterval = setInterval(() => {
        try {
          const pingMessage = `data: ${JSON.stringify({ type: "ping", timestamp: new Date().toISOString() })}\n\n`;
          controller.enqueue(new TextEncoder().encode(pingMessage));
        } catch (error) {
          console.error("핑 메시지 전송 중 오류:", error);
          connectionManager.removeController(controller);
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          controller.close();
        }
      }, 15000);
      
      // 연결이 종료될 때 컨트롤러 제거 및 리소스 정리
      request.signal.addEventListener("abort", () => {
        console.log("클라이언트 연결 종료됨");
        connectionManager.removeController(controller);
        if (pingInterval) {
          clearInterval(pingInterval);
          pingInterval = null;
        }
        controller.close();
      });
    },
    cancel() {
      console.log("스트림 취소됨");
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
export async function POST(request: NextRequest) {
  try {
    console.log("새 메시지 수신됨");
    const message: Message = await request.json();
    
    console.log("받은 메시지:", message);
    
    // 필요한 필드 검증
    if (!message.content || !message.sender || !message.channelId) {
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
    
    // 모든 연결된 클라이언트에 메시지 브로드캐스트
    connectionManager.broadcast({
      type: "message",
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
    console.error("메시지 처리 중 오류 발생:", error);
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
export async function OPTIONS(request: NextRequest) {
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