"use client";
import { useEffect, useState } from "react";
import { MessageReceived } from "@/types/rooms";
import { socket } from "@/socket";
import Link from "next/link";
import CameraComponent from "@/components/cameraComponent";
import Image from "next/image";

interface ChatRoomProps {
    roomName: string;
    pseudo: string;
}

export default function ChatRoom({ roomName, pseudo }: ChatRoomProps) {
    // let firstLoad = true;
    const [messages, setMessages] = useState<{ pseudo: string; content: string }[]>([]);
    const [newMessage, setNewMessage] = useState<string>("");

    // Détecte si le contenu est une image encodée en base64 via data URL
    const isDataImage = (content: string) => content.startsWith("data:image");

    useEffect(() => {
        // if (firstLoad) {
            // Rejoindre la room
        console.log("Rejoindre la room", roomName);
        socket.emit("chat-join-room", { pseudo, roomName });

        // Gestionnaire de messages dédié à ce composant
        const onChatMsg = (msg: MessageReceived) => {
            try {
                setMessages((prev) => [...prev, { pseudo: msg.pseudo, content: msg.content }]);
            } catch (e) {
                // Évite de casser l'appli en cas de message malformé
                console.log("Message chat ignoré (mal formé):", e, msg);
            }
        };
        socket.on("chat-msg", onChatMsg);
        //     firstLoad = false;
        // }
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

    const leaveRoom = () => {
        socket.emit("disconnect")
    };

    return (
        <div className="p-6 pb-28">
            <h1 className="text-xl font-bold mb-4">
                {isConnected ? "Connecté au socket" : "Déconnecté"}
            </h1>
            <h2 className="text-xl font-bold mb-4">Salon : {roomName}</h2>
            {/* Caméra: permettre d'envoyer une photo (base64) dans la room */}
            <div className="mb-6">
                <CameraComponent roomName={roomName} />
            </div>
            <ul className="space-y-2">
                {messages.map((m, i) => (
                    <li key={i} className="border p-2 rounded">
                        <span className="font-medium">{m.pseudo} :</span>{" "}
                        {isDataImage(m.content) ? (
                            <Image
                                src={m.content}
                                alt={`Image envoyée par ${m.pseudo}`}
                                width={800}
                                height={600}
                                className="mt-2 max-w-full h-auto rounded border"
                                unoptimized
                            />
                        ) : (
                            <span>{m.content}</span>
                        )}
                    </li>
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
                        <Link href='/reception'>
                            <button
                                type="button"
                                onClick={leaveRoom}
                                aria-label="Action secondaire"
                                className="inline-flex items-center justify-center rounded border px-3 py-2 text-gray-700 bg-white hover:bg-gray-50 active:bg-gray-100 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 transition md:px-4"
                            >
                                Quitter la room
                            </button>
                        </Link>
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
