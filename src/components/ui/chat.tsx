import React, { useEffect, useRef, useState } from "react";
import { Hash } from 'lucide-react';
import AtherSocketClient from "@/components/utils/ather";
import { Channel, Guild, Message } from "@/types/ather";
import FormatTime from "./chat/formatTime";
import EmbedHandler from "./chat/embedHandler";
import AttachmentHandler from "./chat/attachmentHandler";
import TextHandler from "./chat/textHander";

interface ChatProps {
    atherRef: React.MutableRefObject<AtherSocketClient | null>;
    setSelectedChannel: (channel: Channel) => void;
    setMessages: (message: Message[]) => void;
    messages: Message[];
    selectedChannel: Channel | undefined;
    messageID: string | null;  // Added messageID prop
}

const Chat: React.FC<ChatProps> = ({
    atherRef,
    setSelectedChannel,
    setMessages,
    messages,
    selectedChannel,
    messageID,
}) => {
    const [servers, setServers] = useState<Guild[]>([]);
    const [channels, setChannels] = useState<Channel[]>([]);
    const [loading, setLoading] = useState(false);
    const [endOfMessages, setEndOfMessages] = useState(false);

    const messageContainerRef = useRef<HTMLDivElement | null>(null);
    const isScrolledToBottomRef = useRef(true); // Track if the user is at the bottom
    const messageRefs = useRef<{ [key: string]: HTMLDivElement | null }>({}); // Track message elements

    const ather = atherRef.current;
    let loadedLastMessageId = "1999999999999999999";

    useEffect(() => {
        const container = messageContainerRef.current;
        if (!container) return;

        const handleScroll = () => {
            const { scrollTop, scrollHeight, clientHeight } = container;
            isScrolledToBottomRef.current = scrollHeight - (scrollTop + clientHeight) < 10;
        };

        container.addEventListener("scroll", handleScroll);
        return () => container.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const container = messageContainerRef.current;

        if (!container) return;

        if (isScrolledToBottomRef.current) {
            // Automatically scroll to the bottom if the user was at the bottom
            container.scrollTop = container.scrollHeight;
        }
    }, [messages]);

    useEffect(() => {
        // Scroll to the specific message if a messageID is provided
        const targetMessage = messageRefs.current[messageID || selectedChannel?.latest_message_id || 0];
        if (targetMessage) {
            targetMessage.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [messageID]);

    const handleLoadMoreMessages = () => {
        if (!ather || !selectedChannel || loading || endOfMessages) return;

        const container = messageContainerRef.current;
        if (!container) return;

        const previousScrollHeight = container.scrollHeight; // Get current scroll height before loading new messages

        setLoading(true);
        ather.archive.messages
            .getByChannel(loadedLastMessageId, selectedChannel.id, 150)
            .then((data) => {
                if (data.length < 150) {
                    setEndOfMessages(true);
                }

                const newMessages = data.filter(
                    (message) => !messages.some((msg) => msg.id === message.id) // Avoid duplicates
                );

                setMessages([...newMessages, ...messages]);

                // Adjust scroll position to preserve user's current view
                container.scrollTop = container.scrollTop + (container.scrollHeight - previousScrollHeight);
            })
            .catch(() => {
                setEndOfMessages(true);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const renderMessages = () => {
        if (messages.length === 0) return <div></div>;

        const sortedMessages = messages.sort((a, b) => a.id.localeCompare(b.id));
        loadedLastMessageId = sortedMessages[0]?.id || loadedLastMessageId;

        return sortedMessages.map((message) => (
            <div
                key={message.id}
                className="chatlog__message"
                ref={(el) => {
                    if (el) {
                        messageRefs.current[message.id] = el;
                    }
                }}
            >
                <div className="chatlog__message-aside">
                    <img
                        className="chatlog__avatar"
                        src={`https://zero.ather1.net/https://cdn.discordapp.com/avatars/${message.author.id}/${message.author.avatar}`}
                    />
                </div>
                <div>
                    <div className="flex items-baseline space-x-2">
                        <span className="font-bold">{message.author.globalName || message.author.username}</span>
                        <FormatTime timestamp={message.timestamp} />
                    </div>
                    {message.deleted ? (
                        <span style={{ color: "red" }}>
                            <TextHandler text={message.content} />
                        </span>
                    ) : (
                        <TextHandler text={message.content} />
                    )}
                    <EmbedHandler embeds={message.embeds} />
                    <AttachmentHandler attachments={message.attachments} />
                </div>
            </div>
        ));
    };

    return (
        <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <div className="h-12 border-b border-gray-700 flex items-center px-4">
                <Hash className="w-5 h-5 mr-2" />
                <span className="font-bold">{selectedChannel?.name || "Select a Channel"}</span>
            </div>

            {/* Messages */}
            <div
                ref={messageContainerRef}
                onScroll={() => {
                    if (messageContainerRef.current && messageContainerRef.current?.scrollTop <= 8000) {
                        handleLoadMoreMessages();
                    }
                }}
                className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col"
            >
                {!endOfMessages && (
                    <div style={{ height: "50px" }} /> // Placeholder at the top
                )}
                {endOfMessages && (
                    <div>
                        <div className="text-white-500 text-lg mb-2">
                            Welcome to #{selectedChannel?.name || "this channel"}!
                        </div>
                        <div className="text-gray-400 text-sm mb-4">
                            This is the start of the #{selectedChannel?.name || "this channel"} channel.
                        </div>
                    </div>
                )}
                {renderMessages()}
            </div>
        </div>
    );
};

export default Chat;
