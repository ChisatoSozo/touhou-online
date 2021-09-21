import { useContext } from 'react';
import { BulletContext } from '../containers/BulletContext';

export const useAddBulletGroup = () => {
    const { addBulletGroup } = useContext(BulletContext);
    return addBulletGroup;
};

export const useDisposeBulletGroup = () => {
    const { dispose } = useContext(BulletContext);
    return dispose;
};
