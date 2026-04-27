import { Destination, DayPlan, BudgetBreakdown, TripPlan, TripRequest } from './types';

// ─── DESTINATIONS ────────────────────────────────────────────────────────────

export const destinations: Destination[] = [
  {
    id: 'lisbon',
    name: 'Lisbon',
    country: 'Portugal',
    emoji: '🏛️',
    tagline: 'Sun-drenched city of fado, pastéis de nata, and cobblestone charm',
    description:
      'Lisbon enchants with its pastel-colored facades, world-class seafood, and neighborhoods where history breathes through every tile. Affordable yet sophisticated, it blends Moorish heritage with a buzzing contemporary food scene.',
    highlights: ['Alfama District', 'Time Out Market', 'Belém Tower', 'Sintra Day Trip', 'Fado Music'],
    matchScore: 0,
    matchReasons: [],
    iataCode: 'LIS',
  },
  {
    id: 'chiangmai',
    name: 'Chiang Mai',
    country: 'Thailand',
    emoji: '🌿',
    tagline: 'Ancient temples, jungle trekking, and some of Asia\'s best street food',
    description:
      'Chiang Mai is Northern Thailand\'s cultural heart — a city where saffron-robed monks pass by cooking-class kitchens and night bazaars overflow with handcrafts. Surrounded by forested mountains and elephants sanctuaries, it offers nature and culture at an unbeatable price.',
    highlights: ['Doi Inthanon', 'Night Bazaar', 'Elephant Sanctuary', 'Thai Cooking Class', 'Doi Suthep Temple'],
    matchScore: 0,
    matchReasons: [],
    iataCode: 'CNX',
  },
  {
    id: 'costarica',
    name: 'Costa Rica',
    country: 'Costa Rica',
    emoji: '🌺',
    tagline: 'Rainforests, volcanoes, and wildlife in the world\'s biodiversity hotspot',
    description:
      'Costa Rica packs an astonishing variety of ecosystems into a small country: misty cloud forests, active volcanoes, Pacific beaches, and Caribbean shores. It\'s a paradise for wildlife lovers and adventure seekers who want to zip-line, white-water raft, and watch sloths.',
    highlights: ['Arenal Volcano', 'Manuel Antonio', 'Monteverde Cloud Forest', 'Zip-lining', 'Wildlife Watching'],
    matchScore: 0,
    matchReasons: [],
    iataCode: 'SJO',
  },
  {
    id: 'marrakech',
    name: 'Marrakech',
    country: 'Morocco',
    emoji: '🕌',
    tagline: 'Labyrinthine medina, spice-scented souks, and Sahara sunsets',
    description:
      'Marrakech assaults the senses in the best possible way — the call to prayer over smoke-filled squares, mountains of saffron and cumin, riads hidden behind unmarked doors. The Red City is a feast for culture lovers and foodies, gateway to the Atlas Mountains and the Sahara.',
    highlights: ['Jemaa el-Fnaa', 'Majorelle Garden', 'Souks & Medina', 'Atlas Mountains', 'Sahara Day Trip'],
    matchScore: 0,
    matchReasons: [],
    iataCode: 'RAK',
  },
  {
    id: 'newzealand',
    name: 'Queenstown',
    country: 'New Zealand',
    emoji: '🏔️',
    tagline: 'Dramatic fjords, Tolkien landscapes, and world-class adventure sports',
    description:
      'New Zealand\'s South Island is nature at its most theatrical — glaciers, fjords, and mountains that inspired Middle Earth. Queenstown is the adventure capital of the world, offering bungee jumping, skydiving, and skiing alongside world-class wineries and restaurants.',
    highlights: ['Milford Sound', 'Bungee Jumping', 'Fiordland NP', 'Queenstown Markets', 'Winery Tours'],
    matchScore: 0,
    matchReasons: [],
    iataCode: 'ZQN',
  },
  {
    id: 'kyoto',
    name: 'Kyoto',
    country: 'Japan',
    emoji: '⛩️',
    tagline: 'Bamboo groves, geisha districts, and kaiseki cuisine in Japan\'s ancient capital',
    description:
      'Kyoto is Japan distilled to its essence — 1,600 Buddhist temples, Shinto shrines, and zen gardens punctuate a city where traditions are still very much alive. Wander Gion\'s stone-paved lanes, watch a tea ceremony, and eat your way through Japan\'s most sophisticated food culture.',
    highlights: ['Fushimi Inari', 'Arashiyama Bamboo', 'Gion District', 'Tea Ceremony', 'Nishiki Market'],
    matchScore: 0,
    matchReasons: [],
    iataCode: 'ITM',
  },
];

// ─── ITINERARIES ─────────────────────────────────────────────────────────────

