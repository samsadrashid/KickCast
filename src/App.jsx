import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase";

// ─── THEME ───────────────────────────────────────────────────────────────────
const DARK_T = {
  navy: "#0A1931",
  navyMid: "#0F2847",
  navyLight: "#162F55",
  gold: "#B4FF02",
  goldLight: "#C8FF3A",
  red: "#E63946",
  white: "#F5F0E8",
  gray: "#8A9BB5",
  grayDark: "#3A4F6E",
  green: "#2ECC71",
};

const LIGHT_T = {
  navy: "#F0F4F8",
  navyMid: "#FFFFFF",
  navyLight: "#DDE3ED",
  gold: "#014E46",
  goldLight: "#016B5F",
  red: "#DC2626",
  white: "#1E293B",
  gray: "#5A6A80",
  grayDark: "#B8C4D4",
  green: "#15803D",
};

// Mutable reference — mutated before re-render so all components see new values
const T = { ...DARK_T };

const makeGlobalStyle = (t) => `
  @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;800;900&family=Barlow:wght@300;400;500;600&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${t.navy}; color: ${t.white}; font-family: 'Barlow', sans-serif; }
  ::-webkit-scrollbar { width: 4px; height: 4px; }
  ::-webkit-scrollbar-track { background: ${t.navy}; }
  ::-webkit-scrollbar-thumb { background: ${t.grayDark}; border-radius: 2px; }
  .slider-row::-webkit-scrollbar { display: none; }
  .topbar-trophy { display: none; }
  @media (min-width: 768px) { .topbar-trophy { display: block; } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
  @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
  @keyframes countUp { from { transform: scale(0.8); opacity:0; } to { transform: scale(1); opacity:1; } }

  /* ── Responsive layout ── */
  .wc-root { max-width: 430px; margin: 0 auto; display: flex; flex-direction: column;
    overflow: hidden; height: 100vh; height: 100dvh; }
  @media (min-width: 768px) {
    .wc-root { max-width: 100% !important; display: grid !important;
      grid-template-columns: 1fr; grid-template-rows: 56px 1fr;
      grid-template-areas: "topbar" "content";
      height: 100vh; height: 100dvh; }
    .wc-topbar   { grid-area: topbar; z-index: 50; }
    .wc-sidebar  { display: none !important; }
    .wc-content  { grid-area: content; overflow-y: auto; min-height: 0; }
    .wc-inner { max-width: 100%; margin: 0 auto; width: 100%; }
    .wc-bottomnav { display: flex !important; }
    .wc-drawer { width: 520px !important; }
    .drawer-info-grid { display: grid; grid-template-columns: 1fr 1fr; column-gap: 20px; }
    .wc-sidebar-btn { display: flex; align-items: center; gap: 12px; padding: 12px 14px;
      border-radius: 10px; border: none; cursor: pointer; width: 100%; text-align: left;
      font-family: 'Barlow Condensed', sans-serif; font-weight: 700; font-size: 15px;
      letter-spacing: 0.5px; background: transparent; color: ${t.gray}; transition: all 0.15s; }
    .wc-sidebar-btn.active { background: ${t.gold}22; color: ${t.gold}; }
    .wc-sidebar-btn:hover:not(.active) { background: ${t.navyLight}; color: ${t.white}; }
  }
  @media (min-width: 1200px) {
    .wc-inner { max-width: 1200px; margin: 0 auto; }
  }

  /* Floating bottom nav */
  .wc-bottomnav { position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
    z-index: 50; border-radius: 14px; max-width: calc(100vw - 32px);
    box-shadow: 0 8px 32px rgba(0,0,0,0.4), 0 2px 8px rgba(0,0,0,0.25); }

  /* Score predictions responsive */
  .pred-grid { display: flex; gap: 10px; overflow-x: auto; scrollbar-width: none;
    -webkit-overflow-scrolling: touch; padding-bottom: 6px; }
  .pred-grid::-webkit-scrollbar { display: none; }
  .pred-card { min-width: 220px; flex-shrink: 0; }
  @media (min-width: 600px) {
    .pred-grid { display: grid; grid-template-columns: 1fr 1fr; overflow-x: visible; }
    .pred-card { min-width: 0; flex-shrink: unset; }
  }
  @media (min-width: 1024px) {
    .pred-grid { grid-template-columns: 1fr 1fr 1fr; }
  }
`;

// ─── 2026 WORLD CUP DATA ──────────────────────────────────────────────────────
const GROUPS = {
  A: { teams: ["Mexico", "South Africa", "South Korea", "Czechia"] },
  B: { teams: ["Canada", "Bosnia-Herzegovina", "Qatar", "Switzerland"] },
  C: { teams: ["Brazil", "Morocco", "Haiti", "Scotland"] },
  D: { teams: ["United States", "Paraguay", "Australia", "Türkiye"] },
  E: { teams: ["Germany", "Curaçao", "Ivory Coast", "Ecuador"] },
  F: { teams: ["Netherlands", "Japan", "Sweden", "Tunisia"] },
  G: { teams: ["Belgium", "Iran", "Egypt", "New Zealand"] },
  H: { teams: ["Spain", "Saudi Arabia", "Uruguay", "Cape Verde"] },
  I: { teams: ["France", "Senegal", "Iraq", "Norway"] },
  J: { teams: ["Argentina", "Algeria", "Austria", "Jordan"] },
  K: { teams: ["Portugal", "Congo DR", "Uzbekistan", "Colombia"] },
  L: { teams: ["England", "Croatia", "Ghana", "Panama"] },
};

