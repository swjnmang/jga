#!/usr/bin/env python3
"""Fill in distractors for remaining filmSerienCards 022-097"""
import re

distractors = {
    'filmeserien-022-dc-dark-knight': ['Joaquin Phoenix.', 'Jack Nicholson.', 'Jared Leto.'],
    'filmeserien-023-dc-dark-knight-rises': ['The Riddler.', 'Scarecrow.', 'Two-Face.'],
    'filmeserien-024-dc-joker': ['Martin Scorsese.', 'Todd Phillips.', 'Christopher Nolan.'],
    'filmeserien-025-dune-2021': ['Dune Part Two.', 'Dune Part Three.', 'Dune Finale.'],
    'filmeserien-026-dune-spice': ['Arrakis.', 'Caladan.', 'Giedi Prime.'],
    'filmeserien-027-blade-runner': ['Ridley Scott.', 'Denis Villeneuve.', 'David Fincher.'],
    'filmeserien-028-blade-runner-2049': ['Ford.', 'Deckard.', 'Sapper.'],
    'filmeserien-029-inception': ['Hans Zimmer.', 'Ludvig Göransson.', 'John Williams.'],
    'filmeserien-030-interstellar': ['Endurance.', 'Ranger.', 'Lander.'],
    'filmeserien-031-tenet': ['Turnstile.', 'Protagonist.', 'Neil.'],
    'filmeserien-032-memento': ['Following.', 'Insomnia.', 'The Prestige.'],
    'filmeserien-033-oppenheimer': ['Enrico Fermi.', 'Albert Einstein.', 'General Groves.'],
    'filmeserien-034-barbie': ['Margot Robbie.', 'Ryan Gosling.', 'Will Ferrell.'],
    'filmeserien-035-titanic': ['James Cameron.', 'Cameron.', 'James Francis.'],
    'filmeserien-036-avatar': ['James Cameron.', 'Denis Villeneuve.', 'Zoe Saldana.'],
    'filmeserien-037-avatar-2': ['Avatar 3.', 'Avatar: Fire and Ash.', 'Pandora Rising.'],
    'filmeserien-038-jaws': ['Jaws 2.', 'Jaws 3.', 'Jaws: The Revenge.'],
    'filmeserien-039-e-t': ['Henry Thomas.', 'Elliott.', 'Drew Barrymore.'],
    'filmeserien-040-jurassic-park': ['Velociraptor.', 'Stegosaurus.', 'Triceratops.'],
    'filmeserien-041-indiana-jones': ['Harrison Ford.', 'Tom Selleck.', 'Pierce Brosnan.'],
    'filmeserien-042-indiana-jones-3': ['River Phoenix.', 'Alison Doody.', 'Denholm Elliott.'],
    'filmeserien-043-alien': ['James Cameron.', 'David Fincher.', 'Jean-Pierre Jeunet.'],
    'filmeserien-044-aliens': ['Sigourney Weaver.', 'Bill Paxton.', 'Lance Henriksen.'],
    'filmeserien-045-terminator': ['Kyle Reese.', 'Sarah Connor.', 'The T-800.'],
    'filmeserien-046-terminator-2': ['Sarah Connor.', 'John Connor.', 'The T-1000.'],
    'filmeserien-047-mad-max-fury': ['Tom Hardy.', 'Nicholas Hoult.', 'Hugh Keays-Byrne.'],
    'filmeserien-048-matrix-resurrections': ['Carrie-Anne Moss.', 'Yahya Abdul-Mateen II.', 'Jessica Henwick.'],
    'filmeserien-049-lalaland': ['Justin Hurwitz.', 'John Legend.', 'La Ville Lumière.'],
    'filmeserien-050-whiplash': ['JK Simmons.', 'Miles Teller.', 'Damien Chazelle.'],
    'filmeserien-051-black-swan': ['Darren Aronofsky.', 'Vincent Cassel.', 'Mila Kunis.'],
    'filmeserien-052-parasite': ['Bong Joon-ho.', 'Song Kang-ho.', 'Lee Sun-kyun.'],
    'filmeserien-053-oldboy': ['Park Chan-wook.', 'Choi Min-sik.', 'Kang Hae-il.'],
    'filmeserien-054-spirited-away': ['Hayao Miyazaki.', 'Yuriko Kaida.', 'Kirsten Dunst.'],
    'filmeserien-055-princess-mononoke': ['San.', 'Ashitaka.', 'Princess Mononoke.'],
    'filmeserien-056-your-name': ['Makoto Shinkai.', 'Mitsuha.', 'Taki Tachibana.'],
    'filmeserien-057-demonslayer': ['Tanjiro Kamado.', 'Nezuko.', 'Inosuke Hashibira.'],
    'filmeserien-058-akira': ['Katsuhiro Ōtomo.', 'Kaneda.', 'Tokyo.'],
    'filmeserien-059-ghost-in-shell': ['Rupert Sanders.', 'Scarlett Johansson.', 'Takeshi Kitano.'],
    'filmeserien-060-cowboy-bebop': ['Spike Spiegel.', 'Jet Black.', 'Faye Valentine.'],
    'filmeserien-061-attack-on-titan': ['Isayama Hajime.', 'Mikasa.', 'Arwin Arlelt.'],
    'filmeserien-062-breaking-bad': ['Aaron Paul.', 'Dean Norris.', 'Betsy Brandt.'],
    'filmeserien-063-breaking-bad-saul': ['Vince Gilligan.', 'Bob Odenkirk.', 'Nacho Varga.'],
    'filmeserien-064-better-call-saul-finale': ['Kim Wexler.', 'Howard Hamlin.', 'Chuck McGill.'],
    'filmeserien-065-stranger-things': ['Demogorgon.', 'Upside Down.', 'Hawkins Lab.'],
    'filmeserien-066-stranger-eleven': ['001.', '008.', '010.'],
    'filmeserien-067-game-of-thrones': ['Jon Snow.', 'Cersei Lannister.', 'Tyrion Lannister.'],
    'filmeserien-068-got-red-wedding': ['Joffrey Baratheon.', 'Tywin Lannister.', 'Roose Bolton.'],
    'filmeserien-069-house-of-the-dragon': ['Daemon Targaryen.', 'Viserys Targaryen.', 'Alicent Hightower.'],
    'filmeserien-070-the-wire': ['David Simon.', 'Stringer Bell.', 'Avon Barksdale.'],
    'filmeserien-071-sopranos': ['James Gandolfini.', 'Lorraine Bracco.', 'David Chase.'],
    'filmeserien-072-mad-men': ['Don Draper.', 'Joan Harris.', 'Matthew Weiner.'],
    'filmeserien-073-friends': ['Rachel.', 'Phoebe Buffay.', 'Monica Geller.'],
    'filmeserien-074-the-office': ['Jim Halpert.', 'Dwight Schrute.', 'Pam Beesly.'],
    'filmeserien-075-parks-and-rec': ['Leslie Knope.', 'Ben Wyatt.', 'Ron Swanson.'],
    'filmeserien-076-brooklyn99': ['Rosa Diaz.', 'Captain Holt.', 'Amy Santiago.'],
    'filmeserien-077-seinfeld': ['George Costanza.', 'Elaine Benes.', 'Cosmo Kramer.'],
    'filmeserien-078-simpsons': ['Bart Simpson.', 'Lisa Simpson.', 'Marge Simpson.'],
    'filmeserien-079-south-park': ['Kyle Broflovski.', 'Stan Marsh.', 'Eric Cartman.'],
    'filmeserien-080-family-guy': ['Lois Griffin.', 'Chris Griffin.', 'Meg Griffin.'],
    'filmeserien-081-rick-and-morty': ['Morty Smith.', 'Summer Smith.', 'Jerry Smith.'],
    'filmeserien-082-bojack': ['Todd Chavez.', 'Princess Carolyn.', 'Diane Nguyen.'],
    'filmeserien-083-arcane': ['Vi.', 'Powder / Jinx.', 'Heimerdinger.'],
    'filmeserien-084-witcher': ['Yennefer von Vengerberg.', 'Triss Merigold.', 'Ciri.'],
    'filmeserien-085-hexer-song': ['Geralt von Riva.', 'Yennefer.', 'Dandelion.'],
    'filmeserien-086-squid-game': ['Cho Sang-woo.', 'Kang Sae-byeok.', 'Oh Il-nam.'],
    'filmeserien-087-money-heist': ['Álvaro Morte.', 'Raquél Murillo.', 'Raúl.'],
    'filmeserien-088-dark': ['Jonas Kahnwald.', 'Martha Nielsen.', 'Ulrich Nielsen.'],
    'filmeserien-089-dark-satz': ['Lösen Sie die Zeitparadoxie.', 'Verstehen Sie den Ursprung.', 'Retten Sie die Familie.'],
    'filmeserien-090-the-crown': ['Prince Philip.', 'Charles.', 'Princess Diana.'],
    'filmeserien-091-queens-gambit': ['Anya Taylor-Joy.', 'Bill Moves.', 'Harry Beltik.'],
    'filmeserien-092-peaky-blinders': ['John Shelby.', 'Arthur Shelby.', 'Thomas Shelby.'],
    'filmeserien-093-narcos': ['Tata Escobar.', 'Javier Peña.', 'DEA Agent.'],
    'filmeserien-094-narcos-mexico': ['El Azul.', 'Quintero.', 'Mexican Mafia.'],
    'filmeserien-095-ozark': ['Wendy Byrde.', 'Ruth Langmore.', 'Marty Byrde.'],
    'filmeserien-096-the-boys': ['Hughie Campbell.', 'Starlight.', 'Black Noir.'],
    'filmeserien-097-invincible': ['Debbie Grayson.', 'Sandra Oh.', 'Viltrumite.'],
}

filepath = 'lib/filmSerienCards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

count = 0
for card_id, dists in distractors.items():
    dists_json = ', '.join([f"'{d}'" for d in dists])
    pattern = f"(id: '{card_id}'[^}}]*?)sources: {{}}"
    replacement = f"\\1sources: {{}}, distractors: [{dists_json}]"
    
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        count += 1

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"✓ Added distractors to {count}/76 filmSerienCards (022-097)")
