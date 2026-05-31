/**
 * @fileoverview Data Configuration and Initial State
 * @description Stores the global configuration, metadata, and default mock data for the application.
 * @module js/data
 */

/**
 * Endpoint URL to integration with Google Sheets (via Google Apps Script)
 * @type {string}
 */
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhthL2A0ogv2ZSszyz8a5XdB4WPMgQIYFbFQRW8foqNW2DSz2AxHGRMAHOXZK8lyBfYA/exec";

/**
 * Metadata definition for each Sport category, including representative emoji, label name, and description.
 * @type {Object.<string, {emoji: string, label: string, desc: string}>}
 */
const sportMeta = {
  "sepak bola": { emoji: "⚽", label: "Sepak Bola",  desc: "Pemain lapangan hijau terbaik" },
  "basket":     { emoji: "🏀", label: "Basket",      desc: "Pemain hardcourt profesional" },
  "badminton":  { emoji: "🏸", label: "Badminton",   desc: "Atlet bulu tangkis andalan" },
  "renang":     { emoji: "🏊", label: "Renang",      desc: "Perenang berprestasi nasional" },
  "esports":    { emoji: "🎮", label: "E-Sports",    desc: "Pemain kompetitif papan atas" },
  "atletik":    { emoji: "🏃", label: "Atletik",     desc: "Atlet lari dan lompat terbaik" },
};

/**
 * Initial dataset of professional athletes.
 * @type {Array.<{id: number, name: string, emoji: string, sport: string, pos: string, age: number, rating: number, goals: number, assists: number, price: number, photo: ?string}>}
 */
