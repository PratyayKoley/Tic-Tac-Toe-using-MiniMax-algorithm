import React from 'react';

const GameSettings = ({ settings, updateSettings, resetGame }) => {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    updateSettings({ [name]: type === 'checkbox' ? checked : value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    resetGame();
  };

  return (
    <div className="bg-white rounded-xl shadow-xl p-6">
      <h3 className="text-xl font-bold mb-4 text-indigo-700">⚙️ Game Settings</h3>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 font-medium mb-2">
            Difficulty
          </label>
          <div className="flex space-x-2">
            {['easy', 'medium', 'hard'].map((level) => (
              <label 
                key={level}
                className={`
                  flex-1 cursor-pointer rounded-lg border-2 p-2 text-center text-sm font-medium transition-all duration-200
                  ${settings.difficulty === level 
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                    : 'border-gray-300 bg-white text-gray-700 hover:bg-gray-50'}
                `}
              >
                <input
                  type="radio"
                  name="difficulty"
                  value={level}
                  checked={settings.difficulty === level}
                  onChange={handleChange}
                  className="sr-only"
                />
                <span className="capitalize">{level}</span>
              </label>
            ))}
          </div>
        </div>
        
        <div className="mb-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              name="aiFirst"
              checked={settings.aiFirst}
              onChange={handleChange}
              className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 transition duration-150"
            />
            <span className="text-gray-700 font-medium">AI goes first</span>
          </label>
        </div>
        
        <button
          type="submit"
          className="w-full py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75"
        >
          Apply Settings & Restart
        </button>
      </form>
    </div>
  );
};

export default GameSettings;