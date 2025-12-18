import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { ScrollDown } from '@components';
import "./ProjectHero.css";

export default function ProjectHero({ content }) {

    const bannerVars = {
        hidden: { opacity: 0, scale: 1.02 },
        visible: { opacity: 1, scale: 1, transition: { duration: 0.7, ease: [0.2, 0.9, 0.2, 1] } }
    };

    const sideVars = {
        hidden: { opacity: 0, x: 12 },
        visible: (i = 0) => ({ opacity: 1, x: 0, transition: { duration: 0.6, delay: 0.08 + i * 0.06, ease: [0.2, 0.9, 0.2, 1] } })
    };

    const titleVars = {
        hidden: { opacity: 0, y: 8 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.6, delay: 0.18, ease: [0.2, 0.9, 0.2, 1] } }
    };

    return (
        <div className='hero-section' id='work-hero-section'>
            <motion.img
                className='hero-banner'
                id={content.title.replace(/\s+/g, '-') + '-hero-banner'}
                src={content.banner}
                alt={content.title.replace(/\s+/g, '-') + 'hero banner'}
                variants={bannerVars}
                initial='hidden'
                animate={'visible'}
            />

            <motion.div className='hero-content' id='work-hero-content' variants={sideVars} custom={1} initial='hidden' animate={'visible'}>
                <motion.div className='hero-title-wrapper' id='work-hero-title-wrapper' variants={titleVars} initial='hidden' animate={'visible'}>
                    <img className='hero-title-decal' id='work-hero-decal' src='/img/icon/PLS.svg' alt='Plus Sign' />
                    <h2 id='work-hero-title'>{content.title.replace(/\s+/g, '_')}</h2>
                    <img className='hero-title-decal' id='work-hero-decal' src='/img/icon/PLS.svg' alt='Plus Sign' />
                </motion.div>
            </motion.div>

            <motion.div className='hero-side' id='work-hero-side' variants={sideVars} custom={0} initial='hidden' animate={'visible'}>
                <div className="icon-array-vertical" id='work-hero-icons'>
                    {content.software.map((software) => (
                        <img className='hero-side-decal' key={software} src={`/img/software/${software}.svg`} alt={`${software}-logo`} />
                    ))}
                </div>
                <div className='text-array' id='work-hero-side-skills'>
                    {content.skills.map((skill) => (
                        <p className='tr90' key={skill} id={`hero-side-skill-${skill.toLowerCase().replace(/\s+/g, '-')}`}>{skill.toLowerCase().replace(/\s+/g, '_') + "_/"}</p>
                    ))}
                </div>
                <img className='hero-side-decal' src='/img/icon/CRS.svg' alt='A Cross Divider' />
                <div className='hero-side-text' id='work-project-code'>
                    <p className='functional tr90' id='work-hero-project-id'>{"PRJ_" + content.id.toString().padStart(3, "0") + ":::"}</p>
                    <p className='functional tr90' id='work-hero-project-client'>{content.client}</p>
                </div>
                <p className='functional tr90' id='work-hero-side-deco-text'>{content.year}</p>
                <ScrollDown />
            </motion.div>
        </div>
    );
}

ProjectHero.propTypes = {
    content: PropTypes.object.isRequired,
}