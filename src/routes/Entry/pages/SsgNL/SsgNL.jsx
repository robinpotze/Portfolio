import ScrollReveal from '@components/effects/ScrollReveal';
import DashLine from '@components/decoration/DashLine';

const assetPath = '/img/work/ssgnl/';

export const Data = {
    id: 1,
    title: "SSGNL",
    synopsis: "The world is how we shape it.",
    description: "Sopra Steria is a European leader in digital transformation, providing one of the most comprehensive portfolios of end-to-end service offerings in the market: consulting, systems integration, software development, infrastructure management and business process services. I personally was a UX Designer, Full-Stack developer, and contributed to multiple games developed for Sopra Steria's internal innovation program. It explores themes of cyber security and corporate responsibility through strategic gameplay and immersive design.",
    client: "TRIPADVISORS",
    year: 2024,
    software: ["Illustrator","After Effects", "Blender", "Figma"],
    skills: ["Graphic Design", "Game Design", "3D Graphics", "Motion Graphics"],
    banner: `${assetPath}CyberSec_Render.png`
}

export default function SsgNL() {
    return (
        <div>
            <div className='work-full-thin'>
                <img src={`${assetPath}CyberSec_Rulebook.png`} alt='low fidelity render of a spaceship bridge.' />
            </div>
            <div className='work-header'>
                <div className='work-header-chapter'>
                    <h3>CyberScurity</h3>
                    <img src='/img/icon/PLS.svg' alt='plus icon divider' />
                    <p className='deco-small'>PRJ_003 - BOARD GAME</p>
                </div>
                <ScrollReveal>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Quisque faucibus ex sapien vitae pellentesque sem placerat. In id cursus mi pretium tellus duis convallis. Tempus leo eu aenean sed diam urna tempor. Pulvinar vivamus fringilla lacus nec metus bibendum egestas. Iaculis massa nisl malesuada lacinia integer nunc posuere. Ut hendrerit semper vel class aptent taciti sociosqu. Ad litora torquent per conubia nostra inceptos himenaeos
                </ScrollReveal>
            </div>
            <div className='work-double'>
                <img src={`${assetPath}CasetteWire.png`} alt='The wireframe of the CassetteRoom scene' />
                <DashLine direction="Vertical" />
                <img src={`${assetPath}CassetteRoom.png`} alt='A retro-futurist room with a VR setup in the middle.' />
            </div>
        </div>
    );
}