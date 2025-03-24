import React, { useState, useEffect } from 'react';
import GameBoard from './components/GameBoard';
import Scoreboard from './components/ScoreBoard';
import GameSettings from './components/GameSettings';

function App() {
  const [gameId, setGameId] = useState(null);
  const [game, setGame] = useState(null);
  const [settings, setSettings] = useState({
    difficulty: 'hard',
    aiFirst: false,
    showAiThinking: false
  });
  const [scores, setScores] = useState({
    player: 0,
    ai: 0,
    draws: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a new game
  const createGame = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${import.meta.env.VITE_API}/games`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: settings.difficulty,
          aiFirst: settings.aiFirst,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create game');
      }

      const data = await response.json();
      setGameId(data.gameId);
      setGame(data.game);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Make a player move
  const makeMove = async (row, col) => {
    if (!gameId || game.gameOver || game.currentTurn !== 'Player' || game.board[row][col] !== ' ') {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/games/${gameId}/move`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ row, col }),
      });

      if (!response.ok) {
        throw new Error('Failed to make move');
      }

      const data = await response.json();
      setGame(data.game);

      // Update scores if game is over
      if (data.game.gameOver) {
        if (data.game.winner === 'Player') {
          setScores(prev => ({ ...prev, player: prev.player + 1 }));
        } else if (data.game.winner === 'AI') {
          setScores(prev => ({ ...prev, ai: prev.ai + 1 }));
        } else {
          setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
        }
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset the game
  const resetGame = async () => {
    if (!gameId) {
      await createGame();
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/games/${gameId}/reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          difficulty: settings.difficulty,
          aiFirst: settings.aiFirst,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to reset game');
      }

      const data = await response.json();
      setGame(data.game);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Reset scores
  const resetScores = () => {
    setScores({
      player: 0,
      ai: 0,
      draws: 0
    });
  };

  // Update settings
  const updateSettings = (newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  // Initialize game on component mount
  useEffect(() => {
    createGame();
  }, []);

  // Show error message if any
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gray-100 p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-6">{error}</p>
          <button 
            onClick={() => { setError(null); createGame(); }}
            className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transition-colors duration-200"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 text-gray-800">
      <header className="bg-indigo-600 text-white shadow-lg py-4">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center">🎮 Tic Tac Toe - AI vs Human</h1>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <div className="lg:grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 mb-8 lg:mb-0">
            <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
              {loading && (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              )}
              
              {game && !loading && (
                <>
                  <div className="mb-6">
                    {game.gameOver ? (
                      <div className={`text-center text-xl font-bold p-3 rounded-lg ${
                        game.winner === 'Player' 
                          ? 'bg-green-100 text-green-700' 
                          : game.winner === 'AI' 
                            ? 'bg-red-100 text-red-700' 
                            : 'bg-blue-100 text-blue-700'
                      }`}>
                        {game.winner === 'Player' && '🎉 You Win! 🎉'}
                        {game.winner === 'AI' && '🤖 AI Wins! Better luck next time.'}
                        {game.winner === 'Draw' && '🤝 It\'s a Draw!'}
                      </div>
                    ) : (
                      <div className="text-center text-xl font-semibold p-3 bg-indigo-100 text-indigo-700 rounded-lg">
                        {game.currentTurn === 'Player' ? '👤 Your Turn...' : '🤖 AI\'s Turn...'}
                      </div>
                    )}
                  </div>

                  <GameBoard 
                    board={game.board} 
                    winningCells={game.winningCells} 
                    onCellClick={makeMove} 
                    gameOver={game.gameOver} 
                  />

                  <div className="flex space-x-4 mt-6">
                    <button 
                      onClick={resetGame} 
                      className="flex-1 py-2 px-4 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-75"
                    >
                      🔄 New Game
                    </button>
                    <button 
                      onClick={() => setSettings(prev => ({ ...prev, showAiThinking: !prev.showAiThinking }))} 
                      className={`flex-1 py-2 px-4 font-semibold rounded-lg shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-opacity-75 ${
                        settings.showAiThinking 
                          ? 'bg-pink-600 hover:bg-pink-700 text-white focus:ring-pink-500' 
                          : 'bg-purple-600 hover:bg-purple-700 text-white focus:ring-purple-500'
                      }`}
                    >
                      {settings.showAiThinking ? '🧠 Hide AI Thinking' : '🧠 Show AI Thinking'}
                    </button>
                  </div>
                </>
              )}
            </div>

            {settings.showAiThinking && game && (
              <div className="bg-white rounded-xl shadow-xl p-6 mb-6">
                <h3 className="text-xl font-bold mb-4 text-purple-700">🧠 AI's Thinking</h3>
                <div className="mb-4">
                  {game.scores.map((row, i) => (
                    <div key={`row-${i}`} className="flex">
                      {row.map((score, j) => {
                        const cellContent = game.board[i][j];
                        const displayScore = score !== null ? score : '';
                        
                        // Style based on score
                        let bgColor = 'bg-gray-100';
                        let textColor = 'text-gray-700';
                        
                        if (displayScore !== '') {
                          if (displayScore > 0) {
                            bgColor = displayScore > 5 ? 'bg-red-200' : 'bg-red-100';
                            textColor = 'text-red-700';
                          } else if (displayScore < 0) {
                            bgColor = displayScore < -5 ? 'bg-green-200' : 'bg-green-100';
                            textColor = 'text-green-700';
                          } else {
                            textColor = 'text-blue-700';
                            bgColor = 'bg-blue-100';
                          }
                        }
                        
                        return (
                          <div 
                            key={`cell-${i}-${j}`} 
                            className={`flex items-center justify-center h-16 w-16 border border-gray-300 ${bgColor} ${textColor} text-lg font-semibold`}
                          >
                            {cellContent === 'X' ? '❌' : cellContent === 'O' ? '⭕' : ''} {displayScore}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium mb-2">The AI evaluates each possible move and assigns a score:</p>
                  <ul className="list-disc pl-5 space-y-1">
                    <li className="text-red-600">Positive scores favor the AI</li>
                    <li className="text-green-600">Negative scores favor the player</li>
                    <li className="text-blue-600">Zero indicates a likely draw</li>
                  </ul>
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="space-y-6">
              <GameSettings 
                settings={settings}
                updateSettings={updateSettings}
                resetGame={resetGame}
              />
              
              <Scoreboard 
                scores={scores} 
                resetScores={resetScores} 
              />
              
              <div className="bg-white rounded-xl shadow-xl p-6">
                <h3 className="text-xl font-bold mb-4 text-indigo-700">ℹ️ How to Play</h3>
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Game Rules</h4>
                    <ul className="list-disc pl-5 space-y-1 text-gray-700">
                      <li>You play as ⭕, the AI plays as ❌</li>
                      <li>Take turns placing your symbol on the board</li>
                      <li>Get three of your symbols in a row (horizontal, vertical, or diagonal) to win</li>
                      <li>If all spaces are filled with no winner, the game is a draw</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-lg font-semibold mb-2">Difficulty Levels</h4>
                    <ul className="pl-5 space-y-1 text-gray-700">
                      <li><span className="font-semibold text-green-600">Easy:</span> AI makes some mistakes and doesn't look ahead much</li>
                      <li><span className="font-semibold text-yellow-600">Medium:</span> AI plays better but still makes occasional mistakes</li>
                      <li><span className="font-semibold text-red-600">Hard:</span> AI plays optimally using the minimax algorithm</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-indigo-700 text-white py-4 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p>Tic Tac Toe - AI Powered Game | Built with React and Express</p>
        </div>
      </footer>
    </div>
  );
}

export default App;