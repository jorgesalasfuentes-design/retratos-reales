'use client'

import { useState, useRef, useEffect, useCallback } from 'react'

// ─── Style & Variant Data (unchanged) ───
const STYLES = [
  {
    id: 'royal',
    name: 'Royal Portrait',
    emoji: '👑',
    description: 'Majestic royalty with crowns, thrones & regal splendor',
    skeleton: 'Transform this dog into majestic royalty in the style of classical European court portraits. Rich oil painting aesthetic with dramatic lighting, luxurious fabrics, gold accents, and regal atmosphere.',
  },
  {
    id: 'popart',
    name: 'Pop Art',
    emoji: '🎨',
    description: 'Bold colors, Warhol vibes & comic book energy',
    skeleton: 'Transform this dog into vibrant pop art in the style of Andy Warhol, Roy Lichtenstein, and Keith Haring. Bold graphic shapes, high contrast, primary colors, Ben-Day dots, heavy black outlines.',
  },
  {
    id: 'astronaut',
    name: 'Space Explorer',
    emoji: '🚀',
    description: 'Astronaut adventures among the stars & planets',
    skeleton: 'Transform this dog into a heroic space explorer. Detailed astronaut suits, cosmic settings, scientific equipment, and the wonder of space exploration. Dog\'s face/fur clearly visible through helmet visor.',
  },
  {
    id: 'renaissance',
    name: 'Renaissance Master',
    emoji: '🎭',
    description: 'Classical paintings worthy of the great museums',
    skeleton: 'Transform this dog into a subject worthy of Renaissance masters like Titian, Raphael, Vermeer, and Rembrandt. Rich oil painting technique, masterful use of light and shadow, sumptuous textures.',
  },
  {
    id: 'fantasy',
    name: 'Fantasy Hero',
    emoji: '🐉',
    description: 'Epic adventures with dragons, magic & legendary quests',
    skeleton: 'Transform this dog into an epic fantasy hero. High fantasy aesthetic with magical elements, mythical creatures, enchanted landscapes, and heroic adventure.',
  },
  {
    id: 'noir',
    name: 'Film Noir',
    emoji: '🎬',
    description: 'Mysterious detective vibes in shadowy black & white',
    skeleton: 'Transform this dog into a classic film noir character. 1940s detective aesthetic with dramatic shadows, venetian blinds, rain-slicked streets, and mysterious atmosphere.',
  },
  {
    id: 'japanese',
    name: 'Japanese Art',
    emoji: '🌸',
    description: 'Ukiyo-e woodblocks, anime style & cherry blossoms',
    skeleton: 'Transform this dog into beautiful Japanese art styles including ukiyo-e woodblock prints, Studio Ghibli animation, and traditional Japanese painting.',
  },
  {
    id: 'cyberpunk',
    name: 'Cyberpunk',
    emoji: '🤖',
    description: 'Neon-soaked future with tech upgrades & city lights',
    skeleton: 'Transform this dog into a cyberpunk character in a neon-drenched dystopian future. High-tech low-life aesthetic with cybernetic enhancements, holographic displays, and rain-slicked streets.',
  },
  {
    id: 'go_crazy',
    name: 'GO CRAZY',
    emoji: '🌈',
    description: 'Totally random, wildly unexpected, always surprising!',
    skeleton: 'Create a wildly unexpected, surreal, and surprising scene featuring this dog. Break conventions, mix genres, embrace absurdity, and create something nobody would expect.',
  },
]

