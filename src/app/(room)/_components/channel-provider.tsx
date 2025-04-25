import type { Channel } from "@/types";
import type React from "react";
import { createContext, use, useContext, useEffect, useState } from "react";

interface ChannelContextState {
  currentChannelId: string;
  channels: Channel[];
}

interface ChannelContextAction extends ChannelContextState {
  setCurrentChannelId: React.Dispatch<React.SetStateAction<string>>;
  changeChannelId: (id: string) => void;
}

const ChannelContext = createContext<ChannelContextAction | undefined>(
  undefined
);

interface ChannelProviderProps {
  children: React.ReactNode;
}

export const ChannelProvider: React.FC<ChannelProviderProps> = ({
  children,
}: ChannelProviderProps) => {
  const [currentChannelId, setCurrentChannelId] = useState<string>("");
  const [channels, setChannels] = useState<Channel[]>([]);

  const changeChannelId = (id: string) => {
    setCurrentChannelId(id);
  };

  useEffect(() => {
    // Fetch channels from the server or any other source
    const fetchChannels = async () => {
      // Simulate fetching channels
      const fetchedChannels: Channel[] = [
        { id: "general", name: "General" },
        { id: "random", name: "Random" },
        { id: "support", name: "Support" },
        { id: "team", name: "Team" },
      ];
      setChannels(fetchedChannels);
    };

    fetchChannels();
  }, []);

  return (
    <ChannelContext.Provider
      value={{
        currentChannelId,
        channels,
        setCurrentChannelId,
        changeChannelId(id) {},
      }}
    >
      {children}
    </ChannelContext.Provider>
  );
};

export const useChannelContext = () => {
  const context = useContext(ChannelContext);
  if (!context) {
    throw new Error("useChannelContext must be used within a ChannelProvider");
  }
  return context;
};
