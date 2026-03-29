const BASE_URL = "https://pokeapi.co/api/v2/pokemon/";
let allPokemon = [];
let currentId = 1;
let allPokemonNames = [];

/**
 * Initialisiert the app by loading the master list of all Pokémon names in the background and then rendering the first 20 Pokémon.
 * This function does not wait for the master list to be loaded before rendering the first 20 Pokémon.
 */
async function init() {
  loadAllPokemonNames();
  await renderPokemonData();
}

/**
 * Fetches a range of Pokémon from the PokeAPI and returns them in an array.
 * The range is defined by the startId and limit parameters.
 * If an error occurs while fetching a Pokémon, it will be logged to the console.
 * @param {number} startId - The ID of the first Pokémon to fetch.
 * @param {number} limit - The number of Pokémon to fetch.
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of Pokémon objects.
 */
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

/**
 * Renders a batch of Pokémon cards based on the global `allPokemon` array and increments the `currentId` by the batch size.
 * The function first shows a loading spinner, then fetches a new batch of Pokémon from the PokeAPI, appends the new batch to the global `allPokemon` array, hides the loading spinner and finally renders the new batch of Pokémon cards.
 * @returns {Promise<void>} A promise that resolves when the function has finished rendering the new batch of Pokémon cards.
 */
async function renderPokemonData() {
  const container = document.getElementById("pokedex-container");
  const limit = 20;

  toggleSpinner(true);

  const newBatch = await fetchPokemonRange(currentId, limit);
  allPokemon.push(...newBatch);

  toggleSpinner(false);

  const html = newBatch.map((pokemon) => cardTemplate(pokemon)).join("");
  container.insertAdjacentHTML("beforeend", html);

  currentId += limit;
}

document
  .getElementById("load-more-btn")
  .addEventListener("click", renderPokemonData);

/**
 * Sucht nach einem bestimmten Pokémon.
 *
 * 1. Wenn der Suchbegriff leer ist, zurück zu normal zustand
 * 2. Perfomance-Check - Wir erst ab 3 Buchstaben suchen
 * 3. In der Masterliste filtern
 * 4. Wenn Ergebnisse gefunden wurden, nur die ersten 10 zeigen
 * 5. Wenn nicht, einen Fehler anzeigen
 */
