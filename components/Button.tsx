import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'outline' | 'white';
  fullWidth?: boolean;
}

const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  fullWidth = false, 
  className = '',
  ...props 
}) => {
  // Updated to rounded-full for modern tech look
  const baseStyles = "inline-flex items-center justify-center px-8 py-3.5 border text-base font-semibold rounded-full transition-all duration-300 transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-offset-2 tracking-wide";
  
  const variants = {
    primary: "border-transparent text-white bg-brand-accent hover:bg-indigo-500 focus:ring-indigo-500 shadow-lg shadow-indigo-500/30",
    outline: "border-brand-accent text-brand-accent bg-transparent hover:bg-brand-accent hover:text-white",
    white: "border-transparent text-brand-primary bg-white hover:bg-gray-50 shadow-md",
  };

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${widthClass} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;