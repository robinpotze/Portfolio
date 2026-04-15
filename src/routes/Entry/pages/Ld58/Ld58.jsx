import DoubleImage from '@components/ui/DoubleImage/DoubleImage';
import FullImage from '@components/ui/FullImage/FullImage';
import WorkHeader from '@components/ui/WorkHeader/WorkHeader';

const assetPath = '/img/work/ld58/';

export default function Ld58() {
    return (
        <>
            <FullImage src={`${assetPath}Styleframe.png`} alt="An 80s inspired interior of a bachelor with one goal in mind: collecting." contain />
            <FullImage src={`${assetPath}Styleframe2.png`} alt="Another 80s inspired interior of a bachelor with one goal in mind: collecting." thin />
            <WorkHeader
                title="TELEVISION"
                subtitle="SALVATION:::CONSUMPTION"
                description="The TV was the centerpiece of the bachelor pad, a glowing rectangle that promised escape and entertainment. It was a relic from a bygone era, yet it still held a certain charm. The flickering images on the screen provided a backdrop to the endless cycle of day drinking and cap collecting, a reminder of the outside world that was both tantalizing and distant. Filled with content to distract the modern man from the crushing weight of his own existence, the television was both a blessing and a curse."
            />
            <DoubleImage
                images={[
                    { src: `${assetPath}LOGO.png`, alt: 'The wireframe of the CassetteRoom scene' },
                    { src: `${assetPath}Thumbnail.png`, alt: 'Thumbnail for the LD58 game jam entry' },
                ]}
            />
        </>
    );
}
