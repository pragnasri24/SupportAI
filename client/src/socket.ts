import { io } from "socket.io-client";

const socket = io("https://supportai-3v3x.onrender.com", {
  autoConnect: true,
});

export default socket;