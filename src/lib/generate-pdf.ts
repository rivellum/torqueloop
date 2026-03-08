"use client"
import { OnboardingState, SevenSins } from '@/types/onboarding'

const SIN_LABELS: Record<SevenSins, string> = {
  greed: 'Greed', pride: 'Pride', envy: 'Envy', lust: 'Desire',
  wrath: 'Frustration', sloth: 'Ease', gluttony: 'Abundance'
}

const GOAL_LABELS: Record<string, string> = {
  hire: 'Recruit / Hire', sales: 'Close Sales', leads: 'Generate Leads',
  revenue: 'Grow Revenue', signups: 'Get Signups', brand: 'Build Brand',
}

const TIMELINE_LABELS: Record<string, string> = {
  '1_week': 'This week', '2_weeks': 'Next 2 weeks', '1_month': 'This month',
  '3_months': 'Next quarter', '6_months': '6 months', '1_year': 'This year',
}

const BUDGET_LABELS: Record<string, string> = {
  under_500: 'Under $500/mo', '500_2k': '$500 – $2,000/mo', '2k_5k': '$2,000 – $5,000/mo',
  '5k_10k': '$5,000 – $10,000/mo', '10k_plus': '$10,000+/mo', unsure: 'Not sure yet',
}

function fmt(map: Record<string, string>, val: string | undefined) {
  if (!val) return '—'
  return map[val] || val.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
}

/**
 * Generates a strategy brief PDF using browser-native canvas + jsPDF-like approach.
 * Since we can't use server-side PDF libs in a client component, we generate an HTML
 * string and open it as a printable page that the user can "Print to PDF".
 */
