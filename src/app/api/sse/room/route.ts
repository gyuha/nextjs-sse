import { Room, RoomEvent, User } from "@/components/chatting/types";
import { NextRequest, NextResponse } from "next/server";

// 룸 관리를 위한 싱글톤 클래스
class RoomConnectionManager {
    private static instance: RoomConnectionManager;
    private controllers: Set<ReadableStreamController<Uint8Array>>;
    private rooms: Map<string, Room>;
    private roomUsers: Map<string, Map<string, User>>; // 룸별 접속 사용자 관리

    private constructor() {
        this.controllers = new Set();
        this.rooms = new Map();
        this.roomUsers = new Map();

        // 기본 룸 생성
        this.createRoom('general', '기본 채팅방');
    }

    // 싱글톤 패턴 사용
    public static getInstance(): RoomConnectionManager {
        if (!RoomConnectionManager.instance) {
            RoomConnectionManager.instance = new RoomConnectionManager();
        }
        return RoomConnectionManager.instance;
    }

    // 새 컨트롤러 등록 
    public registerController(controller: ReadableStreamController<Uint8Array>): void {
        this.controllers.add(controller);
        console.log(`새 룸 연결 등록됨. 현재 연결 수: ${this.controllers.size}`);
    }

    // 컨트롤러 제거
    public removeController(controller: ReadableStreamController<Uint8Array>): void {
        this.controllers.delete(controller);
        console.log(`룸 연결 종료됨. 현재 연결 수: ${this.controllers.size}`);
    }

    // 룸 생성
    public createRoom(roomId: string, roomName: string): Room {
        if (!this.rooms.has(roomId)) {
            const room: Room = {
                id: roomId,
                name: roomName,
                userCount: 0
            };
            this.rooms.set(roomId, room);
            this.roomUsers.set(roomId, new Map());

            // 룸 생성 이벤트 브로드캐스트
            this.broadcastRoomEvent({
                type: "room-created",
                room
            });

            console.log(`룸 생성됨: ${roomName}(${roomId})`);
            return room;
        }

        return this.rooms.get(roomId)!;
    }

    // 룸 삭제
    public deleteRoom(roomId: string): boolean {
        const room = this.rooms.get(roomId);
        if (room) {
            this.rooms.delete(roomId);
            this.roomUsers.delete(roomId);

            // 룸 삭제 이벤트 브로드캐스트
            this.broadcastRoomEvent({
                type: "room-deleted",
                room
            });

            console.log(`룸 삭제됨: ${room.name}(${roomId})`);
            return true;
        }
        return false;
    }

    // 사용자를 룸에 추가
    public addUserToRoom(roomId: string, user: User): boolean {
        if (!this.rooms.has(roomId)) {
            console.log(`룸 ${roomId}이 존재하지 않습니다.`);
            return false;
        }

        if (!this.roomUsers.has(roomId)) {
            this.roomUsers.set(roomId, new Map());
        }

        const users = this.roomUsers.get(roomId)!;
        if (!users.has(user.id)) {
            users.set(user.id, user);

            // 룸의 사용자 수 업데이트
            const room = this.rooms.get(roomId)!;
            room.userCount = users.size;

            // 룸 업데이트 이벤트 브로드캐스트
            this.broadcastRoomEvent({
                type: "room-updated",
                room
            });

            console.log(`사용자 ${user.name}(${user.id})가 룸 ${roomId}에 추가됨, 현재 사용자 수: ${room.userCount}`);
            return true;
        }

        return false;
    }

    // 사용자를 룸에서 제거
    public removeUserFromRoom(roomId: string, userId: string): boolean {
        if (!this.rooms.has(roomId) || !this.roomUsers.has(roomId)) {
            return false;
        }

        const users = this.roomUsers.get(roomId)!;
        const removed = users.delete(userId);

        if (removed) {
            // 룸의 사용자 수 업데이트
            const room = this.rooms.get(roomId)!;
            room.userCount = users.size;

            console.log(`사용자 ${userId}가 룸 ${roomId}에서 제거됨, 현재 사용자 수: ${room.userCount}`);

            // 사용자가 0명이면 룸 삭제 (general 룸은 예외)
            if (room.userCount === 0 && roomId !== 'general') {
                this.deleteRoom(roomId);
            } else {
                // 룸 업데이트 이벤트 브로드캐스트
                this.broadcastRoomEvent({
                    type: "room-updated",
                    room
                });
            }

            return true;
        }

        return false;
    }

    // 룸 이벤트 브로드캐스트
    private broadcastRoomEvent(event: RoomEvent): void {
        this.broadcast({
            type: "room-event",
            event
        });
    }

    // 모든 클라이언트에 메시지 전송
    public broadcast(data: any): void {
        if (this.controllers.size === 0) {
            console.log('활성 연결이 없습니다.');
            return;
        }

        // SSE 형식에 맞춘 메시지 포맷팅
        const message = `data: ${JSON.stringify(data)}\n\n`;
        const encoded = new TextEncoder().encode(message);

        console.log(`메시지 브로드캐스트: ${JSON.stringify(data)}`);
        console.log(`현재 연결된 클라이언트 수: ${this.controllers.size}`);

        this.controllers.forEach(controller => {
            try {
                controller.enqueue(encoded);
            } catch (error) {
                console.error('메시지 전송 중 오류 발생:', error);
                this.removeController(controller);
            }
        });
    }

