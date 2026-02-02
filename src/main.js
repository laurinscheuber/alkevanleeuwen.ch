import './style.css'
import { client, urlFor } from './sanity.js';

document.addEventListener('DOMContentLoaded', async () => {
    const projectList = document.querySelector('#aktuelles-list');

    if (projectList) {
        try {
            const projects = await client.fetch(`*[_type == "project"]{
                title,
                description,
                availability,
                date,
                mainImage
            } | order(date asc)`);

            if (projects.length === 0) {
                projectList.innerHTML = '<p>Momentan keine aktuellen Projekte.</p>';
            } else {
                projectList.innerHTML = projects.map(project => {
                    const dateStr = project.date ? new Date(project.date).toLocaleDateString('de-CH', { 
                        day: '2-digit', month: '2-digit', year: 'numeric',
                        hour: '2-digit', minute: '2-digit'
                    }) : '';
                    
                    return `
                    <div class="project-card">
                        ${project.mainImage ? `<img src="${urlFor(project.mainImage).width(400).url()}" alt="${project.title}" class="project-image">` : ''}
                        <div class="project-content">
                            <h3 class="project-title">${project.title}</h3>
                            <p class="project-meta">
                                ${project.availability ? `<strong>Verfügbarkeit:</strong> ${project.availability}<br>` : ''}
                                ${dateStr ? `<strong>Termin:</strong> ${dateStr} Uhr` : ''}
                            </p>
                            <p>${project.description || ''}</p>
                        </div>
                    </div>
                `}).join('');
            }
        } catch (error) {
            console.error('Error fetching projects:', error);
            projectList.innerHTML = `<div class="error-message">Fehler beim Laden der Projekte. Bitte prüfen Sie die Verbindung.<br><small>${error.message}</small></div>`;
        }
    }

    // Global: Check if "Aktuelles" should be visible in menu
    const aktuellesLinks = document.querySelectorAll('a[href="/aktuelles.html"]');
    if (aktuellesLinks.length > 0) {
        try {
            const count = await client.fetch('count(*[_type == "project"])');
            if (count === 0) {
                aktuellesLinks.forEach(link => {
                    if (link.parentElement) {
                        link.parentElement.style.display = 'none';
                    }
                });
            }
        } catch (error) {
            console.warn('Could not update menu visibility:', error);
        }
    }

  const menuBtn = document.querySelector('.mobile-menu-btn');
  const navLinks = document.querySelector('.nav-links');

  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('active');
      menuBtn.setAttribute('aria-expanded', navLinks.classList.contains('active'));
    });
  }

  // Gallery Lightbox
  const galleryContainer = document.querySelector('#gallery-container');
  if (galleryContainer) {
    const lightbox = document.querySelector('#lightbox');
    const lightboxImg = document.querySelector('#lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    const prevBtn = document.querySelector('.lightbox-prev');
    const nextBtn = document.querySelector('.lightbox-next');
    const images = Array.from(document.querySelectorAll('.gallery-item img'));
    
    let currentIndex = 0;

    const showImage = (index) => {
      if (index >= 0 && index < images.length) {
        lightboxImg.src = images[index].src;
        currentIndex = index;
        lightbox.classList.add('active');
      }
    };

    images.forEach((img, index) => {
      img.parentElement.addEventListener('click', () => {
        showImage(index);
      });
    });

    closeBtn.addEventListener('click', () => {
      lightbox.classList.remove('active');
    });

    lightbox.addEventListener('click', (e) => {
      if (e.target === lightbox) {
        lightbox.classList.remove('active');
      }
    });

    prevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex > 0) ? currentIndex - 1 : images.length - 1;
      showImage(currentIndex);
    });

    nextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      currentIndex = (currentIndex < images.length - 1) ? currentIndex + 1 : 0;
      showImage(currentIndex);
    });
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') lightbox.classList.remove('active');
        if (e.key === 'ArrowLeft') prevBtn.click();
        if (e.key === 'ArrowRight') nextBtn.click();
    });
  }
});
