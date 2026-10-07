# Kochbuch für Teenager – nuova edizione

Riscrittura completa del libro di Gertraud Kron sul modello dei bestseller Amazon.de della categoria:
#SoloChefs (René Seidel), Kochbuch für Teenager – 5 Zutaten (Lina Rosenberg) e Teenager Kochbuch (Maja Rehnsberg).

## File

| File | Contenuto |
|---|---|
| `Kochbuch_fuer_Teenager_Manuskript.docx` | Manoscritto KDP, Letter 8,5×11", margini speculari, 136 pagine |
| `Kochbuch_fuer_Teenager_Vorschau.pdf` | Anteprima PDF (renderizzata con LibreOffice, i font possono differire da Word) |
| `quelle/` | Testi sorgente (JSON) e script per rigenerare il manoscritto |

## Contenuto

- 100 ricette nuove, nessun duplicato, **max. 5 ingredienti** (sale, pepe, olio, zucchero e acqua esclusi), **max. 30 minuti**
- Tono "du", passo passo per principianti, con tempo, porzioni, livello, costo, consiglio, variante e valori nutrizionali
- 9 capitoli: Frühstück · Pausensnacks & Lunchbox · Mittagessen · Pasta & Pizza · Burger & Streetfood · Bowls & Veggie · Gaming-/Partyfood · Süßes · Drinks
- Küchen-Basics: attrezzatura, dispensa, tecniche di taglio, sicurezza, igiene, lessico, budget
- 15-Tage-Essensplan con 3 liste della spesa per reparto
- BONUS "Die Geheimnisse der Konservierung" (ora presente davvero, come promette la copertina)
- Indice ricette dalla A alla Z

## Foto

Le 100 foto sono state generate con GPT Image 2.5 (Higgsfield, 2K, qualità alta).
Il manoscritto contiene un'immagine segnaposto per ogni ricetta (`word/media/fotoNNN.jpg`).

**Installazione su Windows:** scarica `Kochbuch_fuer_Teenager_Paket.zip`, estrailo e fai doppio clic su `INSTALLA_LIBRO.bat`.
Lo script crea `C:\Users\vmori\OneDrive\Book\ACCOUNT\Vincenzo.kdp\KOCHBUCH FÜR TEENAGER` con la sottocartella `Foto`,
scarica le foto, le ritaglia a 300 dpi e le inserisce nel manoscritto.

## Prima di pubblicare

1. Inserire nome e indirizzo al posto di `[Name und Anschrift des Verantwortlichen gemäß KDP-Vorgaben]` (Impressum).
2. Aprire il .docx in Word e aggiornare l'indice (clic destro sull'indice → Aggiorna campo).
3. Ricalcolare il dorso della copertina per il nuovo numero di pagine.
