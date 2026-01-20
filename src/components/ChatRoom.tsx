"use client";
import { useEffect, useState } from "react";
import { MessageReceived } from "@/types/rooms";

import { io } from "socket.io-client";

const socket = io("https://api.tools.gavago.fr/", {
    transports: ["websocket"],
});

interface ChatRoomProps {
    roomName: string;
    pseudo: string;
}

export default function ChatRoom({ roomName, pseudo }: ChatRoomProps) {
    const [messages, setMessages] = useState<{ pseudo: string; content: string }[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");

    useEffect(() => {
        // Rejoindre la room
        socket.emit("chat-join-room", { pseudo, roomName });

        // Gestionnaire de messages dédié à ce composant
        const onChatMsg = (msg: MessageReceived) => {
            try {
                setMessages((prev) => [...prev, { pseudo: msg.pseudo, content: msg.content }]);
            } catch (e) {
                // Évite de casser l'appli en cas de message malformé
                console.warn("Message chat ignoré (mal formé):", e, msg);
            }
        };

        socket.on("chat-msg", onChatMsg);

        return () => {
            // Ne jamais couper le socket global ici (StrictMode double-mount déclenche ce cleanup)
            // On nettoie uniquement les écouteurs propres à ce composant
            socket.off("chat-msg", onChatMsg);
        };
    }, [pseudo, roomName]);

    const [isConnected, setIsConnected] = useState(false);

    useEffect(() => {
        function onConnect() {
            setIsConnected(true);
        }

        function onDisconnect() {
            setIsConnected(false);
        }

        // État initial
        if (socket.connected) onConnect();

        // Abonnements
        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);

    return (
        <div className="p-6 pb-28">{/* pb pour ne pas masquer le contenu par la barre flottante */}
            <h1 className="text-xl font-bold mb-4">
                {isConnected ? "Connecté au socket" : "Déconnecté"}
            </h1>
            <h2 className="text-xl font-bold mb-4">Salon : {roomName}</h2>
            <ul className="space-y-2">
                {messages.map((m, i) => (
                    <li key={i} className="border p-2 rounded">{m.pseudo} : {m.content}</li>
                ))}
            </ul>
            {/* Barre d'envoi flottante en bas */}
            <div className="fixed bottom-0 left-0 right-0 border-t bg-white/90 backdrop-blur supports-[backdrop-filter]:bg-white/70">
                <div className="mx-auto max-w-3xl px-4 py-3">
                    <form
                        className="flex gap-2"
                        onSubmit={(e) => {
                            e.preventDefault();
                            const content = newMessage.trim();
                            if (!content) return;
                            try {
                                // Envoi du message à la room
                                socket.emit("chat-msg", { content, roomName });
                                setNewMessage("");
                            } catch (err) {
                                console.warn("Échec d'envoi du message:", err);
                            }
                        }}
                    >
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder={isConnected ? "Votre message…" : "Connexion requise"}
                            className="flex-1 border p-2 rounded"
                            disabled={!isConnected}
                        />
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                            disabled={!isConnected || newMessage.trim().length === 0}
                        >
                            Envoyer
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
