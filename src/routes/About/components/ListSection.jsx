import AboutItem from './AboutItem';

export default function ListSection({ items }) {
    return (
        <ul className="about-list">
            {items.map((item) => (
                <AboutItem key={item.text} text={item.text} icon={item.icon} />
            ))}
        </ul>
    );
}