export function generateStrategyBriefHTML(state: OnboardingState): string {
  const activeTriggers = state.messaging.emotional_triggers.filter(t => t.intensity > 5)
  const personas = [...(state.personas.current || []), ...(state.personas.ideal || [])]
  const allocatedChannels = Object.entries(state.strategy.budget_split || {}).filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1])
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>TorqueLoop Strategy Brief</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'DM Sans', system-ui, sans-serif; color: #1e293b; background: white; padding: 40px; max-width: 800px; margin: 0 auto; }
  @media print { body { padding: 20px; } .no-print { display: none !important; } }

  .cover { text-align: center; padding: 80px 0 60px; border-bottom: 3px solid #2563eb; margin-bottom: 40px; }
  .cover h1 { font-size: 36px; font-weight: 700; color: #1e3a5f; margin-bottom: 8px; }
  .cover .subtitle { font-size: 18px; color: #64748b; margin-bottom: 4px; }
  .cover .date { font-size: 14px; color: #94a3b8; }

  .section { margin-bottom: 32px; }
  .section-title { font-size: 18px; font-weight: 700; color: #1e3a5f; margin-bottom: 12px; padding-bottom: 8px; border-bottom: 2px solid #e2e8f0; display: flex; align-items: center; gap: 8px; }
  .section-title::before { content: ''; width: 4px; height: 20px; background: #2563eb; border-radius: 2px; }

  .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px; }
  .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 12px 16px; }
  .stat-label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin-bottom: 4px; }
  .stat-value { font-size: 15px; font-weight: 600; }

  .persona-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; margin-bottom: 12px; }
  .persona-name { font-weight: 600; font-size: 15px; margin-bottom: 4px; }
  .persona-meta { font-size: 12px; color: #64748b; margin-bottom: 8px; }
  .persona-detail { font-size: 13px; margin-bottom: 4px; }
  .persona-detail strong { color: #475569; }

  .trigger-row { display: flex; align-items: center; gap: 12px; padding: 8px 0; border-bottom: 1px solid #f1f5f9; }
  .trigger-badge { background: #2563eb; color: white; font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px; white-space: nowrap; }
  .trigger-msg { font-size: 13px; color: #475569; flex: 1; }
  .trigger-intensity { font-size: 12px; font-weight: 600; color: #2563eb; white-space: nowrap; }

  .channel-row { display: flex; align-items: center; gap: 12px; padding: 10px 0; border-bottom: 1px solid #f1f5f9; }
  .channel-name { font-weight: 500; font-size: 14px; flex: 1; }
  .channel-bar-wrap { width: 120px; height: 8px; background: #e2e8f0; border-radius: 4px; overflow: hidden; }
  .channel-bar { height: 100%; background: #2563eb; border-radius: 4px; }
  .channel-pct { font-size: 13px; font-weight: 600; width: 40px; text-align: right; }

  .split-visual { display: flex; height: 24px; border-radius: 12px; overflow: hidden; margin: 12px 0; }
  .split-organic { background: #10b981; }
  .split-paid { background: #3b82f6; }
  .split-labels { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 16px; }

  .footer { text-align: center; padding-top: 24px; border-top: 1px solid #e2e8f0; margin-top: 40px; font-size: 12px; color: #94a3b8; }

  .print-btn { position: fixed; bottom: 24px; right: 24px; background: #2563eb; color: white; border: none; padding: 12px 24px; border-radius: 8px; font-size: 14px; font-weight: 600; cursor: pointer; box-shadow: 0 4px 12px rgba(37,99,235,0.3); z-index: 100; }
  .print-btn:hover { background: #1d4ed8; }
</style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Download as PDF</button>

  <div class="cover">
    <h1>TorqueLoop Strategy Brief</h1>
    <div class="subtitle">AI-Generated Marketing Strategy</div>
    <div class="date">Generated on ${date}</div>
  </div>

  <div class="section">
    <div class="section-title">Goals & Parameters</div>
    <div class="grid">
      <div class="stat-card"><div class="stat-label">Primary Goal</div><div class="stat-value">${fmt(GOAL_LABELS, state.goals.primary)}</div></div>
      <div class="stat-card"><div class="stat-label">Timeline</div><div class="stat-value">${fmt(TIMELINE_LABELS, state.goals.timeline)}</div></div>
      <div class="stat-card"><div class="stat-label">Monthly Budget</div><div class="stat-value">${fmt(BUDGET_LABELS, state.goals.budget_range)}</div></div>
      <div class="stat-card"><div class="stat-label">Tracking System</div><div class="stat-value">${state.tracking.system ? state.tracking.system.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'None'}</div></div>
    </div>
  </div>

  ${state.outcomes.type ? `
  <div class="section">
    <div class="section-title">Outcome Definition</div>
    <div class="grid">
      <div class="stat-card"><div class="stat-label">Outcome Type</div><div class="stat-value">${state.outcomes.type === 'custom' ? state.outcomes.custom_label : state.outcomes.type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</div></div>
      <div class="stat-card"><div class="stat-label">Target / Month</div><div class="stat-value">${state.outcomes.target_per_month || '—'}</div></div>
      <div class="stat-card"><div class="stat-label">Value per Outcome</div><div class="stat-value">${state.outcomes.value_per_outcome ? '$' + state.outcomes.value_per_outcome.toLocaleString() : '—'}</div></div>
      <div class="stat-card"><div class="stat-label">Max Cost per Outcome</div><div class="stat-value">${state.outcomes.max_cost_per_outcome ? '$' + state.outcomes.max_cost_per_outcome.toLocaleString() : '—'}</div></div>
    </div>
  </div>` : ''}

  ${personas.length > 0 ? `
  <div class="section">
    <div class="section-title">Target Personas (${personas.length})</div>
    ${personas.map(p => `
      <div class="persona-card">
        <div class="persona-name">${p.name || 'Unnamed Persona'}</div>
        <div class="persona-meta">${[p.age_range, p.occupation, p.location].filter(Boolean).join(' · ')}</div>
        ${p.pain_points.length > 0 ? `<div class="persona-detail"><strong>Pain points:</strong> ${p.pain_points.join(', ')}</div>` : ''}
        ${p.desires.length > 0 ? `<div class="persona-detail"><strong>Desires:</strong> ${p.desires.join(', ')}</div>` : ''}
        ${p.media_habits?.length > 0 ? `<div class="persona-detail"><strong>Media habits:</strong> ${p.media_habits.join(', ')}</div>` : ''}
      </div>
    `).join('')}
  </div>` : ''}

  <div class="section">
    <div class="section-title">Messaging Strategy</div>
    <div style="margin-bottom: 12px;">
      <span style="font-size: 13px; color: #64748b;">Brand tone:</span>
      <span style="font-size: 15px; font-weight: 600; margin-left: 8px; text-transform: capitalize;">${state.messaging.tone || 'Not set'}</span>
    </div>
    ${activeTriggers.length > 0 ? activeTriggers.map(t => `
      <div class="trigger-row">
        <span class="trigger-badge">${SIN_LABELS[t.sin]} (${t.intensity}/10)</span>
        <span class="trigger-msg">${t.message || 'No message set'}</span>
      </div>
    `).join('') : '<p style="font-size: 13px; color: #94a3b8;">No active emotional triggers configured.</p>'}
  </div>

  <div class="section">
    <div class="section-title">Channel Strategy</div>
    <div class="split-visual">
      <div class="split-organic" style="width: ${state.strategy.organic_vs_paid}%"></div>
      <div class="split-paid" style="width: ${100 - state.strategy.organic_vs_paid}%"></div>
    </div>
    <div class="split-labels">
      <span style="color: #10b981; font-weight: 600;">${state.strategy.organic_vs_paid}% Organic</span>
      <span style="color: #3b82f6; font-weight: 600;">${100 - state.strategy.organic_vs_paid}% Paid</span>
    </div>
    ${allocatedChannels.length > 0 ? allocatedChannels.map(([ch, pct]) => `
      <div class="channel-row">
        <span class="channel-name">${ch.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</span>
        <div class="channel-bar-wrap"><div class="channel-bar" style="width: ${pct * 2}%"></div></div>
        <span class="channel-pct">${pct}%</span>
      </div>
    `).join('') : '<p style="font-size: 13px; color: #94a3b8;">No channels allocated yet.</p>'}
  </div>

  <div class="footer">
    <p>TorqueLoop Strategy Brief · Generated by AI · ${date}</p>
    <p style="margin-top: 4px;">Rivellum LLC · torqueloop.com</p>
  </div>
</body>
</html>`
}
