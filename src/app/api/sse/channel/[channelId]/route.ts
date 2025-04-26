import type { Message, User, UserEvent } from "@/types";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { ChannelConnectionManager } from "@/app/api/sse/route";

const channelManager = ChannelConnectionManager.getInstance();

// 채널별 SSE 연결을 관리하는 클래스
class SSEMessageManager {
  private static instance: SSEMessageManager;
  private channelControllers: Map<string, Set<ReadableStreamController<unknown>>>;
  private channelUsers: Map<string, Map<string, User>>; // 채널별 접속 사용자 관리

  private constructor() {
    this.channelControllers = new Map();
    this.channelUsers = new Map();
  }

  // 싱글톤 패턴 사용
  public static getInstance(): SSEMessageManager {
    if (!SSEMessageManager.instance) {
      SSEMessageManager.instance = new SSEMessageManager();
    }
    return SSEMessageManager.instance;
  }

  // 새 컨트롤러 등록 (채널별)
  public registerController(channelId: string, controller: ReadableStreamController<Uint8Array>, user: User): void {
    if (!this.channelControllers.has(channelId)) {
      this.channelControllers.set(channelId, new Set());
    }
    
    this.channelControllers.get(channelId)?.add(controller);
    
    // 사용자 추가
    this.addUserToChannel(channelId, user);
    
    console.log(`새 연결 등록됨. 채널: ${channelId}, 사용자: ${user.name}, 현재 연결 수: ${this.getChannelConnectionCount(channelId)}`);
    
    // 사용자 접속 이벤트 브로드캐스트
    this.broadcastUserEvent(channelId, {
      type: "join",
      user,
      channelId
    });
  }

  // 컨트롤러 제거 (채널별)
  public removeController(channelId: string, controller: ReadableStreamController<Uint8Array>, userId?: string): void {
    const controllers = this.channelControllers.get(channelId);
    if (controllers) {
      controllers.delete(controller);
      
      // 사용자 ID가 제공되었다면 해당 사용자 제거 및 이벤트 전송
      if (userId) {
        const user = this.removeUserFromChannel(channelId, userId);
        if (user) {
          this.broadcastUserEvent(channelId, {
            type: "leave",
            user,
            channelId
          });
        }
      }
      
      console.log(`연결 종료됨. 채널: ${channelId}, 현재 연결 수: ${this.getChannelConnectionCount(channelId)}`);
      
      // 채널에 연결이 하나도 없으면 Map에서 제거
      if (controllers.size === 0) {
        this.channelControllers.delete(channelId);
        this.channelUsers.delete(channelId); // 사용자 목록도 제거
        console.log(`채널 ${channelId}에 연결이 없어 채널 정리됨`);
      }
    }
  }

  // 사용자를 채널에 추가
  private addUserToChannel(channelId: string, user: User): void {
    if (!this.channelUsers.has(channelId)) {
      this.channelUsers.set(channelId, new Map());
    }
    
    // 동일 ID의 사용자가 이미 있는지 확인
    const users = this.channelUsers.get(channelId);
    if (users && !users.has(user.id)) {
      users.set(user.id, user);
      console.log(`사용자 ${user.name}(${user.id})가 채널 ${channelId}에 추가됨`);
    }
  }

  // 사용자를 채널에서 제거
  private removeUserFromChannel(channelId: string, userId: string): User | undefined {
    const channelUserMap = this.channelUsers.get(channelId);
    if (!channelUserMap) return undefined;
    
    const user = channelUserMap.get(userId);
    if (user) {
      channelUserMap.delete(userId);
      console.log(`사용자 ${user.name}(${userId})가 채널 ${channelId}에서 제거됨`);
      return user;
    }
    
    return undefined;
  }

  // 사용자 이벤트 브로드캐스트
  private broadcastUserEvent(channelId: string, event: UserEvent): void {
    this.broadcastToChannel(channelId, {
      type: "user-event",
      event
    });
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
    
    for (const controller of controllers) {
      try {
        controller.enqueue(encoded);
      } catch (error) {
        console.error(`채널 ${channelId} 메시지 전송 중 오류 발생:`, error);
        this.removeController(channelId, controller);
      }
    }
  }

