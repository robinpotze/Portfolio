import CrsIcon from '@/assets/icons/CRS.svg?react';
import DashLine from '@components/decoration/DashLine';
import GradualBlur from '@components/effects/GradualBlur';
import ScrollReveal from '@components/effects/ScrollReveal';
import ProjectHero from '@components/layout/ProjectHero/ProjectHero';
import { LENIS } from '@config/animation.config';
import useLenisScroll from '@hooks/useLenisScroll';
import { normalizeKey } from '@utils/stringUtils';
import { useParams } from 'react-router-dom';
import styles from './Entry.module.css';
import { pages } from './pages/autogen';

export default function Entry() {
    useLenisScroll({
        lerp: LENIS.LERP,
        duration: LENIS.DURATION,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    const { title } = useParams();
    const normalizedTitle = normalizeKey(title);
    const { Component: PageComponent, data } = pages[normalizedTitle] || {};

    if (!PageComponent || !data) {
        return (
            <div className={styles.page} id="work-overview">
                404 - Project Not Found
            </div>
        );
    }

    return (
        <div className={styles.page} id={data.title.replaceAll(/\s+/g, '-') + '-page'}>
            <ProjectHero content={data} />
            <section className={styles.section}>
                <div className={styles.header}>
                    <div className={styles.synopsis}>
                        <h2>Synopsis</h2>
                        <DashLine direction="Horizontal" />
                        <div className={styles.synopsisSubtitle}>
                            <CrsIcon aria-hidden="true" />
                            <p className="deco-small">{data.synopsis}</p>
                        </div>
                    </div>
                    <ScrollReveal>{data.description}</ScrollReveal>
                </div>
                <PageComponent />
            </section>

            <GradualBlur target="page" position="bottom" height="6rem" strength={2} divCount={5} curve="bezier" exponential={true} opacity={1} />
        </div>
    );
}
