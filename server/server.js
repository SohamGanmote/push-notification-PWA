const express = require("express");
const cors = require("cors");
const webPush = require("web-push");

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors("*"));

const vapidKeys = {
	publicKey:
		"BE-FPeh1U7MV3_sV_Jzz42GwNwMXJTc9G0lADbEneQerkcrS64-vGVspcFdNkugp6c93rERoVTykJZbRhmu2XtE",
	privateKey: "SHndd7FY6dLerXIKyYwsQuGVIfXf8Z9V5yR6VuymX7k",
};

webPush.setVapidDetails(
	"mailto:your-email@example.com",
	vapidKeys.publicKey,
	vapidKeys.privateKey
);

let subscriptions = [];

app.post("/subscribe", (req, res) => {
	const subscription = req.body;
	subscriptions.push(subscription);
	res.status(201).json({});
	console.log("User subscribed:", subscription);
});

app.post("/sendNotification", (req, res) => {
	const notificationPayload = {
		notification: {
			title: "React PWA Notification",
			body: "This is a notification from your PWA!",
			icon: "path_to_icon/icon.png",
			data: {
				url: "https://www.example.com", // URL to open on click
			},
		},
	};

	const promises = [];
	subscriptions.forEach((subscription) => {
		promises.push(
			webPush
				.sendNotification(subscription, JSON.stringify(notificationPayload))
				.then((response) => console.log("Notification sent:", response))
				.catch((error) => console.error("Error sending notification:", error))
		);
	});

	Promise.all(promises).then(() => res.sendStatus(200));
});

app.listen(8080, () => {
	console.log("Server started on 8080!");
});
