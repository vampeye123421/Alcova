document.addEventListener('DOMContentLoaded', () => {
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
                background: white;
                display: none;
                flex-direction: column;
                align-items: center;
                padding: 2rem;
                opacity: 0;
                transform: translateY(-20px);
                transition: opacity 0.3s ease, transform 0.3s ease;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                z-index: 999;
            }

            .nav-links a {
                margin: 1rem 0;
                font-size: 1.2rem;
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

    // Smooth scroll for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            
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

    // Navbar background change on scroll
    const navbar = document.querySelector('.navbar');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        // Add/remove background color based on scroll position
        if (currentScroll > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.backgroundColor = 'transparent';
            navbar.style.boxShadow = 'none';
        }

        // Hide/show navbar based on scroll direction
        if (currentScroll > lastScroll && currentScroll > 500) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }

        lastScroll = currentScroll;
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
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        if (!scrollTimeout) {
            scrollTimeout = setTimeout(() => {
                scrollTimeout = null;
                animateOnScroll();
            }, 50);
        }
    });

    // Add animation check on resize
    window.addEventListener('resize', animateOnScroll);
});