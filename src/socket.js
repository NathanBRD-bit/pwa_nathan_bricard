"use client";

import { io } from "socket.io-client";

export const socket = io("https://api.tools.gavago.fr/", {
    transports: ["websocket"],
});

socket.on("message", (message) => {})
socket.emit("room_list", (msg) => {});