export interface RoomClient {
    pseudo: string | { username: string; photo?: string | null };
    roomName: string;
    initiator?: boolean;
}

export interface RoomInfo {
    clients: Record<string, RoomClient>;
}

export interface RoomsData {
    [roomName: string]: RoomInfo;
}

export interface RoomsResponse {
    success: boolean;
    metadata: { time: string };
    data: RoomsData;
}

export interface MessageSend {
    content: string;
    dateEmis?: Date;
    roomName: string;
}

export interface MessageReceived {
    content: string;
    dateEmis?: Date;
    roomName: string;
    pseudo: string;
    serverId: string;
    categorie: string;
}