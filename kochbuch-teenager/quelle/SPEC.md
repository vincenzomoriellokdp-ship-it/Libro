# Spezifikation: "Kochbuch für Teenager" (Neufassung, Autorin: Gertraud Kron)

Zielgruppe: Teenager 12–17, Kochanfänger. Käufer oft Eltern -> Rezepte sollen eher ausgewogen sein, aber Teenager-Lieblingsessen (Burger, Pasta, Pizza, Snacks) dominieren.
Vorbild: Bestseller "#SoloChefs: Das 5-Zutaten-Kochbuch für coole Teenager", "Kochbuch für Teenager – 5 Zutaten" (Lina Rosenberg), "Teenager Kochbuch: Unnormal leckere Rezepte" (Maja Rehnsberg).

## Harte Regeln für JEDES Rezept
1. Sprache: Deutsch, korrekte Rechtschreibung, DU-Form ("Schneide die Zwiebel…"), locker und freundlich, jugendlich aber NICHT cringe (kein übertriebener Slang, höchstens ab und zu "mega", "richtig lecker", "Game Changer").
2. Maximal 5 Zutaten (Feld "zutaten", 3–5 Einträge, jeweils mit Menge, z. B. "200 g Spaghetti"). Nicht mitgezählt werden NUR Vorratszutaten aus dieser Liste: Salz, Pfeffer, Öl, Zucker, Wasser. Butter, Mehl, Knoblauch, Gewürze wie Paprikapulver usw. ZÄHLEN als Zutat.
3. Gesamtzeit (Vorbereitung + Garen) höchstens 30 Minuten. Reine Wartezeit (Kühlen, Einweichen über Nacht, Gefrieren) darf zusätzlich im Feld "wartezeit" stehen, z. B. "plus 1 Nacht im Kühlschrank".
4. Günstige Supermarkt-Zutaten (Aldi/Lidl/Rewe). Kein Rinderfilet, kein Spargel, kein frischer Lachs, keine exotischen Zutaten.
5. Schritte ("schritte"): 4–7 Schritte, anfängertauglich und konkret: Hitzestufe (z. B. "mittlere Hitze"), woran man erkennt, dass es fertig ist ("bis die Ränder goldbraun sind"), Sicherheit wo nötig (Hähnchen komplett durchgaren, Ofenhandschuhe, Messer vom Körper weg). Jeder Schritt 1–3 Sätze.
6. Portionen: meist 2; Partyfood/Familiengerichte 4. Mengen passend zur Portionenzahl.
7. Nährwerte pro Portion als realistische Schätzung (ganze Zahlen).
8. "teaser": 1–2 Sätze, macht Lust aufs Gericht, du-Form.
9. "tipp": 1–2 Sätze Profi-Tipp oder Trick. "variante": 1 Satz Abwandlung (z. B. vegetarisch, schärfer, andere Zutat).
10. "kosten": "€" (unter 1,50 € pro Portion), "€€" (1,50–3 €), "€€€" (über 3 €, selten!).
11. "level": "Einfach" oder "Mittel" (mind. 75 % Einfach).
12. "tags": Auswahl aus ["vegetarisch","vegan","ohne Herd","Mikrowelle","Airfryer-geeignet","Meal-Prep","Lunchbox","Party"].
13. "foto_prompt": englischer Prompt für ein KI-Food-Foto (Stil: bright, appetizing, top-down or 45°, natural light, modern casual table, no text, no people), 1–2 Sätze, genau das Gericht beschreibend.
14. KEINE rohen Eier in Rezepten, die nicht erhitzt werden. Kein Alkohol. Kein Koffein-lastiges (kein Kaffee-Drink; Kakao ok).
15. Die Rezepttitel aus deiner Liste genau übernehmen (kleine sprachliche Verbesserungen ok).

## Ausgabe
Schreibe EINE Datei (UTF-8, gültiges JSON, mit Python `json.load` prüfen!) mit folgendem Aufbau:
{
  "kapitel": [
    {"nr": 1, "titel": "...", "untertitel": "...", "intro": "Kapitel-Einleitung 70–110 Wörter, du-Form",
     "rezepte": [
       {"nr": 1, "titel": "...", "teaser": "...", "zeit_min": 15, "wartezeit": null, "portionen": 2,
        "level": "Einfach", "kosten": "€", "zutaten": ["..."], "vorrat": ["Salz","Öl"],
        "schritte": ["..."], "tipp": "...", "variante": "...",
        "naehrwerte": {"kcal": 420, "eiweiss": 18, "kohlenhydrate": 50, "fett": 15},
        "tags": ["vegetarisch"], "foto_prompt": "..."}
     ]}
  ]
}
Nach dem Schreiben: Datei mit `python3 -I -c "import json;d=json.load(open('PFAD'));print(sum(len(k['rezepte']) for k in d['kapitel']))"` prüfen und kontrollieren, dass jedes Rezept ≤5 Zutaten und zeit_min ≤30 hat. Fehler selbst beheben.
