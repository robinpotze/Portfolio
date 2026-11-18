import ErrorBoundary from '@components/ErrorBoundary';
import MorseBar from '@components/ui/MorseBar';
import { EASING, REVEAL } from '@config/animation.config';
import { usePageTransition } from '@hooks/usePageTransition';
import { motion } from 'motion/react';
import { useState } from 'react';
import styles from './About.module.css';
import { ABOUT_INTRO, ABOUT_SECTIONS } from './about.data';
import Ticket from './components/Ticket';

// Figma ticket widths in px; used as fr weights so the grid matches the design at 1328px and scales below
const TICKET_WIDTH = { default: 306, expanded: 684, compact: 180 };

function ticketState(key, open) {
    if (open === null) return 'default';
    return key === open ? 'expanded' : 'compact';
}

const columns = (open) => ABOUT_SECTIONS.map(({ key }) => `${TICKET_WIDTH[ticketState(key, open)]}fr`).join(' ');

export default function About() {
    const [open, setOpen] = useState(null);
    const { navigateWithTransition } = usePageTransition();

    return (
        <ErrorBoundary>
            <main className={styles.page}>
                <header className={styles.identity}>
                    <div className={styles.masthead}>
                        <div className={styles.mark}>
                            <span className={styles.emblem} />
                            <p className={styles.brand}>PERSONAL REGISTER / ABOUT ME</p>
                        </div>
                        <p>I — 04 SECT</p>
                    </div>
                    <div className={styles.intro}>
                        <div className={styles.titleBlock}>
                            <h1 className={styles.title}>About me.</h1>
                            <p className={styles.name}>{ABOUT_INTRO.name}</p>
                        </div>
                        <div className={styles.bio}>
                            <p className={styles.brand}>{ABOUT_INTRO.role}</p>
                            <p>{ABOUT_INTRO.bio}</p>
                        </div>
                    </div>
                    <div className={styles.key}>
                        <p>RÉSUMÉ / SECTION REGISTER</p>
                        <p className={styles.brand}>+ SELECT A TICKET TO EXPLORE</p>
                    </div>
                </header>

                <section className={styles.register} aria-label="Résumé sections">
                    <div className={styles.edgeCol}>
                        <p className={`${styles.sideEntry} tr90`}>RECORD</p>
                        <span className={styles.lines} />
                    </div>
                    <motion.div
                        className={styles.tickets}
                        initial={false}
                        animate={{ gridTemplateColumns: columns(open) }}
                        transition={{ duration: REVEAL.DURATION, ease: EASING.EMPHASIZED }}
                    >
                        {ABOUT_SECTIONS.map((section, index) => (
                            <Ticket
                                key={section.key}
                                section={section}
                                index={index}
                                state={ticketState(section.key, open)}
                                onToggle={() => setOpen(open === section.key ? null : section.key)}
                            />
                        ))}
                    </motion.div>
                    <div className={styles.edgeCol}>
                        <span className={styles.lines} />
                    </div>
                </section>

                <footer className={styles.pageFooter}>
                    <div className={styles.signature}>
                        <MorseBar />
                        <p className="functional-tiny">
                            ABOUT / PERSONAL ARCH
                            <br />
                            EOR — 04 SECT
                        </p>
                    </div>
                    <button type="button" className={styles.contactLink} onClick={() => navigateWithTransition('/contact', 'Contact')}>
                        [Get in touch] ↗
                    </button>
                </footer>
            </main>
        </ErrorBoundary>
    );
}
