#!/usr/bin/env python3
"""Add distractors for remaining medium cards 133-175"""
import re

distractors_data = {
    'naturtechnik-medium-133': ['Chlorophyll.', 'Melanin.', 'Bilirubin.'],
    'naturtechnik-medium-134': ['Kraft.', 'Beschleunigung.', 'Energie.'],
    'naturtechnik-medium-135': ['Widerstand.', 'Transformator.', 'Schutzschalter.'],
    'naturtechnik-medium-136': ['Dioxid.', 'Methan.', 'Stickoxid.'],
    'naturtechnik-medium-137': ['Botanik.', 'Zoologie.', 'Mikrobiologie.'],
    'naturtechnik-medium-138': ['Faraday-Effekt.', 'Joule-Effekt.', 'Lenz-Effekt.'],
    'naturtechnik-medium-139': ['Hydrosphäre.', 'Lithosphäre.', 'Biosphäre.'],
    'naturtechnik-medium-140': ['Feldspar.', 'Calcit.', 'Ton.'],
    'naturtechnik-medium-141': ['Gleichwarm.', 'Kaltblüter.', 'Wärmespeicherer.'],
    'naturtechnik-medium-142': ['Henry.', 'Watt.', 'Ampere.'],
    'naturtechnik-medium-143': ['Thermoelektrischer Effekt.', 'Seebeck-Effekt.', 'Peltier-Effekt.'],
    'naturtechnik-medium-144': ['Neuronen.', 'Dendriten.', 'Axone.'],
    'naturtechnik-medium-145': ['Mars.', 'Merkur.', 'Jupiter.'],
    'naturtechnik-medium-146': ['Byte.', 'Megabyte.', 'Terabyte.'],
    'naturtechnik-medium-147': ['Filtration.', 'Osmose.', 'Destillation.'],
    'naturtechnik-medium-148': ['Helium.', 'Kohlenstoff.', 'Sauerstoff.'],
    'naturtechnik-medium-149': ['Auftrieb.', 'Reibungswiderstand.', 'Gewicht.'],
    'naturtechnik-medium-150': ['Mittelohr.', 'Außenohr.', 'Gehirn.'],
    'naturtechnik-medium-151': ['Dichte.', 'Viskosität.', 'Oberflächenspannung.'],
    'naturtechnik-medium-152': ['Blei.', 'Arsen.', 'Cadmium.'],
    'naturtechnik-medium-153': ['RAM.', 'CPU.', 'Grafikkarte.'],
    'naturtechnik-medium-154': ['Normalfraft.', 'Trägheitskraft.', 'Zentripetalkraft.'],
    'naturtechnik-medium-155': ['Parasitismus.', 'Kommensalismus.', 'Konkurrenz.'],
    'naturtechnik-medium-156': ['Aluminium.', 'Kupfer.', 'Blei.'],
    'naturtechnik-medium-157': ['Brechung.', 'Absorption.', 'Streuung.'],
    'naturtechnik-medium-158': ['Watt.', 'Pascal.', 'Hertz.'],
    'naturtechnik-medium-159': ['Ag.', 'Cu.', 'Fe.'],
    'naturtechnik-medium-160': ['Hydrosphäre.', 'Atmosphäre.', 'Biosphäre.'],
    'naturtechnik-medium-161': ['Spule.', 'Widerstand.', 'Diode.'],
    'naturtechnik-medium-162': ['Laubabwerfende.', 'Sommergrüne.', 'Nadelbäume.'],
    'naturtechnik-medium-163': ['Stickstoffoxid.', 'Kohlendioxid.', 'Methan.'],
    'naturtechnik-medium-164': ['Bewegungsenergie.', 'Wärmeenergie.', 'Kernenergie.'],
    'naturtechnik-medium-165': ['Ohr.', 'Schwimmblase.', 'Augen.'],
    'naturtechnik-medium-166': ['Programm.', 'Software.', 'Befehl.'],
    'naturtechnik-medium-167': ['Schmelzen.', 'Sublimation.', 'Erweichung.'],
    'naturtechnik-medium-168': ['Cortisol.', 'Insulin.', 'Testosteron.'],
    'naturtechnik-medium-169': ['Biomechanik.', 'Biologie.', 'Technologie.'],
    'naturtechnik-medium-170': ['Ionenbindung.', 'Metallbindung.', 'Wasserstoffbindung.'],
    'naturtechnik-medium-171': ['Mittelhirn.', 'Vorderhirn.', 'Kleinhirn.'],
    'naturtechnik-medium-172': ['Kinetische Energie.', 'Wärmeenergie.', 'Strahlungsenergie.'],
    'naturtechnik-medium-173': ['Alkohol.', 'Harnstoff.', 'Salz.'],
    'naturtechnik-medium-174': ['Polymerisation.', 'Abbau.', 'Oxidation.'],
    'naturtechnik-medium-175': ['Licht.', 'Temperatur.', 'Druck.'],
}

filepath = 'lib/naturTechnikCards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
# For each card, add distractors
for card_id, distractors in distractors_data.items():
    distractors_json = ', '.join([f"'{d}'" for d in distractors])
    pattern = f"(id: '{card_id}'[^}}]*?)sources: {{}}"
    replacement = f"\\1sources: {{}}, distractors: [{distractors_json}]"
    
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        count += 1
        print(f"✓ {card_id}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✓ Added distractors to {count} cards (133-175)")
