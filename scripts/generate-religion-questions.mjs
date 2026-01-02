#!/usr/bin/env node
// This script generates the new religion questions in the correct format

const questions = [];
let idCounter = 1;

// Helper function to create question object
function addQuestion(title, cue, answer, difficulty) {
  const id = `religion-${String(idCounter).padStart(3, '0')}`;
  questions.push({
    id,
    title,
    category: 'religionglaube',
    year: 0,
    cue,
    answer,
    difficulty,
    sources: {},
    genres: []
  });
  idCounter++;
}

// EINFACH (85 Fragen)
// Block 1: Christentum & Bibel
addQuestion('Die Bibel', 'Wie heißt das heilige Buch der Christen?', 'Die Bibel.', 'einfach');
addQuestion('Sohn Gottes', 'Wer gilt im Christentum als Sohn Gottes?', 'Jesus Christus.', 'einfach');
addQuestion('Zehn Gebote', 'Wie viele Gebote gab Gott Moses laut dem Alten Testament?', 'Zehn Gebote.', 'einfach');
addQuestion('Weihnachten', 'An welchem Feiertag feiern Christen die Geburt Jesu?', 'Weihnachten.', 'einfach');
addQuestion('Das Kreuz', 'Welches Symbol ist das bekannteste Zeichen des Christentums?', 'Das Kreuz.', 'einfach');
addQuestion('Adam', 'Wer war laut Bibel der erste Mann?', 'Adam.', 'einfach');
addQuestion('Eva', 'Wer war die erste Frau?', 'Eva.', 'einfach');
addQuestion('Garten Eden', 'Wie heißt der Ort, an dem Adam und Eva lebten?', 'Garten Eden (Paradies).', 'einfach');
addQuestion('Schlange', 'Welches Tier verführte Eva dazu, die verbotene Frucht zu essen?', 'Eine Schlange.', 'einfach');
addQuestion('Noah', 'Wer baute laut Bibel eine Arche, um die Tiere vor der Flut zu retten?', 'Noah.', 'einfach');
addQuestion('Der Papst', 'Wie heißt das Oberhaupt der katholischen Kirche?', 'Der Papst.', 'einfach');
addQuestion('Bethlehem', 'In welcher Stadt wurde Jesus laut Überlieferung geboren?', 'Bethlehem.', 'einfach');
addQuestion('Zwölf Jünger', 'Wie viele Jünger (Apostel) hatte Jesus?', 'Zwölf.', 'einfach');
addQuestion('Ostern', 'Was feiern Christen an Ostern?', 'Die Auferstehung Jesu.', 'einfach');
addQuestion('Vaterunser', 'Wie heißt das Gebet, das Jesus seine Jünger lehrte?', 'Vaterunser.', 'einfach');
addQuestion('Taube', 'Welcher Vogel brachte Noah den Olivenzweig?', 'Eine Taube.', 'einfach');
addQuestion('Taufe', 'Welches Sakrament markiert den Eintritt in die christliche Gemeinschaft?', 'Die Taufe.', 'einfach');
addQuestion('Genesis', 'Wie heißt das erste Buch der Bibel?', 'Genesis (1. Buch Mose).', 'einfach');
addQuestion('Franz von Assisi', 'Wer ist der Schutzpatron der Haustiere und der Natur?', 'Franz von Assisi.', 'einfach');
addQuestion('Evangelisten', 'Wie nennt man die vier Evangelisten?', 'Matthäus, Markus, Lukas und Johannes.', 'einfach');
addQuestion('Amen', 'Was bedeutet das Wort „Amen"?', '„So sei es" oder „Gewiss".', 'einfach');
addQuestion('Judas', 'Wer verriet Jesus für dreißig Silberlinge?', 'Judas Iskariot.', 'einfach');
addQuestion('Jordan', 'Wie heißt der Fluss, in dem Jesus getauft wurde?', 'Jordan.', 'einfach');
addQuestion('Pfingsten', 'Welches Fest findet 50 Tage nach Ostern statt?', 'Pfingsten.', 'einfach');
addQuestion('Maria und Josef', 'Wie hießen die Eltern von Jesus?', 'Maria und Josef.', 'einfach');
addQuestion('Neues Testament', 'In welchem Teil der Bibel wird vom Leben Jesu erzählt?', 'Im Neuen Testament.', 'einfach');
addQuestion('Die Hölle', 'Was ist das Gegenteil vom Himmel in religiösen Vorstellungen?', 'Die Hölle.', 'einfach');
addQuestion('Moses', 'Wer erhielt die Zehn Gebote auf dem Berg Sinai?', 'Moses.', 'einfach');

