const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Pusher = require("pusher");

const Messages = require("./dbMessages.js");
const cors = require("cors");

const app = express();
app.use(cors());
dotenv.config();
app.use(express.json());

const mongoURI = `mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.by0ng.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority`;

const port = 9000 || process.env.PORT;

mongoose.connect(mongoURI, {
	useCreateIndex: true,
	useNewUrlParser: true,
	useUnifiedTopology: true,
});

const pusher = new Pusher({
	appId: "1107309",
	key: "ff80666ecdd75d392af8",
	secret: "e224159915cbf51ddc74",
	cluster: "ap2",
	useTLS: true,
});

pusher.trigger("my-channel", "my-event", {
	message: "hello world",
});

const db = mongoose.connection;

db.once("open", () => {
	const changeStream = db.collection("conversations").watch();
	changeStream.on("change", (change) => {
		if (change.operationType === "insert") {
			const messageDetails = change.fullDocument;
			pusher.trigger("messages", "inserted", {
				name: messageDetails.name,
				message: messageDetails.message,
				timestamp: messageDetails.timestamp,
				received: messageDetails.received,
			});
		} else {
			console.log("Error Happened");
		}
	});
});

app.get("/", (req, res) => res.status(200).send("Hello World"));

app.post("/messages/new", (req, res) => {
	const dbMessages = req.body;

	Messages.create(dbMessages, (err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(201).send(data);
		}
	});
});

app.get("/messages/sync", (req, res) => {
	Messages.find((err, data) => {
		if (err) {
			res.status(500).send(err);
		} else {
			res.status(200).send(data);
		}
	});
});

app.listen(port);