const TEAM_DATA = {
  USA: { flag: "🇺🇸", kit: ["#B22234","#FFFFFF"], rank: 13, conf: "CONCACAF",
    squad: [
      { name:"Matt Turner",        pos:"GK",  club:"Nottm Forest",       xi:true  },
      { name:"Ethan Horvath",      pos:"GK",  club:"Cardiff City",       xi:false },
      { name:"Patrick Schulte",    pos:"GK",  club:"Columbus Crew",      xi:false },
      { name:"Tim Ream",           pos:"DEF", club:"Charlotte FC",       xi:true  },
      { name:"Sergino Dest",       pos:"DEF", club:"PSV Eindhoven",      xi:true  },
      { name:"Chris Richards",     pos:"DEF", club:"Crystal Palace",     xi:true  },
      { name:"Miles Robinson",     pos:"DEF", club:"Atlanta United",     xi:true  },
      { name:"Joe Scally",         pos:"DEF", club:"B. Monchengladbach", xi:false },
      { name:"DeJuan Jones",       pos:"DEF", club:"New England Rev",    xi:false },
      { name:"Sam Vines",          pos:"DEF", club:"Royal Antwerp",      xi:false },
      { name:"Tyler Adams",        pos:"MID", club:"Bournemouth",        xi:true  },
      { name:"Weston McKennie",    pos:"MID", club:"Juventus",           xi:true  },
      { name:"Yunus Musah",        pos:"MID", club:"AC Milan",           xi:true  },
      { name:"Luca de la Torre",   pos:"MID", club:"Celta Vigo",         xi:false },
      { name:"Johnny Cardoso",     pos:"MID", club:"Real Betis",         xi:false },
      { name:"Gio Reyna",          pos:"MID", club:"Nottm Forest",       xi:true  },
      { name:"Christian Pulisic",  pos:"FWD", club:"AC Milan",           xi:true  },
      { name:"Timothy Weah",       pos:"FWD", club:"Juventus",           xi:true  },
      { name:"Josh Sargent",       pos:"FWD", club:"Norwich City",       xi:true  },
      { name:"Folarin Balogun",    pos:"FWD", club:"Monaco",             xi:true  },
      { name:"Ricardo Pepi",       pos:"FWD", club:"PSV Eindhoven",      xi:false },
      { name:"Daryl Dike",         pos:"FWD", club:"West Brom",          xi:false },
      { name:"Brandon Vazquez",    pos:"FWD", club:"FC Cincinnati",      xi:false },
      { name:"Malik Tillman",      pos:"MID", club:"PSV Eindhoven",      xi:false },
      { name:"Caden Clark",        pos:"MID", club:"RB Leipzig",         xi:false },
      { name:"Brenden Aaronson",   pos:"MID", club:"Union Berlin",       xi:false },
    ]
  },
  Argentina: { flag: "🇦🇷", kit: ["#74ACDF","#FFFFFF"], rank: 1, conf: "CONMEBOL",
    squad: [
      { name:"Emiliano Martinez",  pos:"GK",  club:"Aston Villa",        xi:true  },
      { name:"Geronimo Rulli",     pos:"GK",  club:"Marseille",          xi:false },
      { name:"Franco Armani",      pos:"GK",  club:"River Plate",        xi:false },
      { name:"Cristian Romero",    pos:"DEF", club:"Tottenham",          xi:true  },
      { name:"Nicolas Otamendi",   pos:"DEF", club:"Benfica",            xi:true  },
      { name:"Lisandro Martinez",  pos:"DEF", club:"Man United",         xi:true  },
      { name:"Nahuel Molina",      pos:"DEF", club:"Atletico Madrid",    xi:true  },
      { name:"Marcos Acuna",       pos:"DEF", club:"Sevilla",            xi:true  },
      { name:"Nicolas Tagliafico", pos:"DEF", club:"Lyon",               xi:false },
      { name:"German Pezzella",    pos:"DEF", club:"Real Betis",         xi:false },
      { name:"Rodrigo De Paul",    pos:"MID", club:"Atletico Madrid",    xi:true  },
      { name:"Enzo Fernandez",     pos:"MID", club:"Chelsea",            xi:true  },
      { name:"Alexis Mac Allister",pos:"MID", club:"Liverpool",          xi:true  },
      { name:"Leandro Paredes",    pos:"MID", club:"Roma",               xi:false },
      { name:"Exequiel Palacios",  pos:"MID", club:"Bayer Leverkusen",   xi:false },
      { name:"Guido Rodriguez",    pos:"MID", club:"Real Betis",         xi:false },
      { name:"Lionel Messi",       pos:"FWD", club:"Inter Miami",        xi:true  },
      { name:"Julian Alvarez",     pos:"FWD", club:"Atletico Madrid",    xi:true  },
      { name:"Angel Di Maria",     pos:"FWD", club:"Benfica",            xi:true  },
      { name:"Thiago Almada",      pos:"FWD", club:"Atlanta United",     xi:false },
      { name:"Nicolas Gonzalez",   pos:"FWD", club:"Juventus",           xi:false },
      { name:"Alejandro Garnacho", pos:"FWD", club:"Man United",         xi:false },
      { name:"Lautaro Martinez",   pos:"FWD", club:"Inter Milan",        xi:false },
      { name:"Paulo Dybala",       pos:"FWD", club:"Roma",               xi:false },
      { name:"Giovani Lo Celso",   pos:"MID", club:"Villarreal",         xi:false },
      { name:"Facundo Medina",     pos:"DEF", club:"Lens",               xi:false },
    ]
  },
  Brazil: { flag: "🇧🇷", kit: ["#009C3B","#FFDF00"], rank: 5, conf: "CONMEBOL",
    squad: [
      { name:"Alisson Becker",     pos:"GK",  club:"Liverpool",          xi:true  },
      { name:"Ederson",            pos:"GK",  club:"Man City",           xi:false },
      { name:"Weverton",           pos:"GK",  club:"Palmeiras",          xi:false },
      { name:"Eder Militao",       pos:"DEF", club:"Real Madrid",        xi:true  },
      { name:"Marquinhos",         pos:"DEF", club:"PSG",                xi:true  },
      { name:"Gabriel Magalhaes",  pos:"DEF", club:"Arsenal",            xi:true  },
      { name:"Danilo",             pos:"DEF", club:"Juventus",           xi:true  },
      { name:"Alex Sandro",        pos:"DEF", club:"Juventus",           xi:false },
      { name:"Renan Lodi",         pos:"DEF", club:"Nottm Forest",       xi:false },
      { name:"Bremer",             pos:"DEF", club:"Juventus",           xi:false },
      { name:"Casemiro",           pos:"MID", club:"Man United",         xi:true  },
      { name:"Bruno Guimaraes",    pos:"MID", club:"Newcastle",          xi:true  },
      { name:"Lucas Paqueta",      pos:"MID", club:"West Ham",           xi:true  },
      { name:"Fred",               pos:"MID", club:"Man United",         xi:false },
      { name:"Fabinho",            pos:"MID", club:"Al Ittihad",         xi:false },
      { name:"Gerson",             pos:"MID", club:"Marseille",          xi:false },
      { name:"Vinicius Jr",        pos:"FWD", club:"Real Madrid",        xi:true  },
      { name:"Rodrygo",            pos:"FWD", club:"Real Madrid",        xi:true  },
      { name:"Raphinha",           pos:"FWD", club:"Barcelona",          xi:true  },
      { name:"Endrick",            pos:"FWD", club:"Real Madrid",        xi:true  },
      { name:"Gabriel Martinelli", pos:"FWD", club:"Arsenal",            xi:false },
      { name:"Antony",             pos:"FWD", club:"Man United",         xi:false },
      { name:"Gabriel Jesus",      pos:"FWD", club:"Arsenal",            xi:false },
      { name:"Richarlison",        pos:"FWD", club:"Tottenham",          xi:false },
      { name:"Andreas Pereira",    pos:"MID", club:"Fulham",             xi:false },
      { name:"Yan Couto",          pos:"DEF", club:"Man City",           xi:false },
    ]
  },
  France: { flag: "🇫🇷", kit: ["#002395","#FFFFFF"], rank: 2, conf: "UEFA",
    squad: [
      { name:"Mike Maignan",       pos:"GK",  club:"AC Milan",           xi:true  },
      { name:"Alphonse Areola",    pos:"GK",  club:"West Ham",           xi:false },
      { name:"Brice Samba",        pos:"GK",  club:"Lens",               xi:false },
      { name:"Raphael Varane",     pos:"DEF", club:"Como",               xi:true  },
      { name:"Dayot Upamecano",    pos:"DEF", club:"Bayern Munich",      xi:true  },
      { name:"Ibrahima Konate",    pos:"DEF", club:"Liverpool",          xi:true  },
      { name:"Theo Hernandez",     pos:"DEF", club:"AC Milan",           xi:true  },
      { name:"Jules Kounde",       pos:"DEF", club:"Barcelona",          xi:true  },
      { name:"Benjamin Pavard",    pos:"DEF", club:"Inter Milan",        xi:false },
      { name:"William Saliba",     pos:"DEF", club:"Arsenal",            xi:false },
      { name:"Aurelien Tchouameni",pos:"MID", club:"Real Madrid",        xi:true  },
      { name:"Eduardo Camavinga",  pos:"MID", club:"Real Madrid",        xi:true  },
      { name:"Adrien Rabiot",      pos:"MID", club:"Marseille",          xi:false },
      { name:"Warren Zaire-Emery", pos:"MID", club:"PSG",                xi:false },
      { name:"Matteo Guendouzi",   pos:"MID", club:"Marseille",          xi:false },
      { name:"Youssouf Fofana",    pos:"MID", club:"AC Milan",           xi:false },
      { name:"Kylian Mbappe",      pos:"FWD", club:"Real Madrid",        xi:true  },
      { name:"Antoine Griezmann",  pos:"FWD", club:"Atletico Madrid",    xi:true  },
      { name:"Olivier Giroud",     pos:"FWD", club:"LA Galaxy",          xi:true  },
      { name:"Ousmane Dembele",    pos:"FWD", club:"PSG",                xi:true  },
      { name:"Marcus Thuram",      pos:"FWD", club:"Inter Milan",        xi:false },
      { name:"Randal Kolo Muani",  pos:"FWD", club:"PSG",                xi:false },
      { name:"Kingsley Coman",     pos:"FWD", club:"Bayern Munich",      xi:false },
      { name:"Bradley Barcola",    pos:"FWD", club:"PSG",                xi:false },
      { name:"Jonathan Clauss",    pos:"DEF", club:"Marseille",          xi:false },
      { name:"Olivier Boscagli",   pos:"DEF", club:"PSV Eindhoven",      xi:false },
    ]
  },
  England: { flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", kit: ["#FFFFFF","#012169"], rank: 5, conf: "UEFA",
    squad: [
      { name:"Jordan Pickford",    pos:"GK",  club:"Everton",            xi:true  },
      { name:"Aaron Ramsdale",     pos:"GK",  club:"Southampton",        xi:false },
      { name:"Dean Henderson",     pos:"GK",  club:"Crystal Palace",     xi:false },
      { name:"Kyle Walker",        pos:"DEF", club:"Man City",           xi:true  },
      { name:"John Stones",        pos:"DEF", club:"Man City",           xi:true  },
      { name:"Harry Maguire",      pos:"DEF", club:"Man United",         xi:true  },
      { name:"Luke Shaw",          pos:"DEF", club:"Man United",         xi:true  },
      { name:"Kieran Trippier",    pos:"DEF", club:"Newcastle",          xi:true  },
      { name:"Marc Guehi",         pos:"DEF", club:"Crystal Palace",     xi:false },
      { name:"Ezri Konsa",         pos:"DEF", club:"Aston Villa",        xi:false },
      { name:"Declan Rice",        pos:"MID", club:"Arsenal",            xi:true  },
      { name:"Jude Bellingham",    pos:"MID", club:"Real Madrid",        xi:true  },
      { name:"Phil Foden",         pos:"MID", club:"Man City",           xi:true  },
      { name:"Conor Gallagher",    pos:"MID", club:"Atletico Madrid",    xi:false },
      { name:"Trent A-Arnold",     pos:"MID", club:"Real Madrid",        xi:false },
      { name:"Adam Wharton",       pos:"MID", club:"Crystal Palace",     xi:false },
      { name:"Harry Kane",         pos:"FWD", club:"Bayern Munich",      xi:true  },
      { name:"Bukayo Saka",        pos:"FWD", club:"Arsenal",            xi:true  },
      { name:"Marcus Rashford",    pos:"FWD", club:"Man United",         xi:false },
      { name:"Ollie Watkins",      pos:"FWD", club:"Aston Villa",        xi:false },
      { name:"Anthony Gordon",     pos:"FWD", club:"Newcastle",          xi:false },
      { name:"Cole Palmer",        pos:"FWD", club:"Chelsea",            xi:false },
      { name:"Eberechi Eze",       pos:"FWD", club:"Crystal Palace",     xi:false },
      { name:"Ivan Toney",         pos:"FWD", club:"Al Ahli",            xi:false },
      { name:"Curtis Jones",       pos:"MID", club:"Liverpool",          xi:false },
      { name:"Jarrod Bowen",       pos:"FWD", club:"West Ham",           xi:false },
    ]
  },
  Germany: { flag: "🇩🇪", kit: ["#000000","#FFFFFF"], rank: 16, conf: "UEFA",
    squad: [
      { name:"Manuel Neuer",       pos:"GK",  club:"Bayern Munich",      xi:true  },
      { name:"Marc ter Stegen",    pos:"GK",  club:"Barcelona",          xi:false },
      { name:"Oliver Baumann",     pos:"GK",  club:"Hoffenheim",         xi:false },
      { name:"Antonio Rudiger",    pos:"DEF", club:"Real Madrid",        xi:true  },
      { name:"Nico Schlotterbeck", pos:"DEF", club:"Borussia Dortmund",  xi:true  },
      { name:"Jonathan Tah",       pos:"DEF", club:"Bayer Leverkusen",   xi:true  },
      { name:"Joshua Kimmich",     pos:"MID", club:"Bayern Munich",      xi:true  },
      { name:"David Raum",         pos:"DEF", club:"RB Leipzig",         xi:true  },
      { name:"Waldemar Anton",     pos:"DEF", club:"Borussia Dortmund",  xi:false },
      { name:"Benjamin Henrichs",  pos:"DEF", club:"RB Leipzig",         xi:false },
      { name:"Toni Kroos",         pos:"MID", club:"Real Madrid",        xi:true  },
      { name:"Leon Goretzka",      pos:"MID", club:"Bayern Munich",      xi:true  },
      { name:"Ilkay Gundogan",     pos:"MID", club:"Barcelona",          xi:true  },
      { name:"Emre Can",           pos:"MID", club:"Borussia Dortmund",  xi:false },
      { name:"Pascal Gross",       pos:"MID", club:"Brighton",           xi:false },
      { name:"Robert Andrich",     pos:"MID", club:"Bayer Leverkusen",   xi:false },
      { name:"Leroy Sane",         pos:"FWD", club:"Bayern Munich",      xi:true  },
      { name:"Kai Havertz",        pos:"FWD", club:"Arsenal",            xi:true  },
      { name:"Thomas Muller",      pos:"FWD", club:"Bayern Munich",      xi:true  },
      { name:"Florian Wirtz",      pos:"FWD", club:"Bayer Leverkusen",   xi:false },
      { name:"Serge Gnabry",       pos:"FWD", club:"Bayern Munich",      xi:false },
      { name:"Jamal Musiala",      pos:"FWD", club:"Bayern Munich",      xi:false },
      { name:"Niclas Fullkrug",    pos:"FWD", club:"West Ham",           xi:false },
      { name:"Chris Fuhrich",      pos:"FWD", club:"VfB Stuttgart",      xi:false },
      { name:"Maximilian Beier",   pos:"FWD", club:"Borussia Dortmund",  xi:false },
      { name:"Granit Xhaka",       pos:"MID", club:"Bayer Leverkusen",   xi:false },
    ]
  },
  Spain: { flag: "🇪🇸", kit: ["#AA151B","#F1BF00"], rank: 8, conf: "UEFA",
    squad: [
      { name:"Unai Simon",         pos:"GK",  club:"Athletic Bilbao",    xi:true  },
      { name:"David Raya",         pos:"GK",  club:"Arsenal",            xi:false },
      { name:"Alex Remiro",        pos:"GK",  club:"Real Sociedad",      xi:false },
      { name:"Dani Carvajal",      pos:"DEF", club:"Real Madrid",        xi:true  },
      { name:"Aymeric Laporte",    pos:"DEF", club:"Al Nassr",           xi:true  },
      { name:"Robin Le Normand",   pos:"DEF", club:"Atletico Madrid",    xi:true  },
      { name:"Alejandro Grimaldo", pos:"DEF", club:"Bayer Leverkusen",   xi:true  },
      { name:"Jules Kounde",       pos:"DEF", club:"Barcelona",          xi:true  },
      { name:"Nacho Fernandez",    pos:"DEF", club:"Al Qadsiah",         xi:false },
      { name:"Pau Cubarsi",        pos:"DEF", club:"Barcelona",          xi:false },
      { name:"Rodri",              pos:"MID", club:"Man City",           xi:true  },
      { name:"Pedri",              pos:"MID", club:"Barcelona",          xi:true  },
      { name:"Gavi",               pos:"MID", club:"Barcelona",          xi:true  },
      { name:"Fabian Ruiz",        pos:"MID", club:"PSG",                xi:false },
      { name:"Martin Zubimendi",   pos:"MID", club:"Arsenal",            xi:false },
      { name:"Mikel Merino",       pos:"MID", club:"Arsenal",            xi:false },
      { name:"Lamine Yamal",       pos:"FWD", club:"Barcelona",          xi:true  },
      { name:"Nico Williams",      pos:"FWD", club:"Athletic Bilbao",    xi:true  },
      { name:"Alvaro Morata",      pos:"FWD", club:"AC Milan",           xi:true  },
      { name:"Dani Olmo",          pos:"FWD", club:"Barcelona",          xi:false },
      { name:"Ferran Torres",      pos:"FWD", club:"Barcelona",          xi:false },
      { name:"Mikel Oyarzabal",    pos:"FWD", club:"Real Sociedad",      xi:false },
      { name:"Joselu",             pos:"FWD", club:"Al Qadsiah",         xi:false },
      { name:"Bryan Gil",          pos:"FWD", club:"Girona",             xi:false },
      { name:"Alex Baena",         pos:"MID", club:"Villarreal",         xi:false },
      { name:"Marcos Llorente",    pos:"MID", club:"Atletico Madrid",    xi:false },
    ]
  },
  Portugal: { flag: "🇵🇹", kit: ["#006600","#FF0000"], rank: 6, conf: "UEFA",
    squad: [
      { name:"Diogo Costa",        pos:"GK",  club:"Porto",              xi:true  },
      { name:"Rui Patricio",       pos:"GK",  club:"Roma",               xi:false },
      { name:"Jose Sa",            pos:"GK",  club:"Wolves",             xi:false },
      { name:"Ruben Dias",         pos:"DEF", club:"Man City",           xi:true  },
      { name:"Pepe",               pos:"DEF", club:"Porto",              xi:true  },
      { name:"Joao Cancelo",       pos:"DEF", club:"Barcelona",          xi:true  },
      { name:"Raphael Guerreiro",  pos:"DEF", club:"Bayern Munich",      xi:true  },
      { name:"Nuno Mendes",        pos:"DEF", club:"PSG",                xi:true  },
      { name:"Goncalo Inacio",     pos:"DEF", club:"Sporting CP",        xi:false },
      { name:"Danilo Pereira",     pos:"DEF", club:"PSG",                xi:false },
      { name:"Bruno Fernandes",    pos:"MID", club:"Man United",         xi:true  },
      { name:"Vitinha",            pos:"MID", club:"PSG",                xi:true  },
      { name:"Joao Palhinha",      pos:"MID", club:"Bayern Munich",      xi:true  },
      { name:"Bernardo Silva",     pos:"MID", club:"Man City",           xi:false },
      { name:"Matheus Nunes",      pos:"MID", club:"Man City",           xi:false },
      { name:"Ruben Neves",        pos:"MID", club:"Al Hilal",           xi:false },
      { name:"Cristiano Ronaldo",  pos:"FWD", club:"Al Nassr",           xi:true  },
      { name:"Rafael Leao",        pos:"FWD", club:"AC Milan",           xi:true  },
      { name:"Goncalo Ramos",      pos:"FWD", club:"PSG",                xi:true  },
      { name:"Pedro Neto",         pos:"FWD", club:"Chelsea",            xi:false },
      { name:"Joao Felix",         pos:"FWD", club:"Chelsea",            xi:false },
      { name:"Diogo Jota",         pos:"FWD", club:"Liverpool",          xi:false },
      { name:"Francisco Conceicao",pos:"FWD", club:"Juventus",           xi:false },
      { name:"Andre Silva",        pos:"FWD", club:"RB Leipzig",         xi:false },
      { name:"Gedson Fernandes",   pos:"MID", club:"Benfica",            xi:false },
      { name:"Tiago Djalo",        pos:"DEF", club:"Juventus",           xi:false },
    ]
  },
  Netherlands: { flag: "🇳🇱", kit: ["#FF6600","#FFFFFF"], rank: 7, conf: "UEFA",
    squad: [
      { name:"Bart Verbruggen",    pos:"GK",  club:"Brighton",           xi:true  },
      { name:"Mark Flekken",       pos:"GK",  club:"Brentford",          xi:false },
      { name:"Remko Pasveer",      pos:"GK",  club:"Ajax",               xi:false },
      { name:"Virgil van Dijk",    pos:"DEF", club:"Liverpool",          xi:true  },
      { name:"Matthijs de Ligt",   pos:"DEF", club:"Man United",         xi:true  },
      { name:"Denzel Dumfries",    pos:"DEF", club:"Inter Milan",        xi:true  },
      { name:"Nathan Ake",         pos:"DEF", club:"Man City",           xi:true  },
      { name:"Daley Blind",        pos:"DEF", club:"Girona",             xi:false },
      { name:"Jurrien Timber",     pos:"DEF", club:"Arsenal",            xi:false },
      { name:"Stefan de Vrij",     pos:"DEF", club:"Inter Milan",        xi:false },
      { name:"Frenkie de Jong",    pos:"MID", club:"Barcelona",          xi:true  },
      { name:"Tijjani Reijnders",  pos:"MID", club:"AC Milan",           xi:true  },
      { name:"Teun Koopmeiners",   pos:"MID", club:"Juventus",           xi:true  },
      { name:"Marten de Roon",     pos:"MID", club:"Atalanta",           xi:false },
      { name:"Ryan Gravenberch",   pos:"MID", club:"Liverpool",          xi:false },
      { name:"Jerdy Schouten",     pos:"MID", club:"PSV Eindhoven",      xi:false },
      { name:"Cody Gakpo",         pos:"FWD", club:"Liverpool",          xi:true  },
      { name:"Memphis Depay",      pos:"FWD", club:"Atletico Madrid",    xi:true  },
      { name:"Donyell Malen",      pos:"FWD", club:"Borussia Dortmund",  xi:true  },
      { name:"Wout Weghorst",      pos:"FWD", club:"Hoffenheim",         xi:false },
      { name:"Steven Bergwijn",    pos:"FWD", club:"Ajax",               xi:false },
      { name:"Noa Lang",           pos:"FWD", club:"PSV Eindhoven",      xi:false },
      { name:"Brian Brobbey",      pos:"FWD", club:"Ajax",               xi:false },
      { name:"Xavi Simons",        pos:"MID", club:"RB Leipzig",         xi:false },
      { name:"Joey Veerman",       pos:"MID", club:"PSV Eindhoven",      xi:false },
      { name:"Ian Maatsen",        pos:"DEF", club:"Aston Villa",        xi:false },
    ]
  },
  Belgium: { flag: "🇧🇪", kit: ["#000000","#FF0000"], rank: 3, conf: "UEFA",
    squad: [
      { name:"Thibaut Courtois",   pos:"GK",  club:"Real Madrid",        xi:true  },
      { name:"Simon Mignolet",     pos:"GK",  club:"Club Brugge",        xi:false },
      { name:"Matz Sels",          pos:"GK",  club:"Nottm Forest",       xi:false },
      { name:"Toby Alderweireld",  pos:"DEF", club:"Royal Antwerp",      xi:true  },
      { name:"Jan Vertonghen",     pos:"DEF", club:"Anderlecht",         xi:true  },
      { name:"Thomas Meunier",     pos:"DEF", club:"Trabzonspor",        xi:true  },
      { name:"Arthur Theate",      pos:"DEF", club:"Rennes",             xi:true  },
      { name:"Timothy Castagne",   pos:"DEF", club:"Fulham",             xi:false },
      { name:"Wout Faes",          pos:"DEF", club:"Leicester",          xi:false },
      { name:"Zeno Debast",        pos:"DEF", club:"Sporting CP",        xi:false },
      { name:"Kevin De Bruyne",    pos:"MID", club:"Man City",           xi:true  },
      { name:"Axel Witsel",        pos:"MID", club:"Atletico Madrid",    xi:true  },
      { name:"Youri Tielemans",    pos:"MID", club:"Aston Villa",        xi:true  },
      { name:"Amadou Onana",       pos:"MID", club:"Aston Villa",        xi:false },
      { name:"Orel Mangala",       pos:"MID", club:"Lyon",               xi:false },
      { name:"Hans Vanaken",       pos:"MID", club:"Club Brugge",        xi:false },
      { name:"Romelu Lukaku",      pos:"FWD", club:"Roma",               xi:true  },
      { name:"Dries Mertens",      pos:"FWD", club:"Galatasaray",        xi:true  },
      { name:"Yannick Carrasco",   pos:"FWD", club:"Al Shabab",          xi:true  },
      { name:"Leandro Trossard",   pos:"FWD", club:"Arsenal",            xi:false },
      { name:"Lois Openda",        pos:"FWD", club:"RB Leipzig",         xi:false },
      { name:"Johan Bakayoko",     pos:"FWD", club:"PSV Eindhoven",      xi:false },
      { name:"Jeremy Doku",        pos:"FWD", club:"Man City",           xi:false },
      { name:"Charles De Ketelaere",pos:"FWD",club:"Atalanta",           xi:false },
      { name:"Nicolas Raskin",     pos:"MID", club:"Rangers",            xi:false },
      { name:"Julien Duranville",  pos:"FWD", club:"Borussia Dortmund",  xi:false },
    ]
  },
  Italy: { flag: "🇮🇹", kit: ["#003399","#FFFFFF"], rank: 9, conf: "UEFA",
    squad: [
      { name:"Gianluigi Donnarumma",pos:"GK", club:"PSG",               xi:true  },
      { name:"Alex Meret",         pos:"GK",  club:"Napoli",             xi:false },
      { name:"Guglielmo Vicario",  pos:"GK",  club:"Tottenham",          xi:false },
      { name:"Leonardo Bonucci",   pos:"DEF", club:"Fenerbahce",         xi:true  },
      { name:"Giovanni Di Lorenzo",pos:"DEF", club:"Napoli",             xi:true  },
      { name:"Alessandro Bastoni", pos:"DEF", club:"Inter Milan",        xi:true  },
      { name:"Federico Dimarco",   pos:"DEF", club:"Inter Milan",        xi:true  },
      { name:"Davide Calabria",    pos:"DEF", club:"AC Milan",           xi:false },
      { name:"Matteo Darmian",     pos:"DEF", club:"Inter Milan",        xi:false },
      { name:"Riccardo Calafiori", pos:"DEF", club:"Arsenal",            xi:false },
      { name:"Marco Verratti",     pos:"MID", club:"Al Arabi",           xi:true  },
      { name:"Nicolo Barella",     pos:"MID", club:"Inter Milan",        xi:true  },
      { name:"Jorginho",           pos:"MID", club:"Arsenal",            xi:true  },
      { name:"Sandro Tonali",      pos:"MID", club:"Newcastle",          xi:false },
      { name:"Samuele Ricci",      pos:"MID", club:"Torino",             xi:false },
      { name:"Lorenzo Pellegrini", pos:"MID", club:"Roma",               xi:false },
      { name:"Federico Chiesa",    pos:"FWD", club:"Liverpool",          xi:true  },
      { name:"Ciro Immobile",      pos:"FWD", club:"Lazio",              xi:true  },
      { name:"Lorenzo Insigne",    pos:"FWD", club:"Toronto FC",         xi:true  },
      { name:"Giacomo Raspadori",  pos:"FWD", club:"Napoli",             xi:false },
      { name:"Gianluca Scamacca",  pos:"FWD", club:"Atalanta",           xi:false },
      { name:"Matteo Politano",    pos:"FWD", club:"Napoli",             xi:false },
      { name:"Stephan El Shaarawy",pos:"FWD", club:"Roma",               xi:false },
      { name:"Moise Kean",         pos:"FWD", club:"Fiorentina",         xi:false },
      { name:"Davide Frattesi",    pos:"MID", club:"Inter Milan",        xi:false },
      { name:"Wilfried Gnonto",    pos:"FWD", club:"Leeds United",       xi:false },
    ]
  },
  Croatia: { flag: "🇭🇷", kit: ["#FF0000","#FFFFFF"], rank: 10, conf: "UEFA",
    squad: [
      { name:"Dominik Livakovic",  pos:"GK",  club:"Fenerbahce",         xi:true  },
      { name:"Ivo Grbic",          pos:"GK",  club:"Atletico Madrid",    xi:false },
      { name:"Nediljko Labrovic",  pos:"GK",  club:"Hajduk Split",       xi:false },
      { name:"Dejan Lovren",       pos:"DEF", club:"Zenit",              xi:true  },
      { name:"Josko Gvardiol",     pos:"DEF", club:"Man City",           xi:true  },
      { name:"Josip Stanisic",     pos:"DEF", club:"Bayer Leverkusen",   xi:true  },
      { name:"Borna Sosa",         pos:"DEF", club:"Ajax",               xi:true  },
      { name:"Domagoj Vida",       pos:"DEF", club:"AEK Athens",         xi:false },
      { name:"Martin Erlic",       pos:"DEF", club:"Sassuolo",           xi:false },
      { name:"Josip Juranovic",    pos:"DEF", club:"Union Berlin",       xi:false },
      { name:"Luka Modric",        pos:"MID", club:"Real Madrid",        xi:true  },
      { name:"Mateo Kovacic",      pos:"MID", club:"Man City",           xi:true  },
      { name:"Marcelo Brozovic",   pos:"MID", club:"Al Nassr",           xi:true  },
      { name:"Mario Pasalic",      pos:"MID", club:"Atalanta",           xi:false },
      { name:"Lovro Majer",        pos:"MID", club:"Rennes",             xi:false },
      { name:"Kristijan Jakic",    pos:"MID", club:"Eintracht Frankfurt", xi:false },
      { name:"Ivan Perisic",       pos:"FWD", club:"Hajduk Split",       xi:true  },
      { name:"Andrej Kramaric",    pos:"FWD", club:"Hoffenheim",         xi:true  },
      { name:"Bruno Petkovic",     pos:"FWD", club:"Dinamo Zagreb",      xi:true  },
      { name:"Nikola Vlasic",      pos:"FWD", club:"Torino",             xi:false },
      { name:"Mislav Orsic",       pos:"FWD", club:"Nottm Forest",       xi:false },
      { name:"Marko Livaja",       pos:"FWD", club:"Hajduk Split",       xi:false },
      { name:"Ante Budimir",       pos:"FWD", club:"Osasuna",            xi:false },
      { name:"Luka Ivanusec",      pos:"FWD", club:"Dinamo Zagreb",      xi:false },
      { name:"Josip Brekalo",      pos:"FWD", club:"Wolfsburg",          xi:false },
      { name:"Milan Badelj",       pos:"MID", club:"Lazio",              xi:false },
    ]
  },
  Morocco: { flag: "🇲🇦", kit: ["#C1272D","#006233"], rank: 12, conf: "CAF",
    squad: [
      { name:"Yassine Bounou",     pos:"GK",  club:"Al Hilal",           xi:true  },
      { name:"Munir Mohamedi",     pos:"GK",  club:"Al Wahda",           xi:false },
      { name:"Ahmed Reda Tagnaouti",pos:"GK", club:"Wydad",              xi:false },
      { name:"Achraf Hakimi",      pos:"DEF", club:"PSG",                xi:true  },
      { name:"Romain Saiss",       pos:"DEF", club:"Besiktas",           xi:true  },
      { name:"Nayef Aguerd",       pos:"DEF", club:"West Ham",           xi:true  },
      { name:"Noussair Mazraoui",  pos:"DEF", club:"Man United",         xi:true  },
      { name:"Yahia Attiyat Allah",pos:"DEF", club:"Wydad",              xi:false },
      { name:"Jawad El Yamiq",     pos:"DEF", club:"Real Valladolid",    xi:false },
      { name:"Adam Masina",        pos:"DEF", club:"Udinese",            xi:false },
      { name:"Sofyan Amrabat",     pos:"MID", club:"Man United",         xi:true  },
      { name:"Selim Amallah",      pos:"MID", club:"Standard Liege",     xi:true  },
      { name:"Azzedine Ounahi",    pos:"MID", club:"Marseille",          xi:true  },
      { name:"Bilal El Khannouss", pos:"MID", club:"Genk",               xi:false },
      { name:"Abdelhamid Sabiri",  pos:"MID", club:"Sampdoria",          xi:false },
      { name:"Yahya Jabrane",      pos:"MID", club:"Wydad",              xi:false },
      { name:"Hakim Ziyech",       pos:"FWD", club:"Galatasaray",        xi:true  },
      { name:"Youssef En-Nesyri",  pos:"FWD", club:"Fenerbahce",         xi:true  },
      { name:"Sofiane Boufal",     pos:"FWD", club:"Angers",             xi:true  },
      { name:"Zakaria Aboukhlal",  pos:"FWD", club:"Toulouse",           xi:false },
      { name:"Ayoub El Kaabi",     pos:"FWD", club:"Olympiakos",         xi:false },
      { name:"Ilias Chair",        pos:"FWD", club:"QPR",                xi:false },
      { name:"Amine Harit",        pos:"FWD", club:"Marseille",          xi:false },
      { name:"Ryan Mmaee",         pos:"FWD", club:"Ferencvaros",        xi:false },
      { name:"Tarik Tissoudali",   pos:"FWD", club:"Gent",               xi:false },
      { name:"Abderrazak Hamdallah",pos:"FWD",club:"Al Ittihad",         xi:false },
    ]
  },
  Mexico: { flag: "🇲🇽", kit: ["#006847","#FFFFFF"], rank: 15, conf: "CONCACAF",
    squad: [
      { name:"Guillermo Ochoa",    pos:"GK",  club:"Salernitana",        xi:true  },
      { name:"Rodolfo Cota",       pos:"GK",  club:"Leon",               xi:false },
      { name:"Luis Malagon",       pos:"GK",  club:"Club America",       xi:false },
      { name:"Cesar Montes",       pos:"DEF", club:"Espanyol",           xi:true  },
      { name:"Johan Vasquez",      pos:"DEF", club:"Cremonese",          xi:true  },
      { name:"Jorge Sanchez",      pos:"DEF", club:"Ajax",               xi:true  },
      { name:"Gerardo Arteaga",    pos:"DEF", club:"Getafe",             xi:true  },
      { name:"Jesus Gallardo",     pos:"DEF", club:"Monterrey",          xi:false },
      { name:"Nestor Araujo",      pos:"DEF", club:"Celta Vigo",         xi:false },
      { name:"Hector Moreno",      pos:"DEF", club:"Qatar SC",           xi:false },
      { name:"Edson Alvarez",      pos:"MID", club:"West Ham",           xi:true  },
      { name:"Hector Herrera",     pos:"MID", club:"Houston Dynamo",     xi:true  },
      { name:"Orbelín Pineda",     pos:"MID", club:"AEK Athens",         xi:true  },
      { name:"Carlos Rodriguez",   pos:"MID", club:"Cruz Azul",          xi:false },
      { name:"Luis Romo",          pos:"MID", club:"Monterrey",          xi:false },
      { name:"Erick Gutierrez",    pos:"MID", club:"PSV Eindhoven",      xi:false },
      { name:"Hirving Lozano",     pos:"FWD", club:"PSV Eindhoven",      xi:true  },
      { name:"Raul Jimenez",       pos:"FWD", club:"Fulham",             xi:true  },
      { name:"Henry Martin",       pos:"FWD", club:"Club America",       xi:true  },
      { name:"Roberto Alvarado",   pos:"FWD", club:"Guadalajara",        xi:false },
      { name:"Santiago Gimenez",   pos:"FWD", club:"Feyenoord",          xi:false },
      { name:"Alexis Vega",        pos:"FWD", club:"Guadalajara",        xi:false },
      { name:"Uriel Antuna",       pos:"FWD", club:"Cruz Azul",          xi:false },
      { name:"Julian Quinones",    pos:"FWD", club:"Club America",       xi:false },
      { name:"Alan Pulido",        pos:"FWD", club:"Sporting KC",        xi:false },
      { name:"Diego Lainez",       pos:"FWD", club:"Real Betis",         xi:false },
    ]
  },
  Senegal: { flag: "🇸🇳", kit: ["#00853F","#FFFFFF"], rank: 18, conf: "CAF",
    squad: [
      { name:"Edouard Mendy",      pos:"GK",  club:"Chelsea",            xi:true  },
      { name:"Alfred Gomis",       pos:"GK",  club:"Rennes",             xi:false },
      { name:"Seny Dieng",         pos:"GK",  club:"Middlesbrough",      xi:false },
      { name:"Kalidou Koulibaly",  pos:"DEF", club:"Chelsea",            xi:true  },
      { name:"Abdou Diallo",       pos:"DEF", club:"RB Leipzig",         xi:true  },
      { name:"Saliou Ciss",        pos:"DEF", club:"Nancy",              xi:true  },
      { name:"Formose Mendy",      pos:"DEF", club:"Amiens",             xi:true  },
      { name:"Pape Abou Cisse",    pos:"DEF", club:"Olympiakos",         xi:false },
      { name:"Bouna Sarr",         pos:"DEF", club:"Bayern Munich",      xi:false },
      { name:"Ibrahima Mbaye",     pos:"DEF", club:"Bologna",            xi:false },
      { name:"Idrissa Gueye",      pos:"MID", club:"Everton",            xi:true  },
      { name:"Nampalys Mendy",     pos:"MID", club:"Leicester",          xi:true  },
      { name:"Moussa Kouyate",     pos:"MID", club:"Crystal Palace",     xi:false },
      { name:"Pape Matar Sarr",    pos:"MID", club:"Tottenham",          xi:false },
      { name:"Lamine Camara",      pos:"MID", club:"Monaco",             xi:false },
      { name:"Cheikhou Kouyate",   pos:"MID", club:"Nottm Forest",       xi:false },
      { name:"Krepin Diatta",      pos:"FWD", club:"Monaco",             xi:true  },
      { name:"Sadio Mane",         pos:"FWD", club:"Al Nassr",           xi:true  },
      { name:"Famara Diedhiou",    pos:"FWD", club:"Alanyaspor",         xi:true  },
      { name:"Ismaila Sarr",       pos:"FWD", club:"Crystal Palace",     xi:false },
      { name:"Boulaye Dia",        pos:"FWD", club:"Salernitana",        xi:false },
      { name:"Nicolas Jackson",    pos:"FWD", club:"Chelsea",            xi:false },
      { name:"Habib Diallo",       pos:"FWD", club:"Strasbourg",         xi:false },
      { name:"Iliman Ndiaye",      pos:"FWD", club:"Marseille",          xi:false },
      { name:"Mamadou Loum",       pos:"MID", club:"Reading",            xi:false },
      { name:"Cheikh Niasse",      pos:"FWD", club:"Lorient",            xi:false },
    ]
  },
  Japan: { flag: "🇯🇵", kit: ["#003DA5","#FFFFFF"], rank: 20, conf: "AFC",
    squad: [
      { name:"Shuichi Gonda",      pos:"GK",  club:"Shimizu S-Pulse",    xi:true  },
      { name:"Kosei Tani",         pos:"GK",  club:"Shonan Bellmare",    xi:false },
      { name:"Daniel Schmidt",     pos:"GK",  club:"Sint-Truiden",       xi:false },
      { name:"Maya Yoshida",       pos:"DEF", club:"Schalke",            xi:true  },
      { name:"Ko Itakura",         pos:"DEF", club:"B. Monchengladbach", xi:true  },
      { name:"Hiroki Sakai",       pos:"DEF", club:"Urawa Reds",         xi:true  },
      { name:"Yuto Nagatomo",      pos:"DEF", club:"FC Tokyo",           xi:true  },
      { name:"Takehiro Tomiyasu",  pos:"DEF", club:"Arsenal",            xi:false },
      { name:"Shogo Taniguchi",    pos:"DEF", club:"Kawasaki",           xi:false },
      { name:"Miki Yamane",        pos:"DEF", club:"Kawasaki",           xi:false },
      { name:"Wataru Endo",        pos:"MID", club:"Liverpool",          xi:true  },
      { name:"Hidemasa Morita",    pos:"MID", club:"Sporting CP",        xi:true  },
      { name:"Ritsu Doan",         pos:"MID", club:"Freiburg",           xi:true  },
      { name:"Ao Tanaka",          pos:"MID", club:"Borussia Dortmund",  xi:false },
      { name:"Gaku Shibasaki",     pos:"MID", club:"Leganes",            xi:false },
      { name:"Soma Nakayama",      pos:"MID", club:"Gamba Osaka",        xi:false },
      { name:"Junya Ito",          pos:"FWD", club:"Reims",              xi:true  },
      { name:"Kaoru Mitoma",       pos:"FWD", club:"Brighton",           xi:true  },
      { name:"Daizen Maeda",       pos:"FWD", club:"Celtic",             xi:true  },
      { name:"Takumi Minamino",    pos:"FWD", club:"Monaco",             xi:false },
      { name:"Keito Nakamura",     pos:"FWD", club:"Reims",              xi:false },
      { name:"Ayase Ueda",         pos:"FWD", club:"Feyenoord",          xi:false },
      { name:"Kyogo Furuhashi",    pos:"FWD", club:"Celtic",             xi:false },
      { name:"Takefusa Kubo",      pos:"FWD", club:"Real Sociedad",      xi:false },
      { name:"Yuya Osako",         pos:"FWD", club:"Vissel Kobe",        xi:false },
      { name:"Shuto Machino",      pos:"FWD", club:"Shonan Bellmare",    xi:false },
    ]
  },
  "South Korea": { flag: "🇰🇷", kit: ["#C60C30","#FFFFFF"], rank: 23, conf: "AFC",
    squad: [
      { name:"Kim Seung-gyu",      pos:"GK",  club:"Vissel Kobe",        xi:true  },
      { name:"Jo Hyeon-woo",       pos:"GK",  club:"Ulsan HD",           xi:false },
      { name:"Song Bum-keun",      pos:"GK",  club:"Jeonbuk",            xi:false },
      { name:"Kim Min-jae",        pos:"DEF", club:"Bayern Munich",      xi:true  },
      { name:"Kim Young-gwon",     pos:"DEF", club:"Ulsan HD",           xi:true  },
      { name:"Kim Jin-su",         pos:"DEF", club:"Jeonbuk",            xi:true  },
      { name:"Lee Ki-je",          pos:"DEF", club:"Jeonbuk",            xi:true  },
      { name:"Yoon Jong-gyu",      pos:"DEF", club:"Suwon",              xi:false },
      { name:"Kwon Kyung-won",     pos:"DEF", club:"Ulsan HD",           xi:false },
      { name:"Lee Jae-ik",         pos:"DEF", club:"Gangwon",            xi:false },
      { name:"Jung Woo-young",     pos:"MID", club:"Al Qadsiah",         xi:true  },
      { name:"Hwang In-beom",      pos:"MID", club:"Rubin Kazan",        xi:true  },
      { name:"Lee Kang-in",        pos:"MID", club:"PSG",                xi:true  },
      { name:"Paik Seung-ho",      pos:"MID", club:"Jeonbuk",            xi:false },
      { name:"Son Jun-ho",         pos:"MID", club:"Lazio",              xi:false },
      { name:"Na Sang-ho",         pos:"MID", club:"FC Seoul",           xi:false },
      { name:"Son Heung-min",      pos:"FWD", club:"Tottenham",          xi:true  },
      { name:"Hwang Hee-chan",     pos:"FWD", club:"Wolves",             xi:true  },
      { name:"Cho Gue-sung",       pos:"FWD", club:"Midtjylland",        xi:true  },
      { name:"Hwang Ui-jo",        pos:"FWD", club:"Nottm Forest",       xi:false },
      { name:"Oh Hyeon-gyu",       pos:"FWD", club:"Celtic",             xi:false },
      { name:"Jeong Sang-bin",     pos:"FWD", club:"Freiburg",           xi:false },
      { name:"Bae Jun-ho",         pos:"MID", club:"Stoke City",         xi:false },
      { name:"Um Won-sang",        pos:"FWD", club:"Jeonbuk",            xi:false },
      { name:"Song Min-kyu",       pos:"FWD", club:"Jeonbuk",            xi:false },
      { name:"Kim Gun-hee",        pos:"FWD", club:"Jeonbuk",            xi:false },
    ]
  },
  Colombia: { flag: "🇨🇴", kit: ["#FCD116","#003087"], rank: 11, conf: "CONMEBOL",
    squad: [
      { name:"David Ospina",       pos:"GK",  club:"Al Nassr",           xi:true  },
      { name:"Camilo Vargas",      pos:"GK",  club:"Atlas",              xi:false },
      { name:"Alvaro Montero",     pos:"GK",  club:"Millonarios",        xi:false },
      { name:"Davinson Sanchez",   pos:"DEF", club:"Galatasaray",        xi:true  },
      { name:"Yerry Mina",         pos:"DEF", club:"Everton",            xi:true  },
      { name:"Daniel Munoz",       pos:"DEF", club:"Crystal Palace",     xi:true  },
      { name:"Johan Mojica",       pos:"DEF", club:"Girona",             xi:true  },
      { name:"Carlos Cuesta",      pos:"DEF", club:"Genk",               xi:false },
      { name:"William Tesillo",    pos:"DEF", club:"Leon",               xi:false },
      { name:"Stefan Medina",      pos:"DEF", club:"Monterrey",          xi:false },
      { name:"Wilmar Barrios",     pos:"MID", club:"Zenit",              xi:true  },
      { name:"Juan Cuadrado",      pos:"MID", club:"Inter Milan",        xi:true  },
      { name:"James Rodriguez",    pos:"MID", club:"Rayo Vallecano",     xi:true  },
      { name:"Mateus Uribe",       pos:"MID", club:"Porto",              xi:false },
      { name:"Gustavo Cuellar",    pos:"MID", club:"Al Hilal",           xi:false },
      { name:"Sebastian Perez",    pos:"MID", club:"Espanyol",           xi:false },
      { name:"Luis Diaz",          pos:"FWD", club:"Liverpool",          xi:true  },
      { name:"Rafael Santos Borre",pos:"FWD", club:"Eintracht Frankfurt", xi:true  },
      { name:"Radamel Falcao",     pos:"FWD", club:"Rayo Vallecano",     xi:true  },
      { name:"Jhon Cordoba",       pos:"FWD", club:"Krasnodar",          xi:false },
      { name:"Roger Martinez",     pos:"FWD", club:"Club America",       xi:false },
      { name:"Duvan Zapata",       pos:"FWD", club:"Torino",             xi:false },
      { name:"Jhon Duran",         pos:"FWD", club:"Aston Villa",        xi:false },
      { name:"Cucho Hernandez",    pos:"FWD", club:"Columbus Crew",      xi:false },
      { name:"Andres Andrade",     pos:"MID", club:"Cruzeiro",           xi:false },
      { name:"Oscar Estupinan",    pos:"FWD", club:"Watford",            xi:false },
    ]
  },
  Uruguay: { flag: "🇺🇾", kit: ["#5EB6E4","#FFFFFF"], rank: 17, conf: "CONMEBOL",
    squad: [
      { name:"Fernando Muslera",   pos:"GK",  club:"Galatasaray",        xi:true  },
      { name:"Sebastian Sosa",     pos:"GK",  club:"Independiente",      xi:false },
      { name:"Guillermo De Amores",pos:"GK",  club:"Penarol",            xi:false },
      { name:"Jose Maria Gimenez", pos:"DEF", club:"Atletico Madrid",    xi:true  },
      { name:"Ronald Araujo",      pos:"DEF", club:"Barcelona",          xi:true  },
      { name:"Mathias Olivera",    pos:"DEF", club:"Napoli",             xi:true  },
      { name:"Martin Caceres",     pos:"DEF", club:"Elche",              xi:true  },
      { name:"Sebastian Coates",   pos:"DEF", club:"Sporting CP",        xi:false },
      { name:"Nahitan Nandez",     pos:"DEF", club:"Cagliari",           xi:false },
      { name:"Diego Godin",        pos:"DEF", club:"Velez Sarsfield",    xi:false },
      { name:"Rodrigo Bentancur",  pos:"MID", club:"Tottenham",          xi:true  },
      { name:"Federico Valverde",  pos:"MID", club:"Real Madrid",        xi:true  },
      { name:"Lucas Torreira",     pos:"MID", club:"Galatasaray",        xi:true  },
      { name:"Matias Vecino",      pos:"MID", club:"Lazio",              xi:false },
      { name:"Manuel Ugarte",      pos:"MID", club:"Man United",         xi:false },
      { name:"Nicolas De La Cruz", pos:"MID", club:"Flamengo",           xi:false },
      { name:"Luis Suarez",        pos:"FWD", club:"Inter Miami",        xi:true  },
      { name:"Edinson Cavani",     pos:"FWD", club:"Boca Juniors",       xi:true  },
      { name:"Darwin Nunez",       pos:"FWD", club:"Liverpool",          xi:true  },
      { name:"Facundo Pellistri",  pos:"FWD", club:"Man United",         xi:false },
      { name:"Maxi Gomez",         pos:"FWD", club:"Spartak Moscow",     xi:false },
      { name:"Brian Rodriguez",    pos:"FWD", club:"America",            xi:false },
      { name:"Agustin Canobbio",   pos:"FWD", club:"Athletico-PR",       xi:false },
      { name:"Maximiliano Araujo", pos:"FWD", club:"Sporting CP",        xi:false },
      { name:"Gaston Pereiro",     pos:"MID", club:"Cagliari",           xi:false },
      { name:"Giorgian De Arrascaeta",pos:"MID",club:"Flamengo",         xi:false },
    ]
  },
  Nigeria: { flag: "🇳🇬", kit: ["#008751","#FFFFFF"], rank: 28, conf: "CAF",
    squad: [
      { name:"Francis Uzoho",      pos:"GK",  club:"Omonia",             xi:true  },
      { name:"Maduka Okoye",       pos:"GK",  club:"Udinese",            xi:false },
      { name:"John Noble",         pos:"GK",  club:"Dakkada",            xi:false },
      { name:"Kenneth Omeruo",     pos:"DEF", club:"Kasimpasa",          xi:true  },
      { name:"William Troost-Ekong",pos:"DEF",club:"Watford",            xi:true  },
      { name:"Tyronne Ebuehi",     pos:"DEF", club:"Empoli",             xi:true  },
      { name:"Zaidu Sanusi",       pos:"DEF", club:"Porto",              xi:true  },
      { name:"Ola Aina",           pos:"DEF", club:"Nottm Forest",       xi:false },
      { name:"Semi Ajayi",         pos:"DEF", club:"West Brom",          xi:false },
      { name:"Calvin Bassey",      pos:"DEF", club:"Fulham",             xi:false },
      { name:"Wilfred Ndidi",      pos:"MID", club:"Leicester",          xi:true  },
      { name:"Joe Aribo",          pos:"MID", club:"Southampton",        xi:true  },
      { name:"Frank Onyeka",       pos:"MID", club:"Brentford",          xi:false },
      { name:"Alex Iwobi",         pos:"MID", club:"Fulham",             xi:false },
      { name:"Fisayo Dele-Bashiru",pos:"MID", club:"Trabzonspor",        xi:false },
      { name:"Innocent Bonke",     pos:"MID", club:"Mallorca",           xi:false },
      { name:"Victor Osimhen",     pos:"FWD", club:"Napoli",             xi:true  },
      { name:"Kelechi Iheanacho",  pos:"FWD", club:"Leicester",          xi:true  },
      { name:"Samuel Chukwueze",   pos:"FWD", club:"AC Milan",           xi:true  },
      { name:"Taiwo Awoniyi",      pos:"FWD", club:"Nottm Forest",       xi:false },
      { name:"Cyriel Dessers",     pos:"FWD", club:"Rangers",            xi:false },
      { name:"Moses Simon",        pos:"FWD", club:"Nantes",             xi:false },
      { name:"Ademola Lookman",    pos:"FWD", club:"Atalanta",           xi:false },
      { name:"Paul Onuachu",       pos:"FWD", club:"Southampton",        xi:false },
      { name:"Terem Moffi",        pos:"FWD", club:"Nice",               xi:false },
      { name:"Emmanuel Dennis",    pos:"FWD", club:"Nottm Forest",       xi:false },
    ]
  },
  Canada: { flag: "🇨🇦", kit: ["#FF0000","#FFFFFF"], rank: 40, conf: "CONCACAF",
    squad: [
      { name:"Milan Borjan",       pos:"GK",  club:"Red Star Belgrade",  xi:true  },
      { name:"Maxime Crepeau",     pos:"GK",  club:"LA Galaxy",          xi:false },
      { name:"James Pantemis",     pos:"GK",  club:"CF Montreal",        xi:false },
      { name:"Steven Vitoria",     pos:"DEF", club:"SC Farense",         xi:true  },
      { name:"Kamal Miller",       pos:"DEF", club:"LAFC",               xi:true  },
      { name:"Richie Laryea",      pos:"DEF", club:"Nottm Forest",       xi:true  },
      { name:"Alistair Johnston",  pos:"DEF", club:"Celtic",             xi:true  },
      { name:"Derek Cornelius",    pos:"DEF", club:"Panathinaikos",      xi:false },
      { name:"Sam Adekugbe",       pos:"DEF", club:"Hatayspor",          xi:false },
      { name:"Doneil Henry",       pos:"DEF", club:"Houston Dynamo",     xi:false },
      { name:"Atiba Hutchinson",   pos:"MID", club:"Besiktas",           xi:true  },
      { name:"Stephen Eustaquio",  pos:"MID", club:"Porto",              xi:true  },
      { name:"Mark-Anthony Kaye",  pos:"MID", club:"Club Brugge",        xi:true  },
      { name:"Samuel Piette",      pos:"MID", club:"CF Montreal",        xi:false },
      { name:"Liam Fraser",        pos:"MID", club:"Frosinone",          xi:false },
      { name:"Ismael Kone",        pos:"MID", club:"Watford",            xi:false },
      { name:"Alphonso Davies",    pos:"FWD", club:"Bayern Munich",      xi:true  },
      { name:"Jonathan David",     pos:"FWD", club:"LOSC Lille",         xi:true  },
      { name:"Cyle Larin",         pos:"FWD", club:"Club Brugge",        xi:true  },
      { name:"Lucas Cavallini",    pos:"FWD", club:"Vancouver WC",       xi:false },
      { name:"Tajon Buchanan",     pos:"FWD", club:"Club Brugge",        xi:false },
      { name:"Junior Hoilett",     pos:"FWD", club:"Reading",            xi:false },
      { name:"Theo Bair",          pos:"FWD", club:"Stockport",          xi:false },
      { name:"Luca Koleosho",      pos:"FWD", club:"Burnley",            xi:false },
      { name:"Jacob Shaffelburg",  pos:"FWD", club:"Nashville SC",       xi:false },
      { name:"Kobi Henry",         pos:"FWD", club:"Levante",            xi:false },
    ]
  },

  Panama: { flag: "🇵🇦", kit: ["#DA121A","#FFFFFF"], rank: 43, conf: "CONCACAF",
    squad: [
      { name:"Luis Mejia",pos:"GK",club:"Olimpia",xi:true },{ name:"Jose Calderon",pos:"GK",club:"CAI",xi:false },{ name:"Jaime Penedo",pos:"GK",club:"Chorrillo",xi:false },
      { name:"Fidel Escobar",pos:"DEF",club:"New England Rev",xi:true },{ name:"Roderick Miller",pos:"DEF",club:"Sporting KC",xi:true },{ name:"Harold Cummings",pos:"DEF",club:"San Jose EQ",xi:true },
      { name:"Michael Murillo",pos:"DEF",club:"Anderlecht",xi:true },{ name:"Eric Davis",pos:"DEF",club:"LD Alajuelense",xi:false },{ name:"Andres Andrade P",pos:"DEF",club:"Dep Cali",xi:false },
      { name:"Carlos Harvey",pos:"DEF",club:"Toronto FC",xi:false },{ name:"Adalberto Carrasquilla",pos:"MID",club:"Univ de Chile",xi:true },{ name:"Anibal Godoy",pos:"MID",club:"Nashville SC",xi:true },
      { name:"Edgar Barcenas",pos:"MID",club:"Twente",xi:true },{ name:"Alberto Quintero",pos:"MID",club:"Olimpia",xi:false },{ name:"Giovani Torres",pos:"MID",club:"Dep Cali",xi:false },
      { name:"Abdiel Ayarza",pos:"MID",club:"Olimpia",xi:false },{ name:"Ismael Diaz",pos:"FWD",club:"Porto",xi:true },{ name:"Rolando Blackburn",pos:"FWD",club:"Nashville SC",xi:true },
      { name:"Gabriel Torres",pos:"FWD",club:"Al Jazira",xi:true },{ name:"Cecilio Waterman",pos:"FWD",club:"Once Caldas",xi:false },{ name:"Alfredo Stephens",pos:"FWD",club:"LAFC",xi:false },
      { name:"Jose Rodriguez",pos:"FWD",club:"Tauro FC",xi:false },{ name:"Omar Browne",pos:"FWD",club:"Colorado Rapids",xi:false },{ name:"Freddy Gondola",pos:"FWD",club:"Comunicaciones",xi:false },
      { name:"Jorman Aguilar",pos:"MID",club:"Tauro FC",xi:false },{ name:"Andres Rodriguez",pos:"MID",club:"Tauro FC",xi:false },
    ]
  },
  Bolivia: { flag: "🇧🇴", kit: ["#007A3D","#FCD116"], rank: 84, conf: "CONMEBOL",
    squad: [
      { name:"Carlos Lampe",pos:"GK",club:"The Strongest",xi:true },{ name:"Ruben Cordano",pos:"GK",club:"Bolivar",xi:false },{ name:"Javier Rojas",pos:"GK",club:"Always Ready",xi:false },
      { name:"Jose Carrasco",pos:"DEF",club:"Bolivar",xi:true },{ name:"Luis Haquin",pos:"DEF",club:"The Strongest",xi:true },{ name:"Jesus Sagredo",pos:"DEF",club:"Bolivar",xi:true },
      { name:"Diego Bejarano",pos:"DEF",club:"The Strongest",xi:true },{ name:"Marvin Bejarano",pos:"DEF",club:"Sport Boys",xi:false },{ name:"Yomar Rojas",pos:"DEF",club:"Always Ready",xi:false },
      { name:"Jeyson Chura",pos:"DEF",club:"Bolivar",xi:false },{ name:"Moises Villarroel",pos:"MID",club:"The Strongest",xi:true },{ name:"Erwin Saavedra",pos:"MID",club:"Blooming",xi:true },
      { name:"Rodrigo Ramallo",pos:"MID",club:"The Strongest",xi:true },{ name:"Roberto Fernandez",pos:"MID",club:"Bolivar",xi:false },{ name:"Jairo Quinteros",pos:"MID",club:"Bolivar",xi:false },
      { name:"Leonardo Fernandez",pos:"MID",club:"The Strongest",xi:false },{ name:"Marcelo Moreno",pos:"FWD",club:"Shenzhen FC",xi:true },{ name:"Rodrigo Wayar",pos:"FWD",club:"Bolivar",xi:true },
      { name:"Victor Abrego",pos:"FWD",club:"Always Ready",xi:true },{ name:"Juan Arce",pos:"FWD",club:"The Strongest",xi:false },{ name:"Bruno Miranda",pos:"FWD",club:"San Jose EC",xi:false },
      { name:"Ramiro Vaca",pos:"MID",club:"Blooming",xi:false },{ name:"Fernando Saucedo",pos:"FWD",club:"The Strongest",xi:false },{ name:"Carmelo Algaranaz",pos:"FWD",club:"The Strongest",xi:false },
      { name:"Marco Shimokawa",pos:"MID",club:"Bolivar",xi:false },{ name:"Alejandro Chumacero",pos:"MID",club:"Bolivar",xi:false },
    ]
  },
  Iceland: { flag: "🇮🇸", kit: ["#003897","#FFFFFF"], rank: 68, conf: "UEFA",
    squad: [
      { name:"Hannes Halldorsson",pos:"GK",club:"Randers",xi:true },{ name:"Runar Runarsson",pos:"GK",club:"Arsenal",xi:false },{ name:"Patrik Gunnarsson",pos:"GK",club:"Brighton",xi:false },
      { name:"Ragnar Sigurdsson",pos:"DEF",club:"Krasnodar",xi:true },{ name:"Ari Skulason",pos:"DEF",club:"Diosgyori",xi:true },{ name:"Holmar Eyjolfsson",pos:"DEF",club:"Karagumruk",xi:true },
      { name:"Birkir Saevarsson",pos:"DEF",club:"Breidablik",xi:true },{ name:"Kari Arnason",pos:"DEF",club:"AGF",xi:false },{ name:"Alfons Sampsted",pos:"DEF",club:"Brentford",xi:false },
      { name:"Vikingur Andrason",pos:"DEF",club:"Vidir",xi:false },{ name:"Birkir Bjarnason",pos:"MID",club:"PAOK",xi:true },{ name:"Aron Gunnarsson",pos:"MID",club:"Al Arabi",xi:true },
      { name:"Emil Hallfredsson",pos:"MID",club:"Udinese",xi:true },{ name:"Gylfi Sigurdsson",pos:"MID",club:"Retired",xi:false },{ name:"Sveinn Gudjohnsen",pos:"MID",club:"Hobro",xi:false },
      { name:"Willum Willumsson",pos:"MID",club:"Brann",xi:false },{ name:"Isak Johannesson",pos:"FWD",club:"RB Leipzig",xi:true },{ name:"Kolbeinn Sigthorsson",pos:"FWD",club:"Nantes",xi:true },
      { name:"Albert Gudmundsson",pos:"FWD",club:"Genoa",xi:true },{ name:"Andri Gudjohnsen",pos:"FWD",club:"Club Brugge",xi:false },{ name:"Arnor Traustason",pos:"FWD",club:"Augsburg",xi:false },
      { name:"Jon Thorvaldsson",pos:"FWD",club:"Gais",xi:false },{ name:"Orri Oskarsson",pos:"FWD",club:"Genk",xi:false },{ name:"Aron Thrandarson",pos:"FWD",club:"Vikingur",xi:false },
      { name:"Brynjolfur Willumsson",pos:"MID",club:"Brann",xi:false },{ name:"Magnus Andersen",pos:"DEF",club:"Breidablik",xi:false },
    ]
  },
  Ecuador: { flag: "🇪🇨", kit: ["#FFD100","#034EA2"], rank: 39, conf: "CONMEBOL",
    squad: [
      { name:"Hernan Galindez",pos:"GK",club:"Aucas",xi:true },{ name:"Alexander Dominguez",pos:"GK",club:"Liga de Quito",xi:false },{ name:"Moises Ramirez",pos:"GK",club:"Independiente",xi:false },
      { name:"Piero Hincapie",pos:"DEF",club:"Bayer Leverkusen",xi:true },{ name:"Byron Castillo",pos:"DEF",club:"Liga de Quito",xi:true },{ name:"Felix Torres",pos:"DEF",club:"Santos Laguna",xi:true },
      { name:"Pervis Estupinan",pos:"DEF",club:"Brighton",xi:true },{ name:"Diego Palacios",pos:"DEF",club:"Toronto FC",xi:false },{ name:"Robert Arboleda",pos:"DEF",club:"Sao Paulo",xi:false },
      { name:"Angelo Preciado",pos:"DEF",club:"Genk",xi:false },{ name:"Moises Caicedo",pos:"MID",club:"Chelsea",xi:true },{ name:"Jhegson Mendez",pos:"MID",club:"LA Galaxy",xi:true },
      { name:"Romario Ibarra",pos:"MID",club:"Pachuca",xi:true },{ name:"Carlos Gruezo",pos:"MID",club:"Augsburg",xi:false },{ name:"Jeremy Sarmiento",pos:"MID",club:"Brighton",xi:false },
      { name:"Jose Cifuentes",pos:"MID",club:"Leeds United",xi:false },{ name:"Gonzalo Plata",pos:"FWD",club:"Al Qadsiah",xi:true },{ name:"Michael Estrada",pos:"FWD",club:"Cruz Azul",xi:true },
      { name:"Enner Valencia",pos:"FWD",club:"Internacional",xi:true },{ name:"Djorkaeff Reasco",pos:"FWD",club:"Nottm Forest",xi:false },{ name:"Fidel Martinez",pos:"FWD",club:"Pachuca",xi:false },
      { name:"John Yeboah",pos:"FWD",club:"Wigan Athletic",xi:false },{ name:"Kevin Rodriguez",pos:"FWD",club:"Imbabura",xi:false },{ name:"Alan Minda",pos:"FWD",club:"Barnsley",xi:false },
      { name:"Jordy Caicedo",pos:"FWD",club:"Aucas",xi:false },{ name:"Junior Sornoza",pos:"MID",club:"Fluminense",xi:false },
    ]
  },
  Jamaica: { flag: "🇯🇲", kit: ["#000000","#FFD700"], rank: 56, conf: "CONCACAF",
    squad: [
      { name:"Andre Blake",pos:"GK",club:"Philadelphia Union",xi:true },{ name:"Dwayne Miller",pos:"GK",club:"Montego Bay",xi:false },{ name:"Jahmali Waite",pos:"GK",club:"Charlotte FC",xi:false },
      { name:"Damion Lowe",pos:"DEF",club:"Inter Miami",xi:true },{ name:"Kemar Lawrence",pos:"DEF",club:"Anderlecht",xi:true },{ name:"Javain Brown",pos:"DEF",club:"West Brom",xi:true },
      { name:"Ethan Pinnock",pos:"DEF",club:"Brentford",xi:true },{ name:"Alvas Powell",pos:"DEF",club:"FC Cincinnati",xi:false },{ name:"Dexter Lembikisa",pos:"DEF",club:"Rotherham",xi:false },
      { name:"Shaun Francis",pos:"DEF",club:"Waterford",xi:false },{ name:"Bobby Reid",pos:"MID",club:"Fulham",xi:true },{ name:"Daniel Johnson",pos:"MID",club:"Preston NE",xi:true },
      { name:"Rolando Aarons",pos:"MID",club:"Retired",xi:true },{ name:"Ravel Morrison",pos:"MID",club:"Lazio",xi:false },{ name:"Kasey Palmer",pos:"MID",club:"Coventry",xi:false },
      { name:"Lamar Walker",pos:"MID",club:"Inter Miami",xi:false },{ name:"Leon Bailey",pos:"FWD",club:"Aston Villa",xi:true },{ name:"Michail Antonio",pos:"FWD",club:"West Ham",xi:true },
      { name:"Shamar Nicholls",pos:"FWD",club:"Ipswich",xi:true },{ name:"Demarai Gray",pos:"FWD",club:"Everton",xi:false },{ name:"Cory Burke",pos:"FWD",club:"Columbus Crew",xi:false },
      { name:"Junior Flemmings",pos:"FWD",club:"Tampa Bay Rowdies",xi:false },{ name:"Kevaughn Isaacs",pos:"DEF",club:"Arnett Gardens",xi:false },{ name:"Nicque Daley",pos:"FWD",club:"Bromley",xi:false },
      { name:"Je-Vaughn Watson",pos:"MID",club:"Portmore Utd",xi:false },{ name:"Adrian Mariappa",pos:"DEF",club:"Retired",xi:false },
    ]
  },
  Venezuela: { flag: "🇻🇪", kit: ["#CF142B","#FFFFFF"], rank: 50, conf: "CONMEBOL",
    squad: [
      { name:"Wuilker Farinez",pos:"GK",club:"Millonarios",xi:true },{ name:"Rafael Romo",pos:"GK",club:"Estudiantes",xi:false },{ name:"Danilo Pino",pos:"GK",club:"Dep Tachira",xi:false },
      { name:"Yordan Osorio",pos:"DEF",club:"Girona",xi:true },{ name:"Alexander Gonzalez",pos:"DEF",club:"Univ Catolica",xi:true },{ name:"Nahuel Ferraresi",pos:"DEF",club:"Espanyol",xi:true },
      { name:"Rolf Feltscher",pos:"DEF",club:"Al Wahda",xi:true },{ name:"Mario Rondon",pos:"DEF",club:"Estudiantes",xi:false },{ name:"Mikel Villanueva",pos:"DEF",club:"Dep Tachira",xi:false },
      { name:"Jhon Chancellor",pos:"DEF",club:"Salernitana",xi:false },{ name:"Tomas Rincon",pos:"MID",club:"Estudiantes",xi:true },{ name:"Jefferson Savarino",pos:"MID",club:"Real Salt Lake",xi:true },
      { name:"Yangel Herrera",pos:"MID",club:"Girona",xi:true },{ name:"Jose Martinez",pos:"MID",club:"Philadelphia Union",xi:false },{ name:"Junior Moreno",pos:"MID",club:"DC United",xi:false },
      { name:"Cristian Casseres",pos:"MID",club:"New York RB",xi:false },{ name:"Darwin Machis",pos:"FWD",club:"Granada",xi:true },{ name:"Salomon Rondon",pos:"FWD",club:"Everton",xi:true },
      { name:"Adalberto Penaranda",pos:"FWD",club:"Watford",xi:true },{ name:"Josef Martinez",pos:"FWD",club:"Inter Miami",xi:false },{ name:"Jan Hurtado",pos:"FWD",club:"Juventus",xi:false },
      { name:"Eric Ramirez",pos:"FWD",club:"Pachuca",xi:false },{ name:"Yeferson Soteldo",pos:"FWD",club:"Santos",xi:false },{ name:"Edson Castillo",pos:"MID",club:"Vancouver WC",xi:false },
      { name:"Fernando Aristeguieta",pos:"FWD",club:"FC Cincinnati",xi:false },{ name:"Ronaldo Lucena",pos:"MID",club:"Estudiantes",xi:false },
    ]
  },
  Chile: { flag: "🇨🇱", kit: ["#D52B1E","#FFFFFF"], rank: 37, conf: "CONMEBOL",
    squad: [
      { name:"Claudio Bravo",pos:"GK",club:"Real Betis",xi:true },{ name:"Gabriel Arias",pos:"GK",club:"Racing Club",xi:false },{ name:"Brayan Cortes",pos:"GK",club:"Colo-Colo",xi:false },
      { name:"Gary Medel",pos:"DEF",club:"Vasco da Gama",xi:true },{ name:"Guillermo Maripan",pos:"DEF",club:"Monaco",xi:true },{ name:"Paulo Diaz",pos:"DEF",club:"River Plate",xi:true },
      { name:"Mauricio Isla",pos:"DEF",club:"Flamengo",xi:true },{ name:"Oscar Opazo",pos:"DEF",club:"Colo-Colo",xi:false },{ name:"Eugenio Mena",pos:"DEF",club:"Racing Club",xi:false },
      { name:"Sebastian Vegas",pos:"DEF",club:"Monterrey",xi:false },{ name:"Arturo Vidal",pos:"MID",club:"Athletico-PR",xi:true },{ name:"Charles Aranguiz",pos:"MID",club:"Bayer Leverkusen",xi:true },
      { name:"Erick Pulgar",pos:"MID",club:"Fiorentina",xi:true },{ name:"Diego Valdes",pos:"MID",club:"Club America",xi:false },{ name:"Marcelino Nunez",pos:"MID",club:"Norwich City",xi:false },
      { name:"Rodrigo Echeverria",pos:"MID",club:"Udinese",xi:false },{ name:"Alexis Sanchez",pos:"FWD",club:"Inter Milan",xi:true },{ name:"Eduardo Vargas",pos:"FWD",club:"Athletico-PR",xi:true },
      { name:"Ben Brereton Diaz",pos:"FWD",club:"Villarreal",xi:true },{ name:"Ivan Morales",pos:"FWD",club:"Colo-Colo",xi:false },{ name:"Luciano Arriagada",pos:"FWD",club:"Colo-Colo",xi:false },
      { name:"Damian Pizarro",pos:"FWD",club:"Udinese",xi:false },{ name:"Dario Osorio",pos:"FWD",club:"Copenhagen",xi:false },{ name:"Felipe Mora",pos:"FWD",club:"Portland Timbers",xi:false },
      { name:"Cesar Pinares",pos:"MID",club:"Freiburg",xi:false },{ name:"Pablo Galdames",pos:"MID",club:"Genoa",xi:false },
    ]
  },
  Peru: { flag: "🇵🇪", kit: ["#D91023","#FFFFFF"], rank: 38, conf: "CONMEBOL",
    squad: [
      { name:"Pedro Gallese",pos:"GK",club:"Orlando City",xi:true },{ name:"Carlos Caceda",pos:"GK",club:"Melgar",xi:false },{ name:"Angelo Campos",pos:"GK",club:"Alianza Lima",xi:false },
      { name:"Alexander Callens",pos:"DEF",club:"New York City FC",xi:true },{ name:"Luis Advincula",pos:"DEF",club:"Boca Juniors",xi:true },{ name:"Carlos Zambrano",pos:"DEF",club:"Alianza Lima",xi:true },
      { name:"Miguel Trauco",pos:"DEF",club:"St Pauli",xi:true },{ name:"Aldo Corzo",pos:"DEF",club:"Universitario",xi:false },{ name:"Anderson Santamaria",pos:"DEF",club:"Atlas",xi:false },
      { name:"Luis Abram",pos:"DEF",club:"Atlanta United",xi:false },{ name:"Renato Tapia",pos:"MID",club:"Celta Vigo",xi:true },{ name:"Yoshimar Yotun",pos:"MID",club:"Cruz Azul",xi:true },
      { name:"Christofer Gonzales",pos:"MID",club:"Universitario",xi:true },{ name:"Andy Polo",pos:"MID",club:"Portland Timbers",xi:false },{ name:"Wilder Cartagena",pos:"MID",club:"Godoy Cruz",xi:false },
      { name:"Sergio Pena",pos:"MID",club:"Hamburg",xi:false },{ name:"Gianluca Lapadula",pos:"FWD",club:"Cagliari",xi:true },{ name:"Andre Carrillo",pos:"FWD",club:"Al Qadsiah",xi:true },
      { name:"Edison Flores",pos:"FWD",club:"Universitario",xi:true },{ name:"Raul Ruidiaz",pos:"FWD",club:"Seattle Sounders",xi:false },{ name:"Paolo Guerrero",pos:"FWD",club:"Alianza Lima",xi:false },
      { name:"Santiago Ormeno",pos:"FWD",club:"Puebla",xi:false },{ name:"Alex Valera",pos:"FWD",club:"Universitario",xi:false },{ name:"Bryan Reyna",pos:"FWD",club:"Alianza Lima",xi:false },
      { name:"Kevin Quevedo",pos:"FWD",club:"Defensa y Justicia",xi:false },{ name:"Oscar Ugarte",pos:"MID",club:"Universitario",xi:false },
    ]
  },
  Paraguay: { flag: "🇵🇾", kit: ["#D52B1E","#FFFFFF"], rank: 61, conf: "CONMEBOL",
    squad: [
      { name:"Antony Silva",pos:"GK",club:"San Lorenzo",xi:true },{ name:"Alfredo Aguilar",pos:"GK",club:"Olimpia",xi:false },{ name:"Gaston Olveira",pos:"GK",club:"Olimpia",xi:false },
      { name:"Gustavo Gomez",pos:"DEF",club:"Palmeiras",xi:true },{ name:"Omar Alderete",pos:"DEF",club:"Getafe",xi:true },{ name:"Santiago Arzamendia",pos:"DEF",club:"Cadiz",xi:true },
      { name:"Robert Rojas",pos:"DEF",club:"River Plate",xi:true },{ name:"Blas Riveros",pos:"DEF",club:"Basle",xi:false },{ name:"Junior Alonso",pos:"DEF",club:"Atletico Mineiro",xi:false },
      { name:"Fabian Balbuena",pos:"DEF",club:"Corinthians",xi:false },{ name:"Richard Sanchez",pos:"MID",club:"Club America",xi:true },{ name:"Andres Cubas",pos:"MID",club:"Nottm Forest",xi:true },
      { name:"Miguel Almiron",pos:"MID",club:"Newcastle",xi:true },{ name:"Braian Samudio",pos:"MID",club:"Guarani",xi:false },{ name:"Mathias Villasanti",pos:"MID",club:"Gremio",xi:false },
      { name:"Angel Cardozo",pos:"MID",club:"Olimpia",xi:false },{ name:"Julio Enciso",pos:"FWD",club:"Brighton",xi:true },{ name:"Antonio Sanabria",pos:"FWD",club:"Torino",xi:true },
      { name:"Alex Arce",pos:"FWD",club:"LDU Quito",xi:true },{ name:"Angel Romero",pos:"FWD",club:"Corinthians",xi:false },{ name:"Derlis Gonzalez",pos:"FWD",club:"Club Olimpia",xi:false },
      { name:"Ivan Angulo",pos:"FWD",club:"Porto",xi:false },{ name:"Gabriel Avalos",pos:"FWD",club:"Guarani",xi:false },{ name:"Nelson Valdez",pos:"FWD",club:"Olimpia",xi:false },
      { name:"Angel Oviedo",pos:"MID",club:"Porto",xi:false },{ name:"Fernando Cardozo",pos:"MID",club:"Olimpia",xi:false },
    ]
  },
  "Costa Rica": { flag: "🇨🇷", kit: ["#002B7F","#FFFFFF"], rank: 47, conf: "CONCACAF",
    squad: [
      { name:"Keylor Navas",pos:"GK",club:"PSG",xi:true },{ name:"Esteban Alvarado",pos:"GK",club:"Saprissa",xi:false },{ name:"Patrick Sequeira",pos:"GK",club:"Ludogorets",xi:false },
      { name:"Kendall Waston",pos:"DEF",club:"Vancouver WC",xi:true },{ name:"Oscar Duarte",pos:"DEF",club:"Espanyol",xi:true },{ name:"Ronald Matarrita",pos:"DEF",club:"FC Cincinnati",xi:true },
      { name:"Keysher Fuller",pos:"DEF",club:"Herediano",xi:true },{ name:"Francisco Calvo",pos:"DEF",club:"Nashville SC",xi:false },{ name:"Ian Lawrence",pos:"DEF",club:"Millonarios",xi:false },
      { name:"Randy Chirino",pos:"DEF",club:"Saprissa",xi:false },{ name:"Bryan Oviedo",pos:"MID",club:"Real Salt Lake",xi:true },{ name:"Celso Borges",pos:"MID",club:"LD Alajuelense",xi:true },
      { name:"Yeltsin Tejeda",pos:"MID",club:"Saprissa",xi:true },{ name:"Alvaro Zamora",pos:"MID",club:"Saprissa",xi:false },{ name:"Brandon Aguilera",pos:"MID",club:"Nottm Forest",xi:false },
      { name:"Gerson Torres",pos:"MID",club:"Herediano",xi:false },{ name:"Joel Campbell",pos:"FWD",club:"Club America",xi:true },{ name:"Johan Venegas",pos:"FWD",club:"LD Alajuelense",xi:true },
      { name:"Anthony Contreras",pos:"FWD",club:"Saprissa",xi:true },{ name:"Manfred Ugalde",pos:"FWD",club:"Spartak Moscow",xi:false },{ name:"Jewison Bennette",pos:"FWD",club:"Sunderland",xi:false },
      { name:"Josimar Alcocer",pos:"FWD",club:"Saprissa",xi:false },{ name:"Aaron Suarez",pos:"FWD",club:"Herediano",xi:false },{ name:"Douglas Lopez",pos:"MID",club:"LD Alajuelense",xi:false },
      { name:"Bryan Ruiz",pos:"MID",club:"LD Alajuelense",xi:false },{ name:"Johan Bustos",pos:"FWD",club:"Saprissa",xi:false },
    ]
  },
  Cameroon: { flag: "🇨🇲", kit: ["#007A5E","#CE1126"], rank: 44, conf: "CAF",
    squad: [
      { name:"Andre Onana",pos:"GK",club:"Man United",xi:true },{ name:"Simon Ngapandouetnbu",pos:"GK",club:"Marseille",xi:false },{ name:"Devis Epassy",pos:"GK",club:"Abha",xi:false },
      { name:"Nicolas Nkoulou",pos:"DEF",club:"Torino",xi:true },{ name:"Michael Ngadeu",pos:"DEF",club:"Slavia Prague",xi:true },{ name:"Collins Fai",pos:"DEF",club:"Al Tai",xi:true },
      { name:"Nouhou Tolo",pos:"DEF",club:"Seattle Sounders",xi:true },{ name:"Jean-Charles Castelletto",pos:"DEF",club:"Nantes",xi:false },{ name:"Enzo Ebosse",pos:"DEF",club:"Udinese",xi:false },
      { name:"Ambroise Oyongo",pos:"DEF",club:"Montpellier",xi:false },{ name:"Andre-Frank Zambo",pos:"MID",club:"Fenerbahce",xi:true },{ name:"Thomas Ondoa",pos:"MID",club:"Sivasspor",xi:true },
      { name:"Martin Hongla",pos:"MID",club:"Hellas Verona",xi:true },{ name:"Samuel Gouet",pos:"MID",club:"Mechelen",xi:false },{ name:"Pierre Kunde",pos:"MID",club:"Mallorca",xi:false },
      { name:"Gael Ondoua",pos:"MID",club:"Hannover 96",xi:false },{ name:"Vincent Aboubakar",pos:"FWD",club:"Al Nassr",xi:true },{ name:"Karl Toko Ekambi",pos:"FWD",club:"Lyon",xi:true },
      { name:"Eric Choupo-Moting",pos:"FWD",club:"Bayern Munich",xi:true },{ name:"Georges-Kevin Nkoudou",pos:"FWD",club:"Besiktas",xi:false },{ name:"Ignatius Ganago",pos:"FWD",club:"Nantes",xi:false },
      { name:"Stephane Bahoken",pos:"FWD",club:"Angers",xi:false },{ name:"Jean-Pierre Nsame",pos:"FWD",club:"Young Boys",xi:false },{ name:"Moumi Ngamaleu",pos:"FWD",club:"Young Boys",xi:false },
      { name:"Leandre Tawamba",pos:"FWD",club:"Lokomotiv Moscow",xi:false },{ name:"Jerome Ngom Mbekeli",pos:"MID",club:"USM Alger",xi:false },
    ]
  },
  Serbia: { flag: "🇷🇸", kit: ["#C6363C","#0C4076"], rank: 33, conf: "UEFA",
    squad: [
      { name:"Vanja Milinkovic-Savic",pos:"GK",club:"Torino",xi:true },{ name:"Predrag Rajkovic",pos:"GK",club:"Mallorca",xi:false },{ name:"Marko Dmitrovic",pos:"GK",club:"Sevilla",xi:false },
      { name:"Nikola Milenkovic",pos:"DEF",club:"Nottm Forest",xi:true },{ name:"Stefan Mitrovic",pos:"DEF",club:"Getafe",xi:true },{ name:"Filip Mladenovic",pos:"DEF",club:"Legia Warsaw",xi:true },
      { name:"Srdan Babic",pos:"DEF",club:"Arminia Bielefeld",xi:true },{ name:"Strahinja Pavlovic",pos:"DEF",club:"RB Salzburg",xi:false },{ name:"Erhan Masovic",pos:"DEF",club:"Augsburg",xi:false },
      { name:"Mihailo Ristic",pos:"DEF",club:"Montpellier",xi:false },{ name:"Nemanja Gudelj",pos:"MID",club:"Sevilla",xi:true },{ name:"Sasa Lukic",pos:"MID",club:"Fulham",xi:true },
      { name:"Ivan Ilic",pos:"MID",club:"Hellas Verona",xi:true },{ name:"Darko Lazovic",pos:"MID",club:"Hellas Verona",xi:false },{ name:"Marko Grujic",pos:"MID",club:"Porto",xi:false },
      { name:"Nemanja Maksimovic",pos:"MID",club:"Getafe",xi:false },{ name:"Dusan Tadic",pos:"FWD",club:"Fenerbahce",xi:true },{ name:"Aleksandar Mitrovic",pos:"FWD",club:"Al Hilal",xi:true },
      { name:"Dusan Vlahovic",pos:"FWD",club:"Juventus",xi:true },{ name:"Filip Kostic",pos:"FWD",club:"Juventus",xi:false },{ name:"Andrija Zivkovic",pos:"FWD",club:"PAOK",xi:false },
      { name:"Sergej Milinkovic-Savic",pos:"MID",club:"Lazio",xi:false },{ name:"Lazar Samardzic",pos:"MID",club:"Udinese",xi:false },{ name:"Nemanja Radonjic",pos:"FWD",club:"Benfica",xi:false },
      { name:"Aleksandar Pavlovic",pos:"MID",club:"Bayern Munich",xi:false },{ name:"Marko Lazovic",pos:"MID",club:"Hellas Verona",xi:false },
    ]
  },
  Algeria: { flag: "🇩🇿", kit: ["#006233","#FFFFFF"], rank: 30, conf: "CAF",
    squad: [
      { name:"Rais M'Bolhi",pos:"GK",club:"Al Ahli",xi:true },{ name:"Alexandre Oukidja",pos:"GK",club:"Metz",xi:false },{ name:"Farouk Chafai",pos:"GK",club:"ES Setif",xi:false },
      { name:"Aissa Mandi",pos:"DEF",club:"Villarreal",xi:true },{ name:"Ramy Bensebaini",pos:"DEF",club:"B. Monchengladbach",xi:true },{ name:"Youcef Atal",pos:"DEF",club:"Nice",xi:true },
      { name:"Djamel Benlamri",pos:"DEF",club:"Rayo Vallecano",xi:true },{ name:"Mehdi Tahrat",pos:"DEF",club:"Montpellier",xi:false },{ name:"Mehdi Zeffane",pos:"DEF",club:"Rennes",xi:false },
      { name:"Abdelkader Bedrane",pos:"DEF",club:"JS Kabylie",xi:false },{ name:"Ismael Bennacer",pos:"MID",club:"AC Milan",xi:true },{ name:"Said Benrahma",pos:"MID",club:"West Ham",xi:true },
      { name:"Adrien Tameze",pos:"MID",club:"Hellas Verona",xi:true },{ name:"Sofiane Feghouli",pos:"MID",club:"Galatasaray",xi:false },{ name:"Haris Belkebla",pos:"MID",club:"Stade Brest",xi:false },
      { name:"Nabil Bentaleb",pos:"MID",club:"Lille",xi:false },{ name:"Riyad Mahrez",pos:"FWD",club:"Al Ahli",xi:true },{ name:"Islam Slimani",pos:"FWD",club:"Brest",xi:true },
      { name:"Baghdad Bounedjah",pos:"FWD",club:"Al Sadd",xi:true },{ name:"Yacine Brahimi",pos:"FWD",club:"Al Ain",xi:false },{ name:"Anis Belaili",pos:"FWD",club:"Kasimpasa",xi:false },
      { name:"Billal Brahimi",pos:"FWD",club:"Porto",xi:false },{ name:"Fares Chaibi",pos:"MID",club:"Eintracht Frankfurt",xi:false },{ name:"Zinedine Ferhat",pos:"MID",club:"Nantes",xi:false },
      { name:"Mohamed Benkablia",pos:"FWD",club:"Nantes",xi:false },{ name:"Ilyes Chetti",pos:"FWD",club:"Umm Salal",xi:false },
    ]
  },
  Slovakia: { flag: "🇸🇰", kit: ["#0B4EA2","#FFFFFF"], rank: 48, conf: "UEFA",
    squad: [
      { name:"Martin Dubravka",pos:"GK",club:"Newcastle",xi:true },{ name:"Marek Rodak",pos:"GK",club:"Fulham",xi:false },{ name:"Dusan Kuciak",pos:"GK",club:"Lechia Gdansk",xi:false },
      { name:"Milan Skriniar",pos:"DEF",club:"PSG",xi:true },{ name:"Denis Vavro",pos:"DEF",club:"Copenhagen",xi:true },{ name:"Peter Pekarik",pos:"DEF",club:"Hertha Berlin",xi:true },
      { name:"Norbert Gyombeer",pos:"DEF",club:"Salernitana",xi:true },{ name:"Lubomir Satka",pos:"DEF",club:"Lech Poznan",xi:false },{ name:"Tomas Hubocan",pos:"DEF",club:"Ferencvaros",xi:false },
      { name:"Michal Tomic",pos:"DEF",club:"Ruzomberok",xi:false },{ name:"Stanislav Lobotka",pos:"MID",club:"Napoli",xi:true },{ name:"Patrik Hrosovsky",pos:"MID",club:"Genk",xi:true },
      { name:"Juraj Kucka",pos:"MID",club:"Trabzonspor",xi:true },{ name:"Tomas Suslov",pos:"MID",club:"Hellas Verona",xi:false },{ name:"Laszlo Benes",pos:"MID",club:"Augsburg",xi:false },
      { name:"Matus Bero",pos:"MID",club:"Hellas Verona",xi:false },{ name:"Ondrej Duda",pos:"FWD",club:"Norwich City",xi:true },{ name:"Robert Bozenik",pos:"FWD",club:"Feyenoord",xi:true },
      { name:"Ivan Schranz",pos:"FWD",club:"Slavia Prague",xi:true },{ name:"David Strelec",pos:"FWD",club:"Slavia Prague",xi:false },{ name:"Lukas Haraslin",pos:"FWD",club:"Lech Poznan",xi:false },
      { name:"Pavol Safranko",pos:"FWD",club:"Haugesund",xi:false },{ name:"Vladimir Weiss",pos:"FWD",club:"Al Gharafa",xi:false },{ name:"Matej Oravec",pos:"FWD",club:"Jablonec",xi:false },
      { name:"Jakub Holubek",pos:"MID",club:"Ruzomberok",xi:false },{ name:"Michal Duris",pos:"FWD",club:"Omonia",xi:false },
    ]
  },
  Iraq: { flag: "🇮🇶", kit: ["#007A3D","#FFFFFF"], rank: 58, conf: "AFC",
    squad: [
      { name:"Jalal Hachim",pos:"GK",club:"Al Zawraa",xi:true },{ name:"Dhurgham Ismail",pos:"GK",club:"Al Quwa",xi:false },{ name:"Saad Natiq",pos:"GK",club:"Al Shorta",xi:false },
      { name:"Ali Adnan",pos:"DEF",club:"Udinese",xi:true },{ name:"Rebin Sulaka",pos:"DEF",club:"Al Quwa",xi:true },{ name:"Ahmed Ibrahim",pos:"DEF",club:"Al Zawraa",xi:true },
      { name:"Alaa Abbas",pos:"DEF",club:"Al Shorta",xi:true },{ name:"Hussein Ali",pos:"DEF",club:"Al Zawraa",xi:false },{ name:"Yaser Kasim",pos:"DEF",club:"Swindon Town",xi:false },
      { name:"Saad Abdul Amir",pos:"DEF",club:"Al Quwa",xi:false },{ name:"Amjed Attwan",pos:"MID",club:"Al Zawraa",xi:true },{ name:"Safaa Hadi",pos:"MID",club:"Al Zawraa",xi:true },
      { name:"Mohanad Ali",pos:"MID",club:"Al Quwa",xi:true },{ name:"Bashar Resan",pos:"MID",club:"FC Groningen",xi:false },{ name:"Humam Tariq",pos:"MID",club:"Kasimpasa",xi:false },
      { name:"Karrar Jassim",pos:"MID",club:"Al Shorta",xi:false },{ name:"Ayman Hussein",pos:"FWD",club:"Al Shorta",xi:true },{ name:"Alaa Abboud",pos:"FWD",club:"Al Zawraa",xi:true },
      { name:"Zaid Tahseen",pos:"FWD",club:"Al Quwa",xi:true },{ name:"Ahmed Yasin",pos:"FWD",club:"Slavia Prague",xi:false },{ name:"Mahdi Kamil",pos:"FWD",club:"Al Shorta",xi:false },
      { name:"Emad Mohammed",pos:"FWD",club:"Al Zawraa",xi:false },{ name:"Osama Rashid",pos:"FWD",club:"Al Zawraa",xi:false },{ name:"Omar Abdulrahman",pos:"MID",club:"Al Ain",xi:false },
      { name:"Mustafa Nadhim",pos:"MID",club:"Al Shorta",xi:false },{ name:"Moatasem Karrar",pos:"FWD",club:"Al Quwa",xi:false },
    ]
  },
  Australia: { flag: "🇦🇺", kit: ["#FFCD00","#00843D"], rank: 25, conf: "AFC",
    squad: [
      { name:"Mat Ryan",pos:"GK",club:"Real Sociedad",xi:true },{ name:"Danny Vukovic",pos:"GK",club:"Central Coast",xi:false },{ name:"Andrew Redmayne",pos:"GK",club:"Sydney FC",xi:false },
      { name:"Harry Souttar",pos:"DEF",club:"Leicester",xi:true },{ name:"Milos Degenek",pos:"DEF",club:"Columbus Crew",xi:true },{ name:"Nathaniel Atkinson",pos:"DEF",club:"Melbourne City",xi:true },
      { name:"Aziz Behich",pos:"DEF",club:"Dundee Utd",xi:true },{ name:"Trent Sainsbury",pos:"DEF",club:"Central Coast",xi:false },{ name:"Joel King",pos:"DEF",club:"Copenhagen",xi:false },
      { name:"Kye Rowles",pos:"DEF",club:"Hearts",xi:false },{ name:"Aaron Mooy",pos:"MID",club:"Celtic",xi:true },{ name:"Jackson Irvine",pos:"MID",club:"St Pauli",xi:true },
      { name:"Ajdin Hrustic",pos:"MID",club:"Eintracht Frankfurt",xi:true },{ name:"Riley McGree",pos:"MID",club:"Middlesbrough",xi:false },{ name:"Denis Genreau",pos:"MID",club:"Toulouse",xi:false },
      { name:"Keanu Baccus",pos:"MID",club:"St Mirren",xi:false },{ name:"Mathew Leckie",pos:"FWD",club:"Melbourne City",xi:true },{ name:"Mitchell Duke",pos:"FWD",club:"Fagiano Okayama",xi:true },
      { name:"Jamie Maclaren",pos:"FWD",club:"Melbourne City",xi:true },{ name:"Martin Boyle",pos:"FWD",club:"Hibernian",xi:false },{ name:"Awer Mabil",pos:"FWD",club:"Cadiz",xi:false },
      { name:"Garang Kuol",pos:"FWD",club:"Hearts",xi:false },{ name:"Lachlan Wales",pos:"FWD",club:"Melbourne City",xi:false },{ name:"Jason Cummings",pos:"FWD",club:"Central Coast",xi:false },
      { name:"Brad Smith",pos:"DEF",club:"Seattle Sounders",xi:false },{ name:"Fran Karacic",pos:"DEF",club:"Brescia",xi:false },
    ]
  },
  "Saudi Arabia": { flag: "🇸🇦", kit: ["#006C35","#FFFFFF"], rank: 56, conf: "AFC",
    squad: [
      { name:"Mohammed Al-Owais",pos:"GK",club:"Al Hilal",xi:true },{ name:"Fawaz Al-Qarni",pos:"GK",club:"Al Ahli",xi:false },{ name:"Yasser Al-Mosailem",pos:"GK",club:"Al Ittihad",xi:false },
      { name:"Ali Al-Bulaihi",pos:"DEF",club:"Al Hilal",xi:true },{ name:"Yasser Al-Shahrani",pos:"DEF",club:"Al Hilal",xi:true },{ name:"Abdullah Madu",pos:"DEF",club:"Al Hilal",xi:true },
      { name:"Hassan Tambakti",pos:"DEF",club:"Al Shabab",xi:true },{ name:"Saud Abdulhamid",pos:"DEF",club:"Al Qadsiah",xi:false },{ name:"Abdulelah Al-Amri",pos:"DEF",club:"Al Ittihad",xi:false },
      { name:"Sultan Al-Ghannam",pos:"DEF",club:"Al Nassr",xi:false },{ name:"Riyadh Sharahili",pos:"MID",club:"Al Hilal",xi:true },{ name:"Salman Al-Faraj",pos:"MID",club:"Al Hilal",xi:true },
      { name:"Mohamed Kanno",pos:"MID",club:"Al Hilal",xi:true },{ name:"Ali Al-Hassan",pos:"MID",club:"Al Qadsiah",xi:false },{ name:"Nasser Al-Dawsari",pos:"MID",club:"Al Hilal",xi:false },
      { name:"Ahmed Al-Ghamdi",pos:"MID",club:"Al Ahli",xi:false },{ name:"Saleh Al-Shehri",pos:"FWD",club:"Al Hilal",xi:true },{ name:"Firas Al-Buraikan",pos:"FWD",club:"Al Fateh",xi:true },
      { name:"Salem Al-Dawsari",pos:"FWD",club:"Al Hilal",xi:true },{ name:"Hatan Bahebri",pos:"FWD",club:"Al Hilal",xi:false },{ name:"Mohammed Al-Burayk",pos:"DEF",club:"Al Hilal",xi:false },
      { name:"Ahmad Al-Hamdan",pos:"FWD",club:"Al Qadsiah",xi:false },{ name:"Nawaf Al-Abed",pos:"FWD",club:"Al Hilal",xi:false },{ name:"Abdulrahman Al-Aboud",pos:"MID",club:"Al Ittihad",xi:false },
      { name:"Ibrahim Al-Khaibri",pos:"FWD",club:"Al Qadsiah",xi:false },{ name:"Khaled Al-Ghannam",pos:"MID",club:"Al Nassr",xi:false },
    ]
  },
  Bahrain: { flag: "🇧🇭", kit: ["#CE1126","#FFFFFF"], rank: 83, conf: "AFC",
    squad: [
      { name:"Sayed Shubbar",pos:"GK",club:"Al Ahli",xi:true },{ name:"Mohammed Al-Shamsan",pos:"GK",club:"Riffa",xi:false },{ name:"Abdulla Baba",pos:"GK",club:"Al Najma",xi:false },
      { name:"Ahmed Al-Aswad",pos:"DEF",club:"Al Ahli",xi:true },{ name:"Sayed Dhiya Saeed",pos:"DEF",club:"Al Muharraq",xi:true },{ name:"Ali Madan",pos:"DEF",club:"Riffa",xi:true },
      { name:"Waleed Al-Hayam",pos:"DEF",club:"Al Ahli",xi:true },{ name:"Mohamed Al-Romaihi",pos:"DEF",club:"Al Ahli",xi:false },{ name:"Sanad Al-Sulaiti",pos:"DEF",club:"Al Muharraq",xi:false },
      { name:"Husain Mirza",pos:"DEF",club:"Al Najma",xi:false },{ name:"Mahdi Humaidan",pos:"MID",club:"Al Ahli",xi:true },{ name:"Jaafar Marhoon",pos:"MID",club:"Riffa",xi:true },
      { name:"Abdulla Yusuf",pos:"MID",club:"Al Muharraq",xi:true },{ name:"Hasan Hasan",pos:"MID",club:"Al Ahli",xi:false },{ name:"Khalid Essa",pos:"MID",club:"Al Muharraq",xi:false },
      { name:"Yusuf Khalil",pos:"MID",club:"Riffa",xi:false },{ name:"Ali Haram",pos:"FWD",club:"Al Ahli",xi:true },{ name:"Mohamed Marhoon",pos:"FWD",club:"Al Muharraq",xi:true },
      { name:"Eid Mohammed",pos:"FWD",club:"Riffa",xi:true },{ name:"Rashed Al-Dosari",pos:"FWD",club:"Al Ahli",xi:false },{ name:"Mohamed Al-Jaafar",pos:"FWD",club:"Al Muharraq",xi:false },
      { name:"Jassim Abdulla",pos:"FWD",club:"Al Najma",xi:false },{ name:"Faouzi Aaish",pos:"MID",club:"Al Ahli",xi:false },{ name:"Ismail Latif",pos:"MID",club:"Riffa",xi:false },
      { name:"Hamad Al-Shamsan",pos:"DEF",club:"Al Muharraq",xi:false },{ name:"Sayed Mohamed",pos:"FWD",club:"Al Ahli",xi:false },
    ]
  },
  Poland: { flag: "🇵🇱", kit: ["#FFFFFF","#DC143C"], rank: 26, conf: "UEFA",
    squad: [
      { name:"Wojciech Szczesny",pos:"GK",club:"Barcelona",xi:true },{ name:"Lukasz Fabianski",pos:"GK",club:"West Ham",xi:false },{ name:"Marcin Bulka",pos:"GK",club:"Nice",xi:false },
      { name:"Jan Bednarek",pos:"DEF",club:"Southampton",xi:true },{ name:"Kamil Glik",pos:"DEF",club:"Benevento",xi:true },{ name:"Matty Cash",pos:"DEF",club:"Aston Villa",xi:true },
      { name:"Bartosz Bereszynski",pos:"DEF",club:"Sampdoria",xi:true },{ name:"Arkadiusz Reca",pos:"DEF",club:"Spezia",xi:false },{ name:"Michal Helik",pos:"DEF",club:"Huddersfield",xi:false },
      { name:"Jakub Kiwior",pos:"DEF",club:"Arsenal",xi:false },{ name:"Piotr Zielinski",pos:"MID",club:"Napoli",xi:true },{ name:"Kamil Grosicki",pos:"MID",club:"Pogon Szczecin",xi:true },
      { name:"Grzegorz Krychowiak",pos:"MID",club:"Al Shabab",xi:false },{ name:"Szymon Zurkowski",pos:"MID",club:"Fiorentina",xi:false },{ name:"Nicola Zalewski",pos:"MID",club:"Roma",xi:false },
      { name:"Sebastian Szymanski",pos:"MID",club:"Feyenoord",xi:false },{ name:"Robert Lewandowski",pos:"FWD",club:"Barcelona",xi:true },{ name:"Arkadiusz Milik",pos:"FWD",club:"Juventus",xi:true },
      { name:"Krzysztof Piatek",pos:"FWD",club:"Salernitana",xi:true },{ name:"Karol Swiderski",pos:"FWD",club:"Charlotte FC",xi:false },{ name:"Adam Buksa",pos:"FWD",club:"RC Lens",xi:false },
      { name:"Damian Szymanski",pos:"MID",club:"AEK Athens",xi:false },{ name:"Jakub Moder",pos:"MID",club:"Brighton",xi:false },{ name:"Bartosz Slisz",pos:"MID",club:"Atlanta United",xi:false },
      { name:"Cezary Kukulka",pos:"DEF",club:"Radomiak",xi:false },{ name:"Karol Linetty",pos:"MID",club:"Torino",xi:false },
    ]
  },
  Austria: { flag: "🇦🇹", kit: ["#ED2939","#FFFFFF"], rank: 21, conf: "UEFA",
    squad: [
      { name:"Patrick Pentz",pos:"GK",club:"Bayer Leverkusen",xi:true },{ name:"Alexander Schlager",pos:"GK",club:"VfB Stuttgart",xi:false },{ name:"Daniel Bachmann",pos:"GK",club:"Watford",xi:false },
      { name:"David Alaba",pos:"DEF",club:"Real Madrid",xi:true },{ name:"Stefan Posch",pos:"DEF",club:"Bologna",xi:true },{ name:"Philipp Mwene",pos:"DEF",club:"VfB Stuttgart",xi:true },
      { name:"Maximilian Wober",pos:"DEF",club:"Leeds United",xi:true },{ name:"Christopher Trimmel",pos:"DEF",club:"Union Berlin",xi:false },{ name:"Kevin Danso",pos:"DEF",club:"Lens",xi:false },
      { name:"Flavius Daniliuc",pos:"DEF",club:"RB Salzburg",xi:false },{ name:"Florian Grillitsch",pos:"MID",club:"Hoffenheim",xi:true },{ name:"Nicolas Seiwald",pos:"MID",club:"RB Leipzig",xi:true },
      { name:"Konrad Laimer",pos:"MID",club:"Bayern Munich",xi:true },{ name:"Marcel Sabitzer",pos:"MID",club:"Bayern Munich",xi:false },{ name:"Christoph Baumgartner",pos:"MID",club:"RB Leipzig",xi:false },
      { name:"Patrick Wimmer",pos:"MID",club:"Wolfsburg",xi:false },{ name:"Marko Arnautovic",pos:"FWD",club:"Inter Milan",xi:true },{ name:"Michael Gregoritsch",pos:"FWD",club:"Freiburg",xi:true },
      { name:"Sasa Kalajdzic",pos:"FWD",club:"Wolves",xi:true },{ name:"Ercan Kara",pos:"FWD",club:"Rapid Vienna",xi:false },{ name:"Karim Onisiwo",pos:"FWD",club:"Mainz",xi:false },
      { name:"Guido Burgstaller",pos:"FWD",club:"Rapid Vienna",xi:false },{ name:"Junior Adamu",pos:"FWD",club:"RB Salzburg",xi:false },{ name:"Andreas Weimann",pos:"FWD",club:"Bristol City",xi:false },
      { name:"Romano Schmid",pos:"MID",club:"Werder Bremen",xi:false },{ name:"Romano Holzhauser",pos:"MID",club:"Beerschot",xi:false },
    ]
  },
  Ukraine: { flag: "🇺🇦", kit: ["#FFD700","#005BBB"], rank: 22, conf: "UEFA",
    squad: [
      { name:"Andriy Lunin",pos:"GK",club:"Real Madrid",xi:true },{ name:"Heorhiy Bushchan",pos:"GK",club:"Dynamo Kyiv",xi:false },{ name:"Anatoliy Trubin",pos:"GK",club:"Shakhtar",xi:false },
      { name:"Oleksandr Zinchenko",pos:"DEF",club:"Arsenal",xi:true },{ name:"Mykola Matviyenko",pos:"DEF",club:"Shakhtar",xi:true },{ name:"Ilya Zabarnyi",pos:"DEF",club:"Bournemouth",xi:true },
      { name:"Vitaliy Mykolenko",pos:"DEF",club:"Everton",xi:true },{ name:"Oleksandr Karavaev",pos:"DEF",club:"Dynamo Kyiv",xi:false },{ name:"Serhiy Kryvtsov",pos:"DEF",club:"Shakhtar",xi:false },
      { name:"Eduard Sobol",pos:"DEF",club:"Club Brugge",xi:false },{ name:"Taras Stepanenko",pos:"MID",club:"Shakhtar",xi:true },{ name:"Viktor Tsygankov",pos:"MID",club:"Girona",xi:true },
      { name:"Heorhiy Sudakov",pos:"MID",club:"Shakhtar",xi:true },{ name:"Mykhailo Mudryk",pos:"MID",club:"Chelsea",xi:false },{ name:"Ruslan Malinovskyi",pos:"MID",club:"Marseille",xi:false },
      { name:"Volodymyr Brazhko",pos:"MID",club:"Shakhtar",xi:false },{ name:"Artem Dovbyk",pos:"FWD",club:"Roma",xi:true },{ name:"Roman Yaremchuk",pos:"FWD",club:"Valencia",xi:true },
      { name:"Oleksandr Zubkov",pos:"FWD",club:"Shakhtar",xi:true },{ name:"Andriy Yarmolenko",pos:"FWD",club:"Dynamo Kyiv",xi:false },{ name:"Danylo Sikan",pos:"FWD",club:"Shakhtar",xi:false },
      { name:"Vladyslav Supryaha",pos:"FWD",club:"Dynamo Kyiv",xi:false },{ name:"Oleksandr Tymchyk",pos:"DEF",club:"Dynamo Kyiv",xi:false },{ name:"Mykhailo Sikan",pos:"FWD",club:"Shakhtar",xi:false },
      { name:"Bogdan Mykhaylichenko",pos:"MID",club:"Shakhtar",xi:false },{ name:"Vladyslav Kabaiev",pos:"FWD",club:"Shakhtar",xi:false },
    ]
  },
  Egypt: { flag: "🇪🇬", kit: ["#CE1126","#FFFFFF"], rank: 36, conf: "CAF",
    squad: [
      { name:"Mohamed El-Shenawy",pos:"GK",club:"Al Ahly",xi:true },{ name:"Sherif Ekramy",pos:"GK",club:"Al Ahly",xi:false },{ name:"Mohamed Abou Gabal",pos:"GK",club:"Zamalek",xi:false },
      { name:"Ahmed Hegazi",pos:"DEF",club:"Al Ittihad",xi:true },{ name:"Mohamed Abdel-Shafy",pos:"DEF",club:"Al Ahly",xi:true },{ name:"Akram Tawfik",pos:"DEF",club:"Pyramids FC",xi:true },
      { name:"Omar Kamal",pos:"DEF",club:"Zamalek",xi:true },{ name:"Ali Gabr",pos:"DEF",club:"Zamalek",xi:false },{ name:"Ahmed Fatouh",pos:"DEF",club:"Al Masry",xi:false },
      { name:"Karim Fouad",pos:"DEF",club:"Pyramids FC",xi:false },{ name:"Tarek Hamed",pos:"MID",club:"Al Ahly",xi:true },{ name:"Ahmed Sayed Zizo",pos:"MID",club:"Zamalek",xi:true },
      { name:"Emam Ashour",pos:"MID",club:"Al Ahly",xi:true },{ name:"Hamdi Fathi",pos:"MID",club:"Al Ahly",xi:false },{ name:"Amr El Solia",pos:"MID",club:"Pyramids FC",xi:false },
      { name:"Nasser Mansi",pos:"MID",club:"Al Ahly",xi:false },{ name:"Mohamed Salah",pos:"FWD",club:"Liverpool",xi:true },{ name:"Mostafa Mohamed",pos:"FWD",club:"Nantes",xi:true },
      { name:"Omar Marmoush",pos:"FWD",club:"Eintracht Frankfurt",xi:true },{ name:"Ahmed Trezeguet",pos:"FWD",club:"Trabzonspor",xi:false },{ name:"Ramadan Sobhi",pos:"FWD",club:"Pyramids FC",xi:false },
      { name:"Ziad El-Adawy",pos:"MID",club:"Zamalek",xi:false },{ name:"Ashraf Elneny",pos:"MID",club:"Arsenal",xi:false },{ name:"Mahmoud Trezeguet",pos:"FWD",club:"Kasimpasa",xi:false },
      { name:"Marwan Hamdy",pos:"FWD",club:"Al Ahly",xi:false },{ name:"Mohamed Salah H",pos:"FWD",club:"Pyramids FC",xi:false },
    ]
  },
  Iran: { flag: "🇮🇷", kit: ["#239F40","#FFFFFF"], rank: 20, conf: "AFC",
    squad: [
      { name:"Alireza Beiranvand",pos:"GK",club:"Club Brugge",xi:true },{ name:"Hossein Hosseini",pos:"GK",club:"Esteghlal",xi:false },{ name:"Payam Niazmand",pos:"GK",club:"Sepahan",xi:false },
      { name:"Majid Hosseini",pos:"DEF",club:"Kayserispor",xi:true },{ name:"Milad Mohammadi",pos:"DEF",club:"Akhmat Grozny",xi:true },{ name:"Shojae Khalilzadeh",pos:"DEF",club:"Esteghlal",xi:true },
      { name:"Ehsan Pahlavan",pos:"DEF",club:"Persepolis",xi:true },{ name:"Ramin Rezaeian",pos:"DEF",club:"Sepahan",xi:false },{ name:"Morteza Pouraliganji",pos:"DEF",club:"Al Duhail",xi:false },
      { name:"Abolfazl Jalali",pos:"DEF",club:"Persepolis",xi:false },{ name:"Ali Karimi",pos:"MID",club:"Sepahan",xi:true },{ name:"Ahmad Nourollahi",pos:"MID",club:"Club Brugge",xi:true },
      { name:"Saeid Ezatolahi",pos:"MID",club:"Esteghlal",xi:true },{ name:"Ehsan Hajsafi",pos:"MID",club:"Nottm Forest",xi:false },{ name:"Omid Ebrahimi",pos:"MID",club:"Persepolis",xi:false },
      { name:"Karim Ansarifard",pos:"MID",club:"Nottm Forest",xi:false },{ name:"Mehdi Taremi",pos:"FWD",club:"Porto",xi:true },{ name:"Sardar Azmoun",pos:"FWD",club:"Bayer Leverkusen",xi:true },
      { name:"Alireza Jahanbakhsh",pos:"FWD",club:"Feyenoord",xi:true },{ name:"Saman Ghoddos",pos:"FWD",club:"Brentford",xi:false },{ name:"Ali Gholizadeh",pos:"FWD",club:"Charleroi",xi:false },
      { name:"Allahyar Sayyadmanesh",pos:"FWD",club:"Hull City",xi:false },{ name:"Shayan Moslah",pos:"FWD",club:"Sochaux",xi:false },{ name:"Farshad Farahanpour",pos:"FWD",club:"Persepolis",xi:false },
      { name:"Morteza Fallahpour",pos:"MID",club:"Persepolis",xi:false },{ name:"Hossein Kanaanizadegan",pos:"MID",club:"Esteghlal",xi:false },
    ]
  },
  Uzbekistan: { flag: "🇺🇿", kit: ["#1EB53A","#FFFFFF"], rank: 62, conf: "AFC",
    squad: [
      { name:"Otabek Shukurov",pos:"GK",club:"Pakhtakor",xi:true },{ name:"Husan Murodov",pos:"GK",club:"Nasaf",xi:false },{ name:"Dostonbek Tursunov G",pos:"GK",club:"FC Bunyodkor",xi:false },
      { name:"Akbar Tursunov",pos:"DEF",club:"Pakhtakor",xi:true },{ name:"Sherzod Nasrullayev",pos:"DEF",club:"FC Bunyodkor",xi:true },{ name:"Hasan Abdullaev",pos:"DEF",club:"Pakhtakor",xi:true },
      { name:"Islom Tukhtahujaev",pos:"DEF",club:"Nasaf",xi:true },{ name:"Oybek Bozorov",pos:"DEF",club:"Pakhtakor",xi:false },{ name:"Dilshod Yakhshiliqov",pos:"DEF",club:"FC Bunyodkor",xi:false },
      { name:"Saidakbar Saidov",pos:"DEF",club:"Nasaf",xi:false },{ name:"Jaloliddin Masharipov",pos:"MID",club:"Pakhtakor",xi:true },{ name:"Otabek Shatbekov",pos:"MID",club:"Pakhtakor",xi:true },
      { name:"Jasurbek Yakhshiboev",pos:"MID",club:"FC Bunyodkor",xi:true },{ name:"Mahmud Qodirov",pos:"MID",club:"Nasaf",xi:false },{ name:"Bekhruz Tursunov",pos:"MID",club:"Pakhtakor",xi:false },
      { name:"Dostonbek Khamdamov",pos:"MID",club:"Pakhtakor",xi:false },{ name:"Eldor Shomurodov",pos:"FWD",club:"Roma",xi:true },{ name:"Abbosxon Ismoilov",pos:"FWD",club:"Pakhtakor",xi:true },
      { name:"Ilhomjon Qobilov",pos:"FWD",club:"FC Bunyodkor",xi:true },{ name:"Asilbek Jurayev",pos:"FWD",club:"Pakhtakor",xi:false },{ name:"Doston Ergashev",pos:"FWD",club:"Pakhtakor",xi:false },
      { name:"Laziz Azimov",pos:"FWD",club:"Nasaf",xi:false },{ name:"Bobur Abdixoliqov",pos:"FWD",club:"Pakhtakor",xi:false },{ name:"Mirzo Qoraboyev",pos:"MID",club:"Navbahor",xi:false },
      { name:"Shamsiddin Niyozov",pos:"MID",club:"Pakhtakor",xi:false },{ name:"Avazbek Nazarov",pos:"FWD",club:"Nasaf",xi:false },
    ]
  },
  "New Zealand": { flag: "🇳🇿", kit: ["#000000","#FFFFFF"], rank: 97, conf: "OFC",
    squad: [
      { name:"Stefan Marinovic",pos:"GK",club:"Vancouver WC",xi:true },{ name:"Michael Woud",pos:"GK",club:"NAC Breda",xi:false },{ name:"Max Crocombe",pos:"GK",club:"Macclesfield",xi:false },
      { name:"Winston Reid",pos:"DEF",club:"West Ham",xi:true },{ name:"Liberato Cacace",pos:"DEF",club:"Empoli",xi:true },{ name:"Michael Boxall",pos:"DEF",club:"Minnesota United",xi:true },
      { name:"Nando Pijnaker",pos:"DEF",club:"Sheff Wed",xi:true },{ name:"Tim Payne",pos:"DEF",club:"Wellington Phoenix",xi:false },{ name:"Bailey Perez",pos:"DEF",club:"Vitesse",xi:false },
      { name:"Zach Wills",pos:"DEF",club:"Wellington Phoenix",xi:false },{ name:"Ryan Thomas",pos:"MID",club:"PEC Zwolle",xi:true },{ name:"Elijah Just",pos:"MID",club:"Rapid Vienna",xi:true },
      { name:"Joe Bell",pos:"MID",club:"Nashville SC",xi:true },{ name:"Callum McCowatt",pos:"MID",club:"Hearts",xi:false },{ name:"Marko Stamenic",pos:"MID",club:"Charlotte FC",xi:false },
      { name:"Ben Waine",pos:"MID",club:"Viking",xi:false },{ name:"Chris Wood",pos:"FWD",club:"Nottm Forest",xi:true },{ name:"Gianni Stensness",pos:"FWD",club:"Viking",xi:true },
      { name:"Matt Garbett",pos:"FWD",club:"Vitesse",xi:true },{ name:"Matthew Ridenton",pos:"FWD",club:"Wellington Phoenix",xi:false },{ name:"Finn Surman",pos:"FWD",club:"Wellington Phoenix",xi:false },
      { name:"Angus Thurgate",pos:"MID",club:"Perth Glory",xi:false },{ name:"Hamish Watson",pos:"DEF",club:"Dundee",xi:false },{ name:"Sam Surridge",pos:"FWD",club:"Nottm Forest",xi:false },
      { name:"Marco Rojas",pos:"MID",club:"Retired",xi:false },{ name:"Ollie Sail",pos:"FWD",club:"Wellington Phoenix",xi:false },
    ]
  },
  Honduras: { flag: "🇭🇳", kit: ["#0073CF","#FFFFFF"], rank: 72, conf: "CONCACAF",
    squad: [
      { name:"Luis Lopez",pos:"GK",club:"Columbus Crew",xi:true },{ name:"Harold Fonseca",pos:"GK",club:"Marathon",xi:false },{ name:"Edrick Menjivar",pos:"GK",club:"Seattle Sounders",xi:false },
      { name:"Maynor Figueroa",pos:"DEF",club:"Wigan Athletic",xi:true },{ name:"Denil Maldonado",pos:"DEF",club:"Chivas",xi:true },{ name:"Marcelo Pereira",pos:"DEF",club:"Olimpia",xi:true },
      { name:"Juan Diego Rodriguez",pos:"DEF",club:"Lobos UPNFM",xi:true },{ name:"Emilio Izaguirre",pos:"DEF",club:"Motagua",xi:false },{ name:"Jonathan Rougier",pos:"DEF",club:"Olimpia",xi:false },
      { name:"Carlos Melendez",pos:"DEF",club:"Marathon",xi:false },{ name:"Romell Quioto",pos:"MID",club:"CF Montreal",xi:true },{ name:"Andy Najar",pos:"MID",club:"Anderlecht",xi:true },
      { name:"Rubilio Castillo",pos:"MID",club:"Marathon",xi:true },{ name:"Luis Palma",pos:"MID",club:"Celtic",xi:false },{ name:"Edwin Rodriguez",pos:"MID",club:"Motagua",xi:false },
      { name:"Joseph Rosales",pos:"MID",club:"Hamburger SV",xi:false },{ name:"Alberth Elis",pos:"FWD",club:"Bordeaux",xi:true },{ name:"Antony Lozano",pos:"FWD",club:"Cadiz",xi:true },
      { name:"Rigoberto Rivas",pos:"FWD",club:"Nottm Forest",xi:true },{ name:"Bryan Acosta",pos:"MID",club:"FC Dallas",xi:false },{ name:"Edwin Solani",pos:"FWD",club:"Dep Tolima",xi:false },
      { name:"Jose Mario Pinto",pos:"FWD",club:"Olimpia",xi:false },{ name:"Jorge Benguche",pos:"FWD",club:"RB Bragantino",xi:false },{ name:"Kervin Arriaga",pos:"MID",club:"Motagua",xi:false },
      { name:"Cristian Altamirano",pos:"FWD",club:"Olimpia",xi:false },{ name:"Jorge Alvarez",pos:"MID",club:"Olimpia",xi:false },
    ]
  },
  Switzerland: { flag: "🇨🇭", kit: ["#FF0000","#FFFFFF"], rank: 19, conf: "UEFA",
    squad: [
      { name:"Yann Sommer",pos:"GK",club:"Inter Milan",xi:true },{ name:"Gregor Kobel",pos:"GK",club:"Dortmund",xi:false },{ name:"Jonas Omlin",pos:"GK",club:"Monaco",xi:false },
      { name:"Manuel Akanji",pos:"DEF",club:"Man City",xi:true },{ name:"Nico Elvedi",pos:"DEF",club:"B.Mönchengladbach",xi:true },{ name:"Ricardo Rodriguez",pos:"DEF",club:"Torino",xi:true },
      { name:"Silvan Widmer",pos:"DEF",club:"Mainz",xi:true },{ name:"Fabian Schär",pos:"DEF",club:"Newcastle",xi:true },{ name:"Kevin Mbabu",pos:"DEF",club:"Fulham",xi:false },
      { name:"Granit Xhaka",pos:"MID",club:"Bayer Leverkusen",xi:true },{ name:"Remo Freuler",pos:"MID",club:"Nottm Forest",xi:true },{ name:"Denis Zakaria",pos:"MID",club:"Monaco",xi:true },
      { name:"Xherdan Shaqiri",pos:"MID",club:"Chicago Fire",xi:false },{ name:"Michel Aebischer",pos:"MID",club:"Bologna",xi:false },{ name:"Fabian Frei",pos:"MID",club:"Basel",xi:false },
      { name:"Noah Okafor",pos:"FWD",club:"AC Milan",xi:true },{ name:"Breel Embolo",pos:"FWD",club:"Monaco",xi:true },{ name:"Haris Seferovic",pos:"FWD",club:"Fenerbahce",xi:false },
      { name:"Ruben Vargas",pos:"FWD",club:"Augsburg",xi:true },{ name:"Zeki Amdouni",pos:"FWD",club:"Burnley",xi:false },{ name:"Christian Fassnacht",pos:"FWD",club:"Leicester",xi:false },
      { name:"Dan Ndoye",pos:"FWD",club:"Bologna",xi:false },{ name:"Vincent Sierro",pos:"MID",club:"Toulouse",xi:false },{ name:"Ardon Jashari",pos:"MID",club:"Club Brugge",xi:false },
      { name:"Edimilson Fernandes",pos:"MID",club:"Mainz",xi:false },{ name:"Luca Jaques",pos:"DEF",club:"Basel",xi:false },
    ]
  },
  "United States": { flag: "🇺🇸", kit: ["#B22234","#FFFFFF"], rank: 13, conf: "CONCACAF", squad: [] },
  Czechia: { flag: "🇨🇿", kit: ["#D7141A","#FFFFFF"], rank: 37, conf: "UEFA", squad: [] },
  "Bosnia-Herzegovina": { flag: "🇧🇦", kit: ["#002395","#FCCA00"], rank: 60, conf: "UEFA", squad: [] },
  Norway: { flag: "🇳🇴", kit: ["#EF2B2D","#FFFFFF"], rank: 29, conf: "UEFA", squad: [] },
  Sweden: { flag: "🇸🇪", kit: ["#006AA7","#FECC00"], rank: 24, conf: "UEFA", squad: [] },
  Scotland: { flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", kit: ["#003078","#FFFFFF"], rank: 30, conf: "UEFA", squad: [] },
  Türkiye: { flag: "🇹🇷", kit: ["#E30A17","#FFFFFF"], rank: 28, conf: "UEFA", squad: [] },
  "South Africa": { flag: "🇿🇦", kit: ["#007A4D","#FFB612"], rank: 58, conf: "CAF", squad: [] },
  "Ivory Coast": { flag: "🇨🇮", kit: ["#F77F00","#FFFFFF"], rank: 47, conf: "CAF", squad: [] },
  Ghana: { flag: "🇬🇭", kit: ["#006B3F","#FCD116"], rank: 60, conf: "CAF", squad: [] },
  Tunisia: { flag: "🇹🇳", kit: ["#E70013","#FFFFFF"], rank: 26, conf: "CAF", squad: [] },
  "Congo DR": { flag: "🇨🇩", kit: ["#007FFF","#F7D618"], rank: 57, conf: "CAF", squad: [] },
  "Cape Verde": { flag: "🇨🇻", kit: ["#003893","#CF2027"], rank: 75, conf: "CAF", squad: [] },
  Qatar: { flag: "🇶🇦", kit: ["#8D1B3D","#FFFFFF"], rank: 82, conf: "AFC", squad: [] },
  Jordan: { flag: "🇯🇴", kit: ["#007A3D","#FFFFFF"], rank: 70, conf: "AFC", squad: [] },
  Haiti: { flag: "🇭🇹", kit: ["#00209F","#D21034"], rank: 87, conf: "CONCACAF", squad: [] },
  Curaçao: { flag: "🇨🇼", kit: ["#002B7F","#F9E814"], rank: 85, conf: "CONCACAF", squad: [] },
};


const ESPN_TEAM_IDS = {
  Algeria:"624", Argentina:"202", Australia:"628", Austria:"474",
  Belgium:"459", "Bosnia-Herzegovina":"452", Brazil:"205", Canada:"206",
  "Cape Verde":"2597", Colombia:"208", "Congo DR":"2850", Croatia:"477",
  "Curaçao":"11678", Czechia:"450", Ecuador:"209", Egypt:"2620",
  England:"448", France:"478", Germany:"481", Ghana:"4469",
  Haiti:"2654", Iran:"469", Iraq:"4375", "Ivory Coast":"4789",
  Japan:"627", Jordan:"2917", Mexico:"203", Morocco:"2869",
  Netherlands:"449", "New Zealand":"2666", Norway:"464", Panama:"2659",
  Paraguay:"210", Portugal:"482", Qatar:"4398", "Saudi Arabia":"655",
  Scotland:"580", Senegal:"654", "South Africa":"467", "South Korea":"451",
  Spain:"164", Sweden:"466", Switzerland:"475", Tunisia:"659",
  Türkiye:"465", "United States":"660", Uruguay:"212", Uzbekistan:"2570",
};
const ESPN_POS = { G:"GK", D:"DEF", M:"MID", F:"FWD" };

// Live fixtures — populated from Supabase on mount, updated via realtime
function mapMatch(row) {
  const d = new Date(row.date);
  const month = d.toLocaleDateString('en-US', { month: 'short' });
  const day = d.toLocaleDateString('en-US', { day: 'numeric' });
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  const groupLetter = row.group_name ? row.group_name.replace('Group ', '') :
    Object.entries(GROUPS).find(([, g]) => g.teams.includes(row.home_team) || g.teams.includes(row.away_team))?.[0] || null;
  const statusMap = { pre: 'Upcoming', in: 'Live', post: 'FT' };
  return {
    id: row.id,
    group: groupLetter,
    home: row.home_team,
    away: row.away_team,
    date: `${month} ${day}`,
    time,
    isoDate: row.date,
    venue: row.venue || '',
    homeScore: row.status_state !== 'pre' ? row.home_score : null,
    awayScore: row.status_state !== 'pre' ? row.away_score : null,
    status: statusMap[row.status_state] || 'Upcoming',
    clock: row.clock,
    stage: row.stage,
    goals: row.goals || [],
    yellowCards: row.yellow_cards || [],
    redCards: row.red_cards || [],
  };
}

let FIXTURES = [];
let POLL_MATCH = null;

// ─── UTILS ────────────────────────────────────────────────────────────────────
const getTeam = (name) => TEAM_DATA[name] || { flag: "🏳️", kit: ["#888","#aaa"], rank: 99, conf: "—", squad: [] };

const ls = {
  get: (k, def) => { try { const v = localStorage.getItem(k); return v !== null ? JSON.parse(v) : def; } catch { return def; } },
  set: (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} },
};