// Block 2: Islam
addQuestion('Der Koran', 'Wie heißt das heilige Buch des Islam?', 'Der Koran.', 'einfach');
addQuestion('Mohammed', 'Wer gilt im Islam als der letzte große Prophet?', 'Mohammed.', 'einfach');
addQuestion('Allah', 'Wie heißt Gott auf Arabisch?', 'Allah.', 'einfach');
addQuestion('Mekka', 'In welche Stadt pilgern Muslime bei der Haddsch?', 'Mekka.', 'einfach');
addQuestion('Ramadan', 'Wie heißt der Fastenmonat der Muslime?', 'Ramadan.', 'einfach');
addQuestion('Moschee', 'Wie heißt das Gotteshaus der Muslime?', 'Moschee.', 'einfach');
addQuestion('Fünfmal', 'Wie oft am Tag sollte ein gläubiger Muslim idealerweise beten?', 'Fünfmal.', 'einfach');
addQuestion('Schweinefleisch', 'Was dürfen Muslime laut Speisevorschriften nicht essen?', 'Schweinefleisch.', 'einfach');
addQuestion('Imam', 'Wie nennt man den Mann, der in der Moschee das Gebet leitet?', 'Imam.', 'einfach');
addQuestion('Freitag', 'Welcher Wochentag ist für Muslime der wichtigste Gebetstag?', 'Freitag.', 'einfach');
addQuestion('Kaaba', 'Wie heißt das würfelförmige Gebäude im Zentrum der Moschee in Mekka?', 'Kaaba.', 'einfach');
addQuestion('Hilal', 'Welches Symbol findet man oft auf Moscheen oder Flaggen islamischer Länder?', 'Hilal (Halbmond und Stern).', 'einfach');

// Block 3: Judentum
addQuestion('Tora', 'Wie heißt das heilige Buch des Judentums (die ersten fünf Bücher Mose)?', 'Tora.', 'einfach');
addQuestion('Sabbat', 'Welcher Wochentag ist der jüdische Ruhetag?', 'Sabbat (Schabbat).', 'einfach');
addQuestion('Kippa', 'Wie heißt die Kopfbedeckung für jüdische Männer?', 'Kippa.', 'einfach');
addQuestion('Synagoge', 'Wie nennt man das jüdische Gotteshaus?', 'Synagoge.', 'einfach');
addQuestion('Menora', 'Wie heißt der siebenarmige Leuchter, ein Symbol des Judentums?', 'Menora.', 'einfach');
addQuestion('Davidstern', 'Welcher Stern ist das Symbol des Judentums und des Staates Israel?', 'Davidstern.', 'einfach');
addQuestion('Rabbiner', 'Wie nennt man jüdische Religionslehrer?', 'Rabbiner.', 'einfach');
addQuestion('Koscher', 'Welchen Begriff nutzt man für jüdische Speisevorschriften (erlaubtes Essen)?', 'Koscher.', 'einfach');

// Block 4: Buddhismus & Hinduismus
addQuestion('Buddha', 'Wer war der „erleuchtete" Begründer des Buddhismus?', 'Siddhartha Gautama (Buddha).', 'einfach');
addQuestion('Indien', 'In welchem Land entstand der Hinduismus?', 'Indien.', 'einfach');
addQuestion('Die Kuh', 'Welches Tier gilt im Hinduismus als heilig?', 'Die Kuh.', 'einfach');
addQuestion('Reinkarnation', 'Wie nennt man die Wiedergeburt der Seele in östlichen Religionen?', 'Reinkarnation.', 'einfach');
addQuestion('Nirvana', 'Welchen Zustand der Erlösung streben Buddhisten an?', 'Nirvana.', 'einfach');
addQuestion('Om', 'Wie heißt das heilige Symbol der Hindus (und ein heiliger Laut)?', 'Om (Aum).', 'einfach');
addQuestion('Ganges', 'An welchen Fluss pilgern Hindus, um sich von Sünden reinzuwaschen?', 'Ganges.', 'einfach');
addQuestion('Karma', 'Wie nennt man das Gesetz von Ursache und Wirkung in indischen Religionen?', 'Karma.', 'einfach');

