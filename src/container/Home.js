import React, { useState, useEffect } from "react";
import { saveAs } from "file-saver";

function App() {
  const initialAmount = 100000;

  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    category: "Food",
    type: "expense",
    date: "",
  });
  const [editId, setEditId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("transactions")) || [];
    setTransactions(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const calculateBalance = () => {
    const totalIncome = transactions
      .filter((t) => t.type === "income")
      .reduce((acc, t) => acc + t.amount, 0);
    const totalExpense = transactions
      .filter((t) => t.type === "expense")
      .reduce((acc, t) => acc + t.amount, 0);
    return initialAmount + totalIncome - totalExpense;
  };

  const handleAddTransaction = (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    if (formData.date > today) {
      alert("You cannot enter a future date.");
      return;
    }

    if (
      formData.type === "expense" &&
      parseFloat(formData.amount) > calculateBalance() &&
      editId === null
    ) {
      alert("You don't have enough money!");
      return;
    }

    const newTransaction = {
      id: editId || Date.now(),
      ...formData,
      amount: parseFloat(formData.amount),
    };

    if (editId) {
      setTransactions((prev) =>
        prev.map((t) => (t.id === editId ? newTransaction : t))
      );
      setEditId(null);
    } else {
      setTransactions((prev) => [...prev, newTransaction]);
    }

    setFormData({
      amount: "",
      description: "",
      category: "Food",
      type: "expense",
      date: "",
    });
  };

  const handleEdit = (transaction) => {
    setFormData({
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      type: transaction.type,
      date: transaction.date,
    });
    setEditId(transaction.id);
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("Delete this transaction?");
    if (confirmDelete) {
      const updated = transactions.filter((t) => t.id !== id);
      setTransactions(updated);


      if (activeFilter !== "all") {
        setFilteredTransactions(updated.filter((t) => t.type === activeFilter));
      }
    }
  };

  const handleDownloadCSV = () => {
    const data = filteredTransactions.length ? filteredTransactions : transactions;
    const csvRows = [
      ["ID", "Type", "Amount", "Description", "Category", "Date"].join(","),
    ];

    data.forEach((t) => {
      csvRows.push(
        [t.id, t.type, t.amount, `"${t.description}"`, t.category, t.date].join(",")
      );
    });

    const blob = new Blob([csvRows.join("\n")], {
      type: "text/csv;charset=utf-8",
    });

    saveAs(blob, "transactions.csv");
  };

  const applyQuickFilter = (filterType) => {
    setActiveFilter(filterType);
    switch (filterType) {
      case "income":
        setFilteredTransactions(transactions.filter((t) => t.type === "income"));
        break;
      case "expense":
        setFilteredTransactions(transactions.filter((t) => t.type === "expense"));
        break;
      case "all":
        setFilteredTransactions([]);
        break;
      default:
        break;
    }
  };

  const applyDateRangeFilter = () => {
    if (!dateRange.startDate || !dateRange.endDate) {
      setFilteredTransactions(transactions);
    } else {
      const filtered = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        const startDate = new Date(dateRange.startDate);
        const endDate = new Date(dateRange.endDate);
        return transactionDate >= startDate && transactionDate <= endDate;
      });
      setFilteredTransactions(filtered);
    }
  };

  const displayedTransactions = filteredTransactions.length
    ? filteredTransactions
    : transactions;

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((acc, t) => acc + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((acc, t) => acc + t.amount, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto bg-white p-8 rounded-xl shadow-lg">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-semibold text-indigo-800 mb-2">
            Cash Flow Tracker
          </h1>
          <p className="text-lg text-gray-600">
            Track your income and expenses with ease
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 shadow-lg text-white">
            <p className="text-sm font-medium">Total Balance</p>
            <h3 className="text-3xl font-bold mt-1">
              ${calculateBalance().toLocaleString()}
            </h3>
          </div>

         
      

          <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-6 shadow-lg text-white">
            <p className="text-sm font-medium">Total Expense</p>
            <h3 className="text-3xl font-bold mt-1">
              -${totalExpense.toLocaleString()}
            </h3>
          </div>
        </div>




        <div className="bg-gray-50 p-8 rounded-xl mb-10 border border-gray-200 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            {editId ? "Edit Transaction" : "Add New Transaction"}
          </h2>
          <form onSubmit={handleAddTransaction} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Amount</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  placeholder="0.00"
                  required
                  step="0.01"
                  min="0"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Description</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="What's this for?"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) =>
                    setFormData({ ...formData, category: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
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
                <label className="text-sm font-medium text-gray-700">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                >
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">Date</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  required
                  max={new Date().toISOString().split("T")[0]}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-lg"
            >
              {editId ? "Update Transaction" : "Add Transaction"}
            </button>
          </form>
        </div>





                <div className="mb-10">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Filter by Date Range
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="text-sm font-medium text-gray-700">Start Date</label>
              <input
                type="date"
                value={dateRange.startDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, startDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">End Date</label>
              <input
                type="date"
                value={dateRange.endDate}
                onChange={(e) =>
                  setDateRange({ ...dateRange, endDate: e.target.value })
                }
                className="w-full px-4 py-3 border border-gray-300 rounded-lg"
              />
            </div>

            <div className="flex items-end">
              <button
                onClick={applyDateRangeFilter}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-lg w-full sm:w-auto"
              >
                Apply Date Range
              </button>
            </div>
          </div>
        </div>


        <div>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            All Transactions
          </h2>
          <div className="overflow-x-auto">
            <table className="min-w-full table-auto bg-white rounded-lg shadow-sm overflow-hidden">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-4 py-2 text-left">Amount</th>
                  <th className="px-4 py-2 text-left">Category</th>
                  <th className="px-4 py-2 text-left">Type</th>
                  <th className="px-4 py-2 text-left">Date</th>
                  <th className="px-4 py-2 text-left">Description</th>
                  <th className="px-4 py-2 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {displayedTransactions.map((t) => (
                  <tr
                    key={t.id}
                    className={`border-t ${
                      t.type === "income"
                        ? "bg-green-50 text-green-700"
                        : "bg-red-50 text-red-700"
                    }`}
                  >
                    <td className="px-4 py-2">${t.amount.toFixed(2)}</td>
                    <td className="px-4 py-2">{t.category}</td>
                    <td className="px-4 py-2 capitalize">{t.type}</td>
                    <td className="px-4 py-2">{t.date}</td>
                    <td className="px-4 py-2">{t.description}</td>
                    <td className="px-4 py-2 space-x-2 text-center">
                      <button
                        onClick={() => handleEdit(t)}
                        className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

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
