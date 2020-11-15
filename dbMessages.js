const mongoose = require("mongoose");

const whatsupSchema = mongoose.Schema({
	message: String,
	name: String,
	timestamp: String,
	received: Boolean,
});

module.exports = mongoose.model("conversations", whatsupSchema);
