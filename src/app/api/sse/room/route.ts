import type { Channel, ChannelEvent, User } from "@/types";
import type { NextRequest, NextResponse } from "next/server";

// Channel 연결을 관리하는 싱글톤 클래스
class ChannelConnectionManager {
    // 채널 이름과 채널 사용자 수만 관리 하자.. 사용자 목록은 해당 채널 에서 관리
    private static instance: ChannelConnectionManager;
    private controllers: Map<string, Set<ReadableStreamDefaultController<unknown>>>;
    private channels: Map<string, Channel>;

    private constructor() {
        this.controllers = new Map();
        this.channels = new Map();

        // 기본 채널 생성
        this.createChannel('general', '기본 채팅방');
    }

    public static getInstance(): ChannelConnectionManager {
        if (!ChannelConnectionManager.instance) {
            ChannelConnectionManager.instance = new ChannelConnectionManager();
        }
        return ChannelConnectionManager.instance;
    }

    // 새 컨트롤러 등록 
    public registerController(controller: ReadableStreamController<Uint8Array>): void {
        const clientId = crypto.randomUUID(); // 클라이언트 ID 생성
        if (!this.controllers.has(clientId)) {
            this.controllers.set(clientId, new Set());
        }
        this.controllers.get(clientId)!.add(controller);
        console.log(`새 채널 연결 등록됨. 현재 연결 수: ${this.controllers.size}`);
    }

    // 컨트롤러 제거
    public removeController(controller: ReadableStreamController<Uint8Array>): void {
        for (const [clientId, controllers] of this.controllers) {
            if (controllers.has(controller)) {
                controllers.delete(controller);
                if (controllers.size === 0) {
                    this.controllers.delete(clientId);
                }
                break;
            }
        }
        console.log(`채널 연결 종료됨. 현재 연결 수: ${this.controllers.size}`);
    }

    // 채널 생성
    public createChannel(channelId: string, channelName: string): Channel {
        if (!this.channels.has(channelId)) {
            const channel: Channel = {
                id: channelId,
                name: channelName,
                userCount: 0
            };
            this.channels.set(channelId, channel);

            // 채널 생성 이벤트 브로드캐스트
            this.broadcastChannelEvent({
                type: "channel-created",
                channel
            });

            console.log(`채널 생성됨: ${channelName}(${channelId})`);
            return channel;
        }

        return this.channels.get(channelId)!;
    }

    // 채널 삭제
    public deleteChannel(channelId: string): boolean {
        const channel = this.channels.get(channelId);
        if (channel) {
            this.channels.delete(channelId);

            // 채널 삭제 이벤트 브로드캐스트
            this.broadcastChannelEvent({
                type: "channel-deleted",
                channel
            });

            console.log(`채널 삭제됨: ${channel.name}(${channelId})`);
            return true;
        }
        return false;
    }

    // 사용자를 채널에 추가
    public addUserToChannel(channelId: string, user: User): boolean {
        if (!this.channels.has(channelId)) {
            console.log(`채널 ${channelId}이 존재하지 않습니다.`);
            return false;
        }


        // const users = this.channelUsers.get(channelId)!;
        const users = this.channelUsers.get(channelId) ?? new Map<string, User>();
        if (!users.has(user.id)) {
            users.set(user.id, user);

            // 채널의 사용자 수 업데이트
            const channel = this.channels.get(channelId)!;
            channel.userCount = users.size;

            // 채널 업데이트 이벤트 브로드캐스트
            this.broadcastChannelEvent({
                type: "channel-updated",
                channel
            });

            console.log(`사용자 ${user.name}(${user.id})가 채널 ${channelId}에 추가됨, 현재 사용자 수: ${channel.userCount}`);
            return true;
        }

        return false;
    }

    // 사용자를 채널에서 제거
    public removeUserFromChannel(channelId: string, userId: string): boolean {
        if (!this.channels.has(channelId) || !this.channelUsers.has(channelId)) {
            return false;
        }

        const users = this.channelUsers.get(channelId) as Map<string, User>;
        const removed = users.delete(userId);

        if (removed) {
            // 채널의 사용자 수 업데이트
            const channel = this.channels.get(channelId);
            if (!channel) return false;
            
            channel.userCount = users.size;

            console.log(`사용자 ${userId}가 채널 ${channelId}에서 제거됨, 현재 사용자 수: ${channel.userCount}`);

            // 사용자가 0명이면 채널 삭제 (general 채널은 예외)
            if (channel.userCount === 0 && channelId !== 'general') {
                this.deleteChannel(channelId);
            } else {
                // 채널 업데이트 이벤트 브로드캐스트
                this.broadcastChannelEvent({
                    type: "channel-updated",
                    channel
                });
            }

            return true;
        }

        return false;
    }

