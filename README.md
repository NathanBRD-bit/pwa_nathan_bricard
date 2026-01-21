# Chat avec websocket en PWA

Ce projet utilise NextJS 16.1 et TailwindCSS.

## Description

Cette application est un **chat en PWA avec un service worker**, avec un serveur socketIO pour la communication entre les utilisateurs.
Plusieurs autres fonctionnalités sont disponibles pour montrer ce que peut faire un PWA online et offline à l'aide des APIs du navigateur : 
- Notification Push
- Vibration ( si disponible sur votre appareil )
- Géolocalisation
- Caméra et prise de photo synchronisée hors ligne
- Affichage batterie

### Une PWA, c'est quoi ?

Une PWA (Progressive Web App) est une application web **qui peut être installée
sur votre appareil** pour donner donner à l'utilisateur une expérience plus "App" qu'un site web classique.

### Un service worker, c'est quoi ?

Un service worker permet d'implémenter un support en offline. Il fait effet de proxy, il intercepte les différentes
requêtes réseau. Quand l'utilisateur est offline et qu'il fait une requête, le service worker répond avec son cache.
Il peut aussi conserver les requêtes réseau pour les exécuter quand l'utilisateur passe à nouveau online.

## Pré-requis à l'installation en local

- Node.js 20.9+
- TypeScript 5+
- Navigateurs compatible: Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+
- Yarn / npm / pnpm

## Installation

1. Créer un dossier qui accueillera le projet

```bash
mkdir pwa-project
cd pwa-project
```

2. Cloner le repository Git 
```bash
git clone https://github.com/NathanBRD-bit/pwa_nathan_bricard.git
```

3. Builder le projet

```bash
next build
```

4. Lancer le projet
```bash
npm start
```

## Docker (simple)

Un Dockerfile simple est fourni à la racine permettant de conteneuriser l'application.

### Pré-requis

- Docker
- Docker Compose

Construire l'image:

```bash
docker build -t pwa-nathan-bricard .
```

Lancer le conteneur:

```bash
docker run -p 3000:3000 pwa-nathan-bricard
```


## Ressources pour les APIs navigateurs

- [Navigateur getCurrentPosition](https://developer.mozilla.org/fr/docs/Web/API/Geolocation/getCurrentPosition)
- [Navigateur Vibrate](https://developer.mozilla.org/fr/docs/Web/API/Navigator/vibrate)
- [Navigateur battery](https://developer.mozilla.org/en-US/docs/Web/API/Navigator/getBattery)
- [Service worker notification push](https://developer.mozilla.org/fr/docs/Web/API/ServiceWorkerRegistration/showNotification)
- [Navigateur Caméra](https://developer.mozilla.org/fr/docs/Web/API/Navigator/getUserMedia)
