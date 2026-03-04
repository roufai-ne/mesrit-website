import React, { useState, useEffect } from 'react';
import { useTheme } from '@/contexts/ThemeContext';
import { clsx } from 'clsx';
import { Building2, Globe, GraduationCap, Award, BookOpen, Users } from 'lucide-react';
import { fetchAPI, endpoints } from '@/lib/strapi';
import { mapStrapiList, mapPartner } from '@/utils/strapiMapper';

// Fallback partners if API fails or is empty
const fallbackPartners = [
    { id: 'f1', name: 'UNICEF', icon: Globe },
    { id: 'f2', name: 'Banque Mondiale', icon: Building2 },
    { id: 'f3', name: 'UNESCO', icon: BookOpen },
    { id: 'f4', name: 'CEDEAO', icon: Users },
    { id: 'f5', name: 'UEMOA', icon: Award },
    { id: 'f6', name: 'Campus France', icon: GraduationCap },
    { id: 'f7', name: 'AFD', icon: Building2 },
    { id: 'f8', name: 'Union Européenne', icon: Globe },
];

export default function Partners() {
    const { isDark } = useTheme();
    const [partners, setPartners] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPartners = async () => {
            try {
                const response = await fetchAPI(endpoints.partners || 'partners', {
                    populate: ['logo'],
                    sort: ['order:asc', 'name:asc'],
                    filters: {
                        // You can add filtering logic here if needed, e.g. isFeatured: true
                    }
                });

                // Use shared mapPartner from strapiMapper
                const data = mapStrapiList(response, mapPartner);

                if (data.length > 0) {
                    setPartners(data);
                } else {
                    setPartners(fallbackPartners);
                }
            } catch (error) {
                console.error("Error fetching partners:", error);
                setPartners(fallbackPartners);
            } finally {
                setLoading(false);
            }
        };

        fetchPartners();
    }, []);

    const displayPartners = partners.length > 0 ? partners : fallbackPartners;

    return (
        <section className="py-8 overflow-hidden relative">
            <div className="container mx-auto px-4 lg:px-6 mb-8 text-center">
                <h2 className={clsx(
                    'text-2xl font-bold mb-2',
                    isDark ? 'text-white' : 'text-gray-900'
                )}>
                    Nos Partenaires
                </h2>
                <p className={clsx(
                    'text-sm',
                    isDark ? 'text-gray-400' : 'text-gray-600'
                )}>
                    Ils nous accompagnent dans nos missions
                </p>
            </div>

            <div className="relative w-full">
                {/* Gradients de masquage pour effet de fondu */}
                <div className={clsx(
                    "absolute left-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-r",
                    isDark ? "from-gray-900 via-gray-900/90 to-transparent" : "from-white via-white/90 to-transparent"
                )} />
                <div className={clsx(
                    "absolute right-0 top-0 bottom-0 w-32 z-10 bg-gradient-to-l",
                    isDark ? "from-gray-900 via-gray-900/90 to-transparent" : "from-white via-white/90 to-transparent"
                )} />

                {/* Marquee Container */}
                <div className="flex overflow-hidden group">
                    <div className="flex space-x-16 animate-marquee whitespace-nowrap py-6">
                        {/* Premier set de partenaires */}
                        {displayPartners.map((partner, index) => (
                            <div
                                key={`p1-${index}`}
                                onClick={() => partner.website && window.open(partner.website, '_blank')}
                                className={clsx(
                                    "flex flex-col items-center justify-center space-y-4 min-w-[160px] transition-all duration-300 transform hover:scale-110 cursor-pointer group/partner",
                                    partner.website ? "cursor-pointer" : "cursor-default"
                                )}
                            >
                                <div className={clsx(
                                    "w-28 h-28 rounded-2xl flex items-center justify-center shadow-lg p-5 transition-all duration-300",
                                    isDark
                                        ? "bg-gray-800 border border-gray-700 group-hover/partner:border-niger-orange/50 group-hover/partner:bg-gray-750"
                                        : "bg-white border border-gray-100 group-hover/partner:border-niger-orange/30 group-hover/partner:shadow-xl"
                                )}>
                                    {partner.logo ? (
                                        <img
                                            src={partner.logo}
                                            alt={partner.name}
                                            className="w-full h-full object-contain filter grayscale group-hover/partner:grayscale-0 transition-all duration-300"
                                        />
                                    ) : (
                                        partner.icon ? (
                                            <partner.icon className={clsx(
                                                "w-12 h-12 filter grayscale group-hover/partner:grayscale-0 transition-all duration-300",
                                                isDark ? "text-gray-400 group-hover/partner:text-niger-orange" : "text-gray-500 group-hover/partner:text-niger-orange"
                                            )} />
                                        ) : (
                                            <Globe className={clsx(
                                                "w-12 h-12 filter grayscale group-hover/partner:grayscale-0 transition-all duration-300",
                                                isDark ? "text-gray-400" : "text-gray-500"
                                            )} />
                                        )
                                    )}
                                </div>
                                <span className={clsx(
                                    "text-lg font-semibold transition-colors duration-300",
                                    isDark ? "text-gray-300 group-hover/partner:text-white" : "text-gray-700 group-hover/partner:text-black"
                                )}>{partner.name}</span>
                            </div>
                        ))}

                        {/* Duplication pour effet infini */}
                        {displayPartners.map((partner, index) => (
                            <div
                                key={`p2-${index}`}
                                onClick={() => partner.website && window.open(partner.website, '_blank')}
                                className={clsx(
                                    "flex flex-col items-center justify-center space-y-4 min-w-[160px] transition-all duration-300 transform hover:scale-110 cursor-pointer group/partner",
                                    partner.website ? "cursor-pointer" : "cursor-default"
                                )}
                            >
                                <div className={clsx(
                                    "w-28 h-28 rounded-2xl flex items-center justify-center shadow-lg p-5 transition-all duration-300",
                                    isDark
                                        ? "bg-gray-800 border border-gray-700 group-hover/partner:border-niger-orange/50 group-hover/partner:bg-gray-750"
                                        : "bg-white border border-gray-100 group-hover/partner:border-niger-orange/30 group-hover/partner:shadow-xl"
                                )}>
                                    {partner.logo ? (
                                        <img
                                            src={partner.logo}
                                            alt={partner.name}
                                            className="w-full h-full object-contain filter grayscale group-hover/partner:grayscale-0 transition-all duration-300"
                                        />
                                    ) : (
                                        partner.icon ? (
                                            <partner.icon className={clsx(
                                                "w-12 h-12 filter grayscale group-hover/partner:grayscale-0 transition-all duration-300",
                                                isDark ? "text-gray-400 group-hover/partner:text-niger-orange" : "text-gray-500 group-hover/partner:text-niger-orange"
                                            )} />
                                        ) : (
                                            <Globe className={clsx(
                                                "w-12 h-12 filter grayscale group-hover/partner:grayscale-0 transition-all duration-300",
                                                isDark ? "text-gray-400" : "text-gray-500"
                                            )} />
                                        )
                                    )}
                                </div>
                                <span className={clsx(
                                    "text-lg font-semibold transition-colors duration-300",
                                    isDark ? "text-gray-300 group-hover/partner:text-white" : "text-gray-700 group-hover/partner:text-black"
                                )}>{partner.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Styles pour l'animation marquee */}
            <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
        </section>
    );
}
