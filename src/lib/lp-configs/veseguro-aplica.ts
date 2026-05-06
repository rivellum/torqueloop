import type { LandingPageConfig } from '@/types/landing-page'

/**
 * VeSeguro — "/aplica" Campaign Landing Page
 *
 * Target: Mexican women 28-45, educated, exec's wives,
 *         currently in corporate "godínez" jobs,
 *         looking for a career that respects their time and ambition
 *
 * Channels: Instagram/Meta ads (mobile-first)
 * Tone: Empowering, aspirational, respectful — not "hustle culture"
 *
 * Brand colors: VeSeguro orange (#F26B2A) + dark navy (#1B2A4A)
 */

export const veseguroAplicaConfig: LandingPageConfig = {
  slug: 'aplica',

  meta: {
    title: 'Aplica — Tu carrera, tus términos | VeSeguro',
    description:
      'Conviértete en Agente de Seguros con VeSeguro y GNP. Horarios flexibles, entrenamiento incluido, ingreso residual. Aplica hoy.',
    noIndex: false,
  },

  lang: 'es',

  branding: {
    logoUrl: '/logos/veseguro-logo.png',
    logoText: 'VeSeguro',
    partnerLogoUrl: '/logos/gnp-logo.png',
    partnerLogoAlt: 'GNP Seguros',
    colors: {
      primary: '#F26B2A',           // VeSeguro orange
      primaryForeground: '#FFFFFF',
      secondary: '#1B2A4A',         // Dark navy
      secondaryForeground: '#FFFFFF',
      accent: '#FF8C42',            // Lighter orange for CTA
      accentForeground: '#FFFFFF',
      background: '#FAFAFA',
      foreground: '#1B2A4A',
      muted: '#F3F4F6',
      mutedForeground: '#6B7280',
      cardBackground: '#FFFFFF',
    },
    fonts: {
      heading: 'DM Sans',
      body: 'DM Sans',
    },
    borderRadius: 14,
    heroGradient: 'linear-gradient(135deg, #1B2A4A 0%, #243B6A 60%, #2D4A7A 100%)',
  },

  sections: [
    // ─── HERO ──────────────────────────────────────────────────
    {
      type: 'hero',
      id: 'hero',
      badge: 'Inscripciones abiertas · Respaldado por GNP',
      headline: 'Tu tiempo vale más que ese escritorio',
      subheadline:
        'Conviértete en Agente de Seguros con VeSeguro. Horarios que tú decides, entrenamiento completo, y un respaldo de primer nivel con GNP. Tu siguiente capítulo empieza hoy.',
      ctaText: 'Quiero aplicar',
      secondaryCtaText: 'Hablar por WhatsApp',
    },

    // ─── STATS STRIP ───────────────────────────────────────────
    {
      type: 'stats',
      id: 'stats',
      variant: 'gradient',
      stats: [
        { value: '400+', label: 'Agentes activos en todo México' },
        { value: '100%', label: 'Comisión en renovaciones automáticas', suffix: '' },
        { value: '$0', label: 'Inversión inicial para comenzar' },
      ],
    },

    // ─── VALUE PROPOSITIONS ────────────────────────────────────
    {
      type: 'value-props',
      id: 'value-props',
      heading: '¿Por qué VeSeguro?',
      cards: [
        {
          icon: 'Clock',
          title: 'Tú pones los horarios',
          description:
            'Trabaja desde donde quieras, cuando quieras. Sin jefe, sin oficina, sin horarios fijos. Tu vida personal no se negocia.',
        },
        {
          icon: 'Shield',
          title: 'Respaldado por GNP',
          description:
            'No es un experimento. GNP es una de las aseguradoras más sólidas de México. Tus clientes y tu reputación están protegidos.',
        },
        {
          icon: 'GraduationCap',
          title: 'Entrenamiento incluido',
          description:
            'No necesitas experiencia previa. Te capacitamos desde cero: productos, ventas, plataforma digital. Todo listo para que empieces.',
        },
        {
          icon: 'TrendingUp',
          title: 'Ingreso que crece contigo',
          description:
            'Cada póliza que vendas te genera comisiones mientras se renueve. Construye un ingreso residual que crece cada mes.',
        },
      ],
    },

    // ─── SOCIAL PROOF ──────────────────────────────────────────
    {
      type: 'testimonials',
      id: 'testimonials',
      heading: 'Ellas ya dieron el paso',
      testimonials: [
        {
          quote:
            'Dejé mi puesto corporativo después de 10 años. Lo que más me asustaba era perder mi independencia económica. Con VeSeguro la recuperé, pero con libertad de tiempo que nunca tuve.',
          name: 'Alejandra M.',
          role: 'Agente VeSeguro, CDMX · Ex-Gerente Corporativa',
          rating: 5,
        },
        {
          quote:
            'Soy mamá de dos y necesitaba algo que encajara en mi vida, no al revés. Vendo seguros desde mi celular mientras mis hijos están en la escuela. Ya tengo 35 pólizas activas.',
          name: 'Carolina R.',
          role: 'Agente VeSeguro, Monterrey',
          rating: 5,
        },
        {
          quote:
            'Lo que me convenció fue el respaldo de GNP y que no necesitaba invertir nada. Empecé desde cero y a los 3 meses ya superaba mi sueldo anterior.',
          name: 'Patricia L.',
          role: 'Agente VeSeguro, Guadalajara · Ex-Ejecutiva de Cuentas',
          rating: 5,
        },
      ],
    },

    // ─── BENEFITS LIST ─────────────────────────────────────────
    {
      type: 'benefits-list',
      id: 'benefits',
      heading: 'Lo que obtienes al unirte',
      benefits: [
        'Acceso inmediato a la plataforma de cotización y venta digital',
        'Capacitación completa: aprende a vender tu primera póliza en días',
        'Comisiones depositadas semanalmente en tu cuenta bancaria',
        'Grupo privado de WhatsApp con mentoras y agentes activas',
        'Material de marketing listo para compartir en redes sociales',
        'Sin cuotas, sin inventario, sin mínimos de venta mensual',
        'Soporte técnico y de ventas por chat 7 días a la semana',
        'Certificación oficial ante la CNSF (te guiamos en el proceso)',
      ],
    },

    // ─── FORM EMBED SECTION ────────────────────────────────────
    {
      type: 'form-embed',
      id: 'form-section',
      heading: 'Aplica en 2 minutos',
      subheadline: 'Sin compromiso. Llena tus datos y te contactamos hoy por WhatsApp.',
    },

    // ─── FINAL CTA ─────────────────────────────────────────────
    {
      type: 'cta',
      id: 'final-cta',
      headline: 'Tu carrera ideal no va a esperarte',
      subheadline:
        'Miles de mujeres ya están construyendo un negocio propio con respaldo real. El único paso que falta es el tuyo.',
      ctaText: 'Aplicar ahora',
      urgencyText: 'Más de 200 mujeres aplicaron esta semana',
      variant: 'dark',
    },
  ],

  // ─── APPLICATION FORM ──────────────────────────────────────

  form: {
    formId: 'veseguro-aplica-v1',
    heading: 'Aplica para ser Agente VeSeguro',
    subheadline: 'Dejanos tus datos y te contactamos hoy por WhatsApp.',
    fields: [
      {
        name: 'nombre',
        label: 'Nombre completo',
        type: 'text',
        placeholder: '¿Cómo te llamas?',
        required: true,
      },
      {
        name: 'telefono',
        label: 'Teléfono / WhatsApp',
        type: 'tel',
        placeholder: '+52 55 1234 5678',
        required: true,
      },
      {
        name: 'email',
        label: 'Correo electrónico',
        type: 'email',
        placeholder: 'tu@email.com',
        required: true,
      },
      {
        name: 'ciudad',
        label: 'Ciudad',
        type: 'select',
        required: true,
        options: [
          'CDMX',
          'Monterrey',
          'Guadalajara',
          'Puebla',
          'Querétaro',
          'Mérida',
          'Tijuana',
          'León',
          'Cancún',
          'Otra ciudad',
        ],
      },
      {
        name: 'experiencia',
        label: '¿Tienes experiencia en ventas?',
        type: 'select',
        required: true,
        options: [
          'No, pero quiero aprender',
          'Sí, en otro rubro (no seguros)',
          'Sí, he vendido seguros antes',
        ],
      },
      {
        name: 'utm_source',
        label: '',
        type: 'hidden',
        defaultValue: '',
      },
      {
        name: 'utm_medium',
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
      {
        name: 'utm_content',
        label: '',
        type: 'hidden',
        defaultValue: '',
      },
    ],
    submitText: 'Quiero que me contacten',
    successMessage:
      '¡Listo! Te enviamos un mensaje por WhatsApp en los próximos minutos. Revisa tu teléfono.',
    destination: {
      type: 'supabase',
      target: 'leads',
    },
    privacyText:
      'Al registrarte, aceptas recibir un mensaje de WhatsApp de nuestro equipo de reclutamiento.',
  },

  // ─── WHATSAPP CTA ──────────────────────────────────────────

  whatsappCTA: {
    phoneNumber: '5215512345678', // TODO: Replace with real number
    message:
      '¡Hola! Vi la página de VeSeguro y me interesa ser Agente de Seguros. ¿Me pueden dar más información?',
    buttonText: 'Escribenos por WhatsApp',
    floatingButton: true,
  },

  // ─── TRACKING ──────────────────────────────────────────────

  tracking: {
    campaignId: 'veseguro-aplica-2026-q1',
    utmParams: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'],
    metaPixelId: '', // To be filled
    tiktokPixelId: '', // To be filled
    conversionEventName: 'veseguro_aplica_submission',
  },

  // ─── FOOTER ────────────────────────────────────────────────

  footer: {
    companyName: 'VeSeguro',
    legalText:
      'VeSeguro es una marca operada por agentes autorizados. Productos respaldados por aseguradoras reguladas ante la CNSF. Resultados individuales pueden variar.',
    privacyUrl: 'https://veseguro.com/privacidad',
    termsUrl: 'https://veseguro.com/terminos',
    poweredBy: 'TorqueLoop',
  },
}
