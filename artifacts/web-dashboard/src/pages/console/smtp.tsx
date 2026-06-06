import { useGetSmtpPool, getGetSmtpPoolQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Server, ZapOff, CheckCircle2, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDistanceToNow } from "date-fns";

export default function SmtpPage() {
  const { data, isLoading } = useGetSmtpPool({
    query: { queryKey: getGetSmtpPoolQueryKey() }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10"><CheckCircle2 className="w-3 h-3 mr-1" /> ACTIVE</Badge>;
      case "rate_limited":
        return <Badge variant="outline" className="border-amber-500/50 text-amber-500 bg-amber-500/10"><ZapOff className="w-3 h-3 mr-1" /> RATE LIMITED</Badge>;
      case "locked":
        return <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10"><Lock className="w-3 h-3 mr-1" /> LOCKED</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono mb-2">SMTP_POOL</h1>
        <p className="text-muted-foreground">Monitor the health and capacity of your distributed relay nodes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground uppercase">Active Nodes</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-3xl font-bold font-mono">
                {data?.activeCount} / {data?.nodes.length}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader>
            <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground uppercase">Total Remaining Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-3xl font-bold font-mono text-primary">
                {data?.totalCapacityRemaining.toLocaleString()}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Server className="w-4 h-4" /> Node Telemetry
          </CardTitle>
          <CardDescription>Individual relay account status and daily limits</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {isLoading ? (
              Array(3).fill(0).map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-48" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                </div>
              ))
            ) : data?.nodes.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No SMTP nodes configured in the pool.
              </div>
            ) : (
              data?.nodes.map((node) => {
                const percentUsed = (node.dailySentCount / node.maxDailyLimit) * 100;
                return (
                  <div key={node.id} className="p-4 border border-border rounded-lg bg-background/50 space-y-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                      <div className="flex items-center gap-3">
                        <div className="font-mono font-medium">{node.gmailUsername}</div>
                        {getStatusBadge(node.status)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Last used: {node.lastUsedTimestamp > 0 ? formatDistanceToNow(node.lastUsedTimestamp, { addSuffix: true }) : 'Never'}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-mono text-muted-foreground">
                        <span>{node.dailySentCount.toLocaleString()} sent</span>
                        <span>{node.maxDailyLimit.toLocaleString()} max</span>
                      </div>
                      <Progress value={percentUsed} className="h-2" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
