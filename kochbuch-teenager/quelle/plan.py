import json, re, os
from fractions import Fraction
D = os.path.dirname(os.path.abspath(__file__))
R = {}
for f in ['teil1.json', 'teil2.json', 'teil3.json', 'teil4.json']:
    for k in json.load(open(os.path.join(D, f)))['kapitel']:
        for r in k['rezepte']:
            R[r['nr']] = r

# (Frühstück, Mittag, Abend, Snack); Zahl = Rezept, "R:nr" = Rest vom Vortag
TAGE = [
    (2, 14, 44, 24), (4, 'R:44', 30, 95), (10, 13, 63, 22), (8, 19, 46, 18), (1, 25, 51, 'R:18'),
    (3, 16, 38, 87), (10, 'R:38', 42, 'R:16'), (5, 15, 65, 22), (9, 20, 33, 98), (7, 23, 55, 'R:7'),
    (6, 21, 31, 84), (11, 'R:31', 69, 'R:21'), (12, 17, 37, 95), (2, 'R:17', 67, 24), (1, 72, 45, 86),
]

def name(x):
    if isinstance(x, str):
        return f"Rest: {R[int(x[2:])]['titel']} (Nr. {x[2:]})"
    return f"{R[x]['titel']} (Nr. {x})"

UNITS = ['g', 'ml', 'EL', 'TL', 'Dose', 'Dosen', 'Scheiben', 'Scheibe', 'Bund', 'Packung', 'Päckchen', 'Beutel', 'Rolle', 'Kugel', 'Prise', 'Handvoll', 'Blätter', 'Stück']
NUM = {'½': Fraction(1, 2), '¼': Fraction(1, 4)}

def parse(z):
    m = re.match(r'^(\d+/\d+|\d+(?:[.,]\d+)?|½|¼)\s+(.*)$', z.strip())
    if not m:
        return None, None, z.strip()
    q = m.group(1)
    q = NUM.get(q) or (Fraction(q) if '/' in q else Fraction(q.replace(',', '.')))
    rest = m.group(2)
    unit = ''
    for u in sorted(UNITS, key=len, reverse=True):
        if rest.startswith(u + ' '):
            unit, rest = u, rest[len(u) + 1:]
            break
    if unit == 'Dosen': unit = 'Dose'
    if unit == 'Scheibe': unit = 'Scheiben'
    return q, unit, rest

ALIAS = {'Ei':'Eier','Banane':'Bananen','Apfel':'Äpfel','Zwiebel':'Zwiebeln','Weizen-Tortillas':'Weizentortillas','cremige Erdnussbutter':'Erdnussbutter',
  'Salami in Scheiben':'Salami','Parmesan':'geriebener Parmesan','Knoblauchzehe':'Knoblauchzehen','Zitrone':'Zitronen','Bagels':'Bagels','Mangostücke':'Mangostücke (TK oder frisch)',
  'Kochschinkenwürfel':'Kochschinken, gewürfelt','Kochschinken':'Kochschinken','geriebener Käse':'geriebener Gouda','Joghurt griechischer Art':'Joghurt griechischer Art','weiche Butter':'Butter'}
def key(rest):
    base = re.sub(r'\s*\(.*?\)', '', rest).strip()
    base = re.sub(r'\b(zum Servieren|frisch|reife?|große?|kleine?|sehr|dünne)\b', '', base).strip()
    base = re.sub(r'\s+', ' ', base)
    return ALIAS.get(base, base)

GRUPPEN = [
    ('Tiefkühlung', r'^TK|Fischstäbchen|Pommes'),
    ('Vorrat, Nudeln, Dosen & Gewürze', r'^(passierte|stückige)|Dose|pulver|Pulver|Gewürz|Oregano|Kräuter|Zimt|Kardamom|Chili|Sesam|Backkakao|Paniermehl|Mehl|Erdnussbutter|Tahin|Honig|Ahornsirup|Pesto|Sojasauce|Teriyaki|Salsa|Ketchup|Mayonnaise|Dressing|Nori|Kokosmilch|Kokosraspeln|Schoko|Zartbitter|Haselnüsse|Haferflocken|Reis\b|reis|Couscous|Linsen|Nudeln|Spaghetti|Fusilli|Penne|Mie'),
    ('Obst & Gemüse', r'Banane|Apfel|Äpfel|Zitrone|Limette|Avocado|Tomate|Gurke|Paprika|Zwiebel|Frühlingszwiebel|Schnittlauch|Karotte|Möhre|Zucchini|Kartoffel|Süßkartoffel|Spinat|Salat\b|salat\b|Eisberg|Brokkoli|Kirschtomaten|Babyspinat|Knoblauch|Beeren|Erdbeer|Mango|Petersilie|Basilikum|Minze|Datteln|Pfirsich|Romana'),
    ('Kühlregal', r'Milch|Joghurt|Quark|Frischkäse|Sahne|Schmand|Crème|Butter|Ei\b|Eier|Käse|Gouda|Cheddar|Mozzarella|Feta|Parmesan|Halloumi|Tofu|Gnocchi|Tortellini|Blätterteig|Krautsalat|Falafel|Mascarpone|Hummus|Joghurt'),
    ('Fleisch, Wurst & Fisch', r'Hähnchen|Hackfleisch|hackfleisch|Schinken|Speck|Salami|Pute|Würst|Bratw|Thunfisch'),
    ('Tiefkühlung', r'TK|Fischstäbchen|Pommes'),
    ('Brot & Backwaren', r'Toast|Brot|Bagel|Brötchen|Tortilla|Ciabatta|Reiswaffel|Wraps?\b'),
]