const lisbon7Days: DayPlan[] = [
  {
    day: 1,
    title: 'Arrival & Alfama Discovery',
    location: 'Lisbon',
    activities: [
      { time: '14:00', name: 'Check into Hotel', description: 'Settle into your boutique hotel in Baixa, Lisbon\'s historic center', cost: 0, type: 'accommodation', duration: '1 hour' },
      { time: '15:30', name: 'Alfama Walking Tour', description: 'Wander the oldest neighborhood of Lisbon, past the Sé Cathedral and Moorish remains', cost: 15, type: 'culture', duration: '2.5 hours' },
      { time: '18:30', name: 'Miradouro da Graça Sunset', description: 'Watch the sun set over the Tagus River from Lisbon\'s finest viewpoint', cost: 0, type: 'leisure', duration: '1 hour' },
      { time: '20:00', name: 'Fado Dinner at Tasca do Chico', description: 'Authentic fado music performance with traditional Portuguese petiscos and wine', cost: 45, type: 'food', duration: '3 hours' },
    ],
  },
  {
    day: 2,
    title: 'Belém & Pastéis de Nata',
    location: 'Belém, Lisbon',
    activities: [
      { time: '09:00', name: 'Pastéis de Belém Breakfast', description: 'Queue at the legendary bakery for fresh custard tarts — a Lisbon institution since 1837', cost: 8, type: 'food', duration: '1 hour' },
      { time: '10:30', name: 'Jerónimos Monastery', description: 'Stunning Manueline Gothic architecture, the finest monument of the Age of Discoveries', cost: 10, type: 'culture', duration: '1.5 hours' },
      { time: '12:30', name: 'Belém Tower', description: 'Iconic 16th-century fortified tower on the Tagus riverbank', cost: 6, type: 'culture', duration: '1 hour' },
      { time: '14:00', name: 'Lunch at Solar dos Presuntos', description: 'Classic bacalhau (salt cod) and açorda in a beloved Lisbon institution', cost: 30, type: 'food', duration: '1.5 hours' },
      { time: '16:00', name: 'LX Factory Market', description: 'Browse indie designers, bookshops, and vintage finds in a repurposed industrial space', cost: 20, type: 'leisure', duration: '2 hours' },
      { time: '19:30', name: 'Dinner at Taberna da Rua das Flores', description: 'Creative petiscos with natural wines in a beautiful tiled space', cost: 35, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 3,
    title: 'Sintra Palace Day Trip',
    location: 'Sintra',
    activities: [
      { time: '08:30', name: 'Train to Sintra', description: 'Scenic 40-minute train ride through pine forests to the fairy-tale town of Sintra', cost: 4, type: 'transport', duration: '40 min' },
      { time: '09:30', name: 'Pena Palace', description: 'Romantic 19th-century palace perched atop a forested hill — Technicolor turrets and ocean views', cost: 14, type: 'culture', duration: '2.5 hours' },
      { time: '12:30', name: 'Lunch in Sintra Village', description: 'Queijadas (cheese pastries) and travesseiros (almond pastries) at Piriquita bakery', cost: 15, type: 'food', duration: '1 hour' },
      { time: '14:00', name: 'Moorish Castle', description: 'Medieval ramparts with sweeping views over mountains and Atlantic coast', cost: 8, type: 'culture', duration: '1.5 hours' },
      { time: '16:30', name: 'Cabo da Roca', description: 'Westernmost point of continental Europe — dramatic clifftop views over the Atlantic', cost: 0, type: 'nature', duration: '1.5 hours' },
      { time: '20:00', name: 'Dinner at Cervejaria Ramiro', description: 'Legendary Lisbon seafood restaurant — giant prawns, clams, and ice-cold beer', cost: 40, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 4,
    title: 'Chiado, Bairro Alto & Markets',
    location: 'Lisbon',
    activities: [
      { time: '09:30', name: 'Mercado da Ribeira (Time Out Market)', description: 'Breakfast among Lisbon\'s best chefs — fresh pastries, coffee, and fresh juices', cost: 12, type: 'food', duration: '1.5 hours' },
      { time: '11:30', name: 'MAAT Museum of Art & Technology', description: 'Contemporary art in a stunning riverside building by Amanda Levete', cost: 9, type: 'culture', duration: '2 hours' },
      { time: '14:00', name: 'Chiado Shopping & Café a Brasileira', description: 'Browse Portugal\'s best boutiques and stop at the historic café with Fernando Pessoa\'s bronze', cost: 25, type: 'leisure', duration: '2 hours' },
      { time: '17:00', name: 'Tram 28 Ride', description: 'Iconic yellow tram through the steepest and most picturesque streets of Lisbon', cost: 3, type: 'transport', duration: '45 min' },
      { time: '20:30', name: 'Bairro Alto Tapas Crawl', description: 'Wander Bairro Alto\'s cobbled lanes, stopping at tiny tabernas for wine and petiscos', cost: 35, type: 'food', duration: '3 hours' },
    ],
  },
  {
    day: 5,
    title: 'Setúbal Peninsula & Arrábida',
    location: 'Arrábida Natural Park',
    activities: [
      { time: '09:00', name: 'Drive to Arrábida', description: 'Rent a car or join a day tour to the stunning Arrábida Natural Park on the Setúbal Peninsula', cost: 25, type: 'transport', duration: '1 hour' },
      { time: '10:30', name: 'Portinho da Arrábida Beach', description: 'Turquoise-water cove backed by limestone cliffs — bring snorkel gear', cost: 0, type: 'nature', duration: '3 hours' },
      { time: '14:00', name: 'Setúbal Lunch at Restaurante Bocage', description: 'Fresh grilled fish and local Moscatel wine overlooking the harbor', cost: 28, type: 'food', duration: '1.5 hours' },
      { time: '16:00', name: 'Convento de Arrábida', description: '16th-century convent perched dramatically on the cliffside', cost: 5, type: 'culture', duration: '1 hour' },
      { time: '20:00', name: 'Dinner at O Corvo', description: 'Natural wines and modern Portuguese small plates in Intendente', cost: 38, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 6,
    title: 'Cascais & Atlantic Coast',
    location: 'Cascais',
    activities: [
      { time: '09:30', name: 'Train to Cascais', description: 'Scenic coastal train along the Tagus estuary to the chic fishing town of Cascais', cost: 4, type: 'transport', duration: '40 min' },
      { time: '10:30', name: 'Cascais Old Town & Market', description: 'Explore the fishing harbor, local market, and charming whitewashed streets', cost: 10, type: 'culture', duration: '2 hours' },
      { time: '13:00', name: 'Lunch at Casa da Guia', description: 'Seafood lunch with Atlantic views at this iconic clifftop complex', cost: 35, type: 'food', duration: '1.5 hours' },
      { time: '15:00', name: 'Boca do Inferno', description: 'Dramatic rocky Atlantic inlet where waves crash into sea-carved arches', cost: 0, type: 'nature', duration: '1 hour' },
      { time: '17:00', name: 'Guincho Beach Sunset', description: 'Wild, windswept Atlantic beach backed by dunes with Sintra silhouette', cost: 0, type: 'nature', duration: '1.5 hours' },
      { time: '20:00', name: 'Farewell Dinner at A Cevicheria', description: 'Lima-meets-Lisbon fusion at one of Lisbon\'s hottest restaurants — octopus ceviche', cost: 45, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 7,
    title: 'Departure & Last Pastéis',
    location: 'Lisbon',
    activities: [
      { time: '08:30', name: 'Final Morning Coffee', description: 'Espresso and pastel de nata standing at a neighborhood café counter like a true Lisboeta', cost: 5, type: 'food', duration: '30 min' },
      { time: '09:30', name: 'Museu Nacional do Azulejo', description: 'Portugal\'s iconic tile-art museum in a stunning convent — don\'t miss the 23-meter Lisbon panorama panel', cost: 5, type: 'culture', duration: '2 hours' },
      { time: '12:00', name: 'Last Lunch at Mercado de Campo de Ourique', description: 'Local market lunch with residents away from tourist crowds', cost: 18, type: 'food', duration: '1.5 hours' },
      { time: '14:30', name: 'Airport Transfer', description: 'Uber or Metro to Humberto Delgado Airport', cost: 15, type: 'transport', duration: '30 min' },
    ],
  },
];

const chiangmai7Days: DayPlan[] = [
  {
    day: 1,
    title: 'Arrival & Old City Temples',
    location: 'Chiang Mai',
    activities: [
      { time: '13:00', name: 'Check-in at Boutique Guesthouse', description: 'Settle into a charming traditional teak-wood guesthouse inside the Old City moat', cost: 0, type: 'accommodation', duration: '1 hour' },
      { time: '14:30', name: 'Wat Chedi Luang', description: 'Enormous 14th-century ruined chedi that once housed the Emerald Buddha — monks happy to chat', cost: 2, type: 'culture', duration: '1.5 hours' },
      { time: '16:30', name: 'Wat Phra Singh', description: 'Chiang Mai\'s most revered temple with exquisite Lanna-style architecture and resident monks', cost: 2, type: 'culture', duration: '1 hour' },
      { time: '18:30', name: 'Sunday Walking Street (or Night Bazaar)', description: 'Miles of handicrafts, clothing, street food stalls, and live traditional music', cost: 20, type: 'food', duration: '2.5 hours' },
      { time: '21:00', name: 'Khao Soi at Khao Soi Khun Yai', description: 'The definitive Chiang Mai dish — coconut curry noodle soup at a legendary local spot', cost: 5, type: 'food', duration: '45 min' },
    ],
  },
  {
    day: 2,
    title: 'Thai Cooking Class & Herb Farm',
    location: 'Chiang Mai',
    activities: [
      { time: '08:00', name: 'Market Visit with Chef', description: 'Join your instructor at Warorot Market to select fresh herbs, vegetables, and chilies', cost: 0, type: 'food', duration: '1.5 hours' },
      { time: '09:30', name: 'Thai Cooking Class', description: 'Hands-on class making 5 dishes including green curry, pad Thai, and mango sticky rice', cost: 35, type: 'food', duration: '4 hours' },
      { time: '14:00', name: 'Lunch: Eat Your Own Cooking', description: 'Sit down and enjoy the feast you just made in a beautiful outdoor pavilion', cost: 0, type: 'food', duration: '1 hour' },
      { time: '16:00', name: 'Chiang Mai Arts & Cultural Center', description: 'Excellent free museum exploring Lanna Kingdom history and Northern Thai culture', cost: 4, type: 'culture', duration: '1.5 hours' },
      { time: '19:00', name: 'Riverside Bar & Dinner', description: 'Fresh fish and local whisky-soda cocktails by the Ping River at Good View', cost: 22, type: 'food', duration: '2.5 hours' },
    ],
  },
  {
    day: 3,
    title: 'Elephant Sanctuary Day',
    location: 'Mae Taeng Valley',
    activities: [
      { time: '07:30', name: 'Transfer to Elephant Sanctuary', description: 'Hotel pickup and scenic drive through rice fields to an ethical elephant sanctuary', cost: 10, type: 'transport', duration: '1.5 hours' },
      { time: '09:00', name: 'Ethical Elephant Experience', description: 'Feed, walk with, and bathe rescued elephants in their natural habitat — no riding', cost: 75, type: 'nature', duration: '5 hours' },
      { time: '14:30', name: 'Sanctuary Vegetarian Lunch', description: 'Organic Thai lunch made with sanctuary garden produce', cost: 0, type: 'food', duration: '1 hour' },
      { time: '16:00', name: 'Return & Massage', description: 'Thai herbal compress massage at a local spa to recover from the day', cost: 18, type: 'leisure', duration: '1.5 hours' },
      { time: '19:30', name: 'Dinner at Huan Soontaree', description: 'Upscale Northern Thai cuisine with live classical Lanna music', cost: 28, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 4,
    title: 'Doi Inthanon National Park',
    location: 'Doi Inthanon',
    activities: [
      { time: '06:30', name: 'Depart for Doi Inthanon', description: 'Early start for Thailand\'s highest peak — bring a jacket, mornings are cool', cost: 15, type: 'transport', duration: '1.5 hours' },
      { time: '08:30', name: 'Wachirathan Waterfall', description: 'Thundering 70-meter waterfall surrounded by lush jungle — refreshing mist on the viewing platform', cost: 3, type: 'nature', duration: '1 hour' },
      { time: '10:00', name: 'Summit & Twin Chedis', description: 'Visit Thailand\'s highest point (2,565m) and the ornate royal chedis through cloud forest', cost: 2, type: 'nature', duration: '2 hours' },
      { time: '12:30', name: 'Karen Village Lunch', description: 'Traditional Karen tribe meal in a hillside village using locally grown ingredients', cost: 8, type: 'food', duration: '1.5 hours' },
      { time: '14:30', name: 'Bird Watching Walk', description: 'Doi Inthanon hosts 383 bird species — guided walk in search of endemic species', cost: 15, type: 'nature', duration: '2 hours' },
      { time: '18:30', name: 'Dinner: Street Food Tour', description: 'Guide-led evening street food tour through Chiang Mai\'s best hidden vendors', cost: 20, type: 'food', duration: '2.5 hours' },
    ],
  },
  {
    day: 5,
    title: 'Doi Suthep & Artisan Villages',
    location: 'Chiang Mai Province',
    activities: [
      { time: '08:00', name: 'Doi Suthep Temple', description: 'Climb 309 steps (or take the tram) to Chiang Mai\'s most sacred temple with panoramic city views', cost: 2, type: 'culture', duration: '2 hours' },
      { time: '11:00', name: 'Hmong Tribe Market', description: 'Browse authentic handicrafts at the market run by Hmong hill tribe women', cost: 15, type: 'culture', duration: '1 hour' },
      { time: '13:00', name: 'Lunch at Plearn Wan', description: 'Vintage Thai market-style restaurant serving traditional Central Thai dishes', cost: 12, type: 'food', duration: '1.5 hours' },
      { time: '15:00', name: 'Borsang Umbrella Village', description: 'Watch artisans hand-paint intricate designs on silk and mulberry-paper parasols', cost: 5, type: 'culture', duration: '1.5 hours' },
      { time: '19:00', name: 'Khantoke Dinner Show', description: 'Traditional Northern Thai dinner on low tables with classical dance performances', cost: 30, type: 'food', duration: '2.5 hours' },
    ],
  },
  {
    day: 6,
    title: 'Jungle Trekking & Waterfall',
    location: 'Mae Wang District',
    activities: [
      { time: '08:00', name: 'Mae Wang Jungle Trek', description: 'Full-day guided trek through dense jungle to a three-tiered waterfall with a local guide', cost: 35, type: 'nature', duration: '4 hours' },
      { time: '12:30', name: 'Waterfall Picnic', description: 'Swim in natural pools and enjoy a packed lunch prepared by the guide', cost: 0, type: 'nature', duration: '1.5 hours' },
      { time: '15:00', name: 'Bamboo Rafting on Mae Wang River', description: 'Gentle float on traditional bamboo rafts through forested gorges', cost: 20, type: 'nature', duration: '1.5 hours' },
      { time: '19:00', name: 'Last Supper at David\'s Kitchen', description: 'Splurge-worthy final dinner — French-Thai fusion in a gorgeous converted heritage home', cost: 45, type: 'food', duration: '2.5 hours' },
    ],
  },
  {
    day: 7,
    title: 'Morning Market & Departure',
    location: 'Chiang Mai',
    activities: [
      { time: '07:00', name: 'Talat Warorot Morning Market', description: 'Dawn market with monks collecting alms, vendors selling tropical fruits and flowers', cost: 8, type: 'food', duration: '1.5 hours' },
      { time: '09:00', name: 'Final Temple: Wat Suan Dok', description: 'Beautiful white-chedi complex with behind-the-scenes monk chat program', cost: 0, type: 'culture', duration: '1 hour' },
      { time: '11:00', name: 'Spa Farewell', description: 'Two-hour traditional Thai massage as a final treat before departure', cost: 15, type: 'leisure', duration: '2 hours' },
      { time: '14:00', name: 'Airport Transfer', description: 'Tuk-tuk or Grab to Chiang Mai International Airport', cost: 8, type: 'transport', duration: '30 min' },
    ],
  },
];

const costarica7Days: DayPlan[] = [
  {
    day: 1,
    title: 'Arrival in San José & Transfer to Arenal',
    location: 'La Fortuna, Arenal',
    activities: [
      { time: '12:00', name: 'Land at Juan Santamaría Airport', description: 'Clear customs and meet your shuttle to La Fortuna — a 3-hour scenic drive through the highlands', cost: 30, type: 'transport', duration: '3.5 hours' },
      { time: '16:00', name: 'Check into Arenal Lodge', description: 'Stunning volcano-view lodge with hot springs access and lush rainforest gardens', cost: 0, type: 'accommodation', duration: '1 hour' },
      { time: '18:00', name: 'Hot Springs at Baldi', description: 'Soak in volcanic hot springs with Arenal Volcano looming overhead — magical at dusk', cost: 40, type: 'leisure', duration: '2 hours' },
      { time: '20:30', name: 'Dinner at Nené\'s Restaurant', description: 'Classic Costa Rican casado (rice, beans, plantains, meat) at a popular local spot', cost: 22, type: 'food', duration: '1.5 hours' },
    ],
  },
  {
    day: 2,
    title: 'Arenal Volcano & Hanging Bridges',
    location: 'Arenal',
    activities: [
      { time: '07:00', name: 'Breakfast at Lodge', description: 'Gallo pinto (rice and beans), tropical fruits, and strong Costa Rican coffee', cost: 12, type: 'food', duration: '1 hour' },
      { time: '08:30', name: 'Arenal Hanging Bridges', description: 'Walk 16 bridges through pristine primary rainforest canopy — toucans, monkeys, sloths likely', cost: 28, type: 'nature', duration: '3 hours' },
      { time: '12:00', name: 'Picnic in the Forest', description: 'Packed lunch from lodge among the sounds of howler monkeys and tropical birds', cost: 0, type: 'food', duration: '1 hour' },
      { time: '14:00', name: 'Canoeing on Lake Arenal', description: 'Kayak or canoe on the massive lake with Arenal Volcano reflected in the water', cost: 30, type: 'nature', duration: '2.5 hours' },
      { time: '18:00', name: 'Volcano Hike Lava Trail', description: 'Guided sunset hike on old lava fields at the base of Arenal for the best volcano views', cost: 20, type: 'nature', duration: '2 hours' },
      { time: '20:30', name: 'Dinner at Don Rufino', description: 'Best restaurant in La Fortuna — fresh ceviche, wagyu beef, and local craft beers', cost: 40, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 3,
    title: 'Waterfall & White Water Rafting',
    location: 'Arenal Region',
    activities: [
      { time: '08:00', name: 'La Fortuna Waterfall', description: '75-meter waterfall plunging into an emerald pool — climb down 500 steps and swim', cost: 18, type: 'nature', duration: '2.5 hours' },
      { time: '11:30', name: 'White Water Rafting on Río Balsa', description: 'Class III-IV rapids through jungle gorges with professional guides — thrilling and safe', cost: 75, type: 'adventure', duration: '4 hours' },
      { time: '16:00', name: 'Maleku Indigenous Village', description: 'Visit the Maleku people, learn traditional crafts, and hear ancient stories', cost: 20, type: 'culture', duration: '1.5 hours' },
      { time: '20:00', name: 'Night Frog Tour', description: 'Guided flashlight tour to spot red-eyed tree frogs, glass frogs, and nocturnal reptiles', cost: 25, type: 'nature', duration: '2 hours' },
    ],
  },
  {
    day: 4,
    title: 'Transfer to Monteverde Cloud Forest',
    location: 'Monteverde',
    activities: [
      { time: '08:00', name: 'Jeep-Boat-Jeep Transfer', description: 'Classic Lake Arenal crossing — jeep to boat, boat across the lake, jeep to Monteverde', cost: 30, type: 'transport', duration: '3 hours' },
      { time: '12:00', name: 'Monteverde Cloud Forest Reserve', description: 'World-famous cloud forest teeming with orchids, quetzals, and constant mist', cost: 25, type: 'nature', duration: '3 hours' },
      { time: '16:00', name: 'Cheese Factory & Coffee Tour', description: 'Sample locally-made Monteverde cheese and freshly roasted single-origin coffee', cost: 20, type: 'food', duration: '1.5 hours' },
      { time: '19:00', name: 'Night Walk in Cloud Forest', description: 'Spot pumas, coatis, kinkajous, and countless insects in their nocturnal world', cost: 22, type: 'nature', duration: '2 hours' },
    ],
  },
  {
    day: 5,
    title: 'Zip-Lining & Canopy',
    location: 'Monteverde',
    activities: [
      { time: '08:00', name: 'Sky Trek Zip-Line', description: 'Costa Rica\'s most famous zip-line: 8 cables, including one 770-meter line over the canopy', cost: 90, type: 'adventure', duration: '3 hours' },
      { time: '12:00', name: 'Lunch at Sofia', description: 'Creative nuevo Latino cuisine in Monteverde\'s most celebrated restaurant', cost: 28, type: 'food', duration: '1.5 hours' },
      { time: '14:00', name: 'Butterfly & Orchid Garden', description: 'Explore enclosed butterfly gardens, hummingbird feeders, and over 500 orchid species', cost: 15, type: 'nature', duration: '2 hours' },
      { time: '17:00', name: 'Selvatura Hanging Bridges', description: 'Sunset walk on 8 hanging bridges through cloud forest — different from Arenal\'s canopy', cost: 30, type: 'nature', duration: '2 hours' },
      { time: '20:00', name: 'Dinner at Trio', description: 'Fusion food with Costa Rican ingredients, candles, and misty mountain views', cost: 32, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 6,
    title: 'Manuel Antonio National Park',
    location: 'Manuel Antonio',
    activities: [
      { time: '07:00', name: 'Drive to Manuel Antonio', description: 'Transfer to Costa Rica\'s most-visited park on the Pacific coast (3.5 hours)', cost: 45, type: 'transport', duration: '3.5 hours' },
      { time: '11:00', name: 'Manuel Antonio National Park', description: 'Hike jungle trails to pristine beaches where white-faced monkeys steal lunches', cost: 20, type: 'nature', duration: '4 hours' },
      { time: '15:30', name: 'Playa Manuel Antonio Swim', description: 'Swim in the calm bay with capuchin monkeys watching from the trees above', cost: 0, type: 'leisure', duration: '1.5 hours' },
      { time: '19:00', name: 'Sunset Dinner at La Luna', description: 'Romantic beachfront dinner with Pacific views and fresh local catch', cost: 50, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 7,
    title: 'Pacific Beach & Departure',
    location: 'Manuel Antonio / San José',
    activities: [
      { time: '07:30', name: 'Sunrise Kayaking', description: 'Early morning sea kayak tour along sea stacks and past sea turtle nesting beaches', cost: 45, type: 'nature', duration: '2 hours' },
      { time: '10:30', name: 'Quepos Farmers Market', description: 'Browse tropical fruits, artisan crafts, and local snacks at the Saturday market', cost: 15, type: 'food', duration: '1.5 hours' },
      { time: '13:00', name: 'Lunch at El Avion', description: 'Unique restaurant inside a retired CIA drug-surveillance plane with coconut ceviche', cost: 35, type: 'food', duration: '1.5 hours' },
      { time: '16:00', name: 'Transfer to San José Airport', description: 'Shared shuttle back to San José for your evening departure', cost: 45, type: 'transport', duration: '3 hours' },
    ],
  },
];

const marrakech7Days: DayPlan[] = [
  {
    day: 1,
    title: 'Arrival & Jemaa el-Fnaa at Dusk',
    location: 'Marrakech',
    activities: [
      { time: '14:00', name: 'Check into Riad', description: 'Hidden behind an unassuming door, your riad reveals a lush courtyard with fountain and orange trees', cost: 0, type: 'accommodation', duration: '1 hour' },
      { time: '16:00', name: 'Riad Rooftop Tea', description: 'Moroccan mint tea and almond cookies on your riad\'s rooftop terrace — views of the medina', cost: 5, type: 'food', duration: '1 hour' },
      { time: '17:30', name: 'Jemaa el-Fnaa at Sunset', description: 'Watch the great square transform: snake charmers, storytellers, and the Atlas Mountains in pink', cost: 0, type: 'culture', duration: '1.5 hours' },
      { time: '20:00', name: 'Dinner at Le Foundouk', description: 'Rooftop restaurant in a restored caravanserai — best bastilla (pigeon pie) in Marrakech', cost: 35, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 2,
    title: 'Medina, Souks & Palaces',
    location: 'Marrakech Medina',
    activities: [
      { time: '09:00', name: 'Bahia Palace', description: 'Breathtaking 19th-century palace with elaborately carved stucco, painted ceilings, and tiled courtyards', cost: 3, type: 'culture', duration: '1.5 hours' },
      { time: '11:00', name: 'Souk Guided Tour', description: 'Navigate the labyrinthine dyers\' souk, spice market, leather tanneries, and metalworkers\' quarter', cost: 20, type: 'culture', duration: '2 hours' },
      { time: '13:30', name: 'Lunch at Café des Épices', description: 'Rooftop views over the spice souk — tagine, couscous, and freshly squeezed orange juice', cost: 15, type: 'food', duration: '1.5 hours' },
      { time: '15:30', name: 'Badi Palace Ruins', description: '16th-century ruined palace with storks nesting in the ramparts — atmospheric and uncrowded', cost: 2, type: 'culture', duration: '1 hour' },
      { time: '17:00', name: 'Saadian Tombs', description: 'Exquisite 16th-century royal necropolis with Italian Carrara marble and cedar carved walls', cost: 3, type: 'culture', duration: '45 min' },
      { time: '20:30', name: 'Jemaa el-Fnaa Food Stalls', description: 'Pull up a stool at one of 100 open-air stalls — harira soup, merguez, snails, and grilled brochettes', cost: 12, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 3,
    title: 'Majorelle Garden & Modern Marrakech',
    location: 'Marrakech Gueliz',
    activities: [
      { time: '08:30', name: 'Majorelle Garden (Early Admission)', description: 'YSL and Bergé\'s cobalt-blue botanical garden — visit before the crowds with a coffee', cost: 10, type: 'nature', duration: '1.5 hours' },
      { time: '10:30', name: 'Yves Saint Laurent Museum', description: 'Stunning museum dedicated to YSL\'s Moroccan-inspired collections and life in Marrakech', cost: 8, type: 'culture', duration: '1.5 hours' },
      { time: '12:30', name: 'Lunch at Grand Café de la Poste', description: 'Colonial-era café in the French Quarter — croque monsieur, salads, and Casablanca beer', cost: 20, type: 'food', duration: '1.5 hours' },
      { time: '15:00', name: 'Hammam Experience', description: 'Traditional Moroccan bath with black soap, kessa scrub, and ghassoul clay mask', cost: 25, type: 'leisure', duration: '2 hours' },
      { time: '20:00', name: 'Dinner at Nomad', description: 'Modern Moroccan cuisine on a gorgeous rooftop — the lamb m\'chermel is unmissable', cost: 30, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 4,
    title: 'Atlas Mountains Day Trip',
    location: 'Atlas Mountains',
    activities: [
      { time: '08:00', name: 'Drive into the Atlas Mountains', description: 'Scenic drive through increasingly dramatic Berber valleys with walled kasbahs', cost: 25, type: 'transport', duration: '2 hours' },
      { time: '10:30', name: 'Ourika Valley Hike', description: 'Trek past terraced Berber villages, argan trees, and clear mountain streams', cost: 10, type: 'nature', duration: '3 hours' },
      { time: '14:00', name: 'Berber Village Lunch', description: 'Home-cooked tagine and Berber flatbread with a local family — unforgettable hospitality', cost: 15, type: 'food', duration: '1.5 hours' },
      { time: '16:30', name: 'Argan Oil Cooperative', description: 'Watch Berber women produce argan oil by hand — sample on bread with honey and amlou', cost: 10, type: 'culture', duration: '1 hour' },
      { time: '20:30', name: 'Dinner at Al Fassia', description: 'Marrakech\'s most celebrated women-run restaurant — definitive Moroccan home cooking', cost: 40, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 5,
    title: 'Cooking Class & Street Food',
    location: 'Marrakech',
    activities: [
      { time: '09:00', name: 'Souk Market Visit with Chef', description: 'Choose ingredients for today\'s cooking class from the spice souk and food market', cost: 0, type: 'food', duration: '1.5 hours' },
      { time: '11:00', name: 'Moroccan Cooking Class', description: 'Make harira soup, tagine, preserved lemons, and bastilla in a gorgeous riad kitchen', cost: 65, type: 'food', duration: '3.5 hours' },
      { time: '15:00', name: 'Ben Youssef Madrasa', description: '14th-century Quranic school with some of Morocco\'s finest Islamic architecture and tilework', cost: 2, type: 'culture', duration: '1.5 hours' },
      { time: '17:00', name: 'Moroccan Argan Spa', description: 'Argan oil massage and rose water facial at a luxury riad spa', cost: 35, type: 'leisure', duration: '1.5 hours' },
      { time: '20:30', name: 'Dinner at Dar Marjana', description: 'Seven-course Moroccan feast in a 200-year-old mansion with belly dancers and musicians', cost: 55, type: 'food', duration: '3 hours' },
    ],
  },
  {
    day: 6,
    title: 'Essaouira Coastal Day Trip',
    location: 'Essaouira',
    activities: [
      { time: '08:00', name: 'Drive to Essaouira', description: 'Two-hour drive through argan forest to the windswept blue-and-white Atlantic port', cost: 20, type: 'transport', duration: '2 hours' },
      { time: '10:30', name: 'Medina & Ramparts Walk', description: 'UNESCO-listed medina where Game of Thrones filmed Astapor — blue boats in the harbor', cost: 0, type: 'culture', duration: '2 hours' },
      { time: '13:00', name: 'Fish Lunch at Harbour Stalls', description: 'Choose your fish from the morning catch, grilled on the spot with chermoula sauce', cost: 18, type: 'food', duration: '1.5 hours' },
      { time: '15:00', name: 'Atlantic Beach & Gnawa Music', description: 'Windswept beach walk and catch Gnawa musicians performing in the square', cost: 0, type: 'leisure', duration: '2 hours' },
      { time: '20:00', name: 'Return & Rooftop Dinner', description: 'Back to Marrakech — rooftop mint tea and pastilla at your riad', cost: 25, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 7,
    title: 'Final Souvenirs & Departure',
    location: 'Marrakech',
    activities: [
      { time: '08:30', name: 'Breakfast at Riad', description: 'Final Moroccan breakfast — msemen flatbread, argan honey, olive oil, and strong tea', cost: 0, type: 'food', duration: '1 hour' },
      { time: '10:00', name: 'Last Souk Shopping', description: 'Pick up leather goods, spices, lanterns, and ceramics from your favorite souk stalls', cost: 50, type: 'leisure', duration: '2 hours' },
      { time: '13:00', name: 'Lunch at Café Clock', description: 'Famous camel burger and cardamom coffee — expat institution with traditional crafts upstairs', cost: 18, type: 'food', duration: '1.5 hours' },
      { time: '15:30', name: 'Airport Transfer', description: 'Petit taxi to Marrakech Menara Airport', cost: 8, type: 'transport', duration: '30 min' },
    ],
  },
];

const newzealand7Days: DayPlan[] = [
  {
    day: 1,
    title: 'Arrival in Queenstown & Lake District',
    location: 'Queenstown',
    activities: [
      { time: '13:00', name: 'Arrive Queenstown Airport', description: 'Land surrounded by the Remarkables mountain range — already jaw-dropping', cost: 0, type: 'transport', duration: '30 min' },
      { time: '15:00', name: 'Check into Lakeside Lodge', description: 'Boutique lodge with Lake Wakatipu views and Cecil Peak beyond', cost: 0, type: 'accommodation', duration: '1 hour' },
      { time: '16:30', name: 'Queenstown Gardens & Lakefront', description: 'Scenic walk along Lake Wakatipu with the Remarkables reflected in still water', cost: 0, type: 'nature', duration: '2 hours' },
      { time: '19:00', name: 'Dinner at Vudu Café & Larder', description: 'Central Otago lamb burger and local craft beer on the main drag', cost: 38, type: 'food', duration: '1.5 hours' },
      { time: '21:00', name: 'Skyline Gondola Night Ride', description: 'Gondola to Bob\'s Peak for stunning Queenstown night views and luge races', cost: 32, type: 'leisure', duration: '2 hours' },
    ],
  },
  {
    day: 2,
    title: 'Milford Sound Day Cruise',
    location: 'Milford Sound',
    activities: [
      { time: '06:00', name: 'Early Depart for Milford Sound', description: 'Epic coach journey through Fiordland National Park — 5 hours of wilderness scenery', cost: 25, type: 'transport', duration: '5 hours' },
      { time: '12:30', name: 'Milford Sound Cruise', description: 'Two-hour cruise past Mitre Peak, thundering waterfalls, dolphins, and fur seals', cost: 80, type: 'nature', duration: '2 hours' },
      { time: '15:00', name: 'Underground Discovery Centre', description: 'Excellent audio guide explaining the geology and ecology of this UNESCO World Heritage fjord', cost: 15, type: 'culture', duration: '1 hour' },
      { time: '20:30', name: 'Return to Queenstown', description: 'Evening return with Southern Alps alpenglow on the drive home', cost: 0, type: 'transport', duration: '5 hours' },
    ],
  },
  {
    day: 3,
    title: 'Adventure Day: Bungee & Shotover Jet',
    location: 'Queenstown',
    activities: [
      { time: '09:00', name: 'Kawarau Bridge Bungee', description: 'World\'s first commercial bungee jump — 43m plunge over the stunning Kawarau Gorge', cost: 150, type: 'adventure', duration: '2 hours' },
      { time: '12:00', name: 'Lunch at Fergburger', description: 'Queenstown\'s legendary burger institution — expect a queue, worth every second', cost: 16, type: 'food', duration: '1 hour' },
      { time: '14:00', name: 'Shotover Jet Boat', description: 'World-famous 25-minute jet boat ride through the Shotover River Canyons at 85 km/h', cost: 115, type: 'adventure', duration: '1 hour' },
      { time: '16:30', name: 'Arrowtown Heritage Walk', description: 'Charming 19th-century gold rush village with intact stone buildings and Chinese settlement', cost: 0, type: 'culture', duration: '2 hours' },
      { time: '20:00', name: 'Dinner at Aosta', description: 'Northern Italian fine dining in Arrowtown — handmade pasta with Central Otago wine', cost: 75, type: 'food', duration: '2.5 hours' },
    ],
  },
  {
    day: 4,
    title: 'Wanaka & Treble Cone',
    location: 'Wanaka',
    activities: [
      { time: '08:30', name: 'Drive to Wanaka via Crown Range', description: 'NZ\'s highest sealed road with panoramic views of the Southern Alps — stop at every lookout', cost: 0, type: 'transport', duration: '1.5 hours' },
      { time: '10:30', name: 'Roys Peak Hike', description: 'Iconic 3-hour climb to a ridge with the most photographed view in New Zealand', cost: 0, type: 'nature', duration: '6 hours' },
      { time: '16:30', name: 'Lake Wanaka Swim', description: 'Cool off in the clearest glacier-fed lake water with those same mountains all around you', cost: 0, type: 'nature', duration: '1 hour' },
      { time: '20:00', name: 'Dinner at Francesca\'s Italian Kitchen', description: 'Authentic Neapolitan pizza in a cozy Wanaka restaurant beloved by locals', cost: 40, type: 'food', duration: '1.5 hours' },
    ],
  },
  {
    day: 5,
    title: 'Central Otago Winery Trail',
    location: 'Central Otago',
    activities: [
      { time: '09:30', name: 'Amisfield Winery', description: 'Stunning schist-stone cellar door — world\'s southernmost Pinot Noir region', cost: 20, type: 'food', duration: '1.5 hours' },
      { time: '12:00', name: 'Lunch at Amisfield Bistro', description: 'Outstanding farm-to-table lunch paired with their award-winning Pinot Gris', cost: 55, type: 'food', duration: '2 hours' },
      { time: '14:30', name: 'Gibbston Valley Winery & Cave', description: 'Historic winery with a remarkable cheese cave carved into schist rock', cost: 15, type: 'food', duration: '1.5 hours' },
      { time: '17:00', name: 'Bunkers NZ', description: 'Quirky hidden bar inside an old gold miner\'s bunker — craft cocktails and local cheese boards', cost: 30, type: 'food', duration: '1.5 hours' },
      { time: '20:00', name: 'Dinner at Rata', description: 'NZ\'s most celebrated chef Josh Emett\'s flagship — seasonal ingredients, exceptional wine list', cost: 90, type: 'food', duration: '2.5 hours' },
    ],
  },
  {
    day: 6,
    title: 'Mount Aspiring National Park',
    location: 'Matukituki Valley',
    activities: [
      { time: '07:30', name: 'Drive to Matukituki Valley', description: 'Wild drive into the remote wilderness at the foot of Mount Aspiring — NZ\'s "Matterhorn"', cost: 0, type: 'transport', duration: '2 hours' },
      { time: '10:00', name: 'Rob Roy Glacier Track', description: 'Best day hike in NZ: 4-hour return through beech forest to a hanging glacier with avalanche viewing area', cost: 0, type: 'nature', duration: '4 hours' },
      { time: '15:00', name: 'Picnic by Glacier Stream', description: 'Lunch beside a turquoise glacial melt stream — pure silence except for the wind', cost: 0, type: 'nature', duration: '1 hour' },
      { time: '19:30', name: 'Stargazing at Dark Sky Reserve', description: 'Central Otago is an International Dark Sky Reserve — guided constellation tour', cost: 25, type: 'nature', duration: '2 hours' },
    ],
  },
  {
    day: 7,
    title: 'Skydiving & Departure',
    location: 'Queenstown',
    activities: [
      { time: '08:00', name: 'Skydive Queenstown', description: 'Tandem skydive from 15,000 ft — 60-second freefall over Lake Wakatipu, the Remarkables, and Milford Sound', cost: 280, type: 'adventure', duration: '2.5 hours' },
      { time: '11:30', name: 'Brunch at Bespoke Kitchen', description: 'Celebrated Queenstown brunch spot — truffle eggs and avocado toast to celebrate surviving', cost: 28, type: 'food', duration: '1.5 hours' },
      { time: '14:00', name: 'Final Lake Walk & Souvenirs', description: 'Merino wool, Manuka honey, pounamu (greenstone) — pick up NZ treasures to take home', cost: 30, type: 'leisure', duration: '2 hours' },
      { time: '17:00', name: 'Airport Departure', description: 'Taxi to Queenstown Airport with mountains visible until the last moment', cost: 20, type: 'transport', duration: '30 min' },
    ],
  },
];

const kyoto7Days: DayPlan[] = [
  {
    day: 1,
    title: 'Arrival & Gion at Dusk',
    location: 'Kyoto',
    activities: [
      { time: '14:00', name: 'Arrive Kyoto Station', description: 'Shinkansen from Tokyo or direct from Osaka airport — a dramatic architectural gateway to the city', cost: 0, type: 'transport', duration: '30 min' },
      { time: '15:00', name: 'Check into Machiya Townhouse', description: 'Traditional Kyoto townhouse with tatami rooms, sliding screens, and a small garden', cost: 0, type: 'accommodation', duration: '1 hour' },
      { time: '17:00', name: 'Gion Evening Walk', description: 'Kyoto\'s geisha district at dusk — stone-paved Hanamikoji Street and Shirakawa canal lanterns', cost: 0, type: 'culture', duration: '2 hours' },
      { time: '20:00', name: 'Kaiseki Dinner at Kikunoi', description: 'Multi-course seasonal kaiseki at a 3-star Michelin restaurant — Japan\'s highest art of cooking', cost: 120, type: 'food', duration: '3 hours' },
    ],
  },
  {
    day: 2,
    title: 'Fushimi Inari & Southern Kyoto',
    location: 'Fushimi',
    activities: [
      { time: '06:00', name: 'Fushimi Inari at Dawn', description: '10,000 vermilion torii gates winding 4km up Mount Inari — ghostly and peaceful before crowds', cost: 0, type: 'culture', duration: '3 hours' },
      { time: '09:30', name: 'Sake Brewery Tour', description: 'Fushimi is Kyoto\'s sake district — tour a 300-year-old brewery with tasting', cost: 15, type: 'food', duration: '1.5 hours' },
      { time: '12:00', name: 'Lunch at Tsukimi', description: 'Handmade tofu kaiseki in the heart of Fushimi — silky house tofu with dashi broth', cost: 25, type: 'food', duration: '1.5 hours' },
      { time: '14:30', name: 'Tofukuji Temple & Garden', description: 'Jaw-dropping Zen garden and sweeping maple grove — best temple few tourists find', cost: 4, type: 'culture', duration: '2 hours' },
      { time: '19:00', name: 'Pontocho Alley Dinner', description: 'River-view kyo-ryori in a narrow lantern-lit alley — order the duck and seasonal vegetables', cost: 50, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 3,
    title: 'Arashiyama Bamboo & Temples',
    location: 'Arashiyama',
    activities: [
      { time: '07:30', name: 'Arashiyama Bamboo Grove at Dawn', description: 'Walk through soaring bamboo before crowds arrive — otherworldly light and silence', cost: 0, type: 'nature', duration: '1 hour' },
      { time: '09:00', name: 'Tenryuji Temple & Garden', description: 'UNESCO garden with borrowed scenery of the Arashiyama mountains beyond the pond', cost: 5, type: 'culture', duration: '1.5 hours' },
      { time: '11:00', name: 'Jojakko-ji Hidden Temple', description: 'Mossy stone steps, three-story pagoda, maple trees — one of Kyoto\'s secret gems', cost: 3, type: 'culture', duration: '1 hour' },
      { time: '13:00', name: 'Lunch: Soba at Arashiyama Yoshimura', description: 'Handmade buckwheat soba with Katsura River and mountain views', cost: 18, type: 'food', duration: '1.5 hours' },
      { time: '15:00', name: 'Sagano Bamboo Scenic Railway', description: 'Open-air romantic train through the Hozu River Gorge past autumn foliage', cost: 8, type: 'nature', duration: '1 hour' },
      { time: '19:30', name: 'Nishiki Market Evening', description: '"Kyoto\'s Kitchen" — 400+ year old covered market with pickles, tofu, street food', cost: 25, type: 'food', duration: '2 hours' },
    ],
  },
  {
    day: 4,
    title: 'Tea Ceremony & Zen Temples',
    location: 'Higashiyama',
    activities: [
      { time: '09:00', name: 'Traditional Tea Ceremony', description: 'Ochaya experience: proper matcha preparation and wagashi sweets in a historic teahouse', cost: 40, type: 'culture', duration: '1.5 hours' },
      { time: '11:00', name: 'Philosopher\'s Path in Bloom', description: 'Cherry-blossom-lined canal walk connecting 10 significant temples over 2km', cost: 0, type: 'nature', duration: '2 hours' },
      { time: '13:30', name: 'Lunch: Obanzai at Hyotei', description: 'Kyoto\'s traditional home-cooking style — dozens of small seasonal dishes, beautifully presented', cost: 35, type: 'food', duration: '1.5 hours' },
      { time: '15:30', name: 'Nanzenji Temple Complex', description: 'Grand sanmon gate, Zen garden, and a Victorian aqueduct hidden inside an ancient temple', cost: 5, type: 'culture', duration: '2 hours' },
      { time: '18:00', name: 'Kyoto Craft Beer Tasting', description: 'Kyoto Brewing Co. taproom — innovative sake-inspired craft beers in a converted sake warehouse', cost: 20, type: 'food', duration: '1.5 hours' },
      { time: '20:00', name: 'Dinner at Kinobu', description: 'Family-run kaiseki in a serene machiya — the delicate dashi is a revelation', cost: 80, type: 'food', duration: '2.5 hours' },
    ],
  },
  {
    day: 5,
    title: 'Nara Day Trip & Deer Park',
    location: 'Nara',
    activities: [
      { time: '08:30', name: 'Train to Nara', description: '35-minute express to Japan\'s ancient first capital (710 AD) through Yamato countryside', cost: 7, type: 'transport', duration: '35 min' },
      { time: '09:30', name: 'Todaiji Temple & Great Buddha', description: 'World\'s largest wooden building housing a 15-meter bronze Buddha — overwhelming in scale', cost: 5, type: 'culture', duration: '2 hours' },
      { time: '12:00', name: 'Deer Park Picnic', description: 'Over 1,000 free-roaming sacred deer bow politely asking for shika senbei (deer crackers)', cost: 5, type: 'nature', duration: '2 hours' },
      { time: '14:30', name: 'Kasuga Taisha Shrine', description: 'Japan\'s most sacred Shinto shrine with 3,000 stone and bronze lanterns through an ancient forest', cost: 5, type: 'culture', duration: '1.5 hours' },
      { time: '17:30', name: 'Return to Kyoto', description: 'Evening train back through the Yamato plain', cost: 7, type: 'transport', duration: '35 min' },
      { time: '20:00', name: 'Dinner: Ramen at Menya Inoichi', description: 'Michelin-starred ramen — clear dashi broth with impeccable ingredients', cost: 15, type: 'food', duration: '1 hour' },
    ],
  },
  {
    day: 6,
    title: 'Geisha Culture & Nishiki Market',
    location: 'Kyoto',
    activities: [
      { time: '09:00', name: 'Kimono Rental & Styling', description: 'Dress in a traditional kimono with proper obi and accessories — professional styling at Yumeyakata', cost: 30, type: 'culture', duration: '1.5 hours' },
      { time: '11:00', name: 'Kiyomizudera Temple', description: 'The iconic temple with its wooden stage jutting over the hillside — ethereal in morning light', cost: 4, type: 'culture', duration: '2 hours' },
      { time: '13:30', name: 'Lunch at Kagizen Yoshifusa', description: 'Kyoto\'s oldest (1716) confectionery shop — matcha ice cream and traditional wagashi set', cost: 20, type: 'food', duration: '1 hour' },
      { time: '15:00', name: 'Nijo Castle', description: 'Shogun\'s palace with "nightingale floors" that squeak to detect assassins — stunning painted screens', cost: 6, type: 'culture', duration: '2 hours' },
      { time: '20:00', name: 'Gion Hatanaka Kaiseki', description: 'The most authentic geisha dinner experience — performances by real maiko (apprentice geisha)', cost: 200, type: 'food', duration: '3 hours' },
    ],
  },
  {
    day: 7,
    title: 'Morning Markets & Departure',
    location: 'Kyoto',
    activities: [
      { time: '07:00', name: 'Toji Temple Flea Market', description: 'Held on the 21st of each month — 1,200 stalls of antiques, ceramics, textiles under a 5-story pagoda', cost: 0, type: 'culture', duration: '2 hours' },
      { time: '10:00', name: 'Matcha Experience at Ippodo', description: 'Japan\'s finest tea house since 1717 — guided tasting flight of premium grade matcha', cost: 18, type: 'food', duration: '1 hour' },
      { time: '12:00', name: 'Final Lunch: Tempura at Yoshikawa', description: 'Counter tempura lunch watching the chef fry in sesame oil — the vegetables are revelatory', cost: 45, type: 'food', duration: '1.5 hours' },
      { time: '14:30', name: 'Shinkansen to Airport', description: 'Take the Haruka Express to Kansai International Airport — Japan\'s famously punctual service', cost: 12, type: 'transport', duration: '1.5 hours' },
    ],
  },
];

// ─── BUDGETS (per couple, 7 days) ─────────────────────────────────────────────

export const budgets: Record<string, BudgetBreakdown> = {
  lisbon: {
    flights: 900,
    accommodation: 700,
    food: 560,
    activities: 180,
    transport: 120,
    misc: 140,
    total: 2600,
    currency: 'USD',
  },
  chiangmai: {
    flights: 800,
    accommodation: 350,
    food: 280,
    activities: 240,
    transport: 80,
    misc: 100,
    total: 1850,
    currency: 'USD',
  },
  costarica: {
    flights: 700,
    accommodation: 840,
    food: 490,
    activities: 680,
    transport: 190,
    misc: 150,
    total: 3050,
    currency: 'USD',
  },
  marrakech: {
    flights: 750,
    accommodation: 560,
    food: 420,
    activities: 280,
    transport: 90,
    misc: 120,
    total: 2220,
    currency: 'USD',
  },
  newzealand: {
    flights: 1800,
    accommodation: 980,
    food: 700,
    activities: 1050,
    transport: 200,
    misc: 200,
    total: 4930,
    currency: 'USD',
  },
  kyoto: {
    flights: 1100,
    accommodation: 840,
    food: 700,
    activities: 340,
    transport: 160,
    misc: 180,
    total: 3320,
    currency: 'USD',
  },
};

export const itineraries: Record<string, DayPlan[]> = {
  lisbon: lisbon7Days,
  chiangmai: chiangmai7Days,
  costarica: costarica7Days,
  marrakech: marrakech7Days,
  newzealand: newzealand7Days,
  kyoto: kyoto7Days,
};

// ─── MATCH LOGIC ─────────────────────────────────────────────────────────────

const destinationPreferences: Record<string, string[]> = {
  lisbon: ['food', 'culture', 'history'],
  chiangmai: ['food', 'nature', 'culture', 'history'],
  costarica: ['nature', 'adventure', 'beach'],
  marrakech: ['food', 'culture', 'history', 'shopping'],
  newzealand: ['nature', 'adventure'],
  kyoto: ['food', 'culture', 'history', 'nature'],
};

function scoreDestination(dest: Destination, request: TripRequest): { score: number; reasons: string[] } {
  const budget = budgets[dest.id];
  const prefs = destinationPreferences[dest.id];
  const reasons: string[] = [];
  let score = 0;

  // Budget fit (40 pts)
  const budgetRatio = request.budget / budget.total;
  if (budgetRatio >= 0.8 && budgetRatio <= 1.5) {
    if (budgetRatio >= 1.0) {
      score += 40;
      const surplus = Math.round(request.budget - budget.total);
      reasons.push(`Fits your $${request.budget.toLocaleString()} budget with $${surplus.toLocaleString()} to spare`);
    } else {
      score += Math.round(40 * budgetRatio);
      reasons.push(`Close to your budget — slight stretch of $${Math.round(budget.total - request.budget).toLocaleString()}`);
    }
  } else if (budgetRatio < 0.8) {
    score += 10; // way over budget
    reasons.push('Over budget but exceptional value');
  } else {
    score += 35;
    reasons.push('Excellent value for your budget');
  }

  // Preference overlap (up to 50 pts)
  const overlap = request.preferences.filter(p => prefs.includes(p));
  const prefScore = Math.round((overlap.length / Math.max(request.preferences.length, 1)) * 50);
  score += prefScore;

  overlap.forEach(pref => {
    const labels: Record<string, string> = {
      food: 'World-class food scene matching your culinary interests',
      nature: 'Stunning natural landscapes perfect for nature lovers',
      culture: 'Rich cultural heritage and authentic local experiences',
      history: 'Fascinating historical sites and ancient heritage',
      beach: 'Beautiful beaches and coastal activities',
      adventure: 'Thrilling adventure activities',
      shopping: 'Vibrant markets and unique shopping',
      relaxation: 'Perfect for rest and rejuvenation',
    };
    if (labels[pref]) reasons.push(labels[pref]);
  });

  // Month/season bonus (10 pts)
  const goodMonths: Record<string, string[]> = {
    lisbon: ['April', 'May', 'June', 'July', 'August', 'September', 'October'],
    chiangmai: ['November', 'December', 'January', 'February', 'March'],
    costarica: ['December', 'January', 'February', 'March', 'April'],
    marrakech: ['March', 'April', 'May', 'September', 'October', 'November'],
    newzealand: ['December', 'January', 'February', 'March'],
    kyoto: ['March', 'April', 'May', 'October', 'November'],
  };
  if (goodMonths[dest.id]?.includes(request.month)) {
    score += 10;
    reasons.push(`${request.month} is peak season — perfect timing`);
  }

  return { score: Math.min(score, 100), reasons };
}

export function getSuggestedTrips(request: TripRequest): TripPlan[] {
  const minBudget = request.budget * 0.5;
  const maxBudget = request.budget * 1.4;

  const scored = destinations
    .filter(dest => {
      const budget = budgets[dest.id];
      return budget.total >= minBudget && budget.total <= maxBudget;
    })
    .map(dest => {
      const { score, reasons } = scoreDestination(dest, request);
      return {
        ...dest,
        matchScore: score,
        matchReasons: reasons,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 3);

  // If filtering removed too many, relax budget constraint
  if (scored.length < 2) {
    const fallback = destinations
      .map(dest => {
        const { score, reasons } = scoreDestination(dest, request);
        return { ...dest, matchScore: score, matchReasons: reasons };
      })
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 3);

    return fallback.map(dest => ({
      destination: dest,
      itinerary: itineraries[dest.id],
      budget: budgets[dest.id],
    }));
  }

  return scored.map(dest => ({
    destination: dest,
    itinerary: itineraries[dest.id],
    budget: budgets[dest.id],
  }));
}
