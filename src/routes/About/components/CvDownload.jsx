import { SITE } from '@config/site.config';
import { useState } from 'react';

const FILE_NAME = `${SITE.NAME.replaceAll(/\s+/g, '-')}-CV.pdf`;

const LABELS = {
    idle: 'DOWNLOAD CV',
    busy: 'BUILDING CV…',
    error: 'CV FAILED, RETRY',
};

// The PDF renderer is large, so it loads on first hover/focus instead of with the page
const loadCv = () => import('../cv/CvDocument');

export default function CvDownload({ className }) {
    const [state, setState] = useState('idle');

    async function handleClick() {
        if (state === 'busy') {
            return;
        }
        setState('busy');
        try {
            const { renderCvBlob } = await loadCv();
            const url = URL.createObjectURL(await renderCvBlob());
            const link = document.createElement('a');
            link.href = url;
            link.download = FILE_NAME;
            link.click();
            setTimeout(() => URL.revokeObjectURL(url), 10_000);
            setState('idle');
        } catch (error) {
            // eslint-disable-next-line no-console
            console.error('[CvDownload]', error);
            setState('error');
        }
    }

    return (
        <button type="button" className={className} onClick={handleClick} onPointerEnter={loadCv} onFocus={loadCv} aria-busy={state === 'busy'}>
            {LABELS[state]}
        </button>
    );
}