    // 채널 이벤트 브로드캐스트
    private broadcastChannelEvent(event: ChannelEvent): void {
        this.broadcast({
            type: "channel-event",
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

        for (const [clientId, controllers] of this.controllers) {
            for (const controller of controllers) {
                try {
                    controller.enqueue(encoded);
                } catch (error) {
                    console.error('메시지 전송 중 오류 발생:', error);
                    this.removeController(controller);
                }
            }
        }
    }

    // 모든 채널 목록 반환
    public getChannels(): Channel[] {
        return Array.from(this.channels.values());
    }

    // 특정 채널 정보 반환
    public getChannel(channelId: string): Channel | undefined {
        return this.channels.get(channelId);
    }

    // 특정 채널의 사용자 목록 반환
    public getChannelUsers(channelId: string): User[] {
        const userMap = this.channelUsers.get(channelId);
        if (!userMap) return [];

        return Array.from(userMap.values());
    }

    // 현재 연결 수 반환
    public get connectionCount(): number {
        let count = 0;
        for (const [_, controllers] of this.controllers) {
            count += controllers.size;
        }
        return count;
    }
}

// 싱글톤 인스턴스 가져오기
const channelManager = ChannelConnectionManager.getInstance();

// GET 요청 처리 - SSE 연결 설정
export async function GET(request: NextRequest) {
    try {
        console.log('채널 관리 SSE 연결 요청 받음');

        // 클라이언트에 주기적으로 핑 메시지를 보내기 위한 타이머 ID
        let pingInterval: NodeJS.Timeout | null = null;
        let controller: ReadableStreamController<Uint8Array>;

        const stream = new ReadableStream({
            start(ctrl) {
                controller = ctrl;
                // 클라이언트 연결 등록
                channelManager.registerController(controller);

                // 연결 시작 메시지를 즉시 전송
                const connectMessage = `data: ${JSON.stringify({
                    type: "connect",
                    message: "연결됨",
                    connectionCount: channelManager.connectionCount,
                    channels: channelManager.getChannels()
                })}\n\n`;
                controller.enqueue(new TextEncoder().encode(connectMessage));

                // 15초마다 핑 메시지 전송하여 연결 유지
                pingInterval = setInterval(() => {
                    try {
                        const pingMessage = `data: ${JSON.stringify({
                            type: "ping",
                            timestamp: new Date().toISOString(),
                            connectionCount: channelManager.connectionCount
                        })}\n\n`;
                        controller.enqueue(new TextEncoder().encode(pingMessage));
                    } catch (error) {
                        console.error('핑 메시지 전송 중 오류:', error);
                        channelManager.removeController(controller);
                        if (pingInterval) {
                            clearInterval(pingInterval);
                            pingInterval = null;
                        }
                        controller.close();
                    }
                }, 15000);

                // 연결이 종료될 때 컨트롤러 제거 및 리소스 정리
                request.signal.addEventListener("abort", () => {
                    console.log('채널 연결 종료됨');
                    channelManager.removeController(controller);
                    if (pingInterval) {
                        clearInterval(pingInterval);
                        pingInterval = null;
                    }
                    controller.close();
                });
            },
            cancel() {
                console.log('채널 스트림 취소됨');
                if (controller) {
                    channelManager.removeController(controller);
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

// POST 요청 처리 - 채널 관리 API
export async function POST(request: NextRequest) {
    try {
        const data = await request.json();
        const { action, channelId, channelName, userId } = data;

        console.log(`채널 관리 API 호출: ${action}`, data);

        let result: Channel | boolean;

        switch (action) {
            case 'createChannel':
                if (!channelId || !channelName) {
                    return NextResponse.json(
                        { error: "channelId와 channelName이 필요합니다" },
                        { status: 400 }
                    );
                }
                result = channelManager.createChannel(channelId, channelName);
                return NextResponse.json({ success: true, channel: result });

            case 'deleteChannel':
                if (!channelId) {
                    return NextResponse.json(
                        { error: "channelId가 필요합니다" },
                        { status: 400 }
                    );
                }
                result = channelManager.deleteChannel(channelId);
                return NextResponse.json({ success: result });

            case 'joinChannel': {
                if (!channelId || !userId) {
                    return NextResponse.json(
                        { error: "channelId와 userId가 필요합니다" },
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

                result = channelManager.addUserToChannel(channelId, user);
                return NextResponse.json({
                    success: result,
                    channel: channelManager.getChannel(channelId),
                    users: channelManager.getChannelUsers(channelId)
                });
            }

            case 'leaveChannel':
                if (!channelId || !userId) {
                    return NextResponse.json(
                        { error: "channelId와 userId가 필요합니다" },
                        { status: 400 }
                    );
                }
                result = channelManager.removeUserFromChannel(channelId, userId);
                return NextResponse.json({ success: result });

            case 'getChannels':
                return NextResponse.json({
                    success: true,
                    channels: channelManager.getChannels()
                });

            case 'getChannelUsers':
                if (!channelId) {
                    return NextResponse.json(
                        { error: "channelId가 필요합니다" },
                        { status: 400 }
                    );
                }
                return NextResponse.json({
                    success: true,
                    users: channelManager.getChannelUsers(channelId)
                });

            default:
                return NextResponse.json(
                    { error: "알 수 없는 액션입니다" },
                    { status: 400 }
                );
        }
    } catch (error) {
        console.error('채널 관리 API 처리 중 오류 발생:', error);
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