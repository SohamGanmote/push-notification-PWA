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
	const { subscription, userIdentifier } = req.body;
	subscriptions.push({ subscription, userIdentifier });
	res.status(201).json({});
	console.log("User subscribed:", userIdentifier);
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

	const selectedDevices = req.body.devices || []; // Use an empty array as default if not sent

	const promises = subscriptions
		.filter((subscription) => {
			// If no selected devices, include all subscriptions
			return (
				selectedDevices.length === 0 ||
				selectedDevices.includes(subscription.userIdentifier)
			);
		})
		.map((subscription) => {
			return webPush
				.sendNotification(
					subscription.subscription,
					JSON.stringify(notificationPayload)
				)
				.then((response) => console.log("Notification sent:", response))
				.catch((error) => console.error("Error sending notification:", error));
		});

	Promise.all(promises).then(() => res.sendStatus(200));
});

app.get("/", (req, res) => {
	let htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Connected Devices</title>
</head>
<body>
  <h1>Notify Single/Multiple Users</h1>
	<input type="text" id="notificationMessage" placeholder="Enter notification message">
	<button id="pingUserButton">Send Notification</button>

	<script>
    const pingUserButton = document.getElementById("pingUserButton");
    const notificationMessageInput = document.getElementById("notificationMessage");

    pingUserButton.addEventListener("click", function() {
			const notificationMessage = notificationMessageInput.value.trim();
			fetch("/sendNotification", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: notificationMessage
      })
    });
  </script>
</body>

</html>`;

	res.send(htmlContent);
});

app.get("/devices", (req, res) => {
	res.send(subscriptions);
});

app.listen(8080, () => {
	console.log("Server started on 8080!");
});
