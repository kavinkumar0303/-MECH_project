// Workshop AI RAG & Multi-Lingual Knowledge Engine
// Grounded strictly in Mechanical_Department_AI_Training_QA.pdf and mechanical_dataset.json

import pdfQA from '../data/mechanical_pdf_qa.json';
import jsonQA from '../../mechanical_dataset.json';

/**
 * Detects whether the query is written in Tamil script, Tanglish, or English.
 * @param {string} text 
 * @returns {'tamil' | 'tanglish' | 'english'}
 */
export function detectLanguage(text) {
  if (!text || typeof text !== 'string') return 'english';

  const cleanText = text.trim();

  // 1. Check for Tamil Unicode characters (\u0B80 - \u0BFF)
  if (/[\u0B80-\u0BFF]/.test(cleanText)) {
    return 'tamil';
  }

  // 2. Tanglish markers & common phonetic words
  const lower = cleanText.toLowerCase();

  const tanglishWordPatterns = [
    // Question words & particles
    /\b(enna|edhu|engu|enga|epdi|eppadi|yaar|yen|edhukku|ethukku|ethuku|epadi|en)\b/i,
    /\b(na|la|oda|ku|kku|dhaana|thaana|aachu|achu|nu|dhan|than)\b/i,
    // Verbs & Action words
    /\b(panra|panradhu|panrathu|panna|pannanum|pannum|pannunga|panuvom|panrom)\b/i,
    /\b(solla|solunga|solu|solli|seiyanum|seiradhu|seivom)\b/i,
    // State / Condition
    /\b(irukku|irukkum|irundha|iruntha|varum|kudukkum|theriyuma|theriyum|theriyala|puriyala|puriyum)\b/i,
    // Topic & descriptors
    /\b(paththi|patri|patriya|konjam|romba|mukkiyam|mukiyama)\b/i,
    // Negations & qualifiers
    /\b(illa|illai|illana|matum|mattum|kooda)\b/i,
    // Hyphenated suffix
    /\b[a-z0-9]+-(la|le|oda|ah|ku|kku|dhan|than)\b/i,
    // Attached Tanglish noun suffix
    /\b(lathe|planer|shaper|welding|milling|machine|tool|workpiece|spindle|chuck|tailstock|table|cutter|part)(la|le|oda|kku|ah)\b/i
  ];

  for (const pattern of tanglishWordPatterns) {
    if (pattern.test(lower)) {
      return 'tanglish';
    }
  }

  return 'english';
}

const STOP_WORDS = new Set([
  'what', 'is', 'the', 'of', 'in', 'a', 'an', 'to', 'for', 'and', 'or', 'why', 'how', 'does', 
  'na', 'la', 'le', 'oda', 'ku', 'kku', 'enna', 'epdi', 'was', 'were', 'who', 'whom', 'which',
  'where', 'when', 'are', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'did', 'doing',
  'can', 'could', 'should', 'would', 'may', 'might', 'must', 'by', 'at', 'from', 'with', 'about'
]);

/**
 * Normalizes query string for keyword extraction & retrieval scoring
 */
function cleanTokens(str) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\u0B80-\u0BFF\s]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length > 1 && !STOP_WORDS.has(t));
}

/**
 * Unified Knowledge Base index compiled from PDF Q&A (97 items) and JSON dataset (10 items)
 */
const UNIFIED_KNOWLEDGE = [
  // 1. PDF Q&A Items (97 items)
  ...pdfQA.map(item => ({
    id: item.id,
    source: 'pdf',
    topic: item.section,
    question: item.question,
    answer: item.answer,
    keywords: item.keywords || []
  })),

  // 2. Structured JSON Dataset Items
  ...jsonQA.map((item, idx) => ({
    id: `json_${idx}`,
    source: 'json',
    topic: item.topic,
    subtopic: item.subtopic,
    question: item.question,
    answer: item.answer,
    keywords: [item.topic, item.subtopic, ...cleanTokens(item.question)]
  }))
];

/**
 * Curated multi-lingual translations for core grounding items
 * Keeps all technical mechanical engineering terms in English.
 */
