'use client';
import {useRef, useEffect, useState} from 'react';

export default function CameraComponent() {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [photo, setPhoto] = useState<string | null>(null);

    useEffect(() => {
        async function initCamera() {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;

                }
            } catch (err) {
                console.error('Erreur accès caméra:', err);
            }
        }

        initCamera();
    }, []);

    const takePicture = () => {
        if (!videoRef.current) {
            return;
        }
        const canvas = document.createElement('canvas');
        canvas.width = videoRef.current.videoWidth;
        canvas.height = videoRef.current.videoHeight;
        const context = canvas.getContext('2d');
        if (!context) {
            return;
        }
        context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        const imageToDataURL = canvas.toDataURL('image/jpeg');
        setPhoto(imageToDataURL);
        const savedPhotos = JSON.parse(localStorage.getItem('photos') || '[]');
        savedPhotos.push(imageToDataURL);
        localStorage.setItem('photos', JSON.stringify(savedPhotos));
    }

    return (
        <div className="flex flex-col items-center gap-4">
            <div className="flex flex-row gap-6 items-start">
                <div className="flex flex-col items-center">
                    <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        className="rounded-lg shadow-md w-80 h-60 border border-gray-300"
                    />
                    <button
                        onClick={takePicture}
                        className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                    >
                        Take Picture
                    </button>
                </div>

                {photo && (
                    <div className="flex flex-col items-center">
                        <h3 className="text-lg font-semibold mb-2">Dernière photo :</h3>
                        <img
                            src={photo}
                            alt="Captured"
                            className="rounded shadow-md w-80 h-60 object-cover"
                        />
                    </div>
                )}
            </div>
        </div>
    );

}
