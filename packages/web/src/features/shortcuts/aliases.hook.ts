import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '../../shared/api.client'
import type { AliasRecord, PagedAliases, AliasSuggestion } from 'models'

export function useAliasList(size = 20, cursor?: string) {
  return useQuery<PagedAliases>({
    queryKey: ['aliases', 'list', size, cursor],
    queryFn: () => api(`/link/list?size=${size}${cursor ? `&cursor=${cursor}` : ''}`),
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