const TRANSLATIONS = {
  // Lathe Operations
  "pdf_q1": {
    ta_latn: "Centre Lathe na workpiece rotate aagumbodhu cutting tool material-ah remove panni cylindrical and other surfaces produce panra machine tool.",
    ta: "Centre Lathe என்பது workpiece சுழலும் போது cutting tool உலோகத்தை அகற்றி cylindrical மற்றும் பிற மேற்பரப்புகளை உருவாக்கும் machine tool ஆகும்."
  },
  "pdf_q2": {
    ta_latn: "Facing na lathe machine-la workpiece-oda end surface-ah flat-ah machine panra operation.",
    ta: "Facing என்பது lathe machine-ல் workpiece-ன் முனைப்பகுதியில் ஒரு சமமான flat surface உருவாக்கும் operation."
  },
  "pdf_q3": {
    ta_latn: "Turning na rotating workpiece-oda axis வழியா cutting tool feed panni diameter-ah reduce panra operation.",
    ta: "Turning என்பது சுழலும் workpiece-ன் அச்சு வழியாக cutting tool செலுத்தி விட்டத்தை (diameter) குறைக்கும் operation ஆகும்."
  },
  "pdf_q4": {
    ta_latn: "Taper turning na workpiece length-la diameter uniformly change aagi conical surface create panra operation.",
    ta: "Taper turning என்பது workpiece நீளத்தில் விட்டம் சீராக மாறி கூம்பு வடிவ (conical) மேற்பரப்பை உருவாக்கும் முறையாகும்."
  },
  "pdf_q5": {
    ta_latn: "Boring na existing hole-ah single-point cutting tool use panni enlarge panna and accuracy improve panna seira operation.",
    ta: "Boring என்பது single-point cutting tool கொண்டு ஏற்கனவே உள்ள துளையை பெரிதாக்க அல்லது துல்லியமாக்க பயன்படும் operation ஆகும்."
  },
  "pdf_q6": {
    ta_latn: "Lathe-la drilling na tailstock-la drill bit hold panni pudhu cylindrical hole create panra operation.",
    ta: "Lathe-ல் drilling என்பது tailstock-ல் பொருத்தப்பட்ட drill bit மூலம் புதிய cylindrical hole உருவாக்கும் முறையாகும்."
  },
  "pdf_q7": {
    ta_latn: "Knurling na rotating workpiece mela hardened rollers press panni diamond patterned surface create panra forming operation.",
    ta: "Knurling என்பது சுழலும் workpiece மீது hardened rollers அழுத்தி பிடிமானமுள்ள patterned மேற்பரப்பை உருவாக்கும் forming operation ஆகும்."
  },
  "pdf_q8": {
    ta_latn: "Threading na workpiece-oda external illa internal surface-la helical thread cut panra operation.",
    ta: "Threading என்பது workpiece-ன் வெளி அல்லது உள் பகுதியில் helical thread உருவாக்கும் operation ஆகும்."
  },
  "pdf_q9": {
    ta_latn: "Chamfering na workpiece-oda sharp edge-ah remove panni small angled surface create panradhu.",
    ta: "Chamfering என்பது கூர்மையான விளிம்பை (sharp edge) நீக்கி ஒரு சிறிய சாய்வான (angled) மேற்பரப்பை உருவாக்கும் செயல் ஆகும்."
  },
  "pdf_q10": {
    ta_latn: "Parting-off na parent workpiece-la irundhu finished part-ah cut panni separate panra lathe operation.",
    ta: "Parting-off என்பது மூல workpiece-ல் இருந்து முடிக்கப்பட்ட பகுதியை வெட்டி எடுக்கும் lathe operation ஆகும்."
  },
  "pdf_q11": {
    ta_latn: "Contour turning na tool path-ah control panni workpiece-la curved illa irregular profile create panra operation.",
    ta: "Contour turning என்பது tool path-ஐ கட்டுப்படுத்தி வளைந்த அல்லது irregular profile உருவாக்கும் முறையாகும்."
  },
  "pdf_q12": {
    ta_latn: "Chuck-oda function na lathe spindle-la workpiece-ah securely hold panni rotate panradhu.",
    ta: "Chuck-ன் முக்கிய பணி lathe spindle-ல் workpiece-ஐ உறுதியாகப் பிடித்து சுழற்றுவதாகும்."
  },
  "pdf_q13": {
    ta_latn: "Tailstock-oda function na long workpieces-ku centre support tharadhukku and drills hold panradhukku use aagum.",
    ta: "Tailstock-ன் பணி நீளமான workpieces-க்கு மையம் வழியே ஆதரவளிப்பதும், drill கருவிகளைப் பிடிப்பதும் ஆகும்."
  },
  "pdf_q14": {
    ta_latn: "Cutting speed na cutting zone-la cutting edge-kum workpiece surface-kum naduvula irukkura relative speed.",
    ta: "Cutting speed என்பது cutting zone-ல் cutting edge மற்றும் workpiece மேற்பரப்புக்கு இடையே உள்ள relative speed ஆகும்."
  },
  "pdf_q15": {
    ta_latn: "Feed na specified amount of cutting-ku workpiece-ah poruthu cutting tool advance aagura distance.",
    ta: "Feed என்பது குறிப்பிட்ட வெட்டுதலுக்கு workpiece-ஐப் பொறுத்து cutting tool நகரும் தூரம் ஆகும்."
  },
  "pdf_q16": {
    ta_latn: "Depth of cut na single pass-la machined surface-ku perpendicular-ah remove aagura material thickness.",
    ta: "Depth of cut என்பது ஒரு pass-ல் செங்குத்தாக அகற்றப்படும் உலோகத்தின் தடிமன் (thickness) ஆகும்."
  },
  "pdf_q17": {
    ta_latn: "Machining-la coolant use panradhu heat remove panna, friction reduce panna, tool life improve panna and chips flush panna help pannum.",
    ta: "Coolant வெப்பத்தை தணிக்கவும், உராய்வை குறைக்கவும், tool ஆயுளை கூட்டவும், chips-களை வெளியேற்றவும் பயன்படுகிறது."
  },
  "pdf_q18": {
    ta_latn: "Cutting tool na workpiece-la irundhu material-ah remove panna use aagura cutting edge ulla hardened tool.",
    ta: "Cutting tool என்பது workpiece-ல் இருந்து உலோகத்தை அகற்ற உதவும் கூர்மையான முனை கொண்ட hardened கருவியாகும்."
  },
  "pdf_q19": {
    ta_latn: "Lathe centre na especially long components machining pannumbodhu workpiece-ah axis-la support panra component.",
    ta: "Lathe centre என்பது நீளமான பாகங்களை machine செய்யும்போது workpiece-ஐ அதன் அச்சில் தாங்கும் பகுதியாகும்."
  },
  "pdf_q20": {
    ta_latn: "Carriage-oda purpose na cutting tool-ah support panni lathe bed வழியா move panradhu.",
    ta: "Carriage-ன் நோக்கம் cutting tool-ஐ தாங்கி lathe bed மீது நகர்த்துவதாகும்."
  },

  // Arc Welding
  "pdf_q21": {
    ta_latn: "Arc welding na electric arc thara heat-ala joint area and filler electrode melt aagi join aagura fusion welding process.",
    ta: "Arc welding என்பது electric arc தரும் வெப்பத்தால் joint மற்றும் filler electrode உருகி இணையும் fusion welding முறையாகும்."
  },
  "pdf_q22": {
    ta_latn: "Electric arc na electrode and workpiece-ku naduvula intense heat generate panra sustained electrical discharge.",
    ta: "Electric arc என்பது electrode மற்றும் workpiece இடையே தீவிர வெப்பத்தை உருவாக்கும் மின் கசிவு (electrical discharge) ஆகும்."
  },
  "pdf_q23": {
    ta_latn: "Electrode na welding current-ah conduct panni joint-ku filler metal supply panra rod/wire.",
    ta: "Electrode என்பது welding current-ஐ கடத்தி joint-க்கு filler metal வழங்கும் கடத்தியாகும்."
  },
  "pdf_q24": {
    ta_latn: "SMAW (Shielded Metal Arc Welding) na flux-coated consumable electrode use panni weld create panra process.",
    ta: "SMAW (Shielded Metal Arc Welding) என்பது flux பூசப்பட்ட electrode மூலம் வெல்டிங் செய்யும் முறையாகும்."
  },
  "pdf_q25": {
    ta_latn: "Flux use panradhu molten weld pool-ah atmospheric contamination-la irundhu protect panni mela slag layer form panna help pannum.",
    ta: "Flux ஆனது உருகிய weld pool-ஐ காற்றில் உள்ள ஆக்சிஜனிடமிருந்து பாதுகாத்து slag உருவாக்குகிறது."
  },
  "pdf_q26": {
    ta_latn: "Weld bead na single welding pass-la deposit aagi solidify aana strip of weld metal.",
    ta: "Weld bead என்பது ஒரு welding pass-ல் படிந்து திடமான weld metal பட்டை ஆகும்."
  },
  "pdf_q27": {
    ta_latn: "Butt joint na ore plane-la edges meet aagura rendu pieces-ah weld panni join panradhu.",
    ta: "Butt joint என்பது ஒரே தளத்தில் விளிம்புகள் இணையும் இரு துண்டுகளை வெல்டிங் செய்து இணைப்பதாகும்."
  },
  "pdf_q28": {
    ta_latn: "Lap joint na overlap aagura rendu pieces-oda overlap region வழியா weld panni join panradhu.",
    ta: "Lap joint என்பது ஒன்றன் மேல் ஒன்று படியும் இரு துண்டுகளின் overlap பகுதியில் வெல்டிங் செய்வதாகும்."
  },
  "pdf_q29": {
    ta_latn: "Fillet weld na T, lap illa corner joint-la angle-la meet aagura rendu surfaces-ah join panra weld.",
    ta: "Fillet weld என்பது T, lap அல்லது corner joint-ல் கோணத்தில் இணையும் இரு தளங்களை இணைக்கும் வெல்டிங் ஆகும்."
  },
  "pdf_q30": {
    ta_latn: "Welding current na welding circuit-la flow aagura electrical current, idhu heat input and penetration-ah direct-ah determine pannum.",
    ta: "Welding current என்பது மின்சுற்றில் பாயும் current ஆகும், இது வெப்பம் மற்றும் penetration-ஐ நேரடியாக தீர்மானிக்கிறது."
  },
  "pdf_q31": {
    ta_latn: "Welding helmet kandippa podanum because idhu eyes and face-ah arc radiation, sparks and hot particles-la irundhu protect pannum.",
    ta: "Welding helmet கண்கள் மற்றும் முகத்தை தீவிர arc கதிர்வீச்சு, sparks மற்றும் வெப்ப துகள்களிலிருந்து பாதுகாக்கிறது."
  },
  "pdf_q32": {
    ta_latn: "Weld penetration na weld base material illa joint-kulla evlo depth extend aagudhu nu solra measurement.",
    ta: "Weld penetration என்பது weld ஆனது base material-க்குள் எவ்வளவு ஆழம் ஊடுருவியுள்ளது என்பதைக் குறிக்கிறது."
  },
  "pdf_q33": {
    ta_latn: "Porosity in welding na solidified weld metal-kulla gas cavities illa pores trap aagi holes form aagaradhu.",
    ta: "Porosity என்பது திடமான weld metal-க்குள் வாயு குமிழ்கள் (gas cavities) சிக்குவதால் ஏற்படும் குறைபாடாகும்."
  },
  "pdf_q34": {
    ta_latn: "Slag na welding apo flux-la irundhu form aagi weld cool aana apram remove panra non-metallic layer.",
    ta: "Slag என்பது வெல்டிங்கின் போது flux-ஆல் உருவாகி உறைந்த பின் அகற்றப்படும் non-metallic அடுக்கு ஆகும்."
  },
  "pdf_q35": {
    ta_latn: "Workpiece proper-ah ground pannanum because idhu safe electrical return path kuduthu stable welding operation maintain pannum.",
    ta: "பாதுகாப்பான மின்சுற்று திரும்பும் பாதை மற்றும் சீரான வெல்டிங் செயல்பாட்டிற்கு workpiece grounding அவசியம்."
  },

  // Shaping Machine
  "pdf_q36": {
    ta_latn: "Shaping machine na reciprocating single-point cutting tool use panni mainly flat surfaces produce panra machine tool.",
    ta: "Shaping machine என்பது முன்னும் பின்னும் நகரும் single-point tool மூலம் தட்டையான surfaces உருவாக்கும் இயந்திரமாகும்."
  },
  "pdf_q37": {
    ta_latn: "Ram na tool head-ah carry panni workpiece mela cutting tool-ah reciprocate panra moving member.",
    ta: "Ram என்பது tool head-ஐ சுமந்து workpiece மீது cutting tool-ஐ முன்னும் பின்னும் நகர்த்தும் பாகமாகும்."
  },
  "pdf_q38": {
    ta_latn: "Tool head cutting tool-ah hold panni machining operations-ku adjust panna use aagum.",
    ta: "Tool head என்பது cutting tool-ஐ பிடித்து machining செயல்பாடுகளுக்கு ஏற்ப நிலைநிறுத்தும் பகுதியாகும்."
  },
  "pdf_q39": {
    ta_latn: "Return stroke na ram pinnaadi move aagi cutting nadakkadha idle stroke.",
    ta: "Return stroke என்பது ram பின்நோக்கி நகரும் போது வெட்டுதல் நிகழாத idle stroke ஆகும்."
  },
  "pdf_q40": {
    ta_latn: "Quick return motion na idle time-ah reduce panna return stroke-ah cutting stroke-ah vida faster-ah operate panra mechanism.",
    ta: "Quick return motion என்பது வீண் நேரத்தைக் குறைக்க return stroke-ஐ மிக வேகமாக இயக்கும் அமைப்பாகும்."
  },
  "pdf_q41": {
    ta_latn: "Shaper-la horizontal, vertical, inclined flat surfaces, slots and keyway profiles produce panna mudiyum.",
    ta: "Shaper மூலம் கிடைமட்ட, செங்குத்து, சாய்வான flat surfaces மற்றும் slots உருவாக்கலாம்."
  },
  "pdf_q42": {
    ta_latn: "Clapper box return stroke apo tool-ah slightly lift aaga vachu tool and workpiece rub aagama wear out aagadhadha protect pannum.",
    ta: "Clapper box ஆனது return stroke-ன் போது tool-ஐ மேலே தூக்கி தேய்மானத்தைத் தடுக்கிறது."
  },
  "pdf_q43": {
    ta_latn: "Shaper-la feed na successive strokes-ku naduvula cutting tool-ku relative-ah workpiece table move aagura controlled movement.",
    ta: "Shaper-ல் feed என்பது அடுத்தடுத்த strokes-க்கு இடையே table நகரும் controlled movement ஆகும்."
  },
  "pdf_q44": {
    ta_latn: "Shaper simple setup and reciprocating cutting action kaaranama small and medium workpieces-la flat surfaces and slots produce panna suitable.",
    ta: "எளிமையான அமைப்பு காரணமாக சிறிய மற்றும் நடுத்தர workpieces-ல் slots உருவாக்க shaper ஏற்றது."
  },
  "pdf_q45": {
    ta_latn: "Shaper-kum planer-kum difference: Shaper-la cutting tool reciprocate aagum, workpiece stationary/feed aagum. Planer-la workpiece table reciprocate aagum, tool cutting pannum.",
    ta: "Shaper-ல் cutting tool முன்னும் பின்னும் நகரும்; Planer-ல் workpiece table முன்னும் பின்னும் நகர்ந்து வெட்டப்படும்."
  },

  // Planing Machine
  "pdf_q46": {
    ta_latn: "Planer na work table-ah reciprocate panni large and heavy workpieces-ah machine panra heavy-duty machine tool.",
    ta: "Planer என்பது பெரிய மற்றும் கனமான workpieces-ஐ table நகர்வு மூலம் machine செய்யும் இயந்திரமாகும்."
  },
  "pdf_q47": {
    ta_latn: "Planer-la main cutting motion apo Workpiece and table reciprocate aagum.",
    ta: "Planer-ல் வெட்டும் போது Workpiece மற்றும் table முன்னும் பின்னும் நகர்கிறது."
  },
  "pdf_q48": {
    ta_latn: "Planer-oda main use na large flat horizontal, vertical, inclined surfaces and long machine bed guideways produce panradhu.",
    ta: "Planer-ன் பயன்பாடு பெரிய கிடைமட்ட, செங்குத்து மற்றும் சாய்வான தட்டையான மேற்பரப்புகளை உருவாக்குவதாகும்."
  },
  "pdf_q49": {
    ta_latn: "Planer-oda rigid construction and large table heavy and oversized components-ah support panni machine panna mudiyum.",
    ta: "கடினமான வடிவமைப்பு மற்றும் பெரிய table இருப்பதால் கனமான பாகங்களை machine செய்ய planer பயன்படுகிறது."
  },
  "pdf_q50": {
    ta_latn: "Planer-la feed na successive cutting strokes-ku naduvula cutting tool-oda transverse illa incremental movement.",
    ta: "Planer-ல் feed என்பது அடுத்தடுத்த cutting strokes-க்கு இடையே cutting tool பக்கவாட்டில் நகரும் incremental movement ஆகும்."
  },
  "pdf_q51": {
    ta_latn: "Planer table na reciprocating motion apo workpiece-ah support panni carry panra heavy bed platform.",
    ta: "Planer table என்பது நகர்வின் போது workpiece-ஐ தாங்கிச் செல்லும் அமைப்பாகும்."
  },
  "pdf_q52": {
    ta_latn: "Double housing planer-la cross rail and tool heads-ah support panna rendu vertical housings irukkum, idhu maximum rigidity tharum.",
    ta: "Double housing planer-ல் cross rail-ஐ தாங்க இரு செங்குத்து தூண்கள் (housings) இருந்து அதிக விறைப்புத்தன்மையை (rigidity) தருகின்றன."
  },
  "pdf_q53": {
    ta_latn: "Shaper vs Planer: Shaper cutting tool-ah reciprocate pannum; Planer workpiece and table-ah reciprocate pannum.",
    ta: "Shaper-ல் tool நகர்கிறது; Planer-ல் workpiece மற்றும் table நகர்கிறது."
  },

  // Milling
  "pdf_q54": {
    ta_latn: "Milling na rotating multi-point cutting tool workpiece-la irundhu material-ah remove panra machining process.",
    ta: "Milling என்பது சுழலும் multi-point cutting tool மூலம் உலோகத்தை அகற்றும் machining process ஆகும்."
  },
  "pdf_q55": {
    ta_latn: "Milling cutter na milling apo metal-ah remove panna use aagura rotary multi-tooth cutting tool.",
    ta: "Milling cutter என்பது உலோகத்தை வெட்டப் பயன்படும் சுழலும் பல் கொண்ட (multi-tooth) கருவியாகும்."
  },
  "pdf_q56": {
    ta_latn: "Face milling na cutter-oda face-la irukkura cutting edges use panni flat surface produce panra operation.",
    ta: "Face milling என்பது cutter-ன் முகப்பு விளிம்புகள் மூலம் flat surface உருவாக்கும் முறையாகும்."
  },
  "pdf_q57": {
    ta_latn: "Slab milling na periphery-la teeth ulla cylindrical cutter use panni flat surface produce panradhu.",
    ta: "Slab milling என்பது உருளை வடிவ cutter-ன் வெளிப்புற பற்கள் மூலம் flat surface உருவாக்கும் முறையாகும்."
  },
  "pdf_q58": {
    ta_latn: "End milling na end mill tool use panni slots, pockets, steps and contour profiles machine panra operation.",
    ta: "End milling என்பது end mill மூலம் slots, pockets மற்றும் profiles வெட்டும் operation ஆகும்."
  },
  "pdf_q59": {
    ta_latn: "Up milling (conventional) la cutting point-la cutter rotation workpiece feed direction-ku opposite-ah irukkum.",
    ta: "Up milling-ல் cutter சுழற்சி workpiece feed திசைக்கு எதிர்ப்புறமாக இருக்கும்."
  },
  "pdf_q60": {
    ta_latn: "Down milling (climb) la cutting point-la cutter rotation workpiece feed direction-oda same direction-la irukkum.",
    ta: "Down milling-ல் cutter சுழற்சி workpiece feed திசையிலேயே நகரும்."
  },
  "pdf_q61": {
    ta_latn: "Vertical milling machine-la spindle vertically orient aagi face, end, slot and profile milling-ku use aagum.",
    ta: "Vertical milling machine-ல் spindle செங்குத்தாக இருந்து face மற்றும் end milling செய்ய உதவும்."
  },
  "pdf_q62": {
    ta_latn: "Horizontal milling machine-la spindle horizontally orient aagi slab milling-ku use aagum.",
    ta: "Horizontal milling machine-ல் spindle கிடைமட்டமாக இருந்து slab milling செய்ய உதவும்."
  },
  "pdf_q63": {
    ta_latn: "Workholding device (machine vice illa fixture) na milling apo workpiece-ah accurately locate and clamp panna use aagum.",
    ta: "Workholding device என்பது milling-ன் போது workpiece-ஐ உறுதியாகப் பிடித்து நிலைநிறுத்தும் கருவியாகும்."
  },
  "pdf_q64": {
    ta_latn: "Slotting operation na workpiece-la narrow groove illa slot mill panra operation.",
    ta: "Slotting operation என்பது workpiece-ல் குறுகிய பள்ளம் (slot) வெட்டும் operation ஆகும்."
  },
  "pdf_q65": {
    ta_latn: "Cutting fluid heat and friction reduce panni, tool life improve panna and chips remove panna help pannum.",
    ta: "Cutting fluid வெப்பத்தைக் குறைக்கவும், tool ஆயுளை நீட்டிக்கவும், chips-களை வெளியேற்றவும் பயன்படுகிறது."
  },

  // Metal Casting & Sand Moulding
  "pdf_q66": {
    ta_latn: "Casting na molten metal-ah mould cavity-kulla pour panni solidify aaga vachu parts produce panra manufacturing process.",
    ta: "Casting என்பது உருகிய உலோகத்தை mould cavity-க்குள் ஊற்றி உறைய வைத்து பாகங்களை உருவாக்கும் உற்பத்தி முறையாகும்."
  },
  "pdf_q67": {
    ta_latn: "Mould na solidification apo molten metal-ku required shape thara cavity form.",
    ta: "Mould என்பது உருகிய உலோகத்திற்கு வடிவம் தரும் அச்சுக்குழி (cavity) ஆகும்."
  },
  "pdf_q68": {
    ta_latn: "Pattern na molten metal pour panra mould cavity create panna use aagura replica model.",
    ta: "Pattern என்பது mould cavity உருவாக்கப் பயன்படும் மாதிரி (replica) ஆகும்."
  },
  "pdf_q69": {
    ta_latn: "Sprue na molten metal mould system-kulla enter aagura vertical passage.",
    ta: "Sprue என்பது உருகிய உலோகம் அச்சுக்குள் பாயும் செங்குத்து பாதையாகும்."
  },
  "pdf_q70": {
    ta_latn: "Runner na molten metal-ah sprue-la irundhu mould cavity-ku carry panra horizontal passage.",
    ta: "Runner என்பது உலோகத்தை sprue-லிருந்து cavity-க்கு எடுத்துச் செல்லும் பாதையாகும்."
  },
  "pdf_q71": {
    ta_latn: "Gate na molten metal direct-ah mould cavity-kulla enter aagura entrance passage.",
    ta: "Gate என்பது உலோகம் cavity-க்குள் நுழையும் இறுதி நுழைவு வாயிலாகும்."
  },
  "pdf_q72": {
    ta_latn: "Riser na solidification apo metal shrinkage volume-ah compensate panna molten metal feed panra reservoir.",
    ta: "Riser என்பது உலோகம் உறையும் போது சுருங்குவதை (shrinkage) ஈடுசெய்ய உருகிய உலோகத்தை வழங்கும் தொட்டியாகும்."
  },
  "pdf_q73": {
    ta_latn: "Casting defect na cast product-la varum unwanted imperfection (porosity, shrinkage, cold shut).",
    ta: "Casting defect என்பது வார்க்கப்பட்ட பொருளில் ஏற்படும் குறைபாடுகளாகும் (porosity, shrinkage, etc.)."
  },
  "pdf_q74": {
    ta_latn: "Shrinkage defect na solidification apo metal contract aagi insufficient molten metal irukkumbodhu form aagaradhu.",
    ta: "Shrinkage defect என்பது உலோகம் உறையும் போது சுருங்கி போதிய உலோகம் கிடைக்காததால் ஏற்படுவது."
  },
  "pdf_q75": {
    ta_latn: "Core na casting-la internal holes, cavities illa passages create panna use aagura shaped insert.",
    ta: "Core என்பது உள்ளீடற்ற துளைகளை (hollow cavities) உருவாக்க அச்சில் வைக்கப்படும் அமைப்பாகும்."
  },
  "pdf_q76": {
    ta_latn: "Pattern-la draft kudukkaradhu mould cavity damage aagama pattern-ah easily remove panna slight taper tharadhukku.",
    ta: "Draft என்பது mould சேதமடையாமல் pattern-ஐ எளிதில் வெளியே எடுக்கத் தரப்படும் சாய்வு (taper) ஆகும்."
  },
  "pdf_q77": {
    ta_latn: "Solidification na molten metal heat lose panni solid state-ku maarura phase change process.",
    ta: "Solidification என்பது உருகிய உலோகம் வெப்பத்தை இழந்து திடப்பொருளாக மாறும் நிகழ்வாகும்."
  },
  "pdf_q78": {
    ta_latn: "Sand moulding na specially prepared moulding sand-la mould cavity create panra casting method.",
    ta: "Sand moulding என்பது மணல் மூலம் அச்சு உருவாக்கி வார்க்கும் முறையாகும்."
  },
  "pdf_q79": {
    ta_latn: "Moulding sand na casting process-ku mould cavity create panna use aagura specially prepared granular material.",
    ta: "Moulding sand என்பது casting செயல்பாட்டிற்கு mould cavity உருவாக்கப் பயன்படும் தயாரிக்கப்பட்ட மணல் பொருள் ஆகும்."
  },
  "pdf_q80": {
    ta_latn: "Green sand na sand, clay, water and additives serndha moist moulding sand mixture.",
    ta: "Green sand என்பது மணல், களிமண் (clay), மற்றும் நீர் கலந்த ஈரப்பதமான அச்சு மணலாகும்."
  },
  "pdf_q81": {
    ta_latn: "Flask na moulding sand-ah support panni hold panna use aagura metal illa wooden box frame.",
    ta: "Flask என்பது moulding sand-ஐ பிடித்து தாங்க உதவும் container அல்லது frame ஆகும்."
  },
  "pdf_q82": {
    ta_latn: "Cope na two-part moulding flask-oda upper half box.",
    ta: "Cope என்பது அச்சுப் பெட்டியின் மேல் பகுதியாகும் (upper half)."
  },
  "pdf_q83": {
    ta_latn: "Drag na two-part moulding flask-oda lower half box.",
    ta: "Drag என்பது அச்சுப் பெட்டியின் கீழ் பகுதியாகும் (lower half)."
  },
  "pdf_q84": {
    ta_latn: "Parting line na cope and drag (rendu mould halves) meet aagura boundary line.",
    ta: "Parting line என்பது mould-ன் இரு பகுதிகள் (cope மற்றும் drag) சந்திக்கும் எல்லைக் கோடாகும்."
  },
  "pdf_q85": {
    ta_latn: "Permeability of moulding sand na casting apo gases and steam mould வழியா easily escape aaga vidura sand property.",
    ta: "Permeability என்பது வார்க்கும் போது வாயுக்கள் மற்றும் காற்று மணல் வழியாக வெளியேற அனுமதிக்கும் moulding sand-ன் பண்பாகும்."
  },
  "pdf_q86": {
    ta_latn: "Refractoriness na moulding sand molten metal-oda extreme high temperature-ah melt aagama withstand panra ability.",
    ta: "Refractoriness என்பது அதிக வெப்பநிலையை உருகாமல் தாங்கும் moulding sand-ன் திறன் ஆகும்."
  },
  "pdf_q87": {
    ta_latn: "Sand mould-la vent hole kudukkaradhu pouring apo hot gases and steam easily escape aaga help pannum.",
    ta: "Vent துளைகள் வாயுக்கள் மற்றும் நீராவி வெளியேற வழிவகுக்கின்றன."
  },

  // Workshop Safety
  "pdf_q88": {
    ta_latn: "Workshop safety injuries, equipment damage and unsafe working conditions thadukka romba mukkiyam.",
    ta: "Workshop safety விபத்துகள் மற்றும் சேதங்களை தடுக்க மிகவும் அவசியமாகும்."
  },
  "pdf_q89": {
    ta_latn: "Common PPE: Safety glasses, steel-toe footwear, task-specific gloves (welding-ku mattum), hearing protection.",
    ta: "பொதுவான PPE: Safety glasses, பாதுகாப்பு காலணிகள், கையுறைகள் (welding-க்கு மட்டும்), காது பாதுகாப்பு கருவிகள்."
  },
  "pdf_q90": {
    ta_latn: "Rotating machines kitta loose clothing avoid pannanum because moving parts-la maatti dangerous entanglement hazard create aagum.",
    ta: "சுழலும் இயந்திரங்கள் அருகே தளர்வான ஆடைகள் அணிந்தால் அவை சுழலும் பகுதியில் மாட்டிக்கொள்ளும் ஆபத்து உள்ளது."
  },
  "pdf_q91": {
    ta_latn: "Machine guards operation apo remove panna koodadhu because moving parts, chips, and sparks-la irundhu user-ah protect pannum.",
    ta: "இயங்கும் பாகங்கள், chips மற்றும் தீப்பொறிகளிலிருந்து பாதுகாக்க machine guards-ஐ இயக்கத்தின் போது அகற்றக்கூடாது."
  },
  "pdf_q92": {
    ta_latn: "Maintenance-ku munnadi machine-ah switch off panni, power source isolate panni lock out / tag out safety procedure follow pannanum.",
    ta: "பராமரிப்புக்கு முன் இயந்திரத்தை நிறுத்தி, மின்சாரத்தை துண்டித்து பாதுகாப்பு வழிமுறைகளைப் பின்பற்ற வேண்டும்."
  },
  "pdf_q93": {
    ta_latn: "Chips-ah kaiyala remove panna koodadhu because sharp metal chips cut injury create pannum; brush illa chip hook use pannanum.",
    ta: "கூர்மையான chips கைகளை வெட்டிவிடும் என்பதால் கைகளால் எடுக்கக்கூடாது; brush அல்லது chip hook பயன்படுத்த வேண்டும்."
  },
  "pdf_q94": {
    ta_latn: "Housekeeping romba mukkiyam because slips, trips, oil falls and fire hazards-ah prevent panni safe working environment tharum.",
    ta: "வழுக்குதல், தடுமாறுதல் மற்றும் தீ விபத்துகளைத் தடுக்க workshop-ல் நல்ல housekeeping அவசியம்."
  },
  "pdf_q95": {
    ta_latn: "Damaged electrical cable use panna koodadhu because idhu electric shock, short circuit and fire hazard create pannum.",
    ta: "சேதமடைந்த மின்சார கேபிள்கள் electric shock மற்றும் தீ விபத்தை ஏற்படுத்தும் என்பதால் பயன்படுத்தக்கூடாது."
  },
  "pdf_q96": {
    ta_latn: "Safety interlock na required safety conditions satisfy aagalana machine operate aagadha maadhiri block panra protection mechanism.",
    ta: "Safety interlock என்பது பாதுகாப்பு நிபந்தனைகள் பூர்த்தியாகும் வரை இயந்திரம் இயங்குவதைத் தடுக்கும் பாதுகாப்பு அமைப்பாகும்."
  },
  "pdf_q97": {
    ta_latn: "Emergency stop na emergency occur aagumbodhu dangerous machine motion-ah instantly stop panna use aagura control button.",
    ta: "Emergency stop என்பது அவசர காலத்தில் இயந்திரத்தின் இயக்கத்தை உடனடியாக நிறுத்த உதவும் control button ஆகும்."
  },

  // JSON Dataset Items (10 items from mechanical_dataset.json)
  "json_0": {
    ta_latn: "Second Law of Thermodynamics na isolated system-oda total entropy epodhum increase aagum, and heat naturally hot body-la irundhu cold body-ku dhaan flow aagum (spontaneous 100% heat-to-work conversion impossible).",
    ta: "வெப்ப இயக்கவியலின் இரண்டாம் விதி: ஒரு தனித்த அமைப்பின் மொத்த என்ட்ரோபி எப்போதும் அதிகரிக்கும், மேலும் வெப்பம் இயல்பாகவே சூடான பொருளிலிருந்து குளிர்ந்த பொருளுக்கு மட்டுமே பாயும்."
  },
  "json_1": {
    ta_latn: "Ideal Rankine cycle 4 processes koodi irukkum: 1) Pump-la isentropic compression, 2) Boiler-la constant pressure heat addition, 3) Turbine-la isentropic expansion, 4) Condenser-la constant pressure heat rejection.",
    ta: "Rankine cycle 4 செயல்முறைகளைக் கொண்டது: 1) Pump-ல் isentropic compression, 2) Boiler-ல் constant pressure heat addition, 3) Turbine-ல் isentropic expansion, 4) Condenser-ல் constant pressure heat rejection."
  },
  "json_2": {
    ta_latn: "Bernoulli's equation: P + 0.5*rho*v^2 + rho*g*z = Constant. Idhu steady, incompressible, frictionless streamline flow-la pressure, kinetic and potential energy balance-ah describe pannum.",
    ta: "பெர்னௌலியின் சமன்பாடு: P + 0.5*rho*v^2 + rho*g*z = Constant. இது உராய்வற்ற பாய்ம ஓட்டத்தில் அழுத்த ஆற்றல், இயக்க ஆற்றல் மற்றும் நிலை ஆற்றலின் கூடுதல் மாறிலியாக இருப்பதைக் குறிக்கிறது."
  },
  "json_3": {
    ta_latn: "Circular pipe flow-ku critical Reynolds number (Re) approximately 2300. Re < 2000 laminar flow, Re > 4000 fully turbulent. Formula: Re = (rho * v * D) / mu.",
    ta: "குழாய் ஓட்டத்திற்கான critical Reynolds number சுமார் 2300 ஆகும். 2000-க்கு கீழ் laminar மற்றும் 4000-க்கு மேல் turbulent ஓட்டம் ஆகும் (Re = rho * v * D / mu)."
  },
  "json_4": {
    ta_latn: "Hooke's Law in 3D: epsilon_x = (1/E) * [sigma_x - nu*(sigma_y + sigma_z)]. Elastic constants relations: G = E / [2 * (1 + nu)] and K = E / [3 * (1 - 2*nu)].",
    ta: "முப்பரிமாண ஹூக்கின் விதி: epsilon_x = (1/E) * [sigma_x - nu*(sigma_y + sigma_z)]. மேலும் மீள் மாறிலிகள் G = E / [2*(1+nu)] மற்றும் K = E / [3*(1-2*nu)] ஆகும்."
  },
  "json_5": {
    ta_latn: "Tresca (Max Shear Stress) theory ductile failure tau_max = S_yt/2 nu hexagonal boundary tharum. Von Mises (Distortion Energy) ellipse form panni ~15% extra load capacity tharum and ductile materials-ku more accurate.",
    ta: "Tresca கோட்பாடு அதிகபட்ச shear stress-ஐ அடிப்படையாகக் கொண்டது (hexagon); Von Mises கோட்பாடு distortion energy-ஐ அடிப்படையாகக் கொண்டு ductile பொருட்களுக்கு மிகவும் துல்லியமானது."
  },
  "json_6": {
    ta_latn: "Goodman fatigue design-la modifying factors (Marin factors) lab endurance limit S_e'-ah real working conditions-ku adjust panna use aagum (S_e = ka*kb*kc*kd*ke*kf*S_e').",
    ta: "Goodman fatigue அமைப்பில் Marin factors ஆய்வக endurance limit-ஐ நிஜ வேலை சூழ்நிலைகளுக்கு ஏற்ப மாற்றியமைக்க பயன்படுகின்றன (S_e = ka*kb*kc*kd*ke*kf*S_e')."
  },
  "json_7": {
    ta_latn: "Involute gear teeth-la interference flank-tip mating problem aala root undercut aagaradhu. Idhai pressure angle increase panni, minimum pinion teeth use panni, illa tooth tip modify panni prevent pannalam.",
    ta: "Involute gear பற்களில் interference ஏற்படுவதைத் தடுக்க pressure angle அதிகரித்தல், குறைந்தபட்ச pinion பற்கள் (18 teeth) அமைத்தல் அல்லது tip மாற்றுதல் போன்ற வழிகளைப் பின்பற்றலாம்."
  },
  "json_8": {
    ta_latn: "Nusselt Number (Nu = h*L/k_fluid) convective to conductive heat transfer ratio across fluid layer tharum. Biot Number (Bi = h*L/k_solid) internal conduction to external convection ratio tharum (Bi < 0.1 Lumped Capacitance use panlam).",
    ta: "Nusselt எண் (Nu = h*L/k_fluid) வெப்பச் சலனம் மற்றும் கடத்தல் விகிதத்தைக் குறிக்கிறது; Biot எண் (Bi = h*L/k_solid) உள் கடத்தல் மற்றும் வெளி சலன விகிதத்தைக் குறிக்கிறது."
  },
  "json_9": {
    ta_latn: "Taylor's Tool Life Equation: V * T^n = C. V = Cutting Speed (m/min), T = Tool Life (mins), n = tool material exponent (HSS: ~0.1-0.15, Carbide: ~0.2-0.25), C = machining constant.",
    ta: "Taylor-ன் Tool Life சமன்பாடு: V * T^n = C. V என்பது வெட்டு வேகம், T என்பது tool ஆயுள், n என்பது பொருள் அடுக்கு, மற்றும் C என்பது மாறிலி ஆகும்."
  }
};

