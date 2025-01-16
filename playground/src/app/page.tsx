"use client";
import { useState, useEffect } from "react";
import { Ignition } from "./Ignition"
// import { io } from "socket.io-client";
// import { Ignition } from "ignition-js-sdk";

export default function Home() {

	const [socket, setSocket] = useState<any>(null);
	const [syncState, setSyncState] = useState("");
	const [tempState, setTempState] = useState("");	

	useEffect(() => {

		// const con = io("https://ignition-shared-v3.onrender.com", {
		// 	auth:{
		// 		token:"abc123"
		// 	}
		// });

		const con = new Ignition({
			key:"abc123",
			url:"https://ignition-shared-v5.onrender.com"
		})

		setSocket(con);

		con.on("connect", () => {
			console.log("connected");
			// con.emit("JOIN", { key:"abc123", group_id:"test" }, (data:any) => {
			// 	console.log(data)
			// })
			con.subscribe("test")
			con.on("sync", (data:any) => {
				console.log("DATA:", data)
				setSyncState(data)
			})
			// con.emit("sync", "test", "test")
		})

	}, []);

	return (
		<main className="flex min-h-screen flex-col items-center justify-between pt-24">
			<h1 className="text-5xl font-bold my-6 text-center">
				Welcome to Ignition!
			</h1>
			<textarea 
				value={syncState}
				onChange={(e) => {
					let temp = e.target.value;
					setSyncState(_ => temp);
					// socket.emit("MESSAGE", {
					// 	group_id:"test",
					// 	event_name:"sync",
					// 	message: temp,
					// 	key:"abc123",
					// })
					socket.emit("sync", temp)
				}}
				placeholder="Live edit a document with ignition .." 
				className="p-8 text-xl w-[90%] mx-4 sm:m-auto sm:w-11/12 h-96 border border-neutral-800 rounded-2xl 
				bg-neutral-100 outline-none"
			/>
		</main>
	);
}


























// "use client";
// import { Ignition } from "ignition-js-sdk";
// import { useEffect, useState } from "react";

// export default function Home() {

// 	const i = new Ignition({
// 		key:"abc123",
// 		url:"ws://ignition-shared-v3.onrender.com"
// 	})

// 	useEffect(() => {
// 		i.subscribe("test")
// 		i.on("test", (data) => {
// 			console.log(data)
// 		})
// 	}, [])

// 	const [syncState, setSyncState] = useState("");

// 	useEffect(() => {
// 		i.emit("test", "test", syncState)
// 	}, [syncState])

// 	return (
// 		<main className="flex min-h-screen flex-col items-center justify-between p-24">
// 			<textarea 
// 				onChange={(e) => setSyncState(e.target.value)}
// 				placeholder="Live edit a document with ignition .." 
// 				className="p-8 text-xl m-auto w-11/12 h-96 border border-neutral-800 rounded-2xl bg-neutral-900 outline-none"
// 			/>
// 		</main>
// 	);
// }
