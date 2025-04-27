'use client'
import { useState, useEffect } from 'react'

const useMobileDetection = (maxWidth = 768) => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= maxWidth)

  useEffect(() => {
    const checkMobileSize = () => {
      setIsMobile(window.innerWidth <= maxWidth)
    }

    // 초기 설정
    checkMobileSize()

    // 윈도우 크기 변경 시 이벤트 리스너 추가
    window.addEventListener('resize', checkMobileSize)

    // 컴포넌트 언마운트 시 이벤트 리스너 제거
    return () => {
      window.removeEventListener('resize', checkMobileSize)
    }
  }, [maxWidth])

  return isMobile
}

export default useMobileDetection