  // 채널의 사용자 목록 반환
  public getChannelUsers(channelId: string): User[] {
    const userMap = this.channelUsers.get(channelId);
    if (!userMap) return [];
    
    return Array.from(userMap.values());
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
const messageManager = SSEMessageManager.getInstance();

// GET 요청 처리 - SSE 연결 설정
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    // Next.js 15에서는 params가 Promise이므로 await 사용
    const params = await context.params;
    // channelId를 문자열로 명시적 변환하여 비동기 처리 이슈 해결
    const channelId = String(params.channelId || 'general');
    
    // URL에서 사용자 정보 추출
    const url = new URL(request.url);
    const userName = url.searchParams.get('userName') || '익명 사용자';
    const userId = url.searchParams.get('userId') || crypto.randomUUID();
    
    console.log(`채널 ${channelId}에 SSE 연결 요청 받음 - 사용자: ${userName}(${userId}) - 요청 URL: ${request.url}`);
    
    // 사용자 객체 생성
    const user: User = {
      id: userId,
      name: userName,
      joinTime: new Date().toISOString()
    };
    
    // 클라이언트에 주기적으로 핑 메시지를 보내기 위한 타이머 ID
    let pingInterval: NodeJS.Timeout | null = null;
    let controller: ReadableStreamController<Uint8Array>;
    
    const stream = new ReadableStream({
      start(ctrl) {
        controller = ctrl;
        // 클라이언트 연결 및 사용자 등록 (채널별)
        messageManager.registerController(channelId, controller, user);
        
        // 채널의 현재 사용자 목록
        const channelUsers = messageManager.getChannelUsers(channelId);
        
        // 연결 시작 메시지를 즉시 전송
        const connectMessage = `data: ${JSON.stringify({ 
          type: "connect", 
          message: "연결됨", 
          channelId: channelId,
          connectionCount: messageManager.getChannelConnectionCount(channelId),
          users: channelUsers,
          currentUser: user
        })}\n\n`;
        controller.enqueue(new TextEncoder().encode(connectMessage));
        
        // 15초마다 핑 메시지 전송하여 연결 유지
        pingInterval = setInterval(() => {
          try {
            const pingMessage = `data: ${JSON.stringify({ 
              type: "ping", 
              channelId: channelId,
              timestamp: new Date().toISOString(),
              connectionCount: messageManager.getChannelConnectionCount(channelId)
            })}\n\n`;
            controller.enqueue(new TextEncoder().encode(pingMessage));
          } catch (error) {
            console.error(`채널 ${channelId} 핑 메시지 전송 중 오류:`, error);
            messageManager.removeController(channelId, controller, userId);
            if (pingInterval) {
              clearInterval(pingInterval);
              pingInterval = null;
            }
            controller.close();
          }
        }, 15000);
        
        // 연결이 종료될 때 컨트롤러 제거 및 리소스 정리
        request.signal.addEventListener("abort", () => {
          console.log(`채널 ${channelId} 사용자 ${userName}(${userId}) 연결 종료됨`);
          messageManager.removeController(channelId, controller, userId);
          if (pingInterval) {
            clearInterval(pingInterval);
            pingInterval = null;
          }
          controller.close();
        });
      },
      cancel() {
        console.log(`채널 ${channelId} 사용자 ${userName}(${userId}) 스트림 취소됨`);
        messageManager.removeController(channelId, controller, userId);
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
  } catch (error) {
    console.error('SSE 스트림 생성 중 오류:', error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

// POST 요청 처리 - 메시지 브로드캐스트
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ channelId: string }> }
) {
  try {
    const params = await context.params
    const channelId = String(params.channelId) || 'general';
    
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
    messageManager.broadcastToChannel(channelId, {
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
    console.error('채널 메시지 처리 중 오류 발생:', error);
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