const STYLE_VARIANTS = {
  royal: [
    { id: 1, title: 'The Crowned Monarch', prompt: 'This regal dog as a powerful king seated on an ornate golden throne, wearing an ermine-trimmed crimson velvet robe, a magnificent crown encrusted with rubies and sapphires, holding a golden scepter. Throne room with towering marble columns, crystal chandeliers, and velvet drapes. Oil painting style with rich impasto brushwork, dramatic candlelight creating deep shadows.' },
    { id: 2, title: 'Napoleonic General', prompt: 'This distinguished dog as Napoleon Bonaparte at the height of power, standing confidently in an ornate war room, one paw resting on military maps. Wearing the iconic bicorne hat, dark blue military coat with gold epaulettes, white breeches, tall black boots, gleaming sword at hip. Expression of supreme confidence. Dramatic candlelight, oil painting style reminiscent of Jacques-Louis David.' },
    { id: 3, title: 'Victorian Aristocrat', prompt: 'This elegant dog as a Victorian-era aristocrat taking afternoon tea in a lavish parlor. Wearing a silk top hat, monocle, perfectly tailored morning coat, and holding a delicate teacup with pinky raised. Ornate wallpaper, antique furniture, silver tea service. Soft window light, painterly style of John Singer Sargent.' },
    { id: 4, title: 'Medieval Queen', prompt: 'This majestic dog as a medieval queen in a castle tower, wearing an elaborate gown of deep purple velvet with gold embroidery, a tall pointed hennin headdress with flowing veil, pearl necklaces draped elegantly. Gothic window showing kingdom below, illuminated manuscript on reading stand. Rich medieval painting style with gold leaf accents.' },
    { id: 5, title: 'Egyptian Pharaoh', prompt: 'This divine dog as an Egyptian Pharaoh seated on a golden throne shaped like a sphinx, wearing the double crown of Upper and Lower Egypt, elaborate gold collar with lapis lazuli and turquoise, holding crook and flail. Temple interior with hieroglyphic walls, torchlight casting dramatic shadows.' },
    { id: 6, title: 'Sun King at Versailles', prompt: 'This magnificent dog as Louis XIV, the Sun King, in the Hall of Mirrors at Versailles. Wearing an enormous powdered wig, gold and blue brocade coat with lace cuffs, red-heeled shoes, sun medallion. Hundreds of candles reflected infinitely in mirrors. Baroque splendor, painterly style of Hyacinthe Rigaud.' },
    { id: 7, title: 'Tudor Royalty', prompt: 'This imposing dog in the style of Henry VIII, wearing a magnificent doublet with slashed sleeves showing gold silk, jeweled chains across chest, flat cap with feather and brooch. Standing in a Tudor great hall with tapestries and roaring fireplace. Bold pose, hands on hips. Hans Holbein portrait style.' },
    { id: 8, title: 'Russian Tsar', prompt: 'This commanding dog as a Russian Tsar in the Winter Palace, wearing an imperial white uniform with gold braid, crimson sash with medals and orders, Fabergé egg displayed nearby. Standing before a massive portrait of ancestors, crystal chandelier above. Dramatic side lighting, classical Russian portraiture style.' },
    { id: 9, title: 'Samurai Warlord', prompt: 'This fierce dog as a Japanese daimyo warlord in elaborate ceremonial armor with golden accents, kabuto helmet with dramatic crescent crest, seated on silk cushions. Katana displayed reverently, cherry blossoms visible through shoji screens. Japanese painting style meets Western oil technique.' },
    { id: 10, title: 'Coronation Moment', prompt: 'This momentous dog being crowned at Westminster Abbey, wearing coronation robes of purple velvet and ermine, archbishop placing crown on head. Packed abbey, golden light streaming through windows, choir singing. Historic David-style coronation painting.' },
  ],
  popart: [
    { id: 1, title: 'Warhol Four Panel', prompt: 'This dog\'s face in classic Andy Warhol four-panel grid, each panel a different bold color combination: hot pink and yellow, electric blue and orange, lime green and purple, red and cyan. Heavy black outlines, simplified pop art features, screen print texture, iconic Marilyn Monroe treatment.' },
    { id: 2, title: 'Comic Book Hero', prompt: 'This dog as comic book superhero with Ben-Day dots pattern, wearing cape and mask, dramatic pose with paw raised. Speech bubble saying "WOOF!" in bold comic lettering. Primary colors red yellow blue, thick black outlines, Lichtenstein style.' },
    { id: 3, title: 'Campbell\'s Soup Star', prompt: 'This dog\'s portrait on a giant Campbell\'s soup can label, "Cream of Dog" flavor, classic red and white color scheme with gold medallion. Warhol soup can homage, clean graphic design, museum-worthy.' },
    { id: 4, title: 'Keith Haring Dance', prompt: 'This dog in Keith Haring style, simplified into bold black outline figure, dancing with radiating lines of movement, surrounded by Haring\'s signature barking dogs and hearts. Bright primary colors on solid background.' },
    { id: 5, title: 'BLAM Action', prompt: 'This dog bursting through comic panel with "BLAM!" explosion effect, dynamic action pose, yellow starburst background, red and blue costume, pure comic book energy.' },
    { id: 6, title: 'Rainbow Repeat', prompt: 'This dog\'s face repeated in rainbow spectrum grid, each iteration a different vibrant hue from red through violet. Warhol print technique, celebration of color, psychedelic arrangement.' },
    { id: 7, title: 'Crying Comic', prompt: 'This dog in Lichtenstein crying girl style, single dramatic tear, thought bubble "I can\'t believe I ate the whole shoe", Ben-Day dots pattern, melodramatic comic romance aesthetic.' },
    { id: 8, title: 'Banana Dog', prompt: 'This dog peeling out of giant Warhol banana, surprised expression, bright yellow banana against white background. Velvet Underground album homage, minimal but striking, gallery art style.' },
    { id: 9, title: 'Dollar Sign Pup', prompt: 'This dog surrounded by giant Warhol-style dollar signs in neon colors, wearing gold chains and sunglasses, nouveau riche pop art energy. Electric colors, repeated patterns, wealth and excess.' },
    { id: 10, title: 'POW Surprise', prompt: 'This dog with "POW!" burst behind head, surprised wide eyes, comic book revelation moment, yellow starburst, red and blue accents.' },
  ],
  astronaut: [
    { id: 1, title: 'First Moon Landing', prompt: 'This heroic dog taking first steps on the Moon, planting flag with paw print emblem, Earth rising over lunar horizon. Classic Apollo-style spacesuit with gold visor raised showing proud face. Bootprints in grey dust, American flag nearby, IMAX documentary quality.' },
    { id: 2, title: 'Space Station Scientist', prompt: 'This curious dog floating in zero gravity inside the ISS, wearing light blue flight suit with patches, surrounded by floating kibble pieces being caught mid-air. Earth visible through cupola window, experiment equipment in background, playful weightlessness.' },
    { id: 3, title: 'Mars Pioneer', prompt: 'This brave dog as first explorer on Mars, orange SpaceX-style suit against red desert landscape, Olympus Mons in distance. Dust devils swirling, rover nearby, Earth as tiny blue dot in salmon sky. Historic moment, determination in eyes.' },
    { id: 4, title: 'Spacewalk Repair', prompt: 'This skilled dog on EVA spacewalk, tethered to space station, using tools to repair solar panels. Stars wheeling in background, Earth\'s terminator line visible. Detailed white EMU suit with NASA patches, helmet lights on, professional astronaut portrait.' },
    { id: 5, title: 'Laika\'s Legacy', prompt: 'This pioneering dog in vintage Soviet cosmonaut suit inside Sputnik-era capsule, analog instruments glowing, viewing Earth through tiny porthole. Warm orange interior lighting, proud CCCP patches, heroic space race portrait, tribute to Laika.' },
    { id: 6, title: 'Jupiter Approach', prompt: 'This awestruck dog viewing Jupiter through spacecraft window, Great Red Spot dominating view, swirling cloud bands in orange and white. Face pressed to glass in wonder, space helmet beside, sense of cosmic scale.' },
    { id: 7, title: 'Astronaut Chef', prompt: 'This creative dog preparing space food in ISS galley, wearing chef hat over helmet, floating tortillas and sauce packets everywhere. Comical zero-g cooking chaos, velcro containers stuck to walls, culinary space adventure.' },
    { id: 8, title: 'Saturn\'s Rings', prompt: 'This amazed dog piloting small craft through Saturn\'s rings, ice particles sparkling around, massive planet filling background. Cockpit instruments glowing, careful navigation through cosmic obstacle course.' },
    { id: 9, title: 'Rescue Mission', prompt: 'This heroic dog performing daring space rescue, reaching for stranded astronaut\'s hand, emergency lights flashing. Damaged spacecraft in background, clock ticking, courageous action.' },
    { id: 10, title: 'Orbital Sunrise', prompt: 'This contemplative dog watching orbital sunrise through window, thin atmosphere layers glowing rainbow colors, new perspective on home. Quiet moment of cosmic beauty appreciation.' },
  ],
  renaissance: [
    { id: 1, title: 'Vermeer\'s Study', prompt: 'This contemplative dog reading letter by window, soft north light illuminating fur, Vermeer\'s signature pearl-like lighting. Dutch interior with blue and yellow accents, maps on wall, quiet domestic moment, museum-quality oil painting.' },
    { id: 2, title: 'Medici Banker', prompt: 'This wealthy dog as Florentine banker at counting table, rich velvet robes, examining gold coins with magnifying glass. Renaissance palazzo interior, ledgers and contracts, Bronzino\'s cool precision style.' },
    { id: 3, title: 'Rembrandt Self-Portrait', prompt: 'This artistic dog as Rembrandt in self-portrait, painter\'s beret and palette, looking directly at viewer with knowing expression. Golden brown palette, dramatic chiaroscuro, psychological depth, late career masterwork style.' },
    { id: 4, title: 'Botticelli\'s Spring', prompt: 'This graceful dog as figure in Primavera, dancing in orange grove, diaphanous flowing garments, flowers emerging from breath. Ethereal Botticelli beauty, delicate linework, mythological garden.' },
    { id: 5, title: 'Caravaggio Drama', prompt: 'This intense dog in Caravaggio dramatic lighting, emerging from complete darkness, single dramatic light source revealing every fur detail. Street-level realism, theatrical contrast, baroque intensity.' },
    { id: 6, title: 'Leonardo Sketch', prompt: 'This curious dog as Leonardo da Vinci anatomical study, sepia ink on aged paper, mirror writing notes, detailed observation. Scientific drawing meets portrait, Renaissance genius notebook page.' },
    { id: 7, title: 'Night Watch Hero', prompt: 'This military dog in Rembrandt Night Watch style, militia company emerging from shadow, dramatic spotlight. Group portrait energy, sense of movement, civic pride and duty.' },
    { id: 8, title: 'Girl with Pearl', prompt: 'This luminous dog with Vermeer pearl earring, dramatic dark background, turning gaze, pearl glowing. Iconic simplicity, mysterious identity, perfect lighting.' },
    { id: 9, title: 'Mona Lisa Mystery', prompt: 'This enigmatic dog with Mona Lisa subtle smile, sfumato background landscape, hands folded mysteriously. Leonardo technique, psychological depth, eternal mystery portrait.' },
    { id: 10, title: 'Titian Noble', prompt: 'This distinguished dog as Venetian nobleman by Titian, sumptuous red velvet robes, gold chain of office, fur collar. Warm Venetian color palette, confident pose, rich impasto brushwork.' },
  ],
  fantasy: [
    { id: 1, title: 'Dragon Slayer', prompt: 'This mighty dog as legendary dragon slayer, standing victorious over defeated dragon, enchanted sword glowing with runes. Scorched battlefield, smoke rising, golden armor dented but proud. Epic fantasy book cover lighting, heroic pose against stormy sky.' },
    { id: 2, title: 'Wise Wizard', prompt: 'This mystical dog as ancient wizard, flowing starry robes, gnarled staff crackling with blue lightning. Tower study filled with floating books, crystal orbs, arcane symbols. Long white beard (if appropriate) or mystical collar, knowing eyes full of centuries.' },
    { id: 3, title: 'Elven Ranger', prompt: 'This swift dog as elven ranger, forest-green cloak, ornate bow drawn and ready. Ancient enchanted forest with glowing mushrooms, mystical fog, hidden pathways. Pointed ear decorations, keen hunting expression, one with the wild.' },
    { id: 4, title: 'Dragon Rider', prompt: 'This fearless dog riding massive dragon through clouds, leather flight harness, goggles pushed up. Dragon scales iridescent in sunset, mountains below, wind whipping fur. Bond between rider and beast, epic aerial portrait.' },
    { id: 5, title: 'Unicorn Friend', prompt: 'This pure-hearted dog meeting unicorn in enchanted glade, both bowing in mutual respect. Rainbow waterfall, crystal-clear pool, flowers blooming at their feet. Magical connection, innocent wonder, fairy tale moment.' },
    { id: 6, title: 'Barbarian Warrior', prompt: 'This fierce dog as barbarian warrior, fur cloak, massive battle axe, tribal war paint. Frozen northern wastes, aurora borealis overhead, dire wolves as companions. Primal strength, fearsome battle cry pose.' },
    { id: 7, title: 'Potion Master', prompt: 'This careful dog brewing potions, bubbling cauldron with rainbow smoke, ingredient jars everywhere. Cozy witch\'s cottage, herbs hanging from ceiling, spell book open. Concentration face, tail accidentally knocking things over.' },
    { id: 8, title: 'Legendary Sword', prompt: 'This worthy dog pulling legendary sword from stone, light exploding outward, destiny fulfilled. Crowd gasping, failed attempts scattered, true king revealed. Arthurian moment, chosen one.' },
    { id: 9, title: 'Phoenix Bonded', prompt: 'This chosen dog bonded with phoenix companion, fire bird perched on armored shoulder, flames not burning. Volcanic landscape, rebirth symbolism, eternal partnership. Warm golden light, majestic duo portrait.' },
    { id: 10, title: 'Elemental Master', prompt: 'This powerful dog commanding all four elements, fire/water/earth/air swirling in harmony. Avatar state, eyes glowing, ultimate power achieved. Elemental convergence, balanced destruction and creation.' },
  ],
  noir: [
    { id: 1, title: 'Private Eye', prompt: 'This world-weary dog as private detective in shadow-filled office, fedora tilted, cigarette smoke curling up (unlit for dogs). Venetian blinds casting striped shadows across muzzle, whiskey glass on desk, "DETECTIVE" painted on frosted glass door. Classic noir lighting, Bogart energy.' },
    { id: 2, title: 'Femme Fatale', prompt: 'This mysterious dog as femme fatale in slinky evening gown, pearls, smoky eyes, dangerous allure. Nightclub booth, single spotlight, trouble walking through the door. Deadly beauty, everyone\'s watching, nobody trusts.' },
    { id: 3, title: 'Rain-Slicked Streets', prompt: 'This lone dog walking rain-slicked streets at midnight, trench coat collar up, reflection in puddles. Neon signs blurring, steam rising from grates, nobody following (or are they?). Atmospheric loneliness, city as character.' },
    { id: 4, title: 'Interrogation Room', prompt: 'This intense dog in police interrogation room, single bare bulb overhead, sweat on brow. Suspect across table, tough questions, breaking point approaching. Good cop or bad cop, pressure mounting.' },
    { id: 5, title: 'Jazz Club', prompt: 'This melancholy dog at smoky jazz club, saxophone crying, broken heart drowning sorrows. Torch singer on stage, blue spotlight, memories of what went wrong. Musical noir, sad but beautiful.' },
    { id: 6, title: 'The Double-Cross', prompt: 'This betrayed dog realizing the double-cross, partner pointing gun, trusted the wrong person. Warehouse confrontation, everything was a lie, survival instincts kicking in. Classic noir twist.' },
    { id: 7, title: 'Stakeout', prompt: 'This patient dog on stakeout in parked car, binoculars trained on apartment window, coffee and sandwich wrapper evidence of long wait. Radio crackling, target finally moving, action time.' },
    { id: 8, title: 'Evidence Board', prompt: 'This obsessed dog before evidence board, photographs and strings connecting, pattern emerging. Red string conspiracy, late night breakthrough, seeing what others missed. Detective work montage.' },
    { id: 9, title: 'Chase Scene', prompt: 'This pursued dog running through dark alley, footsteps behind, fire escape overhead. Trash cans knocked over, dead end approaching, need to think fast. Heart-pounding pursuit, urban maze.' },
    { id: 10, title: 'Gin Joint', prompt: 'This drowning dog at gin joint bar, of all the gin joints, someone walks in. Bartender knows to keep pouring, past walking through door. Casablanca energy, inevitable reunion.' },
  ],
  japanese: [
    { id: 1, title: 'Great Wave Surfer', prompt: 'This brave dog surfing the Great Wave off Kanagawa, Hokusai style ukiyo-e woodblock print. Massive blue wave curling overhead, Mount Fuji small in background, spray and foam rendered in traditional Japanese style. Bold outlines, limited color palette of indigo and white.' },
    { id: 2, title: 'Ghibli Forest Spirit', prompt: 'This magical dog as Studio Ghibli forest spirit, soft anime style, surrounded by kodama tree spirits. Enchanted forest with dappled sunlight, moss-covered trees, Totoro-esque wonder. Miyazaki\'s gentle environmental magic, hand-painted animation aesthetic.' },
    { id: 3, title: 'Samurai Warrior', prompt: 'This fierce dog as samurai in full armor, ukiyo-e warrior print style, katana drawn. Cherry blossoms falling, castle in background, bushido spirit. Kuniyoshi-style dynamic warrior pose, dramatic kabuki expression.' },
    { id: 4, title: 'Geisha Portrait', prompt: 'This elegant dog as geisha, white face makeup, elaborate hairstyle with kanzashi ornaments. Kimono with crane pattern, red obi, paper umbrella. Utamaro beauty portrait style, graceful half-turn pose.' },
    { id: 5, title: 'Cherry Blossom Viewing', prompt: 'This joyful dog at hanami picnic under cherry blossoms, pink petals falling like snow. Bento box lunch, sake cup, friends gathering. Seasonal celebration, fleeting beauty appreciation, spring joy.' },
    { id: 6, title: 'Kitsune Spirit', prompt: 'This mystical dog as kitsune fox spirit with multiple tails, shrine at night. Floating flames, supernatural glow, mischievous expression. Yokai folklore, shapeshifter energy, ancient magic.' },
    { id: 7, title: 'Anime School Rooftop', prompt: 'This dramatic dog on anime school rooftop, wind in fur, city spread below. Confession scene energy, cherry blossoms visible, emotional moment. High school anime aesthetic, protagonist pose.' },
    { id: 8, title: 'Sumi-e Ink Wash', prompt: 'This contemplative dog in sumi-e ink wash style, minimal brush strokes suggesting form. Misty mountain landscape, single pine branch, vast empty space. Zen simplicity, brush stroke mastery, ma negative space.' },
    { id: 9, title: 'Ramen Shop', prompt: 'This hungry dog at intimate ramen shop, steam rising from bowl, neon signs outside. Late night Tokyo vibe, slurping noodles, comfort food. Urban anime aesthetic, cozy dining.' },
    { id: 10, title: 'Princess Mononoke', prompt: 'This fierce dog as San from Princess Mononoke, wolf rider, mask and spear. Forest spirit ally, human enemy, nature warrior. Ghibli environmental epic, primal defender.' },
  ],
  cyberpunk: [
    { id: 1, title: 'Street Samurai', prompt: 'This deadly dog as street samurai, cybernetic arm with hidden blade, mirrorshade cyber-eyes. Rain-slicked alley, neon kanji signs, enemies approaching. Chrome and flesh, honor in dystopia, tactical combat ready. Blade Runner meets yakuza.' },
    { id: 2, title: 'Netrunner Elite', prompt: 'This jacked-in dog as elite netrunner, neural interface cables, virtual reality overlay visible. Cyberspace visualized around head, hacking mega-corp, data streams flowing. Digital cowboy, mind in the machine, keyboard warrior ascended.' },
    { id: 3, title: 'Neon Bar', prompt: 'This weary dog at cyberpunk bar, holographic drink menu, android bartender serving. Raining outside, neon reflections in window, synthwave playing. High-tech low-life, drowning silicon sorrows, future dive bar.' },
    { id: 4, title: 'Rooftop Chase', prompt: 'This fleeing dog leaping between rooftops, drones pursuing, holographic billboards as backdrop. Mega-city sprawl below, corporate security incoming, parkour escape. Aerial urban chase, neon obstacle course.' },
    { id: 5, title: 'Ramen Stand', prompt: 'This hungry dog at neon ramen stand, steam rising, rain pattering on awning. Blade Runner food scene, comfort in dystopia, synthetic noodles, real flavor. Urban oasis, temporary peace.' },
    { id: 6, title: 'Mantis Blades', prompt: 'This deadly dog with mantis blade arms deployed, elegant death, combat ready. Arm modification, close quarters specialist, chrome killer. Cyberpunk 2077 reference, signature weapon.' },
    { id: 7, title: 'Corporate Mercenary', prompt: 'This professional dog as corporate mercenary, expensive suit over body armor, ear implant glowing. Mega-corp lobby, legal violence for hire, morally flexible. High-end muscle, executive protection.' },
    { id: 8, title: 'Neon Rain', prompt: 'This contemplative dog in neon rain, umbrella optional, reflections everywhere. Classic cyberpunk atmosphere, urban poetry, wet streets. Iconic aesthetic, moody moment.' },
    { id: 9, title: 'Cyber Eye Upgrade', prompt: 'This upgrading dog receiving new cyber eye, surgery in progress, enhanced vision preview. Chromatic aberration effect, targeting overlay, future sight. Body modification, visual enhancement.' },
    { id: 10, title: 'Data Courier', prompt: 'This speeding dog as data courier, encrypted payload in headware, being chased. Motorcycle through traffic, information valuable, delivery or death. Johnny Mnemonic energy, neural smuggling.' },
  ],
  go_crazy: [
    { id: 1, title: 'Giant Dog City', prompt: 'This dog grown to Godzilla size, gently walking through Tokyo, carefully stepping over buildings. Confused but friendly expression, helicopters circling, citizens waving not fleeing. Kaiju wholesome, monster movie inversion, surprisingly peaceful rampage.' },
    { id: 2, title: 'Coffee Cup World', prompt: 'This dog living inside a coffee cup, tiny furniture made from sugar cubes, swimming pool of cream. Looking over rim at giant human world, cozy caffeinated home. Miniature living, beverage real estate, morning routine disrupted.' },
    { id: 3, title: 'Tax Accountant', prompt: 'This dog as extremely serious tax accountant, glasses, calculator, mountains of receipts. Office cubicle, deadline stress, surprisingly competent with spreadsheets. Mundane absurdity, working dog literally, April anxiety.' },
    { id: 4, title: 'Planet Dog', prompt: 'This dog AS a planet, continents on fur, tiny civilizations living on back. Orbiting sun, other dogs as other planets, solar system of pups. Cosmic canine, world on shoulders literally, celestial puppy.' },
    { id: 5, title: 'Victorian Influencer', prompt: 'This dog as Victorian-era social media influencer, holding daguerreotype selfie, #1875goals caption. Corset and top hat, steam-powered ring light, sponsoring laudanum. Historical anachronism, time-traveling trends, gaslit filter.' },
    { id: 6, title: 'Soup Swimming', prompt: 'This dog doing laps in giant bowl of soup, vegetables as obstacles, noodles as lanes. Competitive soup swimming, tomato broth warmth, crouton diving board. Food athletics, liquid exercise, delicious hydration.' },
    { id: 7, title: 'Therapist Session', prompt: 'This dog as therapist, notepad and glasses, patient (a cat) on couch crying. Professional boundaries, decades of training, healing interspecies trauma. Role reversal, emotional support provider, licensed listener.' },
    { id: 8, title: 'Loading Screen', prompt: 'This dog stuck in loading screen, progress bar at 87%, waiting for existence to buffer. Glitch reality, digital purgatory, refresh attempt failed. Meta existence, gaming limbo, please wait.' },
    { id: 9, title: 'Reverse Centaur', prompt: 'This dog as reverse centaur - dog head and front on human legs and lower body. Wearing jeans, confused about identity, philosophers debating nearby. Mythological mashup, anatomical chaos, fashion challenge.' },
    { id: 10, title: 'IKEA Assembly', prompt: 'This dog assembling IKEA furniture, instructions incomprehensible, Allen wrench in mouth. Missing pieces, frustration mounting, Swedish minimalism defeating. Universal struggle, furniture warfare, some assembly required.' },
  ],
}

