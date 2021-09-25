import { useHistory } from 'react-router';
import { backSound } from '../sounds/SFX';
import { useKeydownMenu } from './useKeydown';

export const useBack = (path: string, onBeforeBack?: () => void) => {
    const history = useHistory();

    useKeydownMenu('MENU', () => {
        if (onBeforeBack) onBeforeBack();
        history.push(path);
        backSound.play();
    });
};
