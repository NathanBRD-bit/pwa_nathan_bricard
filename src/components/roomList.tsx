'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import { socket } from "@/socket";
import type { RoomsResponse, MessageReceived } from "@/types/rooms";


export default function RoomList() {
    // Initialize from localStorage but normalize types for state safety
    const [pseudo, setPseudo] = useState<string>(localStorage.getItem("pseudo") || "");
    const [isConnected, setIsConnected] = useState<boolean>(localStorage.getItem("connected") === "true");
    const [dataRooms, setDataRooms] = useState<RoomsResponse | null>(null);
    const [currentRoom, setCurrentRoom] = useState<string | null>(null);
    const [messages, setMessages] = useState<MessageReceived[]>([]);
    const [input, setInput] = useState("");

    useEffect(() => {
        if (!isConnected) return;

        async function fetchRooms() {
            try {
                const roomsApi = await fetch(`https://api.tools.gavago.fr/socketio/api/rooms`, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" },
                });
                const json: RoomsResponse = await roomsApi.json();
                setDataRooms(json);
                console.log(json);
            } catch (error) {
                console.error("Erreur :", error);
            }
        }

        fetchRooms();
    }, [isConnected]);

    function handleConnect() {
        const cleaned = (pseudo || "").trim();
        if (cleaned.length === 0) return;
        localStorage.setItem("pseudo", cleaned);
        localStorage.setItem("connected", "true");
        setPseudo(cleaned);
        setIsConnected(true);
    }

    function handleDisconnect() {
        localStorage.setItem("pseudo", "");
        localStorage.setItem("connected", "false");
        setIsConnected(false);
        setPseudo("");
    }

    // Écoute des messages et des événements
    useEffect(() => {
        const onJoined = ({ clients, roomName }: { clients: unknown; roomName: string }) => {
            console.log(`Vous avez rejoint ${roomName}`, clients);
            setCurrentRoom(roomName);
            setMessages([]);
        };

        const onMsg = (msg: MessageReceived) => {
            console.log(msg);
            msg.dateEmis = new Date(msg.dateEmis || Date.now());
            setMessages((prev) => [...prev, msg]);
        };

        const onDisconnected = ({ pseudo, roomName }: { pseudo: string; roomName: string }) => {
            console.log(`${pseudo} a quitté la room ${roomName}`);
        };

        socket.on("chat-joined-room", onJoined);
        socket.on("chat-msg", onMsg);
        socket.on("chat-disconnected", onDisconnected);

        return () => {
            socket.off("chat-joined-room", onJoined);
            socket.off("chat-msg", onMsg);
            socket.off("chat-disconnected", onDisconnected);
        };
    }, []);

    return (
        <div className="p-6">
            {!isConnected ? (
                <div className="space-y-4">
                    <h2 className="text-lg font-medium">Connexion</h2>
                    <input
                        type="text"
                        placeholder="Votre pseudo"
                        value={pseudo}
                        onChange={(e) => setPseudo(e.target.value)}
                        className="border p-2 rounded w-full"
                    />
                    <button
                        onClick={handleConnect}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Connexion
                    </button>
                </div>
            ) : (
                <>
                    {pseudo !== '' && <b>Bonjour {pseudo}.</b>}
                    <h2 className="text-lg font-medium mb-4">Liste des rooms :</h2>
                    <button
                        onClick={handleDisconnect}
                        className="px-4 py-2 bg-blue-500 text-white rounded"
                    >
                        Déconnexion
                    </button>
                    {!dataRooms?.data ? (
                        <p className="text-sm text-gray-500">Chargement des rooms...</p>
                    ) : (
                        <div className="space-y-4">
                            {Object.entries(dataRooms.data).map(([roomName, roomInfo]) => (
                                <div key={roomName} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-base font-semibold text-gray-800">
                                            Room : {roomName}
                                        </h3>
                                        <Link href={`/room/${roomName}`}>
                                            <button className="px-3 py-1 text-sm bg-green-500 text-white rounded">
                                                Rejoindre
                                            </button>
                                        </Link>
                                    </div>

                                    {roomInfo?.clients && Object.keys(roomInfo.clients).length > 0 ? (
                                        <ul className="pl-4 space-y-1 text-sm text-gray-700">
                                            {Object.values(roomInfo.clients).map((client, index) => {
                                                const displayPseudo = typeof client.pseudo === "string"
                                                    ? client.pseudo
                                                    : client.pseudo?.username || "Inconnu";

                                                return (
                                                    <li key={index}>
                                                        • {displayPseudo}
                                                        {client.initiator && (
                                                            <span className="text-gray-500"> (initiateur)</span>
                                                        )}
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-gray-500">Aucun client dans cette room.</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
