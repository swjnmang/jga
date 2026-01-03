#!/usr/bin/env python3
"""Bulk add distractors to naturTechnikCards.ts"""
import re

# All distractors for medium and schwer cards (101-256)
distractors_data = {
    'naturtechnik-medium-087': ['Stratosphäre.', 'Mesosphäre.', 'Thermosphäre.'],
    'naturtechnik-medium-088': ['Widerstand.', 'Transformator.', 'Relais.'],
    'naturtechnik-medium-089': ['Zellatmung.', 'Chemosynthese.', 'Gärung.'],
    'naturtechnik-medium-090': ['Volt (V).', 'Ampere (A).', 'Watt (W).'],
    'naturtechnik-medium-091': ['Gallium.', 'Cäsium.', 'Indium.'],
    'naturtechnik-medium-092': ['Der Kern des Wirbels.', 'Der Rand des Sturms.', 'Die Wolkenbildung.'],
    'naturtechnik-medium-093': ['Blutgruppe AB positiv.', 'Blutgruppe A negativ.', 'Blutgruppe B positiv.'],
    'naturtechnik-medium-094': ['Die Wellenlänge.', 'Die Amplitude.', 'Die Periode.'],
    'naturtechnik-medium-095': ['Zoologie.', 'Botanik.', 'Ökologie.'],
    'naturtechnik-medium-096': ['Sauerstoff (ca. 21 %).', 'Kohlenstoffdioxid (ca. 0,04 %).', 'Argon (ca. 0,93 %).'],
    'naturtechnik-medium-097': ['Potenzielle Energie.', 'Thermische Energie.', 'Elektromagnetische Energie.'],
    'naturtechnik-medium-098': ['Chloroplasten.', 'Ribosomen.', 'Golgi-Apparat.'],
    'naturtechnik-medium-099': ['Nikola Tesla.', 'Humphry Davy.', 'Joseph Swan.'],
    'naturtechnik-medium-100': ['Äußerer Kern.', 'Innerer Kern.', 'Lithosphäre.'],
    'naturtechnik-medium-101': ['Die Lichtgeschwindigkeit.', 'Die Helligkeit eines Sterns.', 'Eine Maßeinheit für Temperatur.'],
    'naturtechnik-medium-102': ['Zerstreuungslinse.', 'Zylinderlinse.', 'Prisma.'],
    'naturtechnik-medium-103': ['Die Isolation eines Materials.', 'Die Flexibilität eines Materials.', 'Die Transparenz eines Materials.'],
    'naturtechnik-medium-104': ['Fleischfresser.', 'Pflanzenfresser.', 'Aasfresser.'],
    'naturtechnik-medium-105': ['Kolben.', 'Vergaser.', 'Batterie.'],
    'naturtechnik-medium-106': ['Kilopascal (kPa).', 'Megahertz (MHz).', 'Newton (N).'],
    'naturtechnik-medium-107': ['Lava.', 'Basalt.', 'Tuff.'],
    'naturtechnik-medium-108': ['Immunabwehr.', 'Gerinnungsfaktor.', 'Hormonverteilung.'],
    'naturtechnik-medium-109': ['Gregor Mendel.', 'Jean-Baptiste Lamarck.', 'Alfred Russel Wallace.'],
    'naturtechnik-medium-110': ['Jupiter.', 'Uranus.', 'Neptun.'],
    'naturtechnik-medium-111': ['Nieten.', 'Schrauben.', 'Kleben.'],
    'naturtechnik-medium-112': ['Infrarot-Thermografie.', 'Ultraschall.', 'Magnetresonanztomografie.'],
    'naturtechnik-medium-113': ['Kupferkabel.', 'Koaxialkabel.', 'Satellitenschüssel.'],
    'naturtechnik-medium-114': ['Evolution.', 'Ökologie.', 'Entwicklungsbiologie.'],
    'naturtechnik-medium-115': ['N (Stickstoff).', 'H (Wasserstoff).', 'C (Kohlenstoff).'],
    'naturtechnik-medium-116': ['Inverter.', 'Gleichrichter.', 'Regler.'],
    'naturtechnik-medium-117': ['Brechung.', 'Reflexion.', 'Absorption.'],
    'naturtechnik-medium-118': ['Vitamin A.', 'Vitamin B.', 'Vitamin C.'],
    'naturtechnik-medium-119': ['Bogenbrücke.', 'Schrägseilbrücke.', 'Balkenbrücke.'],
    'naturtechnik-medium-120': ['Meteorit ist ein Gesteinsfragment, Meteoroid ist im All.', 'Sie sind identisch.', 'Ein Meteoroid ist größer.'],
    'naturtechnik-medium-121': ['Kernenergie.', 'Sonnenenergie.', 'Bewegungsenergie.'],
    'naturtechnik-medium-122': ['Lungen.', 'Haut.', 'Darm.'],
    'naturtechnik-medium-123': ['Newtonsches Bewegungsgesetz.', 'Gravitationsgesetz.', 'Erhaltungssatz des Impulses.'],
    'naturtechnik-medium-124': ['Ein sehr dünnes Gas.', 'Absolute Kälte.', 'Ein Bereich ohne Partikel.'],
    'naturtechnik-medium-125': ['Sauerstoff (O₂).', 'Stickstoff (N₂).', 'Methan (CH₄).'],
    'naturtechnik-medium-126': ['Mojave-Wüste.', 'Gobi-Wüste.', 'Kalahari-Wüste.'],
    'naturtechnik-medium-127': ['Fokussierung von Licht.', 'Lichtstabilisierung.', 'Farbausgleich.'],
    'naturtechnik-medium-128': ['Barometer.', 'Hygrometer.', 'Pyranometer.'],
    'naturtechnik-medium-129': ['Brechung.', 'Absorption.', 'Transmission.'],
    'naturtechnik-medium-130': ['Eichhörnchen.', 'Flugfisch.', 'Gleitotter.'],
    'naturtechnik-medium-131': ['Polymer.', 'Verbundstoff.', 'Komposit.'],
    'naturtechnik-medium-132': ['Zeit.', 'Helligkeit.', 'Temperatur.'],
}

filepath = 'lib/naturTechnikCards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# For each card, add distractors
for card_id, distractors in distractors_data.items():
    # Find the line with this card ID and replace it
    # Pattern: { id: 'card-id'... sources: {} }
    distractors_json = ', '.join([f"'{d}'" for d in distractors])
    
    # Create regex to find and replace
    pattern = f"(id: '{card_id}'[^}}]*?)sources: {{}}"
    replacement = f"\\1sources: {{}}, distractors: [{distractors_json}]"
    
    content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    print(f"Updated {card_id}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nAdded distractors to {filepath}")
