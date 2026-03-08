import { NextRequest, NextResponse } from 'next/server'

/**
 * HubSpot CRM Connector
 *
 * OAuth2: https://developers.hubspot.com/docs/api/oauth-quickstart-guide
 * API docs: https://developers.hubspot.com/docs/api/crm/contacts
 *
 * Endpoints:
 * - POST /crm/v3/objects/contacts - Create contacts
 * - GET /crm/v3/objects/contacts - List contacts
 * - POST /crm/v3/objects/deals - Create deals (outcomes)
 * - GET /crm/v3/pipelines/deals - List pipelines
 */

const HUBSPOT_API = 'https://api.hubapi.com'

// OAuth callback
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    try {
      const tokenResponse = await fetch('https://api.hubapi.com/oauth/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: process.env.HUBSPOT_CLIENT_ID || '',
          client_secret: process.env.HUBSPOT_CLIENT_SECRET || '',
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/connectors/hubspot`,
          code,
        }),
      })

      if (!tokenResponse.ok) {
        return NextResponse.json({ error: 'HubSpot OAuth failed' }, { status: 400 })
      }

      const tokens = await tokenResponse.json()
      // Store tokens in Supabase for the workspace
      return NextResponse.json({ success: true, message: 'HubSpot connected' })
    } catch (error) {
      return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
    }
  }

  return NextResponse.json({
    connector: 'hubspot',
    name: 'HubSpot',
    status: 'available',
    auth_type: 'oauth2',
    capabilities: ['read_contacts', 'write_contacts', 'read_deals', 'write_deals', 'read_pipelines'],
    oauth_url: `https://app.hubspot.com/oauth/authorize?client_id=${process.env.HUBSPOT_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/api/connectors/hubspot')}&scope=crm.objects.contacts.read%20crm.objects.contacts.write%20crm.objects.deals.read%20crm.objects.deals.write`,
  })
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body
    const access_token = '' // Retrieved from DB in production

    const headers = {
      'Authorization': `Bearer ${access_token}`,
      'Content-Type': 'application/json',
    }

    switch (action) {
      case 'sync_lead': {
        const response = await fetch(`${HUBSPOT_API}/crm/v3/objects/contacts`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            properties: {
              firstname: data.first_name || data.name?.split(' ')[0] || '',
              lastname: data.last_name || data.name?.split(' ').slice(1).join(' ') || '',
              email: data.email,
              phone: data.phone,
              hs_lead_status: 'NEW',
              torqueloop_campaign: data.campaign_name,
              torqueloop_channel: data.channel,
            },
          }),
        })

        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to sync to HubSpot' }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json({ success: true, hubspot_id: result.id })
      }

      case 'sync_outcome': {
        const response = await fetch(`${HUBSPOT_API}/crm/v3/objects/deals`, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            properties: {
              dealname: `TorqueLoop: ${data.outcome_type}`,
              amount: String(data.value),
              pipeline: 'default',
              dealstage: data.stage || 'closedwon',
            },
          }),
        })

        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to sync outcome' }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json({ success: true, deal_id: result.id })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
