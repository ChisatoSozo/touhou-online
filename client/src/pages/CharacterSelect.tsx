import React, { useCallback, useMemo } from 'react';
import { useHistory } from 'react-router';
import { VerticleMenu } from '../components/VerticleMenu';
import { useLS } from '../containers/LSContext';
import { useBack } from '../hooks/useBack';
import { Avatar } from '../protos/touhou_pb';
import { MenuPageProps } from './Menu';



export const CharacterSelect: React.FC<MenuPageProps> = ({ back, next, active }) => {
    const { setLS } = useLS();
    const history = useHistory();
    useBack(back || "/error");

    const choose = useCallback(
        (character) => {
            setLS('CHARACTER', character, true);
            history.push(next || "/error");
        },
        [setLS, history, next]
    );

    const characterOptions = useMemo(
        () => ({
            Reimu: () => choose(Avatar.REIMU),
            Marisa: () => choose(Avatar.MARISA),
        }),
        [choose]
    );

    return <VerticleMenu active={active} slanted={active} menuMap={characterOptions} back={back}></VerticleMenu>;
};
