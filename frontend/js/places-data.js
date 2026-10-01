// Sample places (nakli data). Phase 8 mein yeh real API se aayega.
// Explore aur Saved dono pages isi file ko use karte hain.
// Saved places ab backend (database) mein rehte hain, js/api.js ka Saved helper dekho.

const PLACES = [
    // Mumbai
    { id: 1,  name: "Gateway of India",          city: "Mumbai", category: "Locations",   emoji: "🏛", tags: "Landmark, Colaba, Sea views" },
    { id: 2,  name: "Elephanta Caves",           city: "Mumbai", category: "Experiences", emoji: "🛶", tags: "Ferry ride, Rock-cut caves, Day trip" },
    { id: 3,  name: "Marine Drive sunset walk",  city: "Mumbai", category: "Experiences", emoji: "🌇", tags: "Free, Evening, Sea breeze" },
    { id: 4,  name: "Leopold Cafe",              city: "Mumbai", category: "Restaurants", emoji: "🍽", tags: "Classic cafe, Colaba, Casual" },
    { id: 5,  name: "Britannia & Co.",           city: "Mumbai", category: "Restaurants", emoji: "🍛", tags: "Parsi food, Ballard Estate" },
    { id: 6,  name: "Heritage hotels in Colaba", city: "Mumbai", category: "Stays",       emoji: "🏨", tags: "Central, Sightseeing base" },

    // Goa
    { id: 7,  name: "Baga Beach",                city: "Goa",    category: "Locations",   emoji: "🏖", tags: "Beach, Nightlife, Water sports" },
    { id: 8,  name: "Fontainhas walking tour",   city: "Goa",    category: "Experiences", emoji: "🎨", tags: "Old Panjim, Portuguese homes" },
    { id: 9,  name: "Palolem beach huts",        city: "Goa",    category: "Stays",       emoji: "🛖", tags: "South Goa, Quiet, Beachfront" },
    { id: 10, name: "Seafood shacks",            city: "Goa",    category: "Restaurants", emoji: "🦐", tags: "Fresh catch, Sunset, Beach" },

    // Jaipur
    { id: 11, name: "Amber Fort",                city: "Jaipur", category: "Locations",   emoji: "🏰", tags: "Fort, Heritage, Views" },
    { id: 12, name: "Hawa Mahal",                city: "Jaipur", category: "Locations",   emoji: "🕌", tags: "Pink City, Photography" },
    { id: 13, name: "Laxmi Misthan Bhandar",     city: "Jaipur", category: "Restaurants", emoji: "🍬", tags: "Sweets, Rajasthani thali" },
    { id: 14, name: "Haveli stays in the old city", city: "Jaipur", category: "Stays",    emoji: "🏨", tags: "Heritage, Courtyards" },

    // Manali
    { id: 15, name: "Solang Valley",             city: "Manali", category: "Experiences", emoji: "🪂", tags: "Adventure, Snow, Paragliding" },
    { id: 16, name: "Old Manali cafes",          city: "Manali", category: "Restaurants", emoji: "☕", tags: "Riverside, Laid-back" },
    { id: 17, name: "Hadimba Temple",            city: "Manali", category: "Locations",   emoji: "🌲", tags: "Cedar forest, Temple" },

    // Kerala
    { id: 18, name: "Alleppey houseboat",        city: "Kerala", category: "Stays",       emoji: "🛥", tags: "Backwaters, Overnight" },
    { id: 19, name: "Munnar tea gardens",        city: "Kerala", category: "Locations",   emoji: "🍃", tags: "Hills, Tea estates, Cool weather" },
    { id: 20, name: "Kerala sadya meal",         city: "Kerala", category: "Restaurants", emoji: "🍌", tags: "Banana-leaf feast, Vegetarian" },
];