// Бургер-меню для мобильных устройств
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', (e) => {
        e.stopPropagation();
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

    // Закрытие меню при нажатии Esc
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && navMenu.classList.contains('active')) {
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

// Функционал копирования и шаринга для страниц статей
const shareBtn = document.getElementById('share-btn');
const copyLinkBtn = document.getElementById('copy-link-btn');
const copyNotification = document.getElementById('copy-notification');

// Общие функции для копирования
function copyUrl(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text)
            .then(() => true)
            .catch(err => {
                console.error('Ошибка Clipboard API:', err);
                return fallbackCopy(text);
            });
    } else {
        return fallbackCopy(text);
    }
}

function fallbackCopy(text) {
    return new Promise((resolve) => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            resolve(successful);
        } catch (err) {
            console.error('Ошибка при fallback копировании:', err);
            document.body.removeChild(textArea);
            resolve(false);
        }
    });
}

function showNotification(message = 'Ссылка скопирована в буфер обмена!') {
    if (copyNotification) {
        copyNotification.textContent = message;
        copyNotification.classList.add('show');
        setTimeout(() => {
            copyNotification.classList.remove('show');
        }, 3000);
    }
}

// Функция для создания меню шаринга
function createShareMenu() {
    const shareMenu = document.createElement('div');
    shareMenu.className = 'share-menu';
    shareMenu.innerHTML = `
        <div class="share-menu-content">
            <div class="share-menu-header">
                <h3>Поделиться ссылкой</h3>
                <button class="share-menu-close">&times;</button>
            </div>
            <div class="share-options">
                <button class="share-option" data-platform="telegram">
                    <i class="fab fa-telegram"></i>
                    <span>Telegram</span>
                </button>
                <button class="share-option" data-platform="whatsapp">
                    <i class="fab fa-whatsapp"></i>
                    <span>WhatsApp</span>
                </button>
                <button class="share-option" data-platform="vk">
                    <i class="fab fa-vk"></i>
                    <span>ВКонтакте</span>
                </button>
                <button class="share-option" data-platform="email">
                    <i class="fas fa-envelope"></i>
                    <span>Email</span>
                </button>
                <button class="share-option" data-platform="copy">
                    <i class="far fa-copy"></i>
                    <span>Скопировать ссылку</span>
                </button>
            </div>
            <div class="share-url">
                <input type="text" readonly value="${window.location.href}" class="share-url-input">
                <button class="copy-url-btn">
                    <i class="far fa-copy"></i>
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(shareMenu);
    
    const closeBtn = shareMenu.querySelector('.share-menu-close');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(shareMenu);
    });
    
    shareMenu.addEventListener('click', (e) => {
        if (e.target === shareMenu) {
            document.body.removeChild(shareMenu);
        }
    });
    
    const options = shareMenu.querySelectorAll('.share-option');
    options.forEach(option => {
        option.addEventListener('click', () => {
            const platform = option.dataset.platform;
            handleSharePlatform(platform);
            document.body.removeChild(shareMenu);
        });
    });
    
    const copyUrlBtn = shareMenu.querySelector('.copy-url-btn');
    const urlInput = shareMenu.querySelector('.share-url-input');
    
    copyUrlBtn.addEventListener('click', async () => {
        urlInput.select();
        const success = await copyUrl(window.location.href);
        if (success) {
            showNotification();
            document.body.removeChild(shareMenu);
        }
    });
    
    return shareMenu;
}

function handleSharePlatform(platform) {
    const url = window.location.href;
    const title = document.title;
    const text = 'Командная строка CMD: полный гид по основным командам Windows';
    
    const shareUrls = {
        telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`,
        whatsapp: `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`,
        vk: `https://vk.com/share.php?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&comment=${encodeURIComponent(text)}`,
        email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(text + '\n\n' + url)}`,
        copy: null
    };
    
    if (platform === 'copy') {
        copyUrl(url).then(success => {
            if (success) {
                showNotification();
            }
        });
    } else if (shareUrls[platform]) {
        window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
}

// Обработчик для кнопки "Поделиться"
if (shareBtn) {
    shareBtn.addEventListener('click', () => {
        const url = window.location.href;
        const title = document.title;
        const text = 'Командная строка CMD: полный гид по основным командам Windows';
        
        if (navigator.share) {
            navigator.share({
                title: title,
                text: text,
                url: url
            }).catch(err => {
                console.log('Ошибка Web Share API:', err);
                createShareMenu();
            });
        } else {
            createShareMenu();
        }
    });
}

// Обработчик для кнопки "Копировать ссылку"
if (copyLinkBtn) {
    copyLinkBtn.addEventListener('click', async () => {
        const url = window.location.href;
        
        try {
            const success = await copyUrl(url);
            if (success) {
                showNotification();
                const originalHTML = copyLinkBtn.innerHTML;
                const originalBackground = copyLinkBtn.style.background;
                const originalColor = copyLinkBtn.style.color;
                
                copyLinkBtn.innerHTML = '<i class="fas fa-check"></i> Скопировано!';
                copyLinkBtn.style.background = 'linear-gradient(135deg, #4fcd9c 0%, #508ea9 100%)';
                copyLinkBtn.style.color = 'white';
                
                setTimeout(() => {
                    copyLinkBtn.innerHTML = originalHTML;
                    copyLinkBtn.style.background = originalBackground;
                    copyLinkBtn.style.color = originalColor;
                }, 2000);
            } else {
                showNotification('Не удалось скопировать. Скопируйте вручную: ' + url);
            }
        } catch (error) {
            console.error('Ошибка при копировании:', error);
            showNotification('Ошибка копирования. Скопируйте вручную: ' + url);
        }
    });
}

// Добавляем стили для меню шаринга
const shareMenuStyles = `
    .share-menu {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 2000;
        animation: fadeIn 0.3s ease;
    }
    
    .share-menu-content {
        background: white;
        border-radius: 12px;
        padding: 20px;
        width: 90%;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        animation: slideUp 0.3s ease;
    }
    
    .share-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 20px;
        padding-bottom: 15px;
        border-bottom: 1px solid #e2e8f0;
    }
    
    .share-menu-header h3 {
        margin: 0;
        color: #2d3748;
        font-size: 1.2rem;
    }
    
    .share-menu-close {
        background: none;
        border: none;
        font-size: 24px;
        color: #a0aec0;
        cursor: pointer;
        padding: 0;
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.3s ease;
    }
    
    .share-menu-close:hover {
        background: #f7fafc;
        color: #4a5568;
    }
    
    .share-options {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        margin-bottom: 20px;
    }
    
    .share-option {
        background: #f7fafc;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        padding: 12px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 8px;
        cursor: pointer;
        transition: all 0.3s ease;
        color: #4a5568;
    }
    
    .share-option:hover {
        background: #edf2f7;
        transform: translateY(-2px);
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }
    
    .share-option i {
        font-size: 24px;
    }
    
    .share-option[data-platform="telegram"] i {
        color: #0088cc;
    }
    
    .share-option[data-platform="whatsapp"] i {
        color: #25D366;
    }
    
    .share-option[data-platform="vk"] i {
        color: #4C75A3;
    }
    
    .share-option[data-platform="email"] i {
        color: #508ea9;
    }
    
    .share-option[data-platform="copy"] i {
        color: #4fcd9c;
    }
    
    .share-option span {
        font-size: 0.9rem;
        font-weight: 500;
    }
    
    .share-url {
        display: flex;
        gap: 10px;
    }
    
    .share-url-input {
        flex: 1;
        padding: 10px 15px;
        border: 1px solid #e2e8f0;
        border-radius: 8px;
        font-size: 0.9rem;
        background: #f7fafc;
        color: #4a5568;
    }
    
    .copy-url-btn {
        background: linear-gradient(135deg, #4fcd9c 0%, #508ea9 100%);
        color: white;
        border: none;
        border-radius: 8px;
        padding: 0 20px;
        cursor: pointer;
        font-size: 1rem;
        transition: all 0.3s ease;
    }
    
    .copy-url-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
    }
    
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes slideUp {
        from {
            opacity: 0;
            transform: translateY(20px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    @media (max-width: 480px) {
        .share-options {
            grid-template-columns: 1fr;
        }
        
        .share-option {
            flex-direction: row;
            justify-content: flex-start;
            padding: 15px;
        }
        
        .share-option i {
            margin-right: 10px;
        }
    }
`;

const styleElement = document.createElement('style');
styleElement.textContent = shareMenuStyles;
document.head.appendChild(styleElement);

// ИСПРАВЛЕННЫЙ КЛАСС ГАЛЕРЕИ
class ScreenshotGallery {
    constructor() {
        this.images = [];
        this.currentIndex = 0;
        this.isZoomed = false;
        this.init();
    }

    init() {
        this.createModal();
        this.collectImages();
        this.addEventListeners();
    }

    createModal() {
        // Создаем модальное окно, если его нет
        if (!document.getElementById('imageModal')) {
            const modalHTML = `
                <div id="imageModal" class="image-modal">
                    <span class="modal-close">&times;</span>
                    <button class="modal-prev">
                        <i class="fas fa-chevron-left"></i>
                    </button>
                    <button class="modal-next">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                    <div class="modal-content">
                        <img id="modalImage" src="" alt="Просмотр изображения">
                    </div>
                    <div class="modal-caption">
                        <p id="modalCaption"></p>
                        <span class="image-counter">
                            <span id="currentImage">1</span> из <span id="totalImages">1</span>
                        </span>
                    </div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalCaption = document.getElementById('modalCaption');
        this.currentImageSpan = document.getElementById('currentImage');
        this.totalImagesSpan = document.getElementById('totalImages');
    }

    collectImages() {
        // Собираем все изображения в статье
        const screenshots = document.querySelectorAll('.article-content img');
        
        this.images = Array.from(screenshots).map((img, index) => ({
            src: img.src,
            alt: img.alt || `Скриншот ${index + 1}`,
            element: img
        }));

        // Добавляем класс для миниатюр
        this.images.forEach(item => {
            item.element.classList.add('screenshot-thumb');
            item.element.dataset.galleryIndex = this.images.indexOf(item);
        });

        if (this.totalImagesSpan && this.images.length > 0) {
            this.totalImagesSpan.textContent = this.images.length;
        }
    }

    addEventListeners() {
        // Клик по изображению для открытия
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('screenshot-thumb')) {
                const index = parseInt(e.target.dataset.galleryIndex);
                this.openModal(index);
            }
        });

        // Закрытие модального окна
        const closeBtn = this.modal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => this.closeModal());
        }

        // Кнопки навигации
        const prevBtn = this.modal.querySelector('.modal-prev');
        const nextBtn = this.modal.querySelector('.modal-next');
        
        if (prevBtn) {
            prevBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.prevImage();
            });
        }
        
        if (nextBtn) {
            nextBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.nextImage();
            });
        }

        // Закрытие по клику вне изображения
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
            }
        });

        // Управление с клавиатуры
        document.addEventListener('keydown', (e) => {
            if (!this.modal.classList.contains('active')) return;
            
            switch(e.key) {
                case 'Escape':
                    this.closeModal();
                    break;
                case 'ArrowLeft':
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
                case ' ':
                    e.preventDefault();
                    this.toggleZoom();
                    break;
            }
        });

        // Зум по двойному клику
        if (this.modalImage) {
            this.modalImage.addEventListener('dblclick', (e) => {
                e.stopPropagation();
                this.toggleZoom();
            });

            // Свайпы на мобильных устройствах
            let touchStartX = 0;
            let touchEndX = 0;

            this.modalImage.addEventListener('touchstart', (e) => {
                if (this.isZoomed) return;
                touchStartX = e.touches[0].clientX;
            }, { passive: true });

            this.modalImage.addEventListener('touchend', (e) => {
                if (this.isZoomed) return;
                touchEndX = e.changedTouches[0].clientX;
                this.handleSwipe(touchStartX, touchEndX);
            }, { passive: true });
        }
    }

    openModal(index) {
        if (this.images.length === 0) return;
        
        this.currentIndex = index;
        this.isZoomed = false;
        this.updateModalContent();
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    closeModal() {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
        this.isZoomed = false;
        this.modalImage.classList.remove('zoomed');
        this.modalImage.style.transform = 'scale(1)';
    }

    updateModalContent() {
        if (this.images.length === 0) return;
        
        const currentImage = this.images[this.currentIndex];
        
        // Устанавливаем текущее изображение
        this.modalImage.src = currentImage.src;
        this.modalImage.alt = currentImage.alt;
        this.modalCaption.textContent = currentImage.alt;
        
        if (this.currentImageSpan) {
            this.currentImageSpan.textContent = this.currentIndex + 1;
        }
        
        if (this.totalImagesSpan) {
            this.totalImagesSpan.textContent = this.images.length;
        }
        
        // Сбрасываем зум при смене изображения
        this.isZoomed = false;
        this.modalImage.classList.remove('zoomed');
        this.modalImage.style.transform = 'scale(1)';
    }

    prevImage() {
        if (this.isZoomed) return; // Не переключаем при увеличении
        this.currentIndex = (this.currentIndex - 1 + this.images.length) % this.images.length;
        this.updateModalContent();
    }

    nextImage() {
        if (this.isZoomed) return; // Не переключаем при увеличении
        this.currentIndex = (this.currentIndex + 1) % this.images.length;
        this.updateModalContent();
    }

    toggleZoom() {
        this.isZoomed = !this.isZoomed;
        this.modalImage.classList.toggle('zoomed', this.isZoomed);
        
        if (this.isZoomed) {
            this.modalImage.style.transform = 'scale(2)';
        } else {
            this.modalImage.style.transform = 'scale(1)';
        }
    }

    handleSwipe(startX, endX) {
        if (this.isZoomed) return; // Не переключаем при увеличении
        
        const swipeThreshold = 50;
        const diff = endX - startX;
        
        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                this.prevImage();
            } else {
                this.nextImage();
            }
        }
    }
}

