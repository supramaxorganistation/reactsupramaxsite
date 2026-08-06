# Supramax Server

Ce dossier contient un petit serveur Express pour proxy les appels API du site.

## Installation

Depuis la racine du projet :

```bash
cd server
npm install
```

## Configuration

Copiez le fichier d'exemple et renseignez vos clés :

```bash
cp .env.example .env
```

Le fichier .env doit contenir :

```env
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-1.5-flash
OPENROUTER_API_KEY=your_openrouter_api_key_here
RECAPTCHA_SECRET_KEY=your_recaptcha_secret_key_here
WEB3FORMS_KEY=your_web3forms_key_here
SERVER_PORT=4000
```

## Lancement

```bash
npm start
```

Le serveur sera disponible sur http://localhost:4000 par défaut.
