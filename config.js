module.exports = {
    botName: "Iris",
    theme: "Otaku 🌸",
    welcomeMessage: "Kon'nichiwa, je suis Iris, ton bot otaku ! 🍙",
    rules: [
        "Respect entre nakama ⚔️",
        "Pas de spam 🚫",
        "Partage d'animes et mangas bienvenus ✨"
    ],
    info: "Iris est un bot otaku créé pour gérer la communauté WhatsApp. Tape 'menu' pour voir les commandes disponibles.",
    menu: [
        "1️⃣ Règles",
        "2️⃣ Infos",
        "3️⃣ Contact admin",
        "4️⃣ Derniers animes recommandés 🎬"
    ],
    animeQuotes: [
        "« Je ne vais jamais abandonner ! » – Naruto 🌀",
        "« Je vais devenir le Roi des Pirates ! » – Luffy ☠️",
        "« La peur n'est qu'une illusion. » – Rengoku 🔥"
    ],

    // ── AI Configuration ────────────────────────────────────────────────────────
    aiConfig: {
        enabled: true,
        learningEnabled: true,
        personality: "friendly otaku bot"
    },

    // ── Games Configuration ─────────────────────────────────────────────────────
    gamesConfig: {
        enabled: true,
        scheduleTime: "20:00", // 8 PM
        games: ["animeQuiz", "waifuGuess", "mangaTrivia", "shippingGame"]
    },

    // ── Anime Topic Pattern Responses ───────────────────────────────────────────
    animeTopics: [
        { keyword: "naruto",          response: "Naruto est un classique ! 🌀 Quel est ton arc préféré ?" },
        { keyword: "one piece",       response: "Luffy va devenir Roi des Pirates ! ☠️ T'es fan de quel personnage ?" },
        { keyword: "dragon ball",     response: "KAMEHAMEHA ! 🐉 Goku ou Vegeta, qui est le meilleur selon toi ?" },
        { keyword: "demon slayer",    response: "Nezuko-chan est trop mignonne ! 🎋 Quel Pilier tu préfères ?" },
        { keyword: "attack on titan", response: "Tatakae ! ⚔️ La fin d'AoT t'a surpris(e) ?" },
        { keyword: "jujutsu",         response: "Gojo Satoru est imbattable ! 😎 Ton personnage JJK préféré ?" },
        { keyword: "fullmetal",       response: "Equivalent Exchange ! ⚗️ FMA Brotherhood est un chef-d'œuvre !" },
        { keyword: "bleach",          response: "Bankai ! ⚔️ Quel personnage de Bleach tu préfères ?" },
        { keyword: "fairy tail",      response: "Nakama power ! 🔥 Quelle guilde tu rejoindrais dans Fairy Tail ?" },
        { keyword: "sword art",       response: "SAO a lancé la mode des isekai ! 🗡️ Tu préfères quel arc ?" },
        { keyword: "re:zero",         response: "Subaru souffre tellement... 💔 Team Rem ou Team Emilia ?" },
        { keyword: "konosuba",        response: "EXPLOSION ! 💥 Megumin est la meilleure, non ? 😂" },
        { keyword: "my hero",         response: "PLUS ULTRA ! 💪 Quel Quirk tu voudrais avoir ?" },
        { keyword: "hunter x hunter", response: "Gon et Killua sont les meilleurs nakamas ! ⚡ T'en es où dans HxH ?" },
        { keyword: "waifu",           response: "Ah, un homme de culture ! 💕 Qui est ta waifu préférée ?" },
        { keyword: "husbando",        response: "Ara ara~ un husbando de qualité ! 💙 Qui est l'élu ?" },
        { keyword: "manga",           response: "Le manga, c'est la vie ! 📚 Tu lis quoi en ce moment ?" },
        { keyword: "cosplay",         response: "Le cosplay c'est trop bien ! 🎭 Tu as déjà cosplayé un personnage ?" },
        { keyword: "opening",         response: "Les openings d'anime sont incroyables ! 🎵 Quel est ton préféré ?" },
        { keyword: "ost",             response: "Les OST d'anime donnent des frissons ! 🎶 Ton OST préféré ?" }
    ]
}
