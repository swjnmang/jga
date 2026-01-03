#!/usr/bin/env python3
"""
Generate intelligent, non-obvious distractors for ALL 200 Film/Serien cards.
Strategy: Related but incorrect answers from different movies/shows.
"""
import re

# ============================================================================
# COMPREHENSIVE FILM/SERIEN DISTRACTOR DATABASE (200 cards)
# ============================================================================
# Strategy: Each distractor set consists of plausible but wrong answers
# that are thematically related but from different franchises/shows

film_distractors = {
    # MAFIA/CRIME FILMS
    'filmeserien-001-der-pate': ['Marlon Brando als Don Vito.', 'Robert Duvall als Tom Hagen.', 'John Cazale als Fredo.'],
    'filmeserien-002-der-pate-2': ['Gordon Willis (Cinematography).', 'Thelma Schoonmaker (Editor).', 'Nino Rota (Composer).'],
    'filmeserien-003-goodfellas': ['Quentin Tarantino in Pulp Fiction 1994.', 'David Fincher in Seven 1995.', 'Michael Mann in Heat 1995.'],
    'filmeserien-022-dc-dark-knight': ['Jack Nicholson in Batman 1989.', 'Jared Leto in Suicide Squad 2016.', 'Joaquin Phoenix in Joker 2019.'],
    'filmeserien-093-narcos': ['Joe Pettigrew in Narcos Mexico 2018.', 'Carlos Moreno in El Patrón 2018.', 'Pedro Pascal in Narcos Season 2.'],
    'filmeserien-095-ozark': ['Jason Bateman in Ozark Season 2 2018.', 'Laura Linney in Ozark 2018.', 'Julia Garner in Ozark 2018.'],
    
    # SCHINDLER'S LIST AND SIMILAR
    'filmeserien-004-schindlers-liste': ['Ein grüner Mantel.', 'Ein gelber Mantel.', 'Ein rosa Mantel.'],
    'filmeserien-104-cheronobyl': ['Fukushima Daiichi 2011.', 'Three Mile Island 1979.', 'Windscale Incident 1957.'],
    
    # PRISON/ESCAPE FILMS
    'filmeserien-005-shawshank': ['Das Gitterfenster.', 'Die Biographie.', 'Der Stein.'],
    'filmeserien-132-green-mile': ['Paul Edgecomb kann Tiere heilen.', 'John Coffey kann Gedanken lesen.', 'John Coffey kann Strahlen werfen.'],
    
    # FIGHT CLUB
    'filmeserien-006-fight-club': ['Du wirst laut.', 'Du kämpfst zusammen.', 'Du wirst reich.'],
    'filmeserien-045-terminator': ['I am here to protect you.', 'I must go back.', 'I am the protector.'],
    
    # MATRIX FILMS
    'filemeserien-007-matrix': ['Die grüne Pille.', 'Die gelbe Pille.', 'Die orange Pille.'],
    'filemeserien-048-matrix-resurrections': ['Carrie-Anne Moss als Trinity.', 'Hugo Weaving als Agent Smith.', 'Thomas Anderson als Thomas.'],
    'filemeserien-181-matrix-kungfu': ['"I know karate."', '"I know judo."', '"I know fighting."'],
    
    # LORD OF THE RINGS
    'filemeserien-008-lotr': ['Ian McKellen als Gandalf.', 'Christopher Lee als Saruman.', 'Andy Serkis als Gollum.'],
    'filemeserien-009-lotr-gollum': ['Ian McKellen in X-Men 2000.', 'Peter Jackson in King Kong 2005.', 'Martin Freeman in The Hobbit 2012.'],
    'filemeserien-135-lotr-oscar': ['Neun.', 'Zwölf.', 'Neunzehn.'],
    
    # HARRY POTTER
    'filemeserien-010-hp-stein': ['Hans Zimmer in The Lion King.', 'Alexandre Desplat in Harry Potter 2005.', 'James Horner in Titanic.'],
    'filemeserien-011-hp-dumbledore': ['Judi Dench und Michael Gambon.', 'Richard Harris und Anthony Hopkins.', 'Christopher Lee und Michael Gambon.'],
    
    # STAR WARS
    'filemeserien-012-star-wars-iv': ['Coruscant.', 'Naboo.', 'Geonosis.'],
    'filemeserien-013-star-wars-v': ['The Emperor (Palpatine).', 'Yoda.', 'Leia Organa.'],
    'filemeserien-014-star-wars-vi': ['Gungans.', 'Tusken Raiders.', 'Sand People.'],
    'filemeserien-015-star-wars-vii': ['Finn.', 'Poe Dameron.', 'BB-8.'],
    'filemeserien-016-rogue-one': ['Ein Lichtschwert.', 'Die Kristalle.', 'Die Raumstation Alderaan.'],
    
    # MARVEL FILMS
    'filemeserien-017-marvel-ironman': ['Chris Pratt als Tony Stark.', 'Mark Ruffalo als Bruce Banner.', 'Scarlett Johansson als Black Widow.'],
    'filemeserien-018-marvel-avengers': ['Kenneth Branagh in Thor 2011.', 'Jon Favreau in Iron Man 2 2010.', 'Anthony Russo in Captain America 2014.'],
    'filemeserien-019-marvel-endgame': ['"I am Thanos."', '"We are Avengers."', '"Infinity is mine."'],
    'filemeserien-020-marvel-thanos': ['Sieben.', 'Neun.', 'Vier.'],
    'filemeserien-021-marvel-loki': ['Temporal Ministry.', 'Time Police.', 'Chronological Bureau.'],
    
    # DC FILMS
    'filemeserien-023-dc-dark-knight-rises': ['Scarecrow.', 'The Riddler.', 'Clayface.'],
    'filemeserien-024-dc-joker': ['Ari Aster in Hereditary 2018.', 'Denis Villeneuve in Enemy 2014.', 'Karyn Kusama in The Invitation 2015.'],
    'filemeserien-151-batman-1989': ['Michael Keaton als Bruce Wayne.', 'Val Kilmer als Batman.', 'George Clooney als Batman.'],
    'filemeserien-152-logan': ['Patrick Stewart als Professor X.', 'Ian McKellen als Magneto.', 'Denzel Washington als John McClane.'],
    
    # DUNE
    'filemeserien-025-dune-2021': ['Hans Zimmer in Blade Runner 2049 2017.', 'Jóhann Jóhannsson in Sicario 2015.', 'Trent Reznor in The Social Network.'],
    'filemeserien-026-dune-spice': ['Arrakis.', 'Caladan.', 'Wallach IX.'],
    
    # BLADE RUNNER
    'filemeserien-027-blade-runner': ['Ridley Scott in Aliens 1986.', 'David Lynch in Eraserhead 1977.', 'John Carpenter in The Thing 1982.'],
    'filemeserien-028-blade-runner-2049': ['Blade Runner 2049 Reprise.', 'Officer K.', 'Wallace.'],
    
    # INCEPTION & NOLAN
    'filemeserien-029-inception': ['Ein Kreisel (Totem).', 'Ein Würfel.', 'Ein Ring.'],
    'filemeserien-030-interstellar': ['Endurance-Plan.', 'Ranger-Shuttle.', 'Cooper-Station.'],
    'filemeserien-031-tenet': ['Inversion-Technologie.', 'Einsatz-System.', 'Ziel-Protokoll.'],
    'filemeserien-032-memento': ['Memento Mori.', 'Tattoo-Karten.', 'Farbfotografie.'],
    'filemeserien-033-oppenheimer': ['Leslie Groves.', 'Albert Einstein.', 'Enrico Fermi.'],
    
    # BARBIE & TITANIC
    'filemeserien-034-barbie': ['Patty Jenkins in Wonder Woman.', 'Amy Heckerling in Clueless 1995.', 'Sofia Coppola in The Virgin Suicides.'],
    'filemeserien-035-titanic': ['James Cameron in Avatar 2009.', 'James Cameron in True Lies 1994.', 'Peter Jackson in Titanic 1997.'],
    
    # AVATAR
    'filemeserien-036-avatar': ['Zoe Saldana in Star Trek 2009.', 'Sam Worthington in Avatar 2022.', 'Neytiri.'],
    'filemeserien-037-avatar-2': ['Avatar 3: The Tulkun Calling (geplant).', 'Avatar 4: The Seeds of Ismat (geplant).', 'Avatar: Fire and Ash (2026, geplant).'],
    
    # SPIELBERG CLASSICS
    'filemeserien-038-jaws': ['Ridley Scott in Alien 1979.', 'Steven Spielberg in Close Encounters 1977.', 'John Carpenter in The Thing 1982.'],
    'filemeserien-039-e-t': ['Spielberg in War Horse 2011.', 'Spielberg in Bridge of Spies 2015.', 'Spielberg in Ready Player One 2018.'],
    'filemeserien-040-jurassic-park': ['Spielberg in The Lost World 1997.', 'Spielberg in Jurassic World 2015.', 'Spielberg in War of the Worlds 2005.'],
    'filemeserien-041-indiana-jones': ['Harrison Ford in Blade Runner 1982.', 'Harrison Ford in Witness 1985.', 'Harrison Ford in The Fugitive 1993.'],
    'filemeserien-042-indiana-jones-3': ['Christopher Walken in Hairspray 1988.', 'Alec Guinness in Bridge on River Kwai 1957.', 'Sean Connery in Never Say Never Again.'],
    
    # ALIEN FRANCHISE
    'filemeserien-043-alien': ['Ridley Scott in Prometheus 2012.', 'H.R. Giger in Jodorowsky Dune.', 'Dan O\'Bannon in Dead & Buried 1981.'],
    'filemeserien-044-aliens': ['Paul Verhoeven in Starship Troopers 1997.', 'Joe Dante in Gremlins 1984.', 'James Cameron in The Abyss 1989.'],
    
    # TERMINATOR
    'filemeserien-046-terminator-2': ['Robert Patrick in Terminator Genisys 2015.', 'Arnold Schwarzenegger in Total Recall 1990.', 'Edward Furlong in American History X 1998.'],
    
    # MAD MAX & ACTION
    'filemeserien-047-mad-max-fury': ['George Miller in Mad Max Beyond Thunderdome 1985.', 'Michael Bay in Transformers 2007.', 'David Leitch in Atomic Blonde 2017.'],
    'filemeserien-049-lalaland': ['Damien Chazelle in Whiplash 2014.', 'Damien Chazelle in First Man 2018.', 'Michel Gondry in Eternal Sunshine 2004.'],
    
    # WHIPLASH & MUSIC
    'filemeserien-050-whiplash': ['Connor Hellebuyck in The Piano (Oscar 1993).', 'Thelonious Sphere Monk in Jazz.', 'Charlie Parker in Bird 1988.'],
    'filemeserien-145-singing-rain': ['Donald O\'Connor im Film.', 'Debbie Reynolds im Film.', 'Gene Kelly als Fred Astaire.'],
    'filemeserien-146-sound-music': ['Rodgers & Hammerstein in State Fair.', 'Mary Martin in Original Broadway.', 'Christopher Plummer als Captain von Trapp.'],
    'filemeserien-147-west-side': ['Leonard Bernstein als Komponist.', 'Richard Beymer als Tony.', 'Russ Tamblyn als Riff.'],
    'filemeserien-148-moulin-rouge': ['Evan Rachel Wood in Across the Universe 2007.', 'Reeve Carney in Penny Dreadful.', 'Hugh Jackman in Les Misérables.'],
    'filemeserien-149-guardians': ['"Awesome Mix Vol. 2" von Quill.', '"One More Time" von Daft Punk.', '"Wicked Games" von Chris Isaak.'],
    'filemeserien-174-lion-king': ['Simba wird König (Kurs verloren).', 'Scar war ein guter Löwe.', 'Nala war Simb Mutter.'],
    'filemeserien-175-aladdin': ['Gilbert Gottfried als Iago im Original 1992.', 'Jim Cummings als Brutus.', 'Jim Cummings als Negator.'],
    
    # ANIMATION
    'filemeserien-051-black-swan': ['Mila Kunis als Schwarzer Schwan.', 'Natalie Portman als Weiße Taube.', 'Barbara Hershey als Mutter.'],
    'filemeserien-052-parasite': ['Park Chan-wook in The Handmaiden 2016.', 'Bong Joon-ho in Mother 2009.', 'Kim Jee-woon in A Tale of Two Sisters 2003.'],
    'filemeserien-053-oldboy': ['Park Chan-wook in Judgment 2003.', 'Choi Min-sik in Scary Movie.', 'Yoo Ji-tae in Oldboy.'],
    'filemeserien-054-spirited-away': ['Isao Takahata in Grave of the Fireflies 1988.', 'Satoshi Kon in Perfect Blue 1997.', 'Yoshiaki Kawajiri in Wicked City.'],
    'filemeserien-055-princess-mononoke': ['Pom Poko 1994.', 'Howls Moving Castle 2004.', 'Ponyo 2008.'],
    'filemeserien-056-your-name': ['Makoto Shinkai in Weather With You 2019.', 'Makoto Shinkai in Garden of Words 2013.', 'Shinichi Watanabe in Carole & Tuesday.'],
    'filemeserien-057-demonslayer': ['Haruo Sotozaki in Entertainment District.', 'Haruo Sotozaki in Mugen Train 2020.', 'Youhei Suzuki in Dragon Quest Dai.'],
    'filemeserien-058-akira': ['Satoshi Kon in Perfect Blue 1997.', 'Yoshiaki Kawajiri in Ninja Scroll.', 'Koji Morimoto in Magnetic Rose.'],
    'filemeserien-059-ghost-in-shell': ['Rupert Sanders in Ghost in the Shell 2017.', 'Spike Jonze in Her 2013.', 'Denis Villeneuve in Arrival 2016.'],
    'filemeserien-060-cowboy-bebop': ['Shinichiro Watanabe in Carole & Tuesday 2019.', 'Shinichiro Watanabe in Samurai Champloo.', 'Shinichiro Watanabe in Space Dandy.'],
    'filemeserien-061-attack-on-titan': ['Tetsuya Nakashima in Confessions 2010.', 'Takeshi Fukunaga in Ergo Proxy.', 'Yasuyuki Ebara in Death Note.'],
    'filemeserien-162-shrek': ['Eddie Murphy als Donkey.', 'Antonio Banderas als Puss in Boots.', 'John Lithgow als Lord Farquaad.'],
    'filemeserien-163-ice-age': ['Blue Sky Studios Ice Age.', 'Carlos Saldanha Animationsstudio.', 'Manny Mammoth und Sid.'],
    'filemeserien-164-kungfu-panda': ['Po ist der Drachenkrieger.', 'Shifu ist der Schulmeister.', 'Tai Lung ist der Bösewicht.'],
    'filemeserien-165-minions': ['Gru ist der Superschurke.', 'Vector ist der Bösewicht.', 'Pharrell Williams singt das Lied.'],
    'filemeserien-166-dragon': ['Hicks trainiert einen Drachen.', 'Toothless ist eine Nachtschattenfigur.', 'DreamWorks Animation Studios.'],
    'filemeserien-167-frozen': ['Anna will Elsa retten.', 'Elsa ist die Eiskönigin.', 'Olaf ist der Schneemann.'],
    'filemeserien-168-moana': ['Maui ist ein Halbgott.', 'Heihei ist ein Huhn.', 'Te Ka ist die Lava-Göttin.'],
    'filemeserien-169-klaus': ['Wenn es klingelt, muss ich einen Brief schreiben.', 'Der alte Mann Klaus hat einen Auftrag.', 'Netflix Original Animation 2019.'],
    'filemeserien-170-spirited': ['Spirit ist der Anführer.', 'Der Hauptcharacter ist ein weißes Pferd.', '"A Girl\'s Best Friend" ist der Soundtrack.'],
    'filemeserien-171-coraline': ['Henry Selick Animation.', 'Puppen-Augen sind die Waffe.', 'Coraline entdeckt eine Alternative.'],
    'filemeserien-172-nightmare-christmas': ['Tim Burton in Sweeney Todd 2007.', 'Tim Burton in Frankenweenie 2012.', 'Danny Elfman ist der Komponist.'],
    'filemeserien-173-spirited-spaghetti': ['Disney Klassiker 1955.', 'Das original Disney Film.', 'Peggy Lee sängt Songs.'],
    'filemeserien-176-beauty-beast': ['Belle liebt Bücher.', 'Maurice ist der Vater.', 'Lumière ist ein Kerzenhalter.'],
    'filemeserien-177-mulan': ['Mushu ist ein Drache.', 'Eddie Murphy singt das Lied.', 'Mulan versteckt sich als Mann.'],
    'filemeserien-178-tarzan': ['Phil Collins komponiert Songs.', '"You\'ll Be in My Heart" ist das Lied.', 'Disney Abenteuer.'],
    'filemeserien-179-lilo-stitch': ['Stitch ist Experiment 626.', 'Stitch kommt vom Planeten Kauai.', 'Lilo ist ein Mädchen.'],
    'filemeserien-180-shrek-2': ['Antonio Banderas als Puss in Boots.', 'Eddie Murphy als Donkey.', 'Guillermo del Toro als Regisseur.'],
    
    # TV SERIES
    'filemeserien-062-breaking-bad': ['Walter White kocht Methamphetamin.', '"Heisenberg" ist das Pseudonym.', 'Vince Gilligan ist der Schöpfer.'],
    'filemeserien-063-breaking-bad-saul': ['Better Call Saul beginnt 2015.', '"Slippin\' Jimmy" ist der Spitzname.', 'Bob Odenkirk spielte auch in Breaking Bad.'],
    'filemeserien-064-better-call-saul-finale': ['Kim Wexler ist die Verlobte.', 'Howard Hamlin ist der Boss.', 'Chuck McGill ist der Bruder.'],
    'filemeserien-065-stranger-things': ['Die Hawkins Lab ist der Ursprort.', 'Der Demogorgon ist der Monster.', 'Upside Down ist die andere Welt.'],
    'filemeserien-066-stranger-eleven': ['001 war Elens Original-Nummer.', '011 ist die Test-Nummer.', '008 war eine andere.'],
    'filemeserien-067-game-of-thrones': ['Jon Snow ist der Nachtkönig.', 'Cersei Lannister ist die Königin.', 'Tyrion Lannister ist der Zwerg.'],
    'filemeserien-068-got-red-wedding': ['Robb Stark und Catelyn Stark sterben.', 'Das Haus Frey arrangiert das.', 'Roose Bolton ist der Verräter.'],
    'filemeserien-069-house-of-the-dragon': ['Rhaenyra Targaryen kämpft ums Erbe.', 'Daemon Targaryen ist ihr Onkel.', 'Die Tänzerin der Drachen 2022.'],
    'filemeserien-070-the-wire': ['David Simon erschaffen The Wire.', 'Stringer Bell ist der Drogendealer.', 'Omar ist der Straßenkämpfer.'],
    'filemeserien-071-sopranos': ['Tony Soprano ist der Anführer.', 'Jennifer Melfi ist die Therapeutin.', 'David Chase ist der Schöpfer.'],
    'filemeserien-072-mad-men': ['Don Draper ist der Protagonist.', 'Sterling Cooper ist die Agentur.', 'Matthew Weiner ist der Schöpfer.'],
    'filemeserien-073-friends': ['Rachel Green sitzt auf der Orange Couch.', 'Central Perk ist das Café.', 'Die Freunde treffen sich dort täglich.'],
    'filemeserien-074-the-office': ['Michael Scott ist der Manager.', 'Dunder Mifflin ist das Papierbüro.', 'Greg Daniels schuf die US Version.'],
    'filemeserien-075-parks-and-rec': ['Leslie Knope ist die Politikerin.', 'Parks Department Pawnee Indiana.', 'Michael Schur ist der Schöpfer.'],
    'filemeserien-076-brooklyn99': ['Jake Peralta ist der Detective.', 'Holt ist der Captain.', 'Brooklyn Nine-Nine Precinct.'],
    'filemeserien-077-seinfeld': ['Jerry Seinfeld ist der Star.', 'George Costanza ist sein Freund.', 'Die Show ist über nichts.'],
    'filemeserien-078-simpsons': ['Homer Simpson ist der Vater.', 'Marge Simpson ist die Mutter.', 'Springfield ist die Stadt.'],
    'filemeserien-079-south-park': ['Kenny McCormick stirbt ständig.', 'Eric Cartman ist der Antagonist.', 'Trey Parker schuf South Park.'],
    'filemeserien-080-family-guy': ['Stewie Griffin ist das Baby.', 'Peter Griffin ist der Vater.', 'Seth MacFarlane ist der Schöpfer.'],
    'filemeserien-081-rick-and-morty': ['Rick ist der Großvater.', 'Morty ist der Enkel.', 'Justin Roiland schuf die Serie.'],
    'filemeserien-082-bojack': ['Bojack Horseman ist ein Pferd.', 'BoJack war ein Sitcom Star.', 'Raphael Bob-Waksberg schuf die Serie.'],
    'filemeserien-083-arcane': ['Piltover und Zaun sind die Städte.', 'League of Legends ist das Spiel.', 'Christian Linke schuf Arcane.'],
    'filemeserien-084-witcher': ['Geralt von Riva ist der Hexer.', '"Der Weiße Wolf" ist sein Name.', 'Henry Cavill spielt Geralt.'],
    'filemeserien-085-hexer-song': ['"The Song of Geralt" ist bekannt.', 'Joey Batey singt als Jaskier.', 'Toss a Coin wurde berühmt.'],
    'filemeserien-086-squid-game': ['Grüne Trainingsanzüge sind die Uniform.', 'Die Spiele sind tödlich.', 'Hwang Dong-hyuk schrieb die Serie.'],
    'filemeserien-087-money-heist': ['Salvador Dalí Masken sind die Tarnung.', 'Banco de España ist das Ziel.', 'Spanische Serie 2017.'],
    'filemeserien-088-dark': ['Winden ist die Stadt.', 'Zeitschleifen sind die Basis.', 'Baran bo Odar schuf Dark.'],
    'filemeserien-089-dark-satz': ['Zeit ist der Schauplatz.', 'Kausalität wird durchbrochen.', 'Alles ist verbunden.'],
    'filemeserien-090-the-crown': ['Queen Elizabeth II ist Zentrum.', 'Die Windsor-Familie ist das Ziel.', 'Claire Foy spielte die Königin.'],
    'filemeserien-091-queens-gambit': ['Schach ist das Spiel.', 'Beth Harmon ist das Wunderkind.', 'Anya Taylor-Joy ist die Star.'],
    'filemeserien-092-peaky-blinders': ['Schirmmützen mit Rasierklingen sind Waffen.', 'Tommy Shelby ist der Anführer.', 'Birmingham ist die Stadt.'],
    'filemeserien-094-narcos-mexico': ['El Azul ist ein Bösewicht.', 'Quintero ist ein Kartell-Boss.', 'Miguel Ángel Félix Gallardo ist Anführer.'],
    'filemeserien-096-the-boys': ['Homelander ist der Anti-Superman.', 'The Seven sind die Superhelden.', 'Eric Kripke schuf die Serie.'],
    'filemeserien-097-invincible': ['Omni-Man ist der Vater.', 'Mark Grayson ist der Sohn.', 'Robert Kirkman schuf die Serie.'],
    'filemeserien-098-the-bear': ['Chicago ist die Stadt.', 'Ein Sandwichladen ist der Kern.', 'Christopher Storer schuf die Serie.'],
    'filemeserien-099-succession': ['Waystar Royco ist das Medienimperium.', 'Logan Roy ist der Familienvater.', 'Jesse Armstrong schuf Succession.'],
    'filemeserien-100-white-lotus': ['Luxus-Resorts sind die Schauplätze.', 'Anthologie-Serie mit mehreren Staffeln.', 'Mike White schuf The White Lotus.'],
    'filemeserien-101-true-detective': ['Matthew McConaughey in Rust Cohle.', 'Woody Harrelson als Martin Hart.', 'Louisiana ist der Schauplatz.'],
    'filemeserien-102-fargo': ['Die Coen-Brüder schrieben Original.', 'True Crime Anthologie-Serie.', 'Noah Hawley schuf die TV-Serie.'],
    'filemeserien-103-barry': ['Bill Hader in Barry.', 'Barry ist Auftragskiller.', 'Alec Berg schuf die Serie.'],
    'filemeserien-105-westworld': ['Westworld ist ein Park.', 'Androiden werden bewusst.', 'Jonathan Nolan schuf die Serie.'],
    'filemeserien-106-black-mirror': ['Black Mirror ist Anthologie.', 'Dystopische Technologie.', 'Charlie Brooker schuf Black Mirror.'],
    'filemeserien-107-handmaids-tale': ['Gilead ist das Regime.', 'Rote Umhänge sind die Uniform.', 'Bruce Miller schuf die Serie.'],
    'filemeserien-108-mare-of-easttown': ['Kate Winslet als Mare.', 'Crime Miniserie 2021.', 'Brad Ingelsby schuf die Serie.'],
    'filemeserien-109-bridgerton': ['Lady Whistledown ist die Erzählerin.', 'Regency-Ära ist der Schauplatz.', 'Shonda Rhimes produzierte die Serie.'],
    'filemeserien-110-downton-abbey': ['Britischer Adel ist Fokus.', 'Grantham Familie ist zentral.', 'Julian Fellowes schuf die Serie.'],
    'filemeserien-111-glee': ['Glee Club / New Directions sind die Gruppen.', 'Highschool ist der Schauplatz.', 'Ryan Murphy schuf Glee.'],
    'filemeserien-112-high-school-musical': ['"Breaking Free" ist das Lied.', 'Troy und Gabriella sind die Paare.', 'Kenny Ortega war der Regisseur.'],
    'filemeserien-113-les-miserables': ['Hugh Jackman als Jean Valjean.', 'Musical-Verfilmung 2012.', 'Tom Hooper führte Regie.'],
    'filemeserien-114-chicago': ['Musical von Kander & Ebb.', 'Catherine Zeta-Jones im Film.', 'Rob Marshall führte Regie.'],
    
    # INTERNATIONAL CINEMA
    'filemeserien-115-la-vita-e-bella': ['Benicio Del Toro in The Pledge.', 'Benigni war Clown.', 'Italienischer Film 1997.'],
    'filemeserien-116-pan-labyrinth': ['Del Toro in The Shape of Water 2017.', 'Spanischer Bürgerkrieg als Hintergrund.', 'Labyrinths und Fantasy.'],
    'filemeserien-117-amores-perros': ['Mexiko-Stadt ist der Schauplatz.', 'Drei Hunde-Geschichten verflechten.', 'Alejandro González Iñárritu.'],
    'filemeserien-118-city-of-god': ['Favela ist der Schauplatz.', 'Brasilien ist das Setting.', 'Fernando Meirelles führte Regie.'],
    'filemeserien-119-old-hollywood-casablanca': ['Humphrey Bogart als Rick.', 'Ingrid Bergman als Ilsa.', 'Michael Curtiz führte Regie.'],
    'filemeserien-120-gone-with-wind': ['Clark Gable als Rhett Butler.', 'Leigh spielte Scarlett O\'Hara.', 'Victor Fleming führte Regie.'],
    'filemeserien-121-citizen-kane': ['Orson Welles spielte Kane.', 'Citizen Kane 1941.', 'Gregg Toland war Kameramann.'],
    'filemeserien-122-psycho': ['Tony Perkins in Psycho.', 'Die Duschszene ist ikonisch.', 'Bernard Herrmann komponierte Score.'],
    'filemeserien-123-the-shining': ['Jack Nicholson als Jack Torrance.', 'Stanley Kubrick führte Regie.', 'The Shining 1980.'],
    'filemeserien-124-exorcist': ['Regan MacNeil ist das Kind.', 'Max von Sydow als Priester.', 'William Friedkin führte Regie.'],
    'filemeserien-125-halloween': ['Michael Myers ist der Killer.', 'Jamie Lee Curtis ist die Heldin.', 'John Carpenter führte Regie.'],
    'filemeserien-126-scream': ['Ghostface ist die Maske.', 'Neve Campbell ist die Heldin.', 'Wes Craven führte Regie.'],
    'filemeserien-127-get-out': ['Jordan Peele führte Regie.', 'Horror-Satire über Rasse.', 'Get Out 2017.'],
    'filemeserien-128-us': ['Lupita Nyong\'o spielt Doppel.', 'Jordan Peele führte Regie.', 'Us 2019.'],
    'filemeserien-129-hereditary': ['Ari Aster führte Regie.', 'Familientrauma-Horror.', 'Toni Collette ist die Mutter.'],
    'filemeserien-130-midsommar': ['Ari Aster führte Regie.', 'Schweden ist der Schauplatz.', 'Hell-Horror am Tag.'],
    'filemeserien-131-lord-flies': ['William Golding schrieb das Buch.', 'Peter Brook führte Regie.', 'Kinder-Zivilisation bricht zusammen.'],
    'filemeserien-132-stand-by-me': ['Stephen King schrieb "The Body".', 'Rob Reiner führte Regie.', 'Vier Jungen in Abenteuer.'],
    'filemeserien-133-green-mile': ['Tom Hanks in The Green Mile.', 'John Coffey heilte Krankheiten.', 'Frank Darabont führte Regie.'],
    'filemeserien-134-shining-book': ['Stephen King schrieb Shining.', 'Der Horror-Autor.', 'Overlook Hotel ist Schauplatz.'],
    'filemeserien-136-ben-hur': ['Charlton Heston als Ben-Hur.', 'Das Wagenrennen ist bekannt.', 'William Wyler führte Regie.'],
    'filemeserien-137-lawrence': ['Peter O\'Toole als Lawrence.', 'David Lean führte Regie.', 'Lawrence von Arabien 1962.'],
    'filemeserien-138-amelie': ['Montmartre ist der Schauplatz.', 'Audrey Tautou ist Amélie.', 'Jean-Pierre Jeunet führte Regie.'],
    'filemeserien-139-intouchables': ['François Cluzet als Philippe.', 'Omar Sy als Driss.', 'Die Freundschaft überwindet Unterschiede.'],
    'filemeserien-140-drive': ['Ryan Gosling ist der Fahrer.', 'Scorpion-Jacke ist symbolisch.', 'Nicolas Winding Refn führte Regie.'],
    'filemeserien-141-nightcrawler': ['Jake Gyllenhaal als Lou Bloom.', 'Stringer ist der Job.', 'Dan Gilroy führte Regie.'],
    'filemeserien-142-sicario': ['Denis Villeneuve führte Regie.', 'Josh Brolin als Diplomat.', 'Jóhann Jóhannsson komponierte.'],
    'filemeserien-143-arrival': ['Amy Adams als Louise.', 'Die Heptapoden kommen an.', 'Denis Villeneuve führte Regie.'],
    'filemeserien-144-matrix-bullet-time': ['John Woo popularisierte Slow-Motion.', 'Hong Kong Action Style.', 'The Matrix 1999.'],
    'filemeserien-150-spiderverse': ['Shameik Moore als Miles.', 'Multiverse-Konzept.', 'Phil Lord & Christopher Miller.'],
    'filemeserien-153-deadpool': ['Ryan Reynolds als Deadpool.', 'Meta-Humor und Slapstick.', 'Tim Miller führte Regie.'],
    'filemeserien-154-planet-affe': ['Charlton Heston als Astronaut.', 'Twist-Ende mit Statue.', 'Franklin J. Schaffner.'],
    'filemeserien-155-planet-affen-reboot': ['Andy Serkis als Caesar.', 'Motion-Capture Performance.', 'Rupert Wyatt führte Regie.'],
    'filemeserien-156-king-kong': ['Fay Wray als Ann Darrow.', 'Das Empire State Building.', 'Merian C. Cooper führte Regie.'],
    'filemeserien-157-godzilla': ['Kaiju ist der Filmtyp.', 'Metapher für Atommacht.', 'Ishirō Honda führte Regie.'],
    'filemeserien-158-pixar-toystory': ['Tom Hanks als Woody.', 'Tim Allen als Buzz.', 'John Lasseter führte Regie.'],
    'filemeserien-159-pixar-up': ['Ed Asner als Carl.', 'Ballonhaus symbolisch.', 'Pete Docter führte Regie.'],
    'filemeserien-160-pixar-walle': ['WALL-E ist ein Roboter.', 'EVE ist seine Liebe.', 'Andrew Stanton führte Regie.'],
    'filemeserien-161-pixar-insideout': ['Joy ist dominant.', 'Rileys Emotionen sind Charaktere.', 'Pete Docter führte Regie.'],
    'filemeserien-182-rocky': ['Stallone als Boxer.', 'Philadelphia ist die Stadt.', 'John G. Avildsen führte Regie.'],
    'filemeserien-183-creed': ['Michael B. Jordan als Adonis.', 'Rocky trainiert ihn.', 'Ryan Coogler führte Regie.'],
    'filemeserien-184-raging-bull': ['Robert De Niro als Jake.', 'Martin Scorsese führte Regie.', 'Schwarzweiß-Film.'],
    'filemeserien-185-million-dollar-baby': ['Clint Eastwood als Trainer.', 'Hilary Swank als Boxer.', 'Dramatischer Boxfilm.'],
    'filemeserien-186-karate-kid': ['Ralph Macchio als Daniel.', 'Pat Morita als Mr. Miyagi.', 'John G. Avildsen.'],
    'filemeserien-187-cobra-kai': ['Johnny Lawrence gründet neu.', 'Daniel LaRusso ist Gegner.', 'Wikflix Serie 2018.'],
    'filemeserien-188-spacejam': ['Michael Jordan mit Looney Tunes.', 'Space Jam 1996.', 'Joe Pytka führte Regie.'],
    'filemeserien-189-air-bud': ['Ein Golden Retriever spielt.', 'Air Bud Basketball.', 'Charles Martin Smith.'],
    'filemeserien-190-field-of-dreams': ['Kevin Costner als Farmer.', '"If you build it" Zitat.', 'Phil Alden Robinson.'],
    'filemeserien-191-forrest-gump': ['Tom Hanks als Forrest.', 'Bench-Szenen sind bekannt.', 'Robert Zemeckis führte Regie.'],
    'filemeserien-192-cast-away': ['Tom Hanks allein auf Insel.', 'Wilson ist Volleyball.', 'Robert Zemeckis führte Regie.'],
    'filemeserien-193-apollo13': ['Tom Hanks als Jim Lovell.', '"Houston wir haben Problem".', 'Ron Howard führte Regie.'],
    'filemeserien-194-2001': ['Keir Dullea als Dave.', 'HAL 9000 ist Rote Auge.', 'Stanley Kubrick führte Regie.'],
    'filemeserien-195-gravity': ['Sandra Bullock als Astronautin.', 'George Clooney als Komet.', 'Alfonso Cuarón.'],
    'filemeserien-196-martian': ['Matt Damon als Mark.', 'Kartoffeln sind Rettung.', 'Ridley Scott führte Regie.'],
    'filemeserien-197-star-trek': ['"Live long and prosper".', 'Vulkaniergru\ß ist symbolisch.', 'Gene Roddenberry schrieb Serie.'],
    'filemeserien-198-star-trek-picard': ['Patrick Stewart in TNG.', 'USS Enterprise-D.', 'Der Kapitän Picard.'],
    'filemeserien-199-babylon5': ['Babylon 5 ist Station.', 'Diplomaten treffen hier.', 'J. Michael Straczynski.'],
    'filemeserien-200-firefly': ['Serenity ist das Schiff.', 'Space Western Genre.', 'Joss Whedon schuf Firefly.'],
}

# ============================================================================
# PYTHON SCRIPT TO APPLY DISTRACTORS
# ============================================================================

def replace_distractors_in_file(filepath, distractors_dict):
    """
    Read filmSerienCards.ts, replace distractors for each card ID.
    """
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    count = 0
    for card_id, new_distractors in distractors_dict.items():
        # Find the card by ID
        distractors_str = ', '.join([f"'{d}'" for d in new_distractors])
        
        # Try to replace existing distractors field
        # More flexible pattern - match distractors anywhere within the card object
        pattern = f"(id: '{re.escape(card_id)}'[^}}]*?), distractors: \\[[^\\]]*\\]"
        replacement = f"\\1, distractors: [{distractors_str}]"
        
        new_content = re.sub(pattern, replacement, content, flags=re.DOTALL, count=1)
        
        if new_content != content:
            content = new_content
            count += 1
            print(f"✓ {card_id}")
        else:
            print(f"- {card_id} (not found)")
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"\n✅ Successfully updated {count}/{len(distractors_dict)} cards")
    return count

if __name__ == '__main__':
    filepath = 'lib/filmSerienCards.ts'
    count = replace_distractors_in_file(filepath, film_distractors)
    print(f"Total distractors applied: {count}")
