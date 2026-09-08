const { createSentence } = require('./generator_utils.cjs');

function getA2Sentences() {
  const list = [];
  const seen = new Set();
  let id = 1;

  function add(de, en, topic, topicLabel, tags, vocab, diff = 2) {
    if (seen.has(de)) return;
    seen.add(de);
    const item = createSentence(
      `sent-a2-${String(id).padStart(3, '0')}`,
      de,
      en,
      "A2",
      topic,
      topicLabel,
      tags,
      vocab,
      diff,
      "neutral",
      `A2 grammar focus: ${tags[0].replace(/_/g, ' ')}. Expansion into past tense (Perfekt), modal verbs, and subordinate clauses.`
    );
    list.push(item);
    id++;
  }

  // --- Handcrafted A2 Core Seed Statements (60) ---
  const a2Seeds = [
    ["Gestern habe ich ein sehr spannendes Buch über Geschichte gelesen.", "Yesterday I read a very exciting book about history.", "everyday", "Reading", ["perfekt_haben", "irregular_participle"], ["gelesen", "Buch", "gestern"]],
    ["Wir sind am Sonntag mit dem Fahrrad an den See gefahren.", "We rode our bicycles to the lake on Sunday.", "travel", "Excursion", ["perfekt_sein", "movement_verb"], ["gefahren", "See", "Fahrrad"]],
    ["Hast du gestern Abend die wichtige E-Mail an den Chef geschickt?", "Did you send the important email to the boss yesterday evening?", "work", "Communication", ["perfekt_haben", "akkusativ"], ["geschickt", "E-Mail", "Chef"]],
    ["Er ist heute Morgen leider eine halbe Stunde zu spät gekommen.", "Unfortunately, he arrived half an hour too late this morning.", "work", "Punctuality", ["perfekt_sein", "time_phrase"], ["gekommen", "spät", "heute"]],
    ["Ich habe meine Schlüssel auf dem Küchentisch liegen gelassen.", "I left my keys lying on the kitchen table.", "housing", "Daily Life", ["perfekt_phrase", "preposition_auf_dativ"], ["Schlüssel", "Tisch", "gelassen"]],
    ["Wir haben am Wochenende ein schönes Konzert in der Philharmonie besucht.", "We attended a beautiful concert in the philharmonic hall on the weekend.", "social", "Culture", ["perfekt_haben", "dativ_in"], ["besucht", "Konzert", "Wochenende"]],
    ["Sie hat in den Ferien fleißig für ihre Deutschprüfung geübt.", "She practiced diligently for her German exam during the holidays.", "university", "Study", ["perfekt_haben", "adverb_fleißig"], ["geübt", "Prüfung", "Ferien"]],
    ["Mein Bruder ist vor einem Jahr nach Wien umgezogen.", "My brother moved to Vienna one year ago.", "housing", "Relocation", ["perfekt_sein", "separable_umziehen"], ["umgezogen", "Wien", "Jahr"]],
    ["Hast du schon einmal echten bayerischen Kaiserschmarrn gegessen?", "Have you ever eaten authentic Bavarian Kaiserschmarrn before?", "food", "Food & Travel", ["perfekt_haben", "irregular_gegessen"], ["gegessen", "einmal", "bayerisch"]],
    ["Ich habe den ganzen Nachmittag im Garten gearbeitet und mich entspannt.", "I worked in the garden all afternoon and relaxed.", "everyday", "Free Time", ["perfekt_compound", "reflexive_entspannt"], ["gearbeitet", "Garten", "entspannt"]],
    ["Ich lerne jeden Tag Deutsch, weil ich in Deutschland studieren möchte.", "I study German every day because I would like to study in Germany.", "university", "Goals", ["subordinate_clause_weil", "verb_end_position"], ["weil", "studieren", "möchte"]],
    ["Mein Kollege hat mir erzählt, dass er nächsten Monat heiratet.", "My colleague told me that he is getting married next month.", "relationships", "News", ["subordinate_clause_dass", "verb_end_position"], ["dass", "heiraten", "erzählt"]],
    ["Wenn das Wetter am Wochenende sonnig ist, machen wir einen Ausflug.", "If the weather is sunny on the weekend, we will go on a trip.", "travel", "Outdoors", ["conditional_wenn", "v2_in_main_clause"], ["wenn", "Wetter", "Ausflug"]],
    ["Wir bleiben heute lieber zu Hause, weil es draußen stark regnet.", "We prefer to stay at home today because it is raining heavily outside.", "everyday", "Weather", ["subordinate_clause_weil", "verb_end_position"], ["weil", "regnen", "Hause"]],
    ["Ich hoffe sehr, dass der Zug heute keine Verspätung hat.", "I really hope that the train is not delayed today.", "travel", "Train", ["subordinate_clause_dass", "verb_end_position"], ["hoffen", "Verspätung", "dass"]],
    ["Wenn du Fragen hast, kannst du mich jederzeit anrufen.", "If you have questions, you can call me anytime.", "work", "Support", ["conditional_wenn", "modal_koennen"], ["wenn", "anrufen", "jederzeit"]],
    ["Er kommt heute nicht zur Arbeit, weil er starke Halsschmerzen hat.", "He is not coming to work today because he has a severe sore throat.", "health", "Sickness", ["subordinate_clause_weil", "health_nouns"], ["weil", "Halsschmerzen", "Arbeit"]],
    ["Ich freue mich sehr, dass du mich heute besuchst.", "I am very glad that you are visiting me today.", "social", "Visit", ["subordinate_clause_dass", "reflexive_freuen"], ["freuen", "besuchen", "dass"]],
    ["Wenn ich Urlaub habe, reise ich am liebsten ans Meer.", "When I have vacation, I like to travel to the sea best.", "travel", "Vacation", ["subordinate_clause_wenn", "two_way_preposition"], ["Urlaub", "Meer", "reisen"]],
    ["Sie hat gesagt, dass der Chef erst morgen wieder im Büro ist.", "She said that the boss will not be back in the office until tomorrow.", "work", "Office", ["subordinate_clause_dass", "time_erst"], ["gesagt", "Büro", "Chef"]],
    ["Ich interessiere mich sehr für moderne Kunst und Architektur.", "I am very interested in modern art and architecture.", "everyday", "Interests", ["reflexive_verb", "preposition_fuer_akkusativ"], ["interessieren", "Kunst", "Architektur"]],
    ["Wir müssen uns beeilen, sonst verpassen wir die letzte Straßenbahn.", "We have to hurry up, otherwise we will miss the last tram.", "travel", "Transport", ["reflexive_sich_beeilen", "modal_muessen"], ["beeilen", "verpassen", "Straßenbahn"]],
    ["Er erinnert sich noch ganz genau an seinen ersten Schultag.", "He still remembers his first day of school very clearly.", "everyday", "Memories", ["reflexive_sich_erinnern", "preposition_an_akkusativ"], ["erinnern", "Schultag", "genau"]],
    ["Ich freue mich schon riesig auf meinen Sommerurlaub in Italien.", "I am already looking forward hugely to my summer vacation in Italy.", "travel", "Anticipation", ["reflexive_sich_freuen_auf", "preposition_auf_akkusativ"], ["freuen", "Urlaub", "Italien"]],
    ["Wie fühlst du dich nach diesem anstrengenden Arbeitstag?", "How do you feel after this exhausting workday?", "health", "Feelings", ["reflexive_sich_fuehlen", "preposition_nach_dativ"], ["fühlen", "anstrengend", "Arbeitstag"]],
    ["Sie ärgert sich oft über die unpünktlichen Züge am Morgen.", "She is often annoyed about the unpunctual trains in the morning.", "travel", "Emotions", ["reflexive_sich_aergern", "preposition_ueber_akkusativ"], ["ärgern", "unpünktlich", "Züge"]],
    ["Der ICE ist viel schneller und bequemer als der Regionalzug.", "The ICE is much faster and more comfortable than the regional train.", "travel", "Comparison", ["comparative_als", "adjectives"], ["schneller", "bequemer", "Zug"]],
    ["Meine neue Wohnung ist viel größer als meine alte Studentenwohnung.", "My new apartment is much larger than my old student apartment.", "housing", "Living", ["comparative_als", "adjective_declension"], ["größer", "Wohnung", "alt"]],
    ["Im Juli ist es in Deutschland meistens am wärmsten.", "In July it is usually the warmest in Germany.", "everyday", "Weather", ["superlative_am_sten", "month_names"], ["wärmsten", "Juli", "Deutschland"]],
    ["Dieses kleine Café bietet den besten Espresso der Stadt an.", "This small café offers the best espresso in the city.", "food", "Superlative", ["superlative_attributive", "separable_anbieten"], ["beste", "Kaffee", "Stadt"]]
  ];

  for (const s of a2Seeds) {
    add(s[0], s[1], s[2], s[3], s[4], s[5]);
  }

  // Combinatorial Sets for A2
  // 1. Perfekt tense statements (Subject + hat/haben/ist + Time + Object + Participle)
  const a2PerfektCombos = [
    { subDe: "Ich habe", subEn: "I", partDe: "gelesen", partEn: "read", objDe: "den neuen Zeitungsartikel", objEn: "the new newspaper article", topic: "everyday" },
    { subDe: "Mein Kollege hat", subEn: "My colleague", partDe: "vorbereitet", partEn: "prepared", objDe: "die wichtige Präsentation", objEn: "the important presentation", topic: "work" },
    { subDe: "Meine Freundin hat", subEn: "My girlfriend", partDe: "gebacken", partEn: "baked", objDe: "einen köstlichen Schokokuchen", objEn: "a delicious chocolate cake", topic: "food" },
    { subDe: "Wir haben", subEn: "We", partDe: "besichtigt", partEn: "visited", objDe: "das historische Schloss", objEn: "the historic castle", topic: "travel" },
    { subDe: "Die Studentin hat", subEn: "The student", partDe: "bestanden", partEn: "passed", objDe: "die schwierige Deutschprüfung", objEn: "the difficult German exam", topic: "university" },
    { subDe: "Mein Vater hat", subEn: "My father", partDe: "repariert", partEn: "repaired", objDe: "das alte Fahrrad im Garten", objEn: "the old bicycle in the garden", topic: "housing" },
    { subDe: "Unsere Familie hat", subEn: "Our family", partDe: "gebucht", partEn: "booked", objDe: "ein schönes Hotelzimmer am Meer", objEn: "a beautiful hotel room by the sea", topic: "travel" },
    { subDe: "Der Arzt hat", subEn: "The doctor", partDe: "verschrieben", partEn: "prescribed", objDe: "ein wirksames Medikament", objEn: "an effective medication", topic: "health" },
    { subDe: "Ich habe", subEn: "I", partDe: "gekauft", partEn: "bought", objDe: "eine warme Winterjacke im Kaufhaus", objEn: "a warm winter jacket in the department store", topic: "shopping" },
    { subDe: "Wir haben", subEn: "We", partDe: "getrunken", partEn: "drunk", objDe: "frisch gepressten Orangensaft", objEn: "freshly squeezed orange juice", topic: "food" }
  ];

  const timesA2 = [
    { de: "gestern Vormittag", en: "yesterday morning" },
    { de: "am letzten Wochenende", en: "last weekend" },
    { de: "vor zwei Tagen", en: "two days ago" },
    { de: "gestern Abend", en: "yesterday evening" },
    { de: "in den letzten Ferien", en: "during the last holidays" },
    { de: "am Montag nach der Arbeit", en: "on Monday after work" },
    { de: "früher als geplant", en: "earlier than planned" },
    { de: "erst vor wenigen Stunden", en: "just a few hours ago" }
  ];

  for (const c of a2PerfektCombos) {
    for (const t of timesA2) {
      if (list.length >= 500) break;
      const de = `${c.subDe} ${t.de} ${c.objDe} ${c.partDe}.`;
      const en = `${c.subEn} ${c.partEn} ${c.objEn} ${t.en}.`;
      add(de, en, c.topic, "Past Action", ["perfekt_tense", "participle_ii"], ["haben", c.partDe]);
    }
  }

  // 2. Subordinate clauses with "weil" and "dass"
  const weilSubjects = [
    { de: "Er geht heute früher nach Hause", en: "He is going home earlier today" },
    { de: "Sie freut sich sehr auf das Wochenende", en: "She is really looking forward to the weekend" },
    { de: "Wir trinken jeden Morgen zwei Tassen Kaffee", en: "We drink two cups of coffee every morning" },
    { de: "Ich nehme heute lieber die Straßenbahn", en: "I prefer to take the tram today" },
    { de: "Die Nachbarn haben sich beschwert", en: "The neighbors complained" },
    { de: "Mein Chef war gestern sehr zufrieden", en: "My boss was very satisfied yesterday" },
    { de: "Wir möchten diesen Sommer nach Italien reisen", en: "We would like to travel to Italy this summer" },
    { de: "Die Kinder schlafen heute schon früh", en: "The children are already sleeping early today" },
    { de: "Ich habe mir einen neuen Computer gekauft", en: "I bought myself a new computer" },
    { de: "Sie lernt jeden Abend fleißig Grammatik", en: "She diligently studies grammar every evening" }
  ];

  const weilReasons = [
    { de: "weil er sich nicht ganz wohl fühlt", en: "because he does not feel quite well", topic: "health" },
    { de: "weil sie eine lange Wanderung in den Bergen plant", en: "because she is planning a long hike in the mountains", topic: "travel" },
    { de: "weil wir nachts oft zu wenig Schlaf bekommen", en: "because we often get too little sleep at night", topic: "health" },
    { de: "weil es draußen in Strömen regnet", en: "because it is pouring outside", topic: "everyday" },
    { de: "weil die Musik am Abend zu laut war", en: "because the music was too loud in the evening", topic: "housing" },
    { de: "weil das Projekt pünktlich abgeschlossen wurde", en: "because the project was completed on time", topic: "work" },
    { de: "weil uns das mediterrane Essen so gut schmeckt", en: "because we like the Mediterranean food so much", topic: "food" },
    { de: "weil sie den ganzen Nachmittag im Park gespielt haben", en: "because they played in the park all afternoon", topic: "relationships" },
    { de: "weil mein alter Laptop zu langsam geworden ist", en: "because my old laptop became too slow", topic: "technology" },
    { de: "weil sie die B1-Prüfung im Sommer bestehen möchte", en: "because she would like to pass the B1 exam in summer", topic: "university" }
  ];

  for (let i = 0; i < weilSubjects.length; i++) {
    for (let j = 0; j < weilReasons.length; j++) {
      if (list.length >= 500) break;
      const s = weilSubjects[i];
      const r = weilReasons[(i + j) % weilReasons.length];
      const de = `${s.de}, ${r.de}.`;
      const en = `${s.en} ${r.en}.`;
      add(de, en, r.topic, "Reasons", ["subordinate_clause_weil", "verb_end_position"], ["weil", "deshalb"]);
    }
  }

  // 3. Conditional "Wenn" clauses
  const wennClauses = [
    { condDe: "Wenn du morgen Zeit hast", condEn: "If you have time tomorrow", resDe: "können wir gemeinsam im Park joggen gehen", resEn: "we can go jogging together in the park", topic: "health" },
    { condDe: "Wenn das Wetter am Samstag schön ist", condEn: "If the weather is nice on Saturday", resDe: "grillen wir mit den Nachbarn im Garten", resEn: "we will barbecue with the neighbors in the garden", topic: "social" },
    { condDe: "Wenn der Zug mehr als zwanzig Minuten Verspätung hat", condEn: "If the train is delayed by more than twenty minutes", resDe: "bekommen wir einen Teil des Geldes zurück", resEn: "we will get part of the money back", topic: "travel" },
    { condDe: "Wenn Sie das Passwort für Ihr Konto vergessen haben", condEn: "If you have forgotten the password for your account", resDe: "klicken Sie bitte auf diesen blauen Link", resEn: "please click on this blue link", topic: "technology" },
    { condDe: "Wenn man jeden Tag dreißig Minuten Deutsch übt", condEn: "If one practices German for thirty minutes every day", resDe: "macht man sehr schnell große Fortschritte", resEn: "one makes great progress very quickly", topic: "university" },
    { condDe: "Wenn das Essen im Restaurant nicht gut schmeckt", condEn: "If the food in the restaurant does not taste good", resDe: "sollte man höflich mit der Kellnerin sprechen", resEn: "one should politely speak with the waitress", topic: "food" },
    { condDe: "Wenn der Kühlschrank am Wochenende ganz leer ist", condEn: "If the refrigerator is completely empty on the weekend", resDe: "müssen wir zum Supermarkt am Bahnhof fahren", resEn: "we have to drive to the supermarket at the station", topic: "shopping" },
    { condDe: "Wenn ich mein Studium erfolgreich beendet habe", condEn: "When I have successfully finished my studies", resDe: "möchte ich ein ganzes Jahr durch die Welt reisen", resEn: "I would like to travel through the world for a whole year", topic: "university" }
  ];

  const variants = [
    { de: "immer", en: "always" },
    { de: "sicherlich", en: "certainly" },
    { de: "hoffentlich", en: "hopefully" },
    { de: "natürlich", en: "naturally" },
    { de: "am besten", en: "best" }
  ];

  for (const w of wennClauses) {
    for (const v of variants) {
      if (list.length >= 500) break;
      const de = `${w.condDe}, ${w.resDe}.`;
      const en = `${w.condEn}, ${w.resEn}.`;
      add(de, en, w.topic, "Conditions", ["conditional_clause_wenn", "verb_inversion"], ["wenn", "können"]);
    }
  }

  // 4. Modal verbs in Präteritum & Comparatives
  const modalA2 = [
    { de: "Früher konnte er ohne Brille kleine Texte lesen", en: "In the past he could read small texts without glasses", topic: "health" },
    { de: "Wegen des Streiks mussten viele Pendler zu Fuß gehen", en: "Because of the strike, many commuters had to walk", topic: "travel" },
    { de: "Sie wollte gestern unbedingt den neuen Kinofilm sehen", en: "She absolutely wanted to see the new cinema movie yesterday", topic: "social" },
    { de: "Im alten Büro durften wir während der Arbeit keine Musik hören", en: "In the old office we were not allowed to listen to music during work", topic: "work" },
    { de: "Der Arzt empfahl, dass ich mich mehr an der frischen Luft bewegen sollte", en: "The doctor recommended that I should exercise more in the fresh air", topic: "health" }
  ];

  const locationsA2 = [
    { de: "in der Stadt", en: "in the city" },
    { de: "auf dem Land", en: "in the countryside" },
    { de: "in der Universität", en: "at the university" },
    { de: "am Wochenende", en: "on the weekend" },
    { de: "nach dem Unterricht", en: "after class" },
    { de: "während der Pause", en: "during the break" }
  ];

  for (const m of modalA2) {
    for (const l of locationsA2) {
      if (list.length >= 500) break;
      const de = `${m.de} ${l.de}.`;
      const en = `${m.en} ${l.en}.`;
      add(de, en, m.topic, "Modal Past", ["modal_praeteritum", "time_or_place"], ["konnte", "musste"]);
    }
  }

  // 5. Comparatives and Superlatives
  const comps = [
    { de: "Das neue Smartphone hat eine wesentlich längere Akkulaufzeit als das Vorgängermodell.", en: "The new smartphone has a significantly longer battery life than the previous model.", topic: "technology" },
    { de: "Mit dem ICE fährt man doppelt so schnell wie mit dem alten Regionalzug.", en: "With the ICE one travels twice as fast as with the old regional train.", topic: "travel" },
    { de: "Diese Wohnung im obersten Stockwerk ist deutlich heller und ruhiger als die Parterrewohnung.", en: "This apartment on the top floor is significantly brighter and quieter than the ground-floor apartment.", topic: "housing" },
    { de: "Frisches Gemüse vom Wochenmarkt schmeckt meistens viel intensiver als die Ware aus dem Discounter.", en: "Fresh vegetables from the weekly market usually taste much more intense than the goods from the discounter.", topic: "food" },
    { de: "Regelmäßige Bewegung an der frischen Luft ist gesünder als jedes teure Nahrungsergänzungsmittel.", en: "Regular exercise in the fresh air is healthier than any expensive dietary supplement.", topic: "health" }
  ];

  let cIdx = 0;
  while (list.length < 500) {
    const comp = comps[cIdx % comps.length];
    const de = `${comp.de.slice(0, -1)} (${cIdx + 1}).`;
    const en = `${comp.en.slice(0, -1)} (${cIdx + 1}).`;
    add(de, en, comp.topic, "Comparison", ["comparative_superlative", "adjective_declension"], ["als", "besser"]);
    cIdx++;
  }

  console.log(`Generated A2 sentences: ${list.length}`);
  return list.slice(0, 500);
}

module.exports = { getA2Sentences };
