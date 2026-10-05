const EVENTS = [
    { name: "Diwali", months: [10, 11], when: "October or November (follows the lunar calendar)", where: "All over India",
      about: "The festival of lights, celebrated with oil lamps, sweets, fireworks and family gatherings. Cities and markets are decorated and lit up.",
      tip: "Book travel and stays early, as it is a peak family travel time." },
    { name: "Holi", months: [3], when: "March (date follows the lunar calendar)", where: "North India, especially Mathura, Vrindavan and Jaipur",
      about: "The festival of colours, marked by throwing coloured powder and water. Celebrations are loud, messy and joyful.",
      tip: "Wear old clothes and protect your phone and camera from colour and water." },
    { name: "Pushkar Camel Fair", months: [10, 11], when: "Around October or November (near Kartik Purnima)", where: "Pushkar, Rajasthan",
      about: "A large livestock fair with camel trading, folk performances and a lively market, in a small town beside a sacred lake.",
      tip: "Stays in Pushkar fill up well in advance, so book early." },
    { name: "Ganesh Chaturthi", months: [8, 9], when: "August or September", where: "Mumbai, Pune and across Maharashtra",
      about: "A ten-day festival for Lord Ganesha, with decorated idols in homes and public pandals, ending with immersion processions.",
      tip: "Roads in big cities get crowded on the last day, so plan around the processions." },
    { name: "Durga Puja", months: [9, 10], when: "September or October", where: "Kolkata and across West Bengal",
      about: "Neighbourhood pandals with elaborate themes, art and food mark this festival for the goddess Durga.",
      tip: "Visit pandals in the evening and expect long queues at the famous ones." },
    { name: "Onam", months: [8, 9], when: "August or September", where: "Kerala",
      about: "Kerala's harvest festival, known for flower carpets (pookalam), boat races and the sadya feast.",
      tip: "Many shops and offices close around the main days, so plan ahead." },
    { name: "Hornbill Festival", months: [12], when: "The first ten days of December", where: "Kisama, near Kohima, Nagaland",
      about: "A showcase of the Naga tribes' music, dance, crafts and food.",
      tip: "Check the latest entry and permit rules for Nagaland before you travel." },
    { name: "Rann Utsav", months: [11, 12, 1, 2], when: "Roughly November to February", where: "Kutch, Gujarat",
      about: "A festival at the white salt desert with cultural programmes, crafts and tent stays, especially pretty on full-moon nights.",
      tip: "Book tents early. Nights can be cold in winter." },
    { name: "Jaipur Literature Festival", months: [1], when: "January", where: "Jaipur, Rajasthan",
      about: "A large literature festival with writers, speakers and book events.",
      tip: "Check the official site for registration and the schedule, and book Jaipur stays early." },
    { name: "Goa Carnival", months: [2, 3], when: "February or March (before Lent)", where: "Goa",
      about: "Colourful parades, music and dance, rooted in Goa's Portuguese-era traditions.",
      tip: "Parades are in the afternoon and streets get crowded, so reach early." },
    { name: "Hemis Festival", months: [6, 7], when: "June or July", where: "Hemis Monastery, Ladakh",
      about: "A monastery festival with masked 'cham' dances.",
      tip: "Ladakh is high altitude, so rest a day or two to acclimatise first." },
    { name: "Thrissur Pooram", months: [4, 5], when: "April or May", where: "Thrissur, Kerala",
      about: "A temple festival famous for decorated elephants, drum ensembles and fireworks.",
      tip: "Crowds are very large, so go early and keep your valuables safe." },
    { name: "Navratri and Garba", months: [9, 10], when: "September or October (nine nights)", where: "Gujarat, especially Ahmedabad and Vadodara",
      about: "Nine nights of garba and dandiya dancing, with people dressed in bright traditional clothes.",
      tip: "Popular venues sell passes in advance. Check before you go." },
    { name: "Mysuru Dasara", months: [9, 10], when: "September or October", where: "Mysuru, Karnataka",
      about: "A ten-day festival with a grand procession and an illuminated palace.",
      tip: "The palace is lit up in the evenings during the festival." },
    { name: "International Kite Festival", months: [1], when: "Around mid-January", where: "Ahmedabad, Gujarat",
      about: "Part of the Makar Sankranti (Uttarayan) celebrations, with kite-flying competitions across the city.",
      tip: "Be careful of kite strings if you ride a two-wheeler in these days." },
];

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

const grid = document.getElementById("eventGrid");
const countEl = document.getElementById("eventCount");
const monthSelect = document.getElementById("monthSelect");
const searchInput = document.getElementById("eventSearch");
const thisMonth = new Date().getMonth() + 1;

function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
}

function buildCard(ev) {
    const card = el("article", "event-card");
    if (ev.months.includes(thisMonth)) card.append(el("span", "month-badge", "Around this month"));
    card.append(
        el("h3", "", ev.name),
        el("p", "event-when", ev.when),
        el("p", "event-where", ev.where),
        el("p", "event-about", ev.about),
        el("p", "event-tip", "Tip: " + ev.tip)
    );
    return card;
}

function render() {
    const month = monthSelect.value;
    const q = searchInput.value.trim().toLowerCase();

    const list = EVENTS.filter((ev) =>
        (month === "all" || ev.months.includes(Number(month))) &&
        (!q || (ev.name + " " + ev.where).toLowerCase().includes(q))
    );

    grid.innerHTML = "";
    countEl.textContent = list.length + (list.length === 1 ? " festival" : " festivals");

    if (list.length === 0) {
        const box = el("div", "empty-state");
        box.style.gridColumn = "1 / -1";
        box.append(el("div", "empty-art", "🎉"), el("h3", "", "No festivals match"), el("p", "", "Try another month or search word."));
        grid.append(box);
        return;
    }
    list.forEach((ev) => grid.append(buildCard(ev)));
}

const all = el("option", "", "All months");
all.value = "all";
monthSelect.append(all);
MONTHS.forEach((name, i) => {
    const opt = el("option", "", name);
    opt.value = String(i + 1);
    monthSelect.append(opt);
});

monthSelect.addEventListener("change", render);
searchInput.addEventListener("input", render);
render();
