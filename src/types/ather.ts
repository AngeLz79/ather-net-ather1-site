import { AxiosRequestConfig } from "axios";
import { EventEmitter } from "events";
import { ClientRequestArgs } from "http";
import * as WebSocket from "ws";

type ws_config = {
    url?: string;
};

type http_config = {
    url?: string;
}

type AtherSocketOptions = WebSocket.ClientOptions & ClientRequestArgs & ws_config;
type AtherHttpOptions = AxiosRequestConfig & http_config;

type AtherOptions = {
    ws_config: AtherSocketOptions | null;
    http_config: AtherHttpOptions | null;
}

type Service = {
    serviceId: string;
    serviceName: string;
    type: "mcServer" | "discordBot" | string;
};

type User = {
    id: string;
    username: string;
    discriminator: string;
    avatar: string;
    bot: boolean;
    system: boolean;
    mfa_enabled: boolean;
    locale: string;
    verified: boolean;
    email: string;
    flags: number;
    premium_type: number;
    public_flags: number;
    globalName: string;
    services?: Service[];
    permissions?: {
        admin?: boolean;
        archiveAccess?: boolean;
    };
}

type SearchResultBase = {
    type: "atherArchive"
    action: "search";
    status: "success" | "error";
    resultCount: number;
    offset: number;
}

export type UserSearchResults = SearchResultBase & {
    data: {
        type: "user";
        data: User;
    }[]
};

export type GuildSearchResults = SearchResultBase & {
    data: {
        type: "guild";
        data: Guild;
    }[]
};

type Embed = {
    thumbnail?: {
        url: string
    };
    video?: {
        url: string;
    };
    url?: string;
    title?: string;
    description?: string;
    color?: number;
}

interface Attachment {
    attachment?: string;
    name?: string;
    id?: string;
    size?: number;
    url?: string;
    proxyURL?: string;
    height?: number | null;
    width?: number | null;
    contentType?: string | null;
    description?: string | null;
    ephemeral?: boolean;
    duration?: number | null;
    waveform?: number[] | null;
    flags?: number;
}

type Message = {
    id: string;
    type: number;
    channel_id: string;
    author: User;
    content: string;
    attachments: Attachment[];
    embeds: Embed[];
    pinned: boolean;
    mentionEveryone: boolean;
    tts: boolean;
    flags: number;
    timestamp: number;
    deleted: boolean | null;
}

type Channel = {
    id: string;
    name: string;
    type: string;
    guild_id: string;
    is_voice: boolean;
    is_thread: boolean;
    latest_message_id: string;
}

type Guild = {
    id: string;
    icon: string | null;
    name: string;
    description: string | null;
    channels: Channel[];
}

export interface AtherWebSocket {
    send: (data: AtherSocketRequest) => Promise<AtherSocketResponse>;
}

interface IAtherSocketClient extends EventEmitter {
    options: AtherOptions;
    http_options: AtherHttpOptions;
    url: URL;
    http_url: URL;
    ws: WebSocket | null;
    token: string | null;
    token_type: "token" | "access_key";
    client: unknown | null;
    websocket: {
        send: (data: AtherSocketRequest) => Promise<AtherSocketResponse>;
    };
    connect(): Promise<WebSocket>;
    disconnect(): void;
    handleMessage(data: MessageEvent): void;
    login(token: string, type: "token"|"access_key"|null): Promise<void>;
    _ready: boolean;
}

type AtherSocketResponse = {
    status: string;
    type: string;
    data?: unknown;
    action: string;
    id: string;
}

type AtherSocketRequestBase = {
    id?: string;
    action?: string;
};

type AtherSocketRequestAuth = AtherSocketRequestBase & {
    type: "auth";
    token?: string;
    access_key?: string;
};

type AtherSocketRequestAtherArch = AtherSocketRequestBase & {
    type: "atherArchive";
    archiveType: string;
    [key: string]: unknown;
    data?: string | Record<string, unknown>;
};

type AtherSocketRequest = AtherSocketRequestAuth | AtherSocketRequestAtherArch;

export interface DetailsResponse {
    messageCount: number;
    guildCount: number;
    channelCount: number;
    userCount: number;
    cacheCount: number;
}

export interface TrendData {
    time: string;
    data_count: number;
}

export interface DetailsTrendsResponse {
    messages: TrendData[];
    guilds: TrendData[];
    channels: TrendData[];
    users: TrendData[];
    files: TrendData[];
}
export interface Container {
    name: string;
    state: {
        status: string;
        memory: {
            usage: number;
        };
    };
    metadata: {
        properties?: {
            os?: string;
        };
    };
}

export interface SystemStatus {
    cpu: number;
    memory: {
      total: number;
      free: number;
    };
    storage: number;
  }
  

export type { 
    AtherOptions,
    User,
    Message, 
    Channel,
    Guild,
    Embed,
    Attachment,
    AtherSocketResponse, 
    AtherSocketRequest,
    AtherHttpOptions,
    Service,
    IAtherSocketClient
};

