01_Pokedex - Waldi
Ein moderner, interaktiver Pokédex, der Daten direkt von der PokéAPI bezieht. Dieses Projekt wurde im Rahmen meiner Ausbildung zum Frontend-Entwickler erstellt, um den Umgang mit asynchronem JavaScript, APIs und responsivem Design zu vertiefen.

🚀 Features
Dynamisches Laden: Die ersten 20 Pokémon werden sofort gerufen, weitere können über einen "Load More"-Button nachgeladen werden.

Echtzeit-Suche: Suche nach Namen aus dem gesamten Pool von über 1000 Pokémon (optimiert durch lokales Caching der Masterliste).

Detail-Ansicht (Modal):

Main-Info: Anzeige von Größe, Gewicht und Fähigkeiten.

Stats: Visualisierung der Basiswerte durch animierte, farblich abgestimmte Fortschrittsbalken.

Evolution Chain: Darstellung der gesamten Entwicklungsreihe mit Bildern und Icons.

Responsive Design: Optimiert für Desktop, Tablet und Smartphones.

🛠️ Technologien
HTML5: Semantische Struktur und Nutzung des <dialog>-Elements.

CSS3: Modernes Layout mit Flexbox und CSS-Grid sowie Keyframe-Animationen für die Stats-Balken.

Vanilla JavaScript: - Asynchrone Programmierung (async/await, fetch).

DOM-Manipulation und Event-Handling.

Datenverarbeitung (Filtern, Mappen und Reduzieren von komplexen API-Objekten).

💡 Besondere Herausforderungen
Eine der größten Lernkurven in diesem Projekt war die Implementierung der Evolution Chain. Da die PokéAPI die Evolutionsdaten stark verschachtelt ausgibt, musste eine Logik entwickelt werden, die diese Struktur "flachklopft", um die Bilder der gesamten Kette korrekt nebeneinander anzuzeigen.

Ebenfalls wurde großer Wert auf Performance gelegt: Durch das Vorladen der Namensliste im Hintergrund bleibt die App auch bei der Suche nach über 1000 Einträgen extrem schnell.