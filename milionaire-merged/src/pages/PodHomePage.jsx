import React from 'react';
import { MillionaireHomePage } from './MillionaireHomePage.jsx';
import { useMillionaireContractPod } from '../hooks/useMillionaireContractPod.js';

export default function PodHomePage() {
    return <MillionaireHomePage useContractHook={useMillionaireContractPod} network="sepolia" />;
}
