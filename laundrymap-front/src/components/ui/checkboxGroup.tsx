import React, { useState, useEffect } from 'react';

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  title: string;
  options: CheckboxOption[];
  value?: string[];                 // valeurs cochées depuis l’extérieur
  onChange?: (values: string[]) => void;
  disabled?: boolean;               // lecture seule
}

export const CheckboxGroup = ({
  title,
  options,
  value,
  onChange,
  disabled = false,
}: CheckboxGroupProps) => {

  const [selectedOptions, setSelectedOptions] = useState<string[]>(value ?? []);

  // Sync externe → interne
  useEffect(() => {
    if (value) setSelectedOptions(value);
  }, [value]);

  const handleCheckboxChange = (option: string) => {
    if (disabled) return;

    const updated = selectedOptions.includes(option)
      ? selectedOptions.filter((item) => item !== option)
      : [...selectedOptions, option];

    setSelectedOptions(updated);
    onChange?.(updated);
  };

  return (
    <div className="w-94 p-4 my-4 border border-gray-200 rounded-lg shadow-sm bg-white">
      <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="grid grid-cols-2 gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex items-center p-2 rounded-md">
            <input
              type="checkbox"
              checked={selectedOptions.includes(option.value)}
              onChange={() => handleCheckboxChange(option.value)}
              disabled={disabled}
              className="h-4 w-4 text-blue-600 rounded-full border-gray-300"
            />
            <span className="ml-2 text-gray-700">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};
