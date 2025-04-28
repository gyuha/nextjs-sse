import { NextResponse } from "next/server";

// SSE 관리자의 공통 기능을 추상화한 베이스 클래스
export abstract class BaseSSEManager<T = unknown> {
  protected controllers: Map<string, Set<ReadableStreamController<unknown>>>;

  constructor() {
    this.controllers = new Map();
  }

  // 컨트롤러 제거 (공통 로직)
  protected removeControllerFromMap(
    key: string,
    controller: ReadableStreamController<Uint8Array>
  ): boolean {
    const controllers = this.controllers.get(key);
    if (controllers) {
      controllers.delete(controller);
      
      // 해당 키에 연결이 하나도 없으면 Map에서 제거
      if (controllers.size === 0) {
        this.controllers.delete(key);
        console.log(`${key}에 연결이 없어 맵에서 제거됨`);
        return true;
      }
    }
    return false;
  }

  // 메시지 브로드캐스트 (공통 로직)
  protected broadcastToControllers(
    key: string,
    data: any
  ): void {
    const controllers = this.controllers.get(key);
    if (!controllers || controllers.size === 0) {
      console.log(`${key}에 활성 연결이 없습니다.`);
      return;
    }

    // SSE 형식에 맞춘 메시지 포맷팅
    const message = `data: ${JSON.stringify(data)}\n\n`;
    const encoded = new TextEncoder().encode(message);

    console.log(`${key}로 메시지 브로드캐스트: ${JSON.stringify(data)}`);
    console.log(`${key}의 현재 연결된 클라이언트 수: ${controllers.size}`);

    for (const controller of controllers) {
      try {
        controller.enqueue(encoded);
      } catch (error) {
        console.error(`${key} 메시지 전송 중 오류 발생:`, error);
        this.removeControllerFromMap(key, controller);
      }
    }
  }

  // 특정 키(채널/클라이언트)의 연결 수 반환
  public getConnectionCount(key: string): number {
    return this.controllers.get(key)?.size || 0;
  }

  // 전체 키 목록 반환
  public getKeys(): string[] {
    return Array.from(this.controllers.keys());
  }

  // 전체 연결 수 반환
  public get totalConnectionCount(): number {
    let count = 0;
    for (const controllers of this.controllers.values()) {
      count += controllers.size;
    }
    return count;
  }

  // SSE 응답 생성 (공통 로직)
  protected createSSEResponse(stream: ReadableStream): Response {
    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  }
}