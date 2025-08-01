// Tax Frontend
import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState({
    sec80c: '',
    sec80d: '',
    sec80e: ''
  });
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
 
  const handleDeductionsChange = (e) => {
    const { name, value } = e.target;
    setDeductions({ ...deductions, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setResult(null);

    try {
      const res = await axios.post('http://localhost:8000/api/calculate-tax', {
        income: parseFloat(income),
        deductions: {
          sec80c: parseFloat(deductions.sec80c) || 0,
          sec80d: parseFloat(deductions.sec80d) || 0,
          sec80e: parseFloat(deductions.sec80e) || 0
        }
      });

      setResult(res.data);
    } catch (err) {
      if (err.response?.data?.error) {
        setError(err.response.data.error);
      } else {
        setError("Something went wrong. Please try again.");
      }
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-6 font-sans">
      <div className="bg-blue-200 shadow-xl rounded-2xl p-8 w-full max-w-lg">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Income Tax Calculator</h2>
        <form onSubmit={handleSubmit} className="space-y-4 ">
          <div>
            <label className="block text-gray-700 mb-1 font-bold">Income:</label>
            <input
              type="number"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
              required
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-bold">Deduction under 80C:</label>
            <input
              type="number"
              name="sec80c"
              value={deductions.sec80c}
              onChange={handleDeductionsChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-bold">Deduction under 80D:</label>
            <input
              type="number"
              name="sec80d"
              value={deductions.sec80d}
              onChange={handleDeductionsChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

          <div>
            <label className="block text-gray-700 mb-1 font-bold">Deduction under 80E:</label>
            <input
              type="number"
              name="sec80e"
              value={deductions.sec80e}
              onChange={handleDeductionsChange}
              className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>

         <button type="submit" className="bg-blue-500 text-white py-3 px-8 rounded-lg hover:bg-blue-700 transition w-fit mx-auto block">
            Calculate Tax
          </button>
        </form>

        {error && (
          <div className="text-red-600 mt-4 bg-red-100 p-2 rounded-lg">
            <strong>Error:</strong> {JSON.stringify(error)}
          </div>
        )}

        {result && (
          <div className="mt-6 text-gray-800">
            <h3 className="text-xl font-semibold mb-2 text-blue-700">Tax Calculation Result</h3>
            <p><strong>Income:</strong> ₹{result.income}</p>
            <p><strong>Total Deduction:</strong> ₹{result.totalDeduction}</p>
            <p><strong>Taxable Income:</strong> ₹{result.taxableIncome}</p>
            <p><strong>Calculated Tax </strong> ₹{result.tax}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
