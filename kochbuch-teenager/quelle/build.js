// Baut das KDP-Manuskript (Letter 8,5x11") aus den JSON-Teilen.
const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, PageBreak,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, LevelFormat,
  TableOfContents, Footer, PageNumber, VerticalAlign, TableLayoutType, ImageRun,
} = require('docx');

const DIR = __dirname;
const FOTO_H = 3900;
const load = f => JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf8'));
const teile = ['teil1.json', 'teil2.json', 'teil3.json', 'teil4.json'].map(load);
const kapitel = teile.flatMap(t => t.kapitel).sort((a, b) => a.nr - b.nr);
const rahmen = load('rahmen.json');
const plan = load('plan.json');

const ORANGE = 'E8590C', GELB = 'F5A400', DUNKEL = '1F1F1F', GRAU = '6B6B6B', HELL = 'FFF4E0', HELLGRAU = 'F2F2F2';
const BODY = 'Georgia', HEAD = 'Arial';
// Satzspiegel: 8,5" Seite, Innenrand 0,875" (inkl. Bundsteg), Außenrand 0,5"
const TEXTBREITE = 12240 - 1260 - 720; // DXA

const t = (text, o = {}) => new TextRun({ text, font: BODY, size: 22, color: DUNKEL, ...o });
const p = (children, o = {}) => new Paragraph({ children: Array.isArray(children) ? children : [t(children)], spacing: { after: 140, line: 300 }, ...o });
const pb = () => new Paragraph({ children: [new PageBreak()] });
const h1n = (text, o = {}) => h1(text, { pageBreakBefore: true, ...o });
const h1 = (text, o = {}) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text, font: HEAD, bold: true, size: 44, color: ORANGE })], spacing: { before: 0, after: 240 }, ...o });
const h2 = text => new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun({ text, font: HEAD, bold: true, size: 32, color: DUNKEL })], spacing: { before: 120, after: 120 } });
const h3 = text => new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, children: [new TextRun({ text, font: HEAD, bold: true, size: 26, color: ORANGE })], spacing: { before: 240, after: 100 } });
const bullet = (children, lvl = 0) => new Paragraph({ numbering: { reference: 'punkte', level: lvl }, children: Array.isArray(children) ? children : [t(children)], spacing: { after: 60, line: 276 } });
let listeNr = 0;
const nummer = (text, ref) => new Paragraph({ numbering: { reference: ref, level: 0 }, children: [t(text, { size: 20 })], spacing: { after: 70, line: 260 } });
const neueNummerierung = () => `schritte${listeNr++}`;
const keinRand = { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' } };

function box(children, fill = HELL, randFarbe = GELB) {
  const r = { style: BorderStyle.SINGLE, size: 6, color: randFarbe };
  return new Table({
    width: { size: TEXTBREITE, type: WidthType.DXA }, columnWidths: [TEXTBREITE], layout: TableLayoutType.FIXED,
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: TEXTBREITE, type: WidthType.DXA }, shading: { type: ShadingType.CLEAR, fill, color: 'auto' },
      borders: { top: r, bottom: r, left: { style: BorderStyle.SINGLE, size: 24, color: randFarbe }, right: r },
      margins: { top: 100, bottom: 100, left: 180, right: 180 }, children,
    })] })],
  });
}

function listeAbsaetze(arr) { return (arr || []).map(a => p(a)); }
function begriffe(liste) {
  return (liste || []).map(e => bullet([t(e.begriff + ': ', { bold: true }), t(e.erklaerung)]));
}

function abschnitt(a) {
  const out = [h3(a.titel), ...listeAbsaetze(a.absaetze), ...begriffe(a.liste)];
  if (a.schritte && a.schritte.length) { const ref = neueNummerierung(); out.push(...a.schritte.map(s => nummer(s, ref))); }
  if (a.rezept) {
    const r = a.rezept, ref = neueNummerierung();
    const inhalt = [
      new Paragraph({ children: [new TextRun({ text: r.titel, font: HEAD, bold: true, size: 26, color: ORANGE })], spacing: { after: 80 } }),
      p([t(`Zeit: ${r.zeit_min} Min.`, { bold: true, size: 20, color: GRAU })], { spacing: { after: 80 } }),
      p([t('Zutaten', { bold: true })], { spacing: { after: 40 } }),
      ...r.zutaten.map(z => bullet(z)),
      p([t('So geht’s', { bold: true })], { spacing: { before: 100, after: 40 } }),
      ...r.schritte.map(s => nummer(s, ref)),
    ];
    out.push(new Paragraph({ spacing: { after: 60 }, children: [] }), box(inhalt), new Paragraph({ spacing: { after: 120 }, children: [] }));
  }
  return out;
}