def gruppe(n):
    for g, rx in GRUPPEN:
        if re.search(rx, n, re.I):
            return g
    return 'Vorrat, Nudeln, Dosen & Gewürze'

def fmt(q):
    if q.denominator == 1: return str(q.numerator)
    if q == Fraction(3, 2): return '1½'
    if q == Fraction(1, 2): return '½'
    return str(round(float(q), 1)).replace('.', ',')

def einkauf(tage):
    summe, frei = {}, []
    for t in tage:
        for x in t:
            if isinstance(x, str): continue
            for z in R[x]['zutaten']:
                q, u, rest = parse(z)
                if q is None:
                    frei.append(rest); continue
                n = key(rest)
                if n == 'Milch' and u == 'EL': u, q = 'ml', q * 15
                if n == 'Honig' and u == 'TL': u, q = 'EL', q / 3
                if n == 'Butter' and u == 'EL': u, q = 'g', q * 15
                if n == 'Mehl' and u == 'EL': u, q = 'g', q * 10
                if n == 'Hähnchenbrustfilet' and u == '': u, q = 'g', q * 250
                if n == 'Hähnchenschnitzel' and u == '': u, q = 'g', q * 150
                if n == 'Kochschinken' and u == 'Scheiben': u, q = 'g', q * 25
                if n == 'Salami' and u == 'g': pass
                k = (u, n)
                summe[k] = summe.get(k, 0) + q
    gr = {}
    import math
    SING = {'Zitronen':'Zitrone','Zwiebeln':'Zwiebel','Äpfel':'Apfel','Bananen':'Banane','Knoblauchzehen':'Knoblauchzehe','Eier':'Ei','Bagels':'Bagel'}
    for (u, n), q in summe.items():
        if u in ('', 'EL', 'Dose') and q.denominator != 1 and q > 1: q = Fraction(math.ceil(q))
        if u == 'EL' and q < 1: q = Fraction(1)
        if u == 'Dose' and q > 1: u = 'Dosen'
        if u == 'ml' and q >= 1000: u, q = 'l', q / 1000
        if q == 1 and not u: n = SING.get(n, n)
        gr.setdefault(gruppe(n), []).append(f"{fmt(q)} {u + ' ' if u else ''}{n}")
    for n in frei:
        gr.setdefault(gruppe(n), []).append(n)
    order = [g for g, _ in GRUPPEN[:2]] + ['Fleisch, Wurst & Fisch', 'Tiefkühlung', 'Brot & Backwaren', 'Vorrat, Nudeln, Dosen & Gewürze']
    seen = []
    for g in ['Obst & Gemüse', 'Kühlregal', 'Fleisch, Wurst & Fisch', 'Tiefkühlung', 'Brot & Backwaren', 'Vorrat, Nudeln, Dosen & Gewürze']:
        if g in gr: seen.append({'gruppe': g, 'artikel': sorted(set(gr[g]), key=lambda s: re.sub(r'^[\d½,/ ]+(g|ml|EL|TL|Dose|Scheiben|Bund|Packung|Päckchen|Beutel|Rolle|Kugel|Prise|Handvoll|Blätter|Stück)?\s*', '', s).lower())})
    return seen

wochen = []
for i, titel in enumerate(['Woche 1: Tag 1–5', 'Woche 2: Tag 6–10', 'Woche 3: Tag 11–15']):
    tage = TAGE[i * 5:(i + 1) * 5]
    wochen.append({'titel': titel, 'tage': [
        {'tag': i * 5 + j + 1, 'fruehstueck': name(a), 'mittag': name(b), 'abend': name(c), 'snack': name(d)}
        for j, (a, b, c, d) in enumerate(tage)], 'einkauf': einkauf(tage)})

plan = {
    'titel': 'Dein 15-Tage-Essensplan',
    'intro': [
        'Keine Lust, jeden Tag zu überlegen, was du kochen sollst? Dann nimm einfach diesen Plan. Er führt dich in drei Etappen à fünf Tage durch das Buch – mit Frühstück, Mittagessen oder Lunchbox, Abendessen und einem Snack.',
        'Der Trick: Die meisten Rezepte sind für zwei Portionen. Koch abends also ganz entspannt, iss mit deiner Familie, einem Geschwisterkind oder Freunden – oder pack die zweite Portion als „Rest“ am nächsten Tag in deine Lunchbox. So sparst du Zeit, Geld und wirfst nichts weg.',
        'Zu jeder Etappe gibt es eine passende Einkaufsliste, nach Supermarkt-Abteilungen sortiert. Die Mengen reichen für alle Rezepte der fünf Tage. Tausch ruhig Gerichte, die du nicht magst, gegen andere aus dem Buch aus – der Plan ist dein Werkzeug, kein Gesetz.',
    ],
    'wochen': wochen,
}
json.dump(plan, open(os.path.join(D, 'plan.json'), 'w'), ensure_ascii=False, indent=1)
for w in wochen:
    print(w['titel'])
    for g in w['einkauf']:
        print(' ', g['gruppe'], '|', ' ; '.join(g['artikel']))
