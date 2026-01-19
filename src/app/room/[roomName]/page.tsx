"use client";

import { useParams } from "next/navigation";
import ChatRoom from "@/components/ChatRoom";

export default function ChatRoomPage() {
    const { roomName } = useParams(); // récupère le paramètre d'URL
    const pseudo = localStorage.getItem("pseudo") || "";

    return <ChatRoom roomName={roomName as string} pseudo={pseudo} />;
}
