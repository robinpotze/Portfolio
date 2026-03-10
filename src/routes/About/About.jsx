import ErrorBoundary from '@components/ErrorBoundary';
import { useState } from 'react';

export default function About () {

    const Data = {
        EXP: {
            SSGNL: {
                name: "Sopra Steria",
                function: "UX Designer",
                date: "2022-NOW",
                details: {
                    one: "Lorem Ipsum",
                    two: "dolar est",
                    three: "liquidatum"
                },
            },
            PMOT: {
                name: "PMOT",
                function: "Brand & UX Ddesigner",
                date: "2021-2022",
                details: {
                    one: "Lorem Ipsum",
                    two: "dolar est",
                    three: "liquidatum"
                },
            },
            VIXEL: {
                name: "PMOT",
                function: "Brand & UX Ddesigner",
                date: "2021-2022",
                details: {
                    one: "Lorem Ipsum",
                    two: "dolar est",
                    three: "liquidatum"
                },
            }
        },
        SKL: ["User Interface Design", "Brand Identity", "3D Modeling", "Visual Effects"],
        SFT: ["Figma", "After Effects", "Blender", "Unreal"],
        EDU: {
            school: "Hanze Groningen",
            grad: "Communication & Multimedia Design - Game Design, Bsc.",
            date: "2017-2022",
        },
    };

    const [currentPage, setCurrentpage] = useState(Data.EXP);

    return (
        <ErrorBoundary>
            <div className='about-page'>
                <div className='about-selector'>
                    <div className='about-selector-button' onClick={setCurrentpage(Data.EXP)}>
                        <h1>EXP</h1>
                    </div>
                    <div className='about-selector-button' onClick={setCurrentpage(Data.SKL)}>
                        <h1>SKL</h1>
                    </div>
                    <div className='about-selector-button' onClick={setCurrentpage(Data.SFT)}>
                        <h1>SFT</h1>
                    </div>
                    <div className='about-selector-button' onClick={setCurrentpage(Data.EDU)}>
                        <h1>EDU</h1>
                    </div>
                </div>
                <div className='about-details'>
                    <h1>Robin Potze</h1>
                    <div className='about-details-header'>
                        <h2></h2>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
}