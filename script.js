import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabase-config.js';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Mobile Navigation Toggle
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Form submission handling
const contactForm = document.getElementById('contactForm');
if (contactForm) {
    contactForm.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(this);
        const data = Object.fromEntries(formData);
        
        // Simple form validation
        if (!data.nombre || !data.email || !data.mensaje) {
            alert('Por favor complete todos los campos obligatorios.');
            return;
        }
        
        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(data.email)) {
            alert('Por favor ingrese un email válido.');
            return;
        }
        
        // Send data to Supabase
        const { error } = await supabase
            .from('citas')
            .insert([
                {
                    nombre: data.nombre,
                    email: data.email,
                    telefono: data.telefono || '',
                    mensaje: data.mensaje,
                    fecha_creacion: new Date().toISOString()
                }
            ]);
        
        if (error) {
            alert('Error al enviar el mensaje. Por favor intenta de nuevo.');
            console.error(error);
            return;
        }
        
        alert('¡Gracias por tu mensaje! Nos pondremos en contacto contigo pronto.');
        this.reset();
    });
}

// Scroll reveal animation
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Apply animation to elements
document.querySelectorAll('.servicio-card, .galeria-item, .categoria').forEach(el => {
    observer.observe(el);
});

// Dynamic year in footer
const currentYear = new Date().getFullYear();
document.querySelector('.footer p:last-child').innerHTML = 
    `&copy; ${currentYear} Salon Meraki. Todos los derechos reservados.`;

// Lazy loading for images
const lazyImages = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            img.src = img.dataset.src;
            img.classList.remove('lazy');
            imageObserver.unobserve(img);
        }
    });
});

lazyImages.forEach(img => imageObserver.observe(img));

// Back to top button
const backToTopButton = document.createElement('button');
backToTopButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
backToTopButton.className = 'back-to-top';
document.body.appendChild(backToTopButton);

window.addEventListener('scroll', () => {
    if (window.pageYOffset > 300) {
        backToTopButton.classList.add('show');
    } else {
        backToTopButton.classList.remove('show');
    }
});

backToTopButton.addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

// CSS for back to top button
const style = document.createElement('style');
style.textContent = `
    .back-to-top {
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: var(--accent-color);
        color: var(--text-color);
        border: none;
        border-radius: 50%;
        width: 50px;
        height: 50px;
        cursor: pointer;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
        z-index: 1000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.2rem;
    }

    .back-to-top.show {
        opacity: 1;
        visibility: visible;
    }

    .back-to-top:hover {
        transform: translateY(-3px);
    }

    .fade-in {
        opacity: 0;
        transform: translateY(20px);
        transition: opacity 0.6s ease, transform 0.6s ease;
    }

    .fade-in {
        opacity: 1;
        transform: translateY(0);
    }
`;
document.head.appendChild(style);

// Parallax effect for hero section
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.transform = `translateY(${scrolled * 0.5}px)`;
    }
});

// Counter animation for statistics
const counters = document.querySelectorAll('.counter');
const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const target = entry.target;
            const countTo = parseInt(target.getAttribute('data-count'));
            let count = 0;
            const increment = countTo / 100;
            
            const updateCount = () => {
                if (count < countTo) {
                    count += increment;
                    target.textContent = Math.ceil(count);
                    setTimeout(updateCount, 20);
                } else {
                    target.textContent = countTo;
                }
            };
            
            updateCount();
            counterObserver.unobserve(target);
        }
    });
});

// Initialize counters if they exist
document.querySelectorAll('.counter').forEach(counter => {
    counterObserver.observe(counter);
});

// Preloader
window.addEventListener('load', () => {
    document.body.classList.add('loaded');
});

// Add preloader CSS
const preloaderStyle = document.createElement('style');
preloaderStyle.textContent = `
    body {
        opacity: 0;
        transition: opacity 0.3s ease;
    }
    
    body.loaded {
        opacity: 1;
    }
`;
document.head.appendChild(preloaderStyle);
