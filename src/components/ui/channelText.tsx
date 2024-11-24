import React from "react";

import { Channel, Message } from "@/types/ather";

import { Hash } from 'lucide-react';
import AtherSocketClient from "../utils/ather";

interface ChannelProps {
    channel: Channel;
    atherRef: React.MutableRefObject<AtherSocketClient | null>;
    setSelectedChannel: (channel: Channel) => void;
    setMessages: (messages: Message[]) => void;
    onClick: () => void;
}

const ChannelText: React.FC<ChannelProps> = ({
    channel,
    atherRef,
    setSelectedChannel,
    setMessages,
}) => {
    const handleClick = () => {
        setMessages([])

        const ather = atherRef.current;

        if (!ather) {
            console.error("AtherSocketClient is not initialized.");
            return;
        }
        setSelectedChannel(channel);
        ather.archive.messages.getByChannel(
            channel.latest_message_id || "1999999999999999999",
            channel.id,
            150
        ).then((data)=>{
            console.log('fetched '+ data.length+' messages', data)
            setMessages(data)
        }).catch((data: unknown) =>{
            console.error(data)
        })
    }

    return <div
        key={channel.id}
        className="flex items-center space-x-2 mb-2 cursor-pointer hover:bg-gray-700 p-1 rounded"
        onClick={handleClick}
    >
        <Hash className="w-5 h-5" />
        <span>{channel.name}</span>
    </div>
}

export default ChannelText;