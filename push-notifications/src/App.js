// src/App.js
import React, { useEffect } from "react";

function App() {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			navigator.serviceWorker.ready.then((registration) => {
				if (registration.pushManager) {
					registration.pushManager.getSubscription().then((subscription) => {
						if (!subscription) {
							// No subscription, subscribe the user
							registerPush();
						}
					});
				}
			});
		}
	}, []);

	const registerPush = async () => {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				"BE-FPeh1U7MV3_sV_Jzz42GwNwMXJTc9G0lADbEneQerkcrS64-vGVspcFdNkugp6c93rERoVTykJZbRhmu2XtE"
			),
		});

		await fetch("http://localhost:8080/subscribe", {
			method: "POST",
			body: JSON.stringify(subscription),
			headers: {
				"Content-Type": "application/json",
			},
		});
	};

	const urlBase64ToUint8Array = (base64String) => {
		const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
		const base64 = (base64String + padding)
			.replace(/-/g, "+")
			.replace(/_/g, "/");
		const rawData = window.atob(base64);
		const outputArray = new Uint8Array(rawData.length);
		for (let i = 0; i < rawData.length; ++i) {
			outputArray[i] = rawData.charCodeAt(i);
		}
		return outputArray;
	};

	const sendNotification = async () => {
		await fetch("http://localhost:8080/sendNotification", {
			method: "POST",
		});
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>React PWA Notification</h1>
				<button onClick={sendNotification}>Send Notification</button>
			</header>
		</div>
	);
}

export default App;