// Block 5: Vermischtes & Allgemein
addQuestion('Atheisten', 'Wie nennt man Menschen, die nicht an Gott glauben?', 'Atheisten.', 'einfach');
addQuestion('Monotheismus', 'Wie nennt man den Glauben an nur einen Gott?', 'Monotheismus.', 'einfach');
addQuestion('Polytheismus', 'Wie nennt man den Glauben an viele Götter?', 'Polytheismus.', 'einfach');
addQuestion('Ararat', 'Welches Gebirge ist laut Bibel der Landeplatz der Arche Noah?', 'Ararat.', 'einfach');
addQuestion('Engel', 'Was ist ein „Engel"?', 'Ein göttlicher Bote.', 'einfach');
addQuestion('Ritus', 'Wie nennt man eine feierliche Handlung in der Kirche (z. B. Hochzeit)?', 'Ritus oder Sakrament.', 'einfach');
addQuestion('Abraham', 'Wer ist laut Bibel der Urvater des Glaubens für Juden, Christen und Muslime?', 'Abraham.', 'einfach');
addQuestion('Sintflut', 'Was ist die „Sintflut"?', 'Eine riesige, vernichtende Überschwemmung.', 'einfach');
addQuestion('Gleichnisse', 'Wie nennt man die Erzählungen, mit denen Jesus Wahrheiten erklärte?', 'Gleichnisse.', 'einfach');
addQuestion('Hostie', 'Wie heißt das Brot, das beim Abendmahl geteilt wird?', 'Hostie (oder ungesäuertes Brot).', 'einfach');
addQuestion('David', 'Welcher König besiegte laut Bibel den Riesen Goliath mit einer Schleuder?', 'David.', 'einfach');
addQuestion('Golgatha', 'Wie heißt der Berg, auf dem Jesus gekreuzigt wurde?', 'Golgatha.', 'einfach');
addQuestion('Moses teilte Meer', 'Welcher Prophet teilte das Rote Meer?', 'Moses.', 'einfach');
addQuestion('Jerusalem', 'Wie heißt die Stadt, die für alle drei abrahamitischen Religionen heilig ist?', 'Jerusalem.', 'einfach');
addQuestion('Gebet', 'Wie nennt man das „Gespräch mit Gott"?', 'Gebet.', 'einfach');
addQuestion('Simson', 'Wer war der starke Mann, dessen Kraft in seinen Haaren lag?', 'Simson.', 'einfach');
addQuestion('Jannah', 'Wie heißt der Ort der Ruhe nach dem Tod im Islam?', 'Jannah (Paradies).', 'einfach');
addQuestion('Märtyrer', 'Was ist ein „Märtyrer"?', 'Jemand, der für seinen Glauben stirbt.', 'einfach');
addQuestion('Bar Mizwa', 'Welches Fest feiert die jüdische Jugend mit 12 bzw. 13 Jahren?', 'Bar Mizwa / Bat Mizwa.', 'einfach');
addQuestion('Zehn Plagen', 'Wie viele Plagen schickte Gott laut Bibel über Ägypten?', 'Zehn.', 'einfach');
addQuestion('Daniel', 'Wer wurde in die Löwengrube geworfen und blieb unversehrt?', 'Daniel.', 'einfach');
addQuestion('Jesus bedeutet', 'Was bedeutet der Name „Jesus"?', '„Gott rettet" oder „Gott hilft".', 'einfach');
addQuestion('Wallfahrt', 'Wie nennt man eine religiöse Wanderung zu einem heiligen Ort?', 'Wallfahrt oder Pilgerreise.', 'einfach');
addQuestion('Ganesha', 'Wer ist im Hinduismus der Gott mit dem Elefantenkopf?', 'Ganesha.', 'einfach');
addQuestion('Dalai Lama Exil', 'In welchem Land lebt der Dalai Lama im Exil?', 'Indien.', 'einfach');
addQuestion('Minarett', 'Was ist ein Minarett?', 'Der Turm einer Moschee.', 'einfach');
addQuestion('Beichte', 'Wie heißt die christliche Zeremonie, bei der man seine Sünden bekennt?', 'Beichte.', 'einfach');
addQuestion('Größte Religion', 'Welches ist die größte Weltreligion nach Mitgliederzahl?', 'Das Christentum.', 'einfach');
addQuestion('Nonne', 'Was ist eine Nonne?', 'Eine Frau, die in einem Kloster lebt.', 'einfach');

// MITTEL (85 Fragen)
// Block 1: Christentum & Kirchengeschichte
addQuestion('Martin Luther', 'Welcher Mönch löste mit seinen 95 Thesen die Reformation aus?', 'Martin Luther.', 'mittel');
addQuestion('Vulgata', 'Wie heißt der lateinische Name der Bibelübersetzung des Hieronymus?', 'Vulgata.', 'mittel');
addQuestion('Zweites Vatikanum', 'Welches Konzil (1962–1965) modernisierte die katholische Kirche?', 'Zweites Vatikanisches Konzil.', 'mittel');
addQuestion('Sieben Tugenden', 'Wie nennt man die sieben christlichen Tugenden (Gegenspieler der Todsünden)?', 'Glaube, Liebe, Hoffnung, Klugheit, Gerechtigkeit, Tapferkeit, Mäßigung.', 'mittel');
addQuestion('Griechisch', 'In welcher Sprache wurde das Neue Testament ursprünglich verfasst?', 'Griechisch (Koine).', 'mittel');
addQuestion('Konstantin', 'Wer war der erste christliche Kaiser des Römischen Reiches?', 'Konstantin der Große.', 'mittel');
addQuestion('Lourdes', 'Wie heißt der Ort in Frankreich, der für seine Marienerscheinungen bekannt ist?', 'Lourdes.', 'mittel');
addQuestion('Dreifaltigkeit', 'Was versteht man unter der „Dreifaltigkeit" (Trinität)?', 'Gott Vater, Sohn und Heiliger Geist.', 'mittel');
addQuestion('Advent', 'Wie nennt man die Zeit vor Weihnachten, in der man sich auf die Ankunft Jesu vorbereitet?', 'Advent.', 'mittel');
addQuestion('Petrus', 'Welcher Apostel wird oft mit den „Schlüsseln zum Himmelreich" dargestellt?', 'Petrus.', 'mittel');
addQuestion('Offenbarung', 'Wie heißt das letzte Buch der Bibel?', 'Die Offenbarung des Johannes (Apokalypse).', 'mittel');
addQuestion('Jesuiten', 'Welcher Orden wurde von Ignatius von Loyola gegründet?', 'Jesuiten (Societas Jesu).', 'mittel');
addQuestion('Krankensalbung', 'Wie heißt die Salbung der Kranken in der katholischen Kirche heute?', 'Krankensalbung (früher „Letzte Ölung").', 'mittel');
addQuestion('Pfingsttag', 'Was geschah laut Apostelgeschichte am Pfingsttag?', 'Der Heilige Geist kam auf die Jünger herab.', 'mittel');
addQuestion('Anna', 'Wer war die Mutter von Maria (Mutter Jesu) laut christlicher Tradition?', 'Die heilige Anna.', 'mittel');
addQuestion('Exkommunikation', 'Wie nennt man das kirchliche Strafmaß des Ausschlusses aus der Gemeinschaft?', 'Exkommunikation.', 'mittel');
addQuestion('Rosenkranz', 'Welches Gebet wird mit einer Perlenschnur abgezählt?', 'Der Rosenkranz.', 'mittel');
addQuestion('Berg Tabor', 'Wie heißt der Berg, auf dem Jesus verklärt wurde?', 'Berg Tabor.', 'mittel');
addQuestion('Luther Bibel', 'Wer übersetzte die Bibel erstmals vollständig ins Deutsche?', 'Martin Luther (Septembertestament/Vollbibel).', 'mittel');
addQuestion('Pontifikat', 'Wie nennt man die Amtszeit eines Papstes?', 'Pontifikat.', 'mittel');