let athletes = [
  {
    id: 1,
    name: "Cristiano Ronaldo",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Striker",
    age: 39,
    rating: 9.8,
    goals: 900,
    assists: 250,
    price: 150000000,
    photo: "/assets/images/CR7.jpeg"
  },
  {
    id: 2,
    name: "Lionel Messi",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Penyerang",
    age: 37,
    rating: 9.9,
    goals: 850,
    assists: 380,
    price: 145000000,
    photo: "/assets/images/Messi.jpeg"
  },
  {
    id: 13,
    name: "Erling Haaland",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Striker",
    age: 24,
    rating: 9.6,
    goals: 250,
    assists: 60,
    price: 120000000,
    photo: "/assets/images/haland.jpeg"
  },
  {
    id: 14,
    name: "Kylian Mbappe",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Penyerang",
    age: 25,
    rating: 9.7,
    goals: 310,
    assists: 150,
    price: 130000000,
    photo: "/assets/images/mbape.jpeg"
  },
  {
    id: 15,
    name: "Pratama Arhan",
    emoji: "⚽",
    sport: "sepak bola",
    pos: "Bek Kiri",
    age: 22,
    rating: 8.5,
    goals: 15,
    assists: 45,
    price: 45000000,
    photo: "/assets/images/arhan.jpeg"
  },
  {
    id: 3,
    name: "Anthony Sinisuka Ginting",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putra",
    age: 27,
    rating: 9.4,
    goals: 40,
    assists: 0,
    price: 50000000,
    photo: "/assets/images/ginting_badminton.jpeg"
  },
  {
    id: 4,
    name: "Jonatan Christie",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putra",
    age: 26,
    rating: 9.3,
    goals: 38,
    assists: 0,
    price: 48000000,
    photo: "/assets/images/jonathan_badminton.jpeg"
  },
  {
    id: 19,
    name: "An Se Young",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putri",
    age: 22,
    rating: 9.8,
    goals: 50,
    assists: 0,
    price: 60000000,
    photo: "/assets/images/seyoung_badminton.jpeg"
  },
  {
    id: 20,
    name: "Tai Tzu Ying",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putri",
    age: 29,
    rating: 9.7,
    goals: 48,
    assists: 0,
    price: 58000000,
    photo: "/assets/images/tzuying_badminton.jpeg"
  },
  {
    id: 21,
    name: "Viktor Axelsen",
    emoji: "🏸",
    sport: "badminton",
    pos: "Tunggal Putra",
    age: 30,
    rating: 9.9,
    goals: 55,
    assists: 0,
    price: 65000000,
    photo: "assets/images/viktor_badminton.jpeg"
  },
  {
    id: 5,
    name: "Stephen Curry",
    emoji: "🏀",
    sport: "basket",
    pos: "Point Guard",
    age: 36,
    rating: 9.6,
    goals: 30,
    assists: 45,
    price: 150000000,
    photo: "/assets/images/curry_basket.jpeg"
  },
  {
    id: 6,
    name: "LeBron James",
    emoji: "🏀",
    sport: "basket",
    pos: "Small Forward",
    age: 39,
    rating: 9.8,
    goals: 28,
    assists: 60,
    price: 160000000,
    photo: "/assets/images/James_basket.jpeg"
  },
  {
    id: 16,
    name: "Kevin Durant",
    emoji: "🏀",
    sport: "basket",
    pos: "Power Forward",
    age: 35,
    rating: 9.5,
    goals: 32,
    assists: 30,
    price: 140000000,
    photo: "/assets/images/kevin_basket.jpeg"
  },
  {
    id: 17,
    name: "Nikola Jokic",
    emoji: "🏀",
    sport: "basket",
    pos: "Center",
    age: 29,
    rating: 9.9,
    goals: 25,
    assists: 70,
    price: 155000000,
    photo: "/assets/images/nikola_basket.jpeg"
  },
  {
    id: 18,
    name: "Marques Bolden",
    emoji: "🏀",
    sport: "basket",
    pos: "Center",
    age: 26,
    rating: 8.5,
    goals: 18,
    assists: 20,
    price: 40000000,
    photo: "/assets/images/marques_basket.jpeg"
  },
  {
    id: 7,
    name: "Adam Peaty",
    emoji: "🏊",
    sport: "renang",
    pos: "Gaya Dada 100m",
    age: 29,
    rating: 9.7,
    goals: 20,
    assists: 0,
    price: 45000000,
    photo: "/assets/images/adam_renang.jpeg"
  },
  {
    id: 8,
    name: "Caeleb Dressel",
    emoji: "🏊",
    sport: "renang",
    pos: "Gaya Kupu-kupu 100m",
    age: 27,
    rating: 9.8,
    goals: 25,
    assists: 0,
    price: 55000000,
    photo: "/assets/images/caleb_renang.jpeg"
  },
  {
    id: 22,
    name: "Katie Ledecky",
    emoji: "🏊",
    sport: "renang",
    pos: "Gaya Bebas 800m",
    age: 27,
    rating: 9.9,
    goals: 30,
    assists: 0,
    price: 60000000,
    photo: "/assets/images/ketie_renang.jpeg"
  },
  {
    id: 23,
    name: "Michael Phelps",
    emoji: "🏊",
    sport: "renang",
    pos: "Gaya Ganti 200m",
    age: 38,
    rating: 10.0,
    goals: 50,
    assists: 0,
    price: 150000000,
    photo: "/assets/images/michele_renang.jpeg"
  },
  {
    id: 9,
    name: "Faker",
    emoji: "🎮",
    sport: "esports",
    pos: "Mid Laner",
    age: 28,
    rating: 9.9,
    goals: 120,
    assists: 200,
    price: 150000000,
    photo: "/assets/images/faker_game.jpeg"
  },
  {
    id: 10,
    name: "Kairi",
    emoji: "🎮",
    sport: "esports",
    pos: "Jungler",
    age: 18,
    rating: 9.8,
    goals: 150,
    assists: 90,
    price: 80000000,
    photo: "/assets/images/kairi_game.jpeg"
  },
  {
    id: 24,
    name: "Kelra",
    emoji: "🎮",
    sport: "esports",
    pos: "Gold Laner",
    age: 19,
    rating: 9.3,
    goals: 110,
    assists: 70,
    price: 50000000,
    photo: "/assets/images/kelra_game.jpeg"
  },
  {
    id: 25,
    name: "Kiboy",
    emoji: "🎮",
    sport: "esports",
    pos: "Roamer",
    age: 21,
    rating: 9.5,
    goals: 30,
    assists: 300,
    price: 65000000,
    photo: "/assets/images/kiboy_game.jpeg"
  },
  {
    id: 26,
    name: "Sanz",
    emoji: "🎮",
    sport: "esports",
    pos: "Mid Laner",
    age: 21,
    rating: 9.6,
    goals: 95,
    assists: 210,
    price: 70000000,
    photo: "/assets/images/sanz_game.jpeg"
  },
  {
    id: 27,
    name: "Savero",
    emoji: "🎮",
    sport: "esports",
    pos: "Gold Laner",
    age: 23,
    rating: 9.4,
    goals: 105,
    assists: 85,
    price: 60000000,
    photo: "/assets/images/savero_game.jpeg"
  },
  {
    id: 11,
    name: "Armand Duplantis",
    emoji: "🏃",
    sport: "atletik",
    pos: "Lompat Galah",
    age: 24,
    rating: 9.9,
    goals: 62,
    assists: 0,
    price: 80000000,
    photo: "/assets/images/armand_atletik.jpeg"
  },
  {
    id: 12,
    name: "Usain Bolt",
    emoji: "🏃",
    sport: "atletik",
    pos: "Lari 100m",
    age: 37,
    rating: 10.0,
    goals: 95,
    assists: 0,
    price: 150000000,
    photo: "/assets/images/bolt_atletik.jpeg"
  },
  {
    id: 28,
    name: "Sha'Carri Richardson",
    emoji: "🏃",
    sport: "atletik",
    pos: "Lari 100m",
    age: 24,
    rating: 9.5,
    goals: 25,
    assists: 0,
    price: 55000000,
    photo: "/assets/images/cari_atletik.jpeg"
  },
  {
    id: 29,
    name: "Eliud Kipchoge",
    emoji: "🏃",
    sport: "atletik",
    pos: "Marathon",
    age: 39,
    rating: 9.8,
    goals: 40,
    assists: 0,
    price: 90000000,
    photo: "/assets/images/Eliud_atletik.jpeg"
  },
  {
    id: 30,
    name: "Lalu Muhammad Zohri",
    emoji: "🏃",
    sport: "atletik",
    pos: "Lari 100m",
    age: 23,
    rating: 8.9,
    goals: 15,
    assists: 0,
    price: 35000000,
    photo: "/assets/images/lalu_atletik.jpeg"
  }
];
