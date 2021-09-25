import { Box } from '@material-ui/core';
import React, { useState } from 'react';
import { BackArrow } from '../components/BackArrow';
import { ForwardArrow } from '../components/ForwardArrow';
import { SlideBox } from '../components/SlideBox';
import { useLS } from '../containers/LSContext';
import { useBack } from '../hooks/useBack';
import { MenuPageProps } from './Menu';

export const UsernameSelect: React.FC<MenuPageProps> = ({ next, active }) => {
    const { setLS, LS } = useLS();
    useBack('/menu');

    const [username, setUsername] = useState<string>(LS.USERNAME === "ERROR" ? "" : LS.USERNAME);
    const onBeforeNext = () => {
        setLS("USERNAME", username);
    }

    return <SlideBox wide active={active}>
        Select a Username
        <br></br>
        <br></br>
        <input value={username} onChange={(e) => setUsername(e.target.value)} />
        <Box display="flex" width="100%">
            <BackArrow back="/menu" />
            <Box flex={1} />
            <ForwardArrow onBeforeNext={onBeforeNext} next={next || "/"} />
        </Box>

    </SlideBox>;
};
