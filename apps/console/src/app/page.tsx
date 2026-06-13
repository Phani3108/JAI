import { CatalogView } from "./_catalog/CatalogView";

/**
 * Catalog — the hero of the console. The parts catalog reimagined as an
 * interactive exploded-vehicle blueprint of the platform: six systems, ~22
 * parts, the fleet of agents with live status + scorecards. See _catalog/* .
 *
 * Thin server entry; all interactivity lives in the client CatalogView.
 */
export default function CatalogPage() {
  return <CatalogView />;
}
