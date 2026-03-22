const OMDB_API_KEY = 'd9f0ff3d'; 
const BASE_URL = `https://www.omdbapi.com/?apikey=${OMDB_API_KEY}`;
let currentHeroID = '';

// Dynamic Year Calculation
const currentYear = new Date().getFullYear();
const nextYear = currentYear + 1;

lucide.createIcons();

const grid = document.getElementById('movieGrid');
const searchInput = document.getElementById('searchInput');
const modal = document.getElementById('movieModal');

// Mood Mapping to Search Queries
const MOOD_MAP = {
    happy: ['Comedy', 'Animation', 'Adventure'],
    dark: ['Thriller', 'Horror', 'Mystery'],
    excited: ['Action', 'War', 'Racing'],
    romantic: ['Romance', 'Love', 'Drama'],
    scared: ['Horror', 'Slasher', 'Paranormal'],
    thoughtful: ['Documentary', 'Biography', 'History']
};

// Search logic with debounce
let searchTimeout;
searchInput.addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    const query = e.target.value.trim();
    if (query.length < 3) return;
    searchTimeout = setTimeout(() => {
        resetAllActiveStates();
        document.getElementById('gridTitle').innerText = "Search Results";
        fetchMovies(query);
    }, 600);
});

async function fetchMovies(query) {
    grid.innerHTML = `<div class="col-span-full py-20 text-center"><div class="custom-loader w-12 h-12 rounded-full mx-auto mb-4"></div></div>`;
    try {
        const response = await fetch(`${BASE_URL}&s=${query}`);
        const data = await response.json();
        if (data.Response === "True") {
            renderMovies(data.Search);
        } else {
            grid.innerHTML = `<div class="col-span-full text-center py-20 text-slate-500 italic">No results found for "${query}". Try another term!</div>`;
        }
    } catch (err) {
        grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 font-bold uppercase tracking-widest">API CONNECTION ERROR</div>`;
    }
}

async function fetchByMood(mood) {
    const btn = document.getElementById(`mood-${mood}`);
    const wasActive = btn.classList.contains('active');
    
    resetAllActiveStates();
    
    if (wasActive) {
        // If it was already active, go back to default trending
        document.getElementById('gridTitle').innerText = `Trending ${currentYear}`;
        document.getElementById('gridSubtitle').innerText = "Real-time data synced from IMDb servers.";
        fetchMovies(currentYear.toString());
        return;
    }

    btn.classList.add('active');
    
    const queries = MOOD_MAP[mood];
    const randomQuery = queries[Math.floor(Math.random() * queries.length)];
    
    document.getElementById('gridTitle').innerText = `${mood.charAt(0).toUpperCase() + mood.slice(1)} Vibes`;
    document.getElementById('gridSubtitle').innerText = `Handpicked ${randomQuery} selections from IMDb.`;
    
    fetchMovies(randomQuery);
}

