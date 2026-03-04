"use client"
import { useState, useEffect, useCallback } from "react"
import { apiClient } from "@/lib/api"

export interface LinkedRepo {
  name: string
  local_path: string
  github_url: string
  branch: string
  changed_files: {
    staged: string[]
    modified: string[]
    untracked: string[]
  }
  sync: {
    state: "synced" | "ahead" | "behind" | "diverged"
    ahead: number
    behind: number
  }
  health: {
    passing: boolean
    error_count: number
    errors: string[]
  }
  risk: {
    risk_level: string
    risk_probability: number
  }
  ready_to_commit: boolean
}

export function useRepoManager() {
  const [repos, setRepos] = useState<LinkedRepo[]>([])
  const [loading, setLoading] = useState(true)

  const fetchRepos = useCallback(async () => {
    try {
      const r = await apiClient.get("/local/repos")
      setRepos(r.data.repos || [])
    } catch {
      // Backend may not be running
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRepos()
    const interval = setInterval(fetchRepos, 5000)
    return () => clearInterval(interval)
  }, [fetchRepos])

  const linkRepo = async (name: string, localPath: string, githubUrl: string) => {
    const r = await apiClient.post("/local/repos/link", {
      name, local_path: localPath, github_url: githubUrl
    })
    await fetchRepos()
    return r.data
  }

  const unlinkRepo = async (localPath: string) => {
    await apiClient.delete("/local/repos/unlink", { params: { local_path: localPath } })
    await fetchRepos()
  }

  const commitRepo = async (localPath: string, message: string) => {
    const r = await apiClient.post("/local/repos/commit", {
      local_path: localPath, message
    })
    await fetchRepos()
    return r.data
  }

  return { repos, loading, linkRepo, unlinkRepo, commitRepo, refresh: fetchRepos }
}
