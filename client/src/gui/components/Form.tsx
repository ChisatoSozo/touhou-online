/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useMemo, useState } from 'react'
import { FormDefinition } from '../../types/BulletTypes'

interface FormProps {
    value: any
    setVal: (pathArray: string[], newVal: any) => void;
    formDefinition: FormDefinition
}

{/* <input type="number" value={attackEditorInstruction.patternOptions.num} onChange={(e) => setVal(['patternOptions', 'num'], e.target.value)} />
            <BabylonColorPicker value={attackEditorInstruction.materialOptions.color} onChange={(newColor) => setVal(['materialOptions', 'color'], newColor)} /> */}

export const Form: React.FC<FormProps> = ({ value, setVal, formDefinition }) => {

    const formTypeOptions = useMemo(() => Object.keys(formDefinition), [formDefinition])
    const [currentFormType, setCurrentFormType] = useState(formTypeOptions[0])
    useEffect(() => {
        setCurrentFormType(formTypeOptions[0])
    }, [formTypeOptions])

    const formFields = formDefinition[currentFormType]

    return (
        <>
            <select value={currentFormType} onChange={(e) => setCurrentFormType(e.target.value)}>
                {formTypeOptions.map(formType => <option key={formType} value={formType}>
                    {formType}
                </option>)}
            </select>
            {Object.keys(formFields).map(formField => {
                //HERE
                return <h4 key={formField}>{formField}</h4>
            })}
        </>
    )
}
