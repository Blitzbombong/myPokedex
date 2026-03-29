
// Farben für die Typen
const typeColors = {
    grass: '#DEFDE0',
    fire: '#FDDFDF',
    water: '#DEF3FD',
    bug: '#F8D5A3',
    normal: '#F5F5F5',
    poison: '#98D7A5',
    electric: '#FCF7DE',
    ground: '#F4E7DA',
    fairy: '#FCEAFF',
    fighting: '#E6E0D4',
    psychic: '#EAEDA1',
    rock: '#D5D5D4',
    ghost: '#98D7A5',
    dragon: '#97B3E6',
    ice: '#DEF3FD'
};

// Icons für die Typen
const typeIcons = {
    grass: '<i class="fa-solid fa-leaf"></i>',
    fire: '<i class="fa-solid fa-fire"></i>',
    water: '<i class="fa-solid fa-droplet"></i>',
    bug: '<i class="fa-solid fa-bug"></i>',
    electric: '<i class="fa-solid fa-bolt"></i>',
    poison: '<i class="fa-solid fa-skull-crossbones"></i>',
    normal: '<i class="fa-solid fa-circle"></i>',
    ground: '<i class="fa-solid fa-mountain"></i>',
    fairy: '<i class="fa-solid fa-wand-sparkles"></i>',
    fighting: '<i class="fa-solid fa-hand-fist"></i>',
    psychic: '<i class="fa-solid fa-brain"></i>',
    rock: '<i class="fa-solid fa-gem"></i>',
    ghost: '<i class="fa-solid fa-ghost"></i>',
    dragon: '<i class="fa-solid fa-dragon"></i>',
    ice: '<i class="fa-solid fa-snowflake"></i>'
};


// Lade-Spinner anzeigen/verstecken
function toggleSpinner(show) {
    const container = document.getElementById("pokedex-container");
    if (show) {
        const loadingHTML = `
            <div id="loading-spinner" class="loading-container">
                <div class="spinner"></div>
                <p>Pokémon werden gerufen...</p>
            </div>`;
        container.insertAdjacentHTML('beforeend', loadingHTML);
    } else {
        const spinner = document.getElementById("loading-spinner");
        if (spinner) spinner.remove();
    }
}


// Karten-Template für ein Pokémon
function cardTemplate(pokemon) {
    // 1. Wir hollen uns den ersten Typ des Pokémons
    let typeName = pokemon.types[0]?.type?.name || 'normal';

    // 2. Wir suchen die passende Farbe in unserer Tabelle
    // Wenn wir den Typ nicht finden, nehmen wir standardmäßig Grau (#f0f0f0)
    let color = typeColors[typeName] || '#f0f0f0';
    let typeIcon = typeIcons[typeName] || '<i class="fa-solid fa-circle"></i>';
    // 3. Wir holen uns das Hochauflösende Bild, falls vorhanden
    let highResImage = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    return `
        <div class="pokemon-card" id="pokemon-card-${pokemon.id}" onclick="openPokemonDetail(${pokemon.id})">
            <div class="header-card">
                <p>#${pokemon.id}</p>
                <h2>${pokemon.name}</h2>
            </div>
            <div class="img-card" style="background-color: ${color};">
                <img src="${highResImage}" alt="${pokemon.name}" loading="lazy">
            </div>
            <div class="bottom-card" style="background-color: ${color};">
                <span class="type-icon">${typeIcon}</span>
                <p class="type">${typeName}</p>
            </div>
        </div>
    `;
}


