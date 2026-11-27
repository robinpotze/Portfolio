// Pure presence helpers (no window access), so node tests can import them.
import { CAROUSEL_CONFIG } from './carousel.config.js';

const smooth01 = (t) => {
    const x = Math.min(1, Math.max(0, t));
    return x * x * (3 - 2 * x);
};

/** How present a card is (0–1): 0 past the frame edge, 1 near the centre, and only once the morph has arrived. */
export function calculateCardPresence(centeredness, morph) {
    const { FULL_WITHIN, ENTER_FROM, MORPH_FROM } = CAROUSEL_CONFIG.FRAME;
    const onScreen = 1 - smooth01((centeredness - FULL_WITHIN) / (ENTER_FROM - FULL_WITHIN));
    return onScreen * smooth01((morph - MORPH_FROM) / (1 - MORPH_FROM));
}

/** Branch length for a card's presence: reaches the card first. */
export const branchGrow = (presence) => {
    const { GROW_FROM, GROW_BY } = CAROUSEL_CONFIG.BRANCH;
    return smooth01((presence - GROW_FROM) / (GROW_BY - GROW_FROM));
};

/** Card dissolve for a card's presence: forms once the branch has arrived. */
export const cardDissolve = (presence) => smooth01((presence - CAROUSEL_CONFIG.BRANCH.DISSOLVE_FROM) / (1 - CAROUSEL_CONFIG.BRANCH.DISSOLVE_FROM));
