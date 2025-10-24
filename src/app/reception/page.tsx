'use client';

import RoomList from "@/components/roomList";
import CameraComponent from "@/components/cameraComponent";
import { useEffect, useState } from "react";
import { socket } from "@/socket";

export default function Reception() {
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
            socket.off("disconnect", onDisconnect);
        };
    }, []);
    
    return (
        <div className="p-6">
            <h1 className="text-xl font-bold mb-4">
                {isConnected ? "Connecté au socket" : "Déconnecté"}
            </h1>
            <CameraComponent/>
            <RoomList/>
        </div>
    );
}
