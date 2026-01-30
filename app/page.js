'use client'

import { useState, useRef } from 'react'

// Import all 900 variants from style files (in production these would be separate imports)
// For now, we'll define the style metadata and load variants dynamically
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

// Sample variants for each style (in production, load from JSON files)
// Including 10 per style here for demo, full 100 would be loaded from files
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

// Negative prompt block for identity preservation
const NEGATIVE_PROMPT = `extra limbs, missing limbs, extra tails, extra ears, deformed paws, fused legs, melted face, warped face, distorted muzzle, crossed eyes, extra eyes, wrong breed, incorrect fur color, wrong fur pattern, markings in wrong place, blurry, low quality, pixelated, jpeg artifacts, watermark, signature, text, words, letters, gore, blood, violence, horror, nsfw, bad anatomy, uncanny valley`

export default function Home() {
  // State management
  const [step, setStep] = useState('upload') // upload, detecting, review, mode, style, custom, generating, result
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [imageBase64, setImageBase64] = useState(null)
  
  // Detection results
  const [dogAttributes, setDogAttributes] = useState(null)
  const [detectionError, setDetectionError] = useState(null)
  
  // User selections
  const [humanMode, setHumanMode] = useState('include_styled') // include_styled, remove, dog_only
  const [selectedStyle, setSelectedStyle] = useState(null)
  const [selectedVariant, setSelectedVariant] = useState(null)
  const [useCustomPrompt, setUseCustomPrompt] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [strictness, setStrictness] = useState('balanced') // strict, balanced, wild
  
  // Results
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [progress, setProgress] = useState(0)
  
  const fileInputRef = useRef(null)

  // Handle image upload and convert to base64
  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const img = new Image()
        img.onload = () => {
          // Resize to max 1024px for API
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
          
          // Convert to JPEG base64
          const base64 = canvas.toDataURL('image/jpeg', 0.9)
          setImagePreview(base64)
          setImageBase64(base64.split(',')[1])
          setImage(file)
          
          // Start auto-detection
          runDetection(base64.split(',')[1])
        }
        img.src = event.target.result
      }
      reader.readAsDataURL(file)
    }
  }

  // Run Claude Vision detection
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

  // Build identity anchor from detected attributes
  const buildIdentityAnchor = () => {
    if (!dogAttributes || !dogAttributes.dogs || dogAttributes.dogs.length === 0) {
      return ''
    }
    
    const dog = dogAttributes.dogs[0]
    let parts = []
    
    // Breed and size
    parts.push(`a ${dog.size_build?.size || ''} ${dog.breed_guess || 'dog'}`)
    
    // Coat
    if (dog.coat_texture && dog.coat_length) {
      parts.push(`with ${dog.pattern_type?.replace('_', ' ') || ''} ${dog.coat_texture} ${dog.coat_length} coat`)
    }
    
    // Colors
    parts.push(`primarily ${dog.primary_fur_color || 'colored'}`)
    if (dog.secondary_fur_color) {
      parts.push(`with ${dog.secondary_fur_color} accents`)
    }
    
    // Distinctive markings
    if (dog.distinctive_markings && dog.distinctive_markings.length > 0) {
      const markings = dog.distinctive_markings.map(m => 
        `${m.type?.replace('_', ' ')} (${m.color})`
      ).join(', ')
      parts.push(`distinctive markings: ${markings}`)
    }
    
    // Ears and muzzle
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

  // Build human block if humans detected
  const buildHumanBlock = () => {
    if (!dogAttributes?.humans_detected || humanMode === 'dog_only') {
      return ''
    }
    
    if (humanMode === 'remove') {
      return 'The dog is alone, no humans present.'
    }
    
    // include_styled
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

  // Build final prompt
  const buildFinalPrompt = () => {
    const identityAnchor = buildIdentityAnchor()
    const humanBlock = buildHumanBlock()
    
    let styleBlock = ''
    if (useCustomPrompt) {
      // Custom prompt with strictness wrapper
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
      // Standard style + variant
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

  // Generate portrait
  const handleGenerate = async () => {
    setStep('generating')
    setError(null)
    setProgress(0)
    
    const prompt = buildFinalPrompt()
    
    // Progress simulation
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

  // Select random variant for a style
  const selectRandomVariant = (styleId) => {
    const variants = STYLE_VARIANTS[styleId]
    const randomIndex = Math.floor(Math.random() * variants.length)
    return variants[randomIndex]
  }

  // Handle style selection
  const handleStyleSelect = (styleId) => {
    setSelectedStyle(styleId)
    setSelectedVariant(selectRandomVariant(styleId))
    setUseCustomPrompt(false)
  }

  // Regenerate with same style but different variant
  const handleRegenerate = () => {
    if (selectedStyle) {
      setSelectedVariant(selectRandomVariant(selectedStyle))
    }
    handleGenerate()
  }

  // Reset to start
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

  // Render detection results summary
  const renderDetectionSummary = () => {
    if (!dogAttributes) return null
    
    const dog = dogAttributes.dogs?.[0]
    if (!dog) return null
    
    return (
      <div style={styles.detectionCard}>
        <h3 style={styles.detectionTitle}>🔍 Detected Traits</h3>
        <div style={styles.traitGrid}>
          <div style={styles.trait}>
            <span style={styles.traitLabel}>Breed</span>
            <span style={styles.traitValue}>{dog.breed_guess || 'Unknown'}</span>
            {dog.breed_confidence && (
              <span style={styles.confidence}>{Math.round(dog.breed_confidence * 100)}% confident</span>
            )}
          </div>
          <div style={styles.trait}>
            <span style={styles.traitLabel}>Fur Color</span>
            <span style={styles.traitValue}>{dog.primary_fur_color}{dog.secondary_fur_color ? ` & ${dog.secondary_fur_color}` : ''}</span>
          </div>
          <div style={styles.trait}>
            <span style={styles.traitLabel}>Coat</span>
            <span style={styles.traitValue}>{dog.coat_length} {dog.coat_texture}</span>
          </div>
          <div style={styles.trait}>
            <span style={styles.traitLabel}>Pattern</span>
            <span style={styles.traitValue}>{dog.pattern_type?.replace('_', ' ') || 'solid'}</span>
          </div>
          {dog.distinctive_markings?.length > 0 && (
            <div style={styles.trait}>
              <span style={styles.traitLabel}>Markings</span>
              <span style={styles.traitValue}>
                {dog.distinctive_markings.map(m => m.type?.replace('_', ' ')).join(', ')}
              </span>
            </div>
          )}
        </div>
        {dogAttributes.humans_detected && (
          <div style={styles.humanDetected}>
            👤 {dogAttributes.num_humans} human{dogAttributes.num_humans > 1 ? 's' : ''} detected
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <h1 style={styles.title}>🐕 Retratos Reales</h1>
        <p style={styles.subtitle}>AI Pet Portraits • v2.0</p>

        {/* UPLOAD STEP */}
        {step === 'upload' && (
          <div style={styles.card}>
            <div 
              style={styles.uploadArea}
              onClick={() => fileInputRef.current?.click()}
            >
              <div style={styles.uploadIcon}>📸</div>
              <p style={styles.uploadText}>Tap to upload your dog's photo</p>
              <p style={styles.uploadHint}>Best results with clear face shot</p>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              style={{ display: 'none' }}
            />
            {detectionError && (
              <div style={styles.error}>{detectionError}</div>
            )}
          </div>
        )}

        {/* DETECTING STEP */}
        {step === 'detecting' && (
          <div style={styles.card}>
            <img src={imagePreview} alt="Uploaded" style={styles.previewImage} />
            <div style={styles.loadingEmoji}>🔍</div>
            <p style={styles.progressText}>Analyzing your dog...</p>
            <p style={styles.progressHint}>Detecting breed, colors, and markings</p>
          </div>
        )}

        {/* REVIEW STEP - Show detection results */}
        {step === 'review' && (
          <div style={styles.card}>
            <img src={imagePreview} alt="Your dog" style={styles.previewImage} />
            {renderDetectionSummary()}
            
            {/* Human handling options if humans detected */}
            {dogAttributes?.humans_detected && (
              <div style={styles.humanOptions}>
                <p style={styles.optionLabel}>Human in photo - what should we do?</p>
                <div style={styles.optionGrid}>
                  <button
                    style={{
                      ...styles.optionButton,
                      ...(humanMode === 'include_styled' ? styles.optionSelected : {})
                    }}
                    onClick={() => setHumanMode('include_styled')}
                  >
                    👥 Style Together
                  </button>
                  <button
                    style={{
                      ...styles.optionButton,
                      ...(humanMode === 'remove' ? styles.optionSelected : {})
                    }}
                    onClick={() => setHumanMode('remove')}
                  >
                    🐕 Dog Only
                  </button>
                </div>
              </div>
            )}
            
            <button style={styles.primaryButton} onClick={() => setStep('style')}>
              Continue to Styles →
            </button>
            <button style={styles.backButton} onClick={handleReset}>
              ← Upload Different Photo
            </button>
          </div>
        )}

        {/* STYLE SELECTION STEP */}
        {step === 'style' && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>Choose Your Style</h2>
            <div style={styles.styleGrid}>
              {STYLES.map(style => (
                <button
                  key={style.id}
                  style={{
                    ...styles.styleButton,
                    ...(selectedStyle === style.id ? styles.styleSelected : {})
                  }}
                  onClick={() => handleStyleSelect(style.id)}
                >
                  <span style={styles.styleEmoji}>{style.emoji}</span>
                  <span style={styles.styleName}>{style.name}</span>
                  <span style={styles.styleDesc}>{style.description}</span>
                </button>
              ))}
            </div>
            
            {/* Custom prompt option */}
            <button 
              style={styles.customButton}
              onClick={() => {
                setUseCustomPrompt(true)
                setStep('custom')
              }}
            >
              ✨ Write Custom Prompt
            </button>
            
            {selectedStyle && (
              <>
                <div style={styles.variantPreview}>
                  <span style={styles.variantLabel}>Selected: </span>
                  <span style={styles.variantTitle}>{selectedVariant?.title}</span>
                  <button 
                    style={styles.shuffleButton}
                    onClick={() => setSelectedVariant(selectRandomVariant(selectedStyle))}
                  >
                    🎲 Shuffle
                  </button>
                </div>
                <button style={styles.generateButton} onClick={handleGenerate}>
                  🎨 Generate Portrait
                </button>
              </>
            )}
            
            <button style={styles.backButton} onClick={() => setStep('review')}>
              ← Back to Review
            </button>
          </div>
        )}

        {/* CUSTOM PROMPT STEP */}
        {step === 'custom' && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>✨ Custom Prompt</h2>
            <p style={styles.customHint}>
              Describe your vision. Your dog's identity will be preserved automatically.
            </p>
            <textarea
              style={styles.customInput}
              placeholder="Example: My dog as a pirate captain on a ship at sunset, wearing an eye patch and captain's hat..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={4}
            />
            
            <div style={styles.strictnessSection}>
              <p style={styles.strictnessLabel}>Identity Preservation:</p>
              <div style={styles.strictnessOptions}>
                {['strict', 'balanced', 'wild'].map(level => (
                  <button
                    key={level}
                    style={{
                      ...styles.strictnessButton,
                      ...(strictness === level ? styles.strictnessSelected : {})
                    }}
                    onClick={() => setStrictness(level)}
                  >
                    {level === 'strict' && '🔒 Strict'}
                    {level === 'balanced' && '⚖️ Balanced'}
                    {level === 'wild' && '🎨 Wild'}
                  </button>
                ))}
              </div>
              <p style={styles.strictnessHint}>
                {strictness === 'strict' && 'Exact match - your dog will look identical'}
                {strictness === 'balanced' && 'Recommended - recognizable with artistic freedom'}
                {strictness === 'wild' && 'Creative - more stylization allowed'}
              </p>
            </div>
            
            <button 
              style={styles.generateButton}
              onClick={handleGenerate}
              disabled={!customPrompt.trim()}
            >
              🎨 Generate Portrait
            </button>
            
            <button style={styles.backButton} onClick={() => {
              setUseCustomPrompt(false)
              setStep('style')
            }}>
              ← Back to Styles
            </button>
          </div>
        )}

        {/* GENERATING STEP */}
        {step === 'generating' && (
          <div style={styles.card}>
            <img src={imagePreview} alt="Your dog" style={styles.previewImage} />
            <div style={styles.loadingEmoji}>🎨</div>
            <p style={styles.progressText}>Creating your portrait...</p>
            {selectedVariant && !useCustomPrompt && (
              <p style={styles.variantGenerating}>"{selectedVariant.title}"</p>
            )}
            <div style={styles.progressContainer}>
              <div style={{ ...styles.progressBar, width: `${progress}%` }} />
            </div>
            <p style={styles.progressHint}>This takes 30-60 seconds</p>
          </div>
        )}

        {/* RESULT STEP */}
        {step === 'result' && (
          <div style={styles.card}>
            <div style={styles.resultContainer}>
              <img src={result} alt="Generated portrait" style={styles.resultImage} />
            </div>
            
            {selectedVariant && !useCustomPrompt && (
              <p style={styles.resultTitle}>
                {STYLES.find(s => s.id === selectedStyle)?.emoji} {selectedVariant.title}
              </p>
            )}
            
            <div style={styles.actionButtons}>
              <a href={result} download="pet-portrait.png" style={styles.downloadButton}>
                💾 Save
              </a>
              <button style={styles.regenerateButton} onClick={handleRegenerate}>
                🎲 New Variant
              </button>
            </div>
            
            <button 
              style={styles.tryStyleButton}
              onClick={() => setStep('style')}
            >
              🎨 Try Different Style
            </button>
            
            <button style={styles.newButton} onClick={handleReset}>
              📸 New Photo
            </button>
          </div>
        )}

        {/* Error display */}
        {error && (
          <div style={styles.error}>{error}</div>
        )}

        <p style={styles.footer}>Powered by AI • $0.04/portrait</p>
      </div>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
    padding: '20px',
    color: 'white',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  content: {
    maxWidth: '500px',
    margin: '0 auto',
  },
  title: {
    textAlign: 'center',
    fontSize: '32px',
    marginBottom: '5px',
  },
  subtitle: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: '25px',
    fontSize: '14px',
  },
  card: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '20px',
    padding: '25px',
    backdropFilter: 'blur(10px)',
  },
  uploadArea: {
    border: '2px dashed rgba(255,255,255,0.3)',
    borderRadius: '15px',
    padding: '40px 20px',
    textAlign: 'center',
    cursor: 'pointer',
  },
  uploadIcon: {
    fontSize: '50px',
    marginBottom: '15px',
  },
  uploadText: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '8px',
  },
  uploadHint: {
    fontSize: '14px',
    opacity: 0.7,
  },
  previewImage: {
    width: '100%',
    borderRadius: '15px',
    marginBottom: '20px',
  },
  loadingEmoji: {
    fontSize: '50px',
    textAlign: 'center',
    animation: 'pulse 1s infinite',
  },
  progressText: {
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '15px',
  },
  progressHint: {
    textAlign: 'center',
    fontSize: '14px',
    opacity: 0.7,
    marginTop: '8px',
  },
  detectionCard: {
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '12px',
    padding: '15px',
    marginBottom: '20px',
  },
  detectionTitle: {
    fontSize: '16px',
    marginBottom: '12px',
  },
  traitGrid: {
    display: 'grid',
    gap: '10px',
  },
  trait: {
    display: 'flex',
    flexDirection: 'column',
  },
  traitLabel: {
    fontSize: '12px',
    opacity: 0.6,
    textTransform: 'uppercase',
  },
  traitValue: {
    fontSize: '15px',
    fontWeight: 'bold',
  },
  confidence: {
    fontSize: '11px',
    opacity: 0.5,
  },
  humanDetected: {
    marginTop: '12px',
    padding: '10px',
    background: 'rgba(255,200,0,0.2)',
    borderRadius: '8px',
    textAlign: 'center',
  },
  humanOptions: {
    marginBottom: '20px',
  },
  optionLabel: {
    fontSize: '14px',
    marginBottom: '10px',
  },
  optionGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  },
  optionButton: {
    padding: '12px',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  optionSelected: {
    background: 'rgba(102, 126, 234, 0.3)',
    borderColor: '#667eea',
  },
  sectionTitle: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  styleGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '20px',
  },
  styleButton: {
    padding: '15px 8px',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
  },
  styleSelected: {
    background: 'rgba(102, 126, 234, 0.3)',
    borderColor: '#667eea',
  },
  styleEmoji: {
    fontSize: '28px',
    marginBottom: '6px',
  },
  styleName: {
    fontSize: '12px',
    fontWeight: 'bold',
    marginBottom: '2px',
  },
  styleDesc: {
    fontSize: '10px',
    opacity: 0.7,
    display: 'none',
  },
  customButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  variantPreview: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px',
    background: 'rgba(255,255,255,0.1)',
    borderRadius: '10px',
    marginBottom: '15px',
    flexWrap: 'wrap',
  },
  variantLabel: {
    fontSize: '13px',
    opacity: 0.7,
  },
  variantTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
  },
  shuffleButton: {
    padding: '6px 12px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '6px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
  },
  primaryButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  generateButton: {
    width: '100%',
    padding: '15px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  backButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  customHint: {
    fontSize: '14px',
    opacity: 0.8,
    marginBottom: '15px',
    textAlign: 'center',
  },
  customInput: {
    width: '100%',
    padding: '12px',
    background: 'rgba(255,255,255,0.1)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: '10px',
    color: 'white',
    fontSize: '14px',
    resize: 'vertical',
    marginBottom: '15px',
    boxSizing: 'border-box',
  },
  strictnessSection: {
    marginBottom: '20px',
  },
  strictnessLabel: {
    fontSize: '14px',
    marginBottom: '10px',
  },
  strictnessOptions: {
    display: 'flex',
    gap: '8px',
    marginBottom: '8px',
  },
  strictnessButton: {
    flex: 1,
    padding: '10px',
    background: 'rgba(255,255,255,0.1)',
    border: '2px solid rgba(255,255,255,0.2)',
    borderRadius: '8px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '12px',
  },
  strictnessSelected: {
    background: 'rgba(102, 126, 234, 0.3)',
    borderColor: '#667eea',
  },
  strictnessHint: {
    fontSize: '12px',
    opacity: 0.6,
    textAlign: 'center',
  },
  variantGenerating: {
    textAlign: 'center',
    fontSize: '14px',
    opacity: 0.8,
    marginTop: '5px',
    fontStyle: 'italic',
  },
  progressContainer: {
    width: '100%',
    height: '8px',
    background: 'rgba(255,255,255,0.2)',
    borderRadius: '4px',
    overflow: 'hidden',
    marginTop: '20px',
  },
  progressBar: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.5s ease',
  },
  resultContainer: {
    borderRadius: '15px',
    overflow: 'hidden',
    marginBottom: '15px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
  },
  resultImage: {
    width: '100%',
    display: 'block',
  },
  resultTitle: {
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  actionButtons: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
    marginBottom: '10px',
  },
  downloadButton: {
    padding: '15px',
    background: 'linear-gradient(135deg, #11998e 0%, #38ef7d 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
    textAlign: 'center',
    textDecoration: 'none',
  },
  regenerateButton: {
    padding: '15px',
    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    border: 'none',
    borderRadius: '12px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  tryStyleButton: {
    width: '100%',
    padding: '12px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
    marginBottom: '10px',
  },
  newButton: {
    width: '100%',
    padding: '12px',
    background: 'transparent',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: '10px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '14px',
  },
  error: {
    background: 'rgba(255,0,0,0.2)',
    border: '1px solid rgba(255,0,0,0.5)',
    borderRadius: '10px',
    padding: '15px',
    marginTop: '15px',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    marginTop: '25px',
    opacity: 0.5,
    fontSize: '13px',
  },
}
