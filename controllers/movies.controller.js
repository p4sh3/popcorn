import { AppError } from "../utils/errors/AppError.js";
import { parseHTML } from "../utils/parser.js";

const TLDs = {
  sv: ".com.sv",
  hn: ".com.hn",
  cr: ".co.cr",
};

const COUNTRIES = {
  sv: "El Salvador",
  hn: "Honduras",
  cr: "Costa Rica",
};

export class MovieController {
  static async getAll(req, res) {
    const { country } = req.query;

    if (!country || !TLDs[country])
      throw new AppError("Invalid or missing country parameter", 400);

    const { security } = await this.#getParams({ country });
    const url =
      `https://cinepolis${TLDs[country]}/wp-admin/admin-ajax.php?action=get_sites_data` +
      `&security=${security}` +
      `&single_cinema=0&single_movie=0&isPopup=false`;

    const { movies } = await this.#fetchData({ url });
    if (!movies?.length)
      throw new AppError(`No movies found for ${COUNTRIES[country]}`, 404);

    res.json(movies);
  }

  static async getMovieSchedules(req, res) {
    const { country } = req.query;
    const { name } = req.params;

    if (!country || !TLDs[country])
      throw new AppError("Missing or invalid parameters", 400);

    const { dates, ajax_url, events_security, current_edi } =
      await this.#getParams({ name, country });

    const fetchPromises = dates.map(async (date) => {
      const url =
        `${ajax_url}?action=cw_get_events_options` +
        `&events_security=${events_security}` +
        `&events_date=${date}` +
        `&current_edi=${current_edi}`;

      const html = await this.#fetchData({ url, type: "text" });
      return parseHTML(html, COUNTRIES[country], name, date);
    });

    const nestedProjections = await Promise.all(fetchPromises);

    res.json(nestedProjections.flat());
  }

  static async #fetchData({ url, type = "json" }) {
    const res = await fetch(url);
    if (!res.ok) {
      throw new AppError(`Failed to fetch resource: ${url}`, res.status);
    }
    return type === "json" ? res.json() : res.text();
  }

  static #parse({ key, html }) {
    const re = new RegExp(`${key}\\s*=\\s*(\\{.*?\\});`, "s");
    const match = html.match(re);

    if (!match) throw new AppError(`Failed to parse key: ${key}`, 500);

    try {
      return JSON.parse(match[1]);
    } catch (error) {
      throw new AppError(`Invalid JSON for key: ${key}`, 500);
    }
  }

  static async #getParams({ name = "", country }) {
    if (!TLDs[country]) throw new AppError("Invalid country", 400);

    const url = `https://cinepolis${TLDs[country]}/${name}`;

    const html = await this.#fetchData({ url, type: "text" });

    const datesMatch = html.match(/data-dates=(['"])([^'"]*)\1/);
    let dates;

    if (datesMatch) {
      dates = datesMatch[2].split("|");
    }

    const reactPlugin = this.#parse({ key: "rpReactPlugin", html });
    const ajaxObj = this.#parse({ key: "ajaxObj", html });
    if (!reactPlugin || !ajaxObj)
      throw new AppError("Failed to retrieve required parameters", 500);

    return {
      dates,
      current_edi: reactPlugin.single_movie,
      security: reactPlugin.ajax_nonce,
      ajax_url: ajaxObj.ajax_url,
      events_security: ajaxObj.events_security,
    };
  }
}
