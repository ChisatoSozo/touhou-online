import { Box, List, ListItem, makeStyles } from '@material-ui/core';
import { isFunction } from 'lodash';
import React, { useCallback, useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { ILS, useLS } from '../containers/LSContext';
import { choiceSound, selectSound } from '../sounds/SFX';
import { SlideBox } from "./SlideBox";

const useStyles = makeStyles({
    options: {
        position: 'absolute',
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'left 2s',
        whiteSpace: 'nowrap',
    },
    optionsPos1: {
        left: '115vw',
    },
    optionsPos2: {
        left: '70vw',
    },
    arrayChoice: {
        padding: '10px',
        cursor: 'pointer',
        '&:hover': {
            color: "#333333"
        }
    },
});

interface VerticleMenuSingleProps {
    active: boolean;
    selected: boolean;
    menuKey: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    menuValue: any;
    slanted: boolean;
    index: number;
    setSelectedItem: (index: number) => void

}

export const VerticleMenuSingle: React.FC<VerticleMenuSingleProps> = ({ active, selected, menuKey, menuValue, slanted, index, setSelectedItem }) => {
    const styleAddin = selected
        ? {
            color: 'white',
            WebkitTextStrokeColor: 'black',
        }
        : {};

    const handleClick = useCallback(() => {
        if (!active) return;
        if (!isFunction(menuValue)) return;
        menuValue();
        selectSound.play();
    }, [active, menuValue]);

    const handleMouseOver = useCallback(() => {
        setSelectedItem(index)
        choiceSound.play();
    }, [index, setSelectedItem]);

    return (
        <ListItem
            style={{
                left: slanted ? -index * 3 + 'vh' : 0,
                transition: 'left 2s',
                cursor: 'pointer',

                ...styleAddin,
            }}
            key={menuKey}
            onPointerOver={handleMouseOver}
            onClick={handleClick}
        >
            {menuKey}
        </ListItem>
    );
};

interface MenuItemArrayProps {
    selected: boolean;
    index: number;
    setChoice: (choice: string) => void;
    setSelectedItem: (index: number) => void
    value: string,
}

export const MenuArrayItem: React.FC<MenuItemArrayProps> = ({ selected, setSelectedItem, setChoice, index, value }) => {

    const styleAddin = selected
        ? {
            color: 'white',
            WebkitTextStrokeColor: 'black',
        }
        : {};

    const classes = useStyles();

    const handleClick = useCallback(() => {
        setChoice(value)
        selectSound.play();
    }, [setChoice, value]);

    const handleMouseOver = useCallback(() => {
        setSelectedItem(index)
        choiceSound.play();
    }, [index, setSelectedItem]);


    return (
        <span onClick={handleClick} onPointerOver={handleMouseOver} className={classes.arrayChoice} style={{ ...styleAddin }}>
            {value}
        </span>
    );
}

interface VerticalMenuArrayProps {
    selected: boolean;
    menuKey: string;
    menuValue: string[],
    slanted: boolean,
    index: number,
    setSelectedItem: (index: number) => void
}

export const VerticleMenuArray: React.FC<VerticalMenuArrayProps> = ({ selected, menuKey, menuValue, slanted, index, setSelectedItem }) => {
    const styleAddin = selected
        ? {
            color: 'white',
            WebkitTextStrokeColor: 'black',
        }
        : {};

    const { setLS, LS } = useLS()
    const [choice, setChoice] = useState(LS[menuKey.toUpperCase() as keyof ILS] as string);

    useEffect(() => {
        setLS(menuKey.toUpperCase() as keyof ILS, choice as ILS[keyof ILS]);
    }, [choice, menuKey, setLS]);

    const arrayIndex = menuValue.indexOf(choice);

    return (
        <ListItem
            style={{
                left: slanted ? -index * 3 + 'vh' : 0,
                transition: 'left 2s',
            }}
            key={menuKey}
        >
            <Box display="flex" position="relative" left="-250px">
                <span style={{ ...styleAddin }}>{menuKey}</span>
                <Box position="absolute" left="350px">
                    {menuValue.map((val, i) =>
                        <MenuArrayItem
                            key={val}
                            selected={arrayIndex === i}
                            index={index}
                            setSelectedItem={setSelectedItem}
                            setChoice={setChoice}
                            value={val}
                        />)}
                </Box>
            </Box>
        </ListItem>
    );
};

interface VerticleMenuProps {
    menuMap: { [key: string]: (() => void) | string[] | number[] };
    active: boolean;
    slanted: boolean;
    back?: string;
    wide?: boolean;
    medium?: boolean;
}

export const VerticleMenu: React.FC<VerticleMenuProps> = ({ menuMap, active = true, slanted = false, back = false, wide = false, medium = false }) => {

    const history = useHistory();
    const menuMapProc = back ? {
        ...menuMap,

        "←": () => history.push(back as string)
    } : menuMap;

    const menuKeys = Object.keys(menuMapProc);
    const [selectedItem, setSelectedItem] = useState(0);


    return (
        <SlideBox wide={wide} medium={medium} active={active}>
            <List>
                {menuKeys.map((menuKey, i) => {
                    const menuValue = menuMapProc[menuKey];
                    const menuItemProps = {
                        setSelectedItem,
                        selected: i === selectedItem,
                        menuKey: menuKey,
                        slanted: slanted,
                        index: i,
                        menuValue: menuValue,
                        active
                    };

                    if (isFunction(menuValue)) return <VerticleMenuSingle key={i} {...menuItemProps} />;
                    //@ts-ignore
                    if (Array.isArray(menuValue)) return <VerticleMenuArray key={i} {...menuItemProps} />;
                    return false;
                })}
            </List>
        </SlideBox>
    );
};