const NEGATIVE_PROMPT = `extra limbs, missing limbs, extra tails, extra ears, deformed paws, fused legs, melted face, warped face, distorted muzzle, crossed eyes, extra eyes, wrong breed, incorrect fur color, wrong fur pattern, markings in wrong place, blurry, low quality, pixelated, jpeg artifacts, watermark, signature, text, words, letters, gore, blood, violence, horror, nsfw, bad anatomy, uncanny valley`

const SHOWCASE_EXAMPLES = [
  { src: '/examples/renaissance.jpeg', emoji: '🎭', name: 'Renaissance' },
  { src: '/examples/cyberpunk.jpeg', emoji: '🤖', name: 'Cyberpunk' },
  { src: '/examples/fantasy.jpeg', emoji: '🐉', name: 'Fantasy Hero' },
  { src: '/examples/japanese.jpeg', emoji: '🌸', name: 'Japanese Art' },
]

const GENERATING_MESSAGES = [
  'Mixing the paints...',
  'Sketching the composition...',
  'Perfecting the details...',
  'Adding dramatic lighting...',
  'Refining the brushstrokes...',
  'Almost a masterpiece...',
  'Final touches...',
]

const CONFETTI_COLORS = [
  '#8b7cf6', '#6dd5ed', '#34d399', '#f472b6',
  '#fbbf24', '#6366f1', '#ec4899', '#059669',
]

