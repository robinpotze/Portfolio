// ============================================
// Site identity — shared by Home, the loading screen, About, Contact and the menu.
// ============================================

export const SITE = {
    NAME: 'Robin Potze',
    ROLE_LINE: 'Designer who builds. UX, game design and 3D, from government systems to game jams.',
    EMAIL: 'contact@robinpotze.com',
};

export const SOCIALS = [
    { label: 'Artstation', link: 'https://artstation.com/living_ipod' },
    { label: 'GitHub', link: 'https://github.com/robinpotze' },
    { label: 'LinkedIn', link: 'https://linkedin.com/in/robinpotze' },
];

export const LINKEDIN = SOCIALS.find((social) => social.label === 'LinkedIn');
