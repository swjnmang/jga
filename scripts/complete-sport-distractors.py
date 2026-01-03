#!/usr/bin/env python3
"""Add missing distractors to remaining sport cards"""
import re

additional_sport_distractors = {
    'sportfreizeit-fitness-cardio': ['180 minus Lebensalter.', '210 plus Lebensalter.', '200 plus Alter/2.'],
    'sportfreizeit-yoga-sonnengruü': ['Mondgruü.', 'Sternengruü.', 'Sterngruü.'],
    'sportfreizeit-laufschuh-drop': ['Gewichtsunterschied zwischen Ferse und Vorfuü.', 'Schuhart-Code.', 'Flexibilitätsrating.'],
    'sportfreizeit-fahrrad-rahmen': ['Schuh-Größe.', 'Torsionswert.', 'Pedalabstand.'],
    'sportfreizeit-wandern-hoehenmeter': ['Höhenstufen.', 'Gefällestrecken.', 'Steigungsmeter.'],
    'sportfreizeit-surfen-welle': ['Plane Break.', 'Shore Break.', 'Wind Wave.'],
    'sportfreizeit-schwimmen-lagen': ['Delphin.', 'Promenade.', 'Tauchergang.'],
    'sportfreizeit-badminton-punkt': ['15 Punkte.', '25 Punkte.', '18 Punkte.'],
    'sportfreizeit-tischtennis-set': ['Best of 3; WM Best of 5.', 'Best of 9.', 'Best of 11.'],
    'sportfreizeit-rudern-boot': ['Doppelzweier.', 'Vierer.', 'Zweier mit Steuermann.'],
    'sportfreizeit-kanu-vs-kajak': ['Spritzbrett und Sitz-Position.', 'Boot-Material.', 'Gewicht-Limit.'],
    'sportfreizeit-klettern-sichern': ['Sicherungscheck.', 'Aufstiegscheck.', 'Knoten-Kontrolle.'],
    'sportfreizeit-laufen-intervalle': ['Ausdauer, Kraft und mentale Härte.', 'Knochendichte.', 'Koordination.'],
    'sportfreizeit-fitness-muskelaufbau': ['Negative Bewegungen und Dehnung.', 'Langsame Wiederholungen.', 'Muskelzerreißung.'],
    'sportfreizeit-ernahrung-protein': ['0,8–1,2 g Protein pro kg KG.', '2,5–3,5 g Protein pro kg KG.', 'Proteinaufnahme ist egal.'],
    'sportfreizeit-regeneration-schlaf': ['Gewichtsverlust, Appetit, Fokus.', 'Magnesium-Aufnahme.', 'Trainingsvolumen.'],
    'sportfreizeit-hydration': ['Niedriger Blutdruck, schnelle Atmung, feuchte Haut.', 'Niedriger Puls, kühle Extremitäten.', 'Hoher Blutdruck, rote Haut.'],
    'sportfreizeit-triathlon-reihenfolge': ['Laufen, Schwimmen, Radfahren.', 'Radfahren, Laufen, Schwimmen.', 'Beliebige Reihenfolge.'],
    'sportfreizeit-olympia-triathlon': ['2 km Schwimmen, 40 km Rad, 10 km Lauf.', '1 km Schwimmen, 40 km Rad, 10 km Lauf.', '1,5 km Schwimmen, 50 km Rad, 5 km Lauf.'],
    'sportfreizeit-kampfsport-gurte': ['Rot und Weiß; Braun und Schwarz (Übergangsgürtel).', 'Blau und Weiß.', 'Grau und Schwarz.'],
    'sportfreizeit-fechten-waffen': ['Pistole und Lanze (historisch).', 'Schwert und Beil.', 'Speer und Schild.'],
    'sportfreizeit-reiten-disziplin': ['Western, English, Tricks.', 'Barock, Klassisch, Modern.', 'Zirkus, Freizeit, Sport.'],
    'sportfreizeit-schwimmen-weltrekord': ['Unter 46 Sekunden.', 'Unter 48 Sekunden.', 'Unter 45 Sekunden.'],
    'sportfreizeit-gewichtheben-klassen': ['Werfen und Ziehen.', 'Heben und Senken.', 'Reißen und Hochziehen.'],
    'sportfreizeit-parkour': ['Möglichst schnell um Hindernisse herumzulaufen.', 'Mit möglichst viel Kraft über Hindernisse zu springen.', 'Mit Hilfsmitteln über Hindernisse zu klettern.'],
}

filepath = 'lib/triviaExtraCards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
for card_id, dists in additional_sport_distractors.items():
    dists_json = ', '.join([f"'{d}'" for d in dists])
    pattern = f"(id: '{card_id}'[^}}]*?)sources: {{}}"
    replacement = f"\\1sources: {{}}, distractors: [{dists_json}]"
    
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added {count}/{len(additional_sport_distractors)} additional sport distractors")
