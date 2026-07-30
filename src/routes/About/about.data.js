import ArtIcon from '@/assets/icons/ART.svg?react';
import ArwIcon from '@/assets/icons/ARW.svg?react';
import BllIcon from '@/assets/icons/BLL.svg?react';
import BrcIcon from '@/assets/icons/BRC.svg?react';
import ChkIcon from '@/assets/icons/CHK.svg?react';
import CrsIcon from '@/assets/icons/CRS.svg?react';
import DceIcon from '@/assets/icons/DCE.svg?react';
import GatIcon from '@/assets/icons/GAT.svg?react';
import MrkIcon from '@/assets/icons/MRK.svg?react';

export const ABOUT_SECTIONS = ['EXP', 'SKL', 'SFT', 'EDU'];

export const ABOUT_DATA = {
    EXP: [
        {
            name: 'Sopra Steria',
            function: 'UX Designer',
            date: '2022-NOW',
            details: [
                {
                    text: 'Designed and developed serious games in both digital and physical formats.',
                    icon: DceIcon,
                },
                {
                    text: 'Designed and developed UX for various clients in the public services sector.',
                    icon: BrcIcon,
                },
                {
                    text: 'Designed multiple marketing campaigns and promotional materials.',
                    icon: ArtIcon,
                },
            ],
        },
        {
            name: 'PMOT',
            function: 'Brand & UX Designer',
            date: '2021-2022',
            details: [
                {
                    text: 'Designed a new webstore and introduced a mascot. Redesigned the logo, revamped brand colouring and adhered to industry standard UX practices',
                    icon: ArtIcon,
                },
                {
                    text: 'Introduced a learning platform in the same branding with a larger focus on industry standard designs in learning tools.',
                    icon: GatIcon,
                },
                {
                    text: 'Created a link between the products and the learning materials to create a USP',
                    icon: ArwIcon,
                },
            ],
        },
        {
            name: 'Vixel',
            function: 'Creative Developer',
            date: '2020-2021',
            details: [
                {
                    text: 'Concepted and developed new User Avatars to fit gender, size and VR engineering environments.',
                    icon: MrkIcon,
                },
                {
                    text: 'Concepted and developed 3D assets for tools to be used in the ArchViz VR software.',
                    icon: CrsIcon,
                },
                {
                    text: 'Ran end-user usability tests with the created assets and iterated on the feedback throughout the process.',
                    icon: ChkIcon,
                },
            ],
        },
    ],
    SKL: [
        { text: 'User Interface Design', icon: BllIcon },
        { text: 'Brand Identity', icon: GatIcon },
        { text: '3D Modeling', icon: ArwIcon },
        { text: 'Visual Effects', icon: ChkIcon },
        { text: 'Software Development', icon: BrcIcon },
    ],
    SFT: [
        { text: 'Illustrator', icon: '/assets/img/software/Illustrator.svg' },
        { text: 'After Effects', icon: '/assets/img/software/AfterEffects.svg' },
        { text: 'Figma', icon: '/assets/img/software/Figma.svg' },
        { text: 'Blender', icon: '/assets/img/software/Blender.svg' },
        { text: 'Unity', icon: '/assets/img/software/Unity.svg' },
        { text: 'Unreal', icon: '/assets/img/software/Unreal.svg' },
    ],
    EDU: [
        {
            school: 'Hanze',
            icon: GatIcon,
            course: 'Communication & Multimedia Design - Game Design, Bsc.',
            date: '2017-2022',
        },
    ],
};
