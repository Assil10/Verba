const { createSentence } = require('./generator_utils.cjs');

function getA1Sentences() {
  const list = [];
  const seen = new Set();
  let id = 1;

  function add(de, en, topic, topicLabel, tags, vocab, diff = 1) {
    if (seen.has(de)) return;
    seen.add(de);
    const item = createSentence(
      `sent-a1-${String(id).padStart(3, '0')}`,
      de,
      en,
      "A1",
      topic,
      topicLabel,
      tags,
      vocab,
      diff,
      "neutral",
      `A1 grammar focus: ${tags[0].replace(/_/g, ' ')}. Standard finite verb in position 2 in statements.`
    );
    list.push(item);
    id++;
  }

  // Core thematic seeds across 10 distinct topics
  const themes = [
    // --- 1. Introductions & Personal Info ---
    ["Ich heiße Anna und komme aus Österreich.", "My name is Anna and I come from Austria.", "everyday", "Personal Info", ["verb_heißen", "verb_kommen"], ["heißen", "kommen", "Österreich"]],
    ["Mein Name ist Lucas und ich bin zweiundzwanzig Jahre alt.", "My name is Lucas and I am twenty-two years old.", "everyday", "Personal Info", ["sein_present", "numbers"], ["Name", "Jahre", "alt"]],
    ["Woher kommen Sie, Herr Becker?", "Where do you come from, Mr. Becker?", "social", "Greetings", ["formal_sie", "w_question"], ["woher", "Herr"]],
    ["Ich wohne jetzt seit drei Monaten in München.", "I have been living in Munich for three months now.", "housing", "Living", ["preposition_seit_dativ", "present_tense"], ["wohnen", "Monate", "München"]],
    ["Ich spreche Deutsch, Englisch und ein wenig Französisch.", "I speak German, English, and a little French.", "everyday", "Languages", ["vowel_change_e_i", "languages"], ["sprechen", "Deutsch", "Französisch"]],
    ["Sind Sie verheiratet oder ledig?", "Are you married or single?", "relationships", "Personal Info", ["formal_sie", "adjective_predicate"], ["verheiratet", "ledig"]],
    ["Ich habe zwei Brüder und eine kleine Schwester.", "I have two brothers and a little sister.", "relationships", "Family", ["akkusativ_indefinite", "haben_present"], ["Brüder", "Schwester", "klein"]],
    ["Meine Familie wohnt in einem Dorf bei Stuttgart.", "My family lives in a village near Stuttgart.", "relationships", "Family", ["preposition_in_dativ", "preposition_bei"], ["Familie", "Dorf", "wohnen"]],
    ["Wie ist Ihre Telefonnummer, bitte?", "What is your telephone number, please?", "everyday", "Contact", ["formal_ihre", "polite_bitte"], ["Telefonnummer", "wie"]],
    ["Das ist meine Kollegin Frau Schneider.", "This is my colleague Ms. Schneider.", "work", "Colleagues", ["demonstrative_das", "profession"], ["Kollegin", "Frau"]],

    // --- 2. Food & Drinks ---
    ["Ich trinke morgens immer einen heißen Kaffee.", "In the morning I always drink a hot coffee.", "food", "Drinks", ["time_adverb", "akkusativ_masculine"], ["trinken", "Kaffee", "heiß"]],
    ["Möchten Sie lieber Tee oder Mineralwasser?", "Would you prefer tea or sparkling water?", "food", "Drinks", ["modal_moechten", "akkusativ"], ["Tee", "Mineralwasser", "lieber"]],
    ["Zum Frühstück esse ich zwei Brötchen mit Käse.", "For breakfast I eat two bread rolls with cheese.", "food", "Breakfast", ["preposition_zu_dativ", "preposition_mit"], ["Frühstück", "Brötchen", "Käse"]],
    ["Wir essen heute zu Mittag eine frische Gemüsesuppe.", "We are eating a fresh vegetable soup for lunch today.", "food", "Lunch", ["akkusativ_feminine", "time_phrase"], ["Suppe", "Gemüse", "frisch"]],
    ["Haben Sie einen Tisch für drei Personen frei?", "Do you have a table for three people free?", "food", "Restaurant", ["akkusativ_masculine", "adjective_predicate"], ["Tisch", "Personen", "frei"]],
    ["Die Rechnung, bitte! Kann ich mit Karte zahlen?", "The bill, please! Can I pay by card?", "food", "Restaurant", ["modal_koennen", "preposition_mit"], ["Rechnung", "Karte", "zahlen"]],
    ["Das Schnitzel mit Kartoffelsalat schmeckt ausgezeichnet.", "The schnitzel with potato salad tastes excellent.", "food", "Dining", ["verb_schmecken", "compound_nouns"], ["Schnitzel", "Kartoffelsalat", "schmecken"]],
    ["Ich nehme einen Salat ohne Zwiebeln.", "I will take a salad without onions.", "food", "Ordering", ["preposition_ohne_akkusativ", "verb_nehmen"], ["Salat", "Zwiebeln", "nehmen"]],
    ["Gibt es hier auch vegetarische Gerichte?", "Are there also vegetarian dishes here?", "food", "Dining", ["es_gibt_akkusativ", "plural_noun"], ["Gerichte", "vegetarisch"]],
    ["Der Apfelkuchen ist noch warm und sehr lecker.", "The apple cake is still warm and very delicious.", "food", "Dessert", ["adjective_predicate", "compound_noun"], ["Kuchen", "warm", "lecker"]],

    // --- 3. Daily Routine & Time ---
    ["Ich stehe von Montag bis Freitag um sechs Uhr auf.", "I get up at six o'clock from Monday to Friday.", "everyday", "Routine", ["separable_aufstehen", "time_um"], ["aufstehen", "Uhr", "Montag"]],
    ["Um wie viel Uhr fängt dein Deutschkurs an?", "At what time does your German course begin?", "everyday", "Time", ["separable_anfangen", "w_question"], ["anfangen", "Kurs", "Uhr"]],
    ["Der Zug nach Frankfurt fährt um Viertel nach zehn ab.", "The train to Frankfurt departs at a quarter past ten.", "travel", "Train", ["separable_abfahren", "time_viertel"], ["Zug", "abfahren", "Viertel"]],
    ["Am Nachmittag mache ich meine Hausaufgaben in der Bibliothek.", "In the afternoon I do my homework in the library.", "university", "Study", ["time_am", "dativ_in"], ["Hausaufgaben", "Bibliothek", "machen"]],
    ["Er geht jeden Abend um elf Uhr schlafen.", "He goes to sleep every evening at eleven o'clock.", "everyday", "Routine", ["time_akkusativ", "infinitive_schlafen"], ["Abend", "schlafen", "gehen"]],
    ["Am Wochenende treffe ich oft meine Freunde im Café.", "On the weekend I often meet my friends in the café.", "social", "Leisure", ["vowel_change_e_i", "time_am"], ["treffen", "Freunde", "Wochenende"]],
    ["Heute habe ich leider keine Zeit für Sport.", "Today I unfortunately have no time for sports.", "health", "Daily Life", ["negation_kein", "preposition_fuer"], ["Zeit", "Sport", "heute"]],
    ["Wie spät ist es jetzt genau in Berlin?", "What time is it right now exactly in Berlin?", "everyday", "Time", ["time_question", "location"], ["spät", "jetzt", "Berlin"]],
    ["Es ist jetzt genau zehn vor halb drei.", "It is right now exactly ten to half past two.", "everyday", "Time", ["time_idiom", "numbers"], ["Uhrzeit", "genau", "halb"]],
    ["Der Supermarkt schließt am Samstag schon um achtzehn Uhr.", "The supermarket already closes at 6 pm on Saturday.", "shopping", "Hours", ["time_am", "verb_schließen"], ["Supermarkt", "schließen", "Samstag"]],

    // --- 4. Shopping & Prices ---
    ["Entschuldigung, wie viel kostet dieser Wollpullover?", "Excuse me, how much does this wool sweater cost?", "shopping", "Clothing", ["w_question_wieviel", "demonstrative_dieser"], ["Pullover", "kosten", "Euro"]],
    ["Das Hemd gefällt mir gut, aber es ist zu eng.", "I like the shirt, but it is too tight.", "shopping", "Clothing", ["dative_verb_gefallen", "adjective"], ["Hemd", "gefallen", "eng"]],
    ["Haben Sie diese Schuhe auch in Größe zweiundvierzig?", "Do you also have these shoes in size 42?", "shopping", "Sizes", ["akkusativ_plural", "preposition_in"], ["Schuhe", "Größe", "haben"]],
    ["Ich brauche eine neue Winterjacke für die kalten Tage.", "I need a new winter jacket for the cold days.", "shopping", "Clothing", ["akkusativ_feminine", "preposition_fuer"], ["Jacke", "Winter", "brauchen"]],
    ["Wo ist hier bitte die Umkleidekabine?", "Where is the fitting room here, please?", "shopping", "Store", ["w_question", "store_vocabulary"], ["Umkleidekabine", "wo", "bitte"]],
    ["Die Hose ist im Angebot und kostet nur zwanzig Euro.", "The trousers are on sale and cost only twenty euros.", "shopping", "Sales", ["idiom_im_angebot", "currency"], ["Hose", "Angebot", "Euro"]],
    ["Kann ich diesen Pullover umtauschen, wenn er nicht passt?", "Can I exchange this sweater if it does not fit?", "shopping", "Service", ["modal_koennen", "separable_umtauschen"], ["umtauschen", "passen", "Pullover"]],
    ["Ich möchte gerne bar an der Kasse bezahlen.", "I would like to pay cash at the register.", "shopping", "Payment", ["modal_moechten", "preposition_an_dativ"], ["bar", "Kasse", "bezahlen"]],
    ["Hier ist Ihr Wechselgeld und der Kassenbon.", "Here is your change and the receipt.", "shopping", "Payment", ["possessive_ihr", "store_nouns"], ["Wechselgeld", "Kassenbon", "hier"]],
    ["Wir kaufen jeden Samstag frisches Obst auf dem Markt.", "We buy fresh fruit at the market every Saturday.", "food", "Shopping", ["time_akkusativ", "dativ_auf"], ["kaufen", "Obst", "Markt"]],

    // --- 5. Living & Home ---
    ["Meine Wohnung hat drei helle Zimmer und einen großen Balkon.", "My apartment has three bright rooms and a large balcony.", "housing", "Apartment", ["akkusativ_masculine", "plural_rooms"], ["Wohnung", "Zimmer", "Balkon"]],
    ["Die Küche ist modern, aber das Badezimmer ist etwas klein.", "The kitchen is modern, but the bathroom is a bit small.", "housing", "Rooms", ["conjunction_aber", "adjective_predicate"], ["Küche", "Badezimmer", "modern"]],
    ["Der Esstisch steht in der Mitte des Wohnzimmers.", "The dining table stands in the middle of the living room.", "housing", "Furniture", ["position_verb_stehen", "preposition_in_dativ"], ["Tisch", "Wohnzimmer", "Mitte"]],
    ["An der Wand über dem Sofa hängt ein schönes Bild.", "A beautiful picture hangs on the wall above the sofa.", "housing", "Decoration", ["position_verb_haengen", "preposition_an_dativ"], ["Wand", "Sofa", "Bild"]],
    ["Wo finde ich den Schlüssel für den Keller?", "Where do I find the key for the basement?", "housing", "Home", ["akkusativ_masculine", "preposition_fuer"], ["Schlüssel", "Keller", "finden"]],
    ["Die Nachbarn im ersten Stock sind sehr nett und ruhig.", "The neighbors on the first floor are very kind and quiet.", "housing", "Neighbors", ["ordinal_numbers", "plural_subject"], ["Nachbarn", "Stock", "nett"]],
    ["Die Waschmaschine steht im Keller neben der Heizung.", "The washing machine is in the basement next to the heater.", "housing", "Appliances", ["preposition_neben_dativ", "appliances"], ["Waschmaschine", "Keller", "neben"]],
    ["Im Schlafzimmer steht ein großes Bett mit zwei Kissen.", "In the bedroom stands a large bed with two pillows.", "housing", "Furniture", ["preposition_in_dativ", "preposition_mit"], ["Schlafzimmer", "Bett", "Kissen"]],
    ["Wie hoch ist die monatliche Warmmiete für dieses Zimmer?", "How high is the monthly total rent for this room?", "housing", "Rent", ["financial_terms", "preposition_fuer"], ["Warmmiete", "Zimmer", "monatlich"]],
    ["Das Fenster geht direkt auf einen ruhigen Innenhof.", "The window opens directly onto a quiet courtyard.", "housing", "Architecture", ["preposition_auf_akkusativ", "adjective_declension"], ["Fenster", "Innenhof", "ruhig"]],

    // --- 6. City, Travel & Transportation ---
    ["Wie komme ich von hier aus am schnellsten zum Bahnhof?", "How do I get from here to the train station the fastest?", "travel", "Directions", ["superlative", "preposition_zu_dativ"], ["Bahnhof", "schnell", "kommen"]],
    ["Fahren Sie mit der U-Bahn-Linie zwei bis zum Museum.", "Take the underground line two up to the museum.", "travel", "Directions", ["imperative_formal", "preposition_mit_dativ"], ["U-Bahn", "Museum", "fahren"]],
    ["Die Bushaltestelle befindet sich gleich um die Ecke.", "The bus stop is located right around the corner.", "travel", "Transport", ["reflexive_befinden", "preposition_um_akkusativ"], ["Haltestelle", "Ecke", "Bus"]],
    ["Gilt diese Fahrkarte für das gesamte Stadtgebiet?", "Is this ticket valid for the entire city area?", "travel", "Public Transport", ["verb_gelten", "preposition_fuer"], ["Fahrkarte", "Stadtgebiet", "gelten"]],
    ["Der ICE-Zug hat heute leider zwanzig Minuten Verspätung.", "Unfortunately, the ICE train is twenty minutes delayed today.", "travel", "Train", ["noun_verspaetung", "time_minutes"], ["Zug", "Verspätung", "Minuten"]],
    ["Auf welchem Gleis fährt der Zug nach Köln ab?", "On which platform does the train to Cologne depart?", "travel", "Platform", ["w_question_welchem", "separable_abfahren"], ["Gleis", "Zug", "Köln"]],
    ["Wir fliegen nächsten Dienstag für eine Woche nach Rom.", "We are flying to Rome next Tuesday for a week.", "travel", "Flight", ["time_akkusativ", "preposition_nach"], ["fliegen", "Rom", "Dienstag"]],
    ["Haben Sie einen Stadtplan von der Innenstadt für mich?", "Do you have a city map of downtown for me?", "travel", "Tourism", ["preposition_von_dativ", "preposition_fuer"], ["Stadtplan", "Innenstadt", "haben"]],
    ["Das Hotel liegt sehr zentral, direkt am Marktplatz.", "The hotel is very centrally located, directly on the market square.", "travel", "Accommodation", ["adverb_zentral", "preposition_an_dativ"], ["Hotel", "Marktplatz", "zentral"]],
    ["Muss ich auf dieser Strecke einmal umsteigen?", "Do I have to change trains once on this route?", "travel", "Train", ["modal_muessen", "separable_umsteigen"], ["umsteigen", "Strecke", "einmal"]],

    // --- 7. Health & Body ---
    ["Mein Hals tut weh und ich habe Husten.", "My throat hurts and I have a cough.", "health", "Illness", ["separable_wehtun", "symptoms"], ["Hals", "wehtun", "Husten"]],
    ["Ich muss heute wegen Fieber im Bett bleiben.", "I have to stay in bed today because of a fever.", "health", "Doctor/Health", ["modal_muessen", "preposition_wegen_genitiv"], ["Fieber", "Bett", "bleiben"]],
    ["Nehmen Sie diesen Hustensaft dreimal am Tag ein.", "Take this cough syrup three times a day.", "health", "Medicine", ["imperative_formal", "separable_einnehmen"], ["Hustensaft", "einnehmen", "Tag"]],
    ["Haben Sie eine Schmerztablette gegen Kopfschmerzen?", "Do you have a painkiller for headaches?", "health", "Pharmacy", ["preposition_gegen_akkusativ", "compound_nouns"], ["Tablette", "Kopfschmerzen", "haben"]],
    ["Ich habe einen Termin beim Zahnarzt um vierzehn Uhr.", "I have an appointment at the dentist at 2 pm.", "health", "Appointments", ["preposition_bei_dativ", "time_um"], ["Termin", "Zahnarzt", "Uhr"]],
    ["Trinken Sie viel warmen Kräutertee mit Honig.", "Drink plenty of warm herbal tea with honey.", "health", "Advice", ["imperative_formal", "preposition_mit_dativ"], ["Kräutertee", "Honig", "trinken"]],
    ["Gute Besserung! Hoffentlich geht es dir bald besser.", "Get well soon! Hopefully you will feel better soon.", "health", "Wishes", ["idiom_gute_besserung", "dative_es_geht"], ["Besserung", "bald", "besser"]],
    ["Mein rechtes Knie tut mir beim Gehen sehr weh.", "My right knee hurts me a lot when walking.", "health", "Pain", ["dative_pronoun_mir", "preposition_beim"], ["Knie", "gehen", "wehtun"]],
    ["Ich brauche eine Bescheinigung für meinen Arbeitgeber.", "I need a medical certificate for my employer.", "health", "Work/Health", ["akkusativ_feminine", "preposition_fuer"], ["Bescheinigung", "Arbeitgeber", "brauchen"]],
    ["Atmen Sie bitte tief ein und wieder aus.", "Please breathe in deeply and out again.", "health", "Doctor", ["imperative_formal", "separable_verbs"], ["atmen", "tief", "einatmen"]],

    // --- 8. Work & University ---
    ["Ich arbeite als Softwareentwickler bei einer internationalen Firma.", "I work as a software developer at an international company.", "work", "Profession", ["profession_als", "preposition_bei_dativ"], ["arbeiten", "Softwareentwickler", "Firma"]],
    ["Mein Büro befindet sich im dritten Stock des Gebäudes.", "My office is located on the third floor of the building.", "work", "Office", ["ordinal_numbers", "reflexive_verb"], ["Büro", "Stock", "Gebäude"]],
    ["Wir haben heute um elf Uhr eine wichtige Teambesprechung.", "We have an important team meeting at eleven o'clock today.", "work", "Meetings", ["akkusativ_feminine", "time_um"], ["Teambesprechung", "wichtig", "haben"]],
    ["Können Sie mir den Bericht bis morgen früh schicken?", "Could you send me the report by tomorrow morning?", "work", "Requests", ["modal_koennen", "preposition_bis"], ["Bericht", "schicken", "morgen"]],
    ["Ich mache zurzeit ein Praktikum in einer Berliner Agentur.", "I am currently doing an internship in a Berlin agency.", "work", "Internship", ["akkusativ_neuter", "time_adverb"], ["Praktikum", "Agentur", "machen"]],
    ["Die Vorlesung über europäische Geschichte beginnt um zehn.", "The lecture on European history begins at ten.", "university", "Lectures", ["preposition_ueber_akkusativ", "verb_beginnen"], ["Vorlesung", "Geschichte", "beginnen"]],
    ["Ich lerne in der Universitätsbibliothek für meine Abschlussprüfung.", "I study in the university library for my final exam.", "university", "Study", ["preposition_in_dativ", "preposition_fuer"], ["Bibliothek", "Prüfung", "lernen"]],
    ["Haben Sie alle Unterlagen für die Bewerbung vollständig?", "Do you have all documents for the application complete?", "work", "Application", ["plural_akkusativ", "adjective_predicate"], ["Unterlagen", "Bewerbung", "vollständig"]],
    ["Mein Kollege spricht fließend vier Fremdsprachen.", "My colleague speaks four foreign languages fluently.", "work", "Skills", ["adverb_fließend", "plural_akkusativ"], ["Kollege", "Fremdsprachen", "sprechen"]],
    ["Ich beantworte jeden Vormittag alle dringenden E-Mails.", "I answer all urgent emails every morning.", "work", "Tasks", ["time_akkusativ", "plural_akkusativ"], ["beantworten", "E-Mails", "dringend"]],

    // --- 9. Weather & Nature ---
    ["Im Sommer ist es in Süddeutschland oft sonnig und warm.", "In summer it is often sunny and warm in southern Germany.", "everyday", "Weather", ["seasons_im", "weather_adjectives"], ["Sommer", "sonnig", "warm"]],
    ["Heute regnet es den ganzen Tag ohne Pause.", "Today it is raining the whole day without a break.", "everyday", "Weather", ["time_akkusativ", "preposition_ohne"], ["regnen", "Tag", "Pause"]],
    ["Im Winter fällt viel Schnee in den Alpen.", "In winter a lot of snow falls in the Alps.", "everyday", "Winter", ["verb_fallen", "plural_location"], ["Schnee", "Winter", "Alpen"]],
    ["Der Wind bläst heute sehr stark aus dem Norden.", "The wind is blowing very strongly from the north today.", "everyday", "Weather", ["verb_blasen_vowel_change", "preposition_aus"], ["Wind", "stark", "Norden"]],
    ["Die Blumen im Stadtpark blühen im Frühling wunderschön.", "The flowers in the city park bloom wonderfully in spring.", "everyday", "Spring", ["plural_subject", "seasons_im"], ["Blumen", "Frühling", "blühen"]],
    ["Vergiss nicht deine Sonnenbrille, die Sonne scheint hell.", "Do not forget your sunglasses, the sun is shining brightly.", "everyday", "Weather", ["imperative_vergiss", "nature_nouns"], ["Sonnenbrille", "Sonne", "scheinen"]],
    ["Es ist heute Nacht ziemlich kalt, fast null Grad.", "It is quite cold tonight, almost zero degrees.", "everyday", "Temperature", ["temperature_expression", "time_phrase"], ["kalt", "Nacht", "Grad"]],
    ["Morgen soll das Wetter wieder viel besser werden.", "Tomorrow the weather is supposed to get much better again.", "everyday", "Forecast", ["modal_sollen", "comparative"], ["Wetter", "morgen", "besser"]],
    ["Am Himmel sieht man viele dunkle Wolken.", "In the sky one sees many dark clouds.", "everyday", "Weather", ["impersonal_man", "preposition_an_dativ"], ["Himmel", "Wolken", "sehen"]],
    ["Wir machen am Sonntag einen Spaziergang durch den Wald.", "We are going for a walk through the forest on Sunday.", "everyday", "Nature", ["akkusativ_phrase", "preposition_durch"], ["Spaziergang", "Wald", "Sonntag"]]
  ];

  // Add all primary thematic seeds
  for (const t of themes) {
    add(t[0], t[1], t[2], t[3], t[4], t[5]);
  }

  // Systematic vocabulary arrays for realistic everyday A1 expansion
  const nounsA1 = [
    { de: "den neuen Laptop", en: "the new laptop", topic: "technology", cat: "Tech", tag: "akk_masc" },
    { de: "die deutsche Zeitung", en: "the German newspaper", topic: "everyday", cat: "Media", tag: "akk_fem" },
    { de: "das rote Fahrrad", en: "the red bicycle", topic: "travel", cat: "Transport", tag: "akk_neut" },
    { de: "einen warmen Tee", en: "a warm tea", topic: "food", cat: "Drink", tag: "akk_masc" },
    { de: "eine Flasche Wasser", en: "a bottle of water", topic: "food", cat: "Drink", tag: "akk_fem" },
    { de: "ein frisches Brot", en: "a fresh bread", topic: "food", cat: "Food", tag: "akk_neut" },
    { de: "meinen alten Rucksack", en: "my old backpack", topic: "shopping", cat: "Items", tag: "akk_masc" },
    { de: "meine schwarze Jacke", en: "my black jacket", topic: "shopping", cat: "Clothing", tag: "akk_fem" },
    { de: "mein neues Handy", en: "my new mobile phone", topic: "technology", cat: "Tech", tag: "akk_neut" },
    { de: "den schnellen Zug", en: "the fast train", topic: "travel", cat: "Transport", tag: "akk_masc" },
    { de: "die kleine Katze", en: "the little cat", topic: "everyday", cat: "Pets", tag: "akk_fem" },
    { de: "das spanische Wörterbuch", en: "the Spanish dictionary", topic: "university", cat: "Study", tag: "akk_neut" },
    { de: "einen bequemen Stuhl", en: "a comfortable chair", topic: "housing", cat: "Furniture", tag: "akk_masc" },
    { de: "eine helle Lampe", en: "a bright lamp", topic: "housing", cat: "Furniture", tag: "akk_fem" },
    { de: "ein sauberes Handtuch", en: "a clean towel", topic: "housing", cat: "Bathroom", tag: "akk_neut" },
    { de: "den grünen Salat", en: "the green salad", topic: "food", cat: "Food", tag: "akk_masc" },
    { de: "die warme Suppe", en: "the warm soup", topic: "food", cat: "Food", tag: "akk_fem" },
    { de: "das süße Dessert", en: "the sweet dessert", topic: "food", cat: "Food", tag: "akk_neut" },
    { de: "einen wichtigen Termin", en: "an important appointment", topic: "work", cat: "Calendar", tag: "akk_masc" },
    { de: "eine kurze Nachricht", en: "a short message", topic: "social", cat: "Messages", tag: "akk_fem" }
  ];

  const timeExpressions = [
    { de: "jeden Morgen", en: "every morning" },
    { de: "jeden Abend", en: "every evening" },
    { de: "heute Nachmittag", en: "this afternoon" },
    { de: "am Wochenende", en: "on the weekend" },
    { de: "nach der Arbeit", en: "after work" },
    { de: "vor dem Frühstück", en: "before breakfast" },
    { de: "am Montagmorgen", en: "on Monday morning" },
    { de: "am Freitagabend", en: "on Friday evening" },
    { de: "täglich um acht Uhr", en: "daily at eight o'clock" },
    { de: "immer pünktlich", en: "always punctually" }
  ];

  const subjectsA1 = [
    { de: "Ich", en: "I", vEnding: "e", haben: "habe", sein: "bin", moechte: "möchte", kann: "kann", muss: "muss" },
    { de: "Mein Freund", en: "My friend", vEnding: "t", haben: "hat", sein: "ist", moechte: "möchte", kann: "kann", muss: "muss" },
    { de: "Meine Schwester", en: "My sister", vEnding: "t", haben: "hat", sein: "ist", moechte: "möchte", kann: "kann", muss: "muss" },
    { de: "Wir", en: "We", vEnding: "en", haben: "haben", sein: "sind", moechte: "möchten", kann: "können", muss: "müssen" },
    { de: "Die Familie", en: "The family", vEnding: "t", haben: "hat", sein: "ist", moechte: "möchte", kann: "kann", muss: "muss" },
    { de: "Mein Kollege", en: "My colleague", vEnding: "t", haben: "hat", sein: "ist", moechte: "möchte", kann: "kann", muss: "muss" },
    { de: "Unsere Nachbarn", en: "Our neighbors", vEnding: "en", haben: "haben", sein: "sind", moechte: "möchten", kann: "können", muss: "müssen" },
    { de: "Herr Weber", en: "Mr. Weber", vEnding: "t", haben: "hat", sein: "ist", moechte: "möchte", kann: "kann", muss: "muss" }
  ];

  const actions = [
    { stem: "kauf", en: "buy", inf: "kaufen" },
    { stem: "such", en: "look for", inf: "suchen" },
    { stem: "brauch", en: "need", inf: "brauchen" },
    { stem: "bestell", en: "order", inf: "bestellen" },
    { stem: "bezahl", en: "pay for", inf: "bezahlen" }
  ];

  // Combine systematically until reaching 500
  for (const time of timeExpressions) {
    for (const sub of subjectsA1) {
      for (const act of actions) {
        for (const n of nounsA1) {
          if (list.length >= 500) break;
          const verbForm = act.stem + sub.vEnding;
          const de = `${sub.de} ${verbForm} ${time.de} ${n.de}.`;
          
          let enVerb = act.en;
          if (sub.en !== "I" && sub.en !== "We" && sub.en !== "Our neighbors") {
            enVerb = act.en === "buy" ? "buys" : act.en === "pay for" ? "pays for" : act.en + "s";
          }
          const en = `${sub.en} ${enVerb} ${n.en} ${time.en}.`;

          add(de, en, n.topic, n.cat, ["present_tense", n.tag, "word_order_v2"], [act.inf, "heute"]);
        }
      }
    }
  }

  // If still under 500, add modal verb variations
  if (list.length < 500) {
    for (const sub of subjectsA1) {
      for (const n of nounsA1) {
        if (list.length >= 500) break;
        const de = `${sub.de} möchte heute ${n.de} kaufen.`;
        const en = `${sub.en} would like to buy ${n.en} today.`;
        add(de, en, n.topic, n.cat, ["modal_verb_moechten", "infinitive_bracket"], ["möchten", "kaufen"]);
      }
    }
  }

  console.log(`Generated A1 sentences: ${list.length}`);
  return list.slice(0, 500);
}

module.exports = { getA1Sentences };
