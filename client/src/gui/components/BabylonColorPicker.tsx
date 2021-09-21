import React from 'react';
import { StateComponentProps } from '../../types/UtilTypes';

const componentToHex = (c: number) => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

const rgbToHex = (r: number, g: number, b: number) => {
    return "#" + componentToHex(Math.round(r * 255)) + componentToHex(Math.round(g * 255)) + componentToHex(Math.round(b * 255));
}
const hexToRgb: (hex: string) => [number, number, number] = (hex) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : [0, 0, 0];
}

export const BabylonColorPicker: React.FC<StateComponentProps<[number, number, number]>> = ({ value, onChange }) => {

    return (
        <input type="color" value={rgbToHex(value[0], value[1], value[2])} onChange={(e) => onChange(hexToRgb(e.target.value))} />
    )
}
