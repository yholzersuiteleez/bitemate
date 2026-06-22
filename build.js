/* Bitemate static site builder.
   Generates per-country recipe landing pages + sitemap.xml from the data below.
   Run: node build.js   (regenerates /<slug>/index.html for every country + sitemap.xml)
   Add a country = add an entry to COUNTRIES and re-run. */

const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://bitemate.io';

const COUNTRIES = [
  { slug:'japan', name:'Japan', native:'日本', flag:'🇯🇵', cuisine:'Japanese', bg:'bg-jp',
    intro:'From a grandmother\'s onigiri in Kyoto to late-night ramen in Tokyo, Japanese home cooking is built on restraint, seasonality, and deep respect for the ingredient. These are the dishes Japanese families actually make on a weeknight — not the tasting-menu version.',
    dishes:[
      {name:'Onigiri', cook:'Akiko', city:'Kyoto', emoji:'🍙', score:'9.1', saves:'2,341'},
      {name:'Miso soup', cook:'Haruto', city:'Osaka', emoji:'🥣', score:'8.7', saves:'1,560'},
      {name:'Chicken katsu curry', cook:'Yuki', city:'Tokyo', emoji:'🍛', score:'9.2', saves:'3,887'},
      {name:'Tamagoyaki', cook:'Sora', city:'Nagoya', emoji:'🍳', score:'8.9', saves:'1,204'},
    ]},
  { slug:'italy', name:'Italy', native:'Italia', flag:'🇮🇹', cuisine:'Italian', bg:'bg-it',
    intro:'Italian home cooking is regional, stubborn, and gloriously simple — a handful of ingredients treated exactly right. From a Roman cacio e pepe to a Sunday ragù in Bologna, this is the food Italian families have argued over for generations.',
    dishes:[
      {name:'Cacio e pepe', cook:'Marco', city:'Rome', emoji:'🍝', score:'9.0', saves:'3,206'},
      {name:'Ragù alla bolognese', cook:'Giulia', city:'Bologna', emoji:'🍝', score:'9.3', saves:'4,402'},
      {name:'Margherita pizza', cook:'Salvatore', city:'Naples', emoji:'🍕', score:'9.4', saves:'6,118'},
      {name:'Tiramisù', cook:'Chiara', city:'Treviso', emoji:'🍰', score:'9.1', saves:'2,990'},
    ]},
  { slug:'india', name:'India', native:'भारत', flag:'🇮🇳', cuisine:'Indian', bg:'bg-in',
    intro:'India isn\'t one cuisine — it\'s dozens, changing every few hundred kilometres. From a slow-simmered Punjabi dal makhani to a South Indian dosa at dawn, these are the home recipes passed down in Indian kitchens, spice box by spice box.',
    dishes:[
      {name:'Dal makhani', cook:'Priya', city:'Delhi', emoji:'🍛', score:'9.2', saves:'2,768'},
      {name:'Masala dosa', cook:'Arjun', city:'Bengaluru', emoji:'🥞', score:'9.0', saves:'3,540'},
      {name:'Butter chicken', cook:'Neha', city:'Amritsar', emoji:'🍗', score:'9.3', saves:'5,221'},
      {name:'Chana masala', cook:'Rohan', city:'Mumbai', emoji:'🍲', score:'8.8', saves:'1,902'},
    ]},
  { slug:'mexico', name:'Mexico', native:'México', flag:'🇲🇽', cuisine:'Mexican', bg:'bg-mx',
    intro:'Mexican home cooking is ancient and alive — corn, chiles, and time. From tacos al pastor off a CDMX comal to a pot of pozole that takes all day, this is the food Mexican families gather around, far beyond the Tex-Mex shorthand.',
    dishes:[
      {name:'Tacos al pastor', cook:'Carlos', city:'CDMX', emoji:'🌮', score:'9.3', saves:'4,491'},
      {name:'Pozole rojo', cook:'Lupita', city:'Guadalajara', emoji:'🍲', score:'9.1', saves:'2,330'},
      {name:'Chiles en nogada', cook:'Mateo', city:'Puebla', emoji:'🌶️', score:'9.0', saves:'1,688'},
      {name:'Guacamole', cook:'Sofía', city:'Oaxaca', emoji:'🥑', score:'8.9', saves:'3,015'},
    ]},
  { slug:'thailand', name:'Thailand', native:'ไทย', flag:'🇹🇭', cuisine:'Thai', bg:'bg-th',
    intro:'Thai cooking balances four things at once — sweet, sour, salty, spicy — in a single mouthful. From a street-stall pad thai to a fiery som tam pounded fresh, these are the dishes Thai home cooks build around a mortar and pestle.',
    dishes:[
      {name:'Pad thai', cook:'Nong', city:'Bangkok', emoji:'🍜', score:'9.0', saves:'3,602'},
      {name:'Green curry', cook:'Anong', city:'Chiang Mai', emoji:'🍛', score:'9.2', saves:'2,944'},
      {name:'Som tam', cook:'Kamon', city:'Khon Kaen', emoji:'🥗', score:'8.9', saves:'1,777'},
      {name:'Mango sticky rice', cook:'Ploy', city:'Bangkok', emoji:'🥭', score:'9.1', saves:'2,560'},
    ]},
  { slug:'south-korea', name:'South Korea', native:'한국', flag:'🇰🇷', cuisine:'Korean', bg:'bg-kr',
    intro:'Korean home cooking is built on the banchan table and the deep funk of fermentation. From a bubbling kimchi jjigae to bibimbap layered in a stone bowl, this is the everyday food of Korean kitchens, kimchi fridge and all.',
    dishes:[
      {name:'Kimchi jjigae', cook:'Jiwoo', city:'Seoul', emoji:'🍲', score:'9.1', saves:'2,955'},
      {name:'Bibimbap', cook:'Minseo', city:'Jeonju', emoji:'🍚', score:'9.3', saves:'4,012'},
      {name:'Tteokbokki', cook:'Hana', city:'Seoul', emoji:'🌶️', score:'8.8', saves:'3,330'},
      {name:'Japchae', cook:'Doyun', city:'Busan', emoji:'🍜', score:'9.0', saves:'1,995'},
    ]},
  { slug:'vietnam', name:'Vietnam', native:'Việt Nam', flag:'🇻🇳', cuisine:'Vietnamese', bg:'bg-vn',
    intro:'Vietnamese cooking is fresh, herbal, and light on its feet — broths simmered for hours, herbs piled raw on top. From a bowl of phở bò in Hanoi to a crackling bánh mì, this is the food Vietnamese families make morning, noon, and night.',
    dishes:[
      {name:'Phở bò', cook:'Mai', city:'Hanoi', emoji:'🍜', score:'9.4', saves:'4,118'},
      {name:'Bánh mì', cook:'Long', city:'Saigon', emoji:'🥖', score:'9.1', saves:'3,560'},
      {name:'Gỏi cuốn', cook:'Linh', city:'Huế', emoji:'🥬', score:'8.9', saves:'2,041'},
      {name:'Bún chả', cook:'Tuan', city:'Hanoi', emoji:'🍲', score:'9.2', saves:'2,780'},
    ]},
  { slug:'nigeria', name:'Nigeria', native:'Nàìjíríyà', flag:'🇳🇬', cuisine:'Nigerian', bg:'bg-ng',
    intro:'Nigerian home cooking is bold, smoky, and built for a full table. From the eternal jollof rice debate to a deep pot of egusi soup, this is the food Nigerian families cook for Sunday, for celebration, and for everyday.',
    dishes:[
      {name:'Jollof rice', cook:'Tunde', city:'Lagos', emoji:'🍚', score:'9.4', saves:'5,012'},
      {name:'Egusi soup', cook:'Amara', city:'Enugu', emoji:'🍲', score:'9.1', saves:'2,460'},
      {name:'Suya', cook:'Bello', city:'Abuja', emoji:'🍢', score:'9.2', saves:'3,118'},
      {name:'Puff puff', cook:'Ngozi', city:'Lagos', emoji:'🍩', score:'8.8', saves:'1,640'},
    ]},
  { slug:'peru', name:'Peru', native:'Perú', flag:'🇵🇪', cuisine:'Peruvian', bg:'bg-pe',
    intro:'Peruvian cooking sits where the Pacific, the Andes, and waves of migration meet. From a bright ceviche cured in lime to a hearty lomo saltado, these are the dishes Peruvian home cooks are quietly proud of.',
    dishes:[
      {name:'Ceviche', cook:'Lucía', city:'Lima', emoji:'🐟', score:'8.9', saves:'1,884'},
      {name:'Lomo saltado', cook:'Diego', city:'Lima', emoji:'🥘', score:'9.2', saves:'2,770'},
      {name:'Ají de gallina', cook:'Rosa', city:'Arequipa', emoji:'🍛', score:'9.0', saves:'1,510'},
      {name:'Causa limeña', cook:'Mateo', city:'Cusco', emoji:'🥔', score:'8.8', saves:'1,205'},
    ]},
  { slug:'morocco', name:'Morocco', native:'المغرب', flag:'🇲🇦', cuisine:'Moroccan', bg:'bg-ma',
    intro:'Moroccan home cooking is slow and fragrant — preserved lemon, saffron, and the steam of a clay tagine. From a lamb tagine simmered for hours to a Friday couscous, this is the food Moroccan families share by the handful, around one dish.',
    dishes:[
      {name:'Lamb tagine', cook:'Yasmine', city:'Marrakech', emoji:'🍲', score:'9.2', saves:'2,231'},
      {name:'Couscous', cook:'Omar', city:'Fès', emoji:'🥘', score:'9.0', saves:'1,944'},
      {name:'Harira', cook:'Salma', city:'Casablanca', emoji:'🍵', score:'8.9', saves:'1,320'},
      {name:'Chicken b\'stilla', cook:'Karim', city:'Rabat', emoji:'🥧', score:'9.1', saves:'1,070'},
    ]},
  { slug:'greece', name:'Greece', native:'Ελλάδα', flag:'🇬🇷', cuisine:'Greek', bg:'bg-gr',
    intro:'Greek home cooking is sunlight, olive oil, and the long lunch. From a layered moussaka to a village salad heaped with feta, this is the food Greek families pass around the table until everyone has had too much — happily.',
    dishes:[
      {name:'Moussaka', cook:'Eleni', city:'Athens', emoji:'🥘', score:'8.8', saves:'1,747'},
      {name:'Souvlaki', cook:'Nikos', city:'Thessaloniki', emoji:'🍢', score:'9.1', saves:'2,860'},
      {name:'Greek salad', cook:'Maria', city:'Crete', emoji:'🥗', score:'8.9', saves:'2,110'},
      {name:'Spanakopita', cook:'Yiannis', city:'Athens', emoji:'🥧', score:'9.0', saves:'1,505'},
    ]},
  { slug:'france', name:'France', native:'France', flag:'🇫🇷', cuisine:'French', bg:'bg-fr',
    intro:'French home cooking is humbler than its reputation — a roast chicken, a pot of ratatouille, a stew that improves overnight. From Provençal vegetables to a weeknight croque monsieur, this is the food French families actually put on the table.',
    dishes:[
      {name:'Ratatouille', cook:'Camille', city:'Nice', emoji:'🍆', score:'9.0', saves:'2,640'},
      {name:'Boeuf bourguignon', cook:'Louis', city:'Dijon', emoji:'🥘', score:'9.3', saves:'3,420'},
      {name:'Croque monsieur', cook:'Élodie', city:'Paris', emoji:'🥪', score:'8.8', saves:'1,980'},
      {name:'Crêpes', cook:'Hugo', city:'Rennes', emoji:'🥞', score:'9.1', saves:'2,505'},
    ]},
];