// Dialog Html Template
function detailTemplate(pokemon) {
    // 1. Wir hollen uns den ersten Typ des Pokémons
    let typeName = pokemon.types[0]?.type?.name || 'normal';

    // 2. Wir suchen die passende Farbe in unserer Tabelle
    // Wenn wir den Typ nicht finden, nehmen wir standardmäßig Grau (#f0f0f0)
    let color = typeColors[typeName] || '#f0f0f0';
    let typeIcon = typeIcons[typeName] || '<i class="fa-solid fa-circle"></i>';
    // 3. Wir holen uns das Hochauflösende Bild, falls vorhanden
    let highResImage = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    return `
        <div class="pokemon-dialog" id="pokemon-dialog-${pokemon.id}">
            <div class="header-dialog">
                <p>#${pokemon.id}</p>
                <h2>${pokemon.name}</h2>
                <button class="close-button" onclick="forceCloseModal()">&times;</button>
            </div>
            <div class="img-dialog" style="background-color: ${color};">
                <img src="${highResImage}" alt="${pokemon.name}">
            </div>
            <div class="icons-dialog" >
                <span class="dialog-icon" style="background-color: ${color};">${typeIcon}</span>
            </div>
            <div class="stats-dialog">
                <a href="javascript:void(0)" data-section="main" onclick="switchTab('${pokemon.name}', 'main')"><p>main</p></a>  
                <a href="javascript:void(0)" data-section="stats" onclick="switchTab('${pokemon.name}', 'stats')"><p>stats</p></a>  
                 <a href="javascript:void(0)" data-section="evo" onclick="switchTab('${pokemon.name}', 'evo')"><p>evo chain</p></a>
            </div>
            <div class="details-dialog" id="details-content">
                ${renderMainInfo(pokemon)}
            </div>
        </div>
    `;
}


// Hauptinfo Rendern
function renderMainInfo(pokemon) {
    return `
        <div class="main-info">
            <p><span class="label">Height:</span> <span class="value">${pokemon.height / 10} m</span></p>
            <p><span class="label">Weight:</span> <span class="value">${pokemon.weight / 10} kg</span></p>
            <p><span class="label">Abilities:</span> <span class="value">${pokemon.abilities.map(a => a.ability.name).join(', ')}</span></p>
        </div>
    `;
}


// Stats Rendern
function renderStats(pokemon) {
    let statsHtml = '<div class="stats-container">';

    // Wir loopen durch das Array der Stats und bauen die HTML Struktur
    pokemon.stats.forEach(statObj => {
        const statName = statObj.stat.name;
        const statValue = statObj.base_stat;

        // Berechnung der Breite des Balkens (maximal 150)
        const percentage = Math.min((statValue / 150) * 100, 100);

        const barColor = getStatColor(statName);

        statsHtml += `
            <div class="stat-row">
                <span class="stat-name">${statName}</span>
                <div class="progress-bar">
                    <div class="progress-fill" 
                        style="width: ${percentage}%; background-color: ${getStatColor(statName)};">
                    </div>
                </div>
                <span class="stat-number">${statValue}</span>
            </div>
        `;
    });
    statsHtml += '</div>';
    return statsHtml;
}


// Funktion um die Farben an der Stats Balken zu geben
function getStatColor(statName) {
    const colors = {
        'hp': '#4CAF50',              // Grün
        'attack': '#F44336',          // Rot
        'defense': '#2196F3',         // Blau
        'special-attack': '#9C27B0',  // Lila
        'special-defense': '#00BCD4', // Türkis
        'speed': '#FFEB3B'            // Gelb
    };

    return colors[statName] || '#CCCCCC'; // Standardfarbe Grau
}


// Evo Chain Rendern
async function renderEvoChain(pokemon) {
    const container = document.getElementById("details-content");
    container.innerHTML = '<p>Lade Evolutionskette...</p>'; // Kleiner Ladehinweis

    try {
        const chain = await getEvoChainData(pokemon);
        const pokemonNames = flattenEvoChain(chain);

        let html = '<div class="evo-container">';

        // Jetzt bauen wir für jeden Namen ein kleines Bild

        for (let i = 0; i < pokemonNames.length; i++) {
            const name = pokemonNames[i];
            // Wir müssen kurtz die Daten für das Bild holen
            const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const data = await res.json();
            const img = data.sprites.other['official-artwork'].front_default;

            html += `
                <div class="evo-step">
                    <img src="${img}" alt="${name}">
                    <p>${name}</p>
                </div>
            `;
            // Pfeil hinzufügen, außer beim letzten Pokémon
            if (i < pokemonNames.length - 1) {
                html += `<div class="evo-arrow">→</div>`;
            }
        }
            
        html += '</div>';
        container.innerHTML = html;

    } catch (error) {
        container.innerHTML = '<p>Fehler beim Laden der Evolutionskette.</p>';
    }
}

