import React, { useMemo } from "react"
import { Server, Container, BarChart3 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Spinner, LoadingSkeleton } from "@/components/Spinner"
import { useDashboard } from "@/hooks/useDashboard"
import { formatPercent, formatRelativeTime } from "@/utils/formatting"

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const variants: Record<string, string> = {
    up: "bg-emerald-900 text-emerald-200",
    down: "bg-red-900 text-red-200",
    running: "bg-emerald-900 text-emerald-200",
    stopped: "bg-slate-700 text-slate-300",
    failed: "bg-red-900 text-red-200",
    success: "bg-emerald-900 text-emerald-200",
    "in-progress": "bg-blue-900 text-blue-200",
  }

  return (
    <Badge className={variants[status] || "bg-slate-700 text-slate-300"}>
      {status}
    </Badge>
  )
}

const GaugeChart: React.FC<{ value: number; label: string }> = ({
  value,
  label,
}) => {
  const color = value > 80 ? "text-red-500" : value > 60 ? "text-yellow-500" : "text-emerald-500"

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-20 h-20 mb-2">
        <svg className="transform -rotate-90" viewBox="0 0 120 120">
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            className="text-slate-700"
          />
          <circle
            cx="60"
            cy="60"
            r="50"
            fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeDasharray={`${(value / 100) * 314} 314`}
            className={color}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{value}%</span>
        </div>
      </div>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  )
}

export const DashboardScreen: React.FC = () => {
  const { servers, containers, deployments, isLoading, error, refetch } =
    useDashboard()

  const stats = useMemo(() => {
    const total = servers.length
    const up = servers.filter((s) => s.status === "up").length
    const running = containers.filter((c) => c.status === "running").length
    const successful = deployments.filter((d) => d.status === "success").length

    return { total, up, running, successful }
  }, [servers, containers, deployments])

  if (isLoading && servers.length === 0) {
    return (
      <div className="space-y-4">
        <LoadingSkeleton className="h-40" />
        <LoadingSkeleton className="h-40" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 rounded-lg bg-red-900/20 border border-red-800 text-red-200">
          {error}
        </div>
      )}

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Servers</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Server className="w-8 h-8 text-primary-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Servers UP</p>
                <p className="text-2xl font-bold text-emerald-400">{stats.up}</p>
              </div>
              <Server className="w-8 h-8 text-emerald-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Containers</p>
                <p className="text-2xl font-bold">{stats.running}</p>
              </div>
              <Container className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Deployments</p>
                <p className="text-2xl font-bold text-emerald-400">
                  {stats.successful}
                </p>
              </div>
              <BarChart3 className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servers */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Servers</CardTitle>
        </CardHeader>
        <CardContent>
          {servers.length === 0 ? (
            <p className="text-slate-400">No servers available</p>
          ) : (
            <div className="space-y-4">
              {servers.map((server) => (
                <div key={server.id} className="border border-slate-700 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold">{server.name}</h3>
                      <p className="text-xs text-slate-400">
                        Uptime: {server.uptime}
                      </p>
                    </div>
                    <StatusBadge status={server.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <GaugeChart value={server.cpu} label="CPU" />
                    <GaugeChart
                      value={Math.round((server.ram.used / server.ram.total) * 100)}
                      label="RAM"
                    />
                    <GaugeChart
                      value={Math.round((server.disk.used / server.disk.total) * 100)}
                      label="Disk"
                    />
                  </div>

                  <p className="text-xs text-slate-400 mt-3">
                    Last checked: {formatRelativeTime(server.lastChecked)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Deployments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Deployments</CardTitle>
        </CardHeader>
        <CardContent>
          {deployments.length === 0 ? (
            <p className="text-slate-400">No deployments</p>
          ) : (
            <div className="space-y-2">
              {deployments.slice(0, 5).map((deployment) => (
                <div
                  key={deployment.id}
                  className="flex items-center justify-between p-3 border border-slate-700 rounded"
                >
                  <div>
                    <p className="font-sm text-slate-200">{deployment.name}</p>
                    <p className="text-xs text-slate-400">
                      {formatRelativeTime(deployment.timestamp)}
                    </p>
                  </div>
                  <StatusBadge status={deployment.status} />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
