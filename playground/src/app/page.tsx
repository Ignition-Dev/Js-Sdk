"use client";
import { Ignition } from "ignition-js-sdk";
import { useEffect, useState } from "react";

export default function Home() {

	const i = new Ignition({
		key:"abc123",
		url:"ws://ignition-shared-v3.onrender.com"
	})

	useEffect(() => {
		i.subscribe("test")
		i.on("test", (data) => {
			console.log(data)
		})
	}, [])

	const [syncState, setSyncState] = useState("");

	return (
		<main className="flex min-h-screen flex-col items-center justify-between p-24">
			<textarea 
				onChange={(e) => setSyncState(e.target.value)}
				placeholder="Live edit a document with ignition .." 
				className="p-8 text-xl m-auto w-11/12 h-96 border border-neutral-800 rounded-2xl bg-neutral-900 outline-none"
			/>
		</main>
	);
}
