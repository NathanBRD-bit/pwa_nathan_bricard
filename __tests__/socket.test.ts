import { describe, expect, it, vi } from "vitest";

// On mock la librairie socket.io-client pour éviter toute requête réseau réelle
vi.mock("socket.io-client", () => {
  return {
    io: vi.fn(() => ({
      // On simule une connexion déjà établie
      connected: true,
      on: vi.fn(),
      emit: vi.fn(),
      off: vi.fn(),
      disconnect: vi.fn(),
    })),
  };
});

// L'import doit se faire APRÈS le mock pour que `socket` utilise le io mocké
import { socket } from "@/socket";
import { io } from "socket.io-client";

describe("socket.js", () => {
  it("appelle io() avec la bonne URL et les bons transports et retourne une socket connectée", () => {
    // Vérifie que io a bien été appelé avec l'URL
    expect(io).toHaveBeenCalledWith("https://api.tools.gavago.fr/", {
      transports: ["websocket"],
    });

    // Vérifie que notre instance mockée renvoie une connexion établie
    expect(socket.connected).toBe(true);
  });
});
