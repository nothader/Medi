import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { MedCard } from "@/components/med-card";
import { BottomNav } from "@/components/bottom-nav";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertMedicationSchema, type Medication, type InsertMedication } from "@shared/schema";
import { Icons } from "@/components/icons";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { searchDrug, type DrugInfo } from "@/lib/drug-api";
import { Loader2 } from "lucide-react";

export default function MedicationsPage() {
  const [open, setOpen] = useState(false);
  const [drugInfo, setDrugInfo] = useState<DrugInfo | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const { data: medications } = useQuery<Medication[]>({
    queryKey: ["/api/medications"],
  });

  const form = useForm<InsertMedication>({
    resolver: zodResolver(insertMedicationSchema),
    defaultValues: {
      name: "",
      dosage: "",
      frequency: "",
      purpose: "",
      effects: "",
      sideEffects: "",
      category: "",
      description: "",
    },
  });

  const addMutation = useMutation({
    mutationFn: async (data: InsertMedication) => {
      const res = await apiRequest("POST", "/api/medications", data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
      setOpen(false);
      form.reset();
      setDrugInfo(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/medications/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/medications"] });
    },
  });

  // Search for drug information when name changes
  const handleNameChange = async (name: string) => {
    if (!name) {
      setDrugInfo(null);
      return;
    }

    setIsSearching(true);
    try {
      const info = await searchDrug(name);
      setDrugInfo(info);

      if (info) {
        // Auto-fill form with drug information
        form.setValue("purpose", info.purpose);
        form.setValue("effects", info.indications.join("\n"));
        form.setValue("sideEffects", info.adverseReactions.join("\n"));
        form.setValue("category", info.drugClass);
        form.setValue("description", info.description);
      }
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="container pb-16">
      <div className="py-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Medications</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>
              <Icons.add className="mr-2 h-4 w-4" />
              Add Medication
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Medication</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit((data) => addMutation.mutate(data))}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Medication Name</FormLabel>
                      <FormDescription>
                        Enter the brand name or generic name of the medication
                      </FormDescription>
                      <div className="relative">
                        <FormControl>
                          <Input 
                            {...field} 
                            onChange={(e) => {
                              field.onChange(e);
                              handleNameChange(e.target.value);
                            }}
                          />
                        </FormControl>
                        {isSearching && (
                          <div className="absolute right-3 top-2">
                            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      {drugInfo && (
                        <div className="mt-2 text-sm">
                          <p className="text-muted-foreground">
                            Found: {drugInfo.brandName} ({drugInfo.genericName})
                          </p>
                        </div>
                      )}
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dosage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dosage</FormLabel>
                      <FormDescription>
                        Specify the amount per dose (e.g., "10mg" or "1 tablet")
                      </FormDescription>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Frequency</FormLabel>
                      <FormDescription>
                        How often to take the medication (e.g., "Once daily" or "Every 8 hours")
                      </FormDescription>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {drugInfo && (
                  <>
                    <div className="p-4 bg-secondary/20 rounded-md space-y-4">
                      <h3 className="font-medium">Drug Information</h3>
                      {drugInfo.drugClass && (
                        <p className="text-sm">
                          <span className="font-medium">Class:</span> {drugInfo.drugClass}
                        </p>
                      )}
                      {drugInfo.purpose && (
                        <div>
                          <h4 className="text-sm font-medium">Purpose:</h4>
                          <p className="text-sm text-muted-foreground">{drugInfo.purpose}</p>
                        </div>
                      )}
                      {drugInfo.indications.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium">Uses:</h4>
                          <ul className="list-disc pl-4 text-sm text-muted-foreground">
                            {drugInfo.indications.map((indication, i) => (
                              <li key={i}>{indication}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {drugInfo.warnings.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium text-destructive">Warnings:</h4>
                          <ul className="list-disc pl-4 text-sm text-muted-foreground">
                            {drugInfo.warnings.map((warning, i) => (
                              <li key={i}>{warning}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={addMutation.isPending}
                >
                  Add Medication
                </Button>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {medications?.map((med) => (
          <MedCard
            key={med.id}
            medication={med}
            onDelete={() => deleteMutation.mutate(med.id)}
          />
        ))}
      </div>

      <BottomNav />
    </div>
  );
}