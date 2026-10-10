import { REVEAL } from '@config/animation.config';
import { SOCIALS } from '@config/site.config';
import { motion } from 'motion/react';
import styles from './NavigationMenu.module.css';

export default function MenuSocials({ open }) {
    return (
        <div className={styles.socials}>
            <motion.h3 initial={{ opacity: 0 }} animate={{ opacity: open ? 1 : 0 }}>
                Socials
            </motion.h3>
            <ul>
                {SOCIALS.map((social) => (
                    <motion.li
                        key={social.link}
                        initial={{ y: REVEAL.Y_OFFSET, opacity: 0 }}
                        animate={open ? { y: 0, opacity: 1 } : { y: REVEAL.Y_OFFSET, opacity: 0 }}
                        transition={{ duration: REVEAL.QUICK_DURATION }}
                    >
                        <a href={social.link} target="_blank" rel="noopener noreferrer">
                            {social.label}
                        </a>
                    </motion.li>
                ))}
            </ul>
        </div>
    );
}
