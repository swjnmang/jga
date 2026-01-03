#!/usr/bin/env python3
"""
Generate comprehensive, non-obvious distractors for ALL categories.
Replaces existing distractors with contextually appropriate, plausible but incorrect answers.

Strategy:
- IMAGE: Related historical events/dates or similar historical moments
- FILM/SERIEN: Similar movies/actors/genres/decades - not from same franchise
- OUTLINE: Geographically/morphologically similar countries
- NATUR/TECHNIK: Scientific misconceptions or similar concepts
- TRIVIA: Related concepts from the same domain but different context
"""
import re

# ============================================================================
# COMPREHENSIVE DISTRACTORS DATABASE
# ============================================================================

# For IMAGE cards - historical events from similar era/theme
image_distractors = {
    'image-berliner-mauerfall': ['Ungarn: Fluchtversuch an österreichischer Grenze 1989', 'Prag: Samtene Revolution Demonstrationen 1989', 'Berlin: Luftbrücke Blockade 1948-49'],
    'image-1989-tiananmen': ['Prag: Studentenproteste Karlsbrücke 1989', 'Berlin: Lichterkettenprotest 1989', 'Peking: Kulturrevolution Massenkundgebung 1966'],
}

# For FILM/SERIEN - substitute with movies from similar era, genre, or directors
# Strategy: Don't pick other films from SAME franchise, but related ones
film_distractors = {
    'filmeserien-001-der-pate': ['Robert De Niro in Goodfellas 1990', 'Jack Lemmon in Some Like It Hot 1959', 'Marlon Brando in Apocalypse Now 1979'],
    'filmeserien-002-der-pate-2': ['Sydney Pollack in They Shoot Horses Don\'t They 1969', 'Bernardo Bertolucci in The Last Emperor 1987', 'Federico Fellini in 8 1/2 1963'],
    'filmeserien-003-goodfellas': ['Brian De Palma in Scarface 1983', 'David Fincher in Zodiac 2007', 'Quentin Tarantino in Pulp Fiction 1994'],
    'filmeserien-004-schindlers-liste': ['Steven Spielberg in Saving Private Ryan 1998', 'Oliver Stone in Platoon 1986', 'Stanley Kubrick in Full Metal Jacket 1987'],
    'filmeserien-005-shawshank': ['Frank Darabont in The Green Mile 1999', 'Sidney Lumet in Dog Day Afternoon 1975', 'Norman Jewison in The Hurricane 1999'],
    'filmeserien-006-fight-club': ['David Fincher in Se7en 1995', 'David Fincher in Zodiac 2007', 'Christopher Nolan in Memento 2000'],
    'filmeserien-007-matrix': ['Joel Silver in The Matrix Reloaded 2003', 'Alex Proyas in Dark City 1998', 'James Cameron in Terminator 2 1991'],
    'filmeserien-008-lotr': ['Ralph Bakshi in Lord of the Rings 1978', 'Terry Gilliam in Twelve Monkeys 1995', 'Pete Jackson in King Kong 2005'],
    'filmeserien-009-lotr-gollum': ['Andy Serkis in The Lord of the Rings 2001', 'Bill Nighy in Love Actually 2003', 'Martin Freeman in The Hobbit 2012'],
    'filmeserien-010-hp-stein': ['Columbus in Chamber of Secrets 2002', 'Joel McNeely in Composer Filmography', 'Alexandre Desplat in Goblet of Fire 2005'],
    'filmeserien-011-hp-dumbledore': ['Ian McKellen in X-Men 2000', 'Patrick Stewart in Star Trek Generations 1994', 'Anthony Hopkins in The Father 2020'],
    'filmeserien-012-star-wars-iv': ['Harrison Ford in Indiana Jones 1981', 'Harrison Ford in Blade Runner 1982', 'Billy Dee Williams in The Empire Strikes Back 1980'],
    'filmeserien-013-star-wars-v': ['Frank Oz in Return of the Jedi 1983', 'Peter Mayhew in A New Hope 1977', 'David Prowse in Empire Strikes Back 1980'],
    'filmeserien-014-star-wars-vi': ['Frank Oz in Return of the Jedi 1983', 'David Jewison in Puppet Show 1995', 'Jim Henson in Labyrinth 1986'],
    'filmeserien-015-star-wars-vii': ['Daisy Ridley in Murder on the Orient Express 2017', 'Oscar Isaac in Ex Machina 2014', 'Gwendoline Christie in Crimson Peak 2015'],
    'filmeserien-016-rogue-one': ['Tony Gilroy in Michael Clayton 2007', 'Gia Coppola in Mainstream 2020', 'Gareth Edwards in Monsters 2010'],
    'filmeserien-017-marvel-ironman': ['Jon Favreau in Iron Man 2 2010', 'Kenneth Branagh in Thor 2011', 'Joss Whedon in The Avengers 2012'],
    'filmeserien-018-marvel-avengers': ['Anthony and Joe Russo in Captain America 2014', 'James Gunn in Guardians of the Galaxy 2014', 'Taika Waititi in Thor Ragnarok 2017'],
    'filmeserien-019-marvel-endgame': ['Anthony Russo in Infinity War 2018', 'Joe Russo in Civil War 2016', 'Joss Whedon in Age of Ultron 2015'],
    'filmeserien-020-marvel-thanos': ['Tom Hiddleston als Loki in The Avengers 2012', 'Josh Brolin als Cable in Deadpool 2 2018', 'Michael B. Jordan als Killmonger in Black Panther 2018'],
    'filmeserien-021-marvel-loki': ['Kate Herron als Director in Loki Episode 1', 'Justin Benson und Aaron Moorhead in Loki Season 2', 'Jac Schaeffer in WandaVision 2021'],
    'filmeserien-022-dc-dark-knight': ['Chris Nolan in Inception 2010', 'Chris Nolan in Interstellar 2014', 'Zack Snyder in Watchmen 2009'],
    'filmeserien-023-dc-dark-knight-rises': ['Chris Nolan in The Prestige 2006', 'Zack Snyder in Man of Steel 2013', 'David S. Goyer in Batman Begins 2005'],
    'filmeserien-024-dc-joker': ['Todd Phillips in The Hangover 2009', 'Denis Villeneuve in Enemy 2014', 'Ari Aster in Hereditary 2018'],
    'filmeserien-025-dune-2021': ['Hans Zimmer in Blade Runner 2049 2017', 'Ludwig Göransson in Black Panther 2018', 'Trent Reznor in The Social Network 2010'],
    'filmeserien-026-dune-spice': ['Frank Herbert in Dune: Messiah 1969', 'Kevin J. Anderson in Paul of Dune 2008', 'Jodorowsky in Dune Adaptations'],
    'filmeserien-027-blade-runner': ['Ridley Scott in Prometheus 2012', 'Ridley Scott in Exodus 2014', 'David Lynch in Eraserhead 1977'],
    'filmeserien-028-blade-runner-2049': ['Denis Villeneuve in Prisoners 2013', 'Denis Villeneuve in Sicario 2015', 'Denis Villeneuve in Arrival 2016'],
    'filmeserien-029-inception': ['Hans Zimmer in Interstellar 2014', 'Hans Zimmer in The Lion King 1994', 'Hans Zimmer in Pirates of the Caribbean 2003'],
    'filmeserien-030-interstellar': ['McConaughey in True Detective 2014', 'McConaughey in Mud 2012', 'McConaughey in Dazed and Confused 1993'],
    'filmeserien-031-tenet': ['Ludwig Göransson in Black Panther 2018', 'Trent Reznor in Gone Girl 2014', 'Atticus Ross in Bird Box 2018'],
    'filmeserien-032-memento': ['Thomas Nolan in Following 1998', 'Guy Pearce in L.A. Confidential 1997', 'Joe Pantoliano in The Matrix 1999'],
    'filmeserien-033-oppenheimer': ['Cillian Murphy in Scarecrow 2003', 'Cillian Murphy in 28 Days Later 2002', 'Cillian Murphy in Inception 2010'],
    'filmeserien-034-barbie': ['Margot Robbie in Once Upon a Time in Hollywood 2019', 'Margot Robbie in The Wolf of Wall Street 2013', 'Margot Robbie in I, Tonya 2017'],
    'filmeserien-035-titanic': ['James Cameron in Avatar 2009', 'James Cameron in Avatar 2 2022', 'James Cameron in True Lies 1994'],
    'filmeserien-036-avatar': ['Zoe Saldana in Star Trek 2009', 'Zoe Saldana in Guardians of the Galaxy Vol. 2 2017', 'Zoe Saldana in Colombiana 2011'],
    'filmeserien-037-avatar-2': ['Jon Landau in Avatar 2010 Producer', 'Sam Worthington in Clash of the Titans 2010', 'Sigourney Weaver in Alien 1979'],
    'filmeserien-038-jaws': ['Steven Spielberg in E.T. 1982', 'Steven Spielberg in Jurassic Park 1993', 'Steven Spielberg in Raiders 1981'],
    'filmeserien-039-e-t': ['Spielberg in Close Encounters 1977', 'Spielberg in War Horse 2011', 'Spielberg in Bridge of Spies 2015'],
    'filmeserien-040-jurassic-park': ['Spielberg in The Lost World 1997', 'Spielberg in Jurassic World 2015', 'Spielberg in War of the Worlds 2005'],
    'filmeserien-041-indiana-jones': ['Spielberg in Raiders of the Lost Ark 1981', 'Spielberg in Temple of Doom 1984', 'Spielberg in Last Crusade 1989'],
    'filmeserien-042-indiana-jones-3': ['Sean Connery in Never Say Never Again 1983', 'Sean Connery in From Russia with Love 1963', 'Sean Connery in The Rock 1996'],
    'filmeserien-043-alien': ['Ridley Scott in Blade Runner 1982', 'Ridley Scott in Aliens 1986', 'H.R. Giger in Jodorowsky Dune'],
    'filmeserien-044-aliens': ['James Cameron in Terminator 1984', 'James Cameron in True Lies 1994', 'James Cameron in Avatar 2009'],
    'filmeserien-045-terminator': ['Arnold Schwarzenegger in Commando 1985', 'Arnold Schwarzenegger in Total Recall 1990', 'Arnold Schwarzenegger in True Lies 1994'],
    'filmeserien-046-terminator-2': ['Edward Furlong in American History X 1998', 'Edward Furlong in Solaris 2002', 'Robert Patrick in Terminator Genisys 2015'],
    'filmeserien-047-mad-max-fury': ['Tom Hardy in The Revenant 2015', 'Tom Hardy in Venom 2018', 'Tom Hardy in Child 44 2015'],
    'filmeserien-048-matrix-resurrections': ['Keanu Reeves in John Wick 2014', 'Keanu Reeves in Speed 1994', 'Keanu Reeves in Bill and Ted 1989'],
    'filmeserien-049-lalaland': ['Damien Chazelle in Whiplash 2014', 'Damien Chazelle in First Man 2018', 'Justin Hurwitz in The Last Temptation of Christ'],
    'filmeserien-050-whiplash': ['Miles Teller in The Spectacular Now 2013', 'Miles Teller in Divergent 2014', 'JK Simmons in Terminator Genisys 2015'],
    'filmeserien-051-black-swan': ['Darren Aronofsky in Requiem for a Dream 2000', 'Darren Aronofsky in The Fountain 2006', 'Darren Aronofsky in Pi 1998'],
    'filmeserien-052-parasite': ['Bong Joon-ho in Okja 2017', 'Bong Joon-ho in Mother 2009', 'Bong Joon-ho in Memories of Murder 2003'],
    'filmeserien-053-oldboy': ['Park Chan-wook in Stoker 2013', 'Park Chan-wook in The Handmaiden 2016', 'Park Chan-wook in Thirst 2009'],
    'filmeserien-054-spirited-away': ['Hayao Miyazaki in Howls Moving Castle 2004', 'Hayao Miyazaki in Ponyo 2008', 'Hayao Miyazaki in Castle in the Sky 1986'],
    'filmeserien-055-princess-mononoke': ['Isao Takahata in Grave of the Fireflies 1988', 'Isao Takahata in Only Yesterday 1991', 'Yoshiaki Kawajiri in Wicked City'],
    'filmeserien-056-your-name': ['Makoto Shinkai in Your Name 2016', 'Makoto Shinkai in Weather With You 2019', 'Makoto Shinkai in Garden of Words 2013'],
    'filmeserien-057-demonslayer': ['Haruo Sotozaki in Mugen Train 2020', 'Haruo Sotozaki in Entertainment District', 'Youhei Suzuki in Dragon Quest Dai'],
    'filmeserien-058-akira': ['Katsuhiro Ohtomo in Akira 1988', 'Satoshi Kon in Perfect Blue 1997', 'Yoshiaki Kawajiri in Ninja Scroll'],
    'filmeserien-059-ghost-in-shell': ['Rupert Sanders in Ghost in the Shell 2017', 'Oshii Mamoru in Ghost in the Shell SAC', 'Spike Jonze in Her 2013'],
    'filmeserien-060-cowboy-bebop': ['Shinichiro Watanabe in Carole & Tuesday 2019', 'Shinichiro Watanabe in Space Dandy 2013', 'Shinichiro Watanabe in Samurai Champloo'],
    'filmeserien-061-attack-on-titan': ['Tetsuya Nakashima in Confessions 2010', 'Takeshi Fukunaga in Ergo Proxy', 'Yasuyuki Ebara in Death Note'],
    'filmeserien-062-breaking-bad': ['Vince Gilligan in Better Call Saul 2015', 'Rian Johnson in Breaking Bad 2008', 'Peter Gould in Better Call Saul'],
    'filmeserien-063-breaking-bad-saul': ['Bob Odenkirk in Little Accidents 2014', 'Bob Odenkirk in The Post 2017', 'Rhea Seehorn in I Love Dick'],
    'filmeserien-064-better-call-saul-finale': ['Jonathan Banks in Better Call Saul 2015', 'Jonathan Banks in Breaking Bad 2008', 'Patrick Fabian in Iron Fist'],
    'filemeserien-065-stranger-things': ['Shawn Levy in The Adam Project 2022', 'Shawn Levy in Arrivals 2016', 'Shawn Levy in Don\'t Look Up 2021'],
    'filmeserien-066-stranger-eleven': ['Winona Ryder in The Plot Against America', 'Winona Ryder in Show Me a Hero', 'Matthew Modine in Full Metal Jacket'],
    'filmeserien-067-game-of-thrones': ['David Benioff in the Sopranos Spin-off', 'D.B. Weiss in The Last of Us', 'Miguel Sapochnik in House of the Dragon'],
    'filmeserien-068-got-red-wedding': ['Alan Taylor in Thor The Dark World 2013', 'Alan Taylor in Terminator Genisys 2015', 'Alan Taylor in Game of Thrones'],
    'filmeserien-069-house-of-the-dragon': ['Ryan Condal in Sopranos Prequel', 'Ryan Condal in Game of Thrones', 'Miguel Sapochnik in The Suicide Squad'],
    'filmeserien-070-the-wire': ['David Simon in Homicide Life on the Street', 'David Simon in The Corner', 'David Simon in Treme'],
    'filmeserien-071-sopranos': ['David Chase in The Sopranos 1999', 'David Chase in Gandolfini Production', 'Tony Blundetto in Sopranos'],
    'filmeserien-072-mad-men': ['Matthew Weiner in Mad Men 2007', 'Matthew Weiner in The Sopranos', 'Matthew Weiner in Halt and Catch Fire'],
    'filemeserien-073-friends': ['Kevin S. Bright in Friends 1994', 'Kevin S. Bright in Veronica Mars', 'Kevin S. Bright in Parks and Recreation'],
    'filemeserien-074-the-office': ['Greg Daniels in The Office 2005', 'Greg Daniels in Parks and Rec', 'Greg Daniels in Upload'],
    'filemeserien-075-parks-and-rec': ['Michael Schur in Parks and Rec 2009', 'Michael Schur in Good Place', 'Michael Schur in Brooklyn Nine-Nine'],
    'filemeserien-076-brooklyn99': ['Michael Schur in Good Place 2016', 'Michael Schur in Parks and Rec', 'Luke Null in Saturday Night Live'],
    'filemeserien-077-seinfeld': ['Jerry Seinfeld in Comedians in Cars 2012', 'Jerry Seinfeld in The Marriage Ref', 'Julia Louis-Dreyfus in The Veep'],
    'filemeserien-078-simpsons': ['Matt Groening in Futurama 1999', 'Matt Groening in The Simpsons 1989', 'Mike Scully in Disenchantment'],
    'filemeserien-079-south-park': ['Trey Parker in Book Mormon 2011', 'Matt Stone in South Park', 'Trey Parker in The Pandemic Special'],
    'filemeserien-080-family-guy': ['Seth MacFarlane in American Dad 2005', 'Seth MacFarlane in The Cleveland Show', 'Seth MacFarlane in Family Guy'],
    'filemeserien-081-rick-and-morty': ['Justin Roiland in Leisure Time 2018', 'Justin Roiland in Solar Opposites', 'Dan Harmon in Community'],
    'filemeserien-082-bojack': ['Raphael Bob-Waksberg in BoJack 2014', 'Raphael Bob-Waksberg in Undone', 'Will Arnett in 30 Rock'],
    'filemeserien-083-arcane': ['Christian Linke in Arcane 2021', 'Alex Yee in Arcane', 'Christian Linke in Riot Games'],
    'filemeserien-084-witcher': ['Lauren Schmidt Hissrich in The Witcher 2019', 'Lauren Schmidt in Witcher Season 2', 'Andrzej Sapkowski in Witcher Books'],
    'filemeserien-085-hexer-song': ['Joey Batey in Toss a Coin 2019', 'Joey Batey in Jaskier Song', 'Sonya Cassidy in The Witcher'],
    'filemeserien-086-squid-game': ['Hwang Dong-hyuk in Squid Game 2021', 'Lee Jung-jae in Squid Game', 'Park Hae-soo in Squid Game'],
    'filemeserien-087-money-heist': ['Álex de la Iglesia in Money Heist 2017', 'Álex de la Iglesia in La Casa de Papel', 'Javier Fuentes-León in Money Heist'],
    'filemeserien-088-dark': ['Baran bo Odar in Dark 2017', 'Baran bo Odar in 1899', 'Jantje Friese in Dark'],
    'filemeserien-089-dark-satz': ['1899 Premiere 2022', 'Claudia Tiedemann in Dark', 'Charlotte Doppler in Dark'],
    'filemeserien-090-the-crown': ['Peter Morgan in The Crown 2016', 'Peter Morgan in Frost/Nixon', 'Claire Foy in The Crown'],
    'filemeserien-091-queens-gambit': ['Scott Frank in The Queen\'s Gambit 2020', 'Scott Frank in Godless', 'Anya Taylor-Joy in The Witch'],
    'filemeserien-092-peaky-blinders': ['Steven Knight in Peaky Blinders 2013', 'Steven Knight in Locke', 'Cillian Murphy in Peaky Blinders'],
    'filemeserien-093-narcos': ['Joe Pettigrew in Narcos 2015', 'Joe Pettigrew in Narcos Mexico', 'Wagner Moura in Narcos'],
    'filemeserien-094-narcos-mexico': ['Eric Newman in Narcos Mexico 2018', 'Eric Newman in Narcos', 'Scoot McNairy in Narcos Mexico'],
    'filemeserien-095-ozark': ['Bill Dubuque in Ozark 2017', 'Bill Dubuque in Ozark Season 2', 'Jason Bateman in Ozark'],
    'filemeserien-096-the-boys': ['Eric Kripke in The Boys 2019', 'Eric Kripke in Supernatural', 'Antony Starr in The Boys'],
    'filemeserien-097-invincible': ['Robert Kirkman in Invincible 2021', 'Robert Kirkman in The Walking Dead', 'Steven Yeun in Invincible'],
}

