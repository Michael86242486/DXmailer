import { useState } from "react";
import { 
  useListWebhooks, 
  getListWebhooksQueryKey, 
  useCreateWebhook,
  useDeleteWebhook,
  useTestWebhook
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Webhook, Trash2, Activity, Plus, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export default function WebhooksPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const { data, isLoading } = useListWebhooks({
    query: { queryKey: getListWebhooksQueryKey() }
  });

  const createWebhook = useCreateWebhook();
  const deleteWebhook = useDeleteWebhook();
  const testWebhook = useTestWebhook();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newUrl, setNewUrl] = useState("");
  const [selectedEvents, setSelectedEvents] = useState<string[]>(["email.sent", "email.failed"]);

  const handleCreate = () => {
    if (!newUrl) return;
    createWebhook.mutate({ data: { url: newUrl, events: selectedEvents as any } }, {
      onSuccess: () => {
        toast({ title: "Webhook registered successfully." });
        setIsCreateOpen(false);
        setNewUrl("");
        queryClient.invalidateQueries({ queryKey: getListWebhooksQueryKey() });
      },
      onError: () => toast({ title: "Failed to register webhook", variant: "destructive" })
    });
  };

  const handleDelete = (id: string) => {
    deleteWebhook.mutate({ id }, {
      onSuccess: () => {
        toast({ title: "Webhook deleted." });
        queryClient.invalidateQueries({ queryKey: getListWebhooksQueryKey() });
      }
    });
  };

  const handleTest = (id: string) => {
    testWebhook.mutate({ id }, {
      onSuccess: (res) => {
        toast({ 
          title: "Test ping fired", 
          description: res.message 
        });
      }
    });
  };

  const toggleEvent = (event: string) => {
    setSelectedEvents(prev => 
      prev.includes(event) 
        ? prev.filter(e => e !== event)
        : [...prev, event]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight font-mono mb-2">WEBHOOKS</h1>
          <p className="text-muted-foreground">Receive real-time HTTP callbacks for email delivery events.</p>
        </div>
        
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button className="font-mono">
              <Plus className="w-4 h-4 mr-2" />
              Add Endpoint
            </Button>
          </DialogTrigger>
          <DialogContent className="border-border bg-card">
            <DialogHeader>
              <DialogTitle className="font-mono">Register Webhook</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Payload URL</Label>
                <Input 
                  placeholder="https://api.yourdomain.com/webhooks/oraclex" 
                  value={newUrl}
                  onChange={(e) => setNewUrl(e.target.value)}
                  className="font-mono text-sm bg-background"
                />
              </div>
              <div className="space-y-3">
                <Label>Events to subscribe</Label>
                <div className="space-y-2 border border-border p-4 rounded-md bg-background/50">
                  {["email.queued", "email.sent", "email.failed"].map((ev) => (
                    <div key={ev} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`event-${ev}`} 
                        checked={selectedEvents.includes(ev)}
                        onCheckedChange={() => toggleEvent(ev)}
                      />
                      <label htmlFor={`event-${ev}`} className="text-sm font-mono leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {ev}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              <Button 
                onClick={handleCreate} 
                className="w-full" 
                disabled={!newUrl || selectedEvents.length === 0 || createWebhook.isPending}
              >
                {createWebhook.isPending ? "Registering..." : "Register Endpoint"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {isLoading ? (
          <Card className="bg-card">
            <CardContent className="p-6">
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ) : data?.webhooks.length === 0 ? (
          <Card className="bg-card border-dashed">
            <CardContent className="flex flex-col items-center justify-center h-48 space-y-4">
              <Webhook className="w-8 h-8 text-muted-foreground" />
              <div className="text-center">
                <p className="font-medium">No webhooks registered</p>
                <p className="text-sm text-muted-foreground">Add an endpoint to start receiving events.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          data?.webhooks.map((hook) => (
            <Card key={hook.id} className="bg-card">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="font-mono font-medium truncate max-w-sm md:max-w-md" title={hook.url}>
                        {hook.url}
                      </div>
                      {hook.active ? (
                        <Badge variant="outline" className="border-emerald-500/50 text-emerald-500 bg-emerald-500/10">Active</Badge>
                      ) : (
                        <Badge variant="outline" className="border-destructive/50 text-destructive bg-destructive/10">Inactive</Badge>
                      )}
                    </div>
                    
                    <div className="flex gap-2 flex-wrap">
                      {hook.events.map(ev => (
                        <Badge key={ev} variant="secondary" className="font-mono text-xs bg-secondary">
                          {ev}
                        </Badge>
                      ))}
                    </div>
                    
                    <div className="text-xs text-muted-foreground font-mono mt-2">
                      Secret: <span className="opacity-50">************************</span>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-2 shrink-0">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleTest(hook.id)}
                      disabled={testWebhook.isPending}
                    >
                      <Activity className="w-4 h-4 mr-2" />
                      Ping
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={() => handleDelete(hook.id)}
                      disabled={deleteWebhook.isPending}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
