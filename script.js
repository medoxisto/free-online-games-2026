document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('games-container');
    const featuredGamesContainer = document.getElementById('featured-games-container');
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('search-input');
    const noResultsMessage = document.getElementById('no-results');

    let currentPage = 1;
    let isLoading = false;
    let allGamesLoaded = false;
    const GAMES_PER_PAGE = 12;
    const SID = 'TU070';

    const createGameCard = (game, isFeatured = false) => {
        const card = document.createElement('a');
        card.href = game.url;
        card.target = '_blank';
        card.rel = 'noopener noreferrer';
        card.className = isFeatured ? 'featured-game-card' : 'game-card';
        card.setAttribute('aria-label', `Play ${game.title}`);
        card.dataset.title = game.title.toLowerCase();

        card.innerHTML = `
            <img src="${game.thumbnailUrl}" alt="${game.title}" class="game-thumbnail" loading="lazy">
            <div class="game-info">
                <h3 class="game-title">${game.title}</h3>
            </div>
            ${game.category ? `<div class="game-category">${game.category}</div>` : ''}
        `;
        return card;
    };

    const renderGames = (games) => {
        if (!games || games.length === 0) {
            allGamesLoaded = true;
            loader.style.display = 'none';
            return;
        }
        
        const fragment = document.createDocumentFragment();
        games.forEach(game => {
            fragment.appendChild(createGameCard(game));
        });
        gamesContainer.appendChild(fragment);
    };

    const renderFeaturedGames = (games) => {
        const fragment = document.createDocumentFragment();
        games.slice(0, 6).forEach(game => { // Show first 6 as featured
            fragment.appendChild(createGameCard(game, true));
        });
        featuredGamesContainer.appendChild(fragment);
    };

    const fetchGames = async (page) => {
        if (isLoading || allGamesLoaded) return;

        isLoading = true;
        loader.style.display = 'flex';

        try {
            const apiUrl = `https://feeds.gamepix.com/v2/json?sid=${SID}&pagination=${GAMES_PER_PAGE}&page=${page}`;
            // Using a CORS proxy to bypass browser security restrictions (CORS policy)
            const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(apiUrl)}`;

            const response = await fetch(proxyUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            
            if (data && data.data) {
                if (page === 1) {
                    renderFeaturedGames(data.data);
                }
                renderGames(data.data);
                currentPage++;
                if (data.data.length < GAMES_PER_PAGE) {
                    allGamesLoaded = true;
                    loader.style.display = 'none';
                }
            } else {
                allGamesLoaded = true;
                loader.style.display = 'none';
            }
        } catch (error) {
            console.error("Failed to fetch games:", error);
            gamesContainer.innerHTML += '<p style="color: #f44336; width: 100%; text-align: center;">Failed to load games. Please try again later.</p>';
            loader.style.display = 'none';
            allGamesLoaded = true; // Stop trying on error
        } finally {
            isLoading = false;
        }
    };
    
    const handleSearch = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const allCards = gamesContainer.querySelectorAll('.game-card');
        let visibleCount = 0;

        allCards.forEach(card => {
            const title = card.dataset.title;
            const isVisible = title.includes(searchTerm);
            card.classList.toggle('hidden', !isVisible);
            if(isVisible) visibleCount++;
        });

        noResultsMessage.style.display = visibleCount === 0 && searchTerm !== '' ? 'block' : 'none';
        
        // Hide loader when searching
        loader.style.display = searchTerm ? 'none' : (allGamesLoaded ? 'none' : 'flex');
    };

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && !allGamesLoaded && searchInput.value.trim() === '') {
            fetchGames(currentPage);
        }
    }, { rootMargin: '0px 0px 400px 0px' });

    searchInput.addEventListener('input', handleSearch);
    observer.observe(loader);

    // Initial load
    fetchGames(currentPage);
});
