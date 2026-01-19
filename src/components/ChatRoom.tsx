import { useEffect, useState } from "react";
import { socket } from "@/socket";
import {MessageReceived} from "@/types/rooms";

interface ChatRoomProps {
    roomName: string;
    pseudo: string;
}

export default function ChatRoom({ roomName, pseudo }: ChatRoomProps) {
    const [messages, setMessages] = useState<{ pseudo: string; content: string }[]>([]);

    useEffect(() => {
        socket.emit("chat-join-room", { pseudo, roomName });

        socket.on("chat-msg", (msg: MessageReceived) => {
            console.log(msg);
            setMessages((prev) => [...prev, { pseudo: msg.pseudo, content: msg.content }]);
        });


        return () => {
            socket.disconnect();
        };
    }, [pseudo, roomName]);

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        async function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
        };
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                {isConnected ? "Connecté au socket" : "Déconnecté"}
            </h1>
            <h2 className="text-xl font-bold mb-4">Salon : {roomName}</h2>
            <ul className="space-y-2">
                {messages.map((m, i) => (
                    <li key={i} className="border p-2 rounded">{m.pseudo} : {m.content}</li>
                ))}
            </ul>
        </div>
    );
}
