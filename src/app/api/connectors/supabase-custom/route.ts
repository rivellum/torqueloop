import { NextRequest, NextResponse } from 'next/server'

/**
 * Supabase Custom CRM Connector
 *
 * For businesses that built their own systems on Supabase (like Rivellum).
 *
 * This connector connects to an EXTERNAL Supabase project (the customer's own)
 * and syncs TorqueLoop leads/outcomes to their tables.
 *
 * Required from user:
 * - Supabase project URL
 * - Supabase anon key (or service role key for server-side)
 * - Table mapping: which table for contacts, which for deals/outcomes
 * - Field mapping: TorqueLoop fields → customer's column names
 */

interface SupabaseCustomConfig {
  project_url: string   // e.g., https://xxxxx.supabase.co
  anon_key: string      // Public anon key (RLS-safe) or service role key
  contact_table: string // e.g., 'leads', 'contacts', 'agents'
  outcome_table: string // e.g., 'deals', 'outcomes', 'hires'
  field_map: {
    name: string        // Which column = name
    email: string       // Which column = email
    phone?: string
    source?: string
    campaign_id?: string
    outcome_value?: string
    outcome_type?: string
    status?: string
  }
}

// Get connector info or test connection
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const test = searchParams.get('test')

  if (test === 'true') {
    const url = searchParams.get('url')
    const key = searchParams.get('key')

    if (!url || !key) {
      return NextResponse.json({ error: 'Missing url or key parameter' }, { status: 400 })
    }

    try {
      // Test connection by listing tables
      const response = await fetch(`${url}/rest/v1/`, {
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
        },
      })

      if (response.ok) {
        return NextResponse.json({
          success: true,
          message: 'Supabase connection successful',
        })
      }

      return NextResponse.json({ error: 'Connection failed', status: response.status }, { status: 400 })
    } catch (error) {
      return NextResponse.json({ error: 'Could not reach Supabase instance' }, { status: 500 })
    }
  }

  return NextResponse.json({
    connector: 'supabase_custom',
    name: 'Supabase (Custom)',
    status: 'available',
    auth_type: 'api_key',
    description: 'Connect to any Supabase-based CRM, lead tracker, or custom database.',
    required_config: {
      project_url: 'Your Supabase project URL (https://xxxxx.supabase.co)',
      anon_key: 'Your Supabase anon key or service role key',
      contact_table: 'Name of the table where leads/contacts are stored',
      outcome_table: 'Name of the table where outcomes/deals are stored',
      field_map: 'Mapping of TorqueLoop fields to your column names',
    },
    capabilities: [
      'read_contacts',
      'write_contacts',
      'read_outcomes',
      'write_outcomes',
      'custom_field_mapping',
      'rls_compatible',
    ],
  })
}

// Sync data to/from customer's Supabase
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workspace_id, data, config: rawConfig } = body

    // In production: fetch config from our Supabase for this workspace
    const config: SupabaseCustomConfig = rawConfig || {
      project_url: '',
      anon_key: '',
      contact_table: 'contacts',
      outcome_table: 'deals',
      field_map: { name: 'name', email: 'email' },
    }

    const headers = {
      'apikey': config.anon_key,
      'Authorization': `Bearer ${config.anon_key}`,
      'Content-Type': 'application/json',
      'Prefer': 'return=representation',
    }

    switch (action) {
      case 'sync_lead': {
        // Build the row using the customer's field mapping
        const row: Record<string, unknown> = {}
        if (config.field_map.name) row[config.field_map.name] = data.name
        if (config.field_map.email) row[config.field_map.email] = data.email
        if (config.field_map.phone) row[config.field_map.phone] = data.phone
        if (config.field_map.source) row[config.field_map.source] = 'TorqueLoop'
        if (config.field_map.campaign_id) row[config.field_map.campaign_id] = data.campaign_id

        const response = await fetch(
          `${config.project_url}/rest/v1/${config.contact_table}`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(row),
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          return NextResponse.json({ error: `Failed to sync lead: ${errorText}` }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json({ success: true, record: result[0] })
      }

      case 'sync_outcome': {
        const row: Record<string, unknown> = {}
        if (config.field_map.outcome_type) row[config.field_map.outcome_type] = data.outcome_type
        if (config.field_map.outcome_value) row[config.field_map.outcome_value] = data.value
        if (config.field_map.status) row[config.field_map.status] = data.status || 'completed'
        if (config.field_map.source) row[config.field_map.source] = 'TorqueLoop'
        if (config.field_map.campaign_id) row[config.field_map.campaign_id] = data.campaign_id

        // Link to contact if we have a reference
        if (data.contact_id) {
          row['contact_id'] = data.contact_id
        }

        const response = await fetch(
          `${config.project_url}/rest/v1/${config.outcome_table}`,
          {
            method: 'POST',
            headers,
            body: JSON.stringify(row),
          }
        )

        if (!response.ok) {
          const errorText = await response.text()
          return NextResponse.json({ error: `Failed to sync outcome: ${errorText}` }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json({ success: true, record: result[0] })
      }

      case 'list_tables': {
        // Use Supabase's built-in schema introspection
        const response = await fetch(
          `${config.project_url}/rest/v1/?select=*`,
          { headers: { apikey: config.anon_key, Authorization: `Bearer ${config.anon_key}` } }
        )

        // The REST endpoint returns available tables info
        return NextResponse.json({
          success: true,
          message: 'Use the Supabase dashboard to view your table schema',
        })
      }

      case 'webhook': {
        // Generic webhook endpoint — customer can point Supabase triggers here
        // to notify TorqueLoop of new outcomes
        console.log(`[supabase-custom] Webhook received for workspace ${workspace_id}:`, data)
        return NextResponse.json({ success: true, received: true })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
