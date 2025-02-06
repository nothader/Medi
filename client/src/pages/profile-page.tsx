import { useAuth } from "@/hooks/use-auth";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function ProfilePage() {
  const { user, logoutMutation } = useAuth();

  return (
    <div className="container pb-16">
      <div className="py-6">
        <h1 className="text-2xl font-bold">Profile</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Account Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Logged in as: <span className="font-medium">{user?.username}</span>
          </p>
          <Button
            variant="destructive"
            className="mt-4"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            Logout
          </Button>
        </CardContent>
      </Card>

      <BottomNav />
    </div>
  );
}