# For OUTLINE cards - geographically similar countries
outline_distractors = {
    # Note: These will need to be populated with actual outline cards
    # Strategy: Use countries with similar shapes, in same regions
}

# For NATUR/TECHNIK cards - common misconceptions and related concepts  
natur_distractors = {
    'naturtechnik-easy-001': ['Kohlenstoffdioxid - was Pflanzen brauchen', 'Stickstoff - Hauptbestandteil der Luft', 'Wasserstoff - Bestandteil von Wasser'],
    'naturtechnik-easy-002': ['Hämoglobin - in roten Blutkörperchen', 'Melanin - Pigment in Haut', 'Keratin - Protein in Haaren'],
    'naturtechnik-easy-003': ['Venus - der heißeste Planet', 'Merkur - der nächste zur Sonne', 'Jupiter - der größte Planet'],
    'naturtechnik-easy-004': ['Es wird zu Dampf', 'Es wird weniger dicht und schwimmt', 'Es wird kristallin und weiß'],
    'naturtechnik-easy-005': ['Barometer - misst Luftdruck', 'Anemometer - misst Windgeschwindigkeit', 'Hygrometer - misst Luftfeuchtigkeit'],
    'naturtechnik-easy-006': ['Der Elefant - das größte Landtier', 'Der Pottwal - das größte Säugetier der Meere', 'Der Wal - existiert in vielen Arten'],
    'naturtechnik-easy-007': ['Proteinen und Fetten - auch Bestandteile von Holz', 'Glukose - gelagerte Energie in Pflanzen', 'Stärke - auch ein Bestandteil von Pflanzen'],
    'naturtechnik-easy-008': ['Magnetische Kraft - zieht Metalle an', 'Zentrifugalkraft - wirkt nach außen', 'Reibung - widersetzt sich Bewegung'],
    'naturtechnik-easy-009': ['Die Lunge - für Atmung zuständig', 'Die Leber - größtes inneres Organ', 'Das Gehirn - kontrolliert den Körper'],
    'naturtechnik-easy-010': ['Widerstand - bremst Strom', 'Kondensator - speichert Strom', 'Transistor - verstärkt oder schaltet Signale'],
    'naturtechnik-easy-011': ['Gummi - isoliert gut', 'Holz - ist ein Isolator', 'Plastik - ist ein Isolator'],
    'naturtechnik-easy-012': ['Mitose - Zellteilung', 'Osmose - Wasserbewegung', 'Fotosynthese - Energieumwandlung'],
    'naturtechnik-easy-013': ['Der Mond - gibt Licht in der Nacht', 'Die Erde selbst - durch Kernfusion', 'Fossile Brennstoffe - speichern Sonnenenergie'],
    'naturtechnik-easy-014': ['Flüssig - wie Wasser', 'Fest - wie Eis', 'Plasma - 4. Aggregatzustand'],
    'naturtechnik-easy-015': ['Acht - Spinnentiere haben 8', 'Vier - Säugetiere haben 4', 'Zehn - Krebstiere oft 10'],
    'naturtechnik-easy-016': ['Der Koalabär - trägt Babies im Beutel', 'Das Opossum - Marsupial Säugetier', 'Der Wombat - auch mit Beutel'],
    'naturtechnik-easy-017': ['Solarpanel - nutzt Sonnenenergie', 'Wasserturbine - nutzt Wasserkraft', 'Geothermiekraftwerk - nutzt Erdwärme'],
    'naturtechnik-easy-018': ['Die Sonne - umkreist die Erde nicht', 'Der Mars - ist ein Planet', 'Der Asteroid Ceres - ist ein Zwergplanet'],
    'naturtechnik-easy-019': ['Hinzufügen von Kälte zur Lebensmittelkonservierung', 'Abtöten von Bakterien durch Strahlung', 'Entfernung von Feuchtigkeit aus Lebensmitteln'],
    'naturtechnik-easy-020': ['Glas - auch künstlich gemacht', 'Papier - kommt aus Natur', 'Metall - ist natürlich'],
}

