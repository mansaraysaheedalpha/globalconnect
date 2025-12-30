// src/app/(platform)/dashboard/events/[eventId]/ab-tests/_components/create-ab-test-dialog.tsx
"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";

interface CreateABTestDialogProps {
  eventId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateABTestDialog({ eventId, open, onOpenChange }: CreateABTestDialogProps) {
  const [testName, setTestName] = useState("");
  const [testType, setTestType] = useState<"OFFER_PRICE" | "AD_CREATIVE" | "OFFER_COPY">("OFFER_PRICE");
  const [description, setDescription] = useState("");
  const [variants, setVariants] = useState<Array<{ name: string; value: string; weight: number }>>([
    { name: "Control", value: "", weight: 50 },
    { name: "Variant A", value: "", weight: 50 },
  ]);

  const handleAddVariant = () => {
    const newWeight = Math.floor(100 / (variants.length + 1));
    setVariants([
      ...variants.map(v => ({ ...v, weight: newWeight })),
      { name: `Variant ${String.fromCharCode(65 + variants.length - 1)}`, value: "", weight: newWeight },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length <= 2) {
      toast.error("You must have at least 2 variants (control + 1 variant)");
      return;
    }
    const newVariants = variants.filter((_, i) => i !== index);
    const newWeight = Math.floor(100 / newVariants.length);
    setVariants(newVariants.map(v => ({ ...v, weight: newWeight })));
  };

  const handleUpdateVariant = (index: number, field: "name" | "value" | "weight", value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const handleCreate = () => {
    // Validation
    if (!testName.trim()) {
      toast.error("Please enter a test name");
      return;
    }

    if (variants.some(v => !v.value.trim())) {
      toast.error("All variants must have a value");
      return;
    }

    const totalWeight = variants.reduce((sum, v) => sum + v.weight, 0);
    if (totalWeight !== 100) {
      toast.error("Variant weights must sum to 100%");
      return;
    }

    // TODO: Create test via API
    console.log("Creating A/B test:", {
      eventId,
      testName,
      testType,
      description,
      variants,
    });

    toast.success("A/B test created successfully!");
    onOpenChange(false);

    // Reset form
    setTestName("");
    setDescription("");
    setVariants([
      { name: "Control", value: "", weight: 50 },
      { name: "Variant A", value: "", weight: 50 },
    ]);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create A/B Test</DialogTitle>
          <DialogDescription>
            Set up a new experiment to test different variants and optimize conversions.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Test Name */}
          <div>
            <Label htmlFor="testName">Test Name</Label>
            <Input
              id="testName"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="e.g., VIP Upgrade Price Test"
            />
          </div>

          {/* Test Type */}
          <div>
            <Label htmlFor="testType">Test Type</Label>
            <Select value={testType} onValueChange={(value: any) => setTestType(value)}>
              <SelectTrigger id="testType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OFFER_PRICE">Offer Price</SelectItem>
                <SelectItem value="AD_CREATIVE">Ad Creative</SelectItem>
                <SelectItem value="OFFER_COPY">Offer Copy/Messaging</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you testing and why?"
              rows={2}
            />
          </div>

          {/* Variants */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label>Variants</Label>
              <Button variant="outline" size="sm" onClick={handleAddVariant}>
                <Plus className="h-4 w-4 mr-2" />
                Add Variant
              </Button>
            </div>

            <div className="space-y-3">
              {variants.map((variant, index) => (
                <div key={index} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">
                      {index === 0 ? "Control Group" : variant.name}
                    </span>
                    {index > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveVariant(index)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {/* Variant Name */}
                    {index > 0 && (
                      <div>
                        <Label className="text-xs">Name</Label>
                        <Input
                          value={variant.name}
                          onChange={(e) => handleUpdateVariant(index, "name", e.target.value)}
                          placeholder="Variant name"
                          size="sm"
                        />
                      </div>
                    )}

                    {/* Variant Value */}
                    <div className={index === 0 ? "col-span-2" : ""}>
                      <Label className="text-xs">
                        {testType === "OFFER_PRICE" ? "Price ($)" : "Value"}
                      </Label>
                      <Input
                        value={variant.value}
                        onChange={(e) => handleUpdateVariant(index, "value", e.target.value)}
                        placeholder={testType === "OFFER_PRICE" ? "29.99" : "Enter value"}
                        type={testType === "OFFER_PRICE" ? "number" : "text"}
                      />
                    </div>

                    {/* Traffic Weight */}
                    <div>
                      <Label className="text-xs">Traffic %</Label>
                      <Input
                        value={variant.weight}
                        onChange={(e) => handleUpdateVariant(index, "weight", parseInt(e.target.value) || 0)}
                        type="number"
                        min="1"
                        max="100"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-xs text-muted-foreground mt-2">
              Total traffic allocation: {variants.reduce((sum, v) => sum + v.weight, 0)}%
              {variants.reduce((sum, v) => sum + v.weight, 0) !== 100 && (
                <span className="text-destructive ml-2">⚠ Must equal 100%</span>
              )}
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate}>Create Test</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