const esc = s => String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
const jsonEsc = s => String(s).replace(/\\/g,'\\\\').replace(/"/g,'\\"');

function recipeLd(c){
  const items = c.dishes.map((d,i)=>({
    "@type":"ListItem","position":i+1,
    "item":{
      "@type":"Recipe","name":d.name,"recipeCuisine":c.cuisine,
      "author":{"@type":"Person","name":d.cook},
      "url":`${ORIGIN}/${c.slug}/`,
      "aggregateRating":{"@type":"AggregateRating","ratingValue":d.score,"bestRating":"10","ratingCount":String(d.saves).replace(/,/g,'')}
    }
  }));
  return {
    "@context":"https://schema.org",
    "@graph":[
      {"@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":`${ORIGIN}/`},
        {"@type":"ListItem","position":2,"name":`${c.cuisine} recipes`,"item":`${ORIGIN}/${c.slug}/`}
      ]},
      {"@type":"ItemList","name":`Popular ${c.cuisine} home recipes`,"itemListElement":items}
    ]
  };
}

function cardHtml(c,d){
  return `      <article class="card">
        <div class="card-img ${c.bg}"><span aria-hidden="true">${d.emoji}</span>
          <div class="card-pin"><span class="dot"></span> ${esc(c.name)} · ${esc(c.native)}</div>
        </div>
        <div class="card-body">
          <h3 class="card-title">${esc(d.name)}</h3>
          <p class="card-meta">${esc(d.cook)} · ${esc(d.city)}</p>
          <div class="card-row"><span class="card-score">${d.score}</span><span class="card-saves">${d.saves} saves</span></div>
        </div>
      </article>`;
}

