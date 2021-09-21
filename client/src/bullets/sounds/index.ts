import { Sound } from '@babylonjs/core';
import { Assets } from '../../containers/AssetContext';
import { SoundOptions } from '../../types/BulletTypes';
import { filterInPlace } from '../../utils/Utils';

export class EnemySound {
    private soundObj: Sound;
    private reducedTimings: number[];
    private timeSinceStart: number;

    constructor(soundObj: Sound, reducedTimings: number[]) {
        this.soundObj = soundObj;
        this.reducedTimings = reducedTimings;
        this.timeSinceStart = 0;
    }

    update(deltaS: number) {
        this.timeSinceStart += deltaS;

        this.reducedTimings.some((timing) => {
            if (this.timeSinceStart > timing) {
                this.soundObj.play();
                return false;
            }
            return true;
        });

        filterInPlace<number>(this.reducedTimings, (timing) => this.timeSinceStart <= timing);
    }
}

export const makeBulletSound = (soundOptions: SoundOptions, timings: number[], assets: Assets) => {
    const reducedTimings = [...new Set(timings)].sort((a, b) => a - b);

    //@ts-ignore
    const soundObj = assets.sounds[soundOptions.sound];
    console.log(assets)
    if (!soundObj) throw new Error(`Sound ${soundOptions.sound} not found`)

    return new EnemySound(soundObj, reducedTimings);
};
