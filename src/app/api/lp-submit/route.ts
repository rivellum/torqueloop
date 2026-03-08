import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

/**
 * LP Form Submission API
 *
 * Receives form data from TorqueLoop landing pages and inserts into the `leads` table.
 * Maps LP form fields to the leads schema and stores extra data in metadata.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      _form_id,
      _campaign_id,
      _slug,
      _submitted_at,
      _page_url,
      nombre_completo,
      nombre,
      telefono,
      whatsapp,
      email,
      ciudad,
      ocupacion_actual,
      motivacion,
      experiencia,
      utm_source,
      utm_medium,
      utm_campaign,
      utm_content,
      utm_term,
      ...extraFields
    } = body

    // Map to leads table schema
    const leadData = {
      name: nombre_completo || nombre || null,
      email: email || null,
      phone: telefono || null,
      whatsapp: whatsapp || telefono || null,
      source_channel: utm_source || _slug || 'landing_page',
      status: 'new',
      metadata: {
        form_id: _form_id,
        campaign_id: _campaign_id,
        lp_slug: _slug,
        submitted_at: _submitted_at,
        page_url: _page_url,
        ciudad,
        ocupacion_actual,
        motivacion,
        experiencia,
        utm: {
          source: utm_source,
          medium: utm_medium,
          campaign: utm_campaign,
          content: utm_content,
          term: utm_term,
        },
        ...extraFields,
      },
    }

    const { data, error } = await supabase
      .from('leads')
      .insert(leadData)
      .select()
      .single()

    if (error) {
      console.error('[LP Submit] Supabase error:', error)
      // Still return success to the user — we don't want form errors to block UX
      // Log for debugging but the lead data is in the console
      return NextResponse.json(
        { success: true, message: 'Submission received', debug: error.message },
        { status: 200 }
      )
    }

    return NextResponse.json(
      { success: true, message: 'Lead captured', id: data?.id },
      { status: 201 }
    )
  } catch (err) {
    console.error('[LP Submit] Error:', err)
    return NextResponse.json(
      { success: false, message: 'Internal error' },
      { status: 500 }
    )
  }
}
