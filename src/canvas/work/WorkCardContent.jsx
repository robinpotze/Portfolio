import { motion } from 'framer-motion';
import { Suspense, lazy } from 'react';
import styles from './WorkCardContent.module.css';

const PixelCard = lazy(() => import('@components/ui/PixelCard/PixelCard.jsx'));

export default function WorkCardContent({
    item,
    index,
    progress,
    onNavigate
}) {
    const { data, key: pageKey } = item;

    const banner = data.banner;
    const dispAttr = data?.dispMap ? { 'data-disp': data.dispMap } : {};
    const idLabel = `PRJ_${(data.id || index).toString().padStart(3, '0')}`;

    const handleClick = (e) => {
        e.preventDefault();
        if (onNavigate) {
            onNavigate(pageKey);
        }
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
            animate={{ opacity: progress, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            onClick={handleClick}
            {...dispAttr}
        >
            <Suspense fallback={<div className={styles.pixelCardFallback} />}>
                <PixelCard variant="default" className={styles.pixelCardInner}>
                    <div className={styles.workCardContent}>
                        <h3 id='project-name'>{data?.title || pageKey}</h3>
                        <span className="deco-small" id='project-client'>{data?.client || ''}</span>
                        <h3 id='project-year'>{data?.year || ''}</h3>
                    </div>
                </PixelCard>
            </Suspense>
        </motion.article>
    );
}