function infoLeiste(r) {
  const felder = [
    ['Zeit', `${r.zeit_min} Min.` + (r.wartezeit ? ' *' : '')],
    ['Portionen', String(r.portionen)],
    ['Level', r.level],
    ['Kosten', r.kosten],
  ];
  const w = Math.floor(TEXTBREITE / 4);
  const widths = [w, w, w, TEXTBREITE - 3 * w];
  return new Table({
    width: { size: TEXTBREITE, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
    rows: [new TableRow({ children: felder.map(([k, v], i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA }, borders: keinRand,
      shading: { type: ShadingType.CLEAR, fill: DUNKEL, color: 'auto' }, margins: { top: 60, bottom: 60, left: 100, right: 100 },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [
        new TextRun({ text: k.toUpperCase() + '  ', font: HEAD, size: 16, color: GELB, bold: true }),
        new TextRun({ text: v, font: HEAD, size: 20, color: 'FFFFFF', bold: true }),
      ] })],
    })) })],
  });
}

function fotoPlatzhalter(r) {
  const datei = path.join(DIR, 'fotos_druck', String(r.nr).padStart(3, '0') + '.jpg');
  if (fs.existsSync(datei)) {
    // 1 DXA = 1/1440 Zoll, ImageRun erwartet Pixel bei 96 dpi
    return new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new ImageRun({
      type: 'jpg', data: fs.readFileSync(datei), altText: { title: r.titel, description: r.titel, name: r.titel },
      transformation: { width: Math.round(TEXTBREITE / 15), height: Math.round(FOTO_H / 15) },
    })] });
  }
  const rand = { style: BorderStyle.DASHED, size: 6, color: 'BBBBBB' };
  return new Table({
    width: { size: TEXTBREITE, type: WidthType.DXA }, columnWidths: [TEXTBREITE], layout: TableLayoutType.FIXED,
    rows: [new TableRow({ height: { value: FOTO_H, rule: 'exact' }, children: [new TableCell({
      width: { size: TEXTBREITE, type: WidthType.DXA }, verticalAlign: VerticalAlign.CENTER,
      borders: { top: rand, bottom: rand, left: rand, right: rand }, shading: { type: ShadingType.CLEAR, fill: HELLGRAU, color: 'auto' },
      children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `[FOTO ${r.nr}: ${r.titel}]`, font: HEAD, size: 20, color: '999999' })] })],
    })] })],
  });
}

function rezept(r) {
  const ref = neueNummerierung();
  const linksB = 3300, rechtsB = TEXTBREITE - linksB;
  const links = [
    new Paragraph({ children: [new TextRun({ text: 'ZUTATEN', font: HEAD, bold: true, size: 22, color: ORANGE })], spacing: { after: 80 } }),
    ...r.zutaten.map(z => new Paragraph({ numbering: { reference: 'punkte', level: 0 }, children: [t(z, { size: 21 })], spacing: { after: 50, line: 264 } })),
  ];
  if (r.vorrat && r.vorrat.length) {
    links.push(new Paragraph({ spacing: { before: 120, after: 0 }, children: [t('Aus dem Vorrat: ', { size: 18, bold: true, color: GRAU }), t(r.vorrat.join(', '), { size: 18, color: GRAU })] }));
  }
  if (r.tags && r.tags.length) {
    links.push(new Paragraph({ spacing: { before: 120 }, children: [new TextRun({ text: r.tags.join(' · '), font: HEAD, size: 16, color: ORANGE, bold: true })] }));
  }
  const rechts = [
    new Paragraph({ children: [new TextRun({ text: 'SO GEHT’S', font: HEAD, bold: true, size: 22, color: ORANGE })], spacing: { after: 80 } }),
    ...r.schritte.map(s => nummer(s, ref)),
  ];
  const n = r.naehrwerte || {};
  return [
    new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: true, keepNext: true, spacing: { after: 60 }, children: [
      new TextRun({ text: `${r.nr}  `, font: HEAD, bold: true, size: 36, color: GELB }),
      new TextRun({ text: r.titel, font: HEAD, bold: true, size: 34, color: DUNKEL }),
    ] }),
    p([t(r.teaser, { italics: true, color: GRAU, size: 21 })], { spacing: { after: 120 } }),
    fotoPlatzhalter(r),
    new Paragraph({ spacing: { after: 100 }, children: [] }),
    infoLeiste(r),
    new Paragraph({ spacing: { after: 120 }, children: [] }),
    new Table({
      width: { size: TEXTBREITE, type: WidthType.DXA }, columnWidths: [linksB, rechtsB], layout: TableLayoutType.FIXED,
      rows: [new TableRow({ children: [
        new TableCell({ width: { size: linksB, type: WidthType.DXA }, borders: keinRand, margins: { right: 200 }, children: links }),
        new TableCell({ width: { size: rechtsB, type: WidthType.DXA }, borders: keinRand, margins: { left: 200 }, children: rechts }),
      ] })],
    }),
    new Paragraph({ spacing: { after: 100 }, children: [] }),
    box([
      p([t('Profi-Tipp: ', { bold: true, size: 20, color: ORANGE }), t(r.tipp, { size: 20 })], { spacing: { after: 60, line: 264 } }),
      p([t('Variante: ', { bold: true, size: 20, color: ORANGE }), t(r.variante, { size: 20 })], { spacing: { after: 0, line: 264 } }),
    ]),
    p([t(`Pro Portion ca.: ${n.kcal} kcal · ${n.eiweiss} g Eiweiß · ${n.kohlenhydrate} g Kohlenhydrate · ${n.fett} g Fett` + (r.wartezeit ? `   * ${r.wartezeit}` : ''), { size: 17, color: GRAU })], { spacing: { before: 100, after: 0 } }),
  ];
}

