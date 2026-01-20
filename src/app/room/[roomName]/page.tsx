"use client";

import { useParams } from "next/navigation";
import ChatRoom from "@/components/ChatRoom";
import {useEffect} from "react";

export default function ChatRoomPage() {
    let { roomName } = useParams(); // récupère le paramètre d'URL
    if (typeof roomName === "string") {
        roomName = roomName.replace("%20", " ");
    }
    const pseudo = window.localStorage.getItem("pseudo") || "";

    useEffect(() => {
        if (typeof window === "undefined") return;
        try {
        } catch (e) {
            // En cas de restriction d'accès au storage, on reste sur les valeurs par défaut
            console.warn("Impossible de lire localStorage:", e);
        }
    }, []);

    return <ChatRoom roomName={roomName as string} pseudo={pseudo} />;
}