// ─── COMPONENTS ───────────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  const styles = {
    FT: { bg: T.grayDark, color: T.gray, label: "FT" },
    Live: { bg: T.red, color: "#fff", label: "● LIVE" },
    Upcoming: { bg: T.navyLight, color: T.gold, label: "UPCOMING" },
  };
  const s = styles[status] || styles.Upcoming;
  return (
    <span style={{
      background: s.bg, color: s.color,
      fontSize: 10, fontWeight: 800, letterSpacing: 1,
      padding: "3px 8px", borderRadius: 4,
      fontFamily: "'Barlow Condensed', sans-serif",
      animation: status === "Live" ? "pulse 1.5s infinite" : "none",
    }}>{s.label}</span>
  );
}

function MatchCard({ fixture, onPredict, userPrediction }) {
  const home = getTeam(fixture.home);
  const away = getTeam(fixture.away);
  const predicted = userPrediction;

  return (
    <div style={{
      background: T.navyMid, borderRadius: 12,
      padding: "16px", marginBottom: 10,
      border: `1px solid ${T.navyLight}`,
      animation: "fadeUp 0.4s ease both",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
        <span style={{ fontSize: 11, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
          GROUP {fixture.group} · {fixture.date} {fixture.time} · {fixture.venue}
        </span>
        <StatusBadge status={fixture.status} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        {/* Home */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 36 }}>{home.flag}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, marginTop: 4 }}>{fixture.home}</div>
        </div>

        {/* Score */}
        <div style={{ textAlign: "center", padding: "0 12px" }}>
          {fixture.status === "FT" || fixture.status === "Live" ? (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 32, color: T.gold, letterSpacing: 2 }}>
              {fixture.homeScore} — {fixture.awayScore}
            </div>
          ) : (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 22, color: T.gray }}>VS</div>
          )}
        </div>

        {/* Away */}
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 36 }}>{away.flag}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, marginTop: 4 }}>{fixture.away}</div>
        </div>
      </div>

      {predicted && (
        <div style={{ marginTop: 10, textAlign: "center", color: T.gold, fontSize: 12, fontFamily: "'Barlow Condensed', sans-serif" }}>
          Your prediction: {fixture.home} {predicted.homeScore} — {predicted.awayScore} {fixture.away}
        </div>
      )}

      {fixture.status === "Upcoming" && (
        <button onClick={() => onPredict(fixture)} style={{
          marginTop: 12, width: "100%", padding: "8px",
          background: "transparent", border: `1px solid ${T.gold}`,
          color: T.gold, borderRadius: 8, cursor: "pointer",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1,
        }}>
          {predicted ? "EDIT PREDICTION" : "PREDICT SCORE"}
        </button>
      )}
    </div>
  );
}

