'use client';

import Link from "next/link";
import { useEffect, useState } from "react";
import type { RoomsResponse } from "@/types/rooms";


export default function RoomList() {
    // Important: ne pas lire localStorage pendant le rendu SSR
    // -> on initialise des valeurs sûres, puis on hydrate côté client dans un useEffect
    const [pseudo, setPseudo] = useState<string>("");
    const [roomName, setRoomName] = useState<string>("");
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [dataRooms, setDataRooms] = useState<RoomsResponse | null>(null);

    // Hydrate l'état depuis localStorage uniquement côté client
    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
            const storedPseudo = window.localStorage.getItem("pseudo") || "";
            const storedConnected = window.localStorage.getItem("connected") === "true";
            setPseudo(storedPseudo);
            setIsConnected(storedConnected);
        } catch (e) {
            // En cas de restriction d'accès au storage, on reste sur les valeurs par défaut
            console.warn("Impossible de lire localStorage:", e);
        }
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

    // Note: la logique d'abonnement socket pour la liste n'est pas requise ici.

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
                    <h2 className="text-lg font-medium mb-4">Créer une room :</h2>
                    <input
                    type="text"
                    placeholder="Nom de la room"
                    value={roomName}
                    onChange={(e) => setRoomName(e.target.value)}
                    className="border p-2 rounded w-full" />
                    <Link href={roomName ? `/room/${roomName}` : '#'}>
                        <button
                            disabled={!roomName.trim()}
                            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Créer la room
                        </button>
                    </Link>
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
