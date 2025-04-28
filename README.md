# Next.js SSE 채팅 애플리케이션

Next.js와 Server-Sent Events(SSE)를 활용한 실시간 채팅 애플리케이션입니다. 이 프로젝트는 WebSocket 대신 SSE를 사용하여 서버에서 클라이언트로의 단방향 실시간 통신을 구현했습니다.

## 주요 기능

- 실시간 채팅: SSE를 활용한 메시지 송수신
- 채널 기반 채팅: 여러 채팅방(채널) 지원
- 사용자 상태 추적: 접속자 수 및 사용자 상태 표시
- 반응형 UI: 모바일 및 데스크톱 환경 지원
- 모달 시스템: 채널 생성 등을 위한 모달 컴포넌트

## 기술 스택

- **프레임워크**: Next.js 15.3.1
- **언어**: TypeScript
- **상태 관리**: Zustand
- **스타일링**: Tailwind CSS, Shadcn UI
- **서버 통신**: Server-Sent Events (SSE)
- **클라이언트**: React 19.0.0
- **기타 라이브러리**:
  - Framer Motion (애니메이션)
  - React Hook Form (폼 처리)
  - Zod (유효성 검증)
  - date-fns (날짜 처리)
  - DOMPurify (XSS 방지)

## 프로젝트 구조

```
src/
├── app/                   # Next.js 앱 라우터
│   ├── api/               # API 라우트
│   │   └── sse/           # SSE 관련 API 엔드포인트
│   ├── channel/           # 채널 페이지 및 컴포넌트
│   └── (room)/            # 룸 페이지
├── components/            # 공통 컴포넌트
│   ├── chatting/          # 채팅 관련 컴포넌트
│   └── ui/                # UI 컴포넌트 (shadcn/ui 기반)
├── hooks/                 # 커스텀 훅
├── lib/                   # 유틸리티 함수
├── providers/             # 전역 프로바이더
└── stores/                # Zustand 상태 저장소
```

## 핵심 아키텍처

### SSE(Server-Sent Events) 구현

이 프로젝트는 단방향 서버 푸시 기술인 SSE를 활용하여 실시간 채팅을 구현했습니다. 주요 구성 요소:

1. **서버 측**:
   - `ChannelConnectionManager`: 채널 연결 관리 싱글톤 클래스
   - `SSEMessageManager`: 채널별 SSE 연결 및 메시지 관리 클래스

2. **클라이언트 측**:
   - `ChattingProvider`: 채팅 상태 및 SSE 연결 관리 Context
   - `EventSource` API를 사용한 SSE 연결 구현

### 채널 시스템

- 여러 채팅방(채널)을 지원하며, 사용자는 원하는 채널에 참여할 수 있습니다.
- 각 채널은 고유 ID를 가지며, 채널별로 독립적인 메시지 스트림과 사용자 목록을 관리합니다.
- 기본 채널("general")이 제공되며, 사용자는 새 채널을 생성할 수 있습니다.

### 상태 관리

- 채팅 상태: React Context API를 활용한 `ChattingProvider`
- 모달 상태: Zustand를 활용한 간단한 상태 관리

## 설치 및 실행

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행 (Turbopack 사용)
pnpm dev

# 빌드
pnpm build

# 프로덕션 서버 실행
pnpm start
```

## 환경 설정

Node.js 22.15.0 이상을 권장합니다 (Volta 설정 참조).

## 특이사항

- 이 프로젝트는 백엔드 서버 없이 Next.js의 API 라우트를 활용하여 SSE 서버를 구현했습니다.
- React 19와 Next.js 15의 최신 기능을 활용합니다.
- Turbopack을 활용한 빠른 개발 환경을 제공합니다.