async function searchPokemon() {
  let searchTerm = document
    .getElementById("pokemon-search")
    .value.toLowerCase()
    .trim(); // Kleinbuchstaben und Leerzeichen entfernen
  let container = document.getElementById("pokedex-container");
  let loadMoreContainer = document.getElementById("more-pokemon-container");

  if (searchTerm === "") {
    renderCards(allPokemon);
    loadMoreContainer.style.display = "flex";
    return;
  }

  loadMoreContainer.style.display = "none";

  if (searchTerm.length < 3) {
    return;
  }

  let foundMatches = allPokemonNames.filter((p) => p.name.includes(searchTerm));

  if (foundMatches.length > 0) {
    container.innerHTML = "";

    let matchesToShow = foundMatches.slice(0, 10);

    for (let match of matchesToShow) {
      let existingPokemon = allPokemon.find((p) => p.name === match.name);

      if (existingPokemon) {
        container.innerHTML += cardTemplate(existingPokemon);
      } else {
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
    container.innerHTML = `<p class="error-msg">Kein Pokémon mit "${searchTerm}" gefunden.</p>`;
  }
}

document
  .getElementById("pokemon-search")
  .addEventListener("input", searchPokemon);

/**
 * Lädt alle verfügbaren Pokémon-Namen von der PokéAPI.
 * Die Funktion wird asynchron ausgeführt und gibt die geladenen Daten
 * in der Variable allPokemonNames zurück.
 * Im Fehlerfall wird eine Fehlermeldung in der Konsole ausgegeben.
 */
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

/**
 * Renders all Pokémon cards based on the given array of Pokémon data.
 * The function empties the container, loops through the array, generates the HTML
 * for each Pokémon card and writes it to the container in one go.
 * @param {array} pokemonArray - An array of Pokémon data objects.
 */
function renderCards(pokemonArray) {
  let container = document.getElementById("pokedex-container");
  container.innerHTML = "";
  let htmlCollector = "";
  for (let i = 0; i < pokemonArray.length; i++) {
    htmlCollector += cardTemplate(pokemonArray[i]);
  }
  container.innerHTML = htmlCollector;
}

/**
 * Öffnet den Dialog mit den Details des Pokémons mit der gegebenen ID.
 *
 * @param {number} Id - Die ID des Pokémons.
 */
function openPokemonDetail(Id) {
  const pokemon = allPokemon.find((p) => p.id === Id);

  if (pokemon) {
    const modal = document.getElementById("pokemon-modal");
    modal.innerHTML = detailTemplate(pokemon);
    modal.showModal();
  }
}

/**
 * Schließt den Dialog mit den Details des Pokémons, wenn der Klick außerhalb des Inhaltsbereichs war.
 * @param {Event} event - Das Event-Objekt, das den Klick repräsentiert.
 */
function closePokemonDetail(event) {
  const modal = document.getElementById("pokemon-modal");
  if (event.target.id === modal.id) {
    modal.close();
  }
}

/**
 * Forces the closure of the modal dialog with the Pokémon details.
 * This function is called, when the user clicks on the close button
 * of the modal dialog.
 */
function forceCloseModal() {
  const modal = document.getElementById("pokemon-modal");
  modal.close();
}

/**
 * Wechselt den Inhalt des Dialogs mit den Details des Pokémons zwischen
 * den drei Abschnitten: main, stats und evo.
 *
 * @param {string} pokemonName - Der Name des Pokémons.
 * @param {string} section - Der Name der Abschnitt, die angezeigt werden soll.
 * @example
 * switchTab('pikachu', 'main') // Zeigt den Hauptabschnitt an
 * switchTab('pikachu', 'stats') // Zeigt den Statistikabschnitt an
 * switchTab('pikachu', 'evo') // Zeigt den Evolutionsabschnitt an
 */
function switchTab(pokemonName, section) {
  const container = document.getElementById("details-content");
  const pokemon = allPokemon.find((p) => p.name === pokemonName);

  if (section === "main") {
    container.innerHTML = renderMainInfo(pokemon);
  } else if (section === "stats") {
    container.innerHTML = renderStats(pokemon);
  } else if (section === "evo") {
    container.innerHTML = renderEvoChain(pokemon);
  }
}

/**
 * Lädt die Evolutionskette eines Pokémon von der PokéAPI.
 * Die Funktion wird asynchron ausgeführt und gibt die Evolutionskette
 * in der Variable chain zurück.
 * Im Fehlerfall wird eine Fehlermeldung in der Konsole ausgegeben.
 *
 * @param {Object} pokemon - Ein Pokémon-Objekt, das die Evolutionskette
 *                             enthält.
 * @returns {Promise<Object>} Ein Promise-Objekt, das die Evolutionskette
 *                             zurückgibt.
 * @example
 * const evoChain = await getEvoChainData(pokemon);
 * console.log(evoChain); // Die Evolutionskette des Pokémon
 */
async function getEvoChainData(pokemon) {
  const speciesResponse = await fetch(pokemon.species.url);
  const speciesData = await speciesResponse.json();
  const evoResponse = await fetch(speciesData.evolution_chain.url);
  const evoData = await evoResponse.json();
  return evoData.chain;
}

/**
 * Flatten the evolution chain for a Pokémon.
 * The function takes the evolution chain and returns a flat list of all evolution steps.
 * The list is ordered in the order of the evolutions.
 * @param {Object} chain - The evolution chain object.
 * @returns {Array<string>} A flat list of evolution steps.
 * @example
 * const evoList = flattenEvoChain(pokemon.evolution_chain);
 * console.log(evoList); // ['bulbasaur', 'ivysaur', 'venusaur']
 */
function flattenEvoChain(chain) {
  let evoList = [];
  let currentStep = chain;
  while (currentStep) {
    evoList.push(currentStep.species.name);
    currentStep = currentStep.evolves_to[0];
  }
  return evoList;
}

init();
