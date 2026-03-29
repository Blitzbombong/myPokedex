
const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
let allPokemon = [];
let currentId = 1;
let allPokemonNames = [];

async function init() {
    // 1. Zuerst laden wir die Masterliste im Hintergrund (sehr wichtig!)
    // Wir nutzen kein "await", damit die ersten 20 Pokemon 
    // nicht auf die 1000 Namen warten müssen.
    loadAllPokemonNames(); 

    // 2. Dann laden und zeigen wir die ersten 20 Pokemon an
    await renderPokemonData();
}

// Hilfsfunktion um einen Bereich von Pokémons zu laden
async function fetchPokemonRange(startId, limit) {
    const newPokemon = [];
    for (let i = startId; i < startId + limit; i++) {
        try {
            const response = await fetch(`${BASE_URL}${i}`);
            const data = await response.json();
            newPokemon.push(data);
        } catch (error) {
            console.error(`Fehler bei ID ${i}:`, error);
        }
    }
    return newPokemon;
}


// Pokemon Rendern
async function renderPokemonData() {
    const container = document.getElementById("pokedex-container");
    const limit = 20;

    toggleSpinner(true); // 1. UI: Start
    
    const newBatch = await fetchPokemonRange(currentId, limit); // 2. Daten holen
    allPokemon.push(...newBatch); // 3. Globalen State füllen
    
    toggleSpinner(false); // 4. UI: Ende
    
    // 5. Rendern
    const html = newBatch.map(pokemon => cardTemplate(pokemon)).join('');
    container.insertAdjacentHTML('beforeend', html);
    
    currentId += limit; // 6. Logik
}

document.getElementById('load-more-btn').addEventListener('click', renderPokemonData);

// Funktion zum Pokemon suchen filtern
async function searchPokemon() {
    // Wir holen uns den Suchbegriff aus dem Input-Feld
    let searchTerm = document.getElementById('pokemon-search').value.toLowerCase().trim(); // Kleinbuchstaben und Leerzeichen entfernen
    let container = document.getElementById("pokedex-container");
    let loadMoreContainer = document.getElementById("more-pokemon-container");

    // 1 SCHRITT: Wenn der Suchbegriff leer ist, zurück zu normal zustand
    if (searchTerm === '') {
        renderCards(allPokemon);                   // Alle Pokémons anzeigen
        loadMoreContainer.style.display = 'flex'; // Lade-Button anzeigen
        return;                                   // Funktion beenden
    }

    loadMoreContainer.style.display = 'none'; // Lade-Button verstecken

    // 2 SCHRITT: Perfomance-Check - Wir erst ab 3 Buchstaben suchen
    if (searchTerm.length < 3) {
        return;                                 // Wir machen noch nichts warten auf mehr Buchstaben
    }
    
    // 3 SCHRITT: In der Masterliste filtern
    let foundMatches = allPokemonNames.filter(p => p.name.includes(searchTerm));

    if (foundMatches.length > 0) {
        container.innerHTML = "";                       // Container leeren
        
        // Nur die ersten 10 Ergebnisse anzeigen
        let matchesToShow = foundMatches.slice(0, 10); // 10 ist die Anzahl der zu zeigen Ergebnisse

        for (let match of matchesToShow) {
            // Prüfen, ob das Pokémon bereits in allPokemon geladen ist
            let existingPokemon = allPokemon.find(p => p.name === match.name);
            
            if (existingPokemon) {
                // Wenn ja, direkt rendern
                container.innerHTML += cardTemplate(existingPokemon);
            } else {
                // Wenn nicht, Pokémon Daten von der API holen
                try {
                    let response = await fetch(match.url);
                    let pokemon = await response.json();
                    container.innerHTML += cardTemplate(pokemon);
                } catch (error) {
                    console.error("Fehler beim Laden des Pokémons ", error);
                }
            }
        } 
    } else {
        // SCHRITT E: Nichts gefunden
        container.innerHTML = `<p class="error-msg">Kein Pokémon mit "${searchTerm}" gefunden.</p>`;
    }
}

document.getElementById('pokemon-search').addEventListener('input', searchPokemon);
//document.getElementById('search-button').addEventListener('click', searchPokemon);

// Diese Funkktion muss beim Start laufen 



// Wie laden alle Pokémonnamen für die Autovervollständigung
async function loadAllPokemonNames() {
    const url = "https://pokeapi.co/api/v2/pokemon?limit=1025&offset=0";
    try {
        let response = await fetch(url);
        let data = await response.json();
        allPokemonNames = data.results;
    } catch (error) {
        console.error("Fehler beim Laden der Pokémon Namen:", error);   
    }
}


// Diese Funktion ist unser Maler
function renderCards(pokemonArray) {
    let container = document.getElementById("pokedex-container");
    container.innerHTML = ""; // Leeren des Containers

    let htmlCollector = "";

    for (let i = 0; i < pokemonArray.length; i++) {
        htmlCollector += cardTemplate(pokemonArray[i]);

    }
    // Alles auf einmal in den Container schreiben
    container.innerHTML = htmlCollector;
}


// Dialog für Pokémon Details öffnen
function openPokemonDetail(Id) {
    // 1. Wir suchen das Pokemon mit deiser ID in allPokemon
    const pokemon = allPokemon.find(p => p.id === Id);

    if (pokemon) {
        // 2. Wir holen uns den Dialog
        const modal = document.getElementById("pokemon-modal");

        // 3. Wir füllen den Dialog mit den Details des Pokémons
        modal.innerHTML = detailTemplate(pokemon);

        // 4. Wir öffnen den Dialog
        modal.showModal();
    }
}



// Wir übergeben das 'event' an die Funktion
function closePokemonDetail(event) {
    const modal = document.getElementById("pokemon-modal");
    // Wir prüfen, ob der Klick außerhalb des Inhaltsbereichs war
    if (event.target.id === modal.id) {
        modal.close();
    }
}


// Dialog schließen
function forceCloseModal() {
    const modal = document.getElementById("pokemon-modal");
    modal.close();
}


// Switch für die Pokemon Info
function switchTab(pokemonName, section) {
    const container = document.getElementById("details-content");

    // Wir suchen uns die Pokemon Daten aus allPokemon
    const pokemon = allPokemon.find(p => p.name === pokemonName);

    if (section === 'main') {
        container.innerHTML = renderMainInfo(pokemon);
    } else if (section === 'stats') {
        container.innerHTML = renderStats(pokemon);
    } else if (section === 'evo') {
        container.innerHTML = renderEvoChain(pokemon);
    }
}


// Die Funktin holt die Evo Chain API Daten
async function getEvoChainData(pokemon) {
    // 1 Wie brauchen die Species Daten
    const speciesResponse = await fetch(pokemon.species.url);
    const speciesData = await speciesResponse.json();

    // 2. Jetzt holen wir die egentliche Evolutionskette
    const evoResponse = await fetch(speciesData.evolution_chain.url);
    const evoData = await evoResponse.json();

    return evoData.chain; // Das ist der Startpunkt der Kette
}


// Wir wandeln diese Objekte in eine einfache Liste um
function flattenEvoChain(chain) {
    let evoList = [];
    let currentStep = chain;

    // Wir laufen so lange durch, bis es keine weiteren Entwicklungen gibt
    while (currentStep) {
        evoList.push(currentStep.species.name);
        currentStep = currentStep.evolves_to[0]; // Nächster Schritt
    }

    return evoList; // Ergebnis: z.B. ['bulbasaur', 'ivysaur', 'venusaur']
}


// Wir starten die App
init();