import React from 'react';

const Input = ({ label, id, type = 'text', required, ...props }) => {
    return (
        <div className="flex flex-col gap-2">
            <label htmlFor={id} className="text-sm font-bold text-gray-700">
                {label} {required && <span className="text-red-500">*</span>}
            </label>
            <input
                id={id}
                type={type}
                required={required}
                className="px-4 py-3 rounded-xl border border-gray-200 focus:border-[#1B4965] focus:ring-2 focus:ring-[#1B4965]/10 outline-none transition-all"
                {...props}
            />
        </div>
    );
};

export default Input;
