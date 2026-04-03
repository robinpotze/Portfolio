import ScrollReveal from '@components/effects/ScrollReveal';
import './WorkHeader.css';

export default function WorkHeader({ title, subtitle, description }) {
    return (
        <div className="work-header">
            <div className="work-header-chapter">
                <h3>{title}</h3>
                <img src="/img/icon/PLS.svg" alt="plus icon divider" />
                <p className="deco-small">{subtitle}</p>
            </div>
            <ScrollReveal>{description}</ScrollReveal>
        </div>
    );
}
