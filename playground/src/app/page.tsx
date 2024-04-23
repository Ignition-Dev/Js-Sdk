"use client";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";


export default function Home() {

	const [socket, setSocket] = useState<any>(null);
	const [syncState, setSyncState] = useState("");
	const [tempState, setTempState] = useState("");	

	useEffect(() => {

		const socket = io("https://ignition-shared-v3.onrender.com", {
			auth:{
				token:"abc123"
			}
		});

		setSocket(socket);

		socket.on("connect", () => {
			console.log("connected");
			socket.emit("JOIN", { key:"abc123", group_id:"test" }, (data:any) => {
				console.log(data)
			})
			socket.on("sync", (data:any) => {
				// alert(data)
				console.log(data)
				setTempState(data)
			})
		})

	}, []);

	useEffect(() => {
		if(socket){
			console.log("emitting")
			socket.emit("MESSAGE", {
				group_id:"test",
				event_name:"sync",
				message: syncState,
				key:"abc123",
			})
		}
	}, [syncState])

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<h1 className="text-5xl font-bold">
				Welcome to Ignition!
			</h1>
			<textarea 
				defaultValue={tempState}
				onChange={(e) => setSyncState(e.target.value)}
				placeholder="Live edit a document with ignition .." 
				className="p-8 text-xl m-auto w-11/12 h-96 border border-neutral-800 rounded-2xl bg-neutral-900 outline-none"
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
