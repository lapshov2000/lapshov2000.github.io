document.addEventListener('DOMContentLoaded', function() {
    let slideIndex = 1;
    let slideInterval;
    const SLIDE_INTERVAL = 20000; // 20 seconds per slide
    let isAnimating = false;
    let lang = 'ru';

    // Устанавливаем язык по умолчанию
    document.documentElement.lang = lang;

    // Показываем первый слайд и запускаем автопереключение
    showSlides(slideIndex);
    startSlideShow();
    setupTVRemoteControl();
    createSnowflakes();
    addNavigationButtons();

    // Функция запуска автопереключения
    function startSlideShow() {
        stopSlideShow(); // Очищаем предыдущий интервал
        slideInterval = setInterval(() => {
            if (!isAnimating) {
                changeSlide(1);
            }
        }, SLIDE_INTERVAL);
    }

    // Функция остановки автопереключения
    function stopSlideShow() {
        if (slideInterval) {
            clearInterval(slideInterval);
        }
    }

    // Функция переключения слайдов
    window.changeSlide = function(n) {
        if (!isAnimating) {
            isAnimating = true;
            showSlides(slideIndex += n);
            // Перезапускаем таймер при ручном переключении
            startSlideShow();
        }
    }

    // Функция перехода к конкретному слайду
    window.currentSlide = function(n) {
        if (!isAnimating) {
            isAnimating = true;
            showSlides(slideIndex = n);
            // Перезапускаем таймер при ручном переключении
            startSlideShow();
        }
    }

    // Функция показа слайдов
    function showSlides(n) {
        const slides = document.getElementsByClassName("slide");
        const dots = document.getElementsByClassName("dot");
        
        if (n > slides.length) {slideIndex = 1}
        if (n < 1) {slideIndex = slides.length}
        
        // Скрываем все слайды
        for (let i = 0; i < slides.length; i++) {
            slides[i].style.opacity = "0";
            slides[i].style.visibility = "hidden";
            slides[i].classList.remove("active");
            dots[i].classList.remove("active");
        }
        
        // Показываем нужный слайд
        setTimeout(() => {
            slides[slideIndex-1].style.opacity = "1";
            slides[slideIndex-1].style.visibility = "visible";
            slides[slideIndex-1].classList.add("active");
            dots[slideIndex-1].classList.add("active");
            
            // Сбрасываем флаг анимации
            setTimeout(() => {
                isAnimating = false;
            }, 500);
        }, 500);
    }

    // Управление с клавиатуры
    document.addEventListener('keydown', (e) => {
        switch(e.key) {
            case 'ArrowLeft':
                changeSlide(-1);
                break;
            case 'ArrowRight':
                changeSlide(1);
                break;
        }
    });

    // Поддержка управления с телевизора
    function setupTVRemoteControl() {
        if (window.tizen !== undefined) {
            document.addEventListener('keydown', (e) => {
                switch(e.keyCode) {
                    case 37: // LEFT arrow
                    case 4: // LEFT on TV remote
                        changeSlide(-1);
                        break;
                    case 39: // RIGHT arrow
                    case 5: // RIGHT on TV remote
                        changeSlide(1);
                        break;
                    case 13: // ENTER
                    case 29460: // OK button on TV remote
                        // Пауза/продолжение слайдшоу
                        if (slideInterval) {
                            stopSlideShow();
                        } else {
                            startSlideShow();
                        }
                        break;
                }
            });
        }
    }

    // Переключение языка
    window.changeLanguage = function(newLang) {
        lang = newLang;
        document.documentElement.lang = lang;
    }

    // Пауза слайдшоу при наведении
    document.querySelector('.container').addEventListener('mouseenter', stopSlideShow);
    document.querySelector('.container').addEventListener('mouseleave', startSlideShow);

    function createSnow() {
        const snowContainer = document.querySelector('.snow-container');
        const snowflakesCount = 150;
        let mouseX = 0;
        let mouseY = 0;
        let lastMouseX = 0;
        let lastMouseY = 0;
        let mouseSpeedX = 0;
        let mouseSpeedY = 0;
        const interactionRadius = 150; // Увеличенный радиус взаимодействия
        
        // Отслеживание позиции и скорости мыши
        document.addEventListener('mousemove', (e) => {
            mouseSpeedX = e.clientX - mouseX;
            mouseSpeedY = e.clientY - mouseY;
            mouseX = e.clientX;
            mouseY = e.clientY;
        });
        
        if (snowContainer.children.length === 0) {
            for (let i = 0; i < snowflakesCount; i++) {
                const snowflake = document.createElement('div');
                snowflake.classList.add('snowflake');
                
                // Случайные размеры и начальные параметры
                const size = Math.random() * 4 + 1;
                snowflake.style.width = `${size}px`;
                snowflake.style.height = `${size}px`;
                snowflake.style.left = `${Math.random() * 100}vw`;
                
                // Добавляем физические свойства как data-атрибуты
                snowflake.dataset.velocityX = '0';
                snowflake.dataset.velocityY = `${Math.random() * 2 + 1}`;
                snowflake.dataset.rotation = '0';
                
                const duration = Math.random() * 3 + 2;
                snowflake.style.animationDuration = `${duration}s`;
                snowflake.style.animationDelay = `${Math.random() * duration}s`;
                snowflake.style.opacity = Math.random() * 0.8 + 0.2;
                
                snowContainer.appendChild(snowflake);
            }
        }
        
        // Функция обновления позиций снежинок
        function updateSnowflakes() {
            const snowflakes = document.querySelectorAll('.snowflake');
            snowflakes.forEach(snowflake => {
                const rect = snowflake.getBoundingClientRect();
                const snowflakeX = rect.left + rect.width / 2;
                const snowflakeY = rect.top + rect.height / 2;
                
                // Вычисляем расстояние до курсора
                const dx = mouseX - snowflakeX;
                const dy = mouseY - snowflakeY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                // Обновляем скорости
                let velocityX = parseFloat(snowflake.dataset.velocityX);
                let velocityY = parseFloat(snowflake.dataset.velocityY);
                let rotation = parseFloat(snowflake.dataset.rotation);
                
                if (distance < interactionRadius) {
                    const angle = Math.atan2(dy, dx);
                    const force = (interactionRadius - distance) / interactionRadius;
                    const repelX = -Math.cos(angle) * force * 2;
                    const repelY = -Math.sin(angle) * force * 2;
                    
                    // Добавляем влияние скорости мыши
                    velocityX += repelX + mouseSpeedX * 0.1;
                    velocityY += repelY + mouseSpeedY * 0.1;
                    rotation += (Math.random() - 0.5) * 10;
                }
                
                // Применяем затухание и гравитацию
                velocityX *= 0.98;
                velocityY = Math.min(velocityY + 0.1, 5); // Ограничиваем максимальную скорость падения
                rotation *= 0.95;
                
                // Сохраняем обновленные значения
                snowflake.dataset.velocityX = velocityX;
                snowflake.dataset.velocityY = velocityY;
                snowflake.dataset.rotation = rotation;
                
                // Обновляем позицию
                const currentX = parseFloat(snowflake.style.left);
                const currentY = rect.top;
                
                snowflake.style.left = `${currentX + velocityX}px`;
                snowflake.style.top = `${currentY + velocityY}px`;
                snowflake.style.transform = `rotate(${rotation}deg)`;
                
                // Проверяем границы
                if (currentY > window.innerHeight) {
                    snowflake.style.top = '-10px';
                    snowflake.style.left = `${Math.random() * 100}vw`;
                    snowflake.dataset.velocityY = Math.random() * 2 + 1;
                    snowflake.dataset.velocityX = 0;
                    snowflake.dataset.rotation = 0;
                }
                if (currentX < 0) snowflake.style.left = `${window.innerWidth}px`;
                if (currentX > window.innerWidth) snowflake.style.left = '0px';
            });
            
            requestAnimationFrame(updateSnowflakes);
        }
        
        updateSnowflakes();
    }

    // Инициализация снега
    createSnow();

    // Создаем и добавляем снежинки
    function createSnowflakes() {
        const snowContainer = document.createElement('div');
        snowContainer.className = 'snow-container';
        document.body.appendChild(snowContainer);

        for (let i = 0; i < 50; i++) {
            const snowflake = document.createElement('div');
            snowflake.className = 'snowflake';
            snowflake.style.left = Math.random() * 100 + 'vw';
            snowflake.style.animationDuration = (Math.random() * 3 + 2) + 's';
            snowflake.style.opacity = Math.random();
            snowflake.style.transform = `scale(${Math.random()})`;
            snowContainer.appendChild(snowflake);
        }

        // Обработчик движения мыши для снега
        document.addEventListener('mousemove', (e) => {
            const snowflakes = document.querySelectorAll('.snowflake');
            const mouseX = e.clientX;
            const mouseY = e.clientY;

            snowflakes.forEach(snowflake => {
                const rect = snowflake.getBoundingClientRect();
                const snowX = rect.left + rect.width / 2;
                const snowY = rect.top + rect.height / 2;

                const distX = mouseX - snowX;
                const distY = mouseY - snowY;
                const distance = Math.sqrt(distX * distX + distY * distY);

                if (distance < 100) { // Радиус реакции 100px
                    const angle = Math.atan2(distY, distX);
                    const force = (100 - distance) / 2;
                    const moveX = Math.cos(angle) * force;
                    const moveY = Math.sin(angle) * force;

                    snowflake.style.transform = `translate(${-moveX}px, ${-moveY}px)`;
                    snowflake.style.transition = 'transform 0.2s ease-out';
                } else {
                    snowflake.style.transform = 'translate(0, 0)';
                }
            });
        });
    }

    // Добавляем кнопки навигации
    function addNavigationButtons() {
        const prevButton = document.createElement('button');
        const nextButton = document.createElement('button');
        
        prevButton.className = 'nav-button prev-button';
        nextButton.className = 'nav-button next-button';
        
        prevButton.innerHTML = '&#10094;';
        nextButton.innerHTML = '&#10095;';
        
        prevButton.onclick = () => changeSlide(-1);
        nextButton.onclick = () => changeSlide(1);
        
        document.body.appendChild(prevButton);
        document.body.appendChild(nextButton);
    }

    // Music Control
    const bgMusic = document.getElementById('bgMusic');
    const musicToggle = document.getElementById('musicToggle');
    let isMusicPlaying = true; // Set to true by default

    // Автоматическое воспроизведение музыки при загрузке страницы
    document.addEventListener('click', function initAudio() {
        const bgMusic = document.getElementById('bgMusic');
        bgMusic.volume = 0.5;
        bgMusic.play().then(() => {
            document.removeEventListener('click', initAudio);
        }).catch(error => {
            console.log("Autoplay error:", error);
        });
    });

    // Воспроизведение при загрузке страницы
    window.addEventListener('load', () => {
        const bgMusic = document.getElementById('bgMusic');
        bgMusic.volume = 0.5;
        bgMusic.play().catch(error => {
            console.log("Waiting for user interaction to play audio");
        });
    });

    // Обработка кнопки управления музыкой
    musicToggle.addEventListener('click', () => {
        const bgMusic = document.getElementById('bgMusic');
        if (bgMusic.paused) {
            bgMusic.play();
            musicToggle.classList.remove('muted');
        } else {
            bgMusic.pause();
            musicToggle.classList.add('muted');
        }
    });
});
