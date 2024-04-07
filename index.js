import { io } from "socket.io-client";
import chalk from "chalk";

function devLog(...args) {
	if (process.env.ENV === "production") return;
	console.log(chalk.bold(...args))
}

function errorLog(...args) {
	console.error(chalk.redBright("Ignition error:", ...args))
}

export class Ignition {
	#apiKey; #socket; #state; #groupId; #url;
	constructor(key, url = undefined) {
		this.#url = url;
		this.#apiKey = key;
		this.#groupId = undefined;
		this.#state = true;
		this.#socket = io(url ?? "ws://52.66.244.200:3000", { // public shared ignition websocket server URL - Elastic Ip
			auth: {
				token: this.#apiKey,
			}
		});
		this.#socket.on("ERROR", (message) => { errorLog(message) });
		this.#socket.on("CONNECTED", (message) => { devLog(chalk.cyanBright(message)) });
	}

	async subscribe(groupId) {
		this.#groupId = groupId; // set groupId as global class state
		devLog("Attempting to subscribe to room !!");
		this.#socket.emit("JOIN", `${this.#apiKey}_${groupId}`, (data) => {
			console.log(chalk.cyanBright(data));
			this.#state = true;
		});
		this.#socket.emit("message", groupId);
	}

	// this method should only be used by dedictaed, dedictaed+ & enterprize clients
	// emit directly send message to the websocket server instaed appending it to the message queue.
	async emit(eventName, groupId, message) {
		if (this.#url == undefined) {
			errorLog("You must have `URL` of a server to emit a direct message, try using `publish()` method for Shared users.")
		}
		devLog("EMITTING EVENT !!")
		this.#socket.emit("MESSAGE", {
			event: eventName,
			room: this.#apiKey + "_" + groupId,
			message: message,
		})
	}

	async on(eventName, callback) {
		if (this.#groupId == undefined) {
			errorLog("Missing `groupId`. Did you forgot to `subsribe` to a group ?");
		};
		this.#socket.on(eventName, callback);
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
					"message": message,
					"key": this.#apiKey
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



// let s2 = new Ignition("abc123");
// s2.subscribe("radha");
// s2.on("news", (data) => {
// 	console.log("s2 client got message for event `news`: ", data);
// })
// let spark1 = new Ignition("abc123");
// spark1.emit("news", "radha", "hello world");

// let t = {
// 	"group_id": "emails",
// 	"event_name": "message",
// 	"message": "RADHA KRISHN",
// 	"key": "RadhaKrishna"
// }
// try {
// 	const res = await fetch("http://127.0.0.1:3000/ignite", {
// 		method: "POST",
// 		mode: "cors", // no-cors, *cors, same-origin
// 		cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-
// 		credentials: "same-origin", // include, *same-origin, omit
// 		headers: {
// 			"Content-Type": "application/json",
// 			// 'Content-Type': 'application/x-www-form-urlencoded',
// 		},
// 		body: JSON.stringify(t)
// 	})
// 	if (res.status != 200) {
// 		throw Error(`Failed to publish message, status code: ${res.status}, message: ${res.message}`)
// 	}
// 	else {
// 		console.log(await res.json())
// 	}
// } catch (error) {
// 	errorLog(error)
// }