function kapitelSeiten(k) {
  return [
    new Paragraph({ pageBreakBefore: true, spacing: { before: 2400, after: 120 }, children: [new TextRun({ text: `KAPITEL ${k.nr}`, font: HEAD, bold: true, size: 26, color: GELB })] }),
    h1(k.titel, { spacing: { after: 120 } }),
    p([t(k.untertitel, { italics: true, size: 26, color: GRAU })], { spacing: { after: 360 } }),
    ...(Array.isArray(k.intro) ? k.intro : [k.intro]).map(a => p(a)),
    p([t('In diesem Kapitel: ', { bold: true, color: ORANGE }), t(k.rezepte.map(r => r.titel).join(' · '), { size: 20 })], { spacing: { before: 240 } }),
    ...k.rezepte.flatMap(rezept),
  ];
}

function planSeiten() {
  const cols = ['Tag', 'Frühstück', 'Mittag / Lunchbox', 'Abendessen', 'Snack'];
  const widths = [800, 2350, 2350, 2350, TEXTBREITE - 800 - 3 * 2350];
  const zelle = (txt, i, kopf, fill) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA }, margins: { top: 50, bottom: 50, left: 80, right: 80 },
    shading: { type: ShadingType.CLEAR, fill: kopf ? DUNKEL : fill, color: 'auto' },
    borders: { top: { style: BorderStyle.SINGLE, size: 2, color: 'DDDDDD' }, bottom: { style: BorderStyle.SINGLE, size: 2, color: 'DDDDDD' }, left: { style: BorderStyle.SINGLE, size: 2, color: 'DDDDDD' }, right: { style: BorderStyle.SINGLE, size: 2, color: 'DDDDDD' } },
    children: [new Paragraph({ children: [new TextRun({ text: txt, font: kopf ? HEAD : BODY, bold: kopf || i === 0, size: kopf ? 18 : 17, color: kopf ? 'FFFFFF' : DUNKEL })] })],
  });
  const out = [h1n(plan.titel), ...plan.intro.map(a => p(a))];
  plan.wochen.forEach((w, wi) => {
    out.push(new Paragraph({ heading: HeadingLevel.HEADING_2, pageBreakBefore: wi > 0, keepNext: true, children: [new TextRun({ text: w.titel, font: HEAD, bold: true, size: 32, color: DUNKEL })], spacing: { before: 120, after: 120 } }));
    out.push(new Table({
      width: { size: TEXTBREITE, type: WidthType.DXA }, columnWidths: widths, layout: TableLayoutType.FIXED,
      rows: [
        new TableRow({ tableHeader: true, children: cols.map((c, i) => zelle(c, i, true)) }),
        ...w.tage.map((d, di) => new TableRow({ cantSplit: true, children: [String(d.tag), d.fruehstueck, d.mittag, d.abend, d.snack].map((c, i) => zelle(c, i, false, di % 2 ? 'FFFFFF' : HELL)) })),
      ],
    }));
    out.push(h3(`Einkaufsliste für Tag ${w.tage[0].tag}–${w.tage[w.tage.length - 1].tag}`));
    out.push(p([t('Haken ab, was du schon zu Hause hast. Grundvorrat (Salz, Pfeffer, Öl, Zucker) ist nicht aufgeführt.', { italics: true, size: 19, color: GRAU })]));
    w.einkauf.forEach(g => {
      out.push(p([t(g.gruppe, { bold: true, color: ORANGE })], { spacing: { before: 120, after: 40 }, keepNext: true }));
      g.artikel.forEach(a => out.push(new Paragraph({ children: [t('☐  ' + a, { size: 20 })], spacing: { after: 30 }, indent: { left: 200 } })));
    });
  });
  return out;
}