function renderMovies(data, append = false) {
    const html = data.map(movie => {
        const poster = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/500x750?text=No+Poster";
        return `
            <div onclick="fetchMovieDetails('${movie.imdbID}')" class="movie-card group cursor-pointer relative bg-slate-900 rounded-2xl overflow-hidden border border-slate-800 hover:border-yellow-500 transition-all duration-300">
                <div class="overflow-hidden relative poster-img">
                    <img src="${poster}" class="w-full h-full object-cover group-hover:scale-110 transition duration-700" alt="${movie.Title}" loading="lazy">
                    <div class="poster-overlay absolute inset-0 bg-black/70 opacity-0 flex items-center justify-center transition duration-300">
                            <span class="bg-yellow-500 text-black font-black px-6 py-2 rounded-full text-xs uppercase tracking-widest shadow-xl">Details</span>
                    </div>
                </div>
                <div class="p-4">
                    <h4 class="font-bold text-white truncate text-sm mb-1 uppercase tracking-tight">${movie.Title}</h4>
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] text-slate-500 font-black uppercase tracking-widest">${movie.Year}</span>
                        <span class="text-[9px] bg-slate-800 text-yellow-500 px-2 py-0.5 rounded font-black uppercase">${movie.Type}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    if (append) {
        grid.innerHTML += html;
    } else {
        grid.innerHTML = html;
    }
}

async function fetchMovieDetails(id) {
    if (!id) return;
    try {
        const response = await fetch(`${BASE_URL}&i=${id}&plot=full`);
        const movie = await response.json();
        
        document.getElementById('modalPoster').src = movie.Poster !== "N/A" ? movie.Poster : "https://via.placeholder.com/500x750?text=No+Poster";
        document.getElementById('modalTitle').innerText = movie.Title;
        document.getElementById('modalYearCountry').innerText = `${movie.Year} • ${movie.Country} • Rated ${movie.Rated}`;
        document.getElementById('modalRating').innerText = `IMDb ${movie.imdbRating}`;
        document.getElementById('modalRuntime').innerText = movie.Runtime;
        document.getElementById('modalGenre').innerText = movie.Genre;
        document.getElementById('modalPlot').innerText = movie.Plot;
        document.getElementById('modalDirector').innerText = movie.Director;
        document.getElementById('modalWriters').innerText = movie.Writer;
        document.getElementById('modalMetascore').innerText = movie.Metascore;
        document.getElementById('modalAwards').innerText = movie.Awards;
        document.getElementById('modalBoxOffice').innerText = movie.BoxOffice || 'N/A';

        const castArray = movie.Actors.split(', ');
        document.getElementById('modalCast').innerHTML = castArray.map(actor => 
            `<div class="flex items-center gap-2 py-2 border-b border-slate-800/50">
                <div class="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-bold text-yellow-500">${actor[0]}</div>
                <span class="font-medium text-sm">${actor}</span>
            </div>`
        ).join('');
        
        lucide.createIcons();
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    } catch (err) {
        console.error(err);
    }
}

function resetAllActiveStates() {
    document.querySelectorAll('.mood-chip').forEach(chip => chip.classList.remove('active'));
    document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
}

async function fetchCategory(query, title, btnId) {
    const btn = document.getElementById(btnId);
    const wasActive = btn.classList.contains('active');

    resetAllActiveStates();

    if (wasActive) {
        document.getElementById('gridTitle').innerText = `Trending ${currentYear}`;
        document.getElementById('gridSubtitle').innerText = "Real-time data synced from IMDb servers.";
        fetchMovies(currentYear.toString());
        return;
    }

    btn.classList.add('active');
    document.getElementById('gridTitle').innerText = title;
    document.getElementById('gridSubtitle').innerText = `Real-time data synced from IMDb servers.`;
    
    // Special case for Upcoming (fetches two years)
    if (query === 'upcoming_special') {
        grid.innerHTML = `<div class="col-span-full py-20 text-center"><div class="custom-loader w-12 h-12 rounded-full mx-auto mb-4"></div></div>`;
        try {
            const [res1, res2] = await Promise.all([
                fetch(`${BASE_URL}&s=${currentYear}`),
                fetch(`${BASE_URL}&s=${nextYear}`)
            ]);
            const data1 = await res1.json();
            const data2 = await res2.json();
            
            let combined = [];
            if (data1.Response === "True") combined = [...data1.Search];
            if (data2.Response === "True") combined = [...combined, ...data2.Search];
            
            if (combined.length > 0) {
                renderMovies(combined);
            } else {
                grid.innerHTML = `<div class="col-span-full text-center py-20 text-slate-500 italic">No upcoming titles found for ${currentYear}-${nextYear}.</div>`;
            }
        } catch (err) {
            grid.innerHTML = `<div class="col-span-full text-center py-20 text-red-500 font-bold uppercase tracking-widest">API CONNECTION ERROR</div>`;
        }
        return;
    }
    
    fetchMovies(query);
}

async function setupHero() {
    try {
        const res = await fetch(`${BASE_URL}&t=Deadpool & Wolverine`);
        const movie = await res.json();
        currentHeroID = movie.imdbID;
        document.getElementById('heroTitle').innerText = movie.Title;
        document.getElementById('heroMeta').innerText = `${movie.Year} • ${movie.Genre} • ${movie.Runtime}`;
        if(movie.Poster !== "N/A") document.getElementById('heroImage').src = movie.Poster;
    } catch (e) {
        document.getElementById('heroTitle').innerText = "Trending Movies";
    }
}

function openHeroDetails() {
    if (currentHeroID) {
        fetchMovieDetails(currentHeroID);
    }
}

function closeModal() {
    modal.classList.add('hidden');
    document.body.style.overflow = 'auto';
}

// Initialize Dynamic Buttons
function initDynamicContent() {
    const btnTrending = document.getElementById('btnTrending');
    const btnUpcoming = document.getElementById('btnUpcoming');
    
    btnTrending.innerText = `Trending ${currentYear}`;
    btnTrending.onclick = () => fetchCategory(currentYear.toString(), `Trending ${currentYear}`, 'btnTrending');
    
    btnUpcoming.innerText = `Upcoming ${currentYear}-${nextYear}`;
    btnUpcoming.onclick = () => fetchCategory('upcoming_special', `Upcoming Releases ${currentYear}-${nextYear}`, 'btnUpcoming');
}

window.onload = () => {
    initDynamicContent();
    setupHero();
    // Start with Trending as active
    const btnTrending = document.getElementById('btnTrending');
    btnTrending.classList.add('active');
    fetchCategory(currentYear.toString(), `Trending ${currentYear}`, 'btnTrending');
};