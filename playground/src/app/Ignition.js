import { io } from "socket.io-client";
import chalk from "chalk";
import CryptoJS from 'crypto-js';

const { AES } = CryptoJS;

function devLog(...args) {
	if (process.env.ENV === "dev") console.log(chalk.bold(...args));
	else return
}

function errorLog(...args) {
	console.error(chalk.redBright("Ignition error:", ...args))
}

export class Ignition {
	#socket; #encryptionKey;
	constructor(config) {
		this.url = config.url;
		this.#encryptionKey = config.encryptionKey;
		this.apiKey = config.key;
		this.groupId = undefined;
		this.groupCount = 0;
		this.#socket = io(this.url, { // public shared ignition websocket server URL - Elastic Ip
			auth: {
				token: this.apiKey,
			}
		});
		this.#socket.on("ERROR", (message) => { errorLog(message) });
		this.#socket.on("CONNECTED", (message) => { devLog(chalk.cyanBright(message)) });
	}

	ecrypt(message) {
		return AES.encrypt(message, this.#encryptionKey).toString();
	}

	decrypt(message) {
		return AES.decrypt(message, this.#encryptionKey).toString(CryptoJS.enc.Utf8);
	}

	async subscribe(groupId) {
		this.groupId = groupId;
		devLog("Attempting to subscribe to room !!");
		this.#socket.emit("JOIN", { key: this.apiKey, group_id: this.groupId }, (data) => { // this would be recived by the server & the server will join this client int that room
			console.log(chalk.cyanBright(data));
		});
	}

	async unsubscribe(groupId) {
		this.groupId = groupId; // set groupId as global class state
		devLog("Attempting to unsubscribe from room !!");
		this.#socket.emit("LEAVE", `${this.apiKey}_${groupId}`, (data) => {
			console.log(chalk.cyanBright(data));
		});
	}

	async emit(eventName, message, group_id=undefined) {
		if(group_id == undefined && this.groupId == undefined){
			errorLog("Missing `groupId`. Did you forgot to `subsribe` to a group ?");
		}

		devLog("EMITTING EVENT !!")

		this.#socket.emit("MESSAGE", {
			group_id: group_id ? group_id : this.groupId,
			event_name: eventName,
			message: typeof(message) == "object" ? JSON.stringify(message) : message,
			key: this.apiKey
		})
	}

	async on(eventName, callback) {
		if (eventName != "connect" && eventName != "disconnect" && this.groupId == undefined) {
			errorLog("Missing `groupId`. Did you forgot to `subsribe` to a group ?");
		};
		this.#socket.on(eventName, (...data) => {
			callback(...data)
		})
	}

	async off(eventName, callback = undefined) {
		if (eventName != "connect" && eventName != "disconnect" && this.groupId == undefined) {
			errorLog("Missing `groupId`. Did you forgot to `subsribe` to a group ?");
		};
		this.#socket.off(eventName, callback);
	}

}

















// import { io } from "socket.io-client";
// import chalk from "chalk";

// export class Ignition {
// 	#socket; #encryptionKey;
//     constructor(config) {
// 		this.url = config.url;
// 		this.#encryptionKey = config.encryptionKey;
// 		this.apiKey = config.key;
// 		this.groupId = undefined;
// 		this.groupCount = 0;
// 		this.#socket = io(this.url, {
// 			auth: {
// 				token: this.apiKey,
// 			}
// 		});
// 		this.#socket.on("ERROR", (message) => { errorLog(message) });
// 		this.#socket.on("CONNECTED", (message) => { devLog(chalk.cyanBright(message)) });
// 	}

//     subscribe(groupId) {
// 		this.groupId = groupId;
// 		this.#socket.emit("JOIN", { key:this.apiKey, group_id:groupId }, (data) => {
//             console.log(data)
//         })
// 	}

//     on(eventName, callback) {
// 		this.#socket.on(eventName, (...data) => {
// 			callback(...data)
// 		})
// 	}

//     emit(eventName, message, group_id=undefined) {
//         console.log("emitting event:", eventName, "to group:", this.groupId, "message:", message)
// 		this.#socket.emit("MESSAGE", {
//             group_id:this.groupId ? this.groupId : group_id,
//             event_name:eventName,
//             message: typeof(message) == "object" ? JSON.stringify(message) : message,
//             key:this.apiKey,
//         });
// 	}
// }