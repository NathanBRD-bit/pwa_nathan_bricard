"use client";

import { useParams } from "next/navigation";
import ChatRoom from "@/components/ChatRoom";

export default function ChatRoomPage() {
    let { roomName } = useParams(); // récupère le paramètre d'URL
    if (typeof roomName === "string") {
        while (roomName?.includes("%20")) {
            roomName = roomName.replace("%20", " ");
        }
    }
    const pseudo = window.localStorage.getItem("pseudo") || "";

    return <ChatRoom roomName={roomName as string} pseudo={pseudo} />;
}
