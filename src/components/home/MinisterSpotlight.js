import Image from 'next/image';
import Link from 'next/link';
import { Quote, ArrowRight } from 'lucide-react';

export default function MinisterSpotlight({ ministre }) {
  if (!ministre) return null;

  const { photo, nom, titre, message } = ministre;
  const displayName = nom || 'Le Ministre';

  return (
    <div className="rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row min-h-[400px] lg:min-h-[500px]">

      {/* LEFT — Photo du ministre (40%) */}
      <div className="relative w-full md:w-2/5 min-h-[280px] md:min-h-0 flex-shrink-0">
        <Image
          src={photo || '/images/dir/default.jpeg'}
          alt={`Photo de ${displayName}`}
          fill
          sizes="(max-width: 768px) 100vw, 40vw"
          className="object-cover object-top"
          priority
        />
        {/* Overlay gradient bas pour lisibilité du nom */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
        {/* Séparateur orange (desktop uniquement) */}
        <div className="hidden md:block absolute right-0 top-0 bottom-0 w-1.5 bg-niger-orange z-10" />
        {/* Nom + titre en overlay bas */}
        <div className="absolute bottom-0 left-0 right-0 p-6 md:pr-8">
          <p className="text-white font-bold text-lg leading-tight">{displayName}</p>
          {titre && (
            <p className="text-white/70 text-sm mt-1 leading-snug">{titre}</p>
          )}
        </div>
      </div>

      {/* RIGHT — Message (60%) */}
      <div className="relative flex-1 bg-gradient-to-br from-niger-orange via-niger-orange-dark to-niger-green p-8 lg:p-14 flex flex-col justify-center overflow-hidden">

        {/* Icône décorative en fond */}
        <Quote
          className="absolute top-6 right-6 w-24 h-24 text-white/[0.08] rotate-180"
          aria-hidden="true"
        />

        {/* Label section */}
        <p className="text-white/50 text-xs font-semibold tracking-widest uppercase mb-6">
          Mot du Ministre
        </p>

        {/* Message */}
        {message ? (
          <blockquote className="text-white/95 italic text-lg lg:text-xl leading-relaxed font-light line-clamp-5 mb-8">
            &laquo;&nbsp;{message}&nbsp;&raquo;
          </blockquote>
        ) : (
          <p className="text-white/60 italic text-base mb-8">
            Message du ministre non disponible pour le moment.
          </p>
        )}

        {/* Séparateur */}
        <div className="w-16 h-0.5 bg-white/40 mb-6" />

        {/* Identité répétée côté message (desktop) */}
        <div className="mb-8">
          <p className="text-white font-bold text-xl">{displayName}</p>
          {titre && (
            <p className="text-white/70 text-sm mt-1">{titre}</p>
          )}
        </div>

        {/* CTA */}
        <div>
          <Link
            href="/ministere/direction"
            className="inline-flex items-center gap-2 px-6 py-3 border border-white/30 text-white rounded-xl hover:bg-white/10 active:bg-white/20 transition-all duration-200 text-sm font-medium"
          >
            Lire le message complet
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

      </div>
    </div>
  );
}
