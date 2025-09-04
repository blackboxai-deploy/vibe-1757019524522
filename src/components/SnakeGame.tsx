"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import GameControls from "./GameControls";
import ScoreBoard from "./ScoreBoard";

// Game constants
const GRID_SIZE = 20;
const INITIAL_SNAKE = [
  { x: 10, y: 10 },
  { x: 9, y: 10 },
  { x: 8, y: 10 },
];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const INITIAL_FOOD = { x: 15, y: 15 };

// Game state types
type Position = { x: number; y: number };
type Direction = { x: number; y: number };
type GameState = "idle" | "playing" | "paused" | "gameOver";

export default function SnakeGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<number | undefined>(undefined);
  const lastTimeRef = useRef<number>(0);
  const inputBufferRef = useRef<Direction | null>(null);

  // Game state
  const [gameState, setGameState] = useState<GameState>("idle");
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Direction>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>(INITIAL_FOOD);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [gameSpeed, setGameSpeed] = useState(150);

  // Canvas dimensions
  const [canvasSize, setCanvasSize] = useState({ width: 600, height: 600 });
  const gridWidth = Math.floor(canvasSize.width / GRID_SIZE);
  const gridHeight = Math.floor(canvasSize.height / GRID_SIZE);

  // Load high score from localStorage
  useEffect(() => {
    const savedHighScore = localStorage.getItem("snakeHighScore");
    if (savedHighScore) {
      setHighScore(parseInt(savedHighScore));
    }
  }, []);

  // Save high score to localStorage
  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem("snakeHighScore", score.toString());
    }
  }, [score, highScore]);

  // Update canvas size based on screen
  useEffect(() => {
    const updateCanvasSize = () => {
      const maxWidth = Math.min(window.innerWidth - 40, 800);
      const maxHeight = Math.min(window.innerHeight - 300, 600);
      const size = Math.min(maxWidth, maxHeight);
      setCanvasSize({ width: size, height: size });
    };

    updateCanvasSize();
    window.addEventListener("resize", updateCanvasSize);
    return () => window.removeEventListener("resize", updateCanvasSize);
  }, []);

  // Generate random food position
  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * gridWidth),
        y: Math.floor(Math.random() * gridHeight),
      };
    } while (
      currentSnake.some(segment => segment.x === newFood.x && segment.y === newFood.y)
    );
    return newFood;
  }, [gridWidth, gridHeight]);

  // Check collisions
  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
      return true;
    }
    // Self collision
    return body.some(segment => segment.x === head.x && segment.y === head.y);
  }, [gridWidth, gridHeight]);

  // Game loop
  const gameLoop = useCallback((currentTime: number) => {
    if (gameState !== "playing") {
      return;
    }

    if (currentTime - lastTimeRef.current < gameSpeed) {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
      return;
    }

    lastTimeRef.current = currentTime;

    setSnake(currentSnake => {
      const currentDirection = inputBufferRef.current || direction;
      inputBufferRef.current = null;

      const head = currentSnake[0];
      const newHead = {
        x: head.x + currentDirection.x,
        y: head.y + currentDirection.y,
      };

      // Check collision
      if (checkCollision(newHead, currentSnake)) {
        setGameState("gameOver");
        return currentSnake;
      }

      const newSnake = [newHead, ...currentSnake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore(prevScore => prevScore + 10);
        setFood(generateFood(newSnake));
        // Increase game speed slightly
        setGameSpeed(prevSpeed => Math.max(80, prevSpeed - 2));
        return newSnake;
      }

      // Remove tail if no food eaten
      return newSnake.slice(0, -1);
    });

    gameLoopRef.current = requestAnimationFrame(gameLoop);
  }, [gameState, direction, food, gameSpeed, checkCollision, generateFood]);

  // Start game loop
  useEffect(() => {
    if (gameState === "playing") {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameState, gameLoop]);

  // Handle keyboard input
  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (gameState === "idle") {
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "w", "s", "a", "d"].includes(e.key)) {
        startGame();
        return;
      }
    }

    if (gameState !== "playing") return;

    let newDirection: Direction | null = null;

    switch (e.key) {
      case "ArrowUp":
      case "w":
        if (direction.y === 0) newDirection = { x: 0, y: -1 };
        break;
      case "ArrowDown":
      case "s":
        if (direction.y === 0) newDirection = { x: 0, y: 1 };
        break;
      case "ArrowLeft":
      case "a":
        if (direction.x === 0) newDirection = { x: -1, y: 0 };
        break;
      case "ArrowRight":
      case "d":
        if (direction.x === 0) newDirection = { x: 1, y: 0 };
        break;
      case " ":
        e.preventDefault();
        togglePause();
        break;
    }

    if (newDirection) {
      inputBufferRef.current = newDirection;
      setDirection(newDirection);
    }
  }, [gameState, direction]);

  // Add event listeners
  useEffect(() => {
    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleKeyPress]);

  // Render game
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Clear canvas
    ctx.fillStyle = "#111827";
    ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);

    // Draw grid
    ctx.strokeStyle = "#374151";
    ctx.lineWidth = 1;
    for (let x = 0; x <= gridWidth; x++) {
      ctx.beginPath();
      ctx.moveTo(x * GRID_SIZE, 0);
      ctx.lineTo(x * GRID_SIZE, canvasSize.height);
      ctx.stroke();
    }
    for (let y = 0; y <= gridHeight; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * GRID_SIZE);
      ctx.lineTo(canvasSize.width, y * GRID_SIZE);
      ctx.stroke();
    }

    // Draw snake
    snake.forEach((segment, index) => {
      ctx.fillStyle = index === 0 ? "#10b981" : "#34d399";
      ctx.fillRect(
        segment.x * GRID_SIZE + 1,
        segment.y * GRID_SIZE + 1,
        GRID_SIZE - 2,
        GRID_SIZE - 2
      );
    });

    // Draw food
    ctx.fillStyle = "#ef4444";
    ctx.fillRect(
      food.x * GRID_SIZE + 2,
      food.y * GRID_SIZE + 2,
      GRID_SIZE - 4,
      GRID_SIZE - 4
    );

    // Draw game over overlay
    if (gameState === "gameOver") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      
      ctx.fillStyle = "#ef4444";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("GAME OVER", canvasSize.width / 2, canvasSize.height / 2 - 50);
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "24px Arial";
      ctx.fillText("Press 'R' to restart", canvasSize.width / 2, canvasSize.height / 2 + 20);
    }

    // Draw pause overlay
    if (gameState === "paused") {
      ctx.fillStyle = "rgba(0, 0, 0, 0.6)";
      ctx.fillRect(0, 0, canvasSize.width, canvasSize.height);
      
      ctx.fillStyle = "#fbbf24";
      ctx.font = "48px Arial";
      ctx.textAlign = "center";
      ctx.fillText("PAUSED", canvasSize.width / 2, canvasSize.height / 2);
    }
  }, [snake, food, gameState, canvasSize, gridWidth, gridHeight]);

  // Game control functions
  const startGame = () => {
    setGameState("playing");
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameSpeed(150);
    inputBufferRef.current = null;
  };

  const togglePause = () => {
    setGameState(prev => prev === "paused" ? "playing" : "paused");
  };

  const resetGame = () => {
    setGameState("idle");
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    setFood(INITIAL_FOOD);
    setScore(0);
    setGameSpeed(150);
    inputBufferRef.current = null;
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
    }
  };

  // Handle restart keypress
  useEffect(() => {
    const handleRestart = (e: KeyboardEvent) => {
      if (gameState === "gameOver" && e.key === "r") {
        startGame();
      }
    };

    window.addEventListener("keydown", handleRestart);
    return () => window.removeEventListener("keydown", handleRestart);
  }, [gameState]);

  return (
    <div className="flex flex-col items-center space-y-6">
      <ScoreBoard score={score} highScore={highScore} />
      
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={canvasSize.width}
          height={canvasSize.height}
          className="border-2 border-gray-700 rounded-lg shadow-2xl"
        />
      </div>

      <GameControls
        gameState={gameState}
        onStart={startGame}
        onPause={togglePause}
        onReset={resetGame}
        onDirectionChange={(newDirection) => {
          if (gameState === "playing") {
            inputBufferRef.current = newDirection;
            setDirection(newDirection);
          }
        }}
      />

      <div className="text-center text-gray-400 text-sm max-w-md">
        <p className="mb-2">
          Use <kbd className="px-2 py-1 bg-gray-700 rounded">↑↓←→</kbd> arrow keys or{" "}
          <kbd className="px-2 py-1 bg-gray-700 rounded">WASD</kbd> to control the snake
        </p>
        <p>
          Press <kbd className="px-2 py-1 bg-gray-700 rounded">Space</kbd> to pause, 
          <kbd className="px-2 py-1 bg-gray-700 rounded ml-1">R</kbd> to restart after game over
        </p>
      </div>
    </div>
  );
}