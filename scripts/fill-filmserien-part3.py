#!/usr/bin/env python3
"""Fill in distractors for remaining filmSerienCards 098-200"""
import re

distractors = {
    'filmeserien-098-cowboy-bebop-live': ['Keanu Reeves.', 'John Cho.', 'Mustafa Shakir.'],
    'filmeserien-099-firefly': ['Nathan Fillion.', 'Alan Tudyk.', 'Summer Glau.'],
    'filmeserien-100-serenity': ['Joss Whedon.', 'Tamyln Tomita.', 'Adam Baldwin.'],
    'filmeserien-101-glow': ['Ruth Wilder.', 'Debbie Eagan.', 'Bash Howard.'],
    'filmeserien-102-chilling-adventures': ['Sabrina Spellman.', 'Kiernan Shipka.', 'Ross Lynch.'],
    'filmeserien-103-sabrina': ['Melissa Joan Hart.', 'Caroline Rhea.', 'Beth Broderick.'],
    'filmeserien-104-buffy': ['Buffy Summers.', 'Willow Rosenberg.', 'Xander Harris.'],
    'filmeserien-105-angel': ['Angel / Angelus.', 'Cordelia Chase.', 'Wesley Wyndam-Pryce.'],
    'filmeserien-106-the-vampire-diaries': ['Elena Gilbert.', 'Stefan Salvatore.', 'Damon Salvatore.'],
    'filmeserien-107-the-originals': ['Klaus Mikaelson.', 'Rebekah Mikaelson.', 'Elijah Mikaelson.'],
    'filmeserien-108-legacies': ['Hope Mikaelson.', 'Jen-Tate.', 'Lizzie Saltzman.'],
    'filmeserien-109-supernatural': ['Sam Winchester.', 'Dean Winchester.', 'Castiel.'],
    'filmeserien-110-the-x-files': ['Mulder.', 'Scully.', 'Cigarette Smoking Man.'],
    'filmeserien-111-twin-peaks': ['Agent Dale Cooper.', 'Laura Palmer.', 'BOB.'],
    'filmeserien-112-lost': ['Jack Shephard.', 'Kate Austen.', 'Sawyer.'],
    'filmeserien-113-fringe': ['Olivia Dunham.', 'Peter Bishop.', 'Walter Bishop.'],
    'filmeserien-114-manifest': ['Michaela Stone.', 'Cal Stone.', 'Ben Stone.'],
    'filmeserien-115-la-brea': ['Josh Harris.', 'Josie Harris.', 'Liam Harris.'],
    'filmeserien-116-yellowjackets': ['Shauna Sadecki.', 'Taissa Turner.', 'Misty Quigley.'],
    'filmeserien-117-the-last-of-us': ['Joel Miller.', 'Ellie.', 'Pedro Pascal.'],
    'filmeserien-118-hbo-chernobyl': ['Valery Legasov.', 'Nikolai Fomin.', 'Anatoly Dyatlov.'],
    'filmeserien-119-chernobyl-abyss': ['Alexei Ananenko.', 'Valeri Bezpalov.', 'Artem Ignatenko.'],
    'filmeserien-120-the-crown-season1': ['Claire Foy.', 'Matt Smith.', 'Anthony Head.'],
    'filmeserien-121-the-crown-diana': ['Emma Corrin.', 'Josh O\'Connor.', 'Gillian Anderson.'],
    'filmeserien-122-the-crown-final': ['Imelda Staunton.', 'Dominic West.', 'Jonathan Pryce.'],
    'filmeserien-123-versailles': ['George Blagden.', 'Tygh Runyan.', 'Noémie Schmidt.'],
    'filmeserien-124-reign': ['Adelaide Kane.', 'Torrance Coombs.', 'Megan Follows.'],
    'filmeserien-125-the-tudors': ['Henry VIII.', 'Jonathan Rhys Meyers.', 'Sam Neill.'],
    'filmeserien-126-the-spanish-princess': ['Charlotte Hope.', 'Rupert Everett.', 'Kara Flowers.'],
    'filmeserien-127-victoria': ['Victoria.', 'Jenna Coleman.', 'Prince Albert.'],
    'filmeserien-128-bridgerton': ['Daphne Bridgerton.', 'Simon Basset.', 'Regé-Jean Page.'],
    'filmeserien-129-feud-hathorne-crawford': ['Bette Davis.', 'Joan Crawford.', 'Susan Sarandon.'],
    'filmeserien-130-feud-capote-swans': ['Truman Capote.', 'Naomi Watts.', 'Tom Hollander.'],
    'filmeserien-131-hollywood': ['Jack Castello.', 'Darren Criss.', 'Ryan Murphy.'],
    'filmeserien-132-ratched': ['Mildred Ratched.', 'Sarah Paulson.', 'Sharon Stone.'],
    'filmeserien-133-american-horror-story': ['Murder House.', 'Coven.', 'Asylum.'],
    'filmeserien-134-american-story-freak-show': ['Sister Mary Eunice.', 'Pepper.', 'Sister Stu.'],
    'filmeserien-135-gwyneth': ['Emma.', 'Gwyneth Paltrow.', 'Shakespeare in Love.'],
    'filmeserien-136-hacks': ['Deborah Vance.', 'Jean Smart.', 'Hannah Einbinder.'],
    'filmeserien-137-schitts-creek': ['David Rose.', 'Moira Rose.', 'Alexis Rose.'],
    'filmeserien-138-community': ['Jeff Winger.', 'Abed Nadir.', 'Troy Barnes.'],
    'filmeserien-139-30-rock': ['Liz Lemon.', 'Jack Donaghy.', 'Tracy Jordan.'],
    'filmeserien-140-unbreakable': ['M. Night Shyamalan.', 'Bruce Willis.', 'Samuel L. Jackson.'],
    'filmeserien-141-split': ['Kevin Crumb.', 'James McAvoy.', 'Anya Taylor-Joy.'],
    'filmeserien-142-glass': ['Elijah Price.', 'David Dunn.', 'Kevin Crumb.'],
    'filmeserien-143-shyamalan-twist': ['Old.', 'Visit.', 'Trapped.'],
    'filmeserien-144-scream-1996': ['Sidney Prescott.', 'Ghostface.', 'Neve Campbell.'],
    'filmeserien-145-scream-2': ['Cotton Weary.', 'Sarah Michelle Gellar.', 'Mickey Altieri.'],
    'filmeserien-146-scream-3': ['Gale Weathers.', 'Dewey Riley.', 'Patrick Dempsey.'],
    'filmeserien-147-scream-4': ['Gale Weathers.', 'Dewey Riley.', 'Sidney Prescott.'],
    'filmeserien-148-scream-2022': ['Sam Carpenter.', 'Tara Carpenter.', 'Jack Quaid.'],
    'filmeserien-149-scream-2023': ['Ghostface.', 'Gale.', 'Sidney.'],
    'filmeserien-150-horror-samurai': ['High Tension.', 'Martyrs.', 'À l\'intérieur.'],
    'filmeserien-151-it-chapter1': ['Bill Denbrough.', 'Georgie Denbrough.', 'Beverly Marsh.'],
    'filmeserien-152-it-chapter2': ['Pennywise.', 'It.', 'The Entity.'],
    'filmeserien-153-the-shining': ['Jack Torrance.', 'Danny Torrance.', 'Wendy Torrance.'],
    'filmeserien-154-poltergeist': ['Carol Anne Freeling.', 'Diane Freeling.', 'Steve Freeling.'],
    'filmeserien-155-insidious': ['Josh Lambert.', 'Renai Lambert.', 'Elise Rainier.'],
    'filmeserien-156-sinister': ['Ellison Oswalt.', 'Bughuul.', 'Mr. Boogie.'],
    'filmeserien-157-conjuring': ['Lorraine Warren.', 'Ed Warren.', 'Vera Farmiga.'],
    'filmeserien-158-annabelle': ['Annabelle Doll.', 'Jaramillo.', 'Demon.'],
    'filmeserien-159-the-ring': ['Samara Morgan.', 'Sadako Yamamura.', 'Kayako.'],
    'filmeserien-160-ju-on': ['The Grudge.', 'The Ring.', 'Dark Water.'],
    'filmeserien-161-ringu': ['Ringu.', 'Rasen.', 'The Ring Virus.'],
    'filmeserien-162-dark-water': ['Yoshimi Matsubara.', 'Ikuko Matsubara.', 'Mitsuko Kawana.'],
    'filmeserien-163-veronica': ['Veronica Urtasun.', 'Álex de la Iglesia.', 'Sandra Escacena.'],
    'filmeserien-164-others': ['Grace Stewart.', 'Anne Cattet.', 'Christopher Eccleston.'],
    'filmeserien-165-hereditary': ['Annie Graham.', 'Toni Collette.', 'Ari Aster.'],
    'filmeserien-166-midsommar': ['Dani Ardor.', 'Christian Hughes.', 'Florence Pugh.'],
    'filmeserien-167-hereditary-occult': ['Ritual.', 'Curse.', 'Supernatural.'],
    'filmeserien-168-lighthouse': ['Thomas Wake.', 'Ephraim Winslow.', 'Robert Pattinson.'],
    'filmeserien-169-the-witch': ['Thomasin.', 'Eggers.', 'Anya Taylor-Joy.'],
    'filmeserien-170-vvitch': ['The Devil.', 'Black Phillip.', 'Satan.'],
    'filmeserien-171-puppet-master': ['Toulon.', 'André Toulon.', 'Guy Rolfe.'],
    'filmeserien-172-child-play': ['Chucky.', 'Charles Lee Ray.', 'Brad Dourif.'],
    'filmeserien-173-dolls': ['Doll.', 'Puppet.', 'Doll House.'],
    'filmeserien-174-evil-dead': ['Ash Williams.', 'Bruce Campbell.', 'Necronomicon.'],
    'filmeserien-175-army-of-darkness': ['Deadites.', 'S-Mart.', 'Medieval.'],
    'filmeserien-176-el-mariachi': ['El Mariachi.', 'Antonio Banderas.', 'Salma Hayek.'],
    'filmeserien-177-desperado': ['Buscemi.', 'Johnny Depp.', 'Tarantino.'],
    'filmeserien-178-once-upon-in-mexico': ['Sands.', 'Johnny Depp.', 'Willem Dafoe.'],
    'filmeserien-179-robert-rodriguez-style': ['Grindhouse.', 'Planet Terror.', 'Death Proof.'],
    'filmeserien-180-sin-city-2': ['Eva Green.', 'Mickey Rourke.', 'Josh Brolin.'],
    'filmeserien-181-jackie-brown': ['Tarantino.', 'Pam Grier.', 'Robert Forster.'],
    'filmeserien-182-django-unchained': ['Stephen.', 'Monsieur Candieland.', 'Calvin Candie.'],
    'filmeserien-183-once-upon-hollywood': ['Cliff Booth.', 'Rick Dalton.', 'Brad Pitt.'],
    'filmeserien-184-quentin-style': ['Nonlinear.', 'Violence.', 'Dialogue.'],
    'filmeserien-185-godfather': ['Vito Corleone.', 'Michael Corleone.', 'Marlon Brando.'],
    'filmeserien-186-godfather-2': ['Young Vito.', 'Robert De Niro.', 'Sicily.'],
    'filmeserien-187-godfather-3': ['Sophia Coppola.', 'Andy Garcia.', 'Al Pacino.'],
    'filmeserien-188-scarface': ['Tony Montana.', 'Pacino.', 'Miami.'],
    'filmeserien-189-carlitos-way': ['Carlito Brigante.', 'Sean Penn.', 'Penelope Ann Miller.'],
    'filmeserien-190-training-day': ['Alonzo Harris.', 'Jake Hoyt.', 'Denzel Washington.'],
    'filmeserien-191-american-gangster': ['Frank Lucas.', 'Denzel Washington.', 'Harlem.'],
    'filmeserien-192-city-god': ['City of God.', 'Fernando Meirelles.', 'Rio de Janeiro.'],
    'filmeserien-193-elite-squad': ['Capitão Nascimento.', 'Wagner de Assis.', 'Tropa de Elite.'],
    'filmeserien-194-cidade-de-deus': ['Lil\' Dice.', 'Lil\' Zé.', 'Buscapé.'],
    'filmeserien-195-city-crime': ['Rio.', 'BOPE.', 'Favela.'],
    'filmeserien-196-the-departed': ['Colin Sullivan.', 'Billy Costigan.', 'Matt Damon.'],
    'filmeserien-197-infernal-affairs': ['Chen Wing Yan.', 'Lau Kin Ming.', 'Tony Leung.'],
    'filmeserien-198-hong-kong-noir': ['John Woo.', 'Heroic Bloodshed.', 'Gun Fu.'],
    'filmeserien-199-chungking-express': ['Chow Mo-wan.', 'Cop 663.', 'Tony Leung.'],
    'filmeserien-200-in-the-mood': ['Su Li-zhen.', 'Chow Mo-wan.', '1962 Shanghai.'],
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

print(f"✓ Added distractors to {count}/103 filmSerienCards (098-200)")
