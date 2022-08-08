import algoliasearch from "algoliasearch";
import { ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY } from "../constants";

export const algoliaIndex = (indexName: string) => {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_SEARCH_API_KEY);
  return client.initIndex(indexName);
};
