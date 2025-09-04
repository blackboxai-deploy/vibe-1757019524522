"use client";

import { Button } from "@/components/ui/button";

type Direction = { x: number; y: number };
type GameState = "idle" | "playing" | "paused" | "gameOver";

interface GameControlsProps {
  gameState: GameState;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onDirectionChange: (direction: Direction) => void;
}

export default function GameControls({
  gameState,
  onStart,
  onPause,
  onReset,
  onDirectionChange,
}: GameControlsProps) {
  const handleDirectionClick = (direction: Direction) => {
    if (gameState === "idle") {
      onStart();
    }
    onDirectionChange(direction);
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      {/* Main game controls */}
      <div className="flex space-x-4">
        {gameState === "idle" && (
          <Button
            onClick={onStart}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            Start Game
          </Button>
        )}
        
        {gameState === "playing" && (
          <Button
            onClick={onPause}
            className="bg-yellow-600 hover:bg-yellow-700 text-white px-8 py-3 text-lg"
          >
            Pause
          </Button>
        )}
        
        {gameState === "paused" && (
          <>
            <Button
              onClick={onPause}
              className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
            >
              Resume
            </Button>
            <Button
              onClick={onReset}
              className="bg-red-600 hover:bg-red-700 text-white px-8 py-3 text-lg"
            >
              Reset
            </Button>
          </>
        )}
        
        {gameState === "gameOver" && (
          <Button
            onClick={onStart}
            className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 text-lg"
          >
            Play Again
          </Button>
        )}
        
        {gameState !== "idle" && gameState !== "gameOver" && (
          <Button
            onClick={onReset}
            variant="outline"
            className="border-gray-600 text-gray-300 hover:bg-gray-700 px-6 py-3"
          >
            Reset
          </Button>
        )}
      </div>

      {/* Mobile touch controls */}
      <div className="flex flex-col items-center space-y-2 md:hidden">
        <p className="text-gray-400 text-sm mb-2">Touch controls:</p>
        <div className="grid grid-cols-3 gap-2">
          <div></div>
          <Button
            onClick={() => handleDirectionClick({ x: 0, y: -1 })}
            variant="outline"
            className="w-16 h-16 border-gray-600 text-gray-300 hover:bg-gray-700 text-xl"
            disabled={gameState === "gameOver"}
          >
            ↑
          </Button>
          <div></div>
          
          <Button
            onClick={() => handleDirectionClick({ x: -1, y: 0 })}
            variant="outline"
            className="w-16 h-16 border-gray-600 text-gray-300 hover:bg-gray-700 text-xl"
            disabled={gameState === "gameOver"}
          >
            ←
          </Button>
          
          <div className="w-16 h-16"></div>
          
          <Button
            onClick={() => handleDirectionClick({ x: 1, y: 0 })}
            variant="outline"
            className="w-16 h-16 border-gray-600 text-gray-300 hover:bg-gray-700 text-xl"
            disabled={gameState === "gameOver"}
          >
            →
          </Button>
          
          <div></div>
          <Button
            onClick={() => handleDirectionClick({ x: 0, y: 1 })}
            variant="outline"
            className="w-16 h-16 border-gray-600 text-gray-300 hover:bg-gray-700 text-xl"
            disabled={gameState === "gameOver"}
          >
            ↓
          </Button>
          <div></div>
        </div>
      </div>
    </div>
  );
}