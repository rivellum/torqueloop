import type { LandingPageConfig } from '@/types/landing-page'

/**
 * VeSeguro — Agent Recruiting Landing Page
 *
 * Target: Entrepreneurial people 22-40, want flexibility, tired of 9-5
 * Channels: Meta ads, TikTok, WhatsApp
 * Emotional triggers: Sloth, Greed, Wrath, Pride
 *
 * Color palette rationale:
 * - Electric green (#00C853) signals money, growth, action, modernity
 * - Dark charcoal (#1A1A2E) conveys confidence without corporate stuffiness
 * - Vibrant gradients for younger/TikTok-native audience
 * - More casual, rebellious brand tone vs Prospera's institutional approach
 */

export const veseguroReclutaConfig: LandingPageConfig = {
  slug: 'veseguro-recluta',

  meta: {
    title: 'Se tu propio jefe vendiendo seguros | VeSeguro',
    description:
      'Trabaja desde donde quieras, gana comisiones de por vida y deja de hacer rico a otro. Unete a VeSeguro.',
  },

  lang: 'es',

  branding: {
    logoText: 'VeSeguro',
    colors: {
      primary: '#00C853',
      primaryForeground: '#FFFFFF',
      secondary: '#1A1A2E',
      secondaryForeground: '#FFFFFF',
      accent: '#00E676',
      accentForeground: '#1A1A2E',
      background: '#FAFAFA',
      foreground: '#1A1A2E',
      muted: '#F0F0F0',
      mutedForeground: '#6B7280',
      cardBackground: '#FFFFFF',
    },
    fonts: {
      heading: 'DM Sans',
      body: 'DM Sans',
    },
    borderRadius: 16,
    heroGradient: 'linear-gradient(135deg, #1A1A2E 0%, #16213E 50%, #0F3460 100%)',
  },

  sections: [
    // ─── HERO ──────────────────────────────────────────────────
    {
      type: 'hero',
      id: 'hero',
      badge: 'Inscripciones abiertas',
      headline: 'Deja de trabajar para hacer rico a otro',
      subheadline:
        'Vende seguros desde tu celular, sin horarios, sin jefe, y gana comisiones de por vida por cada poliza. VeSeguro te da todo para empezar hoy.',
      ctaText: 'Quiero ser mi propio jefe',
      secondaryCtaText: 'Escribenos por WhatsApp',
    },

    // ─── STATS STRIP ───────────────────────────────────────────
    {
      type: 'stats',
      id: 'stats',
      variant: 'gradient',
      stats: [
        { value: '15', label: 'Minutos para registrarte y empezar', suffix: ' min' },
        { value: '100', label: 'Comision en renovaciones automaticas', suffix: '%' },
        { value: '0', label: 'Inversion inicial requerida', prefix: '$' },
      ],
    },

    // ─── VALUE PROPOSITIONS ────────────────────────────────────
    {
      type: 'value-props',
      id: 'value-props',
      heading: 'Asi funciona VeSeguro para ti',
      cards: [
        {
          icon: 'MapPin',
          title: 'Trabaja desde donde quieras',
          description:
            'Sin oficina, sin horario fijo, sin dress code. Vende desde la playa, el cafe o tu casa. Solo necesitas tu celular y ganas.',
        },
        {
          icon: 'Repeat',
          title: 'Comisiones de por vida',
          description:
            'Cada poliza que vendas te sigue pagando mientras se renueve. Construye un ingreso residual que crece cada mes sin volver a vender.',
        },
        {
          icon: 'Rocket',
          title: 'Empezar es gratis',
          description:
            'Cero inversion, cero riesgo. Te damos la plataforma, el entrenamiento y el respaldo de la aseguradora. Tu pones el hustle.',
        },
        {
          icon: 'Shield',
          title: 'Respaldo de una aseguradora real',
          description:
            'No es multinivel. No es piramide. Es un negocio legit con productos regulados por la CNSF. Tus clientes estan protegidos de verdad.',
        },
      ],
    },

    // ─── TESTIMONIALS ──────────────────────────────────────────
    {
      type: 'testimonials',
      id: 'testimonials',
      heading: 'Ellos ya lo estan haciendo',
      testimonials: [
        {
          quote:
            'Tenia un trabajo de 9 a 6 que odiaba. Ahora vendo seguros en mis tiempos y gano mas que mi sueldo anterior. Lo mejor: nadie me dice a que hora llegar.',
          name: 'Diego V.',
          role: 'Agente VeSeguro, Queretaro',
          rating: 5,
        },
        {
          quote:
            'Soy mama de dos ninos y necesitaba algo flexible. Con VeSeguro vendo desde mi celular mientras mis hijos estan en la escuela. Ya llevo 40 polizas.',
          name: 'Mariana K.',
          role: 'Agente VeSeguro, CDMX',
          rating: 5,
        },
        {
          quote:
            'Lo que me convencio fue lo de las comisiones recurrentes. Ya tengo 80 polizas activas y cada mes me llega dinero sin hacer nada nuevo. Es un negocio real.',
          name: 'Fernando S.',
          role: 'Agente VeSeguro, Monterrey',
          rating: 5,
        },
      ],
    },

    // ─── BENEFITS LIST ─────────────────────────────────────────
    {
      type: 'benefits-list',
      id: 'benefits',
      heading: 'Lo que recibes al unirte hoy',
      benefits: [
        'Acceso inmediato a la plataforma de cotizacion y venta',
        'Entrenamiento express: aprende a vender tu primera poliza en un dia',
        'Comisiones depositadas semanalmente en tu cuenta',
        'Grupo de WhatsApp con mentores y agentes activos',
        'Material de marketing listo para compartir en redes sociales',
        'Sin cuotas, sin inventario, sin minimos de venta',
        'Soporte tecnico y de ventas por chat 7 dias a la semana',
        'Certificacion oficial ante la CNSF (nosotros te guiamos)',
      ],
    },

    // ─── FORM EMBED SECTION ────────────────────────────────────
    {
      type: 'form-embed',
      id: 'form-section',
      heading: 'Registrate en 2 minutos',
      subheadline: 'Sin compromiso. Sin costo. Llena tus datos y te contactamos hoy.',
    },

    // ─── FINAL CTA ─────────────────────────────────────────────
    {
      type: 'cta',
      id: 'final-cta',
      headline: 'Cada dia que esperas es dinero que dejas en la mesa',
      subheadline:
        'Tus contactos de WhatsApp ya necesitan seguros. La pregunta es: te van a comprar a ti o a alguien mas?',
      ctaText: 'Empezar ahora gratis',
      urgencyText: 'Mas de 200 personas se registraron esta semana',
      variant: 'dark',
    },
  ],

  // ─── APPLICATION FORM ──────────────────────────────────────

  form: {
    formId: 'veseguro-recluta-app-v1',
    heading: 'Unete a VeSeguro',
    subheadline: 'Dejanos tus datos y te contactamos hoy por WhatsApp.',
    fields: [
      {
        name: 'nombre',
        label: 'Tu nombre',
        type: 'text',
        placeholder: 'Como te llamas?',
        required: true,
      },
      {
        name: 'whatsapp',
        label: 'WhatsApp',
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
        label: 'Ciudad',
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
          'Otra ciudad',
        ],
      },
      {
        name: 'experiencia',
        label: 'Has vendido seguros antes?',
        type: 'select',
        required: true,
        options: [
          'No, soy nuevo en esto',
          'Si, menos de 1 ano',
          'Si, mas de 1 ano',
        ],
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
    submitText: 'Quiero unirme a VeSeguro',
    successMessage:
      'Listo! Te enviamos un mensaje por WhatsApp en los proximos minutos. Revisa tu telefono.',
    destination: {
      type: 'supabase',
      target: 'lp_submissions',
    },
    privacyText:
      'Al registrarte, aceptas recibir un mensaje de WhatsApp de nuestro equipo de reclutamiento.',
  },

  // ─── WHATSAPP CTA ──────────────────────────────────────────

  whatsappCTA: {
    phoneNumber: '5215512345678', // To be replaced with real number
    message:
      'Hola! Vi la pagina de VeSeguro y me interesa ser agente. Me pueden dar mas informacion?',
    buttonText: 'Escribenos por WhatsApp',
    floatingButton: true,
  },

  // ─── TRACKING ──────────────────────────────────────────────

  tracking: {
    campaignId: 'veseguro-recluta-2026-q1',
    utmParams: ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content'],
    metaPixelId: '', // To be filled
    tiktokPixelId: '', // To be filled
    conversionEventName: 'veseguro_agent_registration',
  },

  // ─── FOOTER ────────────────────────────────────────────────

  footer: {
    companyName: 'VeSeguro',
    legalText:
      'VeSeguro es una marca operada por agentes autorizados. Productos respaldados por aseguradoras reguladas ante la CNSF. Resultados individuales pueden variar.',
    privacyUrl: '#',
    termsUrl: '#',
    poweredBy: 'TorqueLoop',
  },
}