// Инициализация галереи при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    // Разрешаем выделение текста
    const selectableSelectors = [
        '.article-content',
        '.command-example',
        '.command-table',
        '.ms-reference',
        'code',
        'pre',
        '.allow-select'
    ];
    
    selectableSelectors.forEach(selector => {
        document.querySelectorAll(selector).forEach(element => {
            element.style.userSelect = 'text';
            element.style.webkitUserSelect = 'text';
            element.style.MozUserSelect = 'text';
            element.style.msUserSelect = 'text';
        });
    });
    
    // Добавляем класс для автоматического разрешения выделения
    document.querySelectorAll('.article-content p, .article-content li, .article-content h1, .article-content h2, .article-content h3, .command-example, .command-table, .command-table td, .command-table th, .ms-reference, .ms-reference p, .ms-reference li, .ms-reference h3')
        .forEach(el => el.classList.add('allow-select'));
    
    // Анимация для всех кнопок при наведении
    document.querySelectorAll('.btn, .share-btn, .copy-btn, .back-btn').forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Инициализируем галерею
    window.screenshotGallery = new ScreenshotGallery();
});

// Закрытие меню при нажатии Esc
document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        const shareMenu = document.querySelector('.share-menu');
        if (shareMenu) {
            document.body.removeChild(shareMenu);
        }
        
        if (navMenu && navMenu.classList.contains('active')) {
            navMenu.classList.remove('active');
            if (hamburger) {
                hamburger.innerHTML = '<i class="fas fa-bars"></i>';
            }
        }
    }
});
