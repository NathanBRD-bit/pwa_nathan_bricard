'use client';

import Link from 'next/link';
import {useEffect, useState} from "react";
export default function Header() {
    // Niveau de batterie (0-100) et état de charge
    const [levelBattery, setLevelBattery] = useState<number | null>(null);
    const [isCharging, setIsCharging] = useState<boolean | null>(null);
    const [batterySupported, setBatterySupported] = useState<boolean>(true);

    // Types minimaux pour le Battery Status API (certains navigateurs ne l'exposent plus)
    type BatteryLike = {
        level: number; // 0..1
        charging: boolean;
        addEventListener: (type: string, listener: () => void) => void;
        removeEventListener: (type: string, listener: () => void) => void;
        onlevelchange?: () => void;
        onchargingchange?: () => void;
    };

    useEffect(() => {
        let batteryRef: BatteryLike | null = null;
        let levelListener: (() => void) | null = null;
        let chargingListener: (() => void) | null = null;

        async function initBattery() {
            try {
                type NavigatorWithBattery = Navigator & { getBattery?: () => Promise<BatteryLike> };
                const navWithBattery = navigator as NavigatorWithBattery;
                if (!navWithBattery || typeof navWithBattery.getBattery !== 'function') {
                    setBatterySupported(false);
                    return;
                }
                const battery: BatteryLike = await navWithBattery.getBattery!();
                batteryRef = battery;

                // Valeurs initiales
                setLevelBattery(Math.round((battery.level ?? 0) * 100));
                setIsCharging(battery.charging);

                // Abonnements
                levelListener = () => setLevelBattery(Math.round((battery.level ?? 0) * 100));
                chargingListener = () => setIsCharging(battery.charging);

                battery.addEventListener('levelchange', levelListener);
                battery.addEventListener('chargingchange', chargingListener);
            } catch (e) {
                // API battery non disponible
                setBatterySupported(false);
            }
        }

        initBattery();

        return () => {
            if (batteryRef) {
                if (levelListener) batteryRef.removeEventListener('levelchange', levelListener);
                if (chargingListener) batteryRef.removeEventListener('chargingchange', chargingListener);
            }
        };
    }, []);

    return (
        <header className="bg-blue-600 text-white shadow-md">
            <nav className="container mx-auto flex justify-between items-center p-4">

                <div className="text-2xl font-bold tracking-wide">
                    NextPWA
                </div>

                <div className="flex gap-6 items-center">
                    <Link href="/" className="hover:text-gray-200 transition-colors">Home</Link>
                    <Link href="/reception" className="hover:text-gray-200 transition-colors">Reception</Link>
                    <Link href="/galleries" className="hover:text-gray-200 transition-colors">Galeries photo</Link>
                    <Link href="/camera" className="hover:text-gray-200 transition-colors">Camera</Link>
                    {/* Indicateur batterie (si supporté) */}
                    {batterySupported && levelBattery !== null && (
                        <span
                            title={isCharging ? "Batterie en charge" : "Batterie"}
                            className="ml-2 inline-flex items-center gap-1 text-sm bg-white/10 px-2 py-1 rounded"
                        >
                            {/* Icône simple batterie */}
                            <span aria-hidden className="inline-block w-4 h-2 bg-white rounded-sm relative">
                                <span
                                    className="absolute left-0 top-0 h-2 bg-green-400 rounded-sm"
                                    style={{ width: `${Math.max(0, Math.min(100, levelBattery))}%` }}
                                />
                            </span>
                            <span>{levelBattery}%{isCharging ? ' ⚡' : ''}</span>
                        </span>
                    )}
                </div>

            </nav>
        </header>

    );
}