const SPECIFIC_CONCEPTS = [
  // Lathe Operations & Components
  'facing', 'turning', 'boring', 'taper', 'knurling', 'threading', 'chamfering', 
  'parting', 'contour', 'feed', 'depth', 'coolant', 'tailstock', 'chuck', 'carriage', 
  'bed', 'lead screw', 'cutting speed', 'headstock', 'compound rest',
  // Arc Welding
  'electrode', 'flux', 'bead', 'penetration', 'porosity', 'slag', 'butt joint', 
  'lap joint', 'fillet weld', 'welding current', 'helmet', 'smaw', 'arc length',
  // Shaping & Planing
  'clapper', 'ram', 'return stroke', 'quick return', 'double housing', 'stroke length',
  // Milling
  'slab milling', 'face milling', 'end milling', 'up milling', 'down milling', 
  'slotting', 'milling cutter', 'arbor',
  // Casting & Moulding
  'sprue', 'runner', 'gate', 'riser', 'pattern', 'core', 'draft', 'green sand', 
  'moulding sand', 'flask', 'cope', 'drag', 'parting line', 'permeability', 
  'refractoriness', 'vent', 'shrinkage', 'chills',
  // Safety
  'ppe', 'gloves', 'glasses', 'interlock', 'emergency stop', 'housekeeping', 'guard',
  // Mechanical JSON Dataset Concepts
  'thermodynamics', 'second law', 'entropy', 'rankine', 'boiler', 'turbine', 'condenser',
  'fluid mechanics', 'bernoulli', 'reynolds', 'laminar', 'turbulent', 'pipe flow',
  'strength of materials', 'hooke', 'young modulus', 'shear modulus', 'poisson', 'tresca', 'von mises',
  'machine design', 'goodman', 'marin factor', 'fatigue', 'endurance limit', 'involute', 'gear', 'interference',
  'heat transfer', 'nusselt', 'biot', 'lumped capacitance', 'conduction', 'convection',
  'taylor', 'tool life', 'hss', 'carbide'
];

