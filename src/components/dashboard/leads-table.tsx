'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import type { Lead } from '@/types/database'

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  new:         { label: 'Nuevo',      variant: 'default' },
  contacted:   { label: 'Contactado', variant: 'secondary' },
  qualified:   { label: 'Calificado', variant: 'outline' },
  converted:   { label: 'Convertido', variant: 'default' },
  lost:        { label: 'Perdido',    variant: 'destructive' },
}

const STATUS_OPTIONS = [
  { value: 'all',        label: 'Todos' },
  { value: 'new',        label: 'Nuevo' },
  { value: 'contacted',  label: 'Contactado' },
  { value: 'qualified',  label: 'Calificado' },
  { value: 'converted',  label: 'Convertido' },
  { value: 'lost',       label: 'Perdido' },
]

const PAGE_SIZE = 10

interface LeadsTableProps {
  leads: Lead[]
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(0)

  // Filter in-memory (client-side v1)
  const filtered = useMemo(() => {
    let result = leads

    if (statusFilter !== 'all') {
      result = result.filter((l) => l.status === statusFilter)
    }

    if (search.trim()) {
      const term = search.trim().toLowerCase()
      result = result.filter(
        (l) =>
          (l.name ?? '').toLowerCase().includes(term) ||
          l.email.toLowerCase().includes(term)
      )
    }

    return result
  }, [leads, statusFilter, search])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  // Reset page on filter change
  function handleStatusChange(value: string) {
    setStatusFilter(value)
    setPage(0)
  }

  function handleSearchChange(value: string) {
    setSearch(value)
    setPage(0)
  }

  return (
    <div className="space-y-4">
      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar por nombre o email…"
            value={search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={handleStatusChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Estado" />
          </SelectTrigger>
          <SelectContent>
            {STATUS_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>Fuente</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Fecha</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                  {leads.length === 0
                    ? 'No hay leads aún. Los leads aparecerán aquí cuando se capturen.'
                    : 'No se encontraron resultados con los filtros actuales.'}
                </TableCell>
              </TableRow>
            ) : (
              pageRows.map((lead) => {
                const meta = STATUS_MAP[lead.status] ?? { label: lead.status, variant: 'outline' as const }
                return (
                  <TableRow key={lead.id}>
                    <TableCell className="font-medium">{lead.name ?? '—'}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell>{lead.phone ?? '—'}</TableCell>
                    <TableCell>{lead.source ?? '—'}</TableCell>
                    <TableCell>
                      <Badge variant={meta.variant}>{meta.label}</Badge>
                    </TableCell>
                    <TableCell>{formatDate(lead.created_at)}</TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {filtered.length > PAGE_SIZE && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {safePage * PAGE_SIZE + 1}–
            {Math.min((safePage + 1) * PAGE_SIZE, filtered.length)} de{' '}
            {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground">
              Página {safePage + 1} de {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages - 1}
              onClick={() => setPage((p) => p + 1)}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