function page(c){
  const title = `${c.cuisine} Recipes — Authentic ${c.name} Home Cooking | Bitemate`;
  const desc = `Discover authentic ${c.cuisine} recipes shared by home cooks in ${c.name}. ${c.dishes.slice(0,3).map(d=>d.name).join(', ')} and more — real ${c.name} home cooking on Bitemate.`;
  const url = `${ORIGIN}/${c.slug}/`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}" />
<meta name="robots" content="index, follow, max-image-preview:large" />
<meta name="theme-color" content="#FFFFFF" media="(prefers-color-scheme: light)" />
<meta name="theme-color" content="#1C1C1E" media="(prefers-color-scheme: dark)" />
<link rel="canonical" href="${url}" />
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Ccircle cx='16' cy='16' r='15' fill='%23007AFF'/%3E%3Ccircle cx='16' cy='16' r='9' fill='none' stroke='white' stroke-width='1.5'/%3E%3Cpath d='M1 16h30M16 1a20 20 0 0 1 0 30M16 1a20 20 0 0 0 0 30' fill='none' stroke='white' stroke-width='1.5'/%3E%3C/svg%3E" />
<meta property="og:type" content="website" />
<meta property="og:site_name" content="Bitemate" />
<meta property="og:title" content="${esc(title)}" />
<meta property="og:description" content="${esc(desc)}" />
<meta property="og:url" content="${url}" />
<meta property="og:image" content="${ORIGIN}/og-image.png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${esc(title)}" />
<meta name="twitter:description" content="${esc(desc)}" />
<meta name="twitter:image" content="${ORIGIN}/og-image.png" />
<script type="application/ld+json">
${JSON.stringify(recipeLd(c), null, 0)}
</script>
<link rel="stylesheet" href="/assets/country.css" />
</head>
<body>

