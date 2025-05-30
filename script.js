document.addEventListener('DOMContentLoaded', () => {
    // Aggiungi animazioni al caricamento della pagina
    if (typeof AOS !== 'undefined') {
        AOS.init({
            duration: 800,
            easing: 'ease',
            once: true
        });
        
        // Gestione del banner dei cookie
        const cookieBanner = document.getElementById('cookie-banner');
        const acceptCookiesBtn = document.getElementById('accept-cookies');
        
        // Controlla se l'utente ha già accettato i cookie
        if (!localStorage.getItem('cookiesAccepted')) {
            // Mostra il banner dopo 1 secondo
            setTimeout(() => {
                cookieBanner.classList.add('show');
            }, 1000);
        }
        
        // Gestione del click sul pulsante di accettazione
        if (acceptCookiesBtn) {
            acceptCookiesBtn.addEventListener('click', () => {
                localStorage.setItem('cookiesAccepted', 'true');
                cookieBanner.classList.remove('show');
            });
        }
        
        // La gestione della traduzione è ora affidata a Google Translate
    }
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const body = document.body;
    let isMenuOpen = false;

    // Add mobile menu styles
    const style = document.createElement('style');
    style.textContent = `
        @media (max-width: 768px) {
            .nav-links {
                position: fixed;
                top: 70px;
                left: 0;
                right: 0;
                background: rgba(255, 255, 255, 0.98);
                display: none;
                flex-direction: column;
                align-items: center;
                padding: 2rem;
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 999;
                border-radius: 0 0 var(--border-radius) var(--border-radius);
            }

            .nav-links a {
                margin: 1rem 0;
                font-size: 1.2rem;
                width: 100%;
                text-align: center;
                padding: 0.5rem 0;
                border-bottom: 1px solid rgba(0, 0, 0, 0.05);
            }

            .nav-links a:last-child {
                border-bottom: none;
            }

            .hamburger.active span:nth-child(1) {
                transform: rotate(45deg) translate(5px, 5px);
            }

            .hamburger.active span:nth-child(2) {
                opacity: 0;
            }

            .hamburger.active span:nth-child(3) {
                transform: rotate(-45deg) translate(7px, -6px);
            }

            body.menu-open {
                overflow: hidden;
            }
        }
    `;
    document.head.appendChild(style);

    hamburger.addEventListener('click', () => {
        isMenuOpen = !isMenuOpen;
        
        // Animate hamburger
        hamburger.classList.toggle('active');
        body.classList.toggle('menu-open');
        
        if (isMenuOpen) {
            navLinks.style.display = 'flex';
            setTimeout(() => {
                navLinks.style.opacity = '1';
                navLinks.style.transform = 'translateY(0)';
            }, 10);
        } else {
            navLinks.style.opacity = '0';
            navLinks.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                navLinks.style.display = 'none';
            }, 300);
        }
    });
    
    // Close mobile menu when clicking on navigation links
    document.querySelectorAll('.nav-links a').forEach(link => {
        link.addEventListener('click', () => {
            if (isMenuOpen) {
                hamburger.click();
            }
        });
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (isMenuOpen && !navLinks.contains(e.target) && !hamburger.contains(e.target)) {
            hamburger.click();
        }
    });

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Verifica che l'href non sia solo '#'
            if (href === '#') return;
            
            const target = document.querySelector(href);
            
            if (target) {
                // Close mobile menu if open
                if (isMenuOpen) {
                    hamburger.click();
                }

                // Smooth scroll to target
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Navbar background change on scroll - ottimizzato per panning asincrono
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;
    let scrollTimeout;

    // Utilizziamo requestAnimationFrame per ottimizzare le prestazioni
    function updateNavbar() {
        const currentScroll = window.pageYOffset;

        // Add/remove background color based on scroll position
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        // Hide/show navbar based on scroll direction
        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.classList.add('nav-hidden');
        } else {
            navbar.classList.remove('nav-hidden');
        }

        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', () => {
        // Utilizziamo requestAnimationFrame per sincronizzare con il refresh del browser
        if (!scrollTimeout) {
            scrollTimeout = requestAnimationFrame(() => {
                updateNavbar();
                scrollTimeout = null;
            });
        }
    });

    // Form submission handling - WhatsApp integration
    const bookingForm = document.querySelector('.booking-form');
    if (bookingForm) {
        bookingForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(bookingForm);
            const name = formData.get('name');
            const date = formData.get('date');
            const time = formData.get('time');
            const people = formData.get('people');
            const notes = formData.get('notes');

            // Validate required fields
            if (!name || !date || !time || !people) {
                alert('Per favore, compila tutti i campi obbligatori.');
                return;
            }

            // Format date in Italian style
            const formattedDate = new Date(date).toLocaleDateString('it-IT', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            // Create WhatsApp message
            const message = `Salve, vorrei prenotare un tavolo\n\nNome: ${name}\nData: ${formattedDate}\nOra: ${time}\nPersone: ${people}${notes ? '\nNote: ' + notes : ''}`;
            const whatsappUrl = `https://wa.me/393891248906?text=${encodeURIComponent(message)}`;
            
            // Open WhatsApp
            window.open(whatsappUrl, '_blank');
            
            // Reset form
            bookingForm.reset();
        });
    }

    // Add smooth animations on scroll
    const animateOnScroll = () => {
        const elements = document.querySelectorAll('.section, .menu-card, .gallery-item, .about-content > div, .section-title, .booking-form, .contact-info');
        
        elements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            const elementBottom = element.getBoundingClientRect().bottom;
            
            if (elementTop < window.innerHeight - 100 && elementBottom > 0) {
                element.classList.add('visible');
            }
        });
    };

    // Initial animation check
    animateOnScroll();

    // Add animation check on scroll with throttling
    let animationScrollTimeout;
    window.addEventListener('scroll', () => {
        if (!animationScrollTimeout) {
            animationScrollTimeout = setTimeout(() => {
                animationScrollTimeout = null;
                animateOnScroll();
            }, 50);
        }
    });

    // Add animation check on resize
    window.addEventListener('resize', animateOnScroll);
    
    // Brunch card functionality
    const brunchCard = document.getElementById('brunch-card');
    
    // No modal needed as the link is now directly in the card

});