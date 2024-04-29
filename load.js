import { Ignition } from "./index.js";

//  - i want to:
//      ~ connect 1000 clients with my server in 200 ms interval
//      ~ keep sending message to all clients in 10ms interval
//      ~ test server performance 

const CLIENT_CONNECTION_INTERVAL = 200
const MESSAGE_INTERVAL = 10
const MAX_CLIENTS = 1000;
const MAX_GROUPS = 10;

const CONNECTION_MAP = new Map()

function IgniteLoadOnServer() {
    const k = `abc123${Math.random()}`
    const ignition = new Ignition({
        url: "https://ignition-shared-v3.onrender.com/",
        key: k
    });
    ignition.on('connect', () => {
        console.log('new connection');
        for (let i = 0; i < MAX_GROUPS; i++) {
            ignition.subscribe(`test${i}`);
        }
        CONNECTION_MAP.set(k, ignition);
    });
    if (CONNECTION_MAP.size < MAX_CLIENTS) {
        setTimeout(IgniteLoadOnServer, CLIENT_CONNECTION_INTERVAL);
    }
    else{
        console.log('All client connected with 10 groups joined, MAP:', CONNECTION_MAP);
        for (let [_, ignition] of CONNECTION_MAP) {
            setInterval(() => {
                ignition.emit('news', 'radha', 'test8');
            }, MESSAGE_INTERVAL)
        }
    }
}

IgniteLoadOnServer();