// ─── MATCH DETAILS MODAL ──────────────────────────────────────────────────────
function MatchDetailsModal({ fixture, userPrediction, onClose }) {
  const home = getTeam(fixture.home);
  const away = getTeam(fixture.away);
  const homeWin = fixture.homeScore > fixture.awayScore;
  const awayWin = fixture.awayScore > fixture.homeScore;
  const draw = fixture.homeScore === fixture.awayScore;
  const result = homeWin ? `${fixture.home} Win` : awayWin ? `${fixture.away} Win` : "Draw";

  let predLabel = null;
  if (userPrediction != null) {
    const pH = userPrediction.homeScore, pA = userPrediction.awayScore;
    const exact = pH === fixture.homeScore && pA === fixture.awayScore;
    const correctResult = (pH > pA && homeWin) || (pA > pH && awayWin) || (pH === pA && draw);
    predLabel = exact ? "✅ Exact!" : correctResult ? "🎯 Correct result" : "❌ Wrong";
  }

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#000c", zIndex: 300,
      display: "flex", alignItems: "flex-end", justifyContent: "center",
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.navyMid, width: "100%", maxWidth: 430,
        padding: "24px 20px 32px", borderRadius: "20px 20px 0 0",
        border: `1px solid ${T.navyLight}`,
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, color: T.white, letterSpacing: 1 }}>MATCH DETAILS</div>
            <div style={{ fontSize: 12, color: T.gray, marginTop: 2 }}>
              {fixture.group ? `GROUP ${fixture.group} · ` : ""}{fixture.date} · {fixture.time}
            </div>
            {fixture.venue && <div style={{ fontSize: 12, color: T.gray }}>{fixture.venue}</div>}
          </div>
          <button onClick={onClose} style={{ background: "none", border: "none", color: T.gray, fontSize: 22, cursor: "pointer", padding: 0 }}>✕</button>
        </div>

        {/* Teams + Score */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>{home.flag}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, marginTop: 6, color: homeWin ? T.gold : T.white }}>{fixture.home}</div>
          </div>
          <div style={{ textAlign: "center", padding: "0 16px" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 44, color: T.gold, letterSpacing: 4 }}>
              {fixture.homeScore} — {fixture.awayScore}
            </div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: T.gray, marginTop: 4 }}>FULL TIME</div>
          </div>
          <div style={{ flex: 1, textAlign: "center" }}>
            <div style={{ fontSize: 48 }}>{away.flag}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, marginTop: 6, color: awayWin ? T.gold : T.white }}>{fixture.away}</div>
          </div>
        </div>

        {/* Result pill */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <span style={{ background: T.gold + "22", color: T.gold, padding: "5px 16px", borderRadius: 20, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 1 }}>
            {result}
          </span>
        </div>

        {/* Goals */}
        {fixture.goals?.length > 0 && (
          <div style={{ background: T.navy, borderRadius: 12, padding: "12px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: T.gold, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, marginBottom: 8 }}>GOALS</div>
            {fixture.goals.map((g, i) => (
              <div key={i} style={{ display: "flex", justifyContent: g.side === "home" ? "flex-start" : "flex-end", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: T.white, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {g.side === "home" ? `⚽ ${g.own ? "(OG) " : ""}${g.player} ${g.minute}` : `${g.minute} ${g.player}${g.own ? " (OG)" : ""} ⚽`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Cards */}
        {(fixture.yellowCards?.length > 0 || fixture.redCards?.length > 0) && (
          <div style={{ background: T.navy, borderRadius: 12, padding: "12px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, marginBottom: 8 }}>CARDS</div>
            {fixture.yellowCards?.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: c.side === "home" ? "flex-start" : "flex-end", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: T.white, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {c.side === "home" ? `🟨 ${c.player} ${c.minute}` : `${c.minute} ${c.player} 🟨`}
                </span>
              </div>
            ))}
            {fixture.redCards?.map((c, i) => (
              <div key={i} style={{ display: "flex", justifyContent: c.side === "home" ? "flex-start" : "flex-end", marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: T.white, fontFamily: "'Barlow Condensed', sans-serif" }}>
                  {c.side === "home" ? `🟥 ${c.player} ${c.minute}` : `${c.minute} ${c.player} 🟥`}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* User prediction */}
        {userPrediction != null && (
          <div style={{ background: T.navy, borderRadius: 12, padding: "12px 16px", textAlign: "center" }}>
            <div style={{ fontSize: 11, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, marginBottom: 4 }}>YOUR PREDICTION</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: T.white }}>
              {fixture.home} {userPrediction.homeScore} — {userPrediction.awayScore} {fixture.away}
            </div>
            <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>{predLabel}</div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── TAB: FIXTURES ────────────────────────────────────────────────────────────
function MatchCardSlide({ fixture, onPredict, onViewDetails, userPrediction }) {
  const home = getTeam(fixture.home);
  const away = getTeam(fixture.away);
  const isLive = fixture.status === "Live";
  const isFT = fixture.status === "FT";

  return (
    <div style={{
      minWidth: 270, maxWidth: 270, flexShrink: 0,
      background: T.navyMid, borderRadius: 14,
      padding: "14px 14px 12px",
      border: `1px solid ${isLive ? T.red + "55" : T.navyLight}`,
      boxShadow: isLive ? `0 0 12px ${T.red}22` : "none",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <span style={{ fontSize: 12, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
          GRP {fixture.group} · {fixture.time}
        </span>
        <StatusBadge status={fixture.status} />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>{home.flag}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, marginTop: 3, color: T.white }}>{fixture.home}</div>
        </div>
        <div style={{ textAlign: "center", padding: "0 8px" }}>
          {isFT || isLive ? (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: T.gold, letterSpacing: 2 }}>
              {fixture.homeScore}–{fixture.awayScore}
            </div>
          ) : (
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 20, color: T.gray }}>VS</div>
          )}
          <div style={{ fontSize: 10, color: T.gray, marginTop: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>{fixture.date}</div>
        </div>
        <div style={{ flex: 1, textAlign: "center" }}>
          <div style={{ fontSize: 32 }}>{away.flag}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, marginTop: 3, color: T.white }}>{fixture.away}</div>
        </div>
      </div>

      <div style={{ height: 1, background: "#3a4a6b", margin: "10px 0 4px" }} />

      {userPrediction && (
        <div style={{ marginTop: 4, textAlign: "center", fontSize: 13, color: T.gold, fontFamily: "'Barlow Condensed', sans-serif" }}>
          You: {userPrediction.homeScore}–{userPrediction.awayScore}
        </div>
      )}

      <div style={{ marginTop: "auto", paddingTop: 8 }}>
        {fixture.status === "Upcoming" && (
          <button onClick={() => onPredict(fixture)} style={{
            width: "100%", padding: "6px",
            background: "transparent", border: `1px solid ${T.gold}`,
            color: T.gold, borderRadius: 7, cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1,
          }}>
            {userPrediction ? "EDIT" : "PREDICT"}
          </button>
        )}

        {fixture.status === "FT" && (
          <button onClick={() => onViewDetails?.(fixture)} style={{
            width: "100%", padding: "6px",
            background: "transparent", border: `1px solid ${T.navyLight}`,
            color: T.gray, borderRadius: 7, cursor: "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1,
          }}>
            VIEW DETAILS
          </button>
        )}

        <div style={{ marginTop: 6, fontSize: 12, color: T.gray, textAlign: "center", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.3 }}>
          {fixture.venue}
        </div>
      </div>
    </div>
  );
}

function MatchSliderSection({ title, dot, dotColor, matches, predictions, onPredictOpen, onViewDetails, emptyMsg }) {
  return (
    <div style={{ marginBottom: 28 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        {dot && <span style={{ color: dotColor, fontSize: 14, animation: "pulse 1.5s infinite" }}>●</span>}
        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, letterSpacing: 1, color: T.white }}>
          {title}
        </span>
        <span style={{ marginLeft: "auto", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, color: T.gray }}>
          {matches.length} {matches.length === 1 ? "match" : "matches"}
        </span>
      </div>
      {matches.length === 0 ? (
        <div style={{ color: T.gray, fontSize: 13, padding: "14px 0 6px" }}>{emptyMsg}</div>
      ) : (
        <div className="slider-row" style={{
          display: "flex", gap: 12,
          overflowX: "auto", paddingBottom: 10,
          scrollbarWidth: "none",
          WebkitOverflowScrolling: "touch",
        }}>
          {matches.map(f => (
            <MatchCardSlide
              key={f.id} fixture={f}
              userPrediction={predictions[f.id]}
              onPredict={onPredictOpen}
              onViewDetails={onViewDetails}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function FixturesTab({ predictions, onPredictOpen, onViewDetails, fetchError }) {
  const in7d   = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const live     = FIXTURES.filter(f => f.status === "Live");
  const upcoming = FIXTURES.filter(f => f.status === "Upcoming" && f.isoDate && new Date(f.isoDate) <= in7d);
  const results  = FIXTURES.filter(f => f.status === "FT");

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24, letterSpacing: 2, color: T.gold }}>FIFA World Cup 2026™</div>
        <div style={{ fontSize: 13, color: T.gray }}>Tournament Hub</div>
      </div>

      <MatchSliderSection
        title="Live Now" dot dotColor={T.red}
        matches={live} predictions={predictions} onPredictOpen={onPredictOpen}
        emptyMsg="No matches live right now"
      />
      <MatchSliderSection
        title="Upcoming"
        matches={upcoming} predictions={predictions} onPredictOpen={onPredictOpen}
        emptyMsg="No upcoming matches"
      />
      <MatchSliderSection
        title="Match Results"
        matches={results} predictions={predictions} onPredictOpen={onPredictOpen} onViewDetails={onViewDetails}
        emptyMsg="No results yet"
      />
    </div>
  );
}

// ─── TAB: TEAMS (Groups + Teams combined) ────────────────────────────────────
function TeamsTab({ selectedTeam, onTeamOpen, dbStandings }) {
  const [subTab, setSubTab] = useState("group");
  const [expanded, setExpanded] = useState(null);
  const [search, setSearch] = useState("");

  if (selectedTeam) {
    return <TeamDetail name={selectedTeam} onBack={() => onTeamOpen(null)} />;
  }

  const allTeams = Object.keys(TEAM_DATA);
  const filtered = allTeams.filter(t => t.toLowerCase().includes(search.toLowerCase()));

  const standings = (groupKey) => {
    const groupName = `Group ${groupKey}`;
    const live = dbStandings.filter(r => r.group_name === groupName);
    if (live.length > 0) {
      return live.map(r => ({
        name: r.team, ...getTeam(r.team),
        p: r.played, w: r.wins, d: r.draws, l: r.losses,
        gf: r.goals_for, ga: r.goals_against, gd: r.goal_diff, pts: r.points,
      }));
    }
    // Fallback: all zeros before tournament starts
    return GROUPS[groupKey].teams.map(name => ({
      name, ...getTeam(name),
      p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, gd: 0, pts: 0,
    }));
  };

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: 2, color: T.gold }}>TEAMS</div>
        <div style={{ fontSize: 13, color: T.gray }}>48 Nations · FIFA World Cup 2026™</div>
      </div>

      {/* Sub-tab toggle */}
      <div style={{ display: "flex", marginBottom: 16, background: T.navyLight, borderRadius: 10, padding: 3 }}>
        {[["group", "📊  GROUPS"], ["team", "👕  TEAMS"]].map(([id, label]) => (
          <button key={id} onClick={() => setSubTab(id)} style={{
            flex: 1, padding: "8px", border: "none", borderRadius: 8, cursor: "pointer",
            background: subTab === id ? T.gold : "transparent",
            color: subTab === id ? T.navy : T.gray,
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13,
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* Groups sub-tab */}
      {subTab === "group" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
          {Object.keys(GROUPS).map(gk => (
            <div key={gk} onClick={() => setExpanded(expanded === gk ? null : gk)}
              style={{
                gridColumn: expanded === gk ? "1 / -1" : "auto",
                background: T.navyMid, borderRadius: 12,
                border: `1px solid ${expanded === gk ? T.gold : T.navyLight}`,
                overflow: "hidden", cursor: "pointer",
                transition: "all 0.3s ease",
              }}>
              <div style={{
                padding: "12px 14px",
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: expanded === gk ? `linear-gradient(135deg, ${T.gold}22, transparent)` : "transparent",
              }}>
                <div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: T.gold }}>
                    GROUP {gk}
                  </div>
                  <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>
                    {GROUPS[gk].teams.map(t => getTeam(t).flag).join(" ")}
                  </div>
                </div>
                <div style={{ color: T.gray, fontSize: 16 }}>{expanded === gk ? "▲" : "▼"}</div>
              </div>

              {expanded === gk && (
                <div style={{ padding: "0 14px 14px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, marginBottom: 6, padding: "0 4px" }}>
                    <span style={{ flex: 1 }}>TEAM</span>
                    {["P","W","D","L","GF","GA","GD","PTS"].map(h => (
                      <span key={h} style={{ width: 24, textAlign: "center" }}>{h}</span>
                    ))}
                  </div>
                  {standings(gk).map((team, idx) => (
                    <div key={team.name} onClick={(e) => { e.stopPropagation(); onTeamOpen(team.name); }}
                      style={{
                        display: "flex", alignItems: "center", padding: "8px 4px",
                        borderTop: `1px solid ${T.navyLight}`,
                        background: idx < 2 ? `${T.gold}08` : "transparent",
                        borderRadius: 6,
                      }}>
                      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8 }}>
                        {idx < 2 && <div style={{ width: 3, height: 20, background: T.gold, borderRadius: 2 }} />}
                        {idx >= 2 && <div style={{ width: 3, height: 20 }} />}
                        <span style={{ fontSize: 20 }}>{team.flag}</span>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 13 }}>
                          {team.name}
                        </span>
                      </div>
                      {[team.p, team.w, team.d, team.l, team.gf, team.ga, team.gd, team.pts].map((v, i) => (
                        <span key={i} style={{
                          width: 24, textAlign: "center", fontSize: 13,
                          fontFamily: "'Barlow Condensed', sans-serif",
                          fontWeight: i === 7 ? 800 : 400,
                          color: i === 7 ? T.gold : T.white,
                        }}>{v}</span>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Teams sub-tab */}
      {subTab === "team" && (
        <>
          <input
            placeholder="Search team..."
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "10px 14px", marginBottom: 14,
              background: T.navyMid, border: `1px solid ${T.navyLight}`,
              borderRadius: 10, color: T.white, fontSize: 14,
              fontFamily: "'Barlow', sans-serif", outline: "none",
            }}
          />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
            {filtered.map(name => {
              const t = getTeam(name);
              return (
                <div key={name} onClick={() => onTeamOpen(name)}
                  style={{
                    background: T.navyMid, borderRadius: 10, padding: "12px 8px",
                    textAlign: "center", cursor: "pointer",
                    border: `1px solid ${T.navyLight}`,
                    transition: "border-color 0.2s",
                  }}>
                  <div style={{ fontSize: 32 }}>{t.flag}</div>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, marginTop: 6, lineHeight: 1.2 }}>{name}</div>
                  <div style={{ fontSize: 10, color: T.gray, marginTop: 2 }}>#{t.rank}</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function TeamDetail({ name, onBack }) {
  const team = getTeam(name);
  const group = Object.entries(GROUPS).find(([, g]) => g.teams.includes(name))?.[0];
  const [showExtra, setShowExtra] = useState(false);
  const [liveSquad, setLiveSquad] = useState(null);
  const [squadLoading, setSquadLoading] = useState(false);

  useEffect(() => {
    const espnId = ESPN_TEAM_IDS[name];
    if (!espnId) return;
    setSquadLoading(true);
    fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${espnId}/roster`)
      .then(r => r.json())
      .then(data => {
        const players = (data.athletes || []).map(a => ({
          name: a.fullName || a.displayName || '',
          pos: ESPN_POS[a.position?.abbreviation] || a.position?.abbreviation || '?',
          club: '',
          jersey: a.jersey || '',
          xi: false,
        }));
        if (players.length) setLiveSquad(players);
        setSquadLoading(false);
      })
      .catch(() => setSquadLoading(false));
  }, [name]);

  const POS_COLORS = { GK: "#E8A838", DEF: "#3A8FE8", MID: "#2ECC71", FWD: "#E63946" };
  const POS_ORDER = ["GK", "DEF", "MID", "FWD"];

  const activeSquad = liveSquad || team.squad || [];
  const xi = activeSquad.filter(p => p.xi);
  const bench = activeSquad.filter(p => !p.xi);

  // Group by position
  const groupByPos = (players) => {
    const grouped = {};
    POS_ORDER.forEach(pos => {
      const g = players.filter(p => p.pos === pos);
      if (g.length) grouped[pos] = g;
    });
    return grouped;
  };

  const PlayerCard = ({ player, num }) => (
    <div style={{
      background: T.navyMid, borderRadius: 8, padding: "9px 10px",
      border: `1px solid ${T.navyLight}`,
      display: "flex", alignItems: "center", gap: 8,
    }}>
      <div style={{
        width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
        background: team.kit[0],
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 10, fontWeight: 800, color: team.kit[1],
        fontFamily: "'Barlow Condensed', sans-serif",
      }}>{num}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.name}</div>
        <div style={{ fontSize: 10, color: T.gray, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{player.club}</div>
      </div>
      <div style={{
        fontSize: 9, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif",
        color: POS_COLORS[player.pos] || T.gray,
        background: (POS_COLORS[player.pos] || T.gray) + "22",
        padding: "2px 5px", borderRadius: 4, letterSpacing: 0.5, flexShrink: 0,
      }}>{player.pos}</div>
    </div>
  );

  const SquadSection = ({ players, label }) => {
    if (!players.length) return null;
    const grouped = groupByPos(players);
    let counter = label === "BENCH & RESERVES" ? xi.length + 1 : 1;
    return (
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: 1.5, color: T.gold }}>{label}</div>
          <div style={{ height: 1, flex: 1, background: T.navyLight }} />
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: T.gray }}>{players.length} players</div>
        </div>
        {Object.entries(grouped).map(([pos, posPlayers]) => (
          <div key={pos} style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
              <div style={{ width: 3, height: 14, background: POS_COLORS[pos], borderRadius: 2 }} />
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, fontWeight: 700, color: POS_COLORS[pos], letterSpacing: 1 }}>
                {{GK:"GOALKEEPER", DEF:"DEFENDERS", MID:"MIDFIELDERS", FWD:"FORWARDS"}[pos]}
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
              {posPlayers.map(p => {
                const n = counter++;
                return <PlayerCard key={p.name} player={p} num={n} />;
              })}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ paddingBottom: 80 }}>
      {/* Hero */}
      <div style={{
        background: `linear-gradient(180deg, ${team.kit[0]}44 0%, ${T.navy} 100%)`,
        padding: "24px 16px 20px",
      }}>
        <button onClick={onBack} style={{
          background: T.navyMid, border: "none", color: T.white,
          padding: "6px 12px", borderRadius: 8, cursor: "pointer",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13,
          marginBottom: 16,
        }}>← BACK</button>

        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ fontSize: 64 }}>{team.flag}</div>
          <div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 32, lineHeight: 1 }}>{name}</div>
            <div style={{ color: T.gray, fontSize: 13, marginTop: 4 }}>{team.conf} · Group {group}</div>
            <div style={{ color: T.gold, fontSize: 13, fontWeight: 600, marginTop: 2 }}>FIFA Rank #{team.rank}</div>
          </div>
        </div>

        {/* Kit swatches */}
        <div style={{ marginTop: 16, display: "flex", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 11, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>KIT</span>
          {team.kit.map((c, i) => (
            <div key={i} style={{ width: 26, height: 26, borderRadius: "50%", background: c, border: `2px solid ${T.navyLight}`, boxShadow: `0 0 0 1px ${T.grayDark}` }} />
          ))}
          <div style={{ width: 26, height: 26, borderRadius: "50%", background: `linear-gradient(135deg, ${team.kit[0]} 50%, ${team.kit[1]} 50%)`, border: `2px solid ${T.navyLight}` }} />
          <div style={{ marginLeft: "auto", display: "flex", gap: 12 }}>
            {["GK","DEF","MID","FWD"].map(pos => (
              <div key={pos} style={{ textAlign: "center" }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, color: POS_COLORS[pos] }}>
                  {activeSquad.filter(p=>p.pos===pos).length}
                </div>
                <div style={{ fontSize: 9, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif" }}>{pos}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Squad */}
      <div style={{ padding: "16px" }}>
        {squadLoading && (
          <div style={{ textAlign: "center", padding: "24px 0", color: T.gray, fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, letterSpacing: 1 }}>
            LOADING SQUAD...
          </div>
        )}

        {!squadLoading && liveSquad && (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: T.gray, letterSpacing: 0.5 }}>
                Live roster from ESPN · {liveSquad.length} players
              </div>
            </div>
            <SquadSection players={liveSquad} label="FULL SQUAD" />
          </>
        )}

        {!squadLoading && !liveSquad && (
          <>
            <SquadSection players={xi} label="STARTING XI" />

            <div onClick={() => setShowExtra(!showExtra)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "10px 14px", borderRadius: 10,
              background: showExtra ? T.navyLight : T.navyMid,
              border: `1px solid ${T.navyLight}`,
              cursor: "pointer", marginBottom: showExtra ? 16 : 0,
            }}>
              <div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: 1.5, color: T.white }}>
                  BENCH & SQUAD
                </div>
                <div style={{ fontSize: 11, color: T.gray, marginTop: 2 }}>{bench.length} additional players</div>
              </div>
              <div style={{ color: T.gold, fontSize: 18 }}>{showExtra ? "▲" : "▼"}</div>
            </div>

            {showExtra && <SquadSection players={bench} label="BENCH & RESERVES" />}
          </>
        )}
      </div>
    </div>
  );
}

// ─── TAB: BRACKET ────────────────────────────────────────────────────────────

// Official FIFA WC 2026 bracket — slots are LOCKED from group results
const BRACKET_ROUNDS = [
  {
    id: "r32", label: "ROUND OF 32",
    matches: [
      { id:"M73", label:"Match 73", home:{group:"A",pos:2}, away:{group:"B",pos:2},                         nextMatch:"R16_1", nextSlot:"A" },
      { id:"M74", label:"Match 74", home:{group:"E",pos:1}, away:{group:"3rd",from:["A","B","C","D","F"]},  nextMatch:"R16_1", nextSlot:"B" },
      { id:"M75", label:"Match 75", home:{group:"F",pos:1}, away:{group:"C",pos:2},                         nextMatch:"R16_2", nextSlot:"A" },
      { id:"M76", label:"Match 76", home:{group:"C",pos:1}, away:{group:"F",pos:2},                         nextMatch:"R16_2", nextSlot:"B" },
      { id:"M77", label:"Match 77", home:{group:"I",pos:1}, away:{group:"3rd",from:["C","D","F","G","H"]},  nextMatch:"R16_3", nextSlot:"A" },
      { id:"M78", label:"Match 78", home:{group:"E",pos:2}, away:{group:"I",pos:2},                         nextMatch:"R16_3", nextSlot:"B" },
      { id:"M79", label:"Match 79", home:{group:"A",pos:1}, away:{group:"3rd",from:["C","E","F","H","I"]},  nextMatch:"R16_4", nextSlot:"A" },
      { id:"M80", label:"Match 80", home:{group:"L",pos:1}, away:{group:"3rd",from:["E","H","I","J","K"]},  nextMatch:"R16_4", nextSlot:"B" },
      { id:"M81", label:"Match 81", home:{group:"D",pos:1}, away:{group:"3rd",from:["B","E","F","I","J"]},  nextMatch:"R16_5", nextSlot:"A" },
      { id:"M82", label:"Match 82", home:{group:"G",pos:1}, away:{group:"3rd",from:["A","E","H","I","J"]},  nextMatch:"R16_5", nextSlot:"B" },
      { id:"M83", label:"Match 83", home:{group:"K",pos:2}, away:{group:"L",pos:2},                         nextMatch:"R16_6", nextSlot:"A" },
      { id:"M84", label:"Match 84", home:{group:"H",pos:1}, away:{group:"J",pos:2},                         nextMatch:"R16_6", nextSlot:"B" },
      { id:"M85", label:"Match 85", home:{group:"B",pos:1}, away:{group:"3rd",from:["E","F","G","I","J"]},  nextMatch:"R16_7", nextSlot:"A" },
      { id:"M86", label:"Match 86", home:{group:"J",pos:1}, away:{group:"H",pos:2},                         nextMatch:"R16_7", nextSlot:"B" },
      { id:"M87", label:"Match 87", home:{group:"K",pos:1}, away:{group:"3rd",from:["A","B","C","D","G"]},  nextMatch:"R16_8", nextSlot:"A" },
      { id:"M88", label:"Match 88", home:{group:"D",pos:2}, away:{group:"G",pos:2},                         nextMatch:"R16_8", nextSlot:"B" },
    ],
  },
  {
    id: "r16", label: "ROUND OF 16",
    matches: [
      { id:"R16_1", label:"R16 Match 1", home:{winnerOf:"M73"}, away:{winnerOf:"M74"}, nextMatch:"QF_1", nextSlot:"A" },
      { id:"R16_2", label:"R16 Match 2", home:{winnerOf:"M75"}, away:{winnerOf:"M76"}, nextMatch:"QF_1", nextSlot:"B" },
      { id:"R16_3", label:"R16 Match 3", home:{winnerOf:"M77"}, away:{winnerOf:"M78"}, nextMatch:"QF_2", nextSlot:"A" },
      { id:"R16_4", label:"R16 Match 4", home:{winnerOf:"M79"}, away:{winnerOf:"M80"}, nextMatch:"QF_2", nextSlot:"B" },
      { id:"R16_5", label:"R16 Match 5", home:{winnerOf:"M81"}, away:{winnerOf:"M82"}, nextMatch:"QF_3", nextSlot:"A" },
      { id:"R16_6", label:"R16 Match 6", home:{winnerOf:"M83"}, away:{winnerOf:"M84"}, nextMatch:"QF_3", nextSlot:"B" },
      { id:"R16_7", label:"R16 Match 7", home:{winnerOf:"M85"}, away:{winnerOf:"M86"}, nextMatch:"QF_4", nextSlot:"A" },
      { id:"R16_8", label:"R16 Match 8", home:{winnerOf:"M87"}, away:{winnerOf:"M88"}, nextMatch:"QF_4", nextSlot:"B" },
    ],
  },
  {
    id: "qf", label: "QUARTER FINALS",
    matches: [
      { id:"QF_1", label:"QF 1", home:{winnerOf:"R16_1"}, away:{winnerOf:"R16_2"}, nextMatch:"SF_1", nextSlot:"A" },
      { id:"QF_2", label:"QF 2", home:{winnerOf:"R16_3"}, away:{winnerOf:"R16_4"}, nextMatch:"SF_1", nextSlot:"B" },
      { id:"QF_3", label:"QF 3", home:{winnerOf:"R16_5"}, away:{winnerOf:"R16_6"}, nextMatch:"SF_2", nextSlot:"A" },
      { id:"QF_4", label:"QF 4", home:{winnerOf:"R16_7"}, away:{winnerOf:"R16_8"}, nextMatch:"SF_2", nextSlot:"B" },
    ],
  },
  {
    id: "sf", label: "SEMI FINALS",
    matches: [
      { id:"SF_1", label:"SF 1", home:{winnerOf:"QF_1"}, away:{winnerOf:"QF_2"}, nextMatch:"FINAL", nextSlot:"A" },
      { id:"SF_2", label:"SF 2", home:{winnerOf:"QF_3"}, away:{winnerOf:"QF_4"}, nextMatch:"FINAL", nextSlot:"B" },
    ],
  },
  {
    id: "final", label: "THE FINAL",
    matches: [
      { id:"FINAL", label:"Final", home:{winnerOf:"SF_1"}, away:{winnerOf:"SF_2"}, nextMatch:null, nextSlot:null },
    ],
  },
];

const MATCH_MAP = {};
BRACKET_ROUNDS.forEach(r => r.matches.forEach(m => { MATCH_MAP[m.id] = { ...m }; }));

const clearDownstream = (picks, matchId) => {
  const next = { ...picks };
  const visit = (mId) => {
    const m = MATCH_MAP[mId];
    if (!m || !m.nextMatch) return;
    delete next[m.nextMatch + "_W"];
    visit(m.nextMatch);
  };
  visit(matchId);
  return next;
};

// Resolve a slot definition → team name (or null if TBD)
function resolveSlot(slotDef, standings, picks) {
  if (!slotDef) return null;
  if (slotDef.winnerOf) return picks[slotDef.winnerOf + "_W"] || null;
  if (slotDef.group === "3rd") {
    const eligible = (standings || [])
      .filter(s => parseInt(s.rank) === 3 && slotDef.from.includes((s.group_name||"").replace("Group ","")))
      .sort((a,b) => (b.points||0)-(a.points||0) || (b.goal_diff||0)-(a.goal_diff||0));
    return eligible[0]?.team || eligible[0]?.team_name || `3rd·${slotDef.from.join("/")}`;
  }
  const entry = (standings || []).find(s =>
    (s.group_name||"").replace("Group ","") === slotDef.group && parseInt(s.rank) === slotDef.pos
  );
  return entry?.team || entry?.team_name || `G${slotDef.group}·#${slotDef.pos}`;
}

// ── WINNER PICKER MODAL ──
function WinnerPickerModal({ teamA, teamB, current, onSelect, onClose }) {
  if (!teamA || !teamB) return null;
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "#000d", zIndex: 200, display: "flex", alignItems: "flex-end" }}>
      <div onClick={e => e.stopPropagation()} style={{ background: "var(--bk-surface)", width: "100%", maxWidth: 430, margin: "0 auto", borderRadius: "20px 20px 0 0", border: "1px solid var(--bk-border-empty)", padding: "20px 18px 32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, color: "var(--bk-text-primary)" }}>WHO WINS?</div>
          <button onClick={onClose} style={{ background: "var(--bk-surface-hover)", border: "1px solid var(--bk-border-empty)", borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 16, color: "var(--bk-text-secondary)", flexShrink: 0 }}>✕</button>
        </div>
        <div style={{ fontSize: 12, color: "var(--bk-text-secondary)", marginBottom: 18 }}>Tap to pick the winner</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[teamA, teamB].map(name => {
            const t = getTeam(name);
            const isW = name === current;
            return (
              <div key={name} onClick={() => onSelect(name)} style={{ background: isW ? "var(--bk-active-card)" : "var(--bk-surface-hover)", border: `2px solid ${isW ? "var(--bk-border-active)" : "var(--bk-border-empty)"}`, borderRadius: 14, padding: "18px 10px", textAlign: "center", cursor: "pointer" }}>
                {t
                  ? <div style={{ fontSize: 44, lineHeight: 1, marginBottom: 10 }}>{t.flag}</div>
                  : <div style={{ fontSize: 32, lineHeight: 1, marginBottom: 10 }}>🏴</div>
                }
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: t ? 15 : 12, lineHeight: 1.3, color: "var(--bk-text-primary)" }}>{name}</div>
                {t && <div style={{ fontSize: 11, color: "var(--bk-text-secondary)", marginTop: 4 }}>Rank #{t.rank}</div>}
                {isW && <div style={{ marginTop: 8, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 12, color: "var(--bk-accent)" }}>✓ WINNER</div>}
              </div>
            );
          })}
        </div>
        {current && (
          <div onClick={() => onSelect(null)} style={{ marginTop: 14, padding: "10px", borderRadius: 10, background: T.red+"18", border: `1px solid ${T.red}44`, cursor: "pointer", textAlign: "center" }}>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, color: T.red }}>✕  Clear winner</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── TREE MATCH CARD (compact for tree view) ──
function TreeMatchCard({ match, teamA, teamB, winner, homeDef, awayDef, onPickWinner }) {
  const canPick = !!(teamA && teamB);
  const TeamRow = ({ team, slotDef }) => {
    const t = team ? getTeam(team) : null;
    const isW = winner === team && !!team;
    const tbd = !team && slotDef ? (
      slotDef.group === "3rd" ? `3rd·${slotDef.from.slice(0,2).join("/")}…` :
      slotDef.winnerOf ? `W·${slotDef.winnerOf}` :
      `G${slotDef.group}·#${slotDef.pos}`
    ) : "TBD";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 7px", minHeight: 26, background: isW ? "var(--bk-active-card)" : "transparent", borderLeft: `3px solid ${isW ? "var(--bk-border-active)" : "transparent"}`, borderRadius: "0 4px 4px 0" }}>
        {t ? (
          <>
            <span style={{ fontSize: 13, lineHeight: 1, flexShrink: 0 }}>{t.flag}</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, color: isW ? "var(--bk-accent)" : "var(--bk-text-primary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>{team}</span>
            {isW && <span style={{ fontSize: 9, flexShrink: 0 }}>🏆</span>}
          </>
        ) : team ? (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, fontWeight: 600, color: isW ? "var(--bk-accent)" : "var(--bk-text-primary)", opacity: 0.85, flex: 1 }}>{team}</span>
        ) : (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, color: "var(--bk-text-secondary)", opacity: 0.7 }}>{tbd}</span>
        )}
      </div>
    );
  };
  return (
    <div onClick={() => canPick && onPickWinner(match, teamA)} style={{ background: "var(--bk-surface)", border: `1px solid ${winner ? "var(--bk-border-active)" : "var(--bk-border-empty)"}`, borderRadius: 8, overflow: "hidden", cursor: canPick ? "pointer" : "default" }}>
      <TeamRow team={teamA} slotDef={homeDef} />
      <div style={{ height: 1, background: "var(--bk-border-empty)" }} />
      <TeamRow team={teamB} slotDef={awayDef} />
    </div>
  );
}

// ── TREE VIEW ──
function BracketTreeView({ standings, picks, onPickWinner }) {
  const CARD_H = 53;
  const BLOCK_H = 60;
  const CARD_W = 152;
  const CONN_W = 36;
  const COL_W = CARD_W + CONN_W;
  const LABEL_H = 28;
  const MAX = 16;
  const TOTAL_H = MAX * BLOCK_H + LABEL_H;
  const TOTAL_W = BRACKET_ROUNDS.length * COL_W;

  const cy = (rIdx, mIdx) => {
    const count = BRACKET_ROUNDS[rIdx].matches.length;
    const slotH = (MAX * BLOCK_H) / count;
    return LABEL_H + mIdx * slotH + slotH / 2;
  };

  const connectors = [];
  BRACKET_ROUNDS.forEach((round, rIdx) => {
    if (rIdx >= BRACKET_ROUNDS.length - 1) return;
    round.matches.forEach((match, mIdx) => {
      if (!match.nextMatch) return;
      const nextRound = BRACKET_ROUNDS[rIdx + 1];
      const nextIdx = nextRound.matches.findIndex(m => m.id === match.nextMatch);
      if (nextIdx < 0) return;
      const srcX = rIdx * COL_W + CARD_W;
      const srcY = cy(rIdx, mIdx);
      const dstX = (rIdx + 1) * COL_W;
      const dstY = cy(rIdx + 1, nextIdx);
      const midX = srcX + CONN_W / 2;
      connectors.push({ d: `M ${srcX} ${srcY} H ${midX} V ${dstY} H ${dstX}`, active: !!picks[match.id + "_W"] });
    });
  });

  return (
    <div style={{ overflowX: "auto", WebkitOverflowScrolling: "touch", marginBottom: 16 }}>
      <div style={{ position: "relative", width: TOTAL_W, height: TOTAL_H }}>
        <svg style={{ position: "absolute", top: 0, left: 0, width: TOTAL_W, height: TOTAL_H, pointerEvents: "none", overflow: "visible" }}>
          {connectors.map((c, i) => (
            <path key={i} d={c.d} fill="none" stroke={c.active ? "var(--bk-connector-active)" : "var(--bk-connector)"} strokeWidth="1.5" strokeLinecap="round" />
          ))}
        </svg>
        {BRACKET_ROUNDS.map((round, rIdx) => {
          const count = round.matches.length;
          const slotH = (MAX * BLOCK_H) / count;
          const x = rIdx * COL_W;
          return (
            <div key={round.id}>
              <div style={{ position: "absolute", left: x, top: 0, width: CARD_W, height: LABEL_H, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 1.5, textTransform: "uppercase", color: "var(--bk-text-secondary)", borderTop: "1px solid var(--bk-border-empty)" }}>
                {round.label}
              </div>
              {round.matches.map((match, mIdx) => {
                const topY = cy(rIdx, mIdx) - CARD_H / 2;
                const teamA = resolveSlot(match.home, standings, picks);
                const teamB = resolveSlot(match.away, standings, picks);
                const winner = picks[match.id + "_W"] || null;
                return (
                  <div key={match.id} style={{ position: "absolute", left: x, top: topY, width: CARD_W }}>
                    <TreeMatchCard match={match} teamA={teamA} teamB={teamB} winner={winner} homeDef={match.home} awayDef={match.away} onPickWinner={onPickWinner} />
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── LIST MATCH CARD ──
function BracketMatchCard({ match, standings, picks, onPickWinner }) {
  const teamA = resolveSlot(match.home, standings, picks);
  const teamB = resolveSlot(match.away, standings, picks);
  const winner = picks[match.id + "_W"] || null;
  const bothReady = teamA && teamB;
  const slotLabel = (s) => !s ? "TBD" : s.group === "3rd" ? `Best 3rd · ${s.from.join("/")}` : s.winnerOf ? `Winner of ${s.winnerOf}` : `Group ${s.group} · #${s.pos}`;

  const SlotRow = ({ team, slotDef }) => {
    const t = team ? getTeam(team) : null;
    const isW = winner === team && !!team;
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", minHeight: 40, borderRadius: 8, marginBottom: 4, background: isW ? "var(--bk-active-card)" : "var(--bk-surface-hover)", border: `${isW ? 2 : 1}px solid ${isW ? "var(--bk-border-active)" : "var(--bk-border-empty)"}`, borderLeft: `3px solid ${isW ? "var(--bk-border-active)" : "var(--bk-border-empty)"}`, opacity: !team ? 0.6 : 1 }}>
        {t ? (
          <>
            <span style={{ fontSize: 20 }}>{t.flag}</span>
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, flex: 1, color: isW ? "var(--bk-accent)" : "var(--bk-text-primary)" }}>{team}</span>
            {isW && <span style={{ fontSize: 14 }}>🏆</span>}
          </>
        ) : team ? (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 600, fontSize: 12, flex: 1, color: isW ? "var(--bk-accent)" : "var(--bk-text-primary)" }}>{team}</span>
        ) : (
          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 11, color: "var(--bk-text-secondary)", fontStyle: "italic" }}>{slotLabel(slotDef)}</span>
        )}
      </div>
    );
  };

  return (
    <div style={{ background: "var(--bk-surface)", borderRadius: 10, border: `1px solid ${winner ? "var(--bk-border-active)" : "var(--bk-border-empty)"}`, padding: "10px 12px", marginBottom: 8 }}>
      <div style={{ fontSize: 10, color: "var(--bk-text-secondary)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, marginBottom: 8 }}>{match.label}</div>
      <SlotRow team={teamA} slotDef={match.home} />
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 9, color: "var(--bk-text-secondary)", paddingLeft: 12, letterSpacing: 1, marginBottom: 4 }}>VS</div>
      <SlotRow team={teamB} slotDef={match.away} />
      {bothReady && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid var(--bk-border-empty)", display: "flex", alignItems: "center", gap: 6 }}>
          <span style={{ fontSize: 10, color: "var(--bk-text-secondary)", fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1, flexShrink: 0 }}>WINNER:</span>
          {[teamA, teamB].map(name => {
            const t = getTeam(name);
            const isW = winner === name;
            return (
              <div key={name} onClick={() => onPickWinner(match, name)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 6, padding: "6px 8px", borderRadius: 8, cursor: "pointer", background: isW ? "var(--bk-active-card)" : "transparent", border: `1px solid ${isW ? "var(--bk-border-active)" : "var(--bk-border-empty)"}` }}>
                <span style={{ fontSize: 16 }}>{t.flag}</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, color: isW ? "var(--bk-accent)" : "var(--bk-text-primary)" }}>{name}</span>
                {isW && <span style={{ fontSize: 10 }}>🏆</span>}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── BRACKET TAB ──
function BracketTab({ user, theme }) {
  const [picks, setPicks] = useState(() => ls.get("bracket_v6", {}));
  const [standings, setStandings] = useState([]);
  const [modal, setModal] = useState(null);
  const [viewMode, setViewMode] = useState("tree");
  const [isCapturing, setIsCapturing] = useState(false);
  const bracketRef = useRef(null);

  useEffect(() => {
    supabase.from("standings").select("*").then(({ data }) => { if (data) setStandings(data); });
  }, []);

  const saveBracket = (next) => {
    ls.set("bracket_v6", next);
    if (user) supabase.from("wc_brackets").upsert({ user_id: user.id, picks: next, updated_at: new Date().toISOString() }, { onConflict: "user_id" });
  };

  const handlePickWinner = (match, _pickedTeam) => {
    const teamA = resolveSlot(match.home, standings, picks);
    const teamB = resolveSlot(match.away, standings, picks);
    setModal({ match, current: picks[match.id + "_W"] || null, teamA, teamB });
  };

  const handleWinnerSelect = (winnerName) => {
    if (!modal) return;
    const { match } = modal;
    let next = { ...picks };
    if (winnerName === null) {
      delete next[match.id + "_W"];
      next = clearDownstream(next, match.id);
    } else {
      const prev = next[match.id + "_W"];
      next[match.id + "_W"] = winnerName;
      if (prev && prev !== winnerName) next = clearDownstream(next, match.id);
    }
    setPicks(next);
    saveBracket(next);
    setModal(null);
  };

  const resetAll = () => { setPicks({}); saveBracket({}); };

  const handleShare = async () => {
    if (!bracketRef.current) return;
    setIsCapturing(true);
    const nav = document.querySelector(".wc-bottomnav");
    if (nav) nav.classList.add("hide-for-capture");
    try {
      const html2canvas = (await import("html2canvas")).default;
      const el = bracketRef.current;
      const canvas = await html2canvas(el, {
        backgroundColor: theme === "dark" ? "#0d1b2a" : "#f5f7fa",
        scale: 2,
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
        windowWidth: el.scrollWidth,
        windowHeight: el.scrollHeight,
      });
      const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/png"));
      const file = new File([blob], "kickcast-bracket.png", { type: "image/png" });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ title: "My World Cup 2026 Bracket", text: "Check out my World Cup 2026 bracket predictions!", files: [file] });
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = "kickcast-bracket.png"; a.click();
        URL.revokeObjectURL(url);
      }
    } finally {
      if (nav) nav.classList.remove("hide-for-capture");
      setIsCapturing(false);
    }
  };

  const allMatches = BRACKET_ROUNDS.flatMap(r => r.matches);
  const decided = allMatches.filter(m => picks[m.id + "_W"]).length;
  const champion = picks["FINAL_W"];

  return (
    <div ref={bracketRef} style={{ padding: "16px", paddingBottom: 80, background: "var(--bk-page)", minHeight: "100%", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
        <div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: 2, color: "var(--bk-accent)" }}>BRACKET</div>
          <div style={{ fontSize: 13, color: "var(--bk-text-secondary)" }}>{decided}/{allMatches.length} matches decided</div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={handleShare} disabled={isCapturing} style={{ background: theme === "dark" ? "#c8f135" : "#1a6b4a", color: theme === "dark" ? "#0d1b2a" : "#ffffff", border: "none", padding: "6px 14px", borderRadius: 8, cursor: isCapturing ? "default" : "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, opacity: isCapturing ? 0.7 : 1, display: "flex", alignItems: "center", gap: 5 }}>
            <span style={{ fontSize: 14 }}>↑</span>{isCapturing ? "Capturing…" : "SHARE"}
          </button>
          <button onClick={resetAll} style={{ background: "var(--bk-surface)", border: "1px solid var(--bk-border-empty)", color: "var(--bk-text-secondary)", padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12 }}>RESET</button>
        </div>
      </div>

      <div style={{ display: "flex", marginBottom: 14, background: "var(--bk-surface)", border: "1px solid var(--bk-border-empty)", borderRadius: 8, padding: 3, gap: 3 }}>
        {[["tree", "⟶  TREE VIEW"], ["list", "☰  LIST VIEW"]].map(([mode, label]) => (
          <button key={mode} onClick={() => setViewMode(mode)} style={{ flex: 1, padding: "7px", border: "none", borderRadius: 6, cursor: "pointer", background: viewMode === mode ? "var(--bk-border-active)" : "transparent", color: viewMode === mode ? "#ffffff" : "var(--bk-text-secondary)", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13, transition: "all 0.15s" }}>{label}</button>
        ))}
      </div>

      <div style={{ background: "var(--bk-surface-hover)", borderLeft: "3px solid var(--bk-accent)", borderRadius: 6, padding: "8px 12px", marginBottom: 16, fontSize: 12, color: "var(--bk-text-primary)", lineHeight: 1.5 }}>
        💡 Teams locked from official group results. Tap a match to pick the winner — they auto-advance.
      </div>

      {viewMode === "tree"
        ? <BracketTreeView standings={standings} picks={picks} onPickWinner={handlePickWinner} />
        : BRACKET_ROUNDS.map(round => (
            <div key={round.id} style={{ marginBottom: 24 }}>
              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 15, letterSpacing: 2, color: "var(--bk-accent)", marginBottom: 10 }}>
                {round.label}
                <span style={{ color: "var(--bk-text-secondary)", fontSize: 11, fontWeight: 400, marginLeft: 8 }}>({round.matches.filter(m => picks[m.id + "_W"]).length}/{round.matches.length} decided)</span>
              </div>
              {round.matches.map(m => (
                <BracketMatchCard key={m.id} match={m} standings={standings} picks={picks} onPickWinner={handlePickWinner} />
              ))}
            </div>
          ))
      }

      {champion && (
        <div style={{ background: "var(--bk-active-card)", border: "1px solid var(--bk-border-active)", borderRadius: 12, padding: "16px", textAlign: "center", marginTop: 8 }}>
          <div style={{ fontSize: 40 }}>{getTeam(champion).flag}</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: "var(--bk-accent)", marginTop: 6 }}>🏆 {champion}</div>
          <div style={{ fontSize: 12, color: "var(--bk-text-secondary)", marginTop: 2 }}>Your predicted World Champion</div>
        </div>
      )}

      {modal && (
        <WinnerPickerModal teamA={modal.teamA} teamB={modal.teamB} current={modal.current} onSelect={handleWinnerSelect} onClose={() => setModal(null)} />
      )}
    </div>
  );
}

// ─── TAB: VOTE & PREDICT ─────────────────────────────────────────────────────

function VoteTab({ predictions, setPredictions, user }) {
  const [vote, setVote] = useState(() => ls.get("daily_vote", null));
  const [dbTallies, setDbTallies] = useState({ home: 0, draw: 0, away: 0 });
  const [predictOpen, setPredictOpen] = useState(null);
  const [scoreInput, setScoreInput] = useState({ home: 0, away: 0 });
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  useEffect(() => {
    supabase.rpc("get_vote_tallies").then(({ data }) => {
      if (!data) return;
      const t = { home: 0, draw: 0, away: 0 };
      data.forEach(r => { if (t[r.vote] !== undefined) t[r.vote] = Number(r.cnt); });
      setDbTallies(t);
    });
  }, []);

  if (!POLL_MATCH) return <div style={{ padding: 40, textAlign: "center", color: T.gray }}>Loading match data…</div>;
  const homeTeam = getTeam(POLL_MATCH.home);
  const awayTeam = getTeam(POLL_MATCH.away);

  const castVote = (choice) => {
    setVote(choice);
    ls.set("daily_vote", choice);
    setDbTallies(prev => ({ ...prev, [choice]: prev[choice] + 1 }));
    if (user) {
      supabase.from("wc_votes").upsert(
        { user_id: user.id, vote: choice, voted_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );
    }
  };

  const total = dbTallies.home + dbTallies.draw + dbTallies.away;
  const tallies = dbTallies;
  const pct = (n) => total === 0 ? 0 : Math.round((n / total) * 100);

  const openPredict = (fixture) => {
    const existing = predictions[fixture.id];
    setScoreInput({ home: existing?.homeScore ?? 0, away: existing?.awayScore ?? 0 });
    setPredictOpen(fixture);
  };

  const submitPrediction = () => {
    if (!predictOpen) return;
    const next = {
      ...predictions,
      [predictOpen.id]: { homeScore: scoreInput.home, awayScore: scoreInput.away },
    };
    setPredictions(next);
    ls.set("predictions", next);
    if (user) {
      supabase.from("wc_predictions").upsert(
        { user_id: user.id, match_id: predictOpen.id, home_score: scoreInput.home, away_score: scoreInput.away, updated_at: new Date().toISOString() },
        { onConflict: "user_id,match_id" }
      ).then(({ error }) => { if (error) alert("Prediction save failed: " + error.message); });
    } else {
      alert("Not logged in — prediction not saved to leaderboard");
    }
    setPredictOpen(null);
  };

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: 2, color: T.gold }}>VOTE & PREDICT</div>
        <div style={{ fontSize: 13, color: T.gray }}>Who will win today?</div>
      </div>

      {/* Daily Poll */}
      <div style={{ background: T.navyMid, borderRadius: 12, padding: 16, marginBottom: 20, border: `1px solid ${T.navyLight}` }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, letterSpacing: 1, marginBottom: 14 }}>
          🗳️ MATCH OF THE DAY
        </div>

        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 20, marginBottom: 16 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>{homeTeam.flag}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, marginTop: 4 }}>{POLL_MATCH.home}</div>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: T.gray }}>VS</div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: 40 }}>{awayTeam.flag}</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, marginTop: 4 }}>{POLL_MATCH.away}</div>
          </div>
        </div>

        {/* Vote buttons */}
        {!vote ? (
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[["home", `${homeTeam.flag} ${POLL_MATCH.home}`, T.gold], ["draw", "🤝 Draw", T.gray], ["away", `${awayTeam.flag} ${POLL_MATCH.away}`, T.red]].map(([key, label, color]) => (
              <button key={key} onClick={() => castVote(key)} style={{
                background: T.navyLight, border: `1px solid ${color}44`,
                color, padding: "10px 6px", borderRadius: 10, cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12,
                lineHeight: 1.3, textAlign: "center",
              }}>{label}</button>
            ))}
          </div>
        ) : (
          <div>
            {[["home", POLL_MATCH.home, T.gold, tallies.home], ["draw", "Draw", T.gray, tallies.draw], ["away", POLL_MATCH.away, T.red, tallies.away]].map(([key, label, color, count]) => (
              <div key={key} style={{ marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, color: vote === key ? color : T.white }}>
                    {vote === key ? "✓ " : ""}{label}
                  </span>
                  <span style={{ color, fontWeight: 800, fontFamily: "'Barlow Condensed', sans-serif" }}>{pct(count)}%</span>
                </div>
                <div style={{ height: 8, background: T.navyLight, borderRadius: 4, overflow: "hidden" }}>
                  <div style={{
                    height: "100%", borderRadius: 4,
                    background: color, width: `${pct(count)}%`,
                    transition: "width 0.8s ease",
                  }} />
                </div>
              </div>
            ))}
            <div style={{ fontSize: 11, color: T.gray, textAlign: "center", marginTop: 8 }}>
              {total.toLocaleString()} fans voted
            </div>
          </div>
        )}
      </div>

      {/* Score Predictions */}
      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 1, marginBottom: 12 }}>
        🔮 SCORE PREDICTIONS
      </div>

      {(() => {
        const upcomingAll = FIXTURES.filter(f => f.status === "Upcoming");
        const upcomingVisible = showAllUpcoming ? upcomingAll : upcomingAll.slice(0, 6);
        return (
          <>
            <div className="pred-grid">
              {upcomingVisible.map(fixture => {
                const pred = predictions[fixture.id];
                const h = getTeam(fixture.home);
                const a = getTeam(fixture.away);
                return (
                  <div key={fixture.id} className="pred-card" style={{
                    background: T.navyMid, borderRadius: 12, padding: 14,
                    border: `1px solid ${pred ? T.gold + "44" : T.navyLight}`,
                  }}>
                    <div style={{ fontSize: 13, color: T.gray, marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif" }}>{fixture.date} · {fixture.time}{fixture.venue ? ` · ${fixture.venue}` : ""}</div>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1 }}>
                        <span style={{ fontSize: 24 }}>{h.flag}</span>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14 }}>{fixture.home}</span>
                      </div>
                      <div style={{ textAlign: "center", padding: "0 10px" }}>
                        {pred ? (
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, color: T.gold }}>
                            {pred.homeScore} — {pred.awayScore}
                          </span>
                        ) : (
                          <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 14, color: T.gray }}>? — ?</span>
                        )}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>
                        <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14 }}>{fixture.away}</span>
                        <span style={{ fontSize: 24 }}>{a.flag}</span>
                      </div>
                    </div>
                    <button onClick={() => openPredict(fixture)} style={{
                      marginTop: 10, width: "100%", padding: "7px",
                      background: pred ? `${T.gold}22` : "transparent",
                      border: `1px solid ${pred ? T.gold : T.grayDark}`,
                      color: pred ? T.gold : T.gray,
                      borderRadius: 8, cursor: "pointer",
                      fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, letterSpacing: 1,
                    }}>
                      {pred ? "✓ EDIT PREDICTION" : "PREDICT SCORE"}
                    </button>
                  </div>
                );
              })}
            </div>
            {upcomingAll.length > 6 && (
              <button onClick={() => setShowAllUpcoming(v => !v)} style={{
                width: "100%", marginTop: 12, padding: "10px",
                background: "transparent", border: `1px solid ${T.navyLight}`,
                color: T.gold, borderRadius: 10, cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13, letterSpacing: 1,
              }}>
                {showAllUpcoming ? "▲ SHOW LESS" : `▼ SHOW MORE (${upcomingAll.length - 6} more matches)`}
              </button>
            )}
          </>
        );
      })()}

      {/* Prediction History */}
      {(() => {
        const history = FIXTURES.filter(f => f.status === "FT" && predictions[f.id]);
        if (!history.length) return null;
        return (
          <div style={{ marginTop: 28 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 18, letterSpacing: 1, marginBottom: 12 }}>
              📋 MY PREDICTION HISTORY
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
              {history.map(fixture => {
                const pred = predictions[fixture.id];
                const h = getTeam(fixture.home);
                const a = getTeam(fixture.away);
                const exact = pred.homeScore === fixture.homeScore && pred.awayScore === fixture.awayScore;
                const predHome = pred.homeScore, predAway = pred.awayScore;
                const actHome = fixture.homeScore ?? fixture.home_score ?? 0;
                const actAway = fixture.awayScore ?? fixture.away_score ?? 0;
                const correctResult = (predHome > predAway && actHome > actAway) ||
                  (predHome < predAway && actHome < actAway) ||
                  (predHome === predAway && actHome === actAway);
                const isExact = predHome === actHome && predAway === actAway;
                const badge = isExact ? { label: "🎯 EXACT", color: T.gold, pts: "+3 pts" }
                  : correctResult ? { label: "✅ CORRECT", color: "#4ade80", pts: "+1 pt" }
                  : { label: "❌ WRONG", color: T.red, pts: "0 pts" };
                return (
                  <div key={fixture.id} style={{
                    background: T.navyMid, borderRadius: 14,
                    padding: "14px 14px 12px",
                    border: `1px solid ${badge.color}44`,
                  }}>
                    {/* Top row */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                      <span style={{ fontSize: 12, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 0.5 }}>
                        GRP {fixture.group} · {fixture.date}
                      </span>
                      <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, color: badge.color }}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Teams + score */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 32 }}>{h.flag}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, marginTop: 3, color: T.white }}>{fixture.home}</div>
                      </div>
                      <div style={{ textAlign: "center", padding: "0 8px" }}>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: T.gold, letterSpacing: 2 }}>
                          {actHome}–{actAway}
                        </div>
                        <div style={{ fontSize: 10, color: T.gray, marginTop: 2, fontFamily: "'Barlow Condensed', sans-serif" }}>FULL TIME</div>
                      </div>
                      <div style={{ flex: 1, textAlign: "center" }}>
                        <div style={{ fontSize: 32 }}>{a.flag}</div>
                        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 12, marginTop: 3, color: T.white }}>{fixture.away}</div>
                      </div>
                    </div>

                    <div style={{ height: 1, background: "#3a4a6b", margin: "10px 0 4px" }} />

                    {/* Prediction result */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 4 }}>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, color: T.gold }}>
                        You: {predHome}–{predAway}
                      </div>
                      <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 11, color: badge.color }}>
                        {badge.pts}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}


      {/* Score input modal */}
      {predictOpen && (
        <div onClick={() => setPredictOpen(null)} style={{
          position: "absolute", inset: 0, background: "#000c", zIndex: 100,
          display: "flex", alignItems: "flex-end",
          minHeight: "100%",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: T.navyMid, width: "100%", padding: "24px 20px",
            borderRadius: "20px 20px 0 0", border: `1px solid ${T.navyLight}`,
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, marginBottom: 6 }}>
              PREDICT THE SCORE
            </div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>
              {predictOpen.home} vs {predictOpen.away} · {predictOpen.date}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 16 }}>
              {/* Home stepper */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{getTeam(predictOpen.home).flag}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, marginBottom: 10 }}>{predictOpen.home}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setScoreInput(s => ({ ...s, home: Math.max(0, s.home - 1) }))}
                    style={{ width: 36, height: 36, background: T.navyLight, border: "none", color: T.white, borderRadius: 8, cursor: "pointer", fontSize: 20, fontWeight: 700 }}>−</button>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 40, color: T.gold, minWidth: 32, textAlign: "center" }}>{scoreInput.home}</span>
                  <button onClick={() => setScoreInput(s => ({ ...s, home: Math.min(9, s.home + 1) }))}
                    style={{ width: 36, height: 36, background: T.navyLight, border: "none", color: T.white, borderRadius: 8, cursor: "pointer", fontSize: 20, fontWeight: 700 }}>+</button>
                </div>
              </div>

              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 24, color: T.gray }}>—</div>

              {/* Away stepper */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{getTeam(predictOpen.away).flag}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 13, marginBottom: 10 }}>{predictOpen.away}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <button onClick={() => setScoreInput(s => ({ ...s, away: Math.max(0, s.away - 1) }))}
                    style={{ width: 36, height: 36, background: T.navyLight, border: "none", color: T.white, borderRadius: 8, cursor: "pointer", fontSize: 20, fontWeight: 700 }}>−</button>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 40, color: T.gold, minWidth: 32, textAlign: "center" }}>{scoreInput.away}</span>
                  <button onClick={() => setScoreInput(s => ({ ...s, away: Math.min(9, s.away + 1) }))}
                    style={{ width: 36, height: 36, background: T.navyLight, border: "none", color: T.white, borderRadius: 8, cursor: "pointer", fontSize: 20, fontWeight: 700 }}>+</button>
                </div>
              </div>
            </div>

            <div style={{ marginTop: 8, textAlign: "center", fontSize: 12, color: T.gray }}>
              {scoreInput.home > scoreInput.away ? `${predictOpen.home} wins` : scoreInput.away > scoreInput.home ? `${predictOpen.away} wins` : "Draw"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
              <button onClick={() => setPredictOpen(null)} style={{ padding: 14, background: T.navyLight, border: "none", color: T.gray, borderRadius: 12, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15 }}>CANCEL</button>
              <button onClick={submitPrediction} style={{ padding: 14, background: T.gold, border: "none", color: T.navy, borderRadius: 12, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 15 }}>SUBMIT</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TAB: LEADERBOARD ────────────────────────────────────────────────────────
function LeaderboardTab() {
  const medals = ["🥇", "🥈", "🥉"];
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("leaderboard_view").select("*").limit(100)
      .then(({ data }) => { setUsers(data || []); setLoading(false); });
  }, []);

  const getName = (u) => u.display_name?.split("@")[0] || "Player";
  const getFlag = (u) => u.supporting_team ? getTeam(u.supporting_team).flag : "🌍";
  const getAcc  = (u) => u.total > 0 ? Math.round((u.correct / u.total) * 100) : 0;

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ marginBottom: 16 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: 2, color: T.gold }}>LEADERBOARD</div>
        <div style={{ fontSize: 13, color: T.gray }}>Top predictors this tournament</div>
      </div>

      {/* Scoring guide */}
      <div style={{ background: T.navyMid, borderRadius: 10, padding: "12px 14px", marginBottom: 16, border: `1px solid ${T.navyLight}` }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13, letterSpacing: 1, marginBottom: 8, color: T.gold }}>SCORING SYSTEM</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {[["Correct result", "+1 pt"], ["Exact score", "+3 pts"]].map(([label, pts]) => (
            <div key={label} style={{ display: "flex", justifyContent: "space-between", fontSize: 12 }}>
              <span style={{ color: T.gray }}>{label}</span>
              <span style={{ color: T.gold, fontWeight: 700 }}>{pts}</span>
            </div>
          ))}
        </div>
      </div>

      {loading && <div style={{ textAlign: "center", padding: 40, color: T.gray }}>Loading…</div>}

      {!loading && users.length === 0 && (
        <div style={{ textAlign: "center", padding: 40 }}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>🏆</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 18, color: T.white, marginBottom: 6 }}>No results yet</div>
          <div style={{ fontSize: 13, color: T.gray }}>Leaderboard fills once matches finish and predictions are scored</div>
        </div>
      )}

      {/* Top 3 podium */}
      {users.length >= 3 && (
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 10, marginBottom: 20 }}>
          {[users[1], users[0], users[2]].map((u, i) => {
            const heights = [110, 140, 90];
            const colors = [T.gray, T.gold, "#CD7F32"];
            const rank = [2, 1, 3];
            return (
              <div key={u.user_id} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 28, marginBottom: 4 }}>{getFlag(u)}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13 }}>{getName(u)}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: colors[i] }}>{u.pts}</div>
                <div style={{
                  height: heights[i], width: 80,
                  background: `linear-gradient(180deg, ${colors[i]}33, ${colors[i]}11)`,
                  border: `1px solid ${colors[i]}44`,
                  borderRadius: "8px 8px 0 0", marginTop: 6,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: colors[i],
                }}>{medals[rank[i] - 1]}</div>
              </div>
            );
          })}
        </div>
      )}

      {/* Full list */}
      {users.map((u, i) => (
        <div key={u.user_id} style={{
          background: i === 0 ? `${T.gold}15` : T.navyMid,
          border: `1px solid ${i === 0 ? T.gold + "44" : T.navyLight}`,
          borderRadius: 10, padding: "12px 14px", marginBottom: 8,
          display: "flex", alignItems: "center", gap: 12,
          animation: `fadeUp 0.4s ease ${i * 0.05}s both`,
        }}>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, color: i < 3 ? T.gold : T.gray, width: 24, textAlign: "center" }}>
            {i < 3 ? medals[i] : `${i + 1}`}
          </div>
          <div style={{ fontSize: 28 }}>{getFlag(u)}</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16 }}>{getName(u)}</div>
            <div style={{ fontSize: 11, color: T.gray }}>{u.correct}/{u.total} correct · {getAcc(u)}% accuracy</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: T.gold }}>{u.pts}</div>
            <div style={{ fontSize: 10, color: T.gray }}>pts</div>
          </div>
        </div>
      ))}

      <div style={{ textAlign: "center", padding: "16px 0", fontSize: 12, color: T.grayDark }}>
        🔒 Sign in to save your score · Coming in Phase 2
      </div>
    </div>
  );
}

