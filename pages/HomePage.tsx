import React from 'react';
import { Link } from 'react-router-dom';

const ToolCard: React.FC<{ link: string; icon: React.ReactNode; title: string; description: string }> = ({ link, icon, title, description }) => {
    return (
        <Link to={link} className="block bg-base-100 p-8 rounded-xl shadow-lg hover:shadow-primary/20 hover:scale-105 transition-all duration-300 h-full">
            <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/20 text-primary mb-6 mx-auto">
                {icon}
            </div>
            <h3 className="text-2xl font-bold mb-3 text-base-content text-center">{title}</h3>
            <p className="text-gray-400 text-center">{description}</p>
        </Link>
    );
};

const IconHectare: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
    </svg>
);

const IconPayPal: React.FC = () => (
    <svg className="h-8 w-8" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg" strokeLinecap="round">
        <path d="M10 3h5.5C18.537 3 21 5.463 21 8.5S18.537 14 15.5 14H10v7H7V3h3zm3.5 8c1.38 0 2.5-1.12 2.5-2.5S14.88 6 13.5 6H10v5h3.5z" />
        <line x1="12" y1="1" x2="12" y2="23" strokeWidth="3.5" className="stroke-base-100" />
        <line x1="12" y1="1" x2="12" y2="23" strokeWidth="1.5" stroke="currentColor" />
    </svg>
);


const HomePage: React.FC = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center pt-8 pb-4 md:pt-16 md:pb-8">
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          Tu <span className="text-primary">caja de herramientas</span> digital
        </h1>
        <p className="max-w-2xl mx-auto text-xl text-gray-400">
          Una colección de utilidades diseñadas para simplificar tus tareas diarias.
        </p>
      </section>

      {/* Tools Section */}
      <section id="tools-section" className="pb-16">
        <div className="flex justify-center flex-wrap gap-8 px-4">
            <div className="w-full max-w-sm">
                <ToolCard
                    link="/tools/hectare-calculator"
                    icon={<IconHectare />}
                    title="Calculadora Visual de Hectáreas"
                    description="Visualiza y mide terrenos. Ingresa hectáreas y ajusta la forma del polígono de forma interactiva."
                />
            </div>
            <div className="w-full max-w-sm">
                <ToolCard
                    link="/tools/paypal-calculator"
                    icon={<IconPayPal />}
                    title="Calculadora de Comisiones PayPal"
                    description="Calcula cuánto necesitas enviar para que llegue una cantidad exacta, o cuánto recibirás."
                />
            </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;