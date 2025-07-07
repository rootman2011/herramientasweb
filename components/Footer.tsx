
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-base-100 border-t border-secondary/50">
      <div className="container mx-auto px-4 py-6 text-center text-gray-400">
        <p>&copy; {currentYear} Herramientas Web, Finanzas y Más. Todos los derechos reservados.</p>
        <p className="text-sm mt-1">Creado con ❤️ y código.</p>
      </div>
    </footer>
  );
};

export default Footer;
