import PlsIcon from '@/assets/icons/PLS.svg?react';
import { EASING, REVEAL, STAGGER } from '@config/animation.config';
import { motion } from 'motion/react';
import styles from './Ticket.module.css';
import { ABOUT_DATA } from '../about.data';

// Icon is an SVGR component, a public image path, or absent
function IconLine({ icon: Svg, className = '', children }) {
    return (
        <p className={`${styles.iconLine} ${className}`}>
            {typeof Svg === 'string' ? <img className={styles.icon} src={Svg} alt="" /> : Svg && <Svg className={styles.icon} aria-hidden="true" />}
            {children}
        </p>
    );
}

// Work and education entry: date column + title, subtitle and optional detail lines
function DatedRecord({ date, title, subtitle, icon, lines = [] }) {
    return (
        <div className={styles.datedRecord}>
            <p className={styles.dates}>{date}</p>
            <div className={styles.recordDetails}>
                <p className={styles.recordTitle}>{title}</p>
                <IconLine icon={icon}>{subtitle}</IconLine>
                {lines.map(({ text, icon: lineIcon }) => (
                    <IconLine key={text} icon={lineIcon} className={styles.paragraph}>
                        {text}
                    </IconLine>
                ))}
            </div>
        </div>
    );
}

// Skill / software grid; description is optional
function ListRecords({ data, className }) {
    return (
        <ul className={className}>
            {data.map(({ text, icon, description }) => (
                <li key={text}>
                    <IconLine icon={icon}>{text}</IconLine>
                    {description && <p className={styles.paragraph}>{description}</p>}
                </li>
            ))}
        </ul>
    );
}

const RECORDS = {
    EXP: (data) =>
        data.map((job) => <DatedRecord key={job.name + job.date} date={job.date} title={job.function} subtitle={job.name} lines={job.details} />),
    SKL: (data) => <ListRecords data={data} className={styles.skillGrid} />,
    SFT: (data) => <ListRecords data={data} className={styles.softwareGrid} />,
    EDU: (data) =>
        data.map((entry) => (
            <DatedRecord key={entry.school + entry.date} date={entry.date} title={entry.course} subtitle={entry.school} icon={entry.icon} />
        )),
};

// Same timing as the grid column change, so header pieces glide in step with the ticket width
const glide = { duration: REVEAL.DURATION, ease: EASING.EMPHASIZED };

const contentFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1, transition: { duration: REVEAL.QUICK_DURATION, delay: REVEAL.QUICK_DURATION } },
};

export default function Ticket({ section, index, state, onToggle }) {
    const { key, number, title, metadata } = section;
    const isOpen = state === 'expanded';
    const recordId = `about-record-${key}`;

    // One shared plus: sits in the footer when closed, glides to the header corner and turns into × when open
    const plus = (
        <motion.span layoutId={`${key}-plus`} className={styles.plus} animate={{ rotate: isOpen ? 45 : 0 }} transition={glide}>
            <PlsIcon aria-hidden="true" />
        </motion.span>
    );

    return (
        <motion.article
            className={`${styles.ticket} ${styles[state] ?? ''}`}
            initial={{ opacity: 0, y: REVEAL.Y_OFFSET }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ ...glide, delay: REVEAL.DELAY + index * STAGGER.DEFAULT }}
        >
            {/* Header stays mounted in both states; CSS switches column ↔ row and motion layout animates the move */}
            <div className={styles.head}>
                <div className={styles.stub}>
                    <motion.div layout="position" transition={glide} className={styles.stubText}>
                        <p className={styles.stubNumber}>{number}</p>
                        <p className="functional-tiny">RECORD</p>
                    </motion.div>
                </div>
                <motion.div layout="position" transition={glide} className={styles.label}>
                    <h2 className={styles.ticketTitle}>{title}</h2>
                    <p>{metadata}</p>
                </motion.div>
                {isOpen && <span className={styles.closeSlot}>{plus}</span>}
            </div>

            {isOpen ? (
                <motion.section className={styles.record} id={recordId} aria-label={title} {...contentFade}>
                    <hr className={styles.perfSeparator} />
                    {RECORDS[key](ABOUT_DATA[key])}
                </motion.section>
            ) : (
                <div className={styles.footer}>
                    <motion.p className="functional-tiny" {...contentFade}>
                        OPEN
                    </motion.p>
                    {plus}
                </div>
            )}

            <button
                type="button"
                className={styles.hit}
                aria-label={`${isOpen ? 'Close' : 'Open'} ${title}`}
                aria-expanded={isOpen}
                aria-controls={isOpen ? recordId : undefined}
                onClick={onToggle}
            />
        </motion.article>
    );
}
