import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Icons } from "./icons";
import type { Medication } from "@shared/schema";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";

interface MedCardProps {
  medication: Medication;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function MedCard({ medication, onEdit, onDelete }: MedCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-semibold text-lg">{medication.name}</h3>
            <p className="text-sm text-muted-foreground">
              {medication.dosage} • {medication.frequency}
            </p>
          </div>
          <div className="space-x-2">
            {onEdit && (
              <Button variant="ghost" size="icon" onClick={onEdit}>
                <Icons.edit className="h-4 w-4" />
              </Button>
            )}
            {onDelete && (
              <Button variant="ghost" size="icon" onClick={onDelete}>
                <Icons.delete className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <Accordion type="single" collapsible>
          <AccordionItem value="info">
            <AccordionTrigger>Medication Information</AccordionTrigger>
            <AccordionContent>
              {medication.description && (
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Description</h4>
                  <p className="text-sm text-muted-foreground">{medication.description}</p>
                </div>
              )}
              {medication.effects && (
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Effects</h4>
                  <p className="text-sm text-muted-foreground">{medication.effects}</p>
                </div>
              )}
              {medication.sideEffects && (
                <div className="mb-4">
                  <h4 className="font-medium mb-1">Side Effects</h4>
                  <p className="text-sm text-muted-foreground">{medication.sideEffects}</p>
                </div>
              )}
              {medication.category && (
                <div>
                  <h4 className="font-medium mb-1">Category</h4>
                  <p className="text-sm text-muted-foreground">{medication.category}</p>
                </div>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}