export default function Home() {
  // ─── State (unchanged logic) ───
  const [step, setStep] = useState('upload')
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)

  const [dogAttributes, setDogAttributes] = useState(null)
  const [detectionError, setDetectionError] = useState(null)

  const [humanMode, setHumanMode] = useState('include_styled')
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [strictness, setStrictness] = useState('balanced')

  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)

  // New UI state
  const [isDragging, setIsDragging] = useState(false)
  const [showZoom, setShowZoom] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)
  const [toast, setToast] = useState(null)
  const [genMessage, setGenMessage] = useState(GENERATING_MESSAGES[0])

  const fileInputRef = useRef(null)

  // Rotating generating messages
  useEffect(() => {
    if (step !== 'generating') return
    let i = 0
    const interval = setInterval(() => {
      i = (i + 1) % GENERATING_MESSAGES.length
      setGenMessage(GENERATING_MESSAGES[i])
    }, 4000)
    return () => clearInterval(interval)
  }, [step])

  // Confetti on result
  useEffect(() => {
    if (step === 'result') {
      setShowConfetti(true)
      const timer = setTimeout(() => setShowConfetti(false), 3000)
      return () => clearTimeout(timer)
    }
  }, [step])

  // Toast auto-dismiss
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 2500)
    return () => clearTimeout(timer)
  }, [toast])

  // Showcase carousel
  const [showcaseIndex, setShowcaseIndex] = useState(0)
  const [showcaseProgress, setShowcaseProgress] = useState(0)

  useEffect(() => {
    if (step !== 'upload') return
    // Kick off progress bar animation on next frame
    const raf = requestAnimationFrame(() => setShowcaseProgress(100))
    const interval = setInterval(() => {
      setShowcaseProgress(0)
      // Small delay so the reset (width:0) renders before we animate to 100 again
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setShowcaseProgress(100))
      })
      setShowcaseIndex(prev => (prev + 1) % SHOWCASE_EXAMPLES.length)
    }, 2000)
    return () => {
      clearInterval(interval)
      cancelAnimationFrame(raf)
    }
  }, [step])

  // ─── Core Functions (ALL LOGIC UNCHANGED) ───
  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) processFile(file)
  }

  const processFile = (file) => {
    const reader = new FileReader()
    reader.onload = (event) => {
      const img = new Image()
      img.onload = () => {
        const maxSize = 1024
        let { width, height } = img
        if (width > maxSize || height > maxSize) {
          if (width > height) {
            height = (height / width) * maxSize
            width = maxSize
          } else {
            width = (width / height) * maxSize
            height = maxSize
          }
        }

        const canvas = document.createElement('canvas')
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext('2d')
        ctx.drawImage(img, 0, 0, width, height)

        const base64 = canvas.toDataURL('image/jpeg', 0.9)
        setImagePreview(base64)
        setImageBase64(base64.split(',')[1])
        setImage(file)

        runDetection(base64.split(',')[1])
      }
      img.src = event.target.result
    }
    reader.readAsDataURL(file)
  }

  const runDetection = async (base64) => {
    setStep('detecting')
    setDetectionError(null)

    try {
      const response = await fetch('/api/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64 }),
      })

      const data = await response.json()

      if (data.error) {
        setDetectionError(data.error)
        setStep('upload')
        return
      }

      setDogAttributes(data)
      setStep('review')
    } catch (err) {
      setDetectionError('Detection failed. Please try again.')
      setStep('upload')
    }
  }

  const buildIdentityAnchor = () => {
    if (!dogAttributes || !dogAttributes.dogs || dogAttributes.dogs.length === 0) {
      return ''
    }

    const dog = dogAttributes.dogs[0]
    let parts = []

    parts.push(`a ${dog.size_build?.size || ''} ${dog.breed_guess || 'dog'}`)

    if (dog.coat_texture && dog.coat_length) {
      parts.push(`with ${dog.pattern_type?.replace('_', ' ') || ''} ${dog.coat_texture} ${dog.coat_length} coat`)
    }

    parts.push(`primarily ${dog.primary_fur_color || 'colored'}`)
    if (dog.secondary_fur_color) {
      parts.push(`with ${dog.secondary_fur_color} accents`)
    }

    if (dog.distinctive_markings && dog.distinctive_markings.length > 0) {
      const markings = dog.distinctive_markings.map(m =>
        `${m.type?.replace('_', ' ')} (${m.color})`
      ).join(', ')
      parts.push(`distinctive markings: ${markings}`)
    }

    if (dog.ears?.type) {
      parts.push(`${dog.ears.type.replace('_', ' ')} ears`)
    }
    if (dog.muzzle?.type) {
      let muzzleDesc = `${dog.muzzle.type} muzzle`
      if (dog.muzzle.beard) muzzleDesc += ' with beard'
      parts.push(muzzleDesc)
    }

    return `CRITICAL IDENTITY: This is ${parts.join('. ')}. Preserve ALL these traits exactly.`
  }

  const buildHumanBlock = () => {
    if (!dogAttributes?.humans_detected || humanMode === 'dog_only') {
      return ''
    }

    if (humanMode === 'remove') {
      return 'The dog is alone, no humans present.'
    }

    let humanParts = []
    dogAttributes.humans?.forEach((human, i) => {
      let desc = `Human ${i + 1}: `
      if (human.face_visible) {
        desc += 'face visible - preserve facial features, '
      } else {
        desc += 'face not fully visible - preserve silhouette/clothing style, '
      }
      desc += `apparent ${human.apparent_age_range || 'adult'}, `
      desc += `${human.pose?.replace('_', ' ') || 'standing'} pose`
      humanParts.push(desc)
    })

    return `HUMAN STYLING: Apply the same style to humans present. Preserve human identity (do not change gender, age, ethnicity, body type). ${humanParts.join('. ')}`
  }

  const buildFinalPrompt = () => {
    const identityAnchor = buildIdentityAnchor()
    const humanBlock = buildHumanBlock()

    let styleBlock = ''
    if (useCustomPrompt) {
      const strictnessInstructions = {
        strict: 'The dog MUST look exactly like the original photo. Same breed, same exact fur colors, same markings in same positions, same ear type, same muzzle shape. Only the scenario/clothing/setting can change.',
        balanced: 'The dog should be clearly recognizable as the same dog. Preserve breed, general coloring, and key distinctive features. Minor stylization of fur texture or proportions is acceptable for artistic effect.',
        wild: 'The dog should still be identifiable as the same dog to the owner. Keep the general breed appearance and most distinctive features, but creative interpretation of colors, proportions, and style is encouraged.',
      }

      styleBlock = `
User's creative vision: ${customPrompt}

STRICTNESS LEVEL: ${strictness.toUpperCase()}
${strictnessInstructions[strictness]}

Keep the image family-friendly. No gore, violence, explicit content, or offensive stereotypes.`
    } else {
      const style = STYLES.find(s => s.id === selectedStyle)
      styleBlock = `${style.skeleton}\n\n${selectedVariant.prompt}`
    }

    const qualityBlock = 'High quality, detailed, professional rendering. Sharp focus on the subject. Coherent composition. Appropriate lighting for the scene.'

    let finalPrompt = identityAnchor
    if (humanBlock) {
      finalPrompt += `\n\n${humanBlock}`
    }
    finalPrompt += `\n\nSCENE AND STYLE:\n${styleBlock}\n\nQUALITY:\n${qualityBlock}`

    return finalPrompt
  }

  const handleGenerate = async () => {
    setStep('generating')
    setError(null)
    setProgress(0)

    const prompt = buildFinalPrompt()

    const progressInterval = setInterval(() => {
      setProgress(prev => Math.min(prev + Math.random() * 15, 90))
    }, 2000)

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: imageBase64,
          prompt: prompt,
          negative_prompt: NEGATIVE_PROMPT,
        }),
      })

      clearInterval(progressInterval)

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        setStep('style')
        return
      }

      setProgress(100)
      setResult(data.image)
      setStep('result')
    } catch (err) {
      clearInterval(progressInterval)
      setError('Generation failed. Please try again.')
      setStep('style')
    }
  }

  const selectRandomVariant = (styleId) => {
    const variants = STYLE_VARIANTS[styleId]
    const randomIndex = Math.floor(Math.random() * variants.length)
    return variants[randomIndex]
  }

  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId)
    setSelectedVariant(selectRandomVariant(styleId))
    setUseCustomPrompt(false)
  }

  const handleRegenerate = () => {
    if (selectedStyle) {
      setSelectedVariant(selectRandomVariant(selectedStyle))
    }
    handleGenerate()
  }

  const handleReset = () => {
    setStep('upload')
    setImage(null)
    setImagePreview(null)
    setImageBase64(null)
    setDogAttributes(null)
    setSelectedStyle(null)
    setSelectedVariant(null)
    setUseCustomPrompt(false)
    setCustomPrompt('')
    setResult(null)
    setError(null)
  }

  // ─── New UI Handlers ───
  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file && file.type.startsWith('image/')) {
      processFile(file)
    }
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(result)
        const blob = await response.blob()
        const file = new File([blob], 'pet-portrait.jpg', { type: 'image/jpeg' })
        await navigator.share({
          title: 'My Pet Portrait',
          text: 'Check out this AI pet portrait from Retratos Reales!',
          files: [file],
        })
      } catch (err) {
        if (err.name !== 'AbortError') {
          fallbackShare()
        }
      }
    } else {
      fallbackShare()
    }
  }

  const fallbackShare = async () => {
    try {
      await navigator.clipboard.writeText(result)
      setToast('Link copied to clipboard')
    } catch {
      setToast('Long-press the image to save')
    }
  }

  const handleSave = async () => {
    try {
      const response = await fetch(result)
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'pet-portrait.jpg'
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      setToast('Portrait saved')
    } catch {
      setToast('Long-press the image to save')
    }
  }

  // ─── Detection Summary ───
  const renderDetectionSummary = () => {
    if (!dogAttributes) return null
    const dog = dogAttributes.dogs?.[0]
    if (!dog) return null

    return (
      <div className="detection-card">
        <h3 className="detection-title">Detected Traits</h3>
        <div className="trait-grid">
          <div className="trait-item">
            <span className="trait-label">Breed</span>
            <span className="trait-value">{dog.breed_guess || 'Unknown'}</span>
            {dog.breed_confidence && (
              <div className="trait-confidence">
                <div
                  className="trait-confidence-fill"
                  style={{ width: `${Math.round(dog.breed_confidence * 100)}%` }}
                />
              </div>
            )}
          </div>
          <div className="trait-item">
            <span className="trait-label">Fur Color</span>
            <span className="trait-value">
              {dog.primary_fur_color}{dog.secondary_fur_color ? ` & ${dog.secondary_fur_color}` : ''}
            </span>
          </div>
          <div className="trait-item">
            <span className="trait-label">Coat</span>
            <span className="trait-value">{dog.coat_length} {dog.coat_texture}</span>
          </div>
          <div className="trait-item">
            <span className="trait-label">Pattern</span>
            <span className="trait-value">{dog.pattern_type?.replace('_', ' ') || 'solid'}</span>
          </div>
          {dog.distinctive_markings?.length > 0 && (
            <div className="trait-item">
              <span className="trait-label">Markings</span>
              <span className="trait-value">
                {dog.distinctive_markings.map(m => m.type?.replace('_', ' ')).join(', ')}
              </span>
            </div>
          )}
        </div>
        {dogAttributes.humans_detected && (
          <div className="human-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            {dogAttributes.num_humans} human{dogAttributes.num_humans > 1 ? 's' : ''} detected
          </div>
        )}
      </div>
    )
  }

  // ─── Confetti Renderer ───
  const renderConfetti = () => {
    if (!showConfetti) return null
    return (
      <div className="confetti-container">
        {Array.from({ length: 30 }).map((_, i) => (
          <div
            key={i}
            className="confetti-piece"
            style={{
              left: `${Math.random() * 100}%`,
              backgroundColor: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
              animationDuration: `${2 + Math.random() * 2}s`,
              animationDelay: `${Math.random() * 0.5}s`,
              width: `${6 + Math.random() * 6}px`,
              height: `${6 + Math.random() * 6}px`,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
          />
        ))}
      </div>
    )
  }

  // ─── SVG Icons ───
  const CameraIcon = () => (
    <svg className="upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  )

  const PaletteIcon = () => (
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#8b7cf6" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r="0.5" fill="#f472b6" stroke="#f472b6" />
      <circle cx="17.5" cy="10.5" r="0.5" fill="#34d399" stroke="#34d399" />
      <circle cx="8.5" cy="7.5" r="0.5" fill="#fbbf24" stroke="#fbbf24" />
      <circle cx="6.5" cy="12.5" r="0.5" fill="#6dd5ed" stroke="#6dd5ed" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )

  // ─── Render ───
  return (
    <div className="app-container">
      <div className="app-content">
        {/* Brand */}
        <header className="brand-header">
          <h1 className="brand-title">Retratos Reales</h1>
          <p className="brand-subtitle">AI Pet Portraits</p>
        </header>

        {/* SHOWCASE */}
        {step === 'upload' && (
          <div className="showcase" key="showcase">
            <h2 className="showcase-headline">Transform your pet into art</h2>
            <div className="showcase-viewport">
              <div className="showcase-glow" />
              <div
                className={`showcase-progress ${showcaseProgress > 0 ? 'showcase-progress-animate' : ''}`}
                style={{ width: `${showcaseProgress}%` }}
              />
              <div className="showcase-track">
                {SHOWCASE_EXAMPLES.map((ex, i) => (
                  <div
                    key={ex.src}
                    className={`showcase-slide ${i === showcaseIndex ? 'showcase-slide-active' : ''}`}
                  >
                    <img src={ex.src} alt={ex.name} />
                  </div>
                ))}
              </div>
              <div className="showcase-label">
                <span className="showcase-style-name">
                  {SHOWCASE_EXAMPLES[showcaseIndex].emoji} {SHOWCASE_EXAMPLES[showcaseIndex].name}
                </span>
                <div className="showcase-dots">
                  {SHOWCASE_EXAMPLES.map((_, i) => (
                    <div
                      key={i}
                      className={`showcase-dot ${i === showcaseIndex ? 'showcase-dot-active' : ''}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* UPLOAD */}
        {step === 'upload' && (
          <div className="card step-enter" key="upload">
            <div
              className={`upload-zone ${isDragging ? 'upload-zone-dragging' : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <CameraIcon />
              <p className="upload-text">Upload Your Pet's Photo</p>
              <p className="upload-hint">For best results, use a clear photo where your pet's face is visible</p>
              <div className="upload-tips">
                <div className="upload-tip">
                  <div className="upload-tip-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 2v4m0 12v4m10-10h-4M6 12H2m15.07-7.07-2.83 2.83M9.76 14.24l-2.83 2.83m12.14 0-2.83-2.83M9.76 9.76 6.93 6.93"/></svg>
                  </div>
                  <span className="upload-tip-label">Good Light</span>
                </div>
                <div className="upload-tip">
                  <div className="upload-tip-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="10" r="3"/><path d="M7 20.662V19a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v1.662"/></svg>
                  </div>
                  <span className="upload-tip-label">Clear Face</span>
                </div>
                <div className="upload-tip">
                  <div className="upload-tip-icon">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="m21 15-5-5L5 21"/></svg>
                  </div>
                  <span className="upload-tip-label">Close-up</span>
                </div>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {detectionError && (
              <div className="error-message">{detectionError}</div>
            )}
          </div>
        )}

        {/* DETECTING */}
        {step === 'detecting' && (
          <div className="card step-enter" key="detecting">
            <div className="preview-wrapper preview-image-detecting">
              <img src={imagePreview} alt="Uploaded" className="preview-image" />
            </div>
            <div className="loading-dots">
              <div className="loading-dot" />
              <div className="loading-dot" />
              <div className="loading-dot" />
            </div>
            <p className="loading-text">Analyzing your pet...</p>
            <p className="loading-subtext">Detecting breed, colors, and markings</p>
            <div className="skeleton-grid">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          </div>
        )}

        {/* REVIEW */}
        {step === 'review' && (
          <div className="card step-enter" key="review">
            <div className="preview-wrapper">
              <img src={imagePreview} alt="Your dog" className="preview-image" />
            </div>
            {renderDetectionSummary()}

            {dogAttributes?.humans_detected && (
              <div className="human-options">
                <p className="option-label">Human in photo — what should we do?</p>
                <div className="option-grid">
                  <button
                    className={`option-btn ${humanMode === 'include_styled' ? 'option-btn-selected' : ''}`}
                    onClick={() => setHumanMode('include_styled')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                    Style Together
                  </button>
                  <button
                    className={`option-btn ${humanMode === 'remove' ? 'option-btn-selected' : ''}`}
                    onClick={() => setHumanMode('remove')}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 5.172C10 3.782 8.423 2.679 6.5 3c-2.823.47-4.113 6.006-4 7 .08.703 1.725 1.722 3.656 1 1.261-.472 1.96-1.45 2.344-2.5"/><path d="M14.267 5.172c0-1.39 1.577-2.493 3.5-2.172 2.823.47 4.113 6.006 4 7-.08.703-1.725 1.722-3.656 1-1.261-.472-1.855-1.45-2.239-2.5"/><path d="M8 14v.5"/><path d="M16 14v.5"/><path d="M11.25 16.25h1.5L12 17l-.75-.75Z"/><path d="M4.42 11.247A13.152 13.152 0 0 0 4 14.556C4 18.728 7.582 21 12 21s8-2.272 8-6.444c0-1.061-.162-2.2-.493-3.309m-9.243-6.082A8.801 8.801 0 0 1 12 5c.78 0 1.5.108 2.161.306"/></svg>
                    Dog Only
                  </button>
                </div>
              </div>
            )}

            <button className="btn btn-primary" onClick={() => setStep('style')}>
              Continue to Styles
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
            </button>
            <button className="btn btn-ghost" onClick={handleReset}>
              Upload Different Photo
            </button>
          </div>
        )}

        {/* STYLE SELECTION */}
        {step === 'style' && (
          <div className="card step-enter" key="style">
            <h2 className="section-title">Choose a Style</h2>
            <div className="style-grid">
              {STYLES.map(style => (
                <button
                  key={style.id}
                  className={`style-card ${selectedStyle === style.id ? 'style-card-selected' : ''}`}
                  onClick={() => handleStyleSelect(style.id)}
                >
                  <span className="style-emoji">{style.emoji}</span>
                  <span className="style-name">{style.name}</span>
                  <span className="style-desc">{style.description}</span>
                </button>
              ))}
            </div>

            <button
              className="custom-card"
              onClick={() => {
                setUseCustomPrompt(true)
                setStep('custom')
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
              Write Custom Prompt
            </button>

            {selectedStyle && (
              <>
                <div className="variant-preview">
                  <div className="variant-info">
                    <span className="variant-label">Selected</span>
                    <span className="variant-title">{selectedVariant?.title}</span>
                  </div>
                  <button
                    className="shuffle-btn"
                    onClick={() => setSelectedVariant(selectRandomVariant(selectedStyle))}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
                  </button>
                </div>
                <button className="btn btn-success" onClick={handleGenerate}>
                  Generate Portrait
                </button>
              </>
            )}

            <button className="btn btn-ghost" onClick={() => setStep('review')}>
              Back to Review
            </button>
          </div>
        )}

        {/* CUSTOM PROMPT */}
        {step === 'custom' && (
          <div className="card step-enter" key="custom">
            <h2 className="section-title">Custom Prompt</h2>
            <p className="custom-hint">
              Describe your vision. Your dog's identity will be preserved automatically.
            </p>
            <textarea
              className="custom-textarea"
              placeholder="Example: My dog as a pirate captain on a ship at sunset, wearing an eye patch and captain's hat..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
            />

            <div className="strictness-section">
              <p className="strictness-label">Identity Preservation</p>
              <div className="segmented-control">
                {['strict', 'balanced', 'wild'].map(level => (
                  <button
                    key={level}
                    className={`segment ${strictness === level ? 'segment-selected' : ''}`}
                    onClick={() => setStrictness(level)}
                  >
                    {level === 'strict' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Strict</>
                    )}
                    {level === 'balanced' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"/><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"/><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"/></svg> Balanced</>
                    )}
                    {level === 'wild' && (
                      <><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg> Wild</>
                    )}
                  </button>
                ))}
              </div>
              <p className="strictness-hint">
                {strictness === 'strict' && 'Exact match — your dog will look identical'}
                {strictness === 'balanced' && 'Recommended — recognizable with artistic freedom'}
                {strictness === 'wild' && 'Creative — more stylization allowed'}
              </p>
            </div>

            <button
              className="btn btn-success"
              onClick={handleGenerate}
              disabled={!customPrompt.trim()}
              style={!customPrompt.trim() ? { opacity: 0.4 } : {}}
            >
              Generate Portrait
            </button>

            <button className="btn btn-ghost" onClick={() => {
              setUseCustomPrompt(false)
              setStep('style')
            }}>
              Back to Styles
            </button>
          </div>
        )}

        {/* GENERATING */}
        {step === 'generating' && (
          <div className="card step-enter" key="generating">
            <div className="generating-center">
              <img src={imagePreview} alt="Your dog" className="generating-thumb" />
              <div className="generating-icon">
                <PaletteIcon />
              </div>
              <p className="generating-text">Creating your portrait...</p>
              {selectedVariant && !useCustomPrompt && (
                <p className="generating-variant">"{selectedVariant.title}"</p>
              )}
              <p className="generating-message">{genMessage}</p>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${progress}%` }} />
              </div>
              <p className="progress-time">This usually takes 30–60 seconds</p>
            </div>
          </div>
        )}

        {/* RESULT */}
        {step === 'result' && (
          <div className="card step-enter" key="result">
            <div className="result-hero" onClick={() => setShowZoom(true)}>
              <img
                src={result}
                alt="Generated portrait"
                className="result-image result-image-zoomable"
              />
            </div>

            {selectedVariant && !useCustomPrompt && (
              <p className="result-title">
                {STYLES.find(s => s.id === selectedStyle)?.emoji}{' '}
                {selectedVariant.title}
              </p>
            )}

            <div className="btn-row">
              <button className="btn btn-success" onClick={handleSave}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                Save
              </button>
              <button className="btn btn-primary" onClick={handleShare}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/></svg>
                Share
              </button>
            </div>

            <button className="btn btn-pink" onClick={handleRegenerate}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/><line x1="4" y1="4" x2="9" y2="9"/></svg>
              New Variant
            </button>

            <button className="btn btn-secondary" onClick={() => setStep('style')}>
              Try Different Style
            </button>

            <button className="btn btn-ghost" onClick={handleReset}>
              Start Over
            </button>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="error-message">{error}</div>
        )}

        <p className="app-footer">Powered by AI</p>
      </div>

      {/* Zoom Modal */}
      {showZoom && (
        <div className="zoom-overlay" onClick={() => setShowZoom(false)}>
          <img src={result} alt="Zoomed portrait" className="zoom-image" />
          <button className="zoom-close" onClick={() => setShowZoom(false)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      )}

      {/* Confetti */}
      {renderConfetti()}

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  )
}
