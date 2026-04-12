
import React from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { useState, useEffect } from 'react';

interface CheckboxOption {
  value: string;
  label: string;
}

interface CheckboxGroupProps {
  title: string;
  options: CheckboxOption[];
  value?: string[];
  onChange?: Dispatch<SetStateAction<string[]>>;
}

export const CheckboxGroup = ({ title, options, value = [], onChange }: CheckboxGroupProps) => {
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
              checked={value.includes(String(option.value))}
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