// Block 2: Islam vertieft
addQuestion('Islam bedeutet', 'Was bedeutet das Wort „Islam" wörtlich?', 'Unterwerfung (unter Gott) oder Hingabe.', 'mittel');
addQuestion('Sunniten Schiiten', 'Wie heißen die beiden Hauptströmungen im Islam?', 'Sunniten und Schiiten.', 'mittel');
addQuestion('Scharia', 'Was ist die „Scharia"?', 'Das religiöse Gesetz des Islam.', 'mittel');
addQuestion('Hadithe', 'Wie nennt man die Berichte über die Taten und Aussprüche des Propheten Mohammed?', 'Hadithe.', 'mittel');
addQuestion('622 n. Chr.', 'In welchem Jahr (nach christlicher Zeitrechnung) begann die islamische Zeitrechnung (Hidschra)?', '622 n. Chr.', 'mittel');
addQuestion('Abu Bakr', 'Wer war der erste Kalif nach dem Tod Mohammeds?', 'Abu Bakr.', 'mittel');
addQuestion('Wudu', 'Wie nennt man die rituellen Waschungen vor dem Gebet?', 'Wudu.', 'mittel');
addQuestion('Umma', 'Was ist die „Umma"?', 'Die weltweite Gemeinschaft der Muslime.', 'mittel');
addQuestion('Eid al-Fitr', 'Wie heißt das Fest zum Ende des Fastenmonats Ramadan?', 'Eid al-Fitr (Zuckerfest).', 'mittel');
addQuestion('Schahada', 'Wie lautet das islamische Glaubensbekenntnis (Schahada)?', '„Es gibt keinen Gott außer Allah und Mohammed ist sein Gesandter."', 'mittel');
addQuestion('Ismael', 'Wer baute laut Koran zusammen mit Abraham die Kaaba wieder auf?', 'Ismael.', 'mittel');
addQuestion('Gabriel', 'Wie heißt der Engel, der Mohammed den Koran offenbarte?', 'Gabriel (Dschibril).', 'mittel');

// Block 3: Judentum vertieft
addQuestion('Chanukka', 'Wie heißt das jüdische Lichterfest im Winter?', 'Chanukka.', 'mittel');
addQuestion('Pessach', 'Was feiert das jüdische Pessach-Fest?', 'Den Auszug aus Ägypten (Exodus).', 'mittel');
addQuestion('Tallit', 'Wie nennt man den jüdischen Gebetsschal?', 'Tallit.', 'mittel');
addQuestion('Rosch Haschana', 'Wie heißt das jüdische Neujahrsfest?', 'Rosch Haschana.', 'mittel');
addQuestion('Jom Kippur', 'Welcher Tag ist der höchste jüdische Feiertag (Versöhnungstag)?', 'Jom Kippur.', 'mittel');
addQuestion('Talmud', 'Was ist der „Talmud"?', 'Ein bedeutendes Schriftwerk des Judentums (Kommentare zur Tora).', 'mittel');
addQuestion('Mesusa', 'Wie nennt man die Kapsel mit Tora-Versen am Türpfosten jüdischer Häuser?', 'Mesusa.', 'mittel');
addQuestion('Saul', 'Wer war der erste König Israels laut Altem Testament?', 'Saul.', 'mittel');

// Block 4: Östliche Religionen & Andere
addQuestion('Veden', 'Wie heißen die heiligen Schriften des Hinduismus?', 'Veden.', 'mittel');
addQuestion('Shiva', 'Wer ist der hinduistische Gott der Zerstörung und Erneuerung?', 'Shiva.', 'mittel');
addQuestion('Vishnu', 'Wer ist der hinduistische Gott der Erhaltung?', 'Vishnu.', 'mittel');
addQuestion('Guru Nanak', 'Wer war der Begründer des Sikhismus?', 'Guru Nanak.', 'mittel');
addQuestion('Vier Wahrheiten', 'Wie nennt man die vier edlen Wahrheiten im Buddhismus?', 'Wahrheit vom Leiden, von der Ursache, der Aufhebung und dem Weg.', 'mittel');
addQuestion('Bardo', 'Was ist das „Bardo" im tibetischen Buddhismus?', 'Ein Zwischenzustand zwischen Tod und Wiedergeburt.', 'mittel');
addQuestion('Guru Granth Sahib', 'Wie heißt das heilige Buch der Sikhs?', 'Guru Granth Sahib.', 'mittel');
addQuestion('Diaspora', 'Was bedeutet der Begriff „Diaspora"?', 'Die Zerstreuung einer Religionsgemeinschaft über die Welt.', 'mittel');
addQuestion('Taoismus', 'Welche Religion folgt den Lehren von Laotse (Tao Te King)?', 'Taoismus (Daoismus).', 'mittel');
addQuestion('Konfuzianismus', 'Wie nennt man die Ethik des Konfuzius, die auf Ahnenverehrung und Ordnung basiert?', 'Konfuzianismus.', 'mittel');
addQuestion('Shintoismus', 'Wie heißt die japanische Religion, die Naturgeister (Kami) verehrt?', 'Shintoismus.', 'mittel');

