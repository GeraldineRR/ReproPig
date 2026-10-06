import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../layout/Footer';

export default function TerminosCondiciones() {
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Términos y Condiciones de Uso</h1>
          
          <div className="prose prose-pink max-w-none text-gray-700 space-y-6">
            <p className="text-lg">
              Bienvenido al sistema <strong>ReproPig</strong> del Centro Agropecuario La Granja (SENA).
            </p>
            
            <p>
              Al acceder y utilizar esta aplicación, usted acepta cumplir con los siguientes términos y condiciones de uso. Si no está de acuerdo con alguna parte de estos términos, no debe utilizar el sistema.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Uso del Sistema</h2>
            <p>
              ReproPig es una herramienta de gestión reproductiva porcina diseñada con fines académicos, investigativos y de administración interna del SENA. Usted se compromete a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Utilizar el sistema de manera responsable y exclusivamente para los fines establecidos.</li>
              <li>Proporcionar información veraz, precisa y actualizada en todos los registros.</li>
              <li>No utilizar el sistema para propósitos ilícitos, fraudulentos o que atenten contra las normativas de la institución.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Credenciales y Seguridad</h2>
            <p>
              El acceso al sistema se realiza mediante credenciales personales (usuario y contraseña). Usted es el único responsable de mantener la confidencialidad de sus credenciales y de todas las actividades que ocurran bajo su cuenta. El SENA no se hace responsable por el uso no autorizado de su cuenta.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Propiedad Intelectual</h2>
            <p>
              Todo el contenido, diseño, logotipos, código fuente y demás elementos del sistema ReproPig son propiedad del Servicio Nacional de Aprendizaje (SENA) o de sus respectivos creadores, y están protegidos por las leyes de propiedad intelectual e industrial vigentes.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Disponibilidad y Mantenimiento</h2>
            <p>
              El SENA realizará sus mejores esfuerzos para garantizar la disponibilidad continua del sistema; sin embargo, no garantiza que el acceso sea ininterrumpido o libre de errores. El sistema puede estar sujeto a mantenimientos programados o fallas técnicas imprevistas.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Modificaciones</h2>
            <p>
              El SENA se reserva el derecho de modificar o actualizar estos Términos y Condiciones en cualquier momento sin previo aviso. Es responsabilidad del usuario revisar periódicamente esta sección.
            </p>

            <p className="mt-10 font-medium italic text-gray-500">
              Última actualización: {new Date().toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
