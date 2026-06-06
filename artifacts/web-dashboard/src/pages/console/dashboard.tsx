import { useGetStats, getGetStatsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Send, AlertTriangle, Clock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { name: 'Mon', sent: 4000 },
  { name: 'Tue', sent: 3000 },
  { name: 'Wed', sent: 2000 },
  { name: 'Thu', sent: 2780 },
  { name: 'Fri', sent: 1890 },
  { name: 'Sat', sent: 2390 },
  { name: 'Sun', sent: 3490 },
];

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStats({
    query: { queryKey: getGetStatsQueryKey() }
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono mb-2">TELEMETRY_</h1>
        <p className="text-muted-foreground">System-wide delivery statistics and health overview.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Processed"
          value={stats?.total}
          icon={Activity}
          loading={isLoading}
        />
        <StatCard
          title="Delivered"
          value={stats?.sent}
          icon={Send}
          loading={isLoading}
          valueClass="text-emerald-500"
        />
        <StatCard
          title="Failed"
          value={stats?.failed}
          icon={AlertTriangle}
          loading={isLoading}
          valueClass="text-destructive"
        />
        <StatCard
          title="In Queue"
          value={stats?.queued}
          icon={Clock}
          loading={isLoading}
          valueClass="text-amber-500"
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-5 bg-card">
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground uppercase">Volume (7 Days)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSent" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'hsl(var(--popover))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--foreground))' }}
                    itemStyle={{ color: 'hsl(var(--primary))' }}
                  />
                  <Area type="monotone" dataKey="sent" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorSent)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 bg-card">
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground uppercase">Success Rate</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center h-[300px]">
            {isLoading ? (
              <Skeleton className="h-32 w-32 rounded-full" />
            ) : (
              <>
                <div className="text-6xl font-bold text-primary mb-4 tracking-tighter">
                  {stats?.successRate.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground text-center">
                  Of total volume processed successfully
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, loading, valueClass = "" }: {
  title: string;
  value?: number;
  icon: any;
  loading: boolean;
  valueClass?: string;
}) {
  return (
    <Card className="bg-card">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider font-mono">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        {loading ? (
          <Skeleton className="h-8 w-24" />
        ) : (
          <div className={`text-2xl font-bold font-mono ${valueClass}`}>
            {value?.toLocaleString() || 0}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