function inhaltsSeitenHaupt() {
  const R = rahmen;
  const titel = [
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 3000, after: 200 }, children: [new TextRun({ text: 'KOCHBUCH', font: HEAD, bold: true, size: 96, color: DUNKEL })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 400 }, children: [new TextRun({ text: 'FÜR TEENAGER', font: HEAD, bold: true, size: 72, color: GELB })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: '100 einfache, preiswerte und leckere Rezepte in unter 30 Minuten – mit maximal 5 Zutaten', font: HEAD, size: 28, color: GRAU })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 2400 }, children: [new TextRun({ text: 'Inklusive 15-Tage-Essensplan und Bonus: Die Geheimnisse der Konservierung', font: HEAD, size: 24, color: ORANGE, bold: true })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: 'GERTRAUD KRON', font: HEAD, bold: true, size: 28, color: DUNKEL })] }),
  ];
  const impressum = [pb(), new Paragraph({ spacing: { before: 6000 }, children: [] }), ...R.impressum.map(a => p([t(a, { size: 17, color: GRAU })], { spacing: { after: 100, line: 252 } }))];
  const toc = [h1n('Inhalt', { heading: undefined }), new TableOfContents('Inhalt', { hyperlink: true, headingStyleRange: '1-1' })];
  const einl = [h1n(R.einleitung.titel), ...listeAbsaetze(R.einleitung.absaetze)];
  const sf = [h1n(R.so_funktionierts.titel), ...listeAbsaetze(R.so_funktionierts.absaetze), ...begriffe(R.so_funktionierts.liste)];
  const kb = [h1n(R.kuechen_basics.titel), ...listeAbsaetze(R.kuechen_basics.intro), ...R.kuechen_basics.abschnitte.flatMap(abschnitt)];
  const bonus = [
    new Paragraph({ pageBreakBefore: true, spacing: { before: 0, after: 120 }, children: [new TextRun({ text: 'BONUS', font: HEAD, bold: true, size: 26, color: GELB })] }),
    h1(R.bonus_konservierung.titel), ...listeAbsaetze(R.bonus_konservierung.intro), ...R.bonus_konservierung.abschnitte.flatMap(abschnitt)];
  const schluss = [h1n(R.schlusswort.titel), ...listeAbsaetze(R.schlusswort.absaetze)];
  const register = [h1n('Rezeptverzeichnis von A bis Z'),
    ...kapitel.flatMap(k => k.rezepte).slice().sort((a, b) => a.titel.localeCompare(b.titel, 'de'))
      .map(r => new Paragraph({ spacing: { after: 20 }, children: [t(`${r.titel}`, { size: 19 }), t(`  ·  Nr. ${r.nr}`, { size: 19, color: GRAU })] }))];
  return [...titel, ...impressum, ...toc, ...einl, ...sf, ...kb, ...kapitel.flatMap(kapitelSeiten), ...planSeiten(), ...bonus, ...schluss, ...register];
}

const nummerierungen = [{ reference: 'punkte', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 300, hanging: 220 } }, run: { color: ORANGE } } }] }];
const children = inhaltsSeitenHaupt();
for (let i = 0; i < listeNr; i++) nummerierungen.push({ reference: `schritte${i}`, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 360, hanging: 300 } }, run: { bold: true, color: ORANGE, font: HEAD } } }] });

const doc = new Document({
  creator: 'Gertraud Kron', title: 'Kochbuch für Teenager',
  styles: {
    default: { document: { run: { font: BODY, size: 22 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: HEAD, size: 44, bold: true, color: ORANGE }, paragraph: { outlineLevel: 0 } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: HEAD, size: 32, bold: true }, paragraph: { outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true, run: { font: HEAD, size: 26, bold: true, color: ORANGE }, paragraph: { outlineLevel: 2 } },
    ],
  },
  features: { updateFields: true },
  numbering: { config: nummerierungen },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1080, bottom: 1080, left: 1080, right: 720, gutter: 180 } } },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: [PageNumber.CURRENT], font: HEAD, size: 18, color: GRAU })] })] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(b => { fs.writeFileSync(path.join(DIR, 'Kochbuch_fuer_Teenager_NEU.docx'), b); console.log('ok', kapitel.flatMap(k => k.rezepte).length, 'Rezepte'); });
