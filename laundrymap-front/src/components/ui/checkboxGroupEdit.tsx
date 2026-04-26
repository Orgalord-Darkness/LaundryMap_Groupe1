import React from 'react'
import type { Dispatch, SetStateAction } from 'react'

interface CheckboxOption {
    value: string
    label: string
}

interface CheckboxGroupProps {
    title: string
    options: CheckboxOption[]
    disabled: boolean
    value?: string[]
    onChange?: Dispatch<SetStateAction<string[]>>
}

// ─── Variante "flat" — sans card, conçue pour s'intégrer dans une modale ──────

export const CheckboxGroup = ({ title, options, disabled, value = [], onChange }: CheckboxGroupProps) => {

    const handleCheckboxChange = (option: string | React.Key | null | undefined) => {
        const optionString = String(option)
        if (onChange) {
            onChange((prev) =>
                prev.includes(optionString)
                    ? prev.filter((item) => item !== optionString)
                    : [...prev, optionString]
            )
        }
    }

    return (
        <div className="flex flex-col gap-3">
            <h3 className="text-sm font-bold text-gray-800">{title}</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                {options.map((option) => {
                    const checked = value.includes(String(option.value))
                    return (
                        <label
                            key={option.value}
                            className={`
                                flex items-center gap-2.5 px-3 py-2.5 rounded-lg cursor-pointer
                                border transition-all duration-150 select-none
                                ${disabled ? "opacity-50 cursor-not-allowed" : "hover:bg-gray-50 active:scale-[0.98]"}
                                ${checked
                                    ? "border-primary bg-primary/5 text-primary"
                                    : "border-gray-200 bg-white text-gray-700"
                                }
                            `}
                        >
                            {/* Checkbox custom */}
                            <span className={`
                                flex-shrink-0 w-4 h-4 rounded border-2 flex items-center justify-center transition-colors
                                ${checked ? "bg-primary border-primary" : "bg-white border-gray-300"}
                            `}>
                                {checked && (
                                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                        <path
                                            d="M1 3.5L3.5 6.5L9 1"
                                            stroke="white"
                                            strokeWidth="1.8"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                )}
                            </span>

                            <input
                                type="checkbox"
                                disabled={disabled}
                                checked={checked}
                                onChange={() => handleCheckboxChange(option.value)}
                                className="sr-only"
                            />

                            <span className="text-sm font-medium leading-tight">{option.label}</span>
                        </label>
                    )
                })}
            </div>
        </div>
    )
}