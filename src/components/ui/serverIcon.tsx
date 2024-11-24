import React from "react";

import { Channel, Guild } from "@/types/ather";
import AtherSocketClient from "@/components/utils/ather";

const getInitials = (name: string): string => {
    const nameParts = name.split(' ');
    const initials = nameParts
      .map(part => part.charAt(0).toUpperCase()) // Get first letter of each word
      .join(''); // Join them together
    return initials;
};

interface ServerIconProps {
    server: Guild;
    atherRef: React.MutableRefObject<AtherSocketClient | null>;
    setSelectedGuild: (guild: Guild) => void;
    setChannels: (channels: Channel[]) => void;
    onClick: () => void;
}

const ServerIcon: React.FC<ServerIconProps> = ({
    server,
    atherRef,
    setSelectedGuild,
    setChannels,
}) => {
    const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
        e.currentTarget.style.display = "none"; // Hide broken image
        const initialsElement = e.currentTarget.nextElementSibling;
        if (initialsElement) {
            initialsElement.setAttribute("style", "display: block;");
        }
    };

    const handleClick = () => {
        const ather = atherRef.current;

        if (!ather) {
            console.error("AtherSocketClient is not initialized.");
            return;
        }

        setSelectedGuild(server);

        // Fetch channels for the selected guild
        ather.archive.guilds
            .getChannels(server.id)
            .then((data) => {
                console.log(data);
                setChannels(data);
            })
            .catch((err: Error) => {
                console.error("Error fetching channels:", err);
            });
    };

    return (
        <div
            key={server.id}
            className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl cursor-pointer hover:rounded-2xl transition-all duration-200"
        >
            <div
                key={server.id}
                className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl cursor-pointer hover:rounded-2xl transition-all duration-200"
            >
                {server.icon ? (
                    <img
                        src={`https://zero.ather1.net/https://cdn.discordapp.com/icons/${server.id}/${server.icon}`}
                        alt={server.name}
                        className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-xl cursor-pointer hover:rounded-2xl transition-all duration-200"
                        onError={handleImageError}
                        onClick={handleClick}
                    />
                ) : (
                    <span>{getInitials(server.name)}</span>
                )}
                <span style={{ display: "none" }}>{getInitials(server.name)}</span>
            </div>
        </div>
    );
};

export default ServerIcon;