import { ReactNode } from 'react';

type Props = {
  badge?: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
};

export default function PageHero({ badge, title, subtitle, children }: Props) {
  return (
    <section className="relative bg-gradient-to-br from-orange-500 via-orange-600 to-orange-700 text-white overflow-hidden">
      {/* Decorative circles */}
      <div aria-hidden className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-400 rounded-full opacity-30 blur-2xl" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 bg-yellow-300 rounded-full opacity-20 blur-2xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
        <div className="text-center max-w-3xl mx-auto">
          {badge && (
            <p className="text-xs sm:text-sm lg:text-base font-bold text-orange-100 mb-3 lg:mb-4 tracking-widest uppercase">
              {badge}
            </p>
          )}
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 lg:mb-6 leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm sm:text-base lg:text-lg text-orange-50 leading-relaxed">
              {subtitle}
            </p>
          )}
          {children}
        </div>
      </div>
    </section>
  );
}
