/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { Dispatch, SetStateAction, useCallback } from 'react'
import { materialForms, PreBulletInstruction } from '../types/BulletTypes'
import { Form } from './components/Form'

interface AttackEditorGUIProps {
    attackEditorInstruction: PreBulletInstruction
    setAttackEditorInstruction: Dispatch<SetStateAction<PreBulletInstruction>>
}

export const AttackEditorGUI: React.FC<AttackEditorGUIProps> = ({ attackEditorInstruction, setAttackEditorInstruction }) => {

    const setVal = useCallback((pathArray: string[], newVal: any) => {
        setAttackEditorInstruction(oldAttackEditorInstruction => {
            const newAttackEditorInstruction: { [key: string]: any } = { ...oldAttackEditorInstruction }
            let curObj = newAttackEditorInstruction;
            pathArray.forEach((path, index) => {
                if (index === pathArray.length - 1) {
                    curObj[path] = newVal;
                }
                curObj = curObj[path];
            })
            return newAttackEditorInstruction as PreBulletInstruction
        })
    }, [setAttackEditorInstruction])

    return (
        <div style={{
            position: 'absolute',
            left: 0,
            height: '100%',
            width: '200px',
            backgroundColor: 'rgba(255, 255, 255, 0.5)',
            zIndex: 1
        }}>
            <h3>Material Options</h3>
            <Form value={attackEditorInstruction.materialOptions} setVal={(pathArray: string[], newVal: any) => setVal(["materialOptions", ...pathArray], newVal)} formDefinition={materialForms} />
        </div>
    )
}
