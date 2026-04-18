import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const Footer: React.FC = () => {
  const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({});

  const toggleSection = (section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const footerSections = [
    {
      title: 'SSEDEE',
      items: [
        { label: 'Sobre nosotros', href: '#nosotros' },
        { label: 'Servicios', href: '#servicios' },
        { label: 'Eventos', href: '/eventos' },
        { label: 'Contacto', href: '#contactanos' },
      ]
    },
    {
      title: 'Soporte',
      items: [
        { label: 'Centro de ayuda', href: '#' },
        { label: 'Documentación', href: '#' },
        { label: 'Estado del sistema', href: '#' },
        { label: 'Reportar problema', href: '#' },
      ]
    },
    {
      title: 'Legal',
      items: [
        { label: 'Términos de servicio', href: '#' },
        { label: 'Política de privacidad', href: '#' },
        { label: 'Política de cookies', href: '#' },
        { label: 'Licencias', href: '#' },
      ]
    }
  ];

  return (
    <footer className="bg-primary-bg border-t border-accent/10">
      <div className="max-w-7xl mx-auto px-4 md:px-6 lg:px-8">
        {/* Main Footer Content */}
        <div className="py-12">
          {/* Desktop Layout */}
          <div className="hidden md:grid md:grid-cols-4 gap-8">
            {/* Logo & Description */}
            <div className="space-y-4">
              <div className="flex items-center">
                <img src="/images/LogoB.png" alt="SSEDEE Logo" className="h-8 w-auto" />
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Sistema de Seguimiento y Estadísticas Deportivas en Tiempo Real.
                Tecnología avanzada para el deporte moderno.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-xs font-medium uppercase tracking-wide">
                  Sistema Activo
                </span>
              </div>
            </div>

            {/* Footer Sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="space-y-4">
                <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                  {section.title}
                </h3>
                <ul className="space-y-2">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        className="text-white/60 hover:text-accent transition-colors duration-200 text-sm"
                      >
                        {item.label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Mobile Layout */}
          <div className="md:hidden space-y-4">
            {/* Logo & Description */}
            <div className="space-y-4 pb-6 border-b border-accent/10">
              <div className="flex items-center">
                <img src="/images/LogoB.png" alt="SSEDEE Logo" className="h-8 w-auto" />
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                Sistema de Seguimiento y Estadísticas Deportivas en Tiempo Real.
                Tecnología avanzada para el deporte moderno.
              </p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-accent rounded-full animate-pulse" />
                <span className="text-accent text-xs font-medium uppercase tracking-wide">
                  Sistema Activo
                </span>
              </div>
            </div>

            {/* Accordion Sections */}
            {footerSections.map((section) => (
              <div key={section.title} className="border-b border-accent/10 last:border-b-0">
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full flex items-center justify-between py-4 text-left"
                >
                  <h3 className="text-white font-bold text-sm uppercase tracking-wide">
                    {section.title}
                  </h3>
                  {openSections[section.title] ? (
                    <ChevronUp size={16} className="text-accent" />
                  ) : (
                    <ChevronDown size={16} className="text-white/60" />
                  )}
                </button>
                {openSections[section.title] && (
                  <ul className="pb-4 space-y-2">
                    {section.items.map((item) => (
                      <li key={item.label}>
                        <a
                          href={item.href}
                          className="block py-2 text-white/60 hover:text-accent transition-colors duration-200 text-sm"
                        >
                          {item.label}
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-accent/10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4 text-xs text-white/40">
              <span>© 2024 SSEDEE. Todos los derechos reservados.</span>
              <div className="hidden md:block w-px h-4 bg-accent/20" />
              <span className="hidden md:inline">Tecnología avanzada para el deporte</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-accent/40 rounded-full" />
                <span className="text-accent/60 text-xs font-medium uppercase tracking-widest">
                  Real-time Sync
                </span>
              </div>
              <div className="text-white/40 text-xs">
                v2.1.0
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;