import DashLine from '@components/decoration/DashLine';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

const assetPath = '/img/work/ld58/';

export const Data = {
    id: 2,
    title: 'LD58',
    synopsis:
        "They said I'd never amount to anything, but thanks to the power of day drinking, I've achieved god-tier cap collection and total emotional detachment.",
    description:
        'Crash on the couch, crack cold ones, and turn cap-popping into peak performance. Collect, sort, and frame every shiny trophy in this chill, juicy parody about achieving God-Tier Cap Collection & Total Emotional Detachment one satisfying pop at a time.',
    client: 'LUDUM DRUNKS',
    year: 2025,
    software: ['Figma', 'Unity', 'Blender'],
    skills: ['Figma', 'Unity', 'Blender'],
    banner: `${assetPath}Wallpaper.png`,
};

export default function Ld58() {
    return (
        <div>
            <div className="work-full">
                <img
                    src={`${assetPath}Styleframe.png`}
                    className="img-full-width"
                    alt="An 80s inspired interior of a bachelor with one goal in mind: collecting."
                />
            </div>
            <div className="work-full-thin">
                <img src={`${assetPath}Styleframe2.png`} alt="Another 80s inspired interior of a bachelor with one goal in mind: collecting." />
            </div>
            <WorkHeader
                title="TELEVISION"
                subtitle="SALVATION:::CONSUMPTION"
                description="The TV was the centerpiece of the bachelor pad, a glowing rectangle that promised escape and entertainment. It was a relic from a bygone era, yet it still held a certain charm. The flickering images on the screen provided a backdrop to the endless cycle of day drinking and cap collecting, a reminder of the outside world that was both tantalizing and distant. Filled with content to distract the modern man from the crushing weight of his own existence, the television was both a blessing and a curse."
            />
            <div className="work-double">
                <img src={`${assetPath}LOGO.png`} alt="The wireframe of the CassetteRoom scene" />
                <DashLine direction="Vertical" />
                <img src={`${assetPath}Thumbnail.png`} alt="Thumbnail for the LD58 game jam entry" />
            </div>
        </div>
    );
}
