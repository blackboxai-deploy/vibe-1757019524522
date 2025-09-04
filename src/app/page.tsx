"use client";

import SnakeGame from "@/components/SnakeGame";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold text-green-400 mb-4">
            SNAKE GAME
          </h1>
          <p className="text-gray-300 text-lg">
            Classic arcade fun - Use arrow keys or WASD to control the snake
          </p>
        </div>
        <SnakeGame />
      </div>
    </main>
  );
}