<header class="nav">
  <div class="wrap nav-row">
    <a href="/" class="brand" aria-label="Bitemate home">
      <span class="dot" aria-hidden="true"></span><span>Bitemate</span>
    </a>
    <nav class="nav-links" aria-label="Primary">
      <a href="/#how">How it works</a>
      <a href="/#explore">Explore</a>
      <a class="btn btn-primary btn-sm" href="/#waitlist">Join the waitlist</a>
    </nav>
  </div>
</header>

<main>
<nav class="breadcrumb wrap" aria-label="Breadcrumb">
  <a href="/">Home</a> <span aria-hidden="true">›</span> <span>${esc(c.cuisine)} recipes</span>
</nav>

<section class="c-hero wrap">
  <div class="c-flag" aria-hidden="true">${c.flag}</div>
  <h1 class="t-large">${esc(c.cuisine)} recipes,<br><em class="ny">from ${esc(c.name)}.</em></h1>
  <p class="c-intro">${esc(c.intro)}</p>
  <div class="hero-ctas">
    <a class="btn btn-primary btn-lg" href="/#waitlist">Join the waitlist</a>
    <a class="btn btn-gray btn-lg" href="/#explore">Explore other countries</a>
  </div>
</section>

<section class="section-tight wrap">
  <div class="stories-head">
    <div>
      <span class="t-badge" style="margin-bottom:8px; display:inline-block">On the map in ${esc(c.name)}</span>
      <h2 class="t-title1">Popular ${esc(c.cuisine)} dishes <span style="color:var(--label-3)">home cooks are sharing.</span></h2>
    </div>
  </div>
  <div class="stories">
