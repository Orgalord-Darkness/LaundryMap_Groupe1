import React from 'react';
import type { Dispatch, SetStateAction } from 'react';

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  title: string;
  options: CheckboxOption[];
  disabled: boolean; 
  value?: string[];
  onChange?: Dispatch<SetStateAction<string[]>>;
}

export const CheckboxGroup = ({ title, options, disabled, value = [], onChange }: CheckboxGroupProps) => {
  const handleCheckboxChange = (option: string | React.Key | null | undefined) => {
    const optionString = String(option);
    if (onChange) {
      onChange((prev) =>
        prev.includes(optionString)
          ? prev.filter((item) => item !== optionString)
          : [...prev, optionString]
      );
    }
  };

  return (
    <div className="w-94 p-4 my-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <label
            key={option.value}
            className="flex items-center p-2 rounded-md hover:bg-gray-50 cursor-pointer"
          >
            <input
              type="checkbox"
              disabled={disabled}
              checked={value.includes(String(option.value))}
              onChange={() => handleCheckboxChange(option.value)}
              className="h-4 w-4 text-blue-600 rounded-full border-gray-300 focus:ring-blue-500"
            />
            <span className="ml-2 text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

// Exemple d'utilisation :
/*
<CheckboxGroup
  title="Moyens de paiement acceptés"
  options={[
    { value: 'carte-bleu', label: 'Carte Bleu' },
    { value: 'carte-fidelite', label: 'Carte Fidélité' },
    { value: 'pieces', label: 'Pièces' },
    { value: 'billets', label: 'Billets' },
  ]}
/>
*/
