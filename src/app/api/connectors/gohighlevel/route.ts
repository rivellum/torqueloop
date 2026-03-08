import { NextRequest, NextResponse } from 'next/server'

/**
 * GoHighLevel CRM Connector
 *
 * OAuth2 flow: https://marketplace.gohighlevel.com/
 * API docs: https://developers.gohighlevel.com/
 *
 * Endpoints used:
 * - GET /contacts - Read leads
 * - POST /contacts - Create leads from TorqueLoop
 * - GET /opportunities - Read pipeline deals
 * - POST /opportunities - Write outcomes back
 * - GET /pipelines - List pipelines for mapping
 */

const GHL_API_BASE = 'https://services.leadconnectorhq.com'

interface GHLConfig {
  access_token: string
  location_id: string
}

// OAuth callback handler
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (code) {
    // Exchange authorization code for access token
    try {
      const tokenResponse = await fetch(`${GHL_API_BASE}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: process.env.GHL_CLIENT_ID || '',
          client_secret: process.env.GHL_CLIENT_SECRET || '',
          grant_type: 'authorization_code',
          code,
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/connectors/gohighlevel`,
        }),
      })

      if (!tokenResponse.ok) {
        return NextResponse.json({ error: 'OAuth token exchange failed' }, { status: 400 })
      }

      const tokens = await tokenResponse.json()

      // In production: store tokens in Supabase linked to workspace
      return NextResponse.json({
        success: true,
        message: 'GoHighLevel connected successfully',
        location_id: tokens.locationId,
        // Never return the actual tokens to the client
      })
    } catch (error) {
      return NextResponse.json({ error: 'Connection failed' }, { status: 500 })
    }
  }

  // Return connector info
  return NextResponse.json({
    connector: 'gohighlevel',
    name: 'GoHighLevel',
    status: 'available',
    auth_type: 'oauth2',
    capabilities: [
      'read_contacts',
      'write_contacts',
      'read_opportunities',
      'write_opportunities',
      'read_pipelines',
      'webhook_events',
    ],
    oauth_url: `https://marketplace.gohighlevel.com/oauth/chooselocation?response_type=code&redirect_uri=${encodeURIComponent(process.env.NEXT_PUBLIC_APP_URL + '/api/connectors/gohighlevel')}&client_id=${process.env.GHL_CLIENT_ID}&scope=contacts.readonly contacts.write opportunities.readonly opportunities.write`,
  })
}

// Sync data to/from GoHighLevel
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, workspace_id, data } = body

    // In production: fetch GHL tokens from Supabase for this workspace
    const config: GHLConfig = {
      access_token: '', // Retrieved from DB
      location_id: '',  // Retrieved from DB
    }

    switch (action) {
      case 'sync_lead': {
        // Push a TorqueLoop lead to GHL as a contact
        const response = await fetch(`${GHL_API_BASE}/contacts/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.access_token}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify({
            locationId: config.location_id,
            name: data.name,
            email: data.email,
            phone: data.phone,
            source: 'TorqueLoop',
            tags: ['torqueloop', data.campaign_name].filter(Boolean),
            customField: {
              torqueloop_campaign_id: data.campaign_id,
              torqueloop_channel: data.channel,
              utm_source: data.utm_source,
              utm_medium: data.utm_medium,
              utm_campaign: data.utm_campaign,
            },
          }),
        })

        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to sync lead to GoHighLevel' }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json({ success: true, ghl_contact_id: result.contact?.id })
      }

      case 'sync_outcome': {
        // Write an outcome (hire, sale, etc.) back as an opportunity
        const response = await fetch(`${GHL_API_BASE}/opportunities/`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${config.access_token}`,
            'Content-Type': 'application/json',
            'Version': '2021-07-28',
          },
          body: JSON.stringify({
            pipelineId: data.pipeline_id,
            locationId: config.location_id,
            name: `TorqueLoop: ${data.outcome_type}`,
            stageId: data.stage_id,
            contactId: data.ghl_contact_id,
            monetaryValue: data.value,
            source: 'TorqueLoop',
          }),
        })

        if (!response.ok) {
          return NextResponse.json({ error: 'Failed to sync outcome to GoHighLevel' }, { status: 500 })
        }

        const result = await response.json()
        return NextResponse.json({ success: true, opportunity_id: result.opportunity?.id })
      }

      case 'list_pipelines': {
        const response = await fetch(`${GHL_API_BASE}/opportunities/pipelines?locationId=${config.location_id}`, {
          headers: {
            'Authorization': `Bearer ${config.access_token}`,
            'Version': '2021-07-28',
          },
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
