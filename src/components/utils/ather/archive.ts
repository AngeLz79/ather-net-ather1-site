import {
    Message,
    Channel,
    Guild,
    User,
    DetailsResponse,
    DetailsTrendsResponse,
    AtherSocketResponse,
    AtherWebSocket,
    UserSearchResults,
    GuildSearchResults,
} from "@/types/ather";

type HttpRequestFunction = (query: string, type: "GET" | "POST") => Promise<{ data: unknown }>;

export const createArchive = (
    httpRequest: HttpRequestFunction,
    websocket: AtherWebSocket,
) => {
    const user_appendCache = new Map<string, User & { _timestamp: number }>();

    const props = {
        messages: {
            append: async (data: Message): Promise<AtherSocketResponse> => {
                return websocket.send({
                    type: "atherArchive",
                    archiveType: "messages",
                    action: "append",
                    data,
                });
            },
            get: async (id: string): Promise<Message> => {
                const response = await websocket.send({
                    type: "atherArchive",
                    archiveType: "messages",
                    action: "get",
                    id,
                });
                if (response.status === "success" && response.data) {
                    return response.data as Message;
                }
                throw new Error("Failed to fetch message.");
            },
            delete: async (id: string): Promise<AtherSocketResponse> => {
                return websocket.send({
                    type: "atherArchive",
                    archiveType: "messages",
                    action: "modify",
                    data: { deleted: true, id },
                });
            },
            getByUser: async (id: string, limit = 100, offset = 0): Promise<Message[]> => {
                const url = `atherArchive/get/messageByUser?userId=${id}&limit=${limit}&offset=${offset}`;
                const response = await httpRequest(url, "GET");
                return response.data as Message[];
            },
            getByChannel: async (id: string, channelId: string, limit: number): Promise<Message[]> => {
                const response = await websocket.send({
                    type: "atherArchive",
                    channelId,
                    lastMessageId: id,
                    archiveType: "messagesByChannel",
                    action: "get",
                    limit,
                });
                return Array.isArray(response.data) ? response.data : [];
            },
        },
        channels: {
            append: async (data: Channel): Promise<AtherSocketResponse> => {
                return websocket.send({
                    type: "atherArchive",
                    archiveType: "channels",
                    action: "append",
                    data,
                });
            },
            get: async (id: string): Promise<Channel> => {
                const response = await websocket.send({
                    type: "atherArchive",
                    archiveType: "channels",
                    action: "get",
                    id,
                });
                if (response.status === "success" && response.data) {
                    return response.data as Channel;
                }
                throw new Error("Failed to fetch channel.");
            },
        },
        guilds: {
            append: async (data: Guild): Promise<AtherSocketResponse> => {
                return websocket.send({
                    type: "atherArchive",
                    archiveType: "guilds",
                    action: "append",
                    data,
                });
            },
            get: async (id: string): Promise<Guild> => {
                const response = await websocket.send({
                    type: "atherArchive",
                    archiveType: "guilds",
                    action: "get",
                    data: id,
                });
                return response.data as Guild;
            },
            getAll: async (): Promise<Guild[]> => {
                const response: AtherSocketResponse = await websocket.send({
                    type: "atherArchive",
                    archiveType: "guilds",
                    action: "getAll",
                });

                return Array.isArray(response.data) ? response.data as Guild[] : [];
            },
            getChannels: async (id: string): Promise<Channel[]> => {
                const response = await websocket.send({
                    type: "atherArchive",
                    archiveType: "guilds",
                    action: "getChannels",
                    data: id,
                });
                return Array.isArray(response.data) ? response.data : [];
            },
        },
        users: {
            append: async (data: User): Promise<AtherSocketResponse> => {
                const cache = user_appendCache.get(data.id);
                if (cache && Date.now() - cache._timestamp < 30000) {
                    return {
                        status: "success",
                        type: "append",
                        id: "cached"
                    };
                }
                user_appendCache.set(data.id, { ...data, _timestamp: Date.now() });
                return websocket.send({
                    type: "atherArchive",
                    archiveType: "users",
                    action: "append",
                    data,
                });
            },
            get: async (id: string, nocache = false): Promise<User> => {
                const url = `atherArchive/get/user?id=${id}&nocache=${nocache}`;
                const response = await httpRequest(url, "GET");
                return response.data as User;
            },
        },
        presences: {
            append: async (data: { [key: string]: unknown }): Promise<AtherSocketResponse> => {
                return websocket.send({
                    type: "atherArchive",
                    archiveType: "presences",
                    action: "append",
                    data,
                });
            },
            get: async (id: string): Promise<{ [key: string]: unknown }> => {
                return websocket.send({
                    type: "atherArchive",
                    archiveType: "presences",
                    action: "get",
                    id,
                });
            },
        },
        search: {
            users: async (query: string, limit = 25): Promise<UserSearchResults> => {
                const url = `atherArchive/search/user?query=${encodeURIComponent(query)}&limit=${limit}`;
                const response = await httpRequest(url, "GET");
                return response.data as UserSearchResults;  // Type assertion
            },
            
            guilds: async (query: string, limit = 25): Promise<GuildSearchResults> => {
                const url = `atherArchive/search/guild?query=${encodeURIComponent(query)}&limit=${limit}`;
                const response = await httpRequest(url, "GET");
                return response.data as GuildSearchResults;  // Type assertion
            },            
        },
        details: async (): Promise<DetailsResponse> => {
            const url = `atherArchive/details`;
            const response = await httpRequest(url, "GET");
            return response.data as DetailsResponse;
        },
        detailsTrends: async (limit: number): Promise<DetailsTrendsResponse> => {
            const url = `atherArchive/detailsTrends?limit=${limit}`;
            const response = await httpRequest(url, "GET");
            return response.data as DetailsTrendsResponse;
        },
        detailsOvertime: async (limit: number): Promise<DetailsTrendsResponse> => {
            const url = `atherArchive/detailsOvertime?limit=${limit}`;
            const response = await httpRequest(url, "GET");
            return response.data as DetailsTrendsResponse;
        },
    };

    return props;
};
