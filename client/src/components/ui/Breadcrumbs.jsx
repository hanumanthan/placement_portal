import { ChevronRight, Home } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Breadcrumbs({ items, className = '' }) {
  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1 text-sm ${className}`}>
      <Link to="/" className="text-muted hover:text-primary transition-colors duration-150">
        <Home className="w-4 h-4" />
      </Link>

      {items.map((item, index) => (
        <div key={index} className="flex items-center gap-1">
          <ChevronRight className="w-3.5 h-3.5 text-secondary-300" />
          {index === items.length - 1 ? (
            <span className="text-secondary-900 font-medium">{item.label}</span>
          ) : (
            <Link
              to={item.href}
              className="text-muted hover:text-primary transition-colors duration-150"
            >
              {item.label}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
}
