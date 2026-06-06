import { ReactNode, useState } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Key } from "lucide-react";

export function AuthGuard({ children }: { children: ReactNode }) {
  const { apiKey, setApiKey } = useAuth();
  const [inputValue, setInputValue] = useState("");

  if (!apiKey) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card text-card-foreground">
          <CardHeader className="space-y-1">
            <div className="flex items-center gap-2 text-primary mb-2">
              <Key className="h-5 w-5" />
              <span className="font-mono font-bold tracking-tight">ORACLEX</span>
            </div>
            <CardTitle className="text-2xl tracking-tight">API Access Required</CardTitle>
            <CardDescription className="text-muted-foreground">
              Please enter your developer API key to access the console.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (inputValue.trim()) {
                  setApiKey(inputValue.trim());
                }
              }}
              className="space-y-4"
            >
              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Demo key: oraclex_live_test_key_xyz123"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  className="font-mono bg-background"
                  required
                />
              </div>
              <Button type="submit" className="w-full">
                Connect to Engine
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
