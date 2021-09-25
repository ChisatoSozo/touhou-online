import { makeStyles } from '@material-ui/core';
import React, { useCallback } from 'react';
import { useHistory } from 'react-router';
import { choiceSound, selectSound } from '../sounds/SFX';

const useStyles = makeStyles({
    arrow: {
        cursor: 'pointer',
        "&:hover": {
            color: 'white',
            WebkitTextStrokeColor: 'black',
        }
    }
});

export const ForwardArrow = ({ next, onBeforeNext }: { next: string, onBeforeNext?: () => void }) => {
    const history = useHistory();
    const classes = useStyles()

    const handleMouseOver = useCallback(() => {
        choiceSound.play();
    }, []);

    const handleClick = useCallback(() => {
        if (onBeforeNext) onBeforeNext();
        history.push(next)
        selectSound.play();
    }, [onBeforeNext, history, next]);

    return (
        <span className={classes.arrow} onPointerOver={handleMouseOver} onClick={handleClick}>
            →
        </span >
    )
}
