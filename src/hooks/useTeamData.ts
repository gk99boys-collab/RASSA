import { useEffect, useState } from 'react'
import { FALLBACK_MEMBERS, FALLBACK_TEAM } from '../data/fallbackData'
import { connectPublic } from '../lib/connection'
import { MEMBER_COLUMNS } from '../lib/memberMedia'
import type { DataSource, Member, Team } from '../types'

interface TeamDataState {
  team: Team
  members: Member[]
  loading: boolean
  source: DataSource
}

const FETCH_TIMEOUT_MS = 6500

export function useTeamData(): TeamDataState {
  const [state, setState] = useState<TeamDataState>({
    team: FALLBACK_TEAM,
    members: FALLBACK_MEMBERS,
    loading: true,
    source: 'loading',
  })

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()
    const timeoutId = window.setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)

    async function load() {
      try {
        const client = await connectPublic()
        if (cancelled) return
        const [teamRes, membersRes] = await Promise.all([
          client
            .from('team')
            .select('id, name, tagline, description, achievement_text, links')
            .limit(1)
            .abortSignal(controller.signal)
            .maybeSingle(),
          client
            .from('members')
            .select(MEMBER_COLUMNS)
            .order('sort_order', { ascending: true })
            .abortSignal(controller.signal)
            .overrideTypes<Member[], { merge: false }>(),
        ])

        if (cancelled) return

        const teamData = !teamRes.error ? teamRes.data : null
        const membersData =
          !membersRes.error && Array.isArray(membersRes.data) ? membersRes.data : null

        const resolvedTeam: Team =
          teamData && teamData.name
            ? {
                id: String(teamData.id),
                name: teamData.name || FALLBACK_TEAM.name,
                tagline: teamData.tagline || FALLBACK_TEAM.tagline,
                description: teamData.description || FALLBACK_TEAM.description,
                achievement_text: teamData.achievement_text || FALLBACK_TEAM.achievement_text,
                links: teamData.links ?? [],
              }
            : FALLBACK_TEAM

        const resolvedMembers: Member[] =
          membersData !== null
            ? membersData.map((row) => ({
                id: String(row.id),
                sort_order: Number(row.sort_order) || 0,
                name: row.name || '',
                role: row.role || '',
                skills: Array.isArray(row.skills) ? row.skills.filter(Boolean) : [],
                bio: row.bio || '',
                photo_url: row.photo_url ?? null,
                media: row.media ?? null,
                links: row.links ?? [],
                education: row.education ?? undefined,
                experience: row.experience ?? undefined,
              }))
            : FALLBACK_MEMBERS

        setState({
          team: resolvedTeam,
          members: resolvedMembers,
          loading: false,
          source:
            (teamData && teamData.name) || membersData !== null
              ? 'supabase'
              : 'fallback',
        })
      } catch {
        if (cancelled) return
        setState({
          team: FALLBACK_TEAM,
          members: FALLBACK_MEMBERS,
          loading: false,
          source: 'fallback',
        })
      } finally {
        window.clearTimeout(timeoutId)
      }
    }

    void load()

    return () => {
      cancelled = true
      window.clearTimeout(timeoutId)
      controller.abort()
    }
  }, [])

  return state
}
