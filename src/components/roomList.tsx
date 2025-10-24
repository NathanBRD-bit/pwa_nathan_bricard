'use client';

import { useEffect, useState } from "react";
import {socket} from "@/socket";
import type { RoomsResponse } from "@/types/rooms";


export default function RoomList() {
    const [pseudo, setPseudo] = useState("");
    const [isConnectedSocket, setIsConnectedSocket] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [dataRooms, setDataRooms] = useState<RoomsResponse | null>(null);


    useEffect(() => {
        if (socket.connected) {
            onConnect();
        }

        async function onConnect() {
            setIsConnectedSocket(true);
        }

        function onDisconnect() {
            setIsConnectedSocket(false);
        }

        socket.on("connect", onConnect);
        socket.on("disconnect", onDisconnect);

        return () => {
            socket.off("connect", onConnect);
            socket.off("disconnect", onDisconnect);
        };
    }, []);
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
        if (!pseudo.trim()) return;
        localStorage.setItem("pseudo", pseudo.trim());
        setIsConnected(true);
    }

    function joinRoom(roomName: string, pseudo: string) {
        socket.emit("chat-join-room", {
            pseudo,
            roomName,
        });
    }

    return (
        <div className="p-6">
            {!isConnected ? (
                <div className="space-y-4">
                    <h2 className="text-lg font-medium">Connexionerfrferferfef</h2>
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
                                        <button
                                            onClick={() => joinRoom(roomName, pseudo)}
                                            className="px-3 py-1 text-sm bg-green-500 text-white rounded"
                                        >
                                            Rejoindre
                                        </button>
                                    </div>

                                    {roomInfo?.clients ? (
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