    // 모든 룸 목록 반환
    public getRooms(): Room[] {
        return Array.from(this.rooms.values());
    }

    // 특정 룸 정보 반환
    public getRoom(roomId: string): Room | undefined {
        return this.rooms.get(roomId);
    }

    // 특정 룸의 사용자 목록 반환
    public getRoomUsers(roomId: string): User[] {
        const userMap = this.roomUsers.get(roomId);
        if (!userMap) return [];

        return Array.from(userMap.values());
    }

    // 현재 연결 수 반환
    public get connectionCount(): number {
        return this.controllers.size;
    }
}

// 싱글톤 인스턴스 가져오기
const roomManager = RoomConnectionManager.getInstance();

// GET 요청 처리 - SSE 연결 설정
export async function GET(request: NextRequest) {
    try {
        console.log('룸 관리 SSE 연결 요청 받음');

        // 클라이언트에 주기적으로 핑 메시지를 보내기 위한 타이머 ID
        let pingInterval: NodeJS.Timeout | null = null;
        let controller: ReadableStreamController<Uint8Array>;

        const stream = new ReadableStream({
            start(ctrl) {
                controller = ctrl;
                // 클라이언트 연결 등록
                roomManager.registerController(controller);

                // 연결 시작 메시지를 즉시 전송
                const connectMessage = `data: ${JSON.stringify({
                    type: "connect",
                    message: "연결됨",
                    connectionCount: roomManager.connectionCount,
                    rooms: roomManager.getRooms()
                })}\n\n`;
                controller.enqueue(new TextEncoder().encode(connectMessage));

                // 15초마다 핑 메시지 전송하여 연결 유지
                pingInterval = setInterval(() => {
                    try {
                        const pingMessage = `data: ${JSON.stringify({
                            type: "ping",
                            timestamp: new Date().toISOString(),
                            connectionCount: roomManager.connectionCount
                        })}\n\n`;
                        controller.enqueue(new TextEncoder().encode(pingMessage));
                    } catch (error) {
                        console.error('핑 메시지 전송 중 오류:', error);
                        roomManager.removeController(controller);
                        if (pingInterval) {
                            clearInterval(pingInterval);
                            pingInterval = null;
                        }
                        controller.close();
                    }
                }, 15000);

                // 연결이 종료될 때 컨트롤러 제거 및 리소스 정리
                request.signal.addEventListener("abort", () => {
                    console.log('룸 연결 종료됨');
                    roomManager.removeController(controller);
                    if (pingInterval) {
                        clearInterval(pingInterval);
                        pingInterval = null;
                    }
                    controller.close();
                });
            },
            cancel() {
                console.log('룸 스트림 취소됨');
                if (controller) {
                    roomManager.removeController(controller);
                }
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

// POST 요청 처리 - 룸 관리 API
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { action, roomId, roomName, userId } = data;

        console.log(`룸 관리 API 호출: ${action}`, data);

        let result;

        switch (action) {
            case 'createRoom':
                if (!roomId || !roomName) {
                    return NextResponse.json(
                        { error: "roomId와 roomName이 필요합니다" },
                        { status: 400 }
                    );
                }
                result = roomManager.createRoom(roomId, roomName);
                return NextResponse.json({ success: true, room: result });

            case 'deleteRoom':
                if (!roomId) {
                    return NextResponse.json(
                        { error: "roomId가 필요합니다" },
                        { status: 400 }
                    );
                }
                result = roomManager.deleteRoom(roomId);
                return NextResponse.json({ success: result });

            case 'joinRoom':
                if (!roomId || !userId) {
                    return NextResponse.json(
                        { error: "roomId와 userId가 필요합니다" },
                        { status: 400 }
                    );
                }

                // URL에서 사용자 정보 추출
                const userName = data.userName || '익명 사용자';

                // 사용자 객체 생성
                const user: User = {
                    id: userId,
                    name: userName,
                    joinTime: new Date().toISOString()
                };

                result = roomManager.addUserToRoom(roomId, user);
                return NextResponse.json({
                    success: result,
                    room: roomManager.getRoom(roomId),
                    users: roomManager.getRoomUsers(roomId)
                });

            case 'leaveRoom':
                if (!roomId || !userId) {
                    return NextResponse.json(
                        { error: "roomId와 userId가 필요합니다" },
                        { status: 400 }
                    );
                }
                result = roomManager.removeUserFromRoom(roomId, userId);
                return NextResponse.json({ success: result });

            case 'getRooms':
                return NextResponse.json({
                    success: true,
                    rooms: roomManager.getRooms()
                });

            case 'getRoomUsers':
                if (!roomId) {
                    return NextResponse.json(
                        { error: "roomId가 필요합니다" },
                        { status: 400 }
                    );
                }
                return NextResponse.json({
                    success: true,
                    users: roomManager.getRoomUsers(roomId)
                });

            default:
                return NextResponse.json(
                    { error: "알 수 없는 액션입니다" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('룸 관리 API 처리 중 오류 발생:', error);
        return NextResponse.json(
            { error: "요청 처리 중 오류가 발생했습니다" },
            { status: 500 }
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