const SITE_NAME = 'Robin Potze';

/** Sets the document title for the current route; React 19 hoists <title> into <head>. */
export default function PageTitle({ name }) {
    return <title>{name ? `${name} — ${SITE_NAME}` : SITE_NAME}</title>;
}
