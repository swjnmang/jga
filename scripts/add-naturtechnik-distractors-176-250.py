#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Add curated distractors to Natur/Technik cards 176-250
"""

import re

# Read the file
file_path = 'lib/naturTechnikCards.ts'
with open(file_path, 'r', encoding='utf-8') as f:
    content = f.read()

# Define all distractors for cards 176-250
distractors = {
    'naturtechnik-hard-176': ['P = U · I.', 'R = U / I².', 'I = U · R.'],
    'naturtechnik-hard-177': ['Die Verschmelzung zweier Organismen zu einem.', 'Die Aufspaltung eines Organismus in mehrere Teile.', 'Die Symbiose zwischen verschiedenen Arten.'],
    'naturtechnik-hard-178': ['Compton-Effekt.', 'Photoelektrischer Effekt.', 'Zeeman-Effekt.'],
    'naturtechnik-hard-179': ['Eine Planck-Konstante.', 'Die Lichtgeschwindigkeit.', 'Unendlich.'],
    'naturtechnik-hard-180': ['Fluor.', 'Fermium.', 'Francium.'],
    'naturtechnik-hard-181': ['Molekül.', 'Proton.', 'Quark.'],
    'naturtechnik-hard-182': ['Energie kann weder erzeugt noch vernichtet werden.', 'Die Temperatur ist direkt proportional zur kinetischen Energie.', 'Wärme fließt immer vom kalten zum warmen Körper.'],
    'naturtechnik-hard-183': ['Diode.', 'Kondensator.', 'Widerstand.'],
    'naturtechnik-hard-184': ['Ca. 150.000 km/s.', 'Ca. 500.000 km/s.', 'Ca. 1.000.000 km/s.'],
    'naturtechnik-hard-185': ['Ionenbindung.', 'Metallbindung.', 'Van-der-Waals-Bindung.'],
    'naturtechnik-hard-186': ['Der innerste Kern des Schwarzen Lochs.', 'Die Rotationsachse des Schwarzen Lochs.', 'Die äußere Grenze der Gravitationswirkung.'],
    'naturtechnik-hard-187': ['Lipase.', 'Pepsin.', 'Trypsin.'],
    'naturtechnik-hard-188': ['Analoge Bildverarbeitung.', 'Vektorgrafik.', 'Holografie.'],
    'naturtechnik-hard-189': ['Fusion setzt Energie frei, Spaltung absorbiert sie.', 'Fusion teilt Kerne, Spaltung verbindet sie.', 'Beide Prozesse sind identisch.'],
    'naturtechnik-hard-190': ['Isaac Newton.', 'Niels Bohr.', 'Max Planck.'],
    'naturtechnik-hard-191': ['Er wird verbraucht und setzt Energie frei.', 'Er verlangsamt Reaktionen.', 'Er erhöht die Aktivierungsenergie.'],
    'naturtechnik-hard-192': ['Einzelhelix.', 'Dreifachhelix.', 'Ringstruktur.'],
    'naturtechnik-hard-193': ['Das Gay-Lussac-Gesetz.', 'Das Henry-Gesetz.', 'Das Avogadro-Gesetz.'],
    'naturtechnik-hard-194': ['Masse.', 'Gewicht.', 'Volumen.'],
    'naturtechnik-hard-195': ['Bindung durch Elektronenübertragung.', 'Bindung durch Metallgitter.', 'Bindung durch Dipolkräfte.'],
    'naturtechnik-hard-196': ['Proton.', 'Elektron.', 'Positron.'],
    'naturtechnik-hard-197': ['Energie und Zeit sind immer exakt messbar.', 'Masse und Energie sind proportional zueinander.', 'Ort und Zeit können beliebig genau bestimmt werden.'],
    'naturtechnik-hard-198': ['Kupfer.', 'Gold.', 'Aluminium.'],
    'naturtechnik-hard-199': ['Meiose.', 'Apoptose.', 'Nekrose.'],
    'naturtechnik-hard-200': ['Ampere.', 'Weber.', 'Gauß.'],
    'naturtechnik-hard-201': ['Thermoelektrischer Effekt.', 'Fotoelektrischer Effekt.', 'Photorefraktiver Effekt.'],
    'naturtechnik-hard-202': ['-100 °C.', '-459 °C.', '0 °C.'],
    'naturtechnik-hard-203': ['Ein Elektron.', 'Ein Proton.', 'Ein Neutron.'],
    'naturtechnik-hard-204': ['Das Herz.', 'Die Niere.', 'Die Lunge.'],
    'naturtechnik-hard-205': ['$O_2$.', '$O_4$.', '$O$.'],
    'naturtechnik-hard-206': ['Ein Maß für Energie in einem System.', 'Ein Maß für Druck in einem Gas.', 'Ein Maß für Temperatur in Flüssigkeiten.'],
    'naturtechnik-hard-207': ['Mesophile.', 'Saprophyten.', 'Pathogene.'],
    'naturtechnik-hard-208': ['Archimedes-Prinzip.', 'Pascal-Prinzip.', 'Newton-Prinzip.'],
    'naturtechnik-hard-209': ['Spannung in Halbleitern durch Licht.', 'Stromfluss durch Temperaturunterschiede.', 'Widerstand in Metallen bei Kälte.'],
    'naturtechnik-hard-210': ['Kondensation.', 'Verdampfung.', 'Schmelzen.'],
    'naturtechnik-hard-211': ['Glukagon.', 'Adrenalin.', 'Thyroxin.'],
    'naturtechnik-hard-212': ['Halbierung der Kosten alle zwei Jahre.', 'Verdopplung der Rechenleistung jedes Jahr.', 'Verdreifachung der Transistoren alle drei Jahre.'],
    'naturtechnik-hard-213': ['Fliehkraft durch Rotation.', 'Anziehung zwischen Massen.', 'Reibung in der Atmosphäre.'],
    'naturtechnik-hard-214': ['Ionenbindung.', 'Kovalente Bindung.', 'Metallbindung.'],
    'naturtechnik-hard-215': ['Heiße Verbrennung.', 'Kernfusion.', 'Elektrolyse.'],
    'naturtechnik-hard-216': ['Induktionsstrom verstärkt seine Ursache.', 'Magnetfelder ziehen sich immer an.', 'Spannung ist proportional zum Widerstand.'],
    'naturtechnik-hard-217': ['Chromosom.', 'Ribosom.', 'Allel.'],
    'naturtechnik-hard-218': ['Ca. 7,5 km/s.', 'Ca. 25 km/s.', 'Ca. 40 km/s.'],
    'naturtechnik-hard-219': ['Systeme maximieren die Wirkung.', 'Energie bleibt immer erhalten.', 'Entropie nimmt ab.'],
    'naturtechnik-hard-220': ['Kollagen.', 'Myosin.', 'Hämoglobin.'],
    'naturtechnik-hard-221': ['Satz des Thales.', 'Satz von Fermat.', 'Satz von Gauß.'],
    'naturtechnik-hard-222': ['Leben entstand durch Blitze im Urmeer.', 'Leben wurde von Gott erschaffen.', 'Leben entstand spontan aus unbelebter Materie.'],
    'naturtechnik-hard-223': ['Reaktionsenergie.', 'Bindungsenergie.', 'Ionisierungsenergie.'],
    'naturtechnik-hard-224': ['Magnetfeldverstärkung in Supraleitern.', 'Temperaturanstieg in Supraleitern.', 'Widerstandsanstieg in Metallen.'],
    'naturtechnik-hard-225': ['Mitochondrien.', 'Zellkern.', 'Golgi-Apparat.'],
    'naturtechnik-hard-226': ['Atom.', 'Ion.', 'Kristall.'],
    'naturtechnik-hard-227': ['Atom mit unterschiedlicher Elektronenzahl.', 'Atom mit unterschiedlicher Protonenzahl.', 'Molekül mit unterschiedlicher Struktur.'],
    'naturtechnik-hard-228': ['Druck nimmt mit der Tiefe ab.', 'Druck wirkt nur nach unten.', 'Druck ist unabhängig von der Tiefe.'],
    'naturtechnik-hard-229': ['Kühlmittel (z.B. Wasser).', 'Steuerstäbe (z.B. Cadmium).', 'Brennstoff (z.B. Uran).'],
    'naturtechnik-hard-230': ['Konvektion.', 'Osmose.', 'Sedimentation.'],
    'naturtechnik-hard-231': ['Symmetrie.', 'Chaos.', 'Periodizität.'],
    'naturtechnik-hard-232': ['Maß für biologische Vielfalt.', 'Skala für Erdbebenstärke.', 'Temperatureinheit.'],
    'naturtechnik-hard-233': ['Lederhaut.', 'Unterhaut.', 'Basalschicht.'],
    'naturtechnik-hard-234': ['Newton.', 'Galilei.', 'Pascal.'],
    'naturtechnik-hard-235': ['Substrat hemmt die eigene Reaktion.', 'Zwei Stoffe beschleunigen sich gegenseitig.', 'Katalysator wird verbraucht.'],
    'naturtechnik-hard-236': ['Spannung durch Temperaturdifferenz.', 'Licht durch Stromfluss.', 'Magnetfeld durch Wärme.'],
    'naturtechnik-hard-237': ['Goldener Schnitt.', 'Primzahlen.', 'Quadratzahlen.'],
    'naturtechnik-hard-238': ['Erhöhter Widerstand bei tiefer Temperatur.', 'Perfekte Isolation bei Raumtemperatur.', 'Magnetismus bei hoher Temperatur.'],
    'naturtechnik-hard-239': ['Photon.', 'Graviton.', 'W-Boson.'],
    'naturtechnik-hard-240': ['Zellteilung nach der Befruchtung.', 'Bildung der Geschlechtszellen.', 'Einnistung der Eizelle.'],
    'naturtechnik-hard-241': ['Eisbildung in Flüssigkeiten.', 'Schallwellenbildung in Gasen.', 'Kristallbildung in Lösungen.'],
    'naturtechnik-hard-242': ['Widerstand eines Kondensators im Wechselstromkreis.', 'Widerstand eines Widerstands im Gleichstromkreis.', 'Widerstand eines Transistors im Schaltkreis.'],
    'naturtechnik-hard-243': ['Nötiges Tempo zum Verlassen des Sonnensystems.', 'Maximale Geschwindigkeit eines Satelliten.', 'Minimale Geschwindigkeit für Wiedereintritt.'],
    'naturtechnik-hard-244': ['Lichtbrechung an großen Objekten.', 'Lichtabsorption durch Gase.', 'Lichtreflexion an Spiegeln.'],
    'naturtechnik-hard-245': ['Ohmsches Gesetz.', 'Faraday-Gesetz.', 'Kirchhoff-Gesetz.'],
    'naturtechnik-hard-246': ['Ribose.', 'Glukose.', 'Fruktose.'],
    'naturtechnik-hard-247': ['Isotherm.', 'Isobar.', 'Isochor.'],
    'naturtechnik-hard-248': ['Gluon.', 'W-Boson.', 'Graviton.'],
    'naturtechnik-hard-249': ['Entropie.', 'Enthalpie.', 'Aktivierungsenergie.'],
    'naturtechnik-hard-250': ['Dunkle Energie.', 'Antimaterie.', 'Neutrinosmasse.'],
}

# Counter for successful updates
updated = 0

# Process each card
for card_id, distractor_list in distractors.items():
    # Escape special regex characters in distractors
    distractor_str = str(distractor_list).replace("'", "\\'")
    
    # Create the pattern to find the card
    pattern = rf"(\{{\s*id:\s*'{card_id}'[^}}]+sources:\s*\{{\}})\s*\}}"
    
    # Create the replacement with distractors
    replacement = r"\1, distractors: " + str(distractor_list) + " }"
    
    # Perform replacement
    new_content = re.sub(pattern, replacement, content)
    
    if new_content != content:
        content = new_content
        updated += 1
        print(f"✓ Added distractors to {card_id}")
    else:
        print(f"✗ Failed to find {card_id}")

# Write back to file
with open(file_path, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✅ Added distractors to {updated}/{len(distractors)} cards")
