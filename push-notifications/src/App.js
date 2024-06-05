import React, { useEffect, useState } from "react";

function createRandomId() {
	const chars =
		"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
	let result = "";
	for (let i = 0; i < 4; i++) {
		result += chars.charAt(Math.floor(Math.random() * chars.length));
	}
	return result;
}

function App() {
	const [notificationPermission, setNotificationPermission] = useState(
		Notification.permission
	);

	const uniqueDeviceId = createRandomId();

	const baseUrl = process.env.REACT_APP_BASE_URL;

	useEffect(() => {
		requestNotificationPermission();
	}, []);

	const requestNotificationPermission = async () => {
		const permission = await Notification.requestPermission();
		setNotificationPermission(permission);
	};

	useEffect(() => {
		if ("serviceWorker" in navigator && notificationPermission === "granted") {
			navigator.serviceWorker.ready.then((registration) => {
				if (registration.pushManager) {
					registration.pushManager.getSubscription().then((subscription) => {
						if (!subscription) {
							registerPush();
						}
					});
				}
			});
		}
	}, [notificationPermission]);

	const registerPush = async () => {
		const registration = await navigator.serviceWorker.ready;
		const subscription = await registration.pushManager.subscribe({
			userVisibleOnly: true,
			applicationServerKey: urlBase64ToUint8Array(
				"BE-FPeh1U7MV3_sV_Jzz42GwNwMXJTc9G0lADbEneQerkcrS64-vGVspcFdNkugp6c93rERoVTykJZbRhmu2XtE"
			),
		});

		await fetch(`${baseUrl}/subscribe`, {
			method: "POST",
			body: JSON.stringify({ subscription, userIdentifier: uniqueDeviceId }),
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
		await fetch(`${baseUrl}/sendNotification`, {
			method: "POST",
		});
	};

	return (
		<div className="App">
			<header className="App-header">
				<h1>React PWA Notification</h1>
				{notificationPermission === "granted" && (
					<button onClick={sendNotification}>Send Notification</button>
				)}
			</header>
		</div>
	);
}

export default App;
