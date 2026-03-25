import React, { Suspense, lazy } from 'react';
import styled from 'styled-components';

const PodHomePage = lazy(() => import('@experience-pod/pages/HomePage.jsx'));

const Fallback = styled.div`
    min-height: 60vh;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${(p) => p.theme.colors.text.default};
    font-size: 1rem;
`;

export default function ExperiencePod() {
    return (
        <Suspense fallback={<Fallback>Loading Sepolia (Privacy on Demand) demo…</Fallback>}>
            <PodHomePage />
        </Suspense>
    );
}
