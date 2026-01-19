'use client';

import { useEffect, useState } from "react";

type Coords = { lat: number; lng: number } | null;

export default function Home() {
    const [coords, setCoords] = useState<Coords>(null);
    const [status, setStatus] = useState<
        'idle' | 'locating' | 'success' | 'denied' | 'unavailable' | 'error' | 'offline'
    >('idle');
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [vibrateAvailable, setVibrateAvailable] = useState<boolean>(false);
    const vibrateSOS = () => {
        if (!vibrateAvailable) return;
        navigator.vibrate([
            100, 30, 100, 30, 100, 30, 200, 30, 200, 30, 200, 30, 100, 30, 100, 30, 100,
        ]);
    };

    // Détection du support des vibrations
    useEffect(() => {
        const hasVibrate = navigator.vibrate(100);
        setVibrateAvailable(hasVibrate);
    }, []);

    // Fonction utilitaire pour demander la position
    const requestPosition = () => {
        setStatus('locating');
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords;
                setCoords({ lat: latitude, lng: longitude });
                setStatus('success');
            },
            (err) => {
                if (err.code === err.PERMISSION_DENIED) {
                    setStatus('denied');
                    setErrorMsg("Vous devez autoriser la géolocalisation pour afficher la carte.");
                } else if (err.code === err.POSITION_UNAVAILABLE) {
                    setStatus('error');
                    setErrorMsg("Position indisponible. Veuillez réessayer.");
                } else if (err.code === err.TIMEOUT) {
                    setStatus('error');
                    setErrorMsg("La demande de géolocalisation a expiré. Réessayez.");
                } else {
                    setStatus('error');
                    setErrorMsg("Erreur de géolocalisation inattendue.");
                }
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
    };

    useEffect(() => {
        if (!('geolocation' in navigator)) {
            setStatus('unavailable');
            return;
        }
        if (!navigator.onLine) {
            setStatus('offline');
            return;
        }

        requestPosition();
    }, []);

    // Abonne les listeners online/offline pour relancer la géolocalisation automatiquement
    useEffect(() => {
        const handleOnline = () => {
            if (!('geolocation' in navigator)) {
                setStatus('unavailable');
                return;
            }
            requestPosition();
        };

        const handleOffline = () => {
            setStatus('offline');
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const hasMap = status === 'success' && coords;

    return (
        <div className="p-6">
            <button
                onClick={vibrateSOS}
                disabled={!vibrateAvailable}
                aria-disabled={!vibrateAvailable}
                className={`mt-2 px-3 py-1.5 rounded transition text-white 
                    ${vibrateAvailable ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-400 cursor-not-allowed'}`}
            >
                S.O.S en vibration
            </button>

            {!vibrateAvailable && (
                <p className="text-red-600">La vibration n&apos;est pas disponible sur votre support.</p>
            )}

            <h1 className="text-2xl font-bold mb-4">Votre position</h1>

            {status === 'locating' && (
                <p className="text-gray-600">Localisation en cours…</p>
            )}

            {status === 'unavailable' && (
                <p className="text-red-600">La géolocalisation n&apos;est pas supportée par votre navigateur.</p>
            )}

            {status === 'offline' && (
                <p className="text-red-600">Vous n&apos;êtes pas connecté à internet, la géolocalisation ne sera pas disponible.</p>
            )}

            {(status === 'denied' || status === 'error') && (
                <div className="text-red-600">
                    {errorMsg || "Impossible d&#39;obtenir votre position. Autorisez la géolocalisation et réessayez."}
                </div>
            )}

            {hasMap && (
                <div className="space-y-4">
                    <p className="text-sm text-gray-700">
                        Coordonnées: lat {coords!.lat.toFixed(6)}, lng {coords!.lng.toFixed(6)}
                    </p>
                    <div className="w-full aspect-video rounded border overflow-hidden">
                        {/* Utilisation d'un embed Google Maps sans clé: simple et efficace */}
                        <iframe
                            title="Carte"
                            className="w-full h-full"
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            src={`https://maps.google.com/maps?q=${coords!.lat},${coords!.lng}&z=15&output=embed`}
                        />
                    </div>
                </div>
            )}

            {!hasMap && status !== 'locating' && status !== 'unavailable' && status !== 'offline' && (
                <p className="text-gray-700 mt-4">
                    Veuillez accepter la géolocalisation pour afficher la carte.
                </p>
            )}
        </div>
    );
}
