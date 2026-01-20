'use client';

import RoomList from "@/components/roomList";
import CameraComponent from "@/components/cameraComponent";

export default function Reception() {
    return (
        <div className="p-6">
            <CameraComponent/>
            <RoomList/>
        </div>
    );
}
