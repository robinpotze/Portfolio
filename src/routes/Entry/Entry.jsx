import DashLine from '@components/decoration/DashLine';
import GradualBlur from '@components/effects/GradualBlur';
import ScrollReveal from '@components/effects/ScrollReveal';
import NavigationMenu from '@components/layout/NavigationMenu/NavigationMenu';
import ProjectHero from '@components/layout/ProjectHero/ProjectHero';
import { ANIMATION_TIMING } from '@config/animation.config';
import useLenisScroll from '@hooks/useLenisScroll';
import { normalizeKey } from '@utils/stringUtils';
import { useParams } from 'react-router-dom';
import './Entry.css';
import { pages } from './pages/autogen';

export default function Entry() {
    useLenisScroll({
        lerp: ANIMATION_TIMING.LENIS_LERP,
        duration: ANIMATION_TIMING.LENIS_DURATION,
        smoothWheel: true,
        wheelMultiplier: 1,
        touchMultiplier: 2,
    });

    const { title } = useParams();
    const normalizedTitle = normalizeKey(title);
    const { Component: PageComponent, data } = pages[normalizedTitle] || {};

    if (!PageComponent || !data) {
        return <div className='work-page' id='work-overview'>
            <NavigationMenu />
            404 - Project Not Found
        </div>;
    }

    return (
        <div className='work-page' id={data.title.replaceAll(/\s+/g, '-') + '-page'}>
            <NavigationMenu />
            <ProjectHero content={data} />
            <section className='work-section'>
                <div className='work-header'>
                    <div className='work-synopsis'>
                        <h2>Synopsis</h2>
                        <DashLine direction="Horizontal" />
                        <div className='work-synopsis-subtitle'>
                            <img src='/img/icon/CRS.svg' alt='Cross symbol divider' />
                            <p className='deco-small'>{data.synopsis}</p>
                        </div>
                    </div>
                    <ScrollReveal>
                        {data.description}
                    </ScrollReveal>
                </div>
                <PageComponent />
            </section>

            <GradualBlur
                target="page"
                position="bottom"
                height="6rem"
                strength={2}
                divCount={5}
                curve="bezier"
                exponential={true}
                opacity={1}
            />
        </div >
    );
}