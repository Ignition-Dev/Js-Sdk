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
	#socket;#encryptionKey;
	constructor(config) {
		this.url = config.url;
		this.#encryptionKey = config.encryptionKey;
		this.apiKey = config.key;
		this.groupId = undefined;
		this.groupCount = 0;
		this.#socket = io(this.url ?? "ws://52.66.244.200:3000", { // public shared ignition websocket server URL - Elastic Ip
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
		// this.#socket.emit("GROUP", groupId);
	}

	async unsubscribe(groupId) {
		this.groupId = groupId; // set groupId as global class state
		devLog("Attempting to unsubscribe from room !!");
		this.#socket.emit("LEAVE", `${this.apiKey}_${groupId}`, (data) => {
			console.log(chalk.cyanBright(data));
		});
	}

	async emit(eventName, groupId, message) {
		if (this.url == undefined) {
			errorLog("You must have `URL` of a server to emit a direct message, try using `publish()` method for Shared users.")
		}

		if(typeof(message) == "object") {
			message = JSON.stringify(message)
		}

		devLog("EMITTING EVENT !!")
		this.#socket.emit("MESSAGE", {
			group_id: this.apiKey + "_" + groupId,
			event_name: eventName,
			message: this.#encryptionKey ? this.ecrypt(message) : message,
			key: this.apiKey
		})
	}

	async on(eventName, callback) {
		if (eventName != "connect" && eventName != "disconnect" && this.groupId == undefined) {
			errorLog("Missing `groupId`. Did you forgot to `subsribe` to a group ?");
		};
		this.#socket.on(eventName, callback);
	}

	async off(eventName, callback=undefined) {
		if (eventName != "connect" && eventName != "disconnect" && this.groupId == undefined) {
			errorLog("Missing `groupId`. Did you forgot to `subsribe` to a group ?");
		};
		this.#socket.off(eventName, callback);
	}

	// this method adds the message to the `message queue` from which shared websocket server 
	// keeps pulling and braodcasting the message to all the clients subscribed to the group.
	async publish(groupId, eventName, message) {
		try {
			const res = await fetch("ignition_application_server_url", {
				method: "POST",
				mode: "cors",
				cache: "no-cache",
				credentials: "same-origin",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					"group_id": groupId,
					"event_name": eventName,
					"message": this.#encryptionKey ? this.ecrypt(message) : message,
					"key": this.apiKey
				})
			})
			if (res.status != 200) {
				throw Error(`Failed to publish message, status code: ${res.status}`)
			}
		} catch (error) {
			errorLog(error)
		}
	}

}

// let real = new Ignition("abc123", {
// 	// url: "XXXXXXXXXXXXXXXXXXXXXXXXX",
// 	encryptionKey: "12wwsxf"
// });
// real.on("con", (data) => {
// 	console.log(real.decrypt(data))
// })
// let s2 = new Ignition("abc123");
// s2.on("connect", () => {
// 	console.log("s2 client connected");
// 	s2.subscribe("emails");
// 	s2.on("message", (data) => {
// 		console.log("s2 client got message for event `message`: ", data);
// 	})
// })
// s2.subscribe("radha");
// s2.on("news", (data) => {
// 	console.log("s2 client got message for event `news`: ", data);
// })
// let spark1 = new Ignition("abc123");
// spark1.emit("news", "radha", "hello world");