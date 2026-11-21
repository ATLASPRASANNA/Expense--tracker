import { useState, useEffect } from 'react';

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem('expenses');
    return saved ? JSON.parse(saved) : [];
  });

  const [categories, setCategories] = useState(() => {
    const saved = localStorage.getItem('expense_categories');
    return saved
      ? JSON.parse(saved)
      : ['Food', 'Travel', 'Bills', 'Shopping', 'Rent', 'Fuel', 'Salary', 'Other'];
  });

  const [budget, setBudget] = useState(() => {
    const saved = localStorage.getItem('expense_budget');
    return saved ? parseFloat(saved) : 10000;
  });

  const [text, setText] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('expense');
  const [category, setCategory] = useState('Food');
  const [filterCategory, setFilterCategory] = useState('All');
  const [newCategory, setNewCategory] = useState('');
  const [showAddCat, setShowAddCat] = useState(false);

  useEffect(() => {
    localStorage.setItem('expenses', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('expense_categories', JSON.stringify(categories));
  }, [categories]);

  useEffect(() => {
    localStorage.setItem('expense_budget', budget.toString());
  }, [budget]);

  const addTransaction = (e) => {
    e.preventDefault();
    if (!text.trim() || !amount) return;

    const newItem = {
      id: Date.now(),
      text,
      amount: parseFloat(amount),
      type,
      category,
      date: new Date().toLocaleDateString('en-IN'),
    };

    setTransactions([newItem, ...transactions]);
    setText('');
    setAmount('');
  };

  const deleteTransaction = (id) => {
    setTransactions(transactions.filter((item) => item.id !== id));
  };

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (!trimmed || categories.includes(trimmed)) return;
    setCategories([...categories, trimmed]);
    setCategory(trimmed);
    setNewCategory('');
    setShowAddCat(false);
  };

  const exportCSV = () => {
    if (transactions.length === 0) return;
    const headers = ['Date,Description,Category,Type,Amount (INR)'];
    const rows = transactions.map(
      (t) => `"${t.date}","${t.text.replace(/"/g, '""')}","${t.category}","${t.type}",${t.amount}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', 'expense_tracker.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const income = transactions
    .filter((t) => t.type === 'income')
    .reduce((acc, t) => acc + t.amount, 0);

  const expense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((acc, t) => acc + t.amount, 0);

  const balance = income - expense;
  const budgetPercent = budget > 0 ? Math.min((expense / budget) * 100, 100) : 0;

  const filteredTransactions =
    filterCategory === 'All'
      ? transactions
      : transactions.filter((t) => t.category === filterCategory);

  const categoryTotals = categories
    .map((cat) => ({
      name: cat,
      total: transactions
        .filter((t) => t.type === 'expense' && t.category === cat)
        .reduce((sum, t) => sum + t.amount, 0),
    }))
    .filter((c) => c.total > 0);

  return (
    <div style={{ maxWidth: '480px', margin: '20px auto', fontFamily: 'sans-serif', padding: '20px', color: '#fff', backgroundColor: '#1e1e2e', borderRadius: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h2 style={{ margin: 0 }}>Expense Tracker</h2>
        <button
          onClick={exportCSV}
          style={{ padding: '6px 10px', background: '#3b3b52', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
        >
          Export CSV
        </button>
      </div>

      {/* Balance & Income/Expense Card */}
      <div style={{ background: '#2a2a3c', padding: '15px', borderRadius: '8px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '14px', color: '#aaa' }}>Current Balance</div>
        <div style={{ fontSize: '28px', fontWeight: 'bold', margin: '5px 0' }}>₹{balance.toFixed(2)}</div>
        <div style={{ display: 'flex', justifyContent: 'space-around', gap: '16px', marginTop: '10px' }}>
          <div style={{ color: '#4ade80' }}>Income: +₹{income.toFixed(2)}</div>
          <div style={{ color: '#f87171' }}>Expense: -₹{expense.toFixed(2)}</div>
        </div>
      </div>

      {/* Monthly Budget Bar */}
      <div style={{ background: '#2a2a3c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '13px', marginBottom: '6px' }}>
          <span style={{ color: '#aaa' }}>Monthly Expense Budget:</span>
          <div>
            ₹
            <input
              type="number"
              value={budget}
              onChange={(e) => setBudget(parseFloat(e.target.value) || 0)}
              style={{ width: '80px', background: '#1e1e2e', color: '#fff', border: '1px solid #444', borderRadius: '4px', padding: '2px 6px', marginLeft: '4px' }}
            />
          </div>
        </div>
        <div style={{ width: '100%', height: '8px', background: '#1e1e2e', borderRadius: '4px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${budgetPercent}%`,
              height: '100%',
              background: expense > budget ? '#ef4444' : '#6366f1',
              transition: 'width 0.3s ease',
            }}
          />
        </div>
        <div style={{ fontSize: '11px', color: expense > budget ? '#f87171' : '#aaa', marginTop: '4px', textAlign: 'right' }}>
          ₹{expense.toFixed(0)} / ₹{budget.toFixed(0)} ({budgetPercent.toFixed(0)}%)
        </div>
      </div>

      {/* Add Transaction Form */}
      <form onSubmit={addTransaction} style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
        <input
          type="text"
          placeholder="Description (e.g., Lunch, Salary)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: 'none' }}
        />
        <input
          type="number"
          placeholder="Amount in ₹"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ padding: '10px', borderRadius: '6px', border: 'none' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          <select value={type} onChange={(e) => setType(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px' }}>
            <option value="expense">Expense (-)</option>
            <option value="income">Income (+)</option>
          </select>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ flex: 1, padding: '10px', borderRadius: '6px' }}>
            {categories.map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowAddCat(!showAddCat)}
            title="Add New Category"
            style={{ padding: '0 12px', background: '#3b3b52', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            +
          </button>
        </div>

        {/* Custom Category Creator */}
        {showAddCat && (
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              type="text"
              placeholder="New category name (e.g., Medical)"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              style={{ flex: 1, padding: '8px', borderRadius: '6px', border: 'none' }}
            />
            <button
              type="button"
              onClick={handleAddCategory}
              style={{ padding: '8px 14px', background: '#4ade80', color: '#111', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
            >
              Save
            </button>
          </div>
        )}

        <button type="submit" style={{ padding: '12px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
          Add Transaction
        </button>
      </form>

      {/* Spending by Category Badges */}
      {categoryTotals.length > 0 && (
        <div style={{ background: '#2a2a3c', padding: '12px', borderRadius: '8px', marginBottom: '16px' }}>
          <div style={{ fontSize: '13px', color: '#aaa', marginBottom: '8px' }}>Spending by Category</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {categoryTotals.map((c) => (
              <span
                key={c.name}
                onClick={() => setFilterCategory(filterCategory === c.name ? 'All' : c.name)}
                style={{
                  background: filterCategory === c.name ? '#6366f1' : '#1e1e2e',
                  padding: '4px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: filterCategory === c.name ? '#fff' : '#f87171',
                  cursor: 'pointer',
                }}
              >
                {c.name}: ₹{c.total.toFixed(0)}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* History & Filter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #444', paddingBottom: '8px', marginBottom: '12px' }}>
        <h4 style={{ margin: 0 }}>History</h4><select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          style={{ padding: '4px 8px', borderRadius: '6px', fontSize: '12px' }}
        >
          <option value="All">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {filteredTransactions.length === 0 ? (
        <p style={{ color: '#888', textAlign: 'center' }}>No transactions found.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredTransactions.map((item) => (
            <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#2a2a3c', padding: '10px 12px', borderRadius: '6px', borderLeft: `4px solid ${item.type === 'income' ? '#4ade80' : '#f87171'}` }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>{item.text}</div>
                <div style={{ fontSize: '12px', color: '#aaa' }}>{item.category} • {item.date}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ color: item.type === 'income' ? '#4ade80' : '#f87171', fontWeight: 'bold' }}>
                  {item.type === 'income' ? '+' : '-'}₹{item.amount.toFixed(2)}
                </span>
                <button onClick={() => deleteTransaction(item.id)} style={{ background: 'transparent', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '16px' }}>
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}