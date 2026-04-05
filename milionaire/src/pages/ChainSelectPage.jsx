import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const Shell = styled.div`
    min-height: 70vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 2rem 1rem;
    gap: 1.5rem;
`;

const Title = styled.h1`
    margin: 0;
    font-size: 1.35rem;
    font-weight: 600;
    color: ${(p) => p.theme.colors.text.default};
    text-align: center;
`;

const Sub = styled.p`
    margin: 0;
    max-width: 32rem;
    font-size: 0.9rem;
    line-height: 1.5;
    color: ${(p) => p.theme.colors.text.default};
    opacity: 0.9;
    text-align: center;
`;

const Control = styled.div`
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
    width: min(100%, 22rem);
`;

const Label = styled.label`
    font-size: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    color: ${(p) => p.theme.colors.text.default};
`;

const Select = styled.select`
    padding: 0.65rem 0.75rem;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(0, 0, 0, 0.35);
    color: ${(p) => p.theme.colors.text.default};
    font-size: 1rem;
    cursor: pointer;

    &:focus {
        outline: 2px solid ${(p) => p.theme.colors.primary.default};
        outline-offset: 2px;
    }
`;

const Button = styled.button`
    padding: 0.75rem 1.25rem;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    background: ${(p) => p.theme.colors.primary.default};
    color: #0a0a0a;

    &:hover {
        filter: brightness(1.05);
    }

    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
`;

const Hint = styled.p`
    margin: 0;
    font-size: 0.75rem;
    opacity: 0.75;
    color: ${(p) => p.theme.colors.text.default};
    text-align: center;
    max-width: 28rem;
`;

export default function ChainSelectPage() {
    const navigate = useNavigate();
    const [chain, setChain] = useState('coti');

    const openDemo = () => {
        if (chain === 'coti') {
            navigate('/coti');
        } else {
            navigate('/sepolia');
        }
    };

    return (
        <Shell>
            <Title>Choose network</Title>
            <Sub>
                Same Millionaires&apos; Problem demo: run it natively on COTI Testnet, or on Ethereum Sepolia with
                Privacy on Demand (PoD) for encryption and MPC while the contract lives on Sepolia.
            </Sub>
            <Control>
                <Label htmlFor="chain-select">Network</Label>
                <Select
                    id="chain-select"
                    value={chain}
                    onChange={(e) => setChain(e.target.value)}
                    aria-label="Select COTI Testnet or Sepolia"
                >
                    <option value="coti">COTI Testnet (native MPC)</option>
                    <option value="sepolia">Sepolia (Privacy on Demand)</option>
                </Select>
                <Button type="button" onClick={openDemo}>
                    Open demo
                </Button>
            </Control>
            <Hint>
                COTI: <code>VITE_CONTRACT_ADDRESS_COTI_TESTNET</code> + <code>COTI_TESTNET_RPC_URL</code>. Sepolia:{' '}
                <code>VITE_CONTRACT_ADDRESS_SEPOLIA</code> + <code>SEPOLIA_RPC_URL</code>. See{' '}
                <code>.env.example</code>.
            </Hint>
        </Shell>
    );
}
