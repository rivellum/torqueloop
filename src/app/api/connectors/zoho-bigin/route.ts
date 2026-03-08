import { NextRequest, NextResponse } from 'next/server'

/**
 * Zoho Bigin CRM Connector
 *
 * OAuth2 flow: https://www.zoho.com/accounts/protocol/new-oauth/web-server-applications.html
 * API docs: https://www.bigin.com/developer/docs/apis/
 *
 * Important: Zoho uses region-specific domains:
 * - US: accounts.zoho.com / www.zohoapis.com
 * - EU: accounts.zoho.eu / www.zohoapis.eu
 * - IN: accounts.zoho.in / www.zohoapis.in
 *
 * Endpoints used:
 * - GET /bigin/v2/Contacts - Read contacts
 * - POST /bigin/v2/Contacts - Create contacts
 * - GET /bigin/v2/Deals - Read deals
 * - POST /bigin/v2/Deals - Create deals (outcomes)
 * - GET /bigin/v2/Pipelines - Read pipeline config
 */

interface ZohoConfig {
  access_token: string
  api_domain: string  // e.g., 'https://www.zohoapis.com'
  refresh_token: string
}

// OAuth callback handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const location = searchParams.get('location') || 'us'

  // Region-specific auth domains
  const AUTH_DOMAINS: Record<string, string> = {
    us: 'https://accounts.zoho.com',
    eu: 'https://accounts.zoho.eu',
    in: 'https://accounts.zoho.in',
    au: 'https://accounts.zoho.com.au',
  }
  const API_DOMAINS: Record<string, string> = {
    us: 'https://www.zohoapis.com',
    eu: 'https://www.zohoapis.eu',
    in: 'https://www.zohoapis.in',
    au: 'https://www.zohoapis.com.au',
  }

  if (code) {
    const authDomain = AUTH_DOMAINS[location] || AUTH_DOMAINS.us

    try {
      const tokenResponse = await fetch(`${authDomain}/oauth/v2/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.ZOHO_CLIENT_ID || '',
          client_secret: process.env.ZOHO_CLIENT_SECRET || '',
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/connectors/zoho-bigin`,
          code,
        }),
      })

      if (!tokenResponse.ok) {
        return NextResponse.json({ error: 'Zoho OAuth token exchange failed' }, { status: 400 })
      }

      const tokens = await tokenResponse.json()

      // In production: store tokens + api_domain in Supabase
      return NextResponse.json({
        success: true,
        message: 'Zoho Bigin connected successfully',
        api_domain: API_DOMAINS[location] || API_DOMAINS.us,
      })
    } catch (error) {
      return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
    }
  }

  // Return connector info
  return NextResponse.json({
    connector: 'zoho_bigin',
    name: 'Zoho Bigin',
    status: 'available',
    auth_type: 'oauth2',
    regions: ['us', 'eu', 'in', 'au'],
    capabilities: [
      'read_contacts',
      'write_contacts',
      'read_deals',
      'write_deals',
      'read_pipelines',
    ],
    oauth_url: `https://accounts.zoho.com/oauth/v2/auth?scope=ZohoBigin.modules.ALL&client_id=${process.env.ZOHO_CLIENT_ID}&response_type=code&access_type=offline&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/api/connectors/zoho-bigin')}`,
  })
}

// Sync data to/from Zoho Bigin
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workspace_id, data } = body

    // In production: fetch Zoho tokens from Supabase for this workspace
    const config: ZohoConfig = {
      access_token: '',   // Retrieved from DB
      api_domain: 'https://www.zohoapis.com',
      refresh_token: '',  // Retrieved from DB
    }

    const headers = {
      'Authorization': `Zoho-oauthtoken ${config.access_token}`,
      'Content-Type': 'application/json',
    }

    switch (action) {
      case 'sync_lead': {
        // Push a TorqueLoop lead to Bigin as a Contact
        const response = await fetch(`${config.api_domain}/bigin/v2/Contacts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: [{
              First_Name: data.first_name || '',
              Last_Name: data.last_name || data.name,
              Email: data.email,
              Phone: data.phone,
              Lead_Source: 'TorqueLoop',
              Description: `Campaign: ${data.campaign_name || 'N/A'} | Channel: ${data.channel || 'N/A'} | UTM: ${data.utm_campaign || 'N/A'}`,
            }],
          }),
        })

        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to sync lead to Zoho Bigin' }, { status: 500 })
        }

        const result = await response.json()
        const contactId = result.data?.[0]?.details?.id
        return NextResponse.json({ success: true, zoho_contact_id: contactId })
      }

      case 'sync_outcome': {
        // Write an outcome as a Deal in Bigin
        const response = await fetch(`${config.api_domain}/bigin/v2/Deals`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            data: [{
              Deal_Name: `TorqueLoop: ${data.outcome_type} - ${data.name || 'Unknown'}`,
              Stage: data.stage || 'Qualification',
              Amount: data.value,
              Contact_Name: data.zoho_contact_id ? { id: data.zoho_contact_id } : undefined,
              Pipeline: data.pipeline || 'Standard',
              Description: `Source: TorqueLoop | Campaign: ${data.campaign_id || 'N/A'}`,
            }],
          }),
        })

        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to sync outcome to Zoho Bigin' }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json({ success: true, deal_id: result.data?.[0]?.details?.id })
      }

      case 'list_pipelines': {
        const response = await fetch(`${config.api_domain}/bigin/v2/settings/pipeline?module=Deals`, {
          headers,
        })

        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to fetch pipelines' }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json({ pipelines: result.pipelines })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
