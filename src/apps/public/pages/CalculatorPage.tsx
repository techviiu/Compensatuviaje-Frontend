import React from 'react';
import { motion } from 'framer-motion';
import { FaLeaf, FaPlane, FaCalculator, FaShieldAlt, FaGlobeAmericas } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { CalculatorAI } from '../components/Calculator';
import AnimatedBackground from '../../../shared/components/AnimatedBackground';

const CalculatorPage: React.FC = () => {
  return (
    <div className="!min-h-screen !bg-gradient-to-br !from-[#0a0f1a] !via-[#0f172a] !to-[#1e293b] !relative !overflow-hidden">
      {/* Background */}
      <AnimatedBackground variant="particles" />
      
      {/* Decorative elements */}
      <div className="!absolute !inset-0 !overflow-hidden !pointer-events-none">
        <div className="!absolute !top-20 !right-10 !w-96 !h-96 !bg-green-500/10 !rounded-full !blur-3xl" />
        <div className="!absolute !bottom-20 !left-10 !w-96 !h-96 !bg-blue-500/10 !rounded-full !blur-3xl" />
      </div>

      <div className="!container !mx-auto !px-4 !py-16 !relative !z-10">
        {/* Header */}
        <motion.div
          className="!text-center !mb-12"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="!inline-flex !items-center !gap-2 !px-4 !py-2 !bg-green-500/10 !rounded-full !border !border-green-500/20 !mb-6"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <HiSparkles className="!text-green-400" />
            <span className="!text-green-400 !text-sm !font-medium">Impulsado por IA</span>
          </motion.div>

          <h1 className="!text-4xl md:!text-5xl lg:!text-6xl !font-bold !text-white !mb-4">
            Calcula tu{' '}
            <span className="!bg-gradient-to-r !from-green-400 !to-emerald-500 !bg-clip-text !text-transparent">
              Huella de Carbono
            </span>
          </h1>
          
          <p className="!text-lg !text-gray-400 !max-w-2xl !mx-auto">
            Descubre el impacto ambiental de tu vuelo y compénsalo con proyectos certificados. 
            Nuestro asistente IA te guiará en todo el proceso.
          </p>
        </motion.div>

        {/* Main Content */}
        <div className="!grid lg:!grid-cols-3 !gap-8 !items-start">
          {/* Calculator */}
          <motion.div
            className="lg:!col-span-2"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <CalculatorAI />
          </motion.div>

          {/* Side Info */}
          <motion.div
            className="!space-y-6"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            {/* Features Card */}
            <div className="!bg-white/5 !backdrop-blur-xl !rounded-2xl !p-6 !border !border-white/10">
              <h3 className="!text-lg !font-semibold !text-white !mb-4">
                ¿Por qué usar nuestra calculadora?
              </h3>
              
              <div className="!space-y-4">
                <Feature 
                  icon={<FaCalculator />}
                  title="Metodología DEFRA 2025"
                  description="Factores de emisión actualizados del gobierno del Reino Unido"
                />
                <Feature 
                  icon={<FaShieldAlt />}
                  title="Proyectos Certificados"
                  description="Gold Standard y VCS verificados internacionalmente"
                />
                <Feature 
                  icon={<FaGlobeAmericas />}
                  title="Impacto Local"
                  description="Proyectos en Chile y América Latina"
                />
              </div>
            </div>

            {/* Stats Card */}
            <div className="!bg-gradient-to-br !from-green-500/10 !to-emerald-500/5 !backdrop-blur-xl !rounded-2xl !p-6 !border !border-green-500/20">
              <h3 className="!text-lg !font-semibold !text-white !mb-4">
                Nuestro Impacto
              </h3>
              
              <div className="!grid !grid-cols-2 !gap-4">
                <StatItem value="15,000+" label="Toneladas compensadas" />
                <StatItem value="50,000+" label="Árboles plantados" />
                <StatItem value="1,200+" label="Usuarios activos" />
                <StatItem value="4.9/5" label="Satisfacción" />
              </div>
            </div>

            {/* Trust Badge */}
            <div className="!flex !items-center !justify-center !gap-3 !py-4">
              <FaShieldAlt className="!text-green-400 !text-xl" />
              <span className="!text-gray-400 !text-sm">
                Pago seguro con cifrado SSL
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

// Feature component
const Feature: React.FC<{ icon: React.ReactNode; title: string; description: string }> = ({
  icon,
  title,
  description
}) => (
  <div className="!flex !gap-3">
    <div className="!w-10 !h-10 !rounded-xl !bg-green-500/10 !flex !items-center !justify-center !flex-shrink-0">
      <span className="!text-green-400">{icon}</span>
    </div>
    <div>
      <h4 className="!text-white !font-medium !text-sm">{title}</h4>
      <p className="!text-gray-400 !text-xs !mt-0.5">{description}</p>
    </div>
  </div>
);

// Stat item component
const StatItem: React.FC<{ value: string; label: string }> = ({ value, label }) => (
  <div className="!text-center">
    <div className="!text-2xl !font-bold !text-white">{value}</div>
    <div className="!text-xs !text-gray-400">{label}</div>
  </div>
);

export default CalculatorPage;
