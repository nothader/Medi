import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MedCard } from "@/components/med-card";
import { BottomNav } from "@/components/bottom-nav";
import type { Medication, Mood } from "@shared/schema";

export default function HomePage() {
  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const { data: moods } = useQuery<Mood[]>({
    queryKey: ["/api/moods"],
  });

  const latestMood = moods?.[0];

  return (
    <div className="container pb-16">
      <div className="py-6">
        <h1 className="text-2xl font-bold">MedTrack</h1>
        <p className="text-muted-foreground mt-1">Your personal medication and mood tracker</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Current Mood</CardTitle>
          </CardHeader>
          <CardContent>
            {latestMood ? (
              <div className="text-center">
                <span className="text-4xl">
                  {["😢", "😕", "😐", "🙂", "😄"][latestMood.rating - 1]}
                </span>
                {latestMood.note && (
                  <p className="mt-2 text-sm text-muted-foreground">
                    {latestMood.note}
                  </p>
                )}
              </div>
            ) : (
              <p className="text-center text-muted-foreground">No mood logged yet</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Medications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {medications?.filter(m => m.active).map((med) => (
              <MedCard key={med.id} medication={med} />
            ))}
            {!medications?.length && (
              <p className="text-center text-muted-foreground">
                No medications added yet
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}