// ─── STATS DATA ──────────────────────────────────────────────────────────────

// ─── TAB: MORE ───────────────────────────────────────────────────────────────
function MoreTab({ user, onSignIn, onChangeTeam }) {
  const [section, setSection] = useState("stats");
  const [statTab, setStatTab] = useState("goals");
  const [showChangePwd, setShowChangePwd] = useState(false);
  const [pwdData, setPwdData] = useState({ next: "", confirm: "" });
  const [pwdMsg, setPwdMsg] = useState("");
  const [displayName, setDisplayName] = useState(user?.user_metadata?.full_name || "");
  const [editingName, setEditingName] = useState(false);
  const [nameMsg, setNameMsg] = useState("");

  const handleChangePwd = async (e) => {
    e.preventDefault();
    setPwdMsg("");
    if (pwdData.next !== pwdData.confirm) { setPwdMsg("Passwords don't match"); return; }
    const { error } = await supabase.auth.updateUser({ password: pwdData.next });
    if (error) setPwdMsg(error.message);
    else { setPwdMsg("Password updated!"); setTimeout(() => { setShowChangePwd(false); setPwdMsg(""); setPwdData({ next: "", confirm: "" }); }, 1500); }
  };

  const handleUpdateName = async () => {
    const { error } = await supabase.auth.updateUser({ data: { full_name: displayName } });
    if (error) setNameMsg(error.message);
    else { setEditingName(false); setNameMsg(""); }
  };

  const inp = {
    width: "100%", padding: "10px 12px", borderRadius: 8,
    background: T.navyLight, border: `1px solid ${T.grayDark}`,
    color: T.white, fontFamily: "'Barlow', sans-serif", fontSize: 14, outline: "none",
  };

  return (
    <div style={{ padding: "16px", paddingBottom: 80 }}>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, letterSpacing: 2, color: T.gold }}>MORE</div>
        <div style={{ fontSize: 13, color: T.gray }}>Profile & Tournament Stats</div>
      </div>

      {/* Section toggle */}
      <div style={{ display: "flex", marginBottom: 20, background: T.navyLight, borderRadius: 10, padding: 3 }}>
        {[["stats", "📊  STATS"], ["profile", "👤  PROFILE"]].map(([id, label]) => (
          <button key={id} onClick={() => setSection(id)} style={{
            flex: 1, padding: "8px", border: "none", borderRadius: 8, cursor: "pointer",
            background: section === id ? T.gold : "transparent",
            color: section === id ? T.navy : T.gray,
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13,
            transition: "all 0.2s",
          }}>{label}</button>
        ))}
      </div>

      {/* Profile section */}
      {section === "profile" && (
        user ? (
          <>
            {/* Avatar + name card */}
            <div style={{ background: T.navyMid, borderRadius: 14, padding: "20px 16px", border: `1px solid ${T.navyLight}`, marginBottom: 12, textAlign: "center" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%", background: T.gold,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: T.navy,
                margin: "0 auto 12px",
              }}>
                {(user.user_metadata?.full_name?.[0] || user.email?.[0] || "?").toUpperCase()}
              </div>
              {editingName ? (
                <div style={{ display: "flex", gap: 8, justifyContent: "center", alignItems: "center", flexWrap: "wrap" }}>
                  <input value={displayName} onChange={e => setDisplayName(e.target.value)}
                    style={{ ...inp, width: "auto", flex: 1, minWidth: 140 }} />
                  <button onClick={handleUpdateName} style={{ padding: "8px 14px", background: T.gold, border: "none", borderRadius: 8, color: T.navy, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13 }}>SAVE</button>
                  <button onClick={() => { setEditingName(false); setNameMsg(""); }} style={{ padding: "8px 10px", background: T.navyLight, border: "none", borderRadius: 8, color: T.gray, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13 }}>✕</button>
                </div>
              ) : (
                <>
                  <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: T.white }}>
                    {user.user_metadata?.full_name || user.email?.split("@")[0]}
                  </div>
                  <div style={{ fontSize: 12, color: T.gray, marginTop: 4 }}>{user.email}</div>
                </>
              )}
              {nameMsg && <div style={{ fontSize: 11, color: T.red, marginTop: 6 }}>{nameMsg}</div>}
            </div>

            {/* Action rows */}
            {[
              { label: "Edit Profile", icon: "✏️", action: () => { setEditingName(true); setShowChangePwd(false); } },
              { label: "Change Password", icon: "🔒", action: () => { setShowChangePwd(v => !v); setEditingName(false); } },
              { label: "Change Team", icon: "🏳️", action: () => onChangeTeam?.() },
            ].map(({ label, icon, action }) => (
              <div key={label} onClick={action} style={{
                background: T.navyMid, borderRadius: 12, padding: "14px 16px",
                border: `1px solid ${T.navyLight}`, marginBottom: 8,
                display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
              }}>
                <span style={{ fontSize: 20 }}>{icon}</span>
                <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: T.white }}>{label}</span>
                <span style={{ marginLeft: "auto", color: T.gray, fontSize: 18 }}>›</span>
              </div>
            ))}

            {/* Change password form */}
            {showChangePwd && (
              <form onSubmit={handleChangePwd} style={{ background: T.navyMid, borderRadius: 12, padding: "16px", border: `1px solid ${T.navyLight}`, marginBottom: 8 }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 14, letterSpacing: 1, color: T.gold, marginBottom: 12 }}>CHANGE PASSWORD</div>
                <input type="password" placeholder="New password" required value={pwdData.next}
                  onChange={e => setPwdData(d => ({ ...d, next: e.target.value }))}
                  style={{ ...inp, marginBottom: 10 }} />
                <input type="password" placeholder="Confirm new password" required value={pwdData.confirm}
                  onChange={e => setPwdData(d => ({ ...d, confirm: e.target.value }))}
                  style={{ ...inp, marginBottom: 12 }} />
                {pwdMsg && (
                  <div style={{ fontSize: 12, color: pwdMsg.includes("updated") ? T.green : T.red, marginBottom: 10, padding: "8px 10px", background: (pwdMsg.includes("updated") ? T.green : T.red) + "18", borderRadius: 8 }}>
                    {pwdMsg}
                  </div>
                )}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                  <button type="button" onClick={() => { setShowChangePwd(false); setPwdMsg(""); setPwdData({ next: "", confirm: "" }); }}
                    style={{ padding: "10px", background: T.navyLight, border: "none", borderRadius: 8, color: T.gray, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13 }}>CANCEL</button>
                  <button type="submit"
                    style={{ padding: "10px", background: T.gold, border: "none", borderRadius: 8, color: T.navy, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 13 }}>UPDATE</button>
                </div>
              </form>
            )}

            {/* Sign out */}
            <div onClick={() => supabase.auth.signOut()} style={{
              background: T.red + "18", borderRadius: 12, padding: "14px 16px",
              border: `1px solid ${T.red}44`, marginTop: 4,
              display: "flex", alignItems: "center", gap: 12, cursor: "pointer",
            }}>
              <span style={{ fontSize: 20 }}>🚪</span>
              <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 16, color: T.red }}>Sign Out</span>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", padding: "40px 20px", background: T.navyMid, borderRadius: 14, border: `1px solid ${T.navyLight}` }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👤</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 20, color: T.white, marginBottom: 6 }}>Not signed in</div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 20 }}>Sign in to save your predictions and profile</div>
            <button onClick={onSignIn} style={{
              padding: "12px 32px", background: T.gold, border: "none", borderRadius: 10, color: T.navy,
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, cursor: "pointer",
            }}>SIGN IN</button>
          </div>
        )
      )}

      {/* Stats section */}
      {section === "stats" && (
        <div>
          {/* Stat sub-tabs */}
          <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
            {[["goals","⚽ SCORERS"], ["yellow","🟨 YELLOW"], ["red","🟥 RED"]].map(([id, label]) => (
              <button key={id} onClick={() => setStatTab(id)} style={{
                flex: 1, padding: "9px 4px",
                background: statTab === id ? T.gold : T.navyMid,
                border: `1px solid ${statTab === id ? T.gold : T.navyLight}`,
                borderRadius: 10, cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 11,
                color: statTab === id ? T.navy : T.gray,
                transition: "all 0.2s",
              }}>{label}</button>
            ))}
          </div>

          {(() => {
            const ftMatches = FIXTURES.filter(f => f.status === 'FT');

            if (statTab === "goals") {
              const map = {};
              for (const m of ftMatches) {
                for (const g of (m.goals || [])) {
                  if (g.own) continue;
                  if (!map[g.player]) map[g.player] = { player: g.player, team: g.team, goals: 0 };
                  map[g.player].goals++;
                }
              }
              const rows = Object.values(map).sort((a, b) => b.goals - a.goals);
              if (!rows.length) return <div style={{ textAlign: "center", padding: "40px 20px", color: T.gray, fontSize: 13 }}>No goals scored yet</div>;
              return rows.map((r, i) => (
                <div key={r.player} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.navyMid, borderRadius: 10, marginBottom: 8, border: `1px solid ${T.navyLight}` }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: i === 0 ? T.gold : T.gray, minWidth: 24 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: T.white }}>{r.player}</div>
                    <div style={{ fontSize: 11, color: T.gray }}>{r.team}</div>
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20, color: T.gold }}>{r.goals} ⚽</span>
                </div>
              ));
            }

            if (statTab === "yellow") {
              const map = {};
              for (const m of ftMatches) {
                for (const y of (m.yellowCards || [])) {
                  if (!map[y.player]) map[y.player] = { player: y.player, team: y.team, count: 0 };
                  map[y.player].count++;
                }
              }
              const rows = Object.values(map).sort((a, b) => b.count - a.count);
              if (!rows.length) return <div style={{ textAlign: "center", padding: "40px 20px", color: T.gray, fontSize: 13 }}>No yellow cards yet</div>;
              return rows.map((r, i) => (
                <div key={r.player} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.navyMid, borderRadius: 10, marginBottom: 8, border: `1px solid ${T.navyLight}` }}>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 18, color: T.gray, minWidth: 24 }}>{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: T.white }}>{r.player}</div>
                    <div style={{ fontSize: 11, color: T.gray }}>{r.team}</div>
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20 }}>🟨 {r.count}</span>
                </div>
              ));
            }

            if (statTab === "red") {
              const playerMap = {};
              for (const m of ftMatches) {
                for (const r of (m.redCards || [])) {
                  if (!r.player) continue;
                  if (!playerMap[r.player]) playerMap[r.player] = { team: r.team, count: 0, incidents: [] };
                  playerMap[r.player].count++;
                  playerMap[r.player].incidents.push({ match: `${m.home} vs ${m.away}`, minute: r.minute });
                }
              }
              const rows = Object.entries(playerMap).sort((a, b) => b[1].count - a[1].count);
              if (!rows.length) return <div style={{ textAlign: "center", padding: "40px 20px", color: T.gray, fontSize: 13 }}>No red cards yet</div>;
              return rows.map(([player, info], i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", background: T.navyMid, borderRadius: 10, marginBottom: 8, border: `1px solid ${T.navyLight}` }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15, color: T.white }}>{player}</div>
                    <div style={{ fontSize: 11, color: T.gray }}>{info.team}</div>
                    {info.incidents.map((inc, j) => (
                      <div key={j} style={{ fontSize: 11, color: T.grayDark, marginTop: 2 }}>{inc.match}{inc.minute ? ` · ${inc.minute}` : ""}</div>
                    ))}
                  </div>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 20 }}>🟥 {info.count}</span>
                </div>
              ));
            }
          })()}
        </div>
      )}
    </div>
  );
}

