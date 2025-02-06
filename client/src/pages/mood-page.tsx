import { useQuery, useMutation } from "@tanstack/react-query";
import { MoodScale } from "@/components/mood-scale";
import { BottomNav } from "@/components/bottom-nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Mood, InsertMood, Medication } from "@shared/schema";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

export default function MoodPage() {
  const [rating, setRating] = useState(3);
  const [note, setNote] = useState("");
  const [selectedMeds, setSelectedMeds] = useState<string[]>([]);

  const { data: moods } = useQuery<Mood[]>({
    queryKey: ["/api/moods"],
  });

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const addMutation = useMutation({
    mutationFn: async (data: InsertMood) => {
      const res = await apiRequest("POST", "/api/moods", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/moods"] });
      setNote("");
      setSelectedMeds([]);
    },
  });

  const handleSubmit = () => {
    const analysis = generateMoodAnalysis(rating, selectedMeds, medications || []);
    addMutation.mutate({
      rating,
      note,
      relatedMedications: selectedMeds,
      analysis,
    });
  };

  return (
    <div className="container pb-16">
      <div className="py-6">
        <h1 className="text-2xl font-bold">Mood Tracker</h1>
      </div>

      <Card className="p-6">
        <h2 className="text-lg font-semibold mb-4">How are you feeling?</h2>
        <MoodScale value={rating} onChange={setRating} />
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note about how you're feeling... (optional)"
          className="mt-4"
        />

        {medications && medications.length > 0 && (
          <div className="mt-4">
            <h3 className="font-medium mb-2">Related Medications</h3>
            <div className="space-y-2">
              {medications.map((med) => (
                <div key={med.id} className="flex items-center space-x-2">
                  <Checkbox
                    checked={selectedMeds.includes(med.name)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedMeds([...selectedMeds, med.name]);
                      } else {
                        setSelectedMeds(selectedMeds.filter((m) => m !== med.name));
                      }
                    }}
                  />
                  <span>{med.name}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button
          className="w-full mt-4"
          onClick={handleSubmit}
          disabled={addMutation.isPending}
        >
          Log Mood
        </Button>
      </Card>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-4">Mood History</h2>
        <div className="space-y-4">
          {moods?.map((mood) => (
            <Card key={mood.id} className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-2xl">
                  {["😢", "😕", "😐", "🙂", "😄"][mood.rating - 1]}
                </span>
                <span className="text-sm text-muted-foreground">
                  {format(new Date(mood.timestamp || new Date()), "PPp")}
                </span>
              </div>
              {mood.note && (
                <p className="text-sm text-muted-foreground mb-2">{mood.note}</p>
              )}
              {mood.relatedMedications && mood.relatedMedications.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium">Related Medications:</h4>
                  <p className="text-sm text-muted-foreground">
                    {mood.relatedMedications.join(", ")}
                  </p>
                </div>
              )}
              {mood.analysis && (
                <div className="mt-2 p-3 bg-secondary/20 rounded-md">
                  <h4 className="text-sm font-medium mb-1">Analysis:</h4>
                  <p className="text-sm text-muted-foreground">{mood.analysis}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      <BottomNav />
    </div>
  );
}

function generateMoodAnalysis(rating: number, selectedMeds: string[], medications: Medication[]): string {
  const moodDescriptions = ["very bad", "bad", "okay", "good", "great"];
  const currentMood = moodDescriptions[rating - 1];

  let analysis = `You're feeling ${currentMood} today`;

  if (selectedMeds.length > 0) {
    analysis += ` while taking ${selectedMeds.join(", ")}.`;

    // Get the relevant medications with their effects
    const relevantMeds = selectedMeds.map(medName => 
      medications.find(m => m.name === medName)
    ).filter((med): med is Medication => med !== undefined);

    // Add medication effects analysis
    const medAnalysis = relevantMeds.map(med => {
      let analysis = `${med.name}: `;
      if (med.purpose) analysis += `Used for ${med.purpose}. `;
      if (med.effects) analysis += `Expected effects: ${med.effects}. `;
      if (med.sideEffects) analysis += `Possible side effects: ${med.sideEffects}.`;
      return analysis;
    });

    if (medAnalysis.length > 0) {
      analysis += "\n\nMedication Effects:\n• " + medAnalysis.join("\n• ");
    }

    // Generate contextual suggestions based on mood and medications
    const suggestions = [];

    if (rating <= 2) {
      // For negative moods, focus on medication effectiveness and side effect management
      suggestions.push("Consider discussing with your healthcare provider:");

      relevantMeds.forEach(med => {
        if (med.purpose) {
          suggestions.push(`- Whether ${med.name} is effectively managing your ${med.purpose}`);
        }
        if (med.sideEffects) {
          suggestions.push(`- If you're experiencing any side effects from ${med.name} (${med.sideEffects})`);
        }
      });

      suggestions.push(
        "Track timing of medication intake and mood changes",
        "Keep a detailed record of any new symptoms or side effects",
        "Ensure you're taking medications at the prescribed times and doses"
      );

    } else if (rating >= 4) {
      // For positive moods, focus on maintaining the current regimen
      suggestions.push(
        "Current medication routine appears to be working well",
        "Continue following your prescribed medication schedule"
      );

      relevantMeds.forEach(med => {
        if (med.purpose) {
          suggestions.push(`- ${med.name} seems to be effectively managing your ${med.purpose}`);
        }
      });

      suggestions.push(
        "Maintain consistent timing of medication intake",
        "Keep tracking your mood to identify what's working well"
      );

    } else {
      // For neutral moods, focus on optimization and monitoring
      suggestions.push("Optimization suggestions:");

      relevantMeds.forEach(med => {
        if (med.purpose) {
          suggestions.push(`- Monitor how well ${med.name} is managing your ${med.purpose}`);
        }
        if (med.effects) {
          suggestions.push(`- Watch for expected effects: ${med.effects}`);
        }
      });

      suggestions.push(
        "Keep track of medication timing and any mood changes",
        "Consider discussing optimization options with your healthcare provider"
      );
    }

    analysis += "\n\nRecommendations:\n• " + suggestions.join("\n• ");

  } else {
    analysis += ".\n\nNo medications were logged for this mood entry. Consider tracking your medications to better understand their impact on your mood.";
  }

  return analysis;
}