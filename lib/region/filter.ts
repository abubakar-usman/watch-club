import { RESTRICTED_CERTIFICATIONS, DEFAULT_COUNTRY_CODE } from "./restricted-list";

export interface ReleaseDateItem {
  certification: string;
}

export interface CountryReleaseDates {
  iso_3166_1: string;
  release_dates: ReleaseDateItem[];
}

export interface MovieWithReleaseDates {
  id: number;
  release_dates?: {
    results?: CountryReleaseDates[];
  };
  [key: string]: unknown;
}

/**
 * Reads the viewer's country code from the x-vercel-ip-country request header.
 * Defaults to DEFAULT_COUNTRY_CODE ('US') if header is missing or empty.
 */
export function getViewerCountry(req: Request): string {
  const countryHeader = req.headers.get("x-vercel-ip-country");
  if (!countryHeader || countryHeader.trim() === "") {
    return DEFAULT_COUNTRY_CODE;
  }
  return countryHeader.trim().toUpperCase();
}

/**
 * Checks if a movie's certification for the given country matches the restricted list.
 */
export async function isMovieRestrictedInRegion(
  movieId: number,
  countryCode: string,
  existingReleaseDates?: CountryReleaseDates[]
): Promise<boolean> {
  const country = countryCode.toUpperCase();
  const restrictedList = (
    RESTRICTED_CERTIFICATIONS[country] || RESTRICTED_CERTIFICATIONS["DEFAULT"]
  ).map((c) => c.toUpperCase());

  const releaseDatesResults = existingReleaseDates || [];

  if (releaseDatesResults.length === 0) {
    return false;
  }

  // Find country entry matching viewer country, fallback to US
  const countryEntry =
    releaseDatesResults.find((r) => r.iso_3166_1.toUpperCase() === country) ||
    releaseDatesResults.find((r) => r.iso_3166_1.toUpperCase() === "US");

  if (!countryEntry || !countryEntry.release_dates) {
    return false;
  }

  for (const rd of countryEntry.release_dates) {
    const cert = rd.certification ? rd.certification.trim().toUpperCase() : "";
    if (cert && restrictedList.includes(cert)) {
      return true; // Restricted
    }
  }

  return false;
}

/**
 * Filters an array of movies according to country certification restrictions.
 */
export async function filterMoviesByRegion<T extends MovieWithReleaseDates>(
  movies: T[],
  countryCode: string
): Promise<T[]> {
  if (!movies || movies.length === 0) return [];

  const filterResults = await Promise.all(
    movies.map(async (movie) => {
      const restricted = await isMovieRestrictedInRegion(
        movie.id,
        countryCode,
        movie.release_dates?.results
      );
      return { movie, restricted };
    })
  );

  return filterResults.filter((r) => !r.restricted).map((r) => r.movie);
}
