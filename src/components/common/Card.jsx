import { useState } from 'react';

const Card = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
  onClick,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const paddings = {
    none: '0',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
  };

  const cardStyle = {
    backgroundColor: '#FFFFFF',
    borderRadius: '0.75rem',
    boxShadow: isHovered && hover
      ? '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
      : '0 1px 3px rgba(0, 0, 0, 0.1)',
    border: '1px solid #F1F5F9',
    padding: paddings[padding],
    transition: 'all 0.3s ease',
    transform: isHovered && hover ? 'translateY(-4px)' : 'none',
    cursor: hover ? 'pointer' : 'default',
  };

  return (
    <div
      style={cardStyle}
      className={className}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children}
    </div>
  );
};

Card.Header = ({ children, className = '' }) => (
  <div style={{ marginBottom: '1rem' }} className={className}>
    {children}
  </div>
);

Card.Title = ({ children, className = '' }) => (
  <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: '#1E3A5F' }} className={className}>
    {children}
  </h3>
);

Card.Description = ({ children, className = '' }) => (
  <p style={{ fontSize: '0.875rem', color: '#64748B', marginTop: '0.25rem' }} className={className}>
    {children}
  </p>
);

Card.Content = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

Card.Footer = ({ children, className = '' }) => (
  <div style={{ marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #F1F5F9' }} className={className}>
    {children}
  </div>
);

export default Card;
