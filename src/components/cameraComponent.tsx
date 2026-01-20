
"use client";
import { useEffect, useRef, useState } from "react";
import { socket } from "@/socket";
import Image from "next/image";

interface CameraComponentProps {
    // Nom de la room cible. S'il est fourni, on affiche un bouton pour l'envoyer dans la room.
    roomName?: string;
}

export default function CameraCapture({ roomName }: CameraComponentProps) {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        const el = videoRef.current;
        let stream: MediaStream | null = null;

        async function initCamera() {
            if (!isCameraOn) return;
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (el) {
                    el.srcObject = stream;
                }
            } catch (err) {
                console.error("Erreur accès caméra:", err);
                alert("Impossible d'accéder à la caméra.");
            }
        }

        initCamera();
        return () => {
            if (stream) {
                stream.getTracks().forEach((t) => t.stop());
            } else if (el && el.srcObject) {
                (el.srcObject as MediaStream).getTracks().forEach((t) => t.stop());
            }
        };
    }, [isCameraOn]);

    async function notifyPhotoTaken() {
        try {
            if (typeof window === "undefined") return;
            const supportsNotification = "Notification" in window;
            const supportsSW = "serviceWorker" in navigator;
            if (!supportsNotification) return;

            let permission = Notification.permission;
            if (permission === "default") {
                permission = await Notification.requestPermission();
            }
            if (permission !== "granted") return;

            const options: NotificationOptions = {
                body: "Votre photo a été sauvegardée. Cliquez pour ouvrir la galerie.",
                icon: "/favicon.ico",
                badge: "/favicon.ico",
                tag: "photo-taken",
                data: { url: "/galleries" },
            };

            if (supportsSW) {
                const reg = await navigator.serviceWorker.ready;
                await reg.showNotification("Photo enregistrée", options);
            } else {
                new Notification("Photo enregistrée", options);
            }
        } catch (e) {
            console.warn("Notification non envoyée:", e);
        }
    }

    const takePicture = () => {
        if (!videoRef.current) return;
        const canvas = document.createElement("canvas");
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL("image/jpeg");
        setPhoto(imageDataUrl);

        // Sauvegarde locale simple
        const savedPhotos = JSON.parse(localStorage.getItem("photos") || "[]");
        savedPhotos.push(imageDataUrl);
        localStorage.setItem("photos", JSON.stringify(savedPhotos));
        localStorage.setItem("lastPhoto", JSON.stringify(imageDataUrl));

        notifyPhotoTaken();
    };

    const sendPhotoToRoom = () => {
        if (!photo) return;
        if (!roomName) {
            alert("Aucune room spécifiée pour l'envoi.");
            return;
        }
        try {
            // Réutilise l'event de chat standard: le backend doit relayer aux membres de la room
            socket.emit("chat-msg", { content: photo, roomName });
        } catch (e) {
            console.warn("Échec d'envoi de la photo:", e);
        }
    };

    return (
        <div className="flex flex-col items-center gap-6">
            {!isCameraOn ? (
                <button
                    onClick={() => setIsCameraOn(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                >
                    🎥 Ouvrir la caméra
                </button>
            ) : (
                <>
                    <button
                        onClick={() => setIsCameraOn(false)}
                        className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                    >
                        🎥 Fermer la camera
                    </button>
                    <div className="flex flex-row items-start gap-6">
                        <div className="flex flex-col items-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="rounded-lg shadow-md w-64 h-48 border border-gray-300"
                            />
                            <button
                                onClick={takePicture}
                                className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                            >
                                📸 Prendre une photo
                            </button>
                        </div>

                        {photo && (
                            <div className="flex flex-col items-center">
                                <h3 className="text-sm font-medium mb-2">Photo prise :</h3>
                                <Image
                                    src={photo}
                                    alt="Captured"
                                    width={256}
                                    height={192}
                                    className="rounded shadow-md w-64 h-48 object-cover border border-gray-300"
                                    unoptimized
                                />
                                {roomName && (
                                    <button
                                        onClick={sendPhotoToRoom}
                                        className="mt-2 bg-indigo-600 text-white px-3 py-1.5 rounded hover:bg-indigo-700 transition"
                                        title={"Envoyer dans la room " + roomName}
                                    >
                                        🚀 Envoyer dans la room
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
