"use client";

import { Card, CardContent } from "@/components/ui/card";

interface ScoreBoardProps {
  score: number;
  highScore: number;
}

export default function ScoreBoard({ score, highScore }: ScoreBoardProps) {
  return (
    <div className="flex space-x-4 w-full max-w-md">
      <Card className="flex-1 bg-gray-800 border-gray-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-400">{score}</div>
          <div className="text-sm text-gray-400">Current Score</div>
        </CardContent>
      </Card>
      
      <Card className="flex-1 bg-gray-800 border-gray-700">
        <CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-400">{highScore}</div>
          <div className="text-sm text-gray-400">High Score</div>
        </CardContent>
      </Card>
    </div>
  );
}