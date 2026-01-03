#!/usr/bin/env python3
"""Add distractors for schwer cards 133-256 in naturTechnikCards.ts"""
import re

distractors_data = {
    # Schwer cards 133-256 - creating plausible distractors
    'naturtechnik-schwer-133': ['Boyle-Mariotte-Gesetz.', 'Gay-Lussac-Gesetz.', 'Daltons Gesetz.'],
    'naturtechnik-schwer-134': ['Thermophile.', 'Alkalophile.', 'Psychrophile.'],
    'naturtechnik-schwer-135': ['Piezolumines zenz.', 'Fluoreszenz.', 'Phosphoreszenz.'],
    'naturtechnik-schwer-136': ['Peristaltik.', 'Kontraktion.', 'Segmentierung.'],
    'naturtechnik-schwer-137': ['Hyperammonämie.', 'Hyperglykämie.', 'Hyperkalämie.'],
    'naturtechnik-schwer-138': ['Radiolysis.', 'Thermolysis.', 'Photolysis.'],
    'naturtechnik-schwer-139': ['Lithiumionen.', 'Kaliumionen.', 'Natriumionen.'],
    'naturtechnik-schwer-140': ['Osmose.', 'Diffusion.', 'Adsorbtion.'],
    'naturtechnik-schwer-141': ['Kettle Lake.', 'Playa.', 'Crater Lake.'],
    'naturtechnik-schwer-142': ['Titration.', 'Extraktion.', 'Destillation.'],
    'naturtechnik-schwer-143': ['Spektroskopie.', 'Chromatografie.', 'Gravimetrie.'],
    'naturtechnik-schwer-144': ['Chemiosmose.', 'Elektronentransport.', 'Photosystem.'],
    'naturtechnik-schwer-145': ['Neurotransmitter.', 'Hormone.', 'Enzyme.'],
    'naturtechnik-schwer-146': ['Glenoid cavity.', 'Acetabulum.', 'Kotylargelenk.'],
    'naturtechnik-schwer-147': ['Apoptosis.', 'Nekrose.', 'Autophage.'],
    'naturtechnik-schwer-148': ['Kapnograf.', 'Spirometer.', 'Gasanalyzer.'],
    'naturtechnik-schwer-149': ['Nucleophile Addition.', 'Elektrophile Addition.', 'Substitution.'],
    'naturtechnik-schwer-150': ['Nitrifikation.', 'Denitrifikation.', 'Fixation.'],
    'naturtechnik-schwer-151': ['Allosterie.', 'Isosterie.', 'Isomerie.'],
    'naturtechnik-schwer-152': ['Isobare.', 'Isotherm.', 'Isentrope.'],
    'naturtechnik-schwer-153': ['Helix-turn-helix.', 'Zinc-finger.', 'Leucine-zipper.'],
    'naturtechnik-schwer-154': ['Stokes-Shift.', 'Raman-Streuung.', 'Rayleigh-Streuung.'],
    'naturtechnik-schwer-155': ['Osmoregulation.', 'Thermoregulation.', 'Säure-Base-Haushalt.'],
    'naturtechnik-schwer-156': ['Allele.', 'Gene.', 'Chromosomen.'],
    'naturtechnik-schwer-157': ['Cytochrom.', 'Chlorophyll.', 'Hämoglobin.'],
    'naturtechnik-schwer-158': ['Solvat.', 'Komplex.', 'Ion.'],
    'naturtechnik-schwer-159': ['Faraday-Konstante.', 'Avogadro-Konstante.', 'Boltzmann-Konstante.'],
    'naturtechnik-schwer-160': ['Covalenzbindung.', 'Ionenbindung.', 'Wasserstoffbindung.'],
    'naturtechnik-schwer-161': ['Telomerase.', 'Ligase.', 'Helicase.'],
    'naturtechnik-schwer-162': ['Lysozym.', 'Protease.', 'Kinase.'],
    'naturtechnik-schwer-163': ['Haplotyp.', 'Genotyp.', 'Phänotyp.'],
    'naturtechnik-schwer-164': ['Osmotischer Druck.', 'Kolloidaler Druck.', 'Hydro statischer Druck.'],
    'naturtechnik-schwer-165': ['Diastereomer.', 'Enantiomer.', 'Konstitutionsisomer.'],
    'naturtechnik-schwer-166': ['Autorenormalisierung.', 'Renormalisierungsgruppe.', 'Regularisierung.'],
    'naturtechnik-schwer-167': ['Leptin.', 'Ghrelin.', 'Insulin.'],
    'naturtechnik-schwer-168': ['Thrombozyt.', 'Leukozyt.', 'Erythrozyt.'],
    'naturtechnik-schwer-169': ['Zellwanderung.', 'Zellproliferation.', 'Zelldifferenzierung.'],
    'naturtechnik-schwer-170': ['Nukleophil.', 'Elektrophil.', 'Radikal.'],
    'naturtechnik-schwer-171': ['Konjugat.', 'Merosystemisch.', 'Benzoidsystem.'],
    'naturtechnik-schwer-172': ['Valenz.', 'Oxidationszahl.', 'Lewisstruktur.'],
    'naturtechnik-schwer-173': ['Syntrophie.', 'Kommensalismus.', 'Parasitismus.'],
    'naturtechnik-schwer-174': ['Methylierung.', 'Acetylierung.', 'Phosphorylierung.'],
    'naturtechnik-schwer-175': ['Ligand-Rezeptor-Bindung.', 'Enzym-Substrat-Komplex.', 'Antigen-Antikörper-Komplex.'],
    'naturtechnik-schwer-176': ['Antikodon.', 'Promoter.', 'Enhancer.'],
    'naturtechnik-schwer-177': ['Chymotrypsin.', 'Pepsin.', 'Trypsin.'],
    'naturtechnik-schwer-178': ['Beta-Oxidation.', 'Glukoneogenese.', 'Ketogenese.'],
    'naturtechnik-schwer-179': ['Hybridorbitale.', 'Molekülorbitale.', 'Atomorbitale.'],
    'naturtechnik-schwer-180': ['Telophase.', 'Anaphase.', 'Metaphase.'],
    'naturtechnik-schwer-181': ['Wasserdampf-Gleichgewicht.', 'Lösegleichgewicht.', 'Säure-Base-Gleichgewicht.'],
    'naturtechnik-schwer-182': ['Interferon.', 'Interleukin.', 'Zytokine.'],
    'naturtechnik-schwer-183': ['Tryptophan.', 'Tyrosin.', 'Phenylalanin.'],
    'naturtechnik-schwer-184': ['Komplement.', 'Antigen.', 'Cytokin.'],
    'naturtechnik-schwer-185': ['Genotoxin.', 'Karcinogen.', 'Mutagen.'],
    'naturtechnik-schwer-186': ['Spaltung.', 'Kondensation.', 'Umlagerung.'],
    'naturtechnik-schwer-187': ['Prokaryoten.', 'Archaebakterien.', 'Protisten.'],
    'naturtechnik-schwer-188': ['Substrate-level Phosphorylation.', 'Oxidative Phosphorylation.', 'Photophosphorylation.'],
    'naturtechnik-schwer-189': ['Pentose-Phosphat-Weg.', 'Citrat-Zyklus.', 'Glykolyse.'],
    'naturtechnik-schwer-190': ['Rezeptor.', 'Transducer.', 'Effektor.'],
    'naturtechnik-schwer-191': ['G-Protein.', 'Kinase.', 'Phosphatase.'],
    'naturtechnik-schwer-192': ['Neuropeptid.', 'Monoamin.', 'Acetylcholin.'],
    'naturtechnik-schwer-193': ['Synaptische Plastizität.', 'Long-Term Potentiation.', 'Long-Term Depression.'],
    'naturtechnik-schwer-194': ['Replikation.', 'Transkription.', 'Translation.'],
    'naturtechnik-schwer-195': ['Telomere.', 'Zentromere.', 'Ursprünge der Replikation.'],
    'naturtechnik-schwer-196': ['Rekombination.', 'Mutation.', 'Migration.'],
    'naturtechnik-schwer-197': ['Selektion.', 'Drift.', 'Bottleneck.'],
    'naturtechnik-schwer-198': ['Hardy-Weinberg.', 'Evo-Devo.', 'Phylogenie.'],
    'naturtechnik-schwer-199': ['Cladogenese.', 'Anagenese.', 'Orthoselection.'],
    'naturtechnik-schwer-200': ['Adaptive Radiation.', 'Allopatric Speciation.', 'Sympatric Speciation.'],
    'naturtechnik-schwer-201': ['Biom.', 'Ökosystem.', 'Population.'],
    'naturtechnik-schwer-202': ['Primärproduktion.', 'Sekundärproduktion.', 'Tertärproduktion.'],
    'naturtechnik-schwer-203': ['Bioakkumulation.', 'Biomagnifikation.', 'Biodegradation.'],
    'naturtechnik-schwer-204': ['Nitrogenase.', 'Nitrifikase.', 'Denitrifikase.'],
    'naturtechnik-schwer-205': ['Chemolithotrophie.', 'Photoautotrophie.', 'Heterotrophie.'],
    'naturtechnik-schwer-206': ['Methanogenese.', 'Acetogenese.', 'Sulfidogenese.'],
    'naturtechnik-schwer-207': ['Kompartimentalisierung.', 'Organellenbindung.', 'Membranassoziierung.'],
    'naturtechnik-schwer-208': ['Homologie.', 'Analogie.', 'Konvergenz.'],
    'naturtechnik-schwer-209': ['Vestigiale.', 'Atavismen.', 'Rudimente.'],
    'naturtechnik-schwer-210': ['Morphogenese.', 'Organogenese.', 'Embryogenese.'],
    'naturtechnik-schwer-211': ['Gradient.', 'Induktion.', 'Differenzierung.'],
    'naturtechnik-schwer-212': ['Homöobox.', 'Hox-Gene.', 'Segmentierungsgene.'],
    'naturtechnik-schwer-213': ['Apikale Kontur.', 'Apikal-basal.', 'Dorso-ventral.'],
    'naturtechnik-schwer-214': ['Zellkern.', 'Mitochondrien.', 'Ribosomen.'],
    'naturtechnik-schwer-215': ['Rauhe ER.', 'Glatte ER.', 'Golgi-Apparat.'],
    'naturtechnik-schwer-216': ['Vesikel.', 'Vakuole.', 'Lysosom.'],
    'naturtechnik-schwer-217': ['Peroxisom.', 'Glyoxisom.', 'Sphärosom.'],
    'naturtechnik-schwer-218': ['Adhäsion.', 'Koheräenz.', 'Osmose.'],
    'naturtechnik-schwer-219': ['Turgor.', 'Plasmolysie.', 'Deplasmolyse.'],
    'naturtechnik-schwer-220': ['Xerophyt.', 'Hygrophyt.', 'Mesophyt.'],
    'naturtechnik-schwer-221': ['CAM-Pflanzen.', 'C3-Pflanzen.', 'C4-Pflanzen.'],
    'naturtechnik-schwer-222': ['Endotrophie.', 'Ektotrophie.', 'Ektendomykorrhiza.'],
    'naturtechnik-schwer-223': ['Phytochrom.', 'Phototropin.', 'Cryptochrom.'],
    'naturtechnik-schwer-224': ['Vernalisation.', 'Photoperiodismus.', 'Dormanz.'],
    'naturtechnik-schwer-225': ['Photoautotroph.', 'Chemotroph.', 'Heterotroph.'],
    'naturtechnik-schwer-226': ['Kosmonautik.', 'Astrodynamik.', 'Orbitalmechanik.'],
    'naturtechnik-schwer-227': ['Ellipse.', 'Parabel.', 'Hyperbel.'],
    'naturtechnik-schwer-228': ['Aphelion.', 'Perihel.', 'Apoapsie.'],
    'naturtechnik-schwer-229': ['Gravitationsbindung.', 'Roche-Grenze.', 'Lagrange-Punkte.'],
    'naturtechnik-schwer-230': ['Schwarzes Loch.', 'Neutronenstern.', 'Weißer Zwerg.'],
    'naturtechnik-schwer-231': ['Chandrasekhar-Grenze.', 'Tolman-Oppenheimer-Volkoff-Grenze.', 'Planck-Masse.'],
    'naturtechnik-schwer-232': ['Hubble-Konstante.', 'Kosmologische Konstante.', 'Skalenfaktor.'],
    'naturtechnik-schwer-233': ['Redshift.', 'Blueshift.', 'Doppler-Effekt.'],
    'naturtechnik-schwer-234': ['Inflaton.', 'Quintessenz.', 'Axion.'],
    'naturtechnik-schwer-235': ['Big Bang.', 'Big Crunch.', 'Big Rip.'],
    'naturtechnik-schwer-236': ['Planck-Zeit.', 'Planck-Länge.', 'Planck-Temperatur.'],
    'naturtechnik-schwer-237': ['Quantenverschränkung.', 'Tunneleffekt.', 'Superposition.'],
    'naturtechnik-schwer-238': ['Schrödinger-Gleichung.', 'Heisenberg-Unsicherheit.', 'Pauli-Ausschließungsprinzip.'],
    'naturtechnik-schwer-239': ['Fermion.', 'Boson.', 'Hadron.'],
    'naturtechnik-schwer-240': ['Quark.', 'Lepton.', 'Gluon.'],
    'naturtechnik-schwer-241': ['Standardmodell.', 'Supersymmetrie.', 'Stringtheorie.'],
    'naturtechnik-schwer-242': ['Elektronen-Volt.', 'Joule.', 'Kalorie.'],
    'naturtechnik-schwer-243': ['Bosonen.', 'Fermionen.', 'Skalare.'],
    'naturtechnik-schwer-244': ['Feldquantisierung.', 'Renormalisierung.', 'Regularisierung.'],
    'naturtechnik-schwer-245': ['Vakuum-Erwartungswert.', 'Ordnungsparameter.', 'Symmetriebrechung.'],
    'naturtechnik-schwer-246': ['Anomale Magnetmoment.', 'g-Faktor.', 'Kernmagnetisches Moment.'],
    'naturtechnik-schwer-247': ['Myonen.', 'Tauonen.', 'Neutrinos.'],
    'naturtechnik-schwer-248': ['Elektronenkonfiguration.', 'Orbital-Diagramme.', 'Valenzelektronen.'],
    'naturtechnik-schwer-249': ['Konjugierte Diene.', 'Cumulated Diene.', 'Isolierte Diene.'],
    'naturtechnik-schwer-250': ['Elektrizität.', 'Magnetismus.', 'Elektromagnetismus.'],
    'naturtechnik-schwer-251': ['Faraday-Rotation.', 'Zeeman-Effekt.', 'Stark-Effekt.'],
    'naturtechnik-schwer-252': ['Bose-Einstein-Kondensate.', 'Fermi-Flüssigkeit.', 'Quark-Gluon-Plasma.'],
    'naturtechnik-schwer-253': ['Suprafluidität.', 'Supraleitung.', 'Magnetoresistanz.'],
    'naturtechnik-schwer-254': ['Graphen.', 'Kohlenstoff-Nanoröhren.', 'Buckyball.'],
    'naturtechnik-schwer-255': ['Metamaterial.', 'Photonisches Kristall.', 'Metamagnetische.'],
    'naturtechnik-schwer-256': ['Quantencomputer.', 'Klassischer Computer.', 'Analogcomputer.'],
}

filepath = 'lib/naturTechnikCards.ts'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

# For each card, add distractors
for card_id, distractors in distractors_data.items():
    # Find the line with this card ID and replace it
    distractors_json = ', '.join([f"'{d}'" for d in distractors])
    
    # Create regex to find and replace
    pattern = f"(id: '{card_id}'[^}}]*?)sources: {{}}"
    replacement = f"\\1sources: {{}}, distractors: [{distractors_json}]"
    
    if re.search(pattern, content, flags=re.DOTALL):
        content = re.sub(pattern, replacement, content, flags=re.DOTALL)
        print(f"Updated {card_id}")
    else:
        print(f"NOT FOUND: {card_id}")

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\n✓ Added distractors for cards 133-256")
