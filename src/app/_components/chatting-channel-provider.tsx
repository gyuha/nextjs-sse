import { Channel } from '@/types';
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ChattingChannelContextState {
  currentChannelId: string;
  channels: Channel[]
}

interface ChattingChannelContextAction extends ChattingChannelContextState {
  setCurrentChannelId: React.Dispatch<React.SetStateAction<string>>;
}

const ChattingChannelContext = createContext<ChattingChannelContextAction | undefined>(undefined);

interface ChattingChannelProviderProps {
  children: React.ReactNode;
}

export const ChattingChannelProvider: React.FC<ChattingChannelProviderProps> = ({ children }: ChattingChannelProviderProps) => {
  const [currentChannelId, setCurrentChannelId] = useState<string>('');
  const [channels, setChannels] = useState<Channel[]>([]);

  useEffect(() => {
    const fetchChannels = async () => {
      try {
        // Replace this with your actual API call
        const response = await fetch('/api/sse/channels');
        if (response.ok) {
          const channelsData = await response.json();
          setChannels(channelsData);
          
          // Set the first channel as current if available and no channel is currently selected
          if (channelsData.length > 0 && !currentChannelId) {
            setCurrentChannelId(channelsData[0].id);
          }
        } else {
          console.error('Failed to fetch channels');
        }
      } catch (error) {
        console.error('Error fetching channels:', error);
      }
    };

    fetchChannels();
  }, [currentChannelId]);

  return <ChattingChannelContext.Provider value={{ currentChannelId, channels, setCurrentChannelId }}>{children}</ChattingChannelContext.Provider>;
};

export const useChattingChannelContext = () => {
  const context = useContext(ChattingChannelContext);
  if (!context) {
    throw new Error('useChattingChannelContext must be used within a ChattingChannelProvider');
  }
  return context;
};