${c.dishes.map(d=>cardHtml(c,d)).join('\n')}
  </div>
</section>

<section class="section waitlist">
  <div class="wrap">
    <span class="t-badge">Join the table</span>
    <h2 class="t-title1" style="margin-top:8px">Cook ${esc(c.name)}. Be first on the map.</h2>
    <p>The beta opens to waitlist members first, country by country. Tell us where you're cooking from.</p>
    <form class="signup" onsubmit="event.preventDefault(); this.querySelector('button').textContent='You’re on the list.'; this.querySelector('input').value='';" aria-label="Join the waitlist">
      <input type="email" required placeholder="your@email.com" aria-label="Email address" />
      <button class="btn btn-primary" type="submit">Join the waitlist</button>
    </form>
    <p class="legal">We'll only email about the beta. No spam, no resold lists.</p>
  </div>
</section>
</main>

<footer class="footer">
  <div class="wrap footer-row">
    <div>© 2026 Bitemate · The world is full of good food.</div>
    <div class="footer-links">
      <a href="/#how">How it works</a>
      <a href="/#explore">Explore</a>
      <a href="/#faq">FAQ</a>
      <a href="mailto:hello@bitemate.io">Contact</a>
    </div>
  </div>
</footer>

</body>
</html>
`;
}

// ---- write country pages ----
let written = [];
for(const c of COUNTRIES){
  const dir = path.join(__dirname, c.slug);
  fs.mkdirSync(dir, {recursive:true});
  fs.writeFileSync(path.join(dir, 'index.html'), page(c));
  written.push(`/${c.slug}/`);
}

// ---- sitemap ----
const urls = ['/', ...written];
const today = process.env.BUILD_DATE || '2026-06-22';
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.w3.org/1999/sitemap/0.9">
${urls.map(u=>`  <url><loc>${ORIGIN}${u}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u==='/'?'1.0':'0.8'}</priority></url>`).join('\n')}
</urlset>
`.replace('http://www.w3.org/1999/sitemap/0.9','http://www.sitemaps.org/schemas/sitemap/0.9');
fs.writeFileSync(path.join(__dirname, 'sitemap.xml'), sitemap);

// ---- robots ----
fs.writeFileSync(path.join(__dirname, 'robots.txt'),
`User-agent: *
Allow: /

Sitemap: ${ORIGIN}/sitemap.xml
`);

console.log(`Built ${COUNTRIES.length} country pages + sitemap.xml (${urls.length} urls) + robots.txt`);
