const PLACES = [
    // Mumbai
    { id: 1, name: "Gateway of India", city: "Mumbai", category: "Locations", emoji: "🏛", tags: "Landmark, Colaba, Sea views",
      area: "Colaba",
      about: "A grand stone arch on the Mumbai waterfront, built in the early 1900s. It is one of the city's best-known landmarks and a good first stop for first-time visitors.",
      tips: ["Go early in the morning or around sunset to avoid the midday heat and crowds.", "Ferries to Elephanta Caves leave from the jetty nearby."] },
    { id: 2, name: "Elephanta Caves", city: "Mumbai", category: "Experiences", emoji: "🛶", tags: "Ferry ride, Rock-cut caves, Day trip",
      area: "Elephanta Island, Mumbai Harbour",
      about: "Rock-cut cave temples on an island in Mumbai harbour, reached by a ferry ride. The caves are best known for their large carved figures of Shiva, and the site is a UNESCO World Heritage Site.",
      tips: ["Ferries start from near the Gateway of India. Check the timings on the day.", "The caves are usually closed one day a week, so confirm before you go.", "Carry water and wear comfortable shoes. There are steps to climb."] },
    { id: 3, name: "Marine Drive sunset walk", city: "Mumbai", category: "Experiences", emoji: "🌇", tags: "Free, Evening, Sea breeze",
      area: "Nariman Point to Girgaum Chowpatty",
      about: "A long curved seafront promenade along the Arabian Sea. Locals come here in the evening to sit on the sea wall, and the curve of lights at night gives it the nickname Queen's Necklace.",
      tips: ["Sunset is the best time to go.", "It is a public promenade, so there is no entry fee."] },
    { id: 4, name: "Leopold Cafe", city: "Mumbai", category: "Restaurants", emoji: "🍽", tags: "Classic cafe, Colaba, Casual",
      area: "Colaba Causeway",
      about: "A long-running cafe on Colaba Causeway that is popular with both locals and tourists. A casual place for a meal or a cold drink while exploring the area.",
      tips: ["Expect a wait at peak meal times.", "The Colaba Causeway market is right outside, so you can combine both."] },
    { id: 5, name: "Britannia & Co.", city: "Mumbai", category: "Restaurants", emoji: "🍛", tags: "Parsi food, Ballard Estate",
      area: "Ballard Estate",
      about: "A classic Parsi restaurant in Ballard Estate, known for Parsi home-style dishes such as the berry pulao.",
      tips: ["It is mainly a lunch place and is often busy, so go early.", "Check opening days and timings before you visit."] },
    { id: 6, name: "Heritage hotels in Colaba", city: "Mumbai", category: "Stays", emoji: "🏨", tags: "Central, Sightseeing base",
      area: "Colaba",
      about: "Colaba is a central part of South Mumbai, close to the Gateway of India, cafes and shops. A good base if you want to see the main sights on foot.",
      tips: ["Book early for weekends and holidays.", "Compare prices on a few booking sites before you decide."] },

    // Goa
    { id: 7, name: "Baga Beach", city: "Goa", category: "Locations", emoji: "🏖", tags: "Beach, Nightlife, Water sports",
      area: "North Goa",
      about: "One of North Goa's busiest beaches, with water sports, beach shacks and lively evenings.",
      tips: ["It gets crowded in peak season, roughly November to February.", "Go in the morning for a quieter beach."] },
    { id: 8, name: "Fontainhas walking tour", city: "Goa", category: "Experiences", emoji: "🎨", tags: "Old Panjim, Portuguese homes",
      area: "Panaji (Panjim)",
      about: "The old Latin Quarter of Panaji, with narrow lanes, colourful Portuguese-style houses and small chapels. Best explored slowly on foot.",
      tips: ["Go in the morning or late afternoon for softer light and cooler weather.", "Be respectful of residents, since people live in these houses."] },
    { id: 9, name: "Palolem beach huts", city: "Goa", category: "Stays", emoji: "🛖", tags: "South Goa, Quiet, Beachfront",
      area: "Canacona, South Goa",
      about: "A crescent-shaped beach in South Goa that is calmer than the north. Many stays here are simple beach huts close to the sand.",
      tips: ["Beach huts are often seasonal, so check availability for your dates.", "Good for a relaxed few days rather than a party trip."] },
    { id: 10, name: "Seafood shacks", city: "Goa", category: "Restaurants", emoji: "🦐", tags: "Fresh catch, Sunset, Beach",
      area: "Beaches across Goa",
      about: "Casual beachside shacks across Goa serve fresh fish, prawns and other seafood, usually with a sea view.",
      tips: ["Ask about the day's catch and the price before ordering.", "Tables with a sunset view fill up early."] },

    // Jaipur
    { id: 11, name: "Amber Fort", city: "Jaipur", category: "Locations", emoji: "🏰", tags: "Fort, Heritage, Views",
      area: "Amer, near Jaipur",
      about: "A hilltop fort-palace just outside Jaipur, known for its courtyards, gates and mirror work inside. It is part of the Hill Forts of Rajasthan UNESCO World Heritage Site.",
      tips: ["Go early to avoid the heat and crowds.", "Wear comfortable shoes, as there is a lot of walking and some steep slopes."] },
    { id: 12, name: "Hawa Mahal", city: "Jaipur", category: "Locations", emoji: "🕌", tags: "Pink City, Photography",
      area: "Old City, Jaipur",
      about: "A five-storey pink sandstone facade with hundreds of small windows, built in the late 1700s. It is one of the most photographed buildings in Jaipur.",
      tips: ["Morning light is best for photos of the front.", "Rooftop cafes across the road offer a good view."] },
    { id: 13, name: "Laxmi Misthan Bhandar", city: "Jaipur", category: "Restaurants", emoji: "🍬", tags: "Sweets, Rajasthani thali",
      area: "Johari Bazaar, Jaipur",
      about: "A well-known sweet shop and restaurant in Johari Bazaar, popular for Rajasthani sweets and thali meals.",
      tips: ["Try the local sweets and snacks.", "It is busy at lunch, so go a little early."] },
    { id: 14, name: "Haveli stays in the old city", city: "Jaipur", category: "Stays", emoji: "🏨", tags: "Heritage, Courtyards",
      area: "Old City, Jaipur",
      about: "Several old havelis in Jaipur's walled city have been turned into guesthouses and hotels, with courtyards and traditional decor.",
      tips: ["Check how far the stay is from the main road, as lanes can be narrow.", "In summer, ask whether the rooms have air conditioning."] },

    // Manali
    { id: 15, name: "Solang Valley", city: "Manali", category: "Experiences", emoji: "🪂", tags: "Adventure, Snow, Paragliding",
      area: "Near Manali",
      about: "A valley near Manali known for adventure activities such as paragliding. In winter, snow draws visitors for winter sports.",
      tips: ["Activities depend on the season and weather, so check what is running.", "Carry warm clothes, as it can be cold even outside winter."] },
    { id: 16, name: "Old Manali cafes", city: "Manali", category: "Restaurants", emoji: "☕", tags: "Riverside, Laid-back",
      area: "Old Manali",
      about: "Old Manali, across the river from the main town, is known for its relaxed cafes, small shops and mountain views.",
      tips: ["Walk around, as the lanes are narrow and parking is limited.", "Evenings can be cold, so carry a jacket."] },
    { id: 17, name: "Hadimba Temple", city: "Manali", category: "Locations", emoji: "🌲", tags: "Cedar forest, Temple",
      area: "Manali",
      about: "A wooden temple set in a cedar forest, dedicated to Hidimbi Devi. Its stacked wooden roofs make it look different from most temples in India, and it dates to the 16th century.",
      tips: ["Go in the morning when it is quieter.", "Dress modestly and follow the temple rules."] },

    // Kerala
    { id: 18, name: "Alleppey houseboat", city: "Kerala", category: "Stays", emoji: "🛥", tags: "Backwaters, Overnight",
      area: "Alappuzha backwaters",
      about: "Traditional houseboats cruise the backwaters of Alappuzha (Alleppey) in Kerala, with day trips and overnight stays available.",
      tips: ["Compare packages, as what is included (meals, duration) varies a lot.", "Check that the boat is registered and has safety equipment."] },
    { id: 19, name: "Munnar tea gardens", city: "Kerala", category: "Locations", emoji: "🍃", tags: "Hills, Tea estates, Cool weather",
      area: "Idukki district",
      about: "A hill station in Kerala surrounded by rolling tea plantations and cool mountain air.",
      tips: ["Mornings are often misty and cool.", "Roads are winding, so plan extra travel time."] },
    { id: 20, name: "Kerala sadya meal", city: "Kerala", category: "Restaurants", emoji: "🍌", tags: "Banana-leaf feast, Vegetarian",
      area: "Across Kerala",
      about: "A traditional vegetarian feast served on a banana leaf, with many small dishes. It is especially associated with festivals such as Onam.",
      tips: ["Many restaurants serve a sadya at lunch, and some only on special days.", "It is traditionally eaten with the hand."] },
];


