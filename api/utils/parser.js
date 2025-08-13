import { load } from "cheerio";

export const parseHTML = (htmlContent, country, movie, date) => {
  const $ = load(htmlContent);
  const projections = [];

  $(".movie-projection").each((_, projection) => {
    const theater = $(projection).find(".title-cinema").text().trim();

    $(projection)
      .find(".title-attribute")
      .each((_, section) => {
        const format = $(section).text().trim();
        const timeList = $(section).next("ul");
        if (timeList.length) {
          timeList.find("label").each((_, item) => {
            projections.push({
              country,
              theater,
              date,
              time: $(item).text().trim(),
              movie: paseMovieTitle(movie),
              format,
            });
          });
        }
      });
  });

  return projections;
};

const paseMovieTitle = (slug) => {
  return slug
    .split("-")
    .map((word) => {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");
};
