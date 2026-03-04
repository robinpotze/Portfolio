import ErrorBoundary from '@components/ErrorBoundary';
import { ANIMATION_TIMING } from '@config/animation.config';
import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import styles from './WorkCardContent.module.css';

const PixelCard = lazy(() => import('@components/effects/PixelCard/PixelCard.jsx'));

export default function WorkCardContent({ item, index, onNavigate }) {
    const { data, key: pageKey } = item;

    const banner = data.banner;
    const dispAttr = data?.dispMap ? { 'data-disp': data.dispMap } : {};

    const handleClick = (e) => {
        e.preventDefault();
        if (onNavigate) onNavigate(pageKey);
    };

    return (
        <motion.article
            className={styles.workCard}
            style={{
                '--i': index,
                ...(banner ? { backgroundImage: `url(${banner})` } : {})
            }}
            whileHover={{ scale: 1.02 }}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: ANIMATION_TIMING.CARD_ENTER_DELAY + index * ANIMATION_TIMING.CARD_STAGGER }}
            onClick={handleClick}
            {...dispAttr}
        >
            <ErrorBoundary>
                <Suspense fallback={<div className={styles.pixelCardFallback} />}>
                    <PixelCard variant="default" className={styles.pixelCardInner}>
                        <div className={styles.workCardContent}>
                            <span className="deco-small" id='project-year'>{data?.year || ''}</span>
                            <h2 id='project-name'>{data?.title || pageKey}</h2>
                            <span className="deco-small" id='project-client'>{data?.client || ''}</span>
                        </div>
                    </PixelCard>
                </Suspense>
            </ErrorBoundary>
        </motion.article>
    );
}
