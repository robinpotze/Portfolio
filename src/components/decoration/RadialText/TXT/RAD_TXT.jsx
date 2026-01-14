export default function RAD_TXT({ value }) {
    return (
        <p className='tech-small' id={'rad-text-' + value}>{value.toString().padStart(3, '0')}</p>
    );
}