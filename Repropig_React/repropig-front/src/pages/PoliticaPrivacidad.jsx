import React from 'react';
import Navbar from '../components/Navbar';
import Footer from '../layout/Footer';

export default function PoliticaPrivacidad() {
  return (
    <>
      <Navbar />
      <div className="pt-24 pb-16 bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 bg-white p-8 md:p-12 rounded-2xl shadow-sm">
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Política de Privacidad y Tratamiento de Datos</h1>
          
          <div className="prose prose-pink max-w-none text-gray-700 space-y-6">
            <p>
              <strong>ACUERDO 13 DE 2019</strong><br />
              (diciembre 26)<br />
              Diario Oficial No. 51.238 de 25 de febrero 2020<br />
              SERVICIO NACIONAL DE APRENDIZAJE
            </p>
            <p>
              Por medio del cual se aprueba la Política General de Seguridad de la Información y Protección de Datos Personales en el SENA, y se dictan otras disposiciones.
            </p>
            
            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">1. Objetivo</h2>
            <p>
              Establecer las directrices generales para la protección de los datos personales tratados por el Servicio Nacional de Aprendizaje (SENA) a través de sus sistemas de información, incluyendo el aplicativo ReproPig, garantizando los derechos a la privacidad, la intimidad y el buen nombre de los titulares de la información, de conformidad con lo establecido en la Ley 1581 de 2012 y sus decretos reglamentarios.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">2. Tratamiento y Finalidad</h2>
            <p>
              La información suministrada por los usuarios (instructores, aprendices, personal administrativo y terceros) será recolectada, almacenada, usada, circulada o suprimida con la finalidad de:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Gestionar el acceso y uso del sistema integral de gestión reproductiva porcina (ReproPig).</li>
              <li>Mantener comunicación directa con los usuarios para fines académicos y administrativos.</li>
              <li>Realizar análisis estadísticos y reportes consolidados del Centro Agropecuario La Granja.</li>
              <li>Garantizar la trazabilidad y auditoría de los procesos registrados en el sistema.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">3. Derechos de los Titulares</h2>
            <p>
              Conforme a la ley, usted como titular de sus datos personales tiene derecho a:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Conocer, actualizar y rectificar sus datos personales frente al SENA.</li>
              <li>Solicitar prueba de la autorización otorgada, salvo cuando expresamente se exceptúe como requisito para el Tratamiento.</li>
              <li>Ser informado por el SENA, previa solicitud, respecto del uso que le ha dado a sus datos personales.</li>
              <li>Revocar la autorización y/o solicitar la supresión del dato cuando en el Tratamiento no se respeten los principios, derechos y garantías constitucionales y legales.</li>
            </ul>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">4. Seguridad de la Información</h2>
            <p>
              El SENA ha adoptado las medidas de seguridad, administrativas, técnicas y físicas, necesarias para proteger sus datos personales y evitar su pérdida, alteración, destrucción o el uso, acceso o tratamiento no autorizado.
            </p>

            <h2 className="text-xl font-semibold text-gray-900 mt-8 mb-4">5. Aceptación</h2>
            <p>
              Al utilizar el aplicativo ReproPig y proporcionar sus datos, usted manifiesta su consentimiento previo, expreso e informado para el tratamiento de sus datos personales de acuerdo con las finalidades expuestas en este documento y en concordancia con el <strong>Acuerdo 13 de 2019</strong> del SENA.
            </p>

            <div className="mt-10 p-4 bg-pink-50 border border-pink-100 rounded-lg text-sm text-pink-800">
              <p className="mb-2 font-semibold">Referencia Legal Completa:</p>
              <a href="https://normograma.sena.edu.co/compilacion/docs/acuerdo_sena_0013_2019.htm" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline flex items-center gap-2">
                <i className="fa-solid fa-arrow-up-right-from-square"></i> Consultar Acuerdo 13 de 2019 del SENA
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
