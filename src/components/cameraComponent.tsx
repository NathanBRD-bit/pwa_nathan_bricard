'use client';
import { useState, useEffect, useRef } from "react";

export default function CameraCapture() {
    const [isCameraOn, setIsCameraOn] = useState(false);
    const [photo, setPhoto] = useState<string | null>(null);
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        async function initCamera() {
            if (!isCameraOn) return;
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Erreur accès caméra:", err);
                alert("Impossible d'accéder à la caméra.");
            }
        }

        initCamera();
        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream)
                    .getTracks()
                    .forEach(track => track.stop());
            }
        };
    }, [isCameraOn]);

    async function notifyPhotoTaken(previewUrl?: string) {
        try {
            if (typeof window === "undefined") return;
            // Vérifie le support des notifications
            const supportsNotification = "Notification" in window;
            const supportsSW = "serviceWorker" in navigator;

            if (!supportsNotification) return;

            // Demande la permission si nécessaire
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
                renotify: true,
                data: { url: "/galleries" },
                // L'image d'aperçu peut ne pas être supportée partout
                image: previewUrl,
                vibrate: [100, 50, 100],
            };

            if (supportsSW) {
                const reg = await navigator.serviceWorker.ready;
                await reg.showNotification("Photo enregistrée", options);
            } else {
                // Fallback direct si pas de SW
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

        // Sauvegarde locale
        const savedPhotos = JSON.parse(localStorage.getItem("photos") || "[]");
        savedPhotos.push(imageDataUrl);
        localStorage.setItem("photos", JSON.stringify(savedPhotos));
        localStorage.setItem("lastPhoto", JSON.stringify(imageDataUrl));

        // Notification PWA (si supportée)
        notifyPhotoTaken(imageDataUrl);
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
                        {/* Caméra */}
                        <div className="flex flex-col items-center">
                            <video
                                ref={videoRef}
                                autoPlay
                                playsInline
                                className="rounded-lg shadow-md w-64 h-48 border border-gray-300"/>
                            <button
                                onClick={takePicture}
                                className="mt-2 bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition"
                            >
                                📸 Prendre une photo
                            </button>
                        </div>

                        {/* Photo prise */}
                        {photo && (
                            <div className="flex flex-col items-center">
                                <h3 className="text-sm font-medium mb-2">Photo prise :</h3>
                                <img
                                    src={photo}
                                    alt="Captured"
                                    className="rounded shadow-md w-64 h-48 object-cover border border-gray-300"/>
                            </div>
                        )}
                    </div>
                </>
    )
}
</div>
)
    ;
}
