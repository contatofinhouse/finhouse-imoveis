
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
  const baseStyles = "inline-flex items-center justify-center px-8 py-3 border text-base font-semibold rounded-lg transition-all duration-300 transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 tracking-wide";
  
  const variants = {
    primary: "border-transparent text-white bg-brand-accent hover:brightness-105 focus:ring-brand-accent shadow-sm",
    outline: "border-brand-dark text-brand-dark bg-transparent hover:bg-gray-50",
    white: "border-gray-200 text-brand-dark bg-white hover:bg-gray-50 shadow-sm",
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
