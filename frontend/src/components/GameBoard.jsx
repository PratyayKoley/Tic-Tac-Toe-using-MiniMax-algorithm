import React from 'react';

const GameBoard = ({ board, winningCells, onCellClick, gameOver }) => {
  // Check if a cell is part of the winning combination
  const isWinningCell = (row, col) => {
    if (!winningCells) return false;
    return winningCells.some(([r, c]) => r === row && c === col);
  };

  return (
    <div className="w-full max-w-xs mx-auto">
      {board.map((row, rowIndex) => (
        <div key={`row-${rowIndex}`} className="flex">
          {row.map((cell, colIndex) => {
            const isWinning = isWinningCell(rowIndex, colIndex);
            const isEmpty = cell === ' ';
            
            return (
              <button
                key={`cell-${rowIndex}-${colIndex}`}
                className={`
                  w-16 h-16 flex items-center justify-center text-2xl font-bold
                  border-2 border-indigo-300 transition-all duration-200
                  ${rowIndex < 2 ? 'border-b-4' : ''} 
                  ${colIndex < 2 ? 'border-r-4' : ''}
                  ${isWinning ? 'bg-yellow-100' : 'bg-white'}
                  ${isEmpty && !gameOver ? 'hover:bg-indigo-50' : ''}
                  ${gameOver || !isEmpty ? 'cursor-default' : 'cursor-pointer'}
                `}
                onClick={() => onCellClick(rowIndex, colIndex)}
                disabled={gameOver || !isEmpty}
              >
                {cell === 'X' && <span className="text-red-500">❌</span>}
                {cell === 'O' && <span className="text-blue-500">⭕</span>}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export default GameBoard;