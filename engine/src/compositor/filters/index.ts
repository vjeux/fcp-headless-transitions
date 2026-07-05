/**
 * Filter registry barrel. Each import has the side-effect of registering a
 * UUID-keyed filter module (see registry.ts). Add new filters here — this is the
 * ONLY shared line an agent touches when adding a filter, and it's append-only
 * (one import line), which merges cleanly across parallel branches.
 *
 * Migrated to the registry so far: (none yet — legacy filters still handled by the
 * fallback chain in compositor/index.ts). New filters should be added as modules
 * here.
 */
export {};
