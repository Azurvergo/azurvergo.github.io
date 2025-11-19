// Бургер-меню для мобильных устройств
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.innerHTML = navMenu.classList.contains('active') 
            ? '<i class="fas fa-times"></i>' 
            : '<i class="fas fa-bars"></i>';
    });

    // Закрытие меню при клике на ссылку
    document.querySelectorAll('#nav-menu a').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        });
    });

    // Закрытие меню при клике вне его области
    document.addEventListener('click', (event) => {
        if (!event.target.closest('nav') && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            hamburger.innerHTML = '<i class="fas fa-bars"></i>';
        }
    });
}

// Установка текущего года в футере
document.getElementById('current-year').textContent = new Date().getFullYear();

// Плавная прокрутка для якорных ссылок
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;
        
        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 70,
                behavior: 'smooth'
            });
        }
    });
});

// Поиск по новостям (только для главной страницы)
const searchInput = document.getElementById('search-input');
const newsGrid = document.getElementById('news-grid');
const newsCards = document.querySelectorAll('.news-card');
const noResults = document.getElementById('no-results');
const searchResultsInfo = document.getElementById('search-results-info');

if (searchInput && newsGrid) {
    function highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    function performSearch() {
        const searchTerm = searchInput.value.trim().toLowerCase();
        let visibleCards = 0;
        
        if (searchTerm === '') {
            newsCards.forEach(card => {
                card.style.display = 'block';
                const title = card.querySelector('h3');
                const description = card.querySelector('p');
                const tags = card.querySelectorAll('.tag');
                
                title.innerHTML = title.textContent;
                description.innerHTML = description.textContent;
                tags.forEach(tag => {
                    tag.innerHTML = tag.textContent;
                });
            });
            searchResultsInfo.textContent = '';
            noResults.style.display = 'none';
            return;
        }
        
        newsCards.forEach(card => {
            const searchData = card.getAttribute('data-search').toLowerCase();
            const title = card.querySelector('h3');
            const description = card.querySelector('p');
            const tags = card.querySelectorAll('.tag');
            
            if (searchData.includes(searchTerm)) {
                card.style.display = 'block';
                visibleCards++;
                
                title.innerHTML = highlightText(title.textContent, searchTerm);
                description.innerHTML = highlightText(description.textContent, searchTerm);
                tags.forEach(tag => {
                    tag.innerHTML = highlightText(tag.textContent, searchTerm);
                });
            } else {
                card.style.display = 'none';
            }
        });
        
        if (visibleCards === 0) {
            noResults.style.display = 'block';
            searchResultsInfo.textContent = '';
        } else {
            noResults.style.display = 'none';
            searchResultsInfo.textContent = `Найдено статей: ${visibleCards}`;
        }
    }

    searchInput.addEventListener('input', performSearch);

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            performSearch();
        }
    });

    const searchIcon = document.querySelector('.search-icon');
    if (searchIcon) {
        searchIcon.addEventListener('click', function() {
            if (searchInput.value.trim() !== '') {
                searchInput.value = '';
                performSearch();
                searchInput.focus();
            }
        });
    }
}

// Функционал копирования ссылки для страниц статей
const shareBtn = document.getElementById('share-btn');
const copyNotification = document.getElementById('copy-notification');

if (shareBtn && copyNotification) {
    shareBtn.addEventListener('click', () => {
        const url = window.location.href;
        
        // Пытаемся использовать современный Web Share API
        if (navigator.share) {
            navigator.share({
                title: document.title,
                url: url
            }).catch(err => {
                console.log('Ошибка Web Share API:', err);
                // Fallback на копирование
                copyUrl(url);
            });
        } else {
            // Fallback для браузеров без поддержки Web Share API
            copyUrl(url);
        }
    });

    function copyUrl(text) {
        // Пробуем использовать современный Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(text).then(() => {
                showNotification();
            }).catch(err => {
                fallbackCopy(text);
            });
        } else {
            fallbackCopy(text);
        }
    }

    function fallbackCopy(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                showNotification();
            } else {
                alert('Не удалось скопировать ссылку. Пожалуйста, скопируйте ее вручную: ' + text);
            }
        } catch (err) {
            console.error('Не удалось скопировать ссылку: ', err);
            document.body.removeChild(textArea);
            alert('Не удалось скопировать ссылку. Пожалуйста, скопируйте ее вручную: ' + text);
        }
    }

    function showNotification() {
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 3000);
    }
}
