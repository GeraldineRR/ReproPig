import React from 'react';

export default function Contact() {
  return (
    <section id="contactanos" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">Contáctanos</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Estamos aquí para ayudarte. Encuentra nuestra ubicación o comunícate con nosotros para más información.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 bg-white rounded-3xl shadow-xl overflow-hidden">
          {/* Columna de Información */}
          <div className="p-8 lg:p-12 bg-pink-600 text-white flex flex-col justify-center">
            <h3 className="text-2xl font-bold mb-6">Información de Contacto</h3>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <i className="fa-solid fa-location-dot text-xl"></i>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold">Ubicación</h4>
                  <p className="text-pink-100 mt-1 mb-3">
                    Centro Agropecuario La Granja<br />
                    Vía Chicoral - Espinal
                  </p>
                  <a 
                    href="https://www.google.com/maps/search/?api=1&query=Centro+Agropecuario+la+granja+Sena+Espinal+Tolima" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white text-pink-600 px-4 py-2 rounded-lg font-bold hover:bg-pink-50 shadow-sm transition-colors text-sm"
                  >
                    <i className="fa-solid fa-map-location-dot"></i>
                    Ver ubicación precisa
                  </a>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <i className="fa-solid fa-phone text-xl"></i>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold">Teléfonos</h4>
                  <p className="text-pink-100 mt-1">
                    {/* Placeholder para los números */}
                    [Número 1 por definir]<br />
                    [Número 2 por definir]
                  </p>
                </div>
              </div>

              <div className="flex items-start">
                <div className="flex-shrink-0 mt-1">
                  <i className="fa-solid fa-envelope text-xl"></i>
                </div>
                <div className="ml-4">
                  <h4 className="text-lg font-semibold">Correo Electrónico</h4>
                  <p className="text-pink-100 mt-1">
                    contacto@repropig.com
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-10 pt-8 border-t border-pink-500">
              <h4 className="text-lg font-semibold mb-4">Síguenos</h4>
              <div className="flex space-x-4">
                <a href="#" className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center hover:bg-pink-400 transition-colors">
                  <i className="fa-brands fa-facebook-f"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center hover:bg-pink-400 transition-colors">
                  <i className="fa-brands fa-instagram"></i>
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-pink-500 flex items-center justify-center hover:bg-pink-400 transition-colors">
                  <i className="fa-brands fa-twitter"></i>
                </a>
              </div>
            </div>
          </div>

          {/* Columna del Mapa */}
          <div className="h-96 lg:h-auto relative min-h-[400px]">
            {/* 
              Usamos un iframe de Google Maps con la ruta Chicoral - Espinal 
              Una vez que el usuario pase la ubicación exacta, podemos actualizar este enlace
            */}
            <iframe 
              src="https://maps.google.com/maps?q=Centro%20Agropecuario%20la%20granja%20Sena%2C%20Espinal%2C%20Tolima&t=&z=15&ie=UTF8&iwloc=&output=embed" 
              className="absolute inset-0 w-full h-full border-0" 
              allowFullScreen="" 
              loading="lazy" 
              referrerPolicy="no-referrer-when-downgrade"
              title="Ubicación ReproPig"
            ></iframe>
          </div>
        </div>
      </div>
    </section>
  );
}
