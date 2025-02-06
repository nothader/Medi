import { cn } from "@/lib/utils";

interface MoodScaleProps {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}

const moods = [
  { value: 1, label: "😢", description: "Very Bad" },
  { value: 2, label: "😕", description: "Bad" },
  { value: 3, label: "😐", description: "Okay" },
  { value: 4, label: "🙂", description: "Good" },
  { value: 5, label: "😄", description: "Great" },
];

export function MoodScale({ value, onChange, className }: MoodScaleProps) {
  return (
    <div className={cn("flex flex-col gap-4", className)}>
      <div className="flex justify-between">
        {moods.map((mood) => (
          <button
            key={mood.value}
            onClick={() => onChange(mood.value)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-lg transition-all",
              value === mood.value && "bg-primary/10"
            )}
          >
            <span className="text-4xl">{mood.label}</span>
            <span className="text-sm text-muted-foreground">{mood.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