/**
 * Perform RAG Retrieval from Knowledge Base
 * @param {string} query 
 * @returns {{ item: object, score: number } | null}
 */
export function retrieveKnowledge(query) {
  if (!query || !query.trim()) return null;

  const clean = query.toLowerCase();
  const tokens = cleanTokens(query);

  if (tokens.length === 0) return null;

  let bestMatch = null;
  let highestScore = 0;

  for (const item of UNIFIED_KNOWLEDGE) {
    let score = 0;
    const qLower = item.question.toLowerCase();
    const aLower = item.answer.toLowerCase();
    const qTokens = cleanTokens(item.question);
    const topicLower = (item.topic || '').toLowerCase();
    const subtopicLower = (item.subtopic || '').toLowerCase();

    // 1. Direct question match
    if (clean.includes(qLower) || qLower.includes(clean)) {
      score += 70;
    }

    // 2. Keyword exact substring matches
    for (const kw of item.keywords) {
      const kwL = kw.toLowerCase();
      if (clean.includes(kwL)) {
        score += 25 + kwL.length * 2;
      }
    }

    // 3. Token overlap with question
    let matchedQuestionTokens = 0;
    for (const t of tokens) {
      if (qTokens.includes(t)) {
        matchedQuestionTokens++;
        score += 20;
      } else if (qLower.includes(t)) {
        score += 10;
      }

      if (topicLower.includes(t)) score += 5;
      if (subtopicLower.includes(t)) score += 4;
      if (aLower.includes(t)) score += 2;
    }

    // 4. Specific Concept Priority
    for (const concept of SPECIFIC_CONCEPTS) {
      if (tokens.includes(concept)) {
        if (qTokens.includes(concept) || qLower.includes(concept)) {
          score += 60;
        } else if (item.keywords.some(k => k.toLowerCase().includes(concept))) {
          score += 40;
        }
      }
    }

    // Bonus for matching high percentage of query tokens in the question
    const tokenMatchRatio = matchedQuestionTokens / Math.max(tokens.length, 1);
    score += tokenMatchRatio * 30;

    // Penalty if question is generic (like "What is a centre lathe?") but query asks about a specific operation
    if (qTokens.length <= 3 && tokens.length >= 3 && matchedQuestionTokens <= 1) {
      score -= 25;
    }

    // Contextual topic matching
    if (clean.includes('planer') && item.topic === 'Planing Machine') score += 10;
    if (clean.includes('shaper') && item.topic === 'Shaping Machine') score += 10;
    if (clean.includes('lathe') && (item.topic.includes('Lathe') || qLower.includes('lathe'))) score += 10;
    if (clean.includes('welding') && item.topic === 'Arc Welding') score += 10;
    if (clean.includes('milling') && item.topic === 'Milling') score += 10;
    if (clean.includes('casting') && item.topic === 'Metal Casting') score += 10;
    if (clean.includes('sand') && item.topic === 'Sand Moulding') score += 10;
    if (clean.includes('safety') && item.topic === 'Workshop Safety') score += 10;

    if (score > highestScore) {
      highestScore = score;
      bestMatch = { item, score };
    }
  }

  // Grounding threshold: if highest score is too low or query does not match real engineering terms
  if (highestScore < 30) {
    return null;
  }

  return bestMatch;
}

