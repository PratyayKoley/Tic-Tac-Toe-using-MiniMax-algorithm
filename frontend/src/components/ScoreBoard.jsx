import React from 'react';

const Scoreboard = ({ scores, resetScores }) => {
  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-indigo-700">📊 Scoreboard</h3>
        <button
          onClick={resetScores}
          className="text-sm py-1 px-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-md transition-colors duration-200"
        >
          Reset
        </button>
      </div>
      
      <div className="grid grid-cols-3 gap-2 mb-2">
        <div className="bg-blue-100 rounded-lg p-3 text-center">
          <div className="text-sm text-blue-700 font-medium">You</div>
          <div className="text-2xl font-bold text-blue-800">{scores.player}</div>
        </div>
        
        <div className="bg-red-100 rounded-lg p-3 text-center">
          <div className="text-sm text-red-700 font-medium">AI</div>
          <div className="text-2xl font-bold text-red-800">{scores.ai}</div>
        </div>
        
        <div className="bg-gray-100 rounded-lg p-3 text-center">
          <div className="text-sm text-gray-700 font-medium">Draws</div>
          <div className="text-2xl font-bold text-gray-800">{scores.draws}</div>
        </div>
      </div>
      
      <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
          style={{ 
            width: `${scores.player === 0 && scores.ai === 0 ? 50 : Math.round((scores.player / (scores.player + scores.ai + scores.draws)) * 100)}%` 
          }}
        ></div>
      </div>
      
      <div className="mt-2 text-sm text-center text-gray-600">
        {scores.player + scores.ai + scores.draws} games played
      </div>
    </div>
  );
};

export default Scoreboard;