'use client';
import {useEffect, useState} from "react";

export default function Galleries() {
    const [photos, setPhotos] = useState([]);

    useEffect(() => {
        const savedPhotos = JSON.parse(localStorage.getItem('photos') || '[]');
        setPhotos(savedPhotos);
    }, []);

    const removePhotos = () => {
        if (confirm("Supprimer toutes les photos sauvegardées ?")) {
            localStorage.removeItem("photos");
            setPhotos([]);
        }
    };


    return (
        <div className="p-6 text-center">
            <h1 className="text-2xl font-bold mb-6">Galerie de photos</h1>
    {
        photos.length === 0 ? (
            <p className="text-center text-gray-500">Aucune photo enregistrée.</p>
        ) : (
            <>
                <button
                    onClick={removePhotos}
                    className="mt-2 bg-red-600 text-white px-3 py-1.5 rounded hover:bg-red-700 transition"
                >
                    📸 Supprimer les photos
                </button>
                <div
                    className="grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                    {photos.map((photo, index) => (
                        <div
                            key={index}
                            className="overflow-hidden rounded-lg shadow-mdborder border-gray-300 hover:scale-105 hover:shadow-xl transition duration-300ease-in-out">
                            <img
                                src={photo}
                                alt={`Photo ${index + 1}`}
                                className="w-full h-48 object-cover"/>
                        </div>
                    ))}
                </div>
            </>
            )}
        </div>
    );
}