// Block 5: Theologie & Philosophie
addQuestion('Theodizee', 'Was bedeutet der Begriff „Theodizee"?', 'Die Frage nach der Gerechtigkeit Gottes angesichts des Leidens in der Welt.', 'mittel');
addQuestion('Thomas von Aquin', 'Wer verfasste das Werk „Summa Theologica"?', 'Thomas von Aquin.', 'mittel');
addQuestion('Eschatologie', 'Wie nennt man die Lehre von den letzten Dingen (Tod, Gericht, Ende der Welt)?', 'Eschatologie.', 'mittel');
addQuestion('Gnosis', 'Was ist „Gnosis"?', 'Eine frühe religiöse Strömung, die Erlösung durch geheimes Wissen sucht.', 'mittel');
addQuestion('Feuerbach', 'Wer gilt als Begründer der modernen Religionskritik („Gott ist eine Projektion")?', 'Ludwig Feuerbach.', 'mittel');
addQuestion('Marx Opium', 'Welcher Philosoph nannte Religion das „Opium des Volkes"?', 'Karl Marx.', 'mittel');
addQuestion('Agnostizismus', 'Wie nennt man die Überzeugung, dass man über die Existenz Gottes nichts wissen kann?', 'Agnostizismus.', 'mittel');
addQuestion('Pantheismus', 'Was ist Pantheismus?', 'Der Glaube, dass Gott und das Universum eins sind.', 'mittel');
addQuestion('Elia', 'Wie heißt der biblische Prophet, der in einem Feuerwagen in den Himmel fuhr?', 'Elia.', 'mittel');
addQuestion('Metuschelach', 'Wer war laut Bibel der älteste Mensch der Welt?', 'Metuschelach (969 Jahre).', 'mittel');
addQuestion('Goldene Regel', 'Was ist die „Goldene Regel"?', 'Behandle andere so, wie du selbst behandelt werden willst.', 'mittel');
addQuestion('Manna', 'Wie nennt man die Speise, die Gott den Israeliten in der Wüste schickte?', 'Manna.', 'mittel');
addQuestion('114 Suren', 'Wie viele Suren hat der Koran?', '114.', 'mittel');
addQuestion('Kabbala', 'Wie heißt die jüdische Mystik?', 'Kabbala.', 'mittel');
addQuestion('Dogma', 'Was ist ein „Dogma"?', 'Ein unumstößlicher Glaubenssatz.', 'mittel');
addQuestion('Antiochia', 'In welcher Stadt wurden die Christen erstmals so genannt?', 'Antiochia.', 'mittel');
addQuestion('Christophorus', 'Wer ist der Schutzpatron der Reisenden?', 'Christophorus.', 'mittel');
addQuestion('Avesta', 'Wie heißt die heilige Schrift des Zoroastrismus?', 'Avesta.', 'mittel');
addQuestion('Abel', 'Wer war der biblische Vorfahre, der von seinem Bruder Kain getötet wurde?', 'Abel.', 'mittel');
addQuestion('Soteriologie', 'Wie nennt man die christliche Lehre von der Errettung der Seele?', 'Soteriologie.', 'mittel');
addQuestion('Exegese', 'Was ist die „Exegese"?', 'Die wissenschaftliche Auslegung religiöser Texte.', 'mittel');
addQuestion('Qumran', 'Wie heißt der Ort, an dem die Totenrollen vom Toten Meer gefunden wurden?', 'Qumran.', 'mittel');
addQuestion('Lumina', 'Was ist die „Lumina" in der Liturgie?', 'Das Lichtsymbol (z. B. Osterkerze).', 'mittel');
addQuestion('Debora', 'Wer war die biblische Richterin, die gegen die Kanaaniter kämpfte?', 'Debora.', 'mittel');
addQuestion('Holi', 'Wie heißt das hinduistische Frühlingsfest der Farben?', 'Holi.', 'mittel');
addQuestion('Stupa', 'Was ist ein „Stupa"?', 'Ein buddhistisches Bauwerk (Reliquienschrein).', 'mittel');
addQuestion('Zakat', 'Wie nennt man im Islam die Spende für Bedürftige?', 'Zakat.', 'mittel');
addQuestion('Jona', 'Wer war der biblische Prophet, der im Bauch eines großen Fisches überlebte?', 'Jona.', 'mittel');
addQuestion('Priestertum aller', 'Was ist das „Priestertum aller Gläubigen" (Luther)?', 'Die Überzeugung, dass jeder Christ direkten Zugang zu Gott hat.', 'mittel');
addQuestion('Bahai Haus', 'Wie heißt das Gebetshaus der Bahai?', 'Haus der Andacht.', 'mittel');
addQuestion('Synkretismus', 'Was bedeutet „Synkretismus"?', 'Die Vermischung verschiedener Religionen oder Philosophien.', 'mittel');
addQuestion('Azrael', 'Wie heißt der Engel des Todes im Judentum und Islam oft?', 'Azrael.', 'mittel');
addQuestion('Johannes Täufer', 'Wer war der Prophet, der das Kommen Jesu ankündigte und ihn taufte?', 'Johannes der Täufer.', 'mittel');
addQuestion('Marterl', 'Wie heißt die kleine Kapelle oder der Schrein an Wegrändern?', 'Marterl oder Bildstock.', 'mittel');

