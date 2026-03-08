"use client"
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { OnboardingState } from '@/types/onboarding'
import { Link2, Check, ExternalLink } from 'lucide-react'

interface Props {
  state: OnboardingState
  update: (v: Partial<OnboardingState['tracking']>) => void
}

const TRACKING_SYSTEMS = [
  { id: 'hubspot', name: 'HubSpot', category: 'CRM', color: 'bg-orange-500', connectType: 'oauth' },
  { id: 'salesforce', name: 'Salesforce', category: 'CRM', color: 'bg-blue-600', connectType: 'oauth' },
  { id: 'airtable', name: 'Airtable', category: 'Database', color: 'bg-yellow-500', connectType: 'api_key' },
  { id: 'google_sheets', name: 'Google Sheets', category: 'Spreadsheet', color: 'bg-green-600', connectType: 'oauth' },
  { id: 'notion', name: 'Notion', category: 'Workspace', color: 'bg-zinc-800', connectType: 'oauth' },
  { id: 'pipedrive', name: 'Pipedrive', category: 'CRM', color: 'bg-emerald-600', connectType: 'api_key' },
  { id: 'monday', name: 'Monday.com', category: 'Project Mgmt', color: 'bg-red-500', connectType: 'oauth' },
  { id: 'other', name: 'Other', category: "Tell us what you use", color: 'bg-violet-500', connectType: 'text' },
  { id: 'none', name: "I don't have one yet", category: "We'll create one", color: 'bg-primary', connectType: 'none' },
]

export function StepTracking({ state, update }: Props) {
  const selected = state.tracking.system
  const selectedSys = TRACKING_SYSTEMS.find(s => s.id === selected)

  return (
    <div className="space-y-8">
      <div>
        <Label className="text-base font-semibold mb-2 block">
          Where do you currently track your business goals?
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          We'll sync your outcomes bidirectionally — TorqueLoop writes results back to your system so you always have one source of truth.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TRACKING_SYSTEMS.map(sys => {
            const isSelected = selected === sys.id

            return (
              <button
                key={sys.id}
                onClick={() => update({ system: sys.id, connected: false, details: '' })}
                className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary/20'
                    : 'border-border hover:border-primary/30'
                }`}
              >
                <div className={`w-9 h-9 rounded-lg ${sys.color} flex items-center justify-center shrink-0`}>
                  <span className="text-white text-xs font-bold">
                    {sys.name.charAt(0)}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="font-medium text-sm">{sys.name}</div>
                  <div className="text-xs text-muted-foreground">{sys.category}</div>
                </div>
                {isSelected && (
                  <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-primary-foreground" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Other — free text */}
      {selected === 'other' && (
        <div className="p-5 rounded-xl border border-dashed border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">Which tool do you use?</div>
              <p className="text-xs text-muted-foreground mb-3">
                Tell us what you're using and we'll do our best to support it or build you a manual sync workflow.
              </p>
              <Input
                placeholder="E.g., Zoho CRM, Close.io, custom spreadsheet..."
                value={state.tracking.details}
                onChange={(e) => update({ details: e.target.value })}
                className="max-w-sm"
              />
            </div>
          </div>
        </div>
      )}

      {/* OAuth / API key connection prompt */}
      {selected && selected !== 'none' && selected !== 'other' && (
        <div className="p-5 rounded-xl border border-dashed border-primary/30 bg-primary/5">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Link2 className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1">
              <div className="font-medium text-sm mb-1">
                Connect {selectedSys?.name}
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                {selectedSys?.connectType === 'oauth'
                  ? "Click below to authorize TorqueLoop to read and write to your account. We'll only access the data needed for goal tracking."
                  : "Enter your API key below. We'll use it to sync your goal outcomes bidirectionally."
                }
              </p>

              {selectedSys?.connectType === 'api_key' ? (
                <Input
                  placeholder="Paste your API key here"
                  type="password"
                  value={state.tracking.details}
                  onChange={(e) => update({ details: e.target.value })}
                  className="max-w-sm"
                />
              ) : (
                <button className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                  <ExternalLink className="w-3.5 h-3.5" />
                  Connect with OAuth
                </button>
              )}

              {state.tracking.connected && (
                <Badge variant="default" className="mt-3 bg-green-600">
                  <Check className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {selected === 'none' && (
        <div className="p-5 rounded-xl border bg-muted/50">
          <p className="text-sm text-muted-foreground">
            No problem — we'll create a tracking dashboard for you inside TorqueLoop. You'll be able to log outcomes manually or export to any system later.
          </p>
        </div>
      )}
    </div>
  )
}
