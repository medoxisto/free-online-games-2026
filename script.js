document.addEventListener('DOMContentLoaded', () => {
    const gamesContainer = document.getElementById('games-container');
    const featuredGamesContainer = document.getElementById('featured-games-container');
    const loader = document.getElementById('loader');
    const searchInput = document.getElementById('search-input');
    const noResultsMessage = document.getElementById('no-results');

    // Ensure GAMES_DATA is loaded from games-data.js
    if (typeof GAMES_DATA === 'undefined' || !GAMES_DATA) {
        console.error('Game data not found! Make sure games-data.js is loaded correctly.');
        loader.style.display = 'none';
        gamesContainer.innerHTML = '<p style="color: #f44336; width: 100%; text-align: center;">Could not load game data. The site may be broken.</p>';
        return;
    }

    let currentPage = 1;
    let isLoading = false;
    const GAMES_PER_PAGE = 12;
    const TOTAL_GAMES = GAMES_DATA.length;

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
        const fragment = document.createDocumentFragment();
        games.forEach(game => {
            fragment.appendChild(createGameCard(game));
        });
        gamesContainer.appendChild(fragment);
    };

    const renderFeaturedGames = (games) => {
        const fragment = document.createDocumentFragment();
        // Show up to 8 games as featured
        games.slice(0, 8).forEach(game => { 
            fragment.appendChild(createGameCard(game, true));
        });
        featuredGamesContainer.appendChild(fragment);
    };

    const loadMoreGames = () => {
        if (isLoading) return;
        
        const startIndex = (currentPage - 1) * GAMES_PER_PAGE;
        if (startIndex >= TOTAL_GAMES) {
            loader.style.display = 'none'; // All games loaded
            return;
        }

        isLoading = true;
        loader.style.display = 'flex';

        // Simulate a short delay for a smoother loading experience
        setTimeout(() => {
            const endIndex = startIndex + GAMES_PER_PAGE;
            const gamesToRender = GAMES_DATA.slice(startIndex, endIndex);

            renderGames(gamesToRender);
            currentPage++;
            isLoading = false;

            if (endIndex >= TOTAL_GAMES) {
                loader.style.display = 'none';
            }
        }, 300);
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
        
        const allGamesLoaded = ((currentPage - 1) * GAMES_PER_PAGE) >= TOTAL_GAMES;
        loader.style.display = searchTerm ? 'none' : (allGamesLoaded ? 'none' : 'flex');
    };

    const observer = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading && searchInput.value.trim() === '') {
            loadMoreGames();
        }
    }, { rootMargin: '0px 0px 400px 0px' });

    searchInput.addEventListener('input', handleSearch);
    observer.observe(loader);

    // Initial load
    renderFeaturedGames(GAMES_DATA);
    loadMoreGames();
});
