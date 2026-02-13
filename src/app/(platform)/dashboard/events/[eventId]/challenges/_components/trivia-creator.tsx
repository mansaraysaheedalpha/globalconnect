// Trivia game creator component for organizer dashboard
"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sparkles, Plus, Trash2, GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface TriviaQuestion {
  questionText: string;
  options: string[];
  correctIndex: number;
}

interface TriviaCreatorProps {
  onCreateGame: (data: {
    name: string;
    timePerQuestion?: number;
    pointsCorrect?: number;
    pointsSpeedBonus?: number;
    questions: TriviaQuestion[];
    idempotencyKey: string;
  }) => void;
  isConnected: boolean;
}

const EMPTY_QUESTION: TriviaQuestion = {
  questionText: "",
  options: ["", "", "", ""],
  correctIndex: 0,
};

export const TriviaCreator = ({
  onCreateGame,
  isConnected,
}: TriviaCreatorProps) => {
  const [gameName, setGameName] = useState("");
  const [timePerQuestion, setTimePerQuestion] = useState(30);
  const [questions, setQuestions] = useState<TriviaQuestion[]>([{ ...EMPTY_QUESTION }]);
  const [isCreating, setIsCreating] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [...prev, { ...EMPTY_QUESTION, options: ["", "", "", ""] }]);
  };

  const removeQuestion = (index: number) => {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, field: string, value: any) => {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, [field]: value } : q))
    );
  };

  const updateOption = (questionIndex: number, optionIndex: number, value: string) => {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== questionIndex) return q;
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  };

  const handleCreate = () => {
    if (!gameName.trim()) {
      toast.error("Game name is required");
      return;
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      if (!q.questionText.trim()) {
        toast.error(`Question ${i + 1} text is required`);
        return;
      }
      const filledOptions = q.options.filter((o) => o.trim());
      if (filledOptions.length < 2) {
        toast.error(`Question ${i + 1} needs at least 2 options`);
        return;
      }
      if (!q.options[q.correctIndex]?.trim()) {
        toast.error(`Question ${i + 1}: correct answer option is empty`);
        return;
      }
    }

    setIsCreating(true);

    // Clean up questions: remove empty trailing options
    const cleanedQuestions = questions.map((q) => ({
      ...q,
      options: q.options.filter((o) => o.trim()),
    }));

    onCreateGame({
      name: gameName.trim(),
      timePerQuestion,
      questions: cleanedQuestions,
      idempotencyKey: crypto.randomUUID(),
    });

    // Reset form
    setTimeout(() => {
      setGameName("");
      setQuestions([{ ...EMPTY_QUESTION, options: ["", "", "", ""] }]);
      setIsCreating(false);
      toast.success("Trivia game created!");
    }, 500);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-500" />
          Create Trivia Game
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Game settings */}
        <div className="flex gap-3">
          <div className="flex-1">
            <Label htmlFor="trivia-name" className="text-xs">Game Name</Label>
            <Input
              id="trivia-name"
              value={gameName}
              onChange={(e) => setGameName(e.target.value)}
              placeholder="e.g. Tech Trivia Round 1"
              maxLength={200}
              className="h-8 text-sm"
            />
          </div>
          <div className="w-28">
            <Label htmlFor="trivia-time" className="text-xs">Sec/Question</Label>
            <Input
              id="trivia-time"
              type="number"
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              min={5}
              max={120}
              className="h-8 text-sm"
            />
          </div>
        </div>

        {/* Questions */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold">
              Questions ({questions.length})
            </Label>
            <Button
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={addQuestion}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Question
            </Button>
          </div>

          {questions.map((question, qi) => (
            <div
              key={qi}
              className="p-3 rounded-lg border bg-muted/20 space-y-2"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <Label className="text-xs text-muted-foreground">
                    Q{qi + 1}
                  </Label>
                  <Input
                    value={question.questionText}
                    onChange={(e) =>
                      updateQuestion(qi, "questionText", e.target.value)
                    }
                    placeholder="Enter question..."
                    className="h-8 text-sm"
                  />
                </div>
                {questions.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 mt-4"
                    onClick={() => removeQuestion(qi)}
                  >
                    <Trash2 className="h-3.5 w-3.5 text-destructive" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2">
                {question.options.map((option, oi) => (
                  <div key={oi} className="flex items-center gap-1.5">
                    <input
                      type="radio"
                      name={`correct-${qi}`}
                      checked={question.correctIndex === oi}
                      onChange={() => updateQuestion(qi, "correctIndex", oi)}
                      className="accent-green-600"
                    />
                    <Input
                      value={option}
                      onChange={(e) => updateOption(qi, oi, e.target.value)}
                      placeholder={`Option ${oi + 1}`}
                      className="h-7 text-xs flex-1"
                    />
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground">
                Select the radio button next to the correct answer
              </p>
            </div>
          ))}
        </div>

        <Button
          className="w-full"
          onClick={handleCreate}
          disabled={isCreating || !isConnected || !gameName.trim()}
        >
          <Sparkles className="h-4 w-4 mr-1.5" />
          Create Trivia Game ({questions.length} question{questions.length !== 1 ? "s" : ""})
        </Button>
      </CardContent>
    </Card>
  );
};