/**
 * Generates an appropriate AI response in the user's detected language (English, Tanglish, or Tamil)
 * grounded strictly in the PDF and JSON knowledge base.
 * @param {string} userQuery 
 * @returns {string}
 */
export function generateWorkshopAIResponse(userQuery) {
  if (!userQuery || !userQuery.trim()) {
    return "Please enter a Mechanical Engineering question to search the workshop knowledge base.";
  }

  const lang = detectLanguage(userQuery);
  const retrieval = retrieveKnowledge(userQuery);

  // If knowledge source does not contain enough information
  if (!retrieval || !retrieval.item) {
    if (lang === 'tanglish') {
      return "Current Mechanical Engineering knowledge base-la indha specific query-ku pothumaana information illa. Dhayavuseidhu Lathe, Arc Welding, Shaper, Planer, Milling, Casting, Sand Moulding, Workshop Safety, Thermodynamics, SOM, Machine Design illa Fluid Mechanics paththi kelunga.";
    }
    if (lang === 'tamil') {
      return "தற்போதைய Mechanical Engineering knowledge base-ல் இந்த கேள்விக்கு போதுமான தகவல் இல்லை. Lathe, Welding, Shaper, Planer, Milling, Casting, Moulding, Safety அல்லது Thermodynamics சம்பந்தமான கேள்விகளைக் கேட்கவும்.";
    }
    return "The current Mechanical Engineering knowledge base does not contain enough information to answer this query accurately. Please ask about Centre Lathe, Arc Welding, Shaping, Planing, Milling, Metal Casting, Sand Moulding, Workshop Safety, or fundamental Mechanical Engineering topics.";
  }

  const { item } = retrieval;
  const translation = TRANSLATIONS[item.id];

  // 1. English Response
  if (lang === 'english') {
    return item.answer;
  }

  // 2. Tanglish Response (preserve technical mechanical terms)
  if (lang === 'tanglish') {
    if (translation && translation.ta_latn) {
      return translation.ta_latn;
    }
    // Dynamic Tanglish formulation for JSON dataset items
    return `${item.topic}${item.subtopic ? ` (${item.subtopic})` : ''}: ${item.answer}`;
  }

  // 3. Tamil Response
  if (lang === 'tamil') {
    if (translation && translation.ta) {
      return translation.ta;
    }
    return `${item.topic}: ${item.answer}`;
  }

  return item.answer;
}
