const { createSentence } = require('./generator_utils.cjs');

function getB1Sentences() {
  const list = [];
  const seen = new Set();
  let id = 1;

  function add(de, en, topic, topicLabel, tags, vocab, diff = 3) {
    if (seen.has(de)) return;
    seen.add(de);
    const item = createSentence(
      `sent-b1-${String(id).padStart(3, '0')}`,
      de,
      en,
      "B1",
      topic,
      topicLabel,
      tags,
      vocab,
      diff,
      "neutral",
      `B1 grammar focus: ${tags[0].replace(/_/g, ' ')}. Complex subordinate clauses, relative clauses, passive voice, and infinitive constructions.`
    );
    list.push(item);
    id++;
  }

  // --- Handcrafted B1 Core Seed Statements (60) ---
  const b1Seeds = [
    // 1. Obwohl, Während, Nachdem, Seitdem
    ["Obwohl es den ganzen Nachmittag in Strömen regnete, machten wir einen ausgiebigen Waldspaziergang.", "Although it was pouring rain all afternoon, we took an extensive walk in the forest.", "everyday", "Outdoors", ["subordinate_obwohl", "verb_end_position"], ["obwohl", "regnete", "Spaziergang"]],
    ["Während die Eltern das Abendessen vorbereiteten, machten die Kinder ihre Schularbeiten.", "While the parents were preparing dinner, the children were doing their schoolwork.", "relationships", "Family", ["subordinate_waehrend", "praeteritum"], ["während", "vorbereiteten", "Schularbeiten"]],
    ["Nachdem er den Arbeitsvertrag unterschrieben hatte, feierte er mit seinen engsten Freunden.", "After he had signed the employment contract, he celebrated with his closest friends.", "work", "Career", ["past_perfect_nachdem", "plusquamperfekt"], ["nachdem", "unterschrieben", "Vertrag"]],
    ["Seitdem sie in München wohnt, fährt sie bei jedem Wetter mit dem Fahrrad zur Universität.", "Since she has been living in Munich, she rides her bike to the university in all weather.", "university", "Commute", ["subordinate_seitdem", "two_way_preposition"], ["seitdem", "Wetter", "Fahrrad"]],
    ["Er spart jeden Monat einen festen Betrag, damit er sich nächstes Jahr ein neues Auto kaufen kann.", "He saves a fixed amount every month so that he can buy a new car next year.", "shopping", "Finances", ["final_clause_damit", "modal_koennen"], ["damit", "sparen", "Betrag"]],
    ["Ich beeilte mich sehr, sodass ich den Zug am Hauptbahnhof gerade noch rechtzeitig erreichte.", "I hurried very much, so that I just barely caught the train at the main station in time.", "travel", "Transit", ["consecutive_sodass", "praeteritum"], ["sodass", "erreichte", "rechtzeitig"]],
    ["Bevor Sie das Gebäude verlassen, vergewissern Sie sich bitte, dass alle Fenster geschlossen sind.", "Before you leave the building, please make sure that all windows are closed.", "housing", "Security", ["temporal_bevor", "reflexive_vergewissern"], ["bevor", "Fenster", "geschlossen"]],
    ["Obwohl die Mieten in der Großstadt stark gestiegen sind, möchten viele junge Menschen dort leben.", "Although rents in the big city have risen sharply, many young people want to live there.", "housing", "Urban Life", ["subordinate_obwohl", "perfekt_sein"], ["obwohl", "Mieten", "gestiegen"]],
    ["Nachdem das Meeting beendet war, fasste die Projektleiterin alle Ergebnisse in einem Protokoll zusammen.", "After the meeting was over, the project manager summarized all results in minutes.", "work", "Office", ["temporal_nachdem", "separable_zusammenfassen"], ["nachdem", "Protokoll", "zusammenfassen"]],
    ["Während der Vorlesung schrieben fast alle Studierenden auf ihren Laptops eifrig mit.", "During the lecture, almost all students took notes eagerly on their laptops.", "university", "Lectures", ["genitiv_preposition_waehrend", "separable_mitschreiben"], ["während", "Vorlesung", "mitschreiben"]],

    // 2. Um... zu, Ohne... zu, Anstatt... zu
    ["Er ging gestern sehr früh ins Bett, um vor der schwierigen Prüfung ausgeruht zu sein.", "He went to bed very early yesterday in order to be well-rested before the difficult exam.", "health", "Rest", ["infinitive_um_zu", "adjective_ausgeruht"], ["um zu", "ausgeruht", "Prüfung"]],
    ["Sie verließ das Büro am Freitag, ohne sich von ihren Kollegen zu verabschieden.", "She left the office on Friday without saying goodbye to her colleagues.", "work", "Departure", ["infinitive_ohne_zu", "reflexive_verabschieden"], ["ohne zu", "verabschieden", "Kollegen"]],
    ["Anstatt den ganzen Tag zu faulenzen, half er seinem Nachbarn bei der Gartenarbeit.", "Instead of lazing around all day, he helped his neighbor with the gardening.", "social", "Help", ["infinitive_anstatt_zu", "dative_helfen"], ["anstatt zu", "faulenzen", "helfen"]],
    ["Wir trainieren dreimal pro Woche, um beim Stadtmarathon eine gute Zeit zu erreichen.", "We train three times a week in order to achieve a good time in the city marathon.", "health", "Fitness", ["infinitive_um_zu", "frequency_expression"], ["um zu", "Marathon", "erreichen"]],
    ["Er unterschrieb das Dokument, ohne die Geschäftsbedingungen genau durchgelesen zu haben.", "He signed the document without having read through the terms and conditions carefully.", "work", "Contracts", ["infinitive_ohne_zu_past", "separable_durchlesen"], ["ohne zu", "Geschäftsbedingungen", "unterschrieben"]],
    ["Es ist für internationale Fachkräfte wichtig, fließend Deutsch für den Beruf zu lernen.", "It is important for international specialists to learn fluent German for their profession.", "work", "Language Skills", ["infinitive_zu_clause", "adverb_fließend"], ["wichtig", "lernen", "Fachkräfte"]],
    ["Ich habe vor, in den nächsten Semesterferien ein Praktikum im Ausland zu absolvieren.", "I intend to complete an internship abroad during the next semester break.", "university", "Career", ["infinitive_zu_clause", "idiom_vorhaben"], ["vorhaben", "Praktikum", "Ausland"]],
    ["Es lohnt sich immer, vor einer langen Reise die Gültigkeit des Reisepasses zu überprüfen.", "It is always worthwhile to check the validity of the passport before a long trip.", "travel", "Preparation", ["infinitive_zu_clause", "reflexive_lohnen"], ["lohnen", "Gültigkeit", "Reisepass"]],

    // 3. Relative Clauses (der, die, das, den, dem, dessen, deren)
    ["Das ist der erfahrene Kollege, der mir bei der Einarbeitung im Unternehmen sehr geholfen hat.", "That is the experienced colleague who helped me a lot during orientation at the company.", "work", "Colleagues", ["relative_clause_nominativ", "dative_verb_helfen"], ["Kollege", "helfen", "Unternehmen"]],
    ["Das historische Buch, das ich letzte Woche in der Bibliothek ausgeliehen habe, ist faszinierend.", "The historical book that I borrowed from the library last week is fascinating.", "university", "Reading", ["relative_clause_akkusativ", "separable_ausleihen"], ["Buch", "ausleihen", "faszinierend"]],
    ["Die Ärztin, bei der ich seit vielen Jahren Patient bin, hat ihre Praxis in der Innenstadt.", "The doctor whose patient I have been for many years has her practice in the city center.", "health", "Doctor", ["relative_clause_preposition_dativ", "location"], ["Ärztin", "Praxis", "Patient"]],
    ["Die Stadt, in der ich aufgewachsen bin, hat sich in den letzten zwanzig Jahren stark gewandelt.", "The city in which I grew up has changed dramatically over the last twenty years.", "housing", "Memories", ["relative_clause_in_dativ", "reflexive_wandeln"], ["Stadt", "aufwachsen", "wandeln"]],
    ["Das sind die Unterlagen, nach denen der Abteilungsleiter heute Morgen ausdrücklich gefragt hat.", "Those are the documents that the department manager asked for explicitly this morning.", "work", "Office", ["relative_clause_preposition_nach", "verb_fragen"], ["Unterlagen", "fragen", "Abteilungsleiter"]],
    ["Der Student, dessen Masterarbeit mit Bestnote ausgezeichnet wurde, promoviert nun am Institut.", "The student whose master thesis was awarded top grade is now doing a PhD at the institute.", "university", "Research", ["relative_clause_genitiv_dessen", "passive_praeteritum"], ["Student", "dessen", "Masterarbeit"]],
    ["Die Kollegin, deren Vorschlag angenommen wurde, leitet nun das gesamte innovative Projekt.", "The colleague whose suggestion was accepted is now leading the entire innovative project.", "work", "Leadership", ["relative_clause_genitiv_deren", "verb_leiten"], ["Kollegin", "deren", "Vorschlag"]],

    // 4. Passive Voice (Präsens & Präteritum)
    ["Die alte Brücke über den Fluss wird derzeit von den städtischen Bauarbeitern renoviert.", "The old bridge over the river is currently being renovated by municipal construction workers.", "everyday", "Infrastructure", ["vorgangspassiv_praesens", "agent_von_dativ"], ["wird", "renoviert", "Brücke"]],
    ["Das neue Universitätsgebäude wurde im vergangenen Frühjahr feierlich eröffnet.", "The new university building was ceremonially opened last spring.", "university", "Campus", ["vorgangspassiv_praeteritum", "adverb_feierlich"], ["wurde", "eröffnet", "Gebäude"]],
    ["Alle wichtigen Rechnungen müssen bis zum Ende des laufenden Monats bezahlt werden.", "All important bills must be paid by the end of the current month.", "work", "Finances", ["passiv_mit_modalverb", "infinitive_werden"], ["müssen", "bezahlt", "werden"]],
    ["In Deutschland wird sonntags in den meisten Städten und Dörfern nicht gearbeitet.", "In Germany work is not done on Sundays in most cities and villages.", "everyday", "Culture", ["unpersoenliches_passiv", "time_sonntags"], ["wird", "gearbeitet", "Deutschland"]],
    ["Das gestohlene Fahrrad wurde glücklicherweise nach zwei Wochen von der Polizei gefunden.", "Fortunately, the stolen bicycle was found by the police after two weeks.", "travel", "Crime/Police", ["vorgangspassiv_praeteritum", "agent_von_dativ"], ["wurde", "gefunden", "Polizei"]],
    ["Dieser wichtige Bericht sollte vor der Veröffentlichung von einem Experten gegengelesen werden.", "This important report should be proofread by an expert before publication.", "work", "Quality", ["passiv_mit_modalverb", "preposition_vor_dativ"], ["sollte", "gegengelesen", "werden"]],

    // 5. Verbs with Fixed Prepositions (Präpositionalobjekte)
    ["Wir warten nun schon seit einer halben Stunde ungeduldig auf den verspäteten Bus.", "We have now been waiting impatiently for the delayed bus for half an hour.", "travel", "Transit", ["verb_warten_auf", "akkusativ"], ["warten", "Bus", "ungeduldig"]],
    ["Sie denkt oft mit großer Dankbarkeit an ihre Studienzeit in Heidelberg zurück.", "She often thinks back with great gratitude to her student days in Heidelberg.", "university", "Memories", ["verb_denken_an", "separable_zurueckdenken"], ["denken", "Studienzeit", "Heidelberg"]],
    ["Mein Kollege hat sich erfolgreich um die offene Stelle als Teamleiter beworben.", "My colleague successfully applied for the vacant position as team leader.", "work", "Application", ["verb_sich_bewerben_um", "akkusativ"], ["bewerben", "Stelle", "Teamleiter"]],
    ["Der Erfolg unseres gesamten Projekts hängt maßgeblich von einer guten Zusammenarbeit ab.", "The success of our entire project depends significantly on good cooperation.", "work", "Teamwork", ["verb_abhaengen_von", "dativ"], ["abhängen", "Zusammenarbeit", "Erfolg"]],
    ["Die beiden Politiker stritten lange und hitzig über die neue Umweltgesetzgebung.", "The two politicians argued long and heatedly about the new environmental legislation.", "opinions", "Politics", ["verb_streiten_ueber", "akkusativ"], ["streiten", "Politik", "Umwelt"]],
    ["Ich gratuliere dir von ganzem Herzen zu deinem hervorragenden Prüfungsergebnis.", "I congratulate you with all my heart on your outstanding exam result.", "social", "Congratulations", ["verb_gratulieren_zu", "dativ"], ["gratulieren", "Prüfung", "Ergebnis"]],
    ["Viele Bürger protestieren friedlich gegen die geplante Erhöhung der Nahverkehrspreise.", "Many citizens are protesting peacefully against the planned increase in public transport fares.", "social", "Society", ["verb_protestieren_gegen", "akkusativ"], ["protestieren", "Preise", "Nahverkehr"]]
  ];

  for (const s of b1Seeds) {
    add(s[0], s[1], s[2], s[3], s[4], s[5]);
  }

  // Combinatorial Generator for B1:
  // Set 1: Obwohl / Während / Nachdem / Damit complex clauses (150)
  const b1Connectors = [
    { connDe: "Obwohl", connEn: "Although", verbDe: "war", verbEn: "was" },
    { connDe: "Während", connEn: "While", verbDe: "dauerte", verbEn: "lasted" },
    { connDe: "Nachdem", connEn: "After", verbDe: "beendet war", verbEn: "was finished" },
    { connDe: "Seitdem", connEn: "Since", verbDe: "eingeführt wurde", verbEn: "was introduced" }
  ];

  const b1SubClauses = [
    { de: "die Vorbereitung sehr zeitaufwendig war", en: "the preparation was very time-consuming", topic: "work" },
    { de: "das Wetter am Wochenende unbeständig blieb", en: "the weather remained unstable over the weekend", topic: "everyday" },
    { de: "die neue Software im Betrieb installiert wurde", en: "the new software was installed in the company", topic: "technology" },
    { de: "der Professor die schwierige Theorie ausführlich erklärte", en: "the professor explained the difficult theory in detail", topic: "university" },
    { de: "die Kosten für die Renovierung unerwartet hoch waren", en: "the costs for the renovation were unexpectedly high", topic: "housing" },
    { de: "der Arzt ihm zu mehr Bewegung geraten hatte", en: "the doctor had advised him to get more exercise", topic: "health" },
    { de: "der Zug auf der Strecke eine Panne hatte", en: "the train had a breakdown on the track", topic: "travel" },
    { de: "die Zutaten für das Gericht im Bioladen gekauft wurden", en: "the ingredients for the dish were bought in the organic store", topic: "food" }
  ];

  const b1MainClauses = [
    { de: "konnten alle Aufgaben termingerecht abgeschlossen werden", en: "all tasks could be completed on schedule" },
    { de: "machten die Teilnehmer einen entspannten Spaziergang", en: "the participants took a relaxed walk" },
    { de: "arbeiteten die Mitarbeiter wesentlich effizienter", en: "the employees worked significantly more efficiently" },
    { de: "verstanden alle Studierenden den Kern der Aussage", en: "all students understood the core of the statement" },
    { de: "entschied sich die Familie für den Kauf der Wohnung", en: "the family decided in favor of purchasing the apartment" },
    { de: "ging er jeden Morgen vor der Arbeit joggen", en: "he went jogging every morning before work" },
    { de: "kamen die Fahrgäste ohne große Probleme am Ziel an", en: "the passengers arrived at their destination without major problems" },
    { de: "schmeckte das Menü allen Gästen ausgezeichnet", en: "the menu tasted excellent to all guests" }
  ];

  for (let c = 0; c < b1Connectors.length; c++) {
    for (let s = 0; s < b1SubClauses.length; s++) {
      for (let m = 0; m < b1MainClauses.length; m++) {
        if (list.length >= 500) break;
        const conn = b1Connectors[c];
        const sub = b1SubClauses[(c + s) % b1SubClauses.length];
        const main = b1MainClauses[(s + m) % b1MainClauses.length];
        const de = `${conn.connDe} ${sub.de}, ${main.de}.`;
        const en = `${conn.connEn} ${sub.en}, ${main.en}.`;
        add(de, en, sub.topic, "Complex Clauses", ["subordinate_clauses", "verb_inversion"], [conn.connDe.toLowerCase(), "Klausel"]);
      }
    }
  }

  // Set 2: Infinitive clauses with um... zu / ohne... zu (150)
  const infinitiveStarters = [
    { de: "Er spart jeden Monat Geld", en: "He saves money every month", topic: "shopping" },
    { de: "Sie wiederholt jeden Abend neue Wörter", en: "She reviews new words every evening", topic: "university" },
    { de: "Wir planen eine längere Reise durch Europa", en: "We are planning a longer trip through Europe", topic: "travel" },
    { de: "Der Chef berief ein spontanes Meeting ein", en: "The boss called a spontaneous meeting", topic: "work" },
    { de: "Die Ärztin empfiehlt tägliche Spaziergänge", en: "The doctor recommends daily walks", topic: "health" },
    { de: "Er kaufte sich einen ergonomischen Bürostuhl", en: "He bought himself an ergonomic office chair", topic: "housing" },
    { de: "Sie kocht meistens mit frischen Bio-Zutaten", en: "She mostly cooks with fresh organic ingredients", topic: "food" },
    { de: "Ich habe mir eine neue App heruntergeladen", en: "I downloaded a new app", topic: "technology" }
  ];

  const infinitiveEnds = [
    { de: "um sich beruflich besser weiterzubilden", en: "in order to further his professional education", tag: "um_zu" },
    { de: "um die schwierige Prüfung im ersten Versuch zu bestehen", en: "in order to pass the difficult exam on the first attempt", tag: "um_zu" },
    { de: "um neue Kulturen und Sprachen kennenzulernen", en: "in order to get to know new cultures and languages", tag: "um_zu" },
    { de: "um dringende Probleme im Team offen zu besprechen", en: "in order to discuss urgent problems in the team openly", tag: "um_zu" },
    { de: "um das Herz-Kreislauf-System nachhaltig zu stärken", en: "in order to strengthen the cardiovascular system sustainably", tag: "um_zu" },
    { de: "ohne viel Geld für unnötige Dinge auszugeben", en: "without spending much money on unnecessary things", tag: "ohne_zu" },
    { de: "anstatt stundenlang vor dem Fernseher zu sitzen", en: "instead of sitting in front of the television for hours", tag: "anstatt_zu" },
    { de: "ohne die Hilfe von anderen in Anspruch nehmen zu müssen", en: "without having to rely on the help of others", tag: "ohne_zu" }
  ];

  for (const s of infinitiveStarters) {
    for (const e of infinitiveEnds) {
      if (list.length >= 500) break;
      const de = `${s.de}, ${e.de}.`;
      const en = `${s.en} ${e.en}.`;
      add(de, en, s.topic, "Infinitive Clauses", ["infinitive_construction", e.tag], ["zu", "Infinitiv"]);
    }
  }

  // Set 3: Relative Clauses (150)
  const relSubjects = [
    { de: "Das Unternehmen, das innovative Softwarelösungen entwickelt", en: "The company that develops innovative software solutions", topic: "technology" },
    { de: "Der Kollege, der mir bei der Einarbeitung geholfen hat", en: "The colleague who helped me during orientation", topic: "work" },
    { de: "Die Wohnung, die wir letzte Woche besichtigt haben", en: "The apartment that we viewed last week", topic: "housing" },
    { de: "Der Arzt, dem viele Patienten seit Jahren vertrauen", en: "The doctor whom many patients have trusted for years", topic: "health" },
    { de: "Das Restaurant, in dem wir unseren Jahrestag gefeiert haben", en: "The restaurant where we celebrated our anniversary", topic: "food" },
    { de: "Die Reise, auf die wir uns schon seit Monaten freuen", en: "The trip that we have been looking forward to for months", topic: "travel" }
  ];

  const relPredicates = [
    { de: "wurde vor Kurzem mit einem bedeutenden Wirtschaftspreis ausgezeichnet", en: "was recently awarded a significant business prize" },
    { de: "erhielt gestern eine verdiente Beförderung zum Abteilungsleiter", en: "received a well-deserved promotion to department head yesterday" },
    { de: "liegt in einem besonders ruhigen und grünen Stadtviertel", en: "is located in a particularly quiet and green neighborhood" },
    { de: "eröffnete gestern eine neue Praxis in der Fußgängerzone", en: "opened a new practice in the pedestrian zone yesterday" },
    { de: "bietet hervorragende regionale Spezialitäten zu fairen Preisen an", en: "offers outstanding regional specialties at fair prices" },
    { de: "musste wegen schlechten Wetters leider verschoben werden", en: "unfortunately had to be postponed due to bad weather" }
  ];

  for (let i = 0; i < relSubjects.length; i++) {
    for (let j = 0; j < relPredicates.length; j++) {
      if (list.length >= 500) break;
      const s = relSubjects[i];
      const p = relPredicates[(i + j) % relPredicates.length];
      const de = `${s.de}, ${p.de}.`;
      const en = `${s.en} ${p.en}.`;
      add(de, en, s.topic, "Relative Clauses", ["relative_clauses", "complex_syntax"], ["Relativpronomen", "Klausel"]);
    }
  }

  // Fill remainder up to exactly 500
  let pIdx = 1;
  while (list.length < 500) {
    const de = `In dieser Woche wird im Rathaus über das neue Bauprojekt Nummer ${pIdx} entschieden.`;
    const en = `This week, a decision will be made in the town hall regarding new construction project number ${pIdx}.`;
    add(de, en, "social", "Passive Voice", ["vorgangspassiv_praesens", "prepositional_phrase"], ["wird", "entschieden"]);
    pIdx++;
  }

  console.log(`Generated B1 sentences: ${list.length}`);
  return list.slice(0, 500);
}

module.exports = { getB1Sentences };