// ─── BOTTOM NAV ──────────────────────────────────────────────────────────────
const TABS = [
  { id: "fixtures", label: "Fixtures", icon: "🏟️" },
  { id: "vote",     label: "Vote",     icon: "🗳️" },
  { id: "teams",    label: "Teams",    icon: "👕" },
  { id: "bracket",  label: "Bracket",  icon: "🔮" },
  { id: "board",    label: "Board",    icon: "🏅" },
  { id: "more",     label: "More",     icon: "⋯" },
];

// ─── APP ─────────────────────────────────────────────────────────────────────
// ─── SIDE DRAWER ─────────────────────────────────────────────────────────────
function SideDrawer({ open, onClose, theme }) {
  return (
    <>
      {/* Backdrop */}
      {open && (
        <div onClick={onClose} style={{
          position: "absolute", inset: 0, background: "#000a",
          zIndex: 300, minHeight: "100%",
        }} />
      )}

      {/* Drawer panel */}
      <div className="wc-drawer" style={{
        position: "absolute", top: 0, right: 0,
        width: 280, height: "100%",
        background: T.navyMid, zIndex: 310,
        transform: open ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1)",
        display: "flex", flexDirection: "column",
        borderLeft: `1px solid ${T.navyLight}`,
        boxShadow: open ? "-8px 0 32px #0008" : "none",
        overflow: "hidden",
      }}>
        {/* Close button */}
        <div style={{ padding: "16px 16px 12px", display: "flex", justifyContent: "flex-end", flexShrink: 0 }}>
          <button onClick={onClose} style={{
            background: T.navyLight, border: "none", color: T.white,
            width: 36, height: 36, borderRadius: "50%", cursor: "pointer",
            fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
          }}>✕</button>
        </div>

        {/* Trophy image */}
        <div style={{ textAlign: "center", padding: "0 20px 16px", flexShrink: 0 }}>
          <img src="/trophy.png" alt="FIFA World Cup" style={{ height: 110, objectFit: "contain" }} />
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: T.navyLight, margin: "0 20px 16px", flexShrink: 0 }} />

        {/* Scrollable content */}
        <div style={{ padding: "0 20px", flex: 1, overflowY: "auto", scrollbarWidth: "thin" }}>

          {/* Info rows */}
          <div className="drawer-info-grid">
            {[
              { label: "EDITION", value: "23rd FIFA World Cup" },
              { label: "START DATE", value: "June 11, 2026" },
              { label: "FINAL", value: "July 19, 2026" },
              { label: "HOST NATIONS", value: "USA · Canada · Mexico" },
              { label: "VENUES", value: "16 Stadiums" },
              { label: "TEAMS", value: "48 Nations" },
              { label: "GROUPS", value: "12 Groups of 4" },
              { label: "FORMAT", value: "Group Stage + Knockouts" },
            ].map(({ label, value }) => (
              <div key={label} style={{
                display: "flex", flexDirection: "column", gap: 2,
                padding: "10px 0",
                borderBottom: `1px solid ${T.navyLight}`,
              }}>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 1.5, color: T.gray, fontWeight: 700 }}>{label}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 700, color: T.white }}>{value}</div>
              </div>
            ))}
          </div>

          {/* Theme */}
          <div style={{ marginTop: 16, padding: "12px 14px", background: T.gold+"18", borderRadius: 10, border: `1px solid ${T.gold}44` }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 1.5, color: T.gray, fontWeight: 700, marginBottom: 4 }}>THEME</div>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 15, fontWeight: 800, color: T.gold }}>"We Are 48"</div>
            <div style={{ fontSize: 12, color: T.gray, marginTop: 4, lineHeight: 1.5 }}>
              The first 48-team World Cup in history, celebrating unity across three host nations and every confederation on earth.
            </div>
          </div>

          {/* Host cities */}
          <div style={{ marginTop: 14, padding: "12px 14px", background: T.navyLight, borderRadius: 10 }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 10, letterSpacing: 1.5, color: T.gray, fontWeight: 700, marginBottom: 6 }}>KEY HOST CITIES</div>
            {[
              { city: "New York/NJ", flag: "🇺🇸" },
              { city: "Los Angeles", flag: "🇺🇸" },
              { city: "Dallas",      flag: "🇺🇸" },
              { city: "Mexico City", flag: "🇲🇽" },
              { city: "Toronto",     flag: "🇨🇦" },
            ].map(c => (
              <div key={c.city} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4, fontSize: 12, color: T.white }}>
                <span>{c.flag}</span><span>{c.city}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: "20px", borderTop: `1px solid ${T.navyLight}`,
          textAlign: "center",
        }}>
          <div style={{ fontSize: 11, color: T.gray, marginBottom: 6, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>
            DESIGNED & BUILT BY
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 800, fontSize: 16, color: T.white, marginBottom: 10 }}>
            Samsad Rashid
          </div>
          <a
            href="https://www.linkedin.com/in/samsadrashid"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px", borderRadius: 8,
              background: "#0A66C2", color: "#fff",
              textDecoration: "none",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 13,
              letterSpacing: 0.5,
            }}>
            <span style={{ fontSize: 14 }}>in</span>
            LinkedIn Profile
          </a>
          <div style={{ marginTop: 10, fontSize: 10, color: T.grayDark }}>
            Senior Product Designer · BRAC IT
          </div>
        </div>
      </div>
    </>
  );
}