// ---------- Shared helpers (Explore, Saved aur Place pages) ----------

// Featured places ki id "f1", "f2"... taaki Geoapify ki ids se na takrayein
PLACES.forEach((p) => { p.id = "f" + p.id; });

const CATEGORY_EMOJI = { Restaurants: "🍽", Stays: "🏨", Experiences: "🎡", Locations: "📍" };

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}


function coverIndex(id) {
    let h = 0;
    for (const ch of String(id)) h = (h * 31 + ch.charCodeAt(0)) % 6007;
    return h % 6;
}

function emojiFor(place) {
    return place.emoji || CATEGORY_EMOJI[place.category] || "📍";
}

function placeUrl(place) {
    return "place.html?id=" + encodeURIComponent(place.id);
}

// Ek place ka card. onHeart na do toh heart button nahi dikhta.
function buildPlaceCard(place, isSaved, onHeart) {
    const card = el("article", "place-card");

    const cover = el("div", "place-cover trip-cover cover-" + coverIndex(place.id), emojiFor(place));
    cover.append(el("span", "place-cat", place.category));

    if (onHeart) {
        const heart = el("button", "heart-btn", isSaved ? "♥" : "♡");
        heart.type = "button";
        heart.setAttribute("aria-pressed", String(isSaved));
        heart.setAttribute("aria-label", (isSaved ? "Remove " : "Save ") + place.name);
        heart.addEventListener("click", () => onHeart(place.id));
        cover.append(heart);
    }

    const body = el("div", "place-body");
    const title = el("h3");
    const link = el("a", "place-link", place.name);
    link.href = placeUrl(place);
    title.append(link);
    body.append(
        title,
        el("p", "place-city", place.city || ""),
        el("p", "place-tags", place.tags || place.address || "")
    );

    card.append(cover, body);
    return card;
}