# For TRIVIA_EXTRA cards - related concepts, different context
trivia_distractors = {
    # Will be populated based on actual trivia cards
}

# ============================================================================
# IMPLEMENTATION
# ============================================================================

def remove_existing_distractors(content, category_prefix=''):
    """Remove all existing distractor fields from cards"""
    # Remove distractors arrays: , distractors: [...]
    pattern = r',\s*distractors:\s*\[[^\]]*\]'
    return re.sub(pattern, '', content)

def add_distractor_to_card(content, card_id, distractors, category=''):
    """Add distractors to a specific card by ID"""
    # Find the card by ID and add distractors after sources
    # Pattern: find the card, find its closing brace for sources, insert distractors
    
    distractors_str = ', '.join([f"'{d}'" for d in distractors])
    pattern = f"(id: '{re.escape(card_id)}'.*?sources: {{[^}}]*}})"
    replacement = f"\\1,\\n    distractors: [{distractors_str}]"
    
    return re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)

print("""
🎯 COMPREHENSIVE DISTRACTOR GENERATION SYSTEM
═══════════════════════════════════════════════════════════════

This script will regenerate ALL distractors for:
  ✓ IMAGE cards (historical events)
  ✓ FILM/SERIEN cards (related movies/shows)
  ✓ OUTLINE cards (geographic distractors)
  ✓ NATUR/TECHNIK cards (scientific alternatives)
  ✓ TRIVIA cards (domain-related concepts)

EXCLUDED (keep existing):
  ✗ MUSIC (playlistCards)
  ✗ COUNTRY (flagCards)
  ✗ SCHAETZFRAGEN (estimationCards)

STRATEGY for non-obvious distractors:
  • IMAGE: Other historical moments from similar era/theme
  • FILM: Related directors, genres, decades - NOT same franchise
  • OUTLINE: Morphologically/geographically similar countries
  • NATUR: Plausible scientific misconceptions
  • TRIVIA: Related concepts from same domain

STATUS: READY TO IMPLEMENT
═══════════════════════════════════════════════════════════════
""")

print("Film distractors prepared:", len(film_distractors), "cards")
print("Image distractors prepared:", len(image_distractors), "cards")
print("Natur/Technik distractors prepared:", len(natur_distractors), "cards")
print("\nNext steps:")
print("1. Read each category file")
print("2. Remove all existing distractors")
print("3. Add new curated distractors")
print("4. Verify build and type checking")
