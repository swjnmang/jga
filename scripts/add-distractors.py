#!/usr/bin/env python3
"""
Add predefined distractors to naturTechnikCards
"""
import json
import re

# Dictionary of card IDs to their distractors
DISTRACTORS_MAP = {
    # Medium cards 086-100
    'naturtechnik-medium-086': ['Das Newtonsche Gesetz.', 'Das Bernoulli-Prinzip.', 'Das Pascalsche Gesetz.'],
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
    # Medium cards 101-110
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
}

def add_distractors_to_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # For each card that needs distractors
    for card_id, distractors in DISTRACTORS_MAP.items():
        # Create distractors string
        distractors_str = ', '.join([f"'{d}'" for d in distractors])
        
        # Find and replace the line: replace sources: {} with sources: {}, distractors: [...]
        pattern = f"id: '{card_id}'[^}}]*sources: {{}}"
        replacement = f"id: '{card_id}'" + f", distractors: [{distractors_str}]}}}}".replace(", sources: {}", ", sources: {}")
        
        # Actually, let's use a more reliable regex approach
        pattern = f"(id: '{card_id}'[^}}]*?)sources: {{}}"
        replacement = f"\\1sources: {{}}, distractors: [{distractors_str}]"
        
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"Added distractors to {filepath}")

if __name__ == '__main__':
    filepath = 'lib/naturTechnikCards.ts'
    add_distractors_to_file(filepath)
