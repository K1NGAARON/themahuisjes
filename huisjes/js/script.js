$(window).scroll(function() {
    let scrollTop = $(document).scrollTop();
    let viewportHeight = $(window).height();
    let sections = $('.content');
    let numSections = sections.length;

    sections.each(function(index) {
        let sectionOffsetTop = $(this).offset().top;
        let distanceFromTop = scrollTop - sectionOffsetTop + viewportHeight / 2;
        let opacity;

        if (distanceFromTop >= 0 && distanceFromTop <= viewportHeight) {
            opacity = Math.min(1, (index + 1) / numSections * 0.85 + 0.15);
        } else {
            opacity = 0;
        }

        $(this).css('background', `rgba(0, 0, 0, ${opacity})`);
    });
});

(function initGalleryCarousel() {
    const carousel = document.querySelector('[data-gallery]');
    if (!carousel) return;

    const track = carousel.querySelector('.gallery-carousel__track');
    const dotsContainer = carousel.querySelector('.gallery-carousel__dots');
    const prevBtn = carousel.querySelector('.gallery-carousel__btn--prev');
    const nextBtn = carousel.querySelector('.gallery-carousel__btn--next');

    let currentIndex = 0;
    let slideCount = 0;

    fetch('./img/gallery.json')
        .then(function(response) {
            if (!response.ok) throw new Error('Manifest niet gevonden');
            return response.json();
        })
        .then(function(data) {
            const images = orderImages(data.images || []);
            if (!images.length) {
                carousel.hidden = true;
                return;
            }
            buildSlides(images);
            slideCount = images.length;
            buildDots(getMaxIndex() + 1);
            carousel.hidden = false;
            updateCarousel();
            bindControls();
        })
        .catch(function() {
            carousel.hidden = true;
        });

    function orderImages(images) {
        const rest = images.slice();
        const frontIndex = rest.findIndex(function(path) {
            return path.split('/').pop().toLowerCase() === 'front.jpg';
        });

        let front = null;
        if (frontIndex !== -1) {
            front = rest.splice(frontIndex, 1)[0];
        }

        shuffle(rest);
        return front ? [front].concat(rest) : rest;
    }

    function shuffle(items) {
        for (let i = items.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = items[i];
            items[i] = items[j];
            items[j] = temp;
        }
    }

    function buildSlides(images) {
        track.innerHTML = '';
        images.forEach(function(path, index) {
            const slide = document.createElement('div');
            slide.className = 'gallery-carousel__slide';
            slide.setAttribute('role', 'listitem');

            const img = document.createElement('img');
            img.src = './img/' + path;
            img.alt = 'Foto ' + (index + 1);
            img.loading = index === 0 ? 'eager' : 'lazy';

            slide.appendChild(img);
            track.appendChild(slide);
        });
    }

    function buildDots(count) {
        dotsContainer.innerHTML = '';
        if (count <= 1) return;

        for (let i = 0; i < count; i++) {
            const dot = document.createElement('button');
            dot.type = 'button';
            dot.className = 'gallery-carousel__dot';
            dot.setAttribute('role', 'tab');
            dot.setAttribute('aria-label', 'Foto ' + (i + 1));
            dot.addEventListener('click', function() {
                goTo(i);
            });
            dotsContainer.appendChild(dot);
        }
    }

    function bindControls() {
        prevBtn.addEventListener('click', function() {
            goTo(currentIndex - 1);
        });

        nextBtn.addEventListener('click', function() {
            goTo(currentIndex + 1);
        });

        let touchStartX = 0;
        track.parentElement.addEventListener('touchstart', function(event) {
            touchStartX = event.changedTouches[0].screenX;
        }, { passive: true });

        track.parentElement.addEventListener('touchend', function(event) {
            const delta = event.changedTouches[0].screenX - touchStartX;
            if (Math.abs(delta) < 40) return;
            goTo(currentIndex + (delta < 0 ? 1 : -1));
        }, { passive: true });

        document.addEventListener('keydown', function(event) {
            if (!carousel.contains(document.activeElement) && document.activeElement !== document.body) return;
            if (event.key === 'ArrowLeft') goTo(currentIndex - 1);
            if (event.key === 'ArrowRight') goTo(currentIndex + 1);
        });
    }

    function getVisibleCount() {
        const value = getComputedStyle(carousel).getPropertyValue('--gallery-visible');
        const parsed = parseInt(value, 10);
        return parsed > 0 ? parsed : 1;
    }

    function getMaxIndex() {
        return Math.max(0, slideCount - getVisibleCount());
    }

    function goTo(index) {
        if (!slideCount) return;
        const maxIndex = getMaxIndex();
        if (index < 0) {
            currentIndex = maxIndex;
        } else if (index > maxIndex) {
            currentIndex = 0;
        } else {
            currentIndex = index;
        }
        updateCarousel();
    }

    function updateCarousel() {
        const visible = getVisibleCount();
        track.style.transform = 'translateX(-' + (currentIndex * (100 / visible)) + '%)';

        const dots = dotsContainer.querySelectorAll('.gallery-carousel__dot');
        dots.forEach(function(dot, index) {
            const isActive = index === currentIndex;
            dot.classList.toggle('is-active', isActive);
            dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
        });

        const hideNav = slideCount <= visible;
        prevBtn.hidden = hideNav;
        nextBtn.hidden = hideNav;
        dotsContainer.hidden = hideNav;
    }

    window.addEventListener('resize', function() {
        if (currentIndex > getMaxIndex()) {
            currentIndex = getMaxIndex();
        }
        buildDots(getMaxIndex() + 1);
        updateCarousel();
    });
})();