// SCHWER (80 Fragen)
// Block 1: Spezialthemen & Kirchenrecht
addQuestion('Filioque', 'Was besagt das „Filioque"-Dogma, das zum Schisma von 1054 beitrug?', 'Dass der Heilige Geist vom Vater „und dem Sohn" ausgeht.', 'schwer');
addQuestion('Bulle', 'Wie heißt das Dokument, mit dem der Papst eine feierliche Entscheidung verkündet?', 'Bulle.', 'schwer');
addQuestion('Syllabus errorum', 'Was ist der „Syllabus errorum" von Papst Pius IX.?', 'Eine Liste von 80 „Irrtümern" der modernen Zeit (1864).', 'schwer');
addQuestion('Dyophysitismus', 'Wie nennt man die Lehre, dass Christus zwei Naturen (göttlich/menschlich) in einer Person vereint?', 'Dyophysitismus.', 'schwer');
addQuestion('Karl Barth', 'Wer war der Begründer der „Dialektischen Theologie" im 20. Jahrhundert?', 'Karl Barth.', 'schwer');
addQuestion('Anaphora', 'Was ist die „Anaphora" in der orthodoxen Liturgie?', 'Das Hochgebet (Eucharistiegebet).', 'schwer');
addQuestion('CIC', 'Wie heißt die rechtliche Gesetzessammlung der katholischen Kirche?', 'Codex Iuris Canonici (CIC).', 'schwer');
addQuestion('Apokatastasis', 'Was versteht man unter „Apokatastasis"?', 'Die Lehre von der Wiederbringung aller Dinge (Allversöhnung am Ende der Zeit).', 'schwer');
addQuestion('Augustinus', 'Welcher Kirchenvater verfasste „De civitate Dei" (Vom Gottesstaat)?', 'Augustinus von Hippo.', 'schwer');
addQuestion('Heliand', 'Was ist das „Heliand"?', 'Eine altsächsische Bibeldichtung des 9. Jahrhunderts, die Christus als germanischen Gefolgsherrn darstellt.', 'schwer');
addQuestion('Urban II', 'Welcher Papst rief 1095 zum ersten Kreuzzug auf?', 'Urban II.', 'schwer');
addQuestion('Konkomitanz', 'Was ist die „Konkomitanz"?', 'Die Lehre, dass Christus ganz in jeder der beiden Gestalten (Brot oder Wein) gegenwärtig ist.', 'schwer');

// Block 2: Islamische & Jüdische Gelehrsamkeit
addQuestion('Al-Ghazali', 'Wie heißt das bedeutende Werk des Al-Ghazali über die Wiederbelebung der Religionswissenschaften?', 'Ihya Ulum al-Din.', 'schwer');
addQuestion('Mudschtahid', 'Was ist ein „Mudschtahid"?', 'Ein islamischer Gelehrter, der zur selbstständigen Rechtsfindung (Idschtihad) befähigt ist.', 'schwer');
addQuestion('Maimonides', 'Wer war Maimonides (Rambam)?', 'Ein bedeutender jüdischer Philosoph und Arzt des Mittelalters („Führer der Unschlüssigen").', 'schwer');
addQuestion('Zohar', 'Was ist der „Zohar"?', 'Das Hauptwerk der jüdischen Kabbala.', 'schwer');
addQuestion('Midrasch', 'Wie nennt man die jüdische Exegese, die über den Wortsinn hinausgeht und Erzählungen nutzt?', 'Midrasch.', 'schwer');
addQuestion('Halacha Haggada', 'Was ist der Unterschied zwischen „Halacha" und „Haggada"?', 'Halacha ist das rechtliche System, Haggada der erzählende Teil der Tradition.', 'schwer');
addQuestion('Mutaziliten', 'Wer waren die Mutaziliten?', 'Eine rationalistische theologische Schule des frühen Islam.', 'schwer');
addQuestion('Tasawwuf', 'Was ist „Tasawwuf"?', 'Die korrekte Bezeichnung für den Sufismus (islamische Mystik).', 'schwer');

// Block 3: Religionsgeschichte & Archäologie
addQuestion('Nag-Hammadi', 'Was ist das „Nag-Hammadi-Archiv"?', 'Eine Sammlung gnostischer Schriften, gefunden 1945 in Ägypten.', 'schwer');
addQuestion('Peschitta', 'Wie heißt die syrische Übersetzung der Bibel?', 'Peschitta.', 'schwer');
addQuestion('Baal Aschera', 'Welches Volk verehrte den Gott Ba\'al und die Göttin Aschera?', 'Die Kanaaniter (Phönizier).', 'schwer');
addQuestion('Echnaton', 'Wer war Echnaton und warum ist er für die Religionsgeschichte wichtig?', 'Ein Pharao, der den Aton-Kult (früher Monotheismus) einführte.', 'schwer');
addQuestion('Manichäismus', 'Was ist „Manichäismus"?', 'Eine ausgestorbene dualistische Weltreligion des Mani (Licht vs. Finsternis).', 'schwer');
addQuestion('Gilgamesch', 'Wie heißt das Gilgamesch-Epos-Fragment, das Parallelen zur Sintflut aufweist?', 'Die elfte Tafel.', 'schwer');
addQuestion('Nestorianismus', 'Was ist der „Nestorianismus"?', 'Eine christologische Lehre, die die zwei Naturen Christi strikt trennt (nach Nestorius).', 'schwer');

