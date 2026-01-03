#!/usr/bin/env python3
"""Add all distractors to triviaExtraCards with proper quote escaping"""
import re

all_distractors = {
    # Sports - 20 cards
    'sportfreizeit-fussball-wm-2014': ['Lionel Messi.', 'Cristiano Ronaldo.', 'Bastian Schweinsteiger.'],
    'sportfreizeit-tennis-grand-slam': ['German Open.', 'Canadian Open.', 'Swiss Open.'],
    'sportfreizeit-marathon-distanz': ['40 Kilometer.', '43 Kilometer.', '41 Kilometer.'],
    'sportfreizeit-tour-de-france-berg': ['Mont Ventoux.', 'Col du Tourmalet.', 'Galibier.'],
    'sportfreizeit-superbowl-titel': ['Dallas Cowboys.', 'San Francisco 49ers.', 'Green Bay Packers.'],
    'sportfreizeit-olympia-ringe': ['Orange, Lila, Braun, Grau, Rosa.', 'Rot, Orange, Gelb, Grün, Blau.', 'Weiß, Schwarz, Gold, Silber, Bronze.'],
    'sportfreizeit-basketball-nba-rekord': ['Michael Jordan.', 'Shaquille O\'Neal.', 'Kobe Bryant.'],
    'sportfreizeit-handball-feld': ['Sechs.', 'Acht.', 'Neun.'],
    'sportfreizeit-schach-eroeffnung': ['Italienische Partie.', 'Skandinavische Verteidigung.', 'Englische Eröffnung.'],
    'sportfreizeit-golf-major': ['Open de France.', 'Players Championship.', 'Memorial Tournament.'],
    'sportfreizeit-formel1-wm': ['Juan Manuel Fangio.', 'Sebastian Vettel.', 'Max Verstappen.'],
    'sportfreizeit-eishockey-stanley': ['Toronto Maple Leafs.', 'Detroit Red Wings.', 'Boston Bruins.'],
    'sportfreizeit-bundesliga-meister': ['Borussia Dortmund.', 'Hamburg SV.', 'Schalke 04.'],
    'sportfreizeit-ski-abfahrt': ['Parallel-Slalom.', 'Technik-Mix.', 'Downhill-Variante.'],
    'sportfreizeit-boxen-schwergewicht': ['Mike Tyson.', 'Lennox Lewis.', 'Floyd Mayweather.'],
    'sportfreizeit-darts-maximum': ['171 Punkte.', '169 Punkte.', '162 Punkte.'],
    'sportfreizeit-snooker-maximum-break': ['142 Punkte.', '145 Punkte.', '150 Punkte.'],
    'sportfreizeit-volleyball-groesse': ['19 x 10 Meter.', '17 x 8 Meter.', '20 x 10 Meter.'],
    'sportfreizeit-klettern-bewertung': ['Fontainebleau-Skala.', 'USA-Skala.', 'Ewbank-Skala.'],
    'sportfreizeit-olympia-host': ['Peking.', 'Rio de Janeiro.', 'Sydney.'],
    # Religion - 51 cards
    'religion-001': ['Der Koran.', 'Die Tora.', 'Die Bhagavad Gita.'],
    'religion-002': ['Der Heilige Geist.', 'Maria.', 'Johannes der Täufer.'],
    'religion-003': ['Fünf Gebote.', 'Sechs Gebote.', 'Neun Gebote.'],
    'religion-004': ['Ostern.', 'Pfingsten.', 'Epiphanie.'],
    'religion-005': ['Der Davidstern.', 'Die Moschee.', 'Das Rad des Dharma.'],
    'religion-006': ['Noah.', 'Abraham.', 'Kain.'],
    'religion-007': ['Maria.', 'Lilith.', 'Ruth.'],
    'religion-008': ['Der Berg Sinai.', 'Das Gelobte Land.', 'Das Rote Meer.'],
    'religion-009': ['Ein Apfel.', 'Ein Engel.', 'Ein Dämon.'],
    'religion-010': ['Abraham.', 'Moses.', 'Lot.'],
    'religion-011': ['Ein Kardinal.', 'Ein Bischof.', 'Ein Priester.'],
    'religion-012': ['Nazareth.', 'Jerusalem.', 'Jericho.'],
    'religion-013': ['Zehn.', 'Acht.', 'Fünfzehn.'],
    'religion-014': ['Die Geburt Jesu.', 'Seine Himmelfahrt.', 'Seine Taufe.'],
    'religion-015': ['Das Ave Maria.', 'Das Glaubensbekenntnis.', 'Das Magnificat.'],
    'religion-016': ['Eine Taube.', 'Eine Rabe.', 'Ein Adler.'],
    'religion-017': ['Die Firmung.', 'Die Kommunion.', 'Die Ehe.'],
    'religion-018': ['Exodus.', 'Levitikus.', 'Numeri.'],
    'religion-019': ['Heiliger Nikolaus.', 'Sankt Georg.', 'Sankt Patrick.'],
    'religion-020': ['Paulus.', 'Petrus.', 'Bartholomäus.'],
    'religion-021': ['Auf Wiedersehen.', 'Finis.', 'Ende.'],
    'religion-022': ['Simon Petrus.', 'Jakob.', 'Thomas.'],
    'religion-023': ['Der Tigris.', 'Der Euphrat.', 'Der Nil.'],
    'religion-024': ['Weihnachten.', 'Ostern.', 'Epiphanie.'],
    'religion-025': ['Hanna und Joachim.', 'Zacharias und Elisabeth.', 'Zechariah und Mary.'],
    'religion-026': ['Im Alten Testament.', 'In der Apokalypse.', 'In der Offenbarung.'],
    'religion-027': ['Der Himmel.', 'Das Fegefeuer.', 'Nirvana.'],
    'religion-028': ['Noah.', 'Abraham.', 'Jakob.'],
    'religion-029': ['Die Bibel.', 'Die Tora.', 'Die Vedas.'],
    'religion-030': ['Jesus.', 'Abraham.', 'Noah.'],
    'religion-031': ['Gott.', 'Herr.', 'Der Ewige.'],
    'religion-032': ['Medina.', 'Bagdad.', 'Kairo.'],
    'religion-033': ['Hajj.', 'Salat.', 'Zakat.'],
    'religion-034': ['Kirche.', 'Synagoge.', 'Tempel.'],
    'religion-035': ['Dreimal.', 'Sechsmal.', 'Zwölfmal.'],
    'religion-036': ['Rindfleisch.', 'Fisch.', 'Geflügel.'],
    'religion-037': ['Priester.', 'Pfarrer.', 'Muezzin.'],
    'religion-038': ['Samstag.', 'Sonntag.', 'Montag.'],
    'religion-039': ['Moschee.', 'Minarett.', 'Qibla.'],
    'religion-040': ['Das Kreuz.', 'Die Menora.', 'Das Om.'],
    'religion-041': ['Das Talmud.', 'Das Haggada.', 'Das Pirke Avot.'],
    'religion-042': ['Yom Kippur.', 'Sukkot.', 'Chanukkah.'],
    'religion-043': ['Tallit.', 'Tefillin.', 'Chuppah.'],
    'religion-044': ['Kirche.', 'Moschee.', 'Tempel.'],
    'religion-045': ['Chanukiah.', 'Mezzuzah.', 'Ark.'],
    'religion-046': ['Das Schwert Davids.', 'Davidsauge.', 'Davidsschild.'],
    'religion-047': ['Priester.', 'Levit.', 'Kantor.'],
    'religion-048': ['Halal.', 'Kashrut.', 'Rein.'],
    'religion-049': ['Confucius.', 'Laozi.', 'Krishna.'],
    'religion-050': ['China.', 'Japan.', 'Thailand.'],
    'religion-051': ['Der Elefant.', 'Der Tiger.', 'Der Affe.'],
}

filepath = 'lib/triviaExtraCards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
for card_id, dists in all_distractors.items():
    # Escape quotes properly for TypeScript
    dists_escaped = [d.replace("'", "\\'") for d in dists]
    dists_json = ', '.join([f"'{d}'" for d in dists_escaped])
    
    pattern = f"(id: '{card_id}'[^}}]*?)sources: {{}}"
    replacement = f"\\1sources: {{}}, distractors: [{dists_json}]"
    
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added distractors to {count}/{len(all_distractors)} cards")
