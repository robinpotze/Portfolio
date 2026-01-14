/**
 * Menu Socials - Social links footer
 */

import React from 'react';
import { motion } from 'framer-motion';

const SOCIALS = [
    { label: 'Artstation', link: 'https://artstation.com/living_ipod' },
    { label: 'GitHub', link: 'https://github.com/robinpotze' },
    { label: 'LinkedIn', link: 'https://linkedin.com/in/robinpotze' }
];

export default function MenuSocials({ open }) {
    return (
        <div className="sm-socials">
            <motion.h3
                initial={{ opacity: 0 }}
                animate={{ opacity: open ? 1 : 0 }}
            >
                Socials
            </motion.h3>
            <ul>
                {SOCIALS.map((social, i) => (
                    <motion.li
                        key={i}
                        initial={{ y: 25, opacity: 0 }}
                        animate={open ? { y: 0, opacity: 1 } : { y: 25, opacity: 0 }}
                        transition={{ duration: 0.3 }}
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
