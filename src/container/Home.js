import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";

function App() {
  const initialAmount = 100000;

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Food");
  const [type, setType] = useState("expense");
  const [date, setDate] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    const savedTransactions = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(savedTransactions);
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const calculateBalance = () => {
    const totalIncome = transactions
      .filter((transaction) => transaction.type === "income")
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    const totalExpense = transactions
      .filter((transaction) => transaction.type === "expense")
      .reduce((acc, transaction) => acc + transaction.amount, 0);

    return initialAmount + totalIncome - totalExpense;
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();

    const today = new Date().toISOString().split("T")[0];
    if (date > today) {
      alert("You cannot enter a future date.");
      return;
    }

    if (type === "expense" && parseFloat(amount) > calculateBalance()) {
      alert("You don't have enough money!");
      return;
    }

    const newTransaction = {
      id: Date.now(),
      type,
      amount: parseFloat(amount),
      description,
      category,
      date,
    };

    setTransactions((prev) => [...prev, newTransaction]);
    setAmount("");
    setDescription("");
    setCategory("Food");
    setType("expense");
    setDate("");
  };

  const handleDownloadCSV = () => {
    const data = filteredTransactions.length ? filteredTransactions : transactions;

    const csvRows = [];
    const headers = ["ID", "Type", "Amount", "Description", "Category", "Date"];
    csvRows.push(headers.join(","));

    data.forEach((transaction) => {
      const row = [
        transaction.id,
        transaction.type,
        transaction.amount,
        `"${transaction.description}"`,
        transaction.category,
        transaction.date,
      ];
      csvRows.push(row.join(","));
    });

    const csvString = csvRows.join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8" });

    saveAs(blob, "transactions.csv");
  };

  const applyQuickFilter = (filterType) => {
    setActiveFilter(filterType);
    switch (filterType) {
      case "income":
        setFilteredTransactions(transactions.filter(t => t.type === "income"));
        break;
      case "expense":
        setFilteredTransactions(transactions.filter(t => t.type === "expense"));
        break;
      case "all":
        setFilteredTransactions([]);
        break;
      default:
        break;
    }
  };

  const displayedTransactions = filteredTransactions.length ? filteredTransactions : transactions;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold text-indigo-800 mb-2">Cash Flow Tracker</h1>
          <p className="text-lg text-gray-600">Track your income and expenses with ease</p>
        </header>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Total Balance</p>
                <h3 className="text-3xl font-bold mt-1">${calculateBalance().toLocaleString()}</h3>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 shadow-lg text-white">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm font-medium">Total Expense</p>
                <h3 className="text-3xl font-bold mt-1">
                  -${transactions
                    .filter(t => t.type === "expense")
                    .reduce((acc, t) => acc + t.amount, 0)
                    .toLocaleString()}
                </h3>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-8 rounded-xl mb-10 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Add New Transaction</h2>
          <form onSubmit={handleAddTransaction} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="amount" className="text-sm font-medium text-gray-700">Amount</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-500">$</div>
                  <input
                    type="number"
                    id="amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    step="0.01"
                    min="0"
                    className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's this for?"
                  required
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label htmlFor="category" className="text-sm font-medium text-gray-700">Category</label>
                <select
                  id="category"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="Food">Food</option>
                  <option value="Entertainment">Entertainment</option>
                  <option value="Bills">Bills</option>
                  <option value="Transport">Transport</option>
                  <option value="Shopping">Shopping</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label htmlFor="type" className="text-sm font-medium text-gray-700">Type</label>
                <select
                  id="type"
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label htmlFor="date" className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              >
                Add Transaction
              </button>
            </div>
          </form>
        </div>

        {/* Transaction Filters */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Transaction Filters</h2>
          <div className="flex flex-wrap gap-4 mb-6">
            <button
              onClick={() => applyQuickFilter("all")}
              className={`px-6 py-3 rounded-lg text-sm font-medium ${activeFilter === "all" ? 'bg-indigo-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
            >
              All Transactions
            </button>
            <button
              onClick={() => applyQuickFilter("income")}
              className={`px-6 py-3 rounded-lg text-sm font-medium ${activeFilter === "income" ? 'bg-green-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
            >
              Income Only
            </button>
            <button
              onClick={() => applyQuickFilter("expense")}
              className={`px-6 py-3 rounded-lg text-sm font-medium ${activeFilter === "expense" ? 'bg-red-600 text-white' : 'bg-gray-300 hover:bg-gray-400 text-gray-800'}`}
            >
              Expense Only
            </button>
            <div className="flex space-x-4 items-center">
              <button
                onClick={() => setStartDate("") & setEndDate("")}
                className="px-6 py-3 rounded-lg text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">All Transactions</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-white rounded-lg shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Amount</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Category</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Type</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Date</th>
                  <th className="px-6 py-3 text-left text-sm font-medium text-gray-600">Description</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.map(transaction => (
                  <tr key={transaction.id} className="border-t">
                    <td className="px-6 py-4 text-sm text-gray-800">{transaction.amount.toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{transaction.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{transaction.type}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{transaction.date}</td>
                    <td className="px-6 py-4 text-sm text-gray-800">{transaction.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Download CSV Button */}
        <div className="text-center mt-6">
          <button
            onClick={handleDownloadCSV}
            className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg shadow-md"
          >
            Download Transactions as CSV
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
