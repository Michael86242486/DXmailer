import { useState, useEffect } from "react";
import { 
  useGetDeveloperMe, 
  getGetDeveloperMeQueryKey,
  useUpdateDeveloperMe,
  useRotateDeveloperKey,
  useDeleteDeveloperMe
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Key, Save, RefreshCw, AlertTriangle, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { setApiKey } = useAuth();
  
  const { data: dev, isLoading } = useGetDeveloperMe({
    query: { queryKey: getGetDeveloperMeQueryKey() }
  });

  const updateDev = useUpdateDeveloperMe();
  const rotateKey = useRotateDeveloperKey();
  const deleteDev = useDeleteDeveloperMe();

  const [companyName, setCompanyName] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    if (dev?.companyName) {
      setCompanyName(dev.companyName);
    }
  }, [dev]);

  const handleUpdate = () => {
    updateDev.mutate({ data: { companyName } }, {
      onSuccess: () => {
        toast({ title: "Settings saved." });
        queryClient.invalidateQueries({ queryKey: getGetDeveloperMeQueryKey() });
      }
    });
  };

  const handleRotate = () => {
    rotateKey.mutate(undefined, {
      onSuccess: (newDev) => {
        toast({ title: "API key rotated successfully.", description: "Your old key is no longer valid." });
        // Update local storage with the new key so we don't get locked out
        setApiKey(newDev.apiKey);
        queryClient.invalidateQueries({ queryKey: getGetDeveloperMeQueryKey() });
      }
    });
  };

  const handleDelete = () => {
    deleteDev.mutate(undefined, {
      onSuccess: () => {
        toast({ title: "Account deleted." });
        setApiKey(null);
      }
    });
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight font-mono mb-2">ENGINE_SETTINGS</h1>
        <p className="text-muted-foreground">Manage your developer account and API credentials.</p>
      </div>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground uppercase flex items-center gap-2">
            <Key className="w-4 h-4" /> API Credentials
          </CardTitle>
          <CardDescription>Use this key to authenticate with the ORACLEX API.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLoading ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Input 
                  readOnly 
                  value={showKey ? dev?.apiKey : "************************************************"} 
                  className="font-mono bg-background font-medium pr-10"
                />
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="absolute right-1 top-1 h-8 w-8 p-0"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="shrink-0">
                    <RefreshCw className="w-4 h-4 mr-2" /> Rotate
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-card border-border">
                  <AlertDialogHeader>
                    <AlertDialogTitle>Rotate API Key?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will instantly invalidate your current API key. Any applications using the old key will fail to authenticate until updated.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleRotate} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                      Yes, rotate key
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="bg-card">
        <CardHeader>
          <CardTitle className="font-mono text-sm tracking-widest text-muted-foreground uppercase">Organization Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company / Project Name</Label>
            {isLoading ? (
              <Skeleton className="h-10 w-full" />
            ) : (
              <div className="flex gap-2">
                <Input 
                  id="companyName" 
                  value={companyName} 
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="bg-background"
                />
                <Button 
                  onClick={handleUpdate} 
                  disabled={companyName === dev?.companyName || updateDev.isPending || !companyName}
                >
                  <Save className="w-4 h-4 mr-2" /> Save
                </Button>
              </div>
            )}
          </div>
          
          <div className="pt-4 border-t border-border space-y-2">
            <Label>Rate Limits</Label>
            <div className="text-sm text-muted-foreground font-mono">
              {isLoading ? <Skeleton className="h-4 w-32" /> : `${dev?.rateLimitPerMin} requests / minute`}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="font-mono text-sm tracking-widest text-destructive uppercase flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" /> Danger Zone
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="text-sm text-muted-foreground">
              Permanently delete your developer account and all associated data.
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">Delete Account</Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="bg-card border-border">
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete your developer account, all API keys, webhooks, and email logs.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Delete everything
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
