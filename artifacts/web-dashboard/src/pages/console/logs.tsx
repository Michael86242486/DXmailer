import { useState } from "react";
import { useListEmailLogs, getListEmailLogsQueryKey } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { Inbox, ChevronLeft, ChevronRight, AlertCircle, CheckCircle2, Clock } from "lucide-react";

export default function LogsPage() {
  const [page, setPage] = useState(0);
  const limit = 20;
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const queryParams = {
    limit,
    offset: page * limit,
    ...(statusFilter !== "all" && { status: statusFilter as any })
  };

  const { data, isLoading } = useListEmailLogs(queryParams, {
    query: { queryKey: getListEmailLogsQueryKey(queryParams) }
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "sent": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "failed": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "queued": return <Clock className="w-4 h-4 text-amber-500" />;
      default: return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono mb-2">DELIVERY_LOGS</h1>
          <p className="text-muted-foreground">Trace every transactional message passing through the engine.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setPage(0); }}>
            <SelectTrigger className="w-[180px] bg-card">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="sent">Sent</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Inbox className="w-4 h-4" /> Message Ledger
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="font-mono">Timestamp</TableHead>
                  <TableHead className="font-mono">Recipient</TableHead>
                  <TableHead className="font-mono">Template</TableHead>
                  <TableHead className="font-mono">Status</TableHead>
                  <TableHead className="font-mono">Error Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array(5).fill(0).map((_, i) => (
                    <TableRow key={i} className="border-border">
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))
                ) : data?.logs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      No logs found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  data?.logs.map((log) => (
                    <TableRow key={log.id} className="border-border">
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {format(new Date(log.createdAt), "yyyy-MM-dd HH:mm:ss")}
                      </TableCell>
                      <TableCell className="font-medium">{log.recipient}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="font-mono bg-background">
                          {log.templateUsed}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusIcon(log.status)}
                          <span className="capitalize text-sm font-medium">{log.status}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground max-w-[300px] truncate">
                        {log.errorMessage || "-"}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              {data && `Showing ${page * limit + 1} to ${Math.min((page + 1) * limit, data.total)} of ${data.total} logs`}
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0 || isLoading}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => p + 1)}
                disabled={!data || (page + 1) * limit >= data.total || isLoading}
              >
                Next <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
