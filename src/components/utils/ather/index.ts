import { 
    AtherOptions, AtherSocketRequest, 
    AtherSocketResponse,
    IAtherSocketClient,
    AtherHttpOptions,
    AtherWebSocket,
} from "@/types/ather";

export const calculatePercentageChange = (first: number, last: number) => {
    const value = ((last - first) / first) * 100;
    if (isNaN(value) || !isFinite(value)) {
        return 0;
    }
    return value;
};
  
import EventEmitter from 'events';
import { createArchive } from "./archive";

const idsWaiting: { id: string, callback: (data: AtherSocketResponse) => void, callbackBad: (error: { status: "error", data: string }) => void, creationTime: number }[] = [];

const build = "development"

class AtherSocketClient extends EventEmitter implements IAtherSocketClient {
    options: AtherOptions;
    http_options: AtherHttpOptions;
    url: URL;
    http_url: URL;
    ws: WebSocket | null = null;
    token: string | null = null;
    token_type: "token" | "access_key" = "token";
    client: unknown | null = null;
    _ready: boolean = false;
    archive: ReturnType<typeof createArchive>;
    public websocket: AtherWebSocket;

    constructor(options: AtherOptions = {
        ws_config: {},
        http_config: {}
    }) {
        super();
        this.options = options;
        this.url = new URL(options?.ws_config?.url || 'wss://ather1.net/wss');
        this.http_url = new URL(options?.http_config?.url || 'https://ather1.net/');
        this.http_options = options?.http_config || {}
        this.ws = null;
        this.token = null;
        this.client = null;

        this.websocket = {
            send: (data: AtherSocketRequest) => {
                const ws = this.ws;
                return new Promise<AtherSocketResponse>((resolve, reject) => {
                    if (!ws) return reject({ status: "error", data: 'socket not existing' });
                    const readyState = this.ws ? this.ws.readyState : -1;
                    if (readyState === WebSocket.OPEN) {
                        data.id = Math.random().toString(36).substr(2, 9);
                        ws.send(JSON.stringify(data));
                        if (data.type == "auth") return;
                        waitForId(data.id, (data: AtherSocketResponse) => {
                            return resolve(data);
                        }, reject);
                    } else {
                        return reject({ status: "error", data: 'socket not active' });
                    }
                });
            }
        }

        this.archive = createArchive(this.httpRequest, this.websocket);
    }

    connect() {
        return new Promise<WebSocket>((resolve, reject) => {
            console.log('initiating connection')
            const ws = new WebSocket(this.url.href);

            this.ws = ws;

            this.ws.onopen = () => {
                console.log('Connected to WebSocket server');
                this.emit('open');
                resolve(ws);
            };

            this.ws.onmessage = this.handleMessage.bind(this);

            this.ws.onerror = (error: unknown) => {
                console.log('WebSocket error: ', error);
                reject(error);
            };

            this.ws.onclose = () => {
                console.log('WebSocket connection closed, attempting to reconnect...');
                setTimeout(() => {
                    if (this.token) {
                        this.login(this.token, this.token_type);
                    }
                    clearInterval(pingInterval);
                }, 1000);   
                console.log('socket is gone!')
                this.emit('disconnect')
            };

            const pingInterval = setInterval(() => {
                if (this.ws && this.ws.readyState === WebSocket.OPEN)
                    this.ws.send('ping');
            }, 10000);
        });
    }

    disconnect() {
        if (this.ws)
            this.ws.close();
    }

    handleMessage(messageEvent: MessageEvent) {
        const data = messageEvent.data;
        if (data == "pong") return;
        const parsed = JSON.parse(data);
        if (parsed.type == "auth" && parsed.status == "success") {
            debugConsole(0, `authenticated to websocket server`);
            this.client = parsed.data
            console.log(parsed.data)
            this.emit('ready', parsed.data);
        } else if (parsed.status == "error" && idsWaiting.findIndex(item => item.id === data.id) === -1) {
            debugConsole(2, `Unhandled error: ${parsed.data}`);
            this.emit('error', parsed.data);
        }
        handleId(parsed);
    }

    async login(token: string, type: "token" | "access_key" | null) {
        const ws = await this.connect();
        this.token = token;
        this.http_options.headers = {
            "Authorization": `Token ${this.token}`
        };

        const readyState = ws.readyState;
        await new Promise<void>((resolve) => {
            if (readyState === WebSocket.OPEN) {
                resolve();
            } else {
                ws.addEventListener('open', () => {
                    resolve();
                });
            }
        });

        if (!type || (type && type === "token")) {
            this.websocket.send({
                type: "auth",
                token: token,
            });
        } else {
            this.token_type = "access_key"
            this.websocket.send({
                type: "auth",
                access_key: token
            });
        }
    }

    httpRequest = async (query: string, type: "GET" | "POST") => {
        const url = `${this.http_url.href}api/${build}/${query}`;
        const authorizationHeader = this.token_type === "access_key" ? "Bearer" : "Token";
        const options = {
            method: type,
            headers: {
                'Authorization': `${authorizationHeader} ${this.token}`
            }
        }
        try {
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`HTTP Error! Status: ${response.status}`);
            }
            const data = await response.json();
            return data;
        } catch (error) {
            console.error('Error fetching data:', error);
            throw error;
        }
    }
}

export default AtherSocketClient;

function waitForId(
    id: string,
    callback: (data: AtherSocketResponse) => void,
    callbackBad: (error: { status: "error", data: string }) => void
): void {
    idsWaiting.push({ id, callback, callbackBad, creationTime: Date.now() });
}

function handleId(data: AtherSocketResponse) {
    const index = idsWaiting.findIndex(item => item.id === data.id);

    if (index !== -1) {
        idsWaiting[index].callback(data);  // Call the associated callback
        idsWaiting.splice(index, 1);        // Remove the item from the array
    }
}

setInterval(() => {
    for (let i = 0; i < idsWaiting.length; i++) {
        if (Date.now() - idsWaiting[i].creationTime > 15000) {
            idsWaiting[i].callbackBad({ status: "error", data: "Request timed out" });
            idsWaiting.splice(i, 1);
        }
    }
}, 1000);

function debugConsole(t: 0 | 1 | 2 | 3, ret: string | unknown): void {
    if (t === 0) {
        console.log('[ \x1b[32mOK \x1b[0m] \x1b[32m%s\x1b[0m', ret);
    } else if (t === 1) {
        console.log('[ \x1b[33mWARN \x1b[0m] \x1b[33m%s\x1b[0m', ret);
    } else if (t === 2) {
        console.log('[ \x1b[31mERROR \x1b[0m] \x1b[31m%s\x1b[0m', ret);
    } else if (t === 3) {
        console.log('[ \x1b[36mINFO \x1b[0m] \x1b[36m%s\x1b[0m', ret);
    } else {
        console.log(ret);
    }
}
