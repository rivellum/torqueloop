import type { LandingPageConfig } from '@/types/landing-page'

/**
 * Prospera Seguros — Agent Recruiting Landing Page
 *
 * Target: Ambitious professionals 25-45 in Mexico looking for financial independence
 * Channels: Meta ads, LinkedIn, Google Search
 * Emotional triggers: Greed, Pride, Envy, Sloth
 *
 * Color palette rationale:
 * - Deep navy (#0B1D3A) conveys trust, financial authority, professionalism
 * - Gold accent (#D4A843) signals wealth, success, premium positioning
 * - Clean white backgrounds for readability and form conversion
 */

export const prosperaReclutaConfig: LandingPageConfig = {
  slug: 'prospera-recluta',

  meta: {
    title: 'Conviertete en Asesor Financiero | Prospera Seguros',
    description:
      'Gana comisiones ilimitadas como asesor financiero en Prospera Seguros. Capacitacion, leads y herramientas incluidas. Aplica hoy.',
  },

  lang: 'es',

  branding: {
    logoText: 'Prospera Seguros',
    colors: {
      primary: '#0B1D3A',
      primaryForeground: '#FFFFFF',
      secondary: '#D4A843',
      secondaryForeground: '#0B1D3A',
      accent: '#D4A843',
      accentForeground: '#0B1D3A',
      background: '#FFFFFF',
      foreground: '#0B1D3A',
      muted: '#F4F1EB',
      mutedForeground: '#5A6577',
      cardBackground: '#FFFFFF',
    },
    fonts: {
      heading: 'DM Sans',
      body: 'DM Sans',
    },
    borderRadius: 12,
    heroGradient: 'linear-gradient(135deg, #0B1D3A 0%, #162D54 50%, #1A3A6B 100%)',
  },

  sections: [
    // ─── HERO ──────────────────────────────────────────────────
    {
      type: 'hero',
      id: 'hero',
      badge: 'Vacantes abiertas en tu ciudad',
      headline: 'Gana $5,000+ USD/mes como asesor financiero',
      subheadline:
        'Prospera Seguros busca profesionales ambiciosos que quieran construir un ingreso sin limite. Nosotros te damos los leads, la capacitacion y las herramientas. Tu solo vendes.',
      ctaText: 'Quiero aplicar ahora',
      backgroundImage: undefined,
    },

    // ─── STATS STRIP ───────────────────────────────────────────
    {
      type: 'stats',
      id: 'stats',
      variant: 'highlighted',
      stats: [
        { value: '2,400', label: 'Asesores activos en Mexico', suffix: '+' },
        { value: '85', label: 'Tasa de retencion al primer ano', suffix: '%' },
        { value: '120,000', label: 'Ingreso promedio anual MXN top 20%', prefix: '$' },
      ],
    },

    // ─── VALUE PROPOSITIONS ────────────────────────────────────
    {
      type: 'value-props',
      id: 'value-props',
      heading: 'Por que los mejores eligen Prospera',
      cards: [
        {
          icon: 'DollarSign',
          title: 'Comisiones sin techo',
          description:
            'Gana desde el primer mes con el esquema de comisiones mas competitivo del mercado. Sin limites, sin topes. Tu esfuerzo = tu ingreso.',
        },
        {
          icon: 'GraduationCap',
          title: 'Capacitacion de clase mundial',
          description:
            'Accede a nuestra academia con certificaciones en seguros, inversiones y planificacion financiera. Aprende de los top performers de la industria.',
        },
        {
          icon: 'Users',
          title: 'Leads precalificados',
          description:
            'Olvidate de tocar puertas. Nuestro sistema de marketing digital te entrega prospectos interesados directamente en tu bandeja.',
        },
        {
          icon: 'Smartphone',
          title: 'Herramientas digitales',
          description:
            'CRM propio, cotizador instantaneo, firma electronica y app movil. Todo lo que necesitas para cerrar ventas desde cualquier lugar.',
        },
      ],
    },

    // ─── TESTIMONIALS ──────────────────────────────────────────
    {
      type: 'testimonials',
      id: 'testimonials',
      heading: 'Historias de exito reales',
      testimonials: [
        {
          quote:
            'Deje mi trabajo corporativo hace 2 anos. Hoy gano 3 veces mas y manejo mi propio horario. Prospera me dio la estructura y yo puse las ganas.',
          name: 'Carlos M.',
          role: 'Asesor Senior, CDMX',
          rating: 5,
        },
        {
          quote:
            'Nunca habia vendido seguros, pero la capacitacion es tan buena que en mi tercer mes ya estaba en el top 10. Los leads que te dan hacen toda la diferencia.',
          name: 'Ana R.',
          role: 'Asesora, Monterrey',
          rating: 5,
        },
        {
          quote:
            'Lo mejor de Prospera es la comunidad. No es solo una chamba, es un equipo de gente que de verdad quiere crecer. Las juntas semanales te mantienen enfocado.',
          name: 'Roberto L.',
          role: 'Gerente de Equipo, Guadalajara',
          rating: 5,
        },
      ],
    },

    // ─── BENEFITS LIST ─────────────────────────────────────────
    {
      type: 'benefits-list',
      id: 'benefits',
      heading: 'Lo que obtendras como asesor Prospera',
      benefits: [
        'Comisiones desde tu primera venta, sin periodo de prueba',
        'Bonos trimestrales por desempeno y permanencia',
        'Capacitacion presencial y online certificada por CNBV',
        'Leads semanales generados por marketing digital',
        'CRM y herramientas tecnologicas sin costo',
        'Flexibilidad total de horario y lugar de trabajo',
        'Ruta de crecimiento clara: Asesor > Senior > Gerente > Director',
        'Viajes de incentivo nacionales e internacionales',
      ],
    },

    // ─── FORM EMBED SECTION ────────────────────────────────────
    {
      type: 'form-embed',
      id: 'form-section',
      heading: 'Aplica en 2 minutos',
      subheadline: 'Llena tus datos y un reclutador te contactara en menos de 24 horas.',
    },

    // ─── FINAL CTA ─────────────────────────────────────────────
    {
      type: 'cta',
      id: 'final-cta',
      headline: 'Tu futuro financiero empieza con una decision',
      subheadline:
        'Mientras lo piensas, otros ya estan construyendo su cartera de clientes. No dejes pasar esta oportunidad.',
      ctaText: 'Aplicar ahora',
      urgencyText: 'Cupo limitado: solo aceptamos 30 asesores nuevos por mes',
      variant: 'gradient',
    },
  ],

  // ─── APPLICATION FORM ──────────────────────────────────────

  form: {
    formId: 'prospera-recluta-app-v1',
    heading: 'Solicitud de ingreso',
    subheadline: 'Completa tus datos para iniciar tu proceso de seleccion.',
    fields: [
      {
        name: 'nombre_completo',
        label: 'Nombre completo',
        type: 'text',
        placeholder: 'Juan Perez Lopez',
        required: true,
      },
      {
        name: 'telefono',
        label: 'Telefono celular',
        type: 'tel',
        placeholder: '+52 55 1234 5678',
        required: true,
      },
      {
        name: 'email',
        label: 'Correo electronico',
        type: 'email',
        placeholder: 'tu@email.com',
        required: true,
      },
      {
        name: 'ciudad',
        label: 'Ciudad donde vives',
        type: 'select',
        required: true,
        options: [
          'CDMX',
          'Monterrey',
          'Guadalajara',
          'Puebla',
          'Queretaro',
          'Merida',
          'Tijuana',
          'Leon',
          'Cancun',
          'Otra',
        ],
      },
      {
        name: 'ocupacion_actual',
        label: 'Ocupacion actual',
        type: 'text',
        placeholder: 'Ej: Vendedor, Contador, Estudiante...',
        required: true,
      },
      {
        name: 'motivacion',
        label: 'Por que te interesa ser asesor financiero?',
        type: 'textarea',
        placeholder: 'Cuentanos brevemente que te motiva...',
        required: false,
      },
      {
        name: 'utm_source',
        label: '',
        type: 'hidden',
        defaultValue: '',
      },
      {
        name: 'utm_campaign',
        label: '',
        type: 'hidden',
        defaultValue: '',
      },
    ],
    submitText: 'Enviar mi solicitud',
    successMessage:
      'Recibimos tu solicitud. Un reclutador te contactara en las proximas 24 horas. Revisa tu WhatsApp.',
    destination: {
      type: 'supabase',
      target: 'lp_submissions',
    },
    privacyText:
      'Al enviar, aceptas que un representante de Prospera Seguros te contacte por telefono o WhatsApp.',
  },

  // ─── TRACKING ──────────────────────────────────────────────

  tracking: {
    campaignId: 'prospera-recluta-2026-q1',
    utmParams: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'],
    metaPixelId: '', // To be filled
    googleAdsId: '', // To be filled
    conversionEventName: 'prospera_agent_application',
  },

  // ─── FOOTER ────────────────────────────────────────────────

  footer: {
    companyName: 'Prospera Seguros',
    legalText:
      'Prospera Seguros S.A. de C.V. Todos los derechos reservados. Las cifras de ingresos son referenciales y dependen del desempeno individual.',
    privacyUrl: '#',
    termsUrl: '#',
    poweredBy: 'TorqueLoop',
  },
}
