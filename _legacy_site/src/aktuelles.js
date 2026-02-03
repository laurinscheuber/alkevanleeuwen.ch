import { client, urlFor } from './sanity';

const newsGrid = document.getElementById('news-grid');

async function fetchNews() {
  if (!newsGrid) return;
  
  try {
    newsGrid.innerHTML = '<p class="text-center">Lade aktuelle Neuigkeiten...</p>';
    
    // Fetch projects sorted by date
    const query = '*[_type == "project"] | order(date desc)';
    const projects = await client.fetch(query);

    if (projects.length === 0) {
      newsGrid.innerHTML = '<p class="text-center">Zurzeit gibt es keine aktuellen Meldungen.</p>';
      return;
    }

    newsGrid.innerHTML = ''; // Clear loading message

    projects.forEach(project => {
      const card = document.createElement('div');
      card.className = 'news-card';

      // Safe image handling
      let imageUrl = '/images/logo.jpg'; // specific fallback
      if (project.mainImage) {
        imageUrl = urlFor(project.mainImage).width(600).url();
      }

      // Format date if present
      let dateString = '';
      if (project.date) {
        dateString = new Date(project.date).toLocaleDateString('de-CH');
      }

      // Badge class based on availability
      let badgeClass = 'badge-default';
      const avail = project.availability || '';
      if (avail.includes('Sofort')) badgeClass = 'badge-success';
      if (avail.includes('Vermietet') || avail.includes('Verkauft')) badgeClass = 'badge-danger';
      if (avail.includes('Anfrage')) badgeClass = 'badge-warning';

      card.innerHTML = `
        <div class="news-image-wrapper">
          <img src="${imageUrl}" alt="${project.title}" loading="lazy">
          ${avail ? `<span class="news-badge ${badgeClass}">${avail}</span>` : ''}
        </div>
        <div class="news-content">
          ${dateString ? `<small class="news-date">${dateString}</small>` : ''}
          <h3>${project.title}</h3>
          ${project.description ? `<p>${project.description}</p>` : ''}
        </div>
      `;
      
      newsGrid.appendChild(card);
    });

  } catch (error) {
    console.error('Error fetching news:', error);
    newsGrid.innerHTML = '<p class="text-center text-error">Fehler beim Laden der Inhalte. Bitte versuchen Sie es später erneut.</p>';
  }
}

document.addEventListener('DOMContentLoaded', fetchNews);
