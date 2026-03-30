'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { createSupabaseBrowserClient } from '@/lib/supabase-browser'

interface ApprovalActionsProps {
  creativeId: string
  workspaceId: string
  currentStatus: string
}

type ActionType = 'approve' | 'reject' | 'revision'

export function ApprovalActions({ creativeId, workspaceId, currentStatus }: ApprovalActionsProps) {
  const router = useRouter()
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [pendingAction, setPendingAction] = useState<ActionType | null>(null)

  const openConfirm = (action: ActionType) => {
    setPendingAction(action)
    setDialogOpen(true)
  }

  const handleAction = async () => {
    if (!pendingAction) return
    if (pendingAction !== 'approve' && !comment.trim()) return

    setIsSubmitting(true)
    const supabase = createSupabaseBrowserClient()

    const approvalStatus =
      pendingAction === 'approve'
        ? 'approved'
        : pendingAction === 'reject'
          ? 'rejected'
          : 'revision_requested'

    const creativeStatus =
      pendingAction === 'approve' ? 'approved' : pendingAction === 'reject' ? 'review' : 'review'

    try {
      // Update approval queue
      await supabase
        .from('approval_queue')
        .update({
          status: approvalStatus,
          comments: comment.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq('creative_id', creativeId)
        .eq('workspace_id', workspaceId)

      // Update creative status
      await supabase
        .from('creatives')
        .update({
          status: creativeStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', creativeId)
        .eq('workspace_id', workspaceId)

      setDialogOpen(false)
      setComment('')
      router.refresh()
    } catch (error) {
      console.error('Error updating approval:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const dialogConfig: Record<ActionType, { title: string; description: string; confirmText: string }> = {
    approve: {
      title: 'Aprobar Creativo',
      description: '¿Estás seguro de que deseas aprobar este creativo?',
      confirmText: 'Confirmar Aprobación',
    },
    reject: {
      title: 'Rechazar Creativo',
      description: 'Indica el motivo del rechazo:',
      confirmText: 'Confirmar Rechazo',
    },
    revision: {
      title: 'Solicitar Cambios',
      description: 'Describe los cambios necesarios:',
      confirmText: 'Enviar Solicitud',
    },
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Acciones</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={() => openConfirm('approve')}
            className="bg-green-600 hover:bg-green-700"
            disabled={currentStatus === 'approved'}
          >
            Aprobar
          </Button>
          <Button onClick={() => openConfirm('reject')} variant="destructive">
            Rechazar
          </Button>
          <Button
            onClick={() => openConfirm('revision')}
            className="border-yellow-500 bg-yellow-50 text-yellow-700 hover:bg-yellow-100"
            variant="outline"
          >
            Solicitar Cambios
          </Button>
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {pendingAction ? dialogConfig[pendingAction].title : ''}
              </DialogTitle>
              <DialogDescription>
                {pendingAction ? dialogConfig[pendingAction].description : ''}
              </DialogDescription>
            </DialogHeader>

            {pendingAction !== 'approve' && (
              <Textarea
                placeholder={
                  pendingAction === 'reject'
                    ? 'Motivo del rechazo (obligatorio)...'
                    : 'Describe los cambios necesarios (obligatorio)...'
                }
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
              />
            )}

            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAction}
                disabled={
                  isSubmitting || (pendingAction !== 'approve' && !comment.trim())
                }
                className={
                  pendingAction === 'approve'
                    ? 'bg-green-600 hover:bg-green-700'
                    : pendingAction === 'reject'
                      ? 'bg-red-600 hover:bg-red-700'
                      : 'bg-yellow-600 hover:bg-yellow-700'
                }
              >
                {isSubmitting
                  ? 'Enviando...'
                  : pendingAction
                    ? dialogConfig[pendingAction].confirmText
                    : 'Confirmar'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}
