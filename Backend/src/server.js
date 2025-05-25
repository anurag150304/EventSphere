import "dotenv/config.js";
import http from "http";
import app from "./app.js";
import * as socket from "./socket.js"

const PORT = process.env.PORT || 5000;
const server = http.createServer(app);
socket.initializeSocket(server);
server.listen(PORT, () => console.log(`server is running on port ${PORT}`));