// Block 4: Philosophie & Komplextheologie
addQuestion('Anselm Gottesbeweis', 'Was ist der „Ontologische Gottesbeweis" (Anselm von Canterbury)?', 'Gott ist das Wesen, über das hinaus nichts Größeres gedacht werden kann; da Existenz größer ist als Nicht-Existenz, muss er existieren.', 'schwer');
addQuestion('Prozesstheologie', 'Wer entwickelte die „Prozesstheologie"?', 'Alfred North Whitehead (und Charles Hartshorne).', 'schwer');
addQuestion('Kenosis', 'Was bedeutet „Kenosis"?', 'Die Selbstentäußerung Gottes in der Menschwerdung Christi.', 'schwer');
addQuestion('Max Stirner', 'Wer ist der Autor des Werkes „Der Einzige und sein Eigentum" (radikaler Atheismus)?', 'Max Stirner.', 'schwer');
addQuestion('Henotheismus', 'Was ist „Henotheismus"?', 'Die Verehrung eines Gottes, ohne die Existenz anderer Götter zu leugnen.', 'schwer');
addQuestion('Bultmann', 'Was ist der „Demitologisierung"-Ansatz von Rudolf Bultmann?', 'Den existenziellen Kern des Kerygmas (Botschaft) aus der mythologischen Hülle der Bibel zu befreien.', 'schwer');
addQuestion('Scholastik', 'Wie heißt die mittelalterliche Methode der Wahrheitsfindung durch Logik und Autoritätsbeweise?', 'Scholastik.', 'schwer');
addQuestion('Viertes Evangelium', 'Was ist das „Vierte Evangelium"?', 'Das Johannesevangelium (da es sich stark von den Synoptikern unterscheidet).', 'schwer');