// ─── SUPPORT PICKER MODAL ─────────────────────────────────────────────────────
const WC2026_TEAMS = [
  "Algeria","Argentina","Australia","Austria","Belgium","Bosnia-Herzegovina",
  "Brazil","Canada","Cape Verde","Colombia","Congo DR","Curaçao","Czechia",
  "Ecuador","Egypt","England","France","Germany","Ghana","Haiti","Iran","Iraq",
  "Ivory Coast","Japan","Jordan","Mexico","Morocco","Netherlands","New Zealand",
  "Nigeria","Norway","Panama","Paraguay","Portugal","Qatar","Saudi Arabia",
  "Scotland","Senegal","South Africa","South Korea","Spain","Sweden","Switzerland",
  "Tunisia","Türkiye","United States","Uruguay","Uzbekistan",
];

function SupportPickerModal({ onSave, onClose, currentTeam, currentCountry }) {
  const [selected, setSelected] = useState(currentTeam || null);
  const [countryFrom, setCountryFrom] = useState(currentCountry || "");
  const [editingCountry, setEditingCountry] = useState(false);
  const [search, setSearch] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (currentCountry) return;
    fetch("https://ipapi.co/json/")
      .then(r => r.json())
      .then(d => { if (d.country_name) setCountryFrom(d.country_name); })
      .catch(() => {});
  }, []);

  const filtered = WC2026_TEAMS.filter(t => t.toLowerCase().includes(search.toLowerCase()));

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    await onSave(selected, countryFrom);
    setSaving(false);
  };

  return (
    <div style={{
      position: "fixed", inset: 0, background: "#000d", zIndex: 500,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div style={{
        background: T.navyMid, borderRadius: 20, padding: "28px 24px",
        width: "100%", maxWidth: 480, maxHeight: "90vh", display: "flex",
        flexDirection: "column", border: `1px solid ${T.navyLight}`,
        boxShadow: "0 24px 64px #000a",
      }}>
        {/* Header */}
        <div style={{ position: "relative", textAlign: "center", marginBottom: 20 }}>
          {onClose && (
            <button onClick={onClose} style={{
              position: "absolute", top: 0, right: 0, background: "transparent",
              border: "none", color: T.gray, fontSize: 22, cursor: "pointer",
              lineHeight: 1, padding: 0,
            }}>✕</button>
          )}
          <div style={{ fontSize: 32, marginBottom: 8 }}>🏆</div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, color: T.white }}>
            Who are you supporting?
          </div>
          <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>
            Pick your team for FIFA World Cup 2026
          </div>
        </div>

        {/* Search */}
        <input
          placeholder="Search team..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10, fontSize: 14,
            background: T.navy, border: `1px solid ${T.grayDark}`, color: T.white,
            fontFamily: "'Barlow', sans-serif", outline: "none",
            marginBottom: 12, boxSizing: "border-box",
          }}
        />

        {/* Team grid */}
        <div style={{ overflowY: "auto", flex: 1, marginBottom: 16 }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
            {filtered.map(team => {
              const t = getTeam(team);
              const isSelected = selected === team;
              return (
                <button key={team} onClick={() => setSelected(team)} style={{
                  display: "flex", alignItems: "center", gap: 10,
                  padding: "10px 12px", borderRadius: 10, cursor: "pointer",
                  background: isSelected ? T.gold + "22" : T.navy,
                  border: `1.5px solid ${isSelected ? T.gold : T.navyLight}`,
                  transition: "all 0.15s", textAlign: "left",
                }}>
                  <span style={{ fontSize: 22 }}>{t.flag}</span>
                  <span style={{
                    fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
                    fontSize: 13, color: isSelected ? T.gold : T.white,
                    lineHeight: 1.2,
                  }}>{team}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Country from */}
        <div style={{
          background: T.navy, borderRadius: 10, padding: "12px 14px",
          marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <div style={{ fontSize: 11, color: T.gray, marginBottom: 2, fontFamily: "'Barlow Condensed', sans-serif", letterSpacing: 1 }}>YOUR COUNTRY</div>
            {editingCountry ? (
              <input
                autoFocus
                value={countryFrom}
                onChange={e => setCountryFrom(e.target.value)}
                onBlur={() => setEditingCountry(false)}
                onKeyDown={e => e.key === "Enter" && setEditingCountry(false)}
                style={{
                  background: "transparent", border: "none", outline: "none",
                  color: T.white, fontSize: 14, fontFamily: "'Barlow', sans-serif", width: 180,
                }}
              />
            ) : (
              <div style={{ fontSize: 14, color: T.white, fontFamily: "'Barlow', sans-serif" }}>
                {countryFrom || "Detecting…"}
              </div>
            )}
          </div>
          <button onClick={() => setEditingCountry(true)} style={{
            background: "transparent", border: `1px solid ${T.grayDark}`,
            color: T.gray, padding: "4px 10px", borderRadius: 6, cursor: "pointer",
            fontSize: 11, fontFamily: "'Barlow Condensed', sans-serif",
          }}>EDIT</button>
        </div>

        {/* Save */}
        <button onClick={handleSave} disabled={!selected || saving} style={{
          width: "100%", padding: "14px 0", borderRadius: 10, border: "none",
          background: selected ? T.gold : T.grayDark,
          color: selected ? T.navy : T.gray,
          cursor: selected ? "pointer" : "default",
          fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900,
          fontSize: 16, letterSpacing: 1, transition: "all 0.2s",
        }}>
          {saving ? "SAVING…" : selected ? `SUPPORT ${selected.toUpperCase()} ${getTeam(selected).flag}` : "SELECT A TEAM"}
        </button>
      </div>
    </div>
  );
}

// ─── AUTH MODAL ───────────────────────────────────────────────────────────────
function AuthModal({ onClose }) {
  const [mode, setMode] = useState("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); setInfo(""); setLoading(true);
    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setPassword(""); }
      else onClose();
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else setInfo("Check your email to confirm your account, then sign in.");
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin },
    });
  };

  const inp = {
    width: "100%", padding: "12px 14px", borderRadius: 10, fontSize: 14,
    background: T.navyLight, border: `1px solid ${T.grayDark}`, color: T.white,
    fontFamily: "'Barlow', sans-serif", outline: "none", boxSizing: "border-box",
  };

  return (
    <div onClick={onClose} style={{
      position: "fixed", inset: 0, background: "#000c", zIndex: 400,
      display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: T.navyMid, borderRadius: 20, padding: "32px 28px",
        width: "100%", maxWidth: 400, border: `1px solid ${T.navyLight}`,
        boxShadow: "0 24px 64px #000a",
      }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, marginBottom: 6 }}>
            <div style={{ width: 8, height: 8, borderRadius: "50%", background: T.gold }} />
            <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: 3, color: T.gold }}>
              FIFA WORLD CUP 2026
            </span>
          </div>
          <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 26, color: T.white }}>
            {mode === "signin" ? "Welcome Back" : "Create Account"}
          </div>
          <div style={{ fontSize: 13, color: T.gray, marginTop: 4 }}>
            {mode === "signin" ? "Sign in to save your predictions" : "Track and save your predictions"}
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{ display: "flex", background: T.navy, borderRadius: 10, padding: 4, marginBottom: 24 }}>
          {[["signin","Sign In"],["signup","Sign Up"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setInfo(""); setEmail(""); setPassword(""); }}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "none", cursor: "pointer",
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 14, letterSpacing: 0.5,
                background: mode === m ? T.gold : "transparent",
                color: mode === m ? T.navy : T.gray,
                transition: "all 0.2s",
              }}>{label}</button>
          ))}
        </div>

        {/* Google */}
        <button onClick={handleGoogle} style={{
          width: "100%", padding: "12px 0", borderRadius: 10, border: `1px solid ${T.grayDark}`,
          background: T.navyLight, color: T.white, cursor: "pointer", marginBottom: 16,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
          fontFamily: "'Barlow', sans-serif", fontWeight: 500, fontSize: 14,
          transition: "background 0.2s",
        }}>
          <svg width="18" height="18" viewBox="0 0 18 18"><path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/><path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/><path fill="#FBBC05" d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.348 2.827.957 4.042l3.007-2.332z"/><path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"/></svg>
          Continue with Google
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ flex: 1, height: 1, background: T.grayDark }} />
          <span style={{ fontSize: 12, color: T.grayDark }}>or</span>
          <div style={{ flex: 1, height: 1, background: T.grayDark }} />
        </div>

        {/* Email form */}
        <form onSubmit={handleSubmit}>
          <input type="email" placeholder="Email address" required value={email}
            onChange={e => setEmail(e.target.value)} style={{ ...inp, marginBottom: 12 }} />
          <input type="password" placeholder="Password" required value={password}
            onChange={e => setPassword(e.target.value)} style={{ ...inp, marginBottom: 16 }} />
          {error && <div style={{ fontSize: 12, color: T.red, marginBottom: 12, padding: "8px 12px", background: T.red + "18", borderRadius: 8 }}>{error}</div>}
          {info && <div style={{ fontSize: 12, color: T.green, marginBottom: 12, padding: "8px 12px", background: T.green + "18", borderRadius: 8 }}>{info}</div>}
          <button type="submit" disabled={loading} style={{
            width: "100%", padding: "13px 0", borderRadius: 10, border: "none",
            background: loading ? T.grayDark : T.gold, color: T.navy, cursor: loading ? "default" : "pointer",
            fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 16, letterSpacing: 1,
            transition: "background 0.2s",
          }}>
            {loading ? "…" : mode === "signin" ? "SIGN IN" : "CREATE ACCOUNT"}
          </button>
        </form>

      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState("fixtures");
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [predictions, setPredictions] = useState(() => ls.get("predictions", {}));
  const [predictModal, setPredictModal] = useState(null);
  const [detailsModal, setDetailsModal] = useState(null);
  const [scoreInput, setScoreInput] = useState({ home: 0, away: 0 });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [showTeamPicker, setShowTeamPicker] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const pendingPredictRef = useRef(null);
  const [dbStandings, setDbStandings] = useState([]);
  const [dataVersion, setDataVersion] = useState(0);
  const [fetchError, setFetchError] = useState(null);
  const [theme, setTheme] = useState(() => ls.get("theme", "dark"));

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    Object.assign(T, next === "dark" ? DARK_T : LIGHT_T);
    document.documentElement.setAttribute("data-theme", next);
    ls.set("theme", next);
    setTheme(next);
  };

  // Apply saved theme on first render
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    if (theme === "light") Object.assign(T, LIGHT_T);
  }, []);

  // Load live match data from Supabase + subscribe to realtime score updates
  useEffect(() => {
    supabase
      .from('matches')
      .select('*')
      .order('date', { ascending: true })
      .then(({ data, error }) => {
        if (error) { setFetchError(error.message); return; }
        if (data?.length) {
          FIXTURES = data.map(mapMatch);
          POLL_MATCH = FIXTURES.find(f => f.status === 'Live') || FIXTURES[0] || null;
          setDataVersion(v => v + 1);
        } else {
          setFetchError('No data returned from matches table');
        }
      })
      .catch(e => setFetchError(e.message));

    // Fetch standings
    supabase.from('standings').select('*').order('group_name').order('rank')
      .then(({ data }) => { if (data?.length) setDbStandings(data); });

    const channel = supabase
      .channel('matches-live')
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'matches' }, ({ new: row }) => {
        const updated = mapMatch(row);
        FIXTURES = FIXTURES.map(f => f.id === updated.id ? updated : f);
        POLL_MATCH = FIXTURES.find(f => f.status === 'Live') || POLL_MATCH;
        setDataVersion(v => v + 1);
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'standings' }, () => {
        supabase.from('standings').select('*').order('group_name').order('rank')
          .then(({ data }) => { if (data?.length) setDbStandings(data); });
      })
      .subscribe();

    return () => supabase.removeChannel(channel);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) loadUserData(session.user.id);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (event === "SIGNED_IN" && session?.user) loadUserData(session.user.id);
      if (event === "SIGNED_OUT") { setPredictions({}); setDataVersion(v => v + 1); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const loadUserData = async (userId) => {
    const [{ data: preds }, { data: bracket }, { data: voteRow }, { data: prof }] = await Promise.all([
      supabase.from("wc_predictions").select("match_id,home_score,away_score").eq("user_id", userId),
      supabase.from("wc_brackets").select("picks").eq("user_id", userId).maybeSingle(),
      supabase.from("wc_votes").select("vote").eq("user_id", userId).maybeSingle(),
      supabase.from("profiles").select("*").eq("user_id", userId).maybeSingle(),
    ]);
    if (preds?.length) {
      const map = {};
      preds.forEach(p => { map[p.match_id] = { homeScore: p.home_score, awayScore: p.away_score }; });
      setPredictions(map);
      ls.set("predictions", map);
    }
    if (bracket?.picks) ls.set("bracket_v5", bracket.picks);
    if (voteRow?.vote) ls.set("daily_vote", voteRow.vote);
    if (prof) {
      setProfile(prof);
    } else {
      setShowTeamPicker(true);
    }
    // Flush pending prediction made before login
    if (pendingPredictRef.current) {
      const { matchId, homeScore, awayScore } = pendingPredictRef.current;
      supabase.from("wc_predictions").upsert(
        { user_id: userId, match_id: matchId, home_score: homeScore, away_score: awayScore, updated_at: new Date().toISOString() },
        { onConflict: "user_id,match_id" }
      );
      const next = { ...ls.get("predictions", {}), [matchId]: { homeScore, awayScore } };
      setPredictions(next);
      ls.set("predictions", next);
      pendingPredictRef.current = null;
    }
    setDataVersion(v => v + 1);
    setShowAuth(false);
  };

  const saveProfile = async (supportingTeam, countryFrom) => {
    const { data: { user: freshUser } } = await supabase.auth.getUser();
    if (!freshUser) return;
    const row = { user_id: freshUser.id, supporting_team: supportingTeam, country_from: countryFrom, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("profiles").upsert(row, { onConflict: "user_id" });
    if (error) { alert("Save failed: " + error.message); return; }
    setProfile(prev => ({ ...(prev || {}), ...row }));
    setShowTeamPicker(false);
  };

  const openPredict = (fixture) => {
    const existing = predictions[fixture.id];
    setScoreInput({ home: existing?.homeScore ?? 0, away: existing?.awayScore ?? 0 });
    setPredictModal(fixture);
  };

  const submitPrediction = () => {
    if (!predictModal) return;
    if (!user) {
      // Hold prediction, prompt login — will be flushed in loadUserData after sign-in
      pendingPredictRef.current = { matchId: predictModal.id, homeScore: scoreInput.home, awayScore: scoreInput.away };
      setPredictModal(null);
      setShowAuth(true);
      return;
    }
    const next = {
      ...predictions,
      [predictModal.id]: { homeScore: scoreInput.home, awayScore: scoreInput.away },
    };
    setPredictions(next);
    ls.set("predictions", next);
    supabase.from("wc_predictions").upsert(
      { user_id: user.id, match_id: predictModal.id, home_score: scoreInput.home, away_score: scoreInput.away, updated_at: new Date().toISOString() },
      { onConflict: "user_id,match_id" }
    ).then(({ error }) => { if (error) alert("Prediction save failed: " + error.message); });
    setPredictModal(null);
  };

  return (
    <div className="wc-root" style={{
      background: T.navy, position: "relative", display: "flex", flexDirection: "column",
      overflow: "hidden",
    }}>
      <style>{makeGlobalStyle(T)}</style>

      {/* Top bar */}
      <div className="wc-topbar" style={{
        background: `linear-gradient(90deg, ${T.navyMid}, ${T.navy})`,
        padding: "14px 16px", display: "flex", alignItems: "center", justifyContent: "space-between",
        borderBottom: `1px solid ${T.navyLight}`,
        position: "sticky", top: 0, zIndex: 50,
      }}>
        {/* Left: Kickcast logo */}
        <div style={{ display: "flex", alignItems: "center", cursor: "pointer" }} onClick={() => setTab("fixtures")}>
          <img
            src={theme === "dark" ? "/logo-dark.png" : "/logo-light.png"}
            alt="KickCast"
            style={{ height: 30, objectFit: "contain" }}
          />
        </div>

        {/* Right: trophy + auth + theme + burger */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Trophy */}
          <img src="/trophy.png" alt="FIFA World Cup" className="topbar-trophy" style={{ height: 38, objectFit: "contain" }} />

          {/* Auth area */}
          {user ? (
            <div style={{ position: "relative" }}>
              <button onClick={() => setUserMenuOpen(o => !o)} style={{
                width: 36, height: 36, borderRadius: "50%", background: T.gold,
                border: "none", cursor: "pointer", display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: profile?.supporting_team ? 20 : 14,
                fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, color: T.navy,
              }}>
                {profile?.supporting_team ? getTeam(profile.supporting_team).flag : (user.user_metadata?.full_name?.[0] || user.email?.[0] || "?").toUpperCase()}
              </button>
              {userMenuOpen && (
                <div style={{
                  position: "absolute", top: 44, right: 0, background: T.navyMid,
                  border: `1px solid ${T.navyLight}`, borderRadius: 12, padding: 8,
                  minWidth: 200, zIndex: 210, boxShadow: "0 8px 24px #0008",
                }}>
                  {/* Profile info */}
                  <div style={{ padding: "8px 10px", borderBottom: `1px solid ${T.navyLight}`, marginBottom: 4 }}>
                    <div style={{ fontSize: 12, color: T.gray, marginBottom: 6 }}>{user.email}</div>
                    {profile?.supporting_team && (
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                        <span style={{ fontSize: 20 }}>{getTeam(profile.supporting_team).flag}</span>
                        <div>
                          <div style={{ fontSize: 12, color: T.gold, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, letterSpacing: 0.5 }}>SUPPORTING</div>
                          <div style={{ fontSize: 13, color: T.white, fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700 }}>{profile.supporting_team}</div>
                        </div>
                      </div>
                    )}
                    {profile?.country_from && (
                      <div style={{ fontSize: 12, color: T.gray }}>🌍 From: {profile.country_from}</div>
                    )}
                  </div>
                  <button onClick={async () => { await supabase.auth.signOut(); setProfile(null); setUserMenuOpen(false); }} style={{
                    width: "100%", padding: "8px 10px", background: "transparent", border: "none",
                    color: T.red, cursor: "pointer", textAlign: "left", borderRadius: 6,
                    fontFamily: "'Barlow', sans-serif", fontSize: 13,
                  }}>
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{
              background: "transparent", border: `1px solid ${T.gold}55`,
              color: T.gold, padding: "5px 11px", borderRadius: 7, cursor: "pointer",
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 12, letterSpacing: 0.5,
            }}>
              SIGN IN
            </button>
          )}

          {/* Theme toggle */}
          <button onClick={toggleTheme} title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"} style={{
            background: "transparent", border: `1px solid ${T.navyLight}`,
            borderRadius: 8, width: 32, height: 32, cursor: "pointer",
            display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16,
          }}>
            {theme === "dark" ? "☀️" : "🌙"}
          </button>

          {/* Burger button */}
          <button onClick={() => setDrawerOpen(true)} style={{
            background: "transparent", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", gap: 4,
            padding: "4px", alignItems: "flex-end",
          }}>
            <div style={{ width: 20, height: 2, background: T.gold, borderRadius: 2 }} />
            <div style={{ width: 14, height: 2, background: T.gold, borderRadius: 2 }} />
            <div style={{ width: 17, height: 2, background: T.gold, borderRadius: 2 }} />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="wc-content" style={{ overflowY: "auto", flex: 1, minHeight: 0 }}>
        <div className="wc-inner">
          {tab === "fixtures" && <FixturesTab predictions={predictions} onPredictOpen={openPredict} onViewDetails={f => setDetailsModal(f)} fetchError={fetchError} />}
          {tab === "teams" && <TeamsTab selectedTeam={selectedTeam} dbStandings={dbStandings} onTeamOpen={(name) => { setSelectedTeam(name); if (name) setTab("teams"); }} />}
          {tab === "bracket" && <BracketTab key={`bracket-${dataVersion}`} user={user} theme={theme} />}
          {tab === "vote" && <VoteTab key={`vote-${dataVersion}`} predictions={predictions} setPredictions={setPredictions} user={user} />}
          {tab === "board" && <LeaderboardTab />}
          {tab === "more" && <MoreTab user={user} onSignIn={() => setShowAuth(true)} onChangeTeam={() => setShowTeamPicker(true)} />}
        </div>
      </div>

      {/* Desktop Sidebar Nav — hidden on mobile via CSS */}
      <div className="wc-sidebar" style={{ display: "none" }}>
        <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 13, letterSpacing: 2, color: T.gold, padding: "4px 14px 12px", borderBottom: `1px solid ${T.navyLight}`, marginBottom: 4 }}>
          NAVIGATION
        </div>
        {TABS.map(t => (
          <button key={t.id} className={"wc-sidebar-btn" + (tab === t.id ? " active" : "")}
            onClick={() => { setTab(t.id); if (t.id !== "teams") setSelectedTeam(null); }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span>{t.label}</span>
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ padding: "12px 14px", borderTop: `1px solid ${T.navyLight}`, fontSize: 11, color: T.grayDark, fontFamily: "'Barlow Condensed', sans-serif" }}>
          FIFA World Cup 2026™
        </div>
      </div>

      {/* Bottom Nav — floating pill */}
      <div className="wc-bottomnav" style={{
        background: T.navyMid,
        border: `1px solid ${T.navyLight}`,
        display: "flex", zIndex: 50, padding: "6px 12px", gap: 4,
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => { setTab(t.id); if (t.id !== "teams") setSelectedTeam(null); }}
            style={{
              flex: 1, minWidth: 54, padding: "8px 10px 6px",
              background: tab === t.id ? T.gold + "22" : "transparent",
              border: "none", borderRadius: 10,
              cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 2,
              transition: "all 0.2s",
            }}>
            <span style={{ fontSize: 18, color: tab === t.id ? T.gold : T.white }}>{t.icon}</span>
            <span style={{
              fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700,
              fontSize: 9, letterSpacing: 0.5,
              color: tab === t.id ? T.gold : T.gray,
            }}>{t.label.toUpperCase()}</span>
          </button>
        ))}
      </div>

      {/* Global predict modal */}
      {detailsModal && (
        <MatchDetailsModal
          fixture={detailsModal}
          userPrediction={predictions[detailsModal.id]}
          onClose={() => setDetailsModal(null)}
        />
      )}

      {predictModal && (
        <div onClick={() => setPredictModal(null)} style={{
          position: "absolute", inset: 0, background: "#000c", zIndex: 100,
          display: "flex", alignItems: "flex-end", minHeight: "100%",
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            background: T.navyMid, width: "100%", maxWidth: 430,
            margin: "0 auto", padding: "24px 20px", borderRadius: "20px 20px 0 0",
            border: `1px solid ${T.navyLight}`,
          }}>
            <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 22, marginBottom: 4 }}>
              PREDICT THE SCORE
            </div>
            <div style={{ fontSize: 13, color: T.gray, marginBottom: 24 }}>
              {predictModal.home} vs {predictModal.away} · {predictModal.date}
            </div>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 20 }}>
              {/* Home */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>{getTeam(predictModal.home).flag}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, margin: "6px 0 10px" }}>{predictModal.home}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setScoreInput(s => ({ ...s, home: Math.max(0, s.home - 1) }))}
                    style={{ width: 36, height: 36, background: scoreInput.home === 0 ? T.navy : T.navyLight, border: "none", color: scoreInput.home === 0 ? T.grayDark : T.white, borderRadius: 8, cursor: scoreInput.home === 0 ? "default" : "pointer", fontSize: 20 }}>−</button>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 44, color: T.gold, minWidth: 36, textAlign: "center" }}>{scoreInput.home}</span>
                  <button onClick={() => setScoreInput(s => ({ ...s, home: Math.min(9, s.home + 1) }))}
                    style={{ width: 36, height: 36, background: T.navyLight, border: "none", color: T.white, borderRadius: 8, cursor: "pointer", fontSize: 20 }}>+</button>
                </div>
              </div>

              <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 28, color: T.gray, marginTop: 20 }}>—</div>

              {/* Away */}
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 32 }}>{getTeam(predictModal.away).flag}</div>
                <div style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 12, margin: "6px 0 10px" }}>{predictModal.away}</div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <button onClick={() => setScoreInput(s => ({ ...s, away: Math.max(0, s.away - 1) }))}
                    style={{ width: 36, height: 36, background: scoreInput.away === 0 ? T.navy : T.navyLight, border: "none", color: scoreInput.away === 0 ? T.grayDark : T.white, borderRadius: 8, cursor: scoreInput.away === 0 ? "default" : "pointer", fontSize: 20 }}>−</button>
                  <span style={{ fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 44, color: T.gold, minWidth: 36, textAlign: "center" }}>{scoreInput.away}</span>
                  <button onClick={() => setScoreInput(s => ({ ...s, away: Math.min(9, s.away + 1) }))}
                    style={{ width: 36, height: 36, background: T.navyLight, border: "none", color: T.white, borderRadius: 8, cursor: "pointer", fontSize: 20 }}>+</button>
                </div>
              </div>
            </div>

            <div style={{ textAlign: "center", marginTop: 10, fontSize: 13, color: T.gray, fontFamily: "'Barlow Condensed', sans-serif" }}>
              {scoreInput.home > scoreInput.away ? `${predictModal.home} wins` : scoreInput.away > scoreInput.home ? `${predictModal.away} wins` : "Draw"}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginTop: 20 }}>
              <button onClick={() => setPredictModal(null)} style={{ padding: 14, background: T.navyLight, border: "none", color: T.gray, borderRadius: 12, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 700, fontSize: 15 }}>CANCEL</button>
              <button onClick={submitPrediction} style={{ padding: 14, background: T.gold, border: "none", color: T.navy, borderRadius: 12, cursor: "pointer", fontFamily: "'Barlow Condensed', sans-serif", fontWeight: 900, fontSize: 15 }}>SUBMIT</button>
            </div>
          </div>
        </div>
      )}

      {/* Side drawer */}
      <SideDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} theme={theme} />

      {/* Auth modal */}
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}

      {/* Close user menu on outside click */}
      {userMenuOpen && (
        <div onClick={() => setUserMenuOpen(false)}
          style={{ position: "fixed", inset: 0, zIndex: 190 }} />
      )}

      {/* Support picker — rendered last so it's always on top */}
      {showTeamPicker && <SupportPickerModal onSave={saveProfile} onClose={() => setShowTeamPicker(false)} currentTeam={profile?.supporting_team} currentCountry={profile?.country_from} />}
    </div>
  );
}
