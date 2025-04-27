import { useEffect, useState } from 'react';

const useWindowSize = (): boolean => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  
  useEffect(() => {
    const handleResize = () => {
      window.innerWidth < 1024 ? setIsMobile(true) : setIsMobile(false);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return isMobile;
};

export default useWindowSize;

