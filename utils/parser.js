import { JSDOM } from "jsdom";

export const parseHTML = (htmlContent, country, movie, date) => {
    const document = new JSDOM(htmlContent).window.document;
    const projections = [];
  
    document.querySelectorAll('.movie-projection').forEach(projection => {
        const theater = projection.querySelector('.title-cinema').textContent.trim();
        
        // Procesar cada formato (DOB 2D, 2D SUBTITLE, etc.)
        projection.querySelectorAll('.title-attribute').forEach(section => {
            const format = section.textContent.trim();
            const timeList = section.nextElementSibling;
            
            if (timeList && timeList.tagName === 'UL') {
              // Procesar cada función del formato
                timeList.querySelectorAll('label').forEach(item => {
                    projections.push({
                        country,
                        theater: theater,
                        date,
                        time: item.textContent.trim(),
                        movie: paseMovieTitle(movie),
                        format: format
                    });
                });
            }
        });
    });
  
    return projections;
}


const paseMovieTitle = (slug) => {
  return slug
  .split('-').map(word => { return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();}).join(' ');
}