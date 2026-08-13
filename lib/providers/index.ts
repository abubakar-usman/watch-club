import { MovieProvider } from "../types";
import { StreamingAvailabilityProvider } from "./streaming-availability";

export function getMovieProvider(): MovieProvider {
  return new StreamingAvailabilityProvider();
}

export { StreamingAvailabilityProvider };