// Block 5: Vermischtes (Expertenlevel)
addQuestion('Tefillin', 'Wie nennt man die kleinen Lederkapseln mit Tora-Versen, die jüdische Männer beim Gebet an Arm und Stirn binden?', 'Tefillin.', 'schwer');
addQuestion('Bodhisattva', 'Was ist ein „Bodhisattva"?', 'Ein Wesen im Buddhismus, das Erleuchtung erlangt hat, aber auf das Nirvana verzichtet, um anderen zu helfen.', 'schwer');
addQuestion('Bhagavad Gita', 'Wie heißt der hinduistische Text, ein Dialog zwischen Krishna und Arjuna?', 'Bhagavad Gita.', 'schwer');
addQuestion('Jakob Böhme', 'Wer war Jakob Böhme?', 'Ein deutscher Mystiker und Philosoph („Schuhmacherphilosoph").', 'schwer');
addQuestion('Quietismus', 'Was ist „Quietismus"?', 'Eine mystische Strömung, die völlige Passivität der Seele vor Gott anstrebt.', 'schwer');
addQuestion('Gaben Geist', 'Wie nennt man die sieben Gaben des Heiligen Geistes?', 'Weisheit, Einsicht, Rat, Stärke, Erkenntnis, Frömmigkeit, Gottesfurcht.', 'schwer');
addQuestion('Jesusgebet', 'Was ist das „Jesusgebet" (Herzgebet) der Ostkirche?', 'Die ständige Wiederholung des Namens Jesus Christus.', 'schwer');
addQuestion('Tertullian', 'Wer war Tertullian?', 'Ein früher christlicher Schriftsteller („Credo, quia absurdum").', 'schwer');
addQuestion('Septuaginta', 'Was ist die „Septuaginta"?', 'Die älteste griechische Übersetzung des Alten Testaments.', 'schwer');
addQuestion('Masada', 'Wie heißt die jüdische Siedlung, die 73 n. Chr. als letzte Bastion gegen die Römer fiel?', 'Masada.', 'schwer');
addQuestion('Transsubstantiation', 'Was bedeutet der Begriff „Transsubstantiation"?', 'Die Wesensverwandlung von Brot und Wein in Leib und Blut Christi.', 'schwer');
addQuestion('Meister Eckhart', 'Wer verfasste das „Buch der göttlichen Tröstung"?', 'Meister Eckhart.', 'schwer');
addQuestion('Wahhabismus', 'Was ist der „Wahhabismus"?', 'Eine puristisch-traditionalistische Richtung des sunnitischen Islam (Saudi-Arabien).', 'schwer');
addQuestion('Jesiden', 'Wie heißt das heilige Fest der Jesiden?', 'Das Fest von Schiech Adi (Tawusi Melek).', 'schwer');
addQuestion('Häresie', 'Was ist „Häresie"?', 'Eine Lehre, die im Widerspruch zu kirchlichen Glaubenssätzen steht.', 'schwer');
addQuestion('Melchisedek', 'Wer war der biblische Melchisedek?', 'Priesterkönig von Salem, der Abraham segnete (Vorbild für das Priestertum Christi).', 'schwer');
addQuestion('Pritchard', 'Was ist das „Pritchard-Kapitel" im Kontext biblischer Archäologie?', 'Sammlung altorientalischer Texte zur Bibel (ANET).', 'schwer');
addQuestion('Rudolf Steiner', 'Wie heißt der Begründer der Anthroposophie?', 'Rudolf Steiner.', 'schwer');
addQuestion('Enuma Elisch', 'Was ist das „Enuma Elisch"?', 'Der babylonische Schöpfungsmythos.', 'schwer');
addQuestion('Marcion', 'Wer war Marcion?', 'Ein Häretiker des 2. Jh., der den Gott des AT und des NT streng trennte.', 'schwer');
addQuestion('Libationsopfer', 'Was ist „Libationsopfer"?', 'Ein Trankopfer für Gottheiten oder Verstorbene.', 'schwer');
addQuestion('Qibla', 'Wie nennt man die Gebetsrichtung der Muslime?', 'Qibla.', 'schwer');
addQuestion('Prädestination', 'Was ist „Prädestination"?', 'Die Lehre von der Vorherbestimmung des Menschen durch Gott (besonders bei Calvin).', 'schwer');
addQuestion('Pascal', 'Wer war Blaise Pascal im religiösen Kontext?', 'Mathematiker und Philosoph („Pascalsche Wette", „Pensées").', 'schwer');
addQuestion('Antiphon', 'Was ist ein „Antiphon"?', 'Ein Wechselgesang in der Liturgie.', 'schwer');
addQuestion('Malachi', 'Wer war der Prophet Malachi?', 'Der Verfasser des letzten Buches des Alten Testaments.', 'schwer');
addQuestion('Deismus', 'Was ist „Deismus"?', 'Glaube an einen Gott, der die Welt schuf, aber nicht mehr eingreift (Uhrmacher-Gott).', 'schwer');
addQuestion('Tripitaka', 'Wie heißt das buddhistische Konzil, auf dem der Kanon (Tripitaka) festgelegt wurde?', 'Das erste Konzil von Rajagriha.', 'schwer');
addQuestion('Kant Moral', 'Was ist die „Kritik der praktischen Vernunft" (Kant) in Bezug auf Gott?', 'Gott als Postulat der Moral.', 'schwer');
addQuestion('Erzengel Posaune', 'Wie heißt der Engel des Gerichts, der die Posaune bläst?', 'Meist Gabriel oder Michael (traditionell oft Erzengel Michael).', 'schwer');
addQuestion('Unbefleckte Empfängnis', 'Was ist die „Unbefleckte Empfängnis"?', 'Die Lehre, dass Maria (Mutter Jesu) ohne Erbsünde empfangen wurde (nicht die Jungfrauengeburt Jesu!).', 'schwer');
addQuestion('Sabellius', 'Wer war Sabellius?', 'Ein Vertreter des Modalismus (Gott nur in drei Erscheinungsformen).', 'schwer');
addQuestion('Book of Common Prayer', 'Was ist das „Book of Common Prayer"?', 'Die Agende (Liturgiebuch) der Anglikanischen Kirche.', 'schwer');
addQuestion('Tartaros', 'Wie heißt der Ort der Qual im griechischen Hades, oft als Analogon zur Hölle genutzt?', 'Tartaros.', 'schwer');
addQuestion('Hagiographie', 'Was ist „Hagiographie"?', 'Die Beschreibung des Lebens von Heiligen.', 'schwer');
addQuestion('Eusebius', 'Wer ist der Verfasser der „Kirchengeschichte" (Historia Ecclesiastica)?', 'Eusebius von Caesarea.', 'schwer');
addQuestion('Athanasisches Bekenntnis', 'Was ist das „Athanasische Glaubensbekenntnis"?', 'Ein altkirchliches Bekenntnis, das die Trinität scharf definiert.', 'schwer');
addQuestion('Minjan', 'Wie nennt man im Judentum die 10 Männer, die für einen Gottesdienst nötig sind?', 'Minjan.', 'schwer');
addQuestion('Jan Hus', 'Wer war Jan Hus?', 'Ein tschechischer Reformator, der 1415 auf dem Konzil von Konstanz verbrannt wurde.', 'schwer');
addQuestion('Immanenz', 'Was ist die „Immanenz" Gottes?', 'Die Allgegenwart Gottes in der Schöpfung (Gegenteil von Transzendenz).', 'schwer');
addQuestion('Chrisam', 'Wie heißt das heilige Öl, das bei Firmung oder Weihe verwendet wird?', 'Chrisam.', 'schwer');
addQuestion('Sabbatweg', 'Was ist der „Sabbatweg"?', 'Die Wegstrecke, die man am Sabbat maximal zurücklegen darf (ca. 1 km).', 'schwer');
addQuestion('Kierkegaard', 'Wer war Soren Kierkegaard?', 'Dänischer Philosoph, Begründer des Existenzialismus mit religiösem Schwerpunkt.', 'schwer');
addQuestion('Wort Gottes Islam', 'Was ist das „Wort Gottes" im Islam primär?', 'Der Koran (als direktes Wort, nicht nur inspiriert).', 'schwer');
addQuestion('Taizé', 'Wie heißt die ökumenische Gemeinschaft in Frankreich, bekannt für ihre meditativen Gesänge?', 'Taizé.', 'schwer');

console.log(JSON.stringify(questions, null, 2));
console.log(`\nTotal: ${questions.length} questions`);
console.log(`Einfach: ${questions.filter(q => q.difficulty === 'einfach').length}`);
console.log(`Mittel: ${questions.filter(q => q.difficulty === 'mittel').length}`);
console.log(`Schwer: ${questions.filter(q => q.difficulty === 'schwer').length}`);
