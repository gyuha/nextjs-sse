"use client";
import type React from "react";

/**
 * 범용적인 Context HOC를 생성하는 함수
 * @param useContextHook - Context 훅 (예: useChannelContext, useUserContext 등)
 * @returns Context 값을 컴포넌트에 주입하는 HOC
 */
export function createWithContext<ContextValue extends object>(
  useContextHook: () => ContextValue
) {
  return function withContext<P extends object>(
    Component: React.ComponentType<P & ContextValue>
  ) {
    // 컴포넌트 이름 설정 (디버깅에 유용)
    const displayName = Component.displayName || Component.name || "Component";
    
    function WithContextComponent(props: P) {
      // Context 값을 가져옵니다
      const contextValue = useContextHook();
      
      // 원본 props와 컨텍스트를 합쳐서 컴포넌트에 전달합니다
      return <Component {...props} {...contextValue} />;
    }
    
    // 디버깅을 위한 displayName 설정
    WithContextComponent.displayName = `WithContext(${displayName})`;
    
    return WithContextComponent;
  };
}