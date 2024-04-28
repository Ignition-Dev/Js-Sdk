import { io } from "socket.io-client";
import chalk from "chalk";

export class Ignition {
	#socket; #encryptionKey;
    constructor(config) {
		this.url = config.url;
		this.#encryptionKey = config.encryptionKey;
		this.apiKey = config.key;
		this.groupId = undefined;
		this.groupCount = 0;
		this.#socket = io(this.url, {
			auth: {
				token: this.apiKey,
			}
		});
		this.#socket.on("ERROR", (message) => { errorLog(message) });
		this.#socket.on("CONNECTED", (message) => { devLog(chalk.cyanBright(message)) });
	}

    subscribe(groupId) {
		this.groupId = groupId;
		this.#socket.emit("JOIN", { key:this.apiKey, group_id:groupId }, (data) => {
            console.log(data)
        })
	}

    on(eventName, callback) {
		this.#socket.on(eventName, (...data) => {
			callback(...data)
		})
	}

    emit(eventName, message, group_id=undefined) {
        console.log("emitting event:", eventName, "to group:", this.groupId, "message:", message)
		this.#socket.emit("MESSAGE", {
            group_id:this.groupId ? this.groupId : group_id,
            event_name:eventName,
            message: typeof(message) == "object" ? JSON.stringify(message) : message,
            key:this.apiKey,
        });
	}
}