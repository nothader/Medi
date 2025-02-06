import { useQuery } from "@tanstack/react-query";
import { BottomNav } from "@/components/bottom-nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Mood, Medication } from "@shared/schema";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format } from "date-fns";

interface MoodTrend {
  date: string;
  rating: number;
  medications: string[];
}

interface MedicationEffectiveness {
  medicationName: string;
  averageMoodWithMed: number;
  averageMoodWithoutMed: number;
  timesUsed: number;
}

export default function AnalyticsPage() {
  const { data: moods } = useQuery<Mood[]>({
    queryKey: ["/api/moods"],
  });

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  // Transform mood data for the line chart
  const moodTrends: MoodTrend[] = moods
    ? moods.map(mood => ({
        date: format(new Date(mood.timestamp || new Date()), "MMM d"),
        rating: mood.rating,
        medications: mood.relatedMedications || [],
      }))
    : [];

  // Calculate medication effectiveness
  const medicationEffectiveness: MedicationEffectiveness[] = medications
    ? medications.map(medication => {
        const moodsWithMed = moods?.filter(mood => 
          mood.relatedMedications?.includes(medication.name)
        ) || [];
        const moodsWithoutMed = moods?.filter(mood => 
          !mood.relatedMedications?.includes(medication.name)
        ) || [];

        const avgWithMed = moodsWithMed.length
          ? moodsWithMed.reduce((sum, mood) => sum + mood.rating, 0) / moodsWithMed.length
          : 0;

        const avgWithoutMed = moodsWithoutMed.length
          ? moodsWithoutMed.reduce((sum, mood) => sum + mood.rating, 0) / moodsWithoutMed.length
          : 0;

        return {
          medicationName: medication.name,
          averageMoodWithMed: Number(avgWithMed.toFixed(2)),
          averageMoodWithoutMed: Number(avgWithoutMed.toFixed(2)),
          timesUsed: moodsWithMed.length,
        };
      })
    : [];

  return (
    <div className="container pb-16">
      <div className="py-6">
        <h1 className="text-2xl font-bold">Analytics & Trends</h1>
      </div>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Mood Trends</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={moodTrends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as MoodTrend;
                        return (
                          <div className="bg-background border rounded-lg p-2 shadow-lg">
                            <p className="font-medium">{data.date}</p>
                            <p>Mood: {data.rating}</p>
                            {data.medications.length > 0 && (
                              <p>Medications: {data.medications.join(", ")}</p>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="rating"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={{
                      stroke: "hsl(var(--primary))",
                      strokeWidth: 2,
                      fill: "hsl(var(--background))",
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Medication Effectiveness Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {medicationEffectiveness.map((med) => (
                <div key={med.medicationName} className="space-y-2">
                  <h3 className="font-medium">{med.medicationName}</h3>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Average Mood When Taking</p>
                      <p className="font-medium">{med.averageMoodWithMed}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Average Mood Without</p>
                      <p className="font-medium">{med.averageMoodWithoutMed}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Times Used</p>
                      <p className="font-medium">{med.timesUsed}</p>
                    </div>
                  </div>
                  <div className="h-2 bg-secondary rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${(med.averageMoodWithMed / 5) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
}
