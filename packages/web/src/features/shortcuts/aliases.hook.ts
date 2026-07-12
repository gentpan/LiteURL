import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api.client'
import type { AliasRecord, PagedAliases, AliasSuggestion } from 'models'

export function useAliasList(size = 20, cursor?: string, opts?: { q?: string, sort?: string, tag?: string }) {
  const params = new URLSearchParams()
  params.set('size', String(size))
  if (cursor) params.set('cursor', cursor)
  if (opts?.q) params.set('q', opts.q)
  if (opts?.sort) params.set('sort', opts.sort)
  if (opts?.tag) params.set('tag', opts.tag)
  return useQuery<PagedAliases>({
    queryKey: ['aliases', 'list', size, cursor, opts?.q, opts?.sort, opts?.tag],
    queryFn: () => api(`/link/list?${params.toString()}`),
  })
}

export function useBatchRemoveAliases() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (aliases: string[]) => api('/link/batch-delete', { method: 'POST', body: { aliases } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aliases'] }),
  })
}

export function useAliasDetail(alias: string) {
  return useQuery<AliasRecord>({
    queryKey: ['aliases', 'detail', alias],
    queryFn: () => api(`/link/query?alias=${alias}`),
    enabled: !!alias,
  })
}

export function useAliasSearch() {
  return useQuery<AliasSuggestion[]>({
    queryKey: ['aliases', 'search'],
    queryFn: () => api('/link/search'),
  })
}

export function useCreateAlias() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AliasRecord>) => api('/link/create', { method: 'POST', body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aliases'] }),
  })
}

export function useEditAlias() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: Partial<AliasRecord>) => api('/link/edit', { method: 'PUT', body: data }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aliases'] }),
  })
}

export function useRemoveAlias() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (alias: string) => api('/link/delete', { method: 'POST', body: { alias } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['aliases'] }),
  })
}
