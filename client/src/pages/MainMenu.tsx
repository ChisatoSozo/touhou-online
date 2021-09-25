import React, { useMemo } from 'react';
import { useHistory } from 'react-router';
import { VerticleMenu } from '../components/VerticleMenu';
import { MenuPageProps } from './Menu';

export const MainMenu: React.FC<MenuPageProps> = ({ active }) => {
    const history = useHistory();

    const quit = () => {
        window.location.href = 'https://www.reddit.com/r/touhou';
    };

    const titleOptions = useMemo(
        () => ({
            Play: () => history.push('/menu/game/difficultySelect'),
            Option: () => history.push('/menu/options'),
            Quit: quit,
        }),
        [history]
    );


    return <VerticleMenu menuMap={titleOptions} slanted={active} active={active} />
};
