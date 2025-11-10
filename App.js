const { useState, useEffect } = React;
const { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } = Recharts;
const { DollarSign, TrendingUp, TrendingDown, Target, CreditCard, PiggyBank, AlertCircle } = lucide;

const App = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [income, setIncome] = useState({ monthly: 0, additional: [] });
  const [expenses, setExpenses] = useState({ fixed: [], variable: [] });
  const [savings, setSavings] = useState([]);
  const [creditCards, setCreditCards] = useState([]);
  const [loans, setLoans] = useState([]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const incomeData = await window.storage.get('budget-income');
        const expensesData = await window.storage.get('budget-expenses');
        const savingsData = await window.storage.get('budget-savings');
        const creditCardsData = await window.storage.get('budget-creditcards');
        const loansData = await window.storage.get('budget-loans');

        if (incomeData) setIncome(JSON.parse(incomeData.value));
        if (expensesData) setExpenses(JSON.parse(expensesData.value));
        if (savingsData) setSavings(JSON.parse(savingsData.value));
        if (creditCardsData) setCreditCards(JSON.parse(creditCardsData.value));
        if (loansData) setLoans(JSON.parse(loansData.value));
      } catch (error) {
        console.log('No saved data found, starting fresh');
      }
    };
    loadData();
  }, []);

  const saveData = async () => {
    try {
      await window.storage.set('budget-income', JSON.stringify(income));
      await window.storage.set('budget-expenses', JSON.stringify(expenses));
      await window.storage.set('budget-savings', JSON.stringify(savings));
      await window.storage.set('budget-creditcards', JSON.stringify(creditCards));
      await window.storage.set('budget-loans', JSON.stringify(loans));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  };

  useEffect(() => {
    saveData();
  }, [income, expenses, savings, creditCards, loans]);

  const calculateTotals = () => {
    const totalIncome = income.monthly + income.additional.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalFixed = expenses.fixed.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalVariable = expenses.variable.reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    const totalExpenses = totalFixed + totalVariable;
    const totalCreditCardDebt = creditCards.reduce((sum, card) => sum + parseFloat(card.balance || 0), 0);
    const totalCreditCardPayments = creditCards.reduce((sum, card) => sum + parseFloat(card.minPayment || 0), 0);
    const totalLoanDebt = loans.reduce((sum, loan) => sum + parseFloat(loan.balance || 0), 0);
    const totalLoanPayments = loans.reduce((sum, loan) => sum + parseFloat(loan.payment || 0), 0);
    const totalDebt = totalCreditCardDebt + totalLoanDebt;
    const totalDebtPayments = totalCreditCardPayments + totalLoanPayments;
    const totalSavingsGoal = savings.reduce((sum, item) => sum + parseFloat(item.target || 0), 0);
    const remaining = totalIncome - totalExpenses - totalDebtPayments;

    return { 
      totalIncome, totalFixed, totalVariable, totalExpenses, remaining, totalSavingsGoal, 
      totalCreditCardDebt, totalCreditCardPayments, totalLoanDebt, totalLoanPayments,
      totalDebt, totalDebtPayments
    };
  };

  const totals = calculateTotals();

  const addExpense = (type) => {
    const newExpense = { id: Date.now(), name: '', amount: 0, category: '' };
    setExpenses(prev => ({ ...prev, [type]: [...prev[type], newExpense] }));
  };

  const updateExpense = (type, id, field, value) => {
    setExpenses(prev => ({
      ...prev,
      [type]: prev[type].map(exp => exp.id === id ? { ...exp, [field]: value } : exp)
    }));
  };

  const deleteExpense = (type, id) => {
    setExpenses(prev => ({ ...prev, [type]: prev[type].filter(exp => exp.id !== id) }));
  };

  const addSavingsGoal = () => {
    setSavings(prev => [...prev, { id: Date.now(), name: '', target: 0, current: 0 }]);
  };

  const updateSavingsGoal = (id, field, value) => {
    setSavings(prev => prev.map(goal => goal.id === id ? { ...goal, [field]: value } : goal));
  };

  const deleteSavingsGoal = (id) => {
    setSavings(prev => prev.filter(goal => goal.id !== id));
  };

  const addCreditCard = () => {
    setCreditCards(prev => [...prev, { id: Date.now(), name: '', balance: 0, minPayment: 0, apr: 0, dueDate: '' }]);
  };

  const updateCreditCard = (id, field, value) => {
    setCreditCards(prev => prev.map(card => card.id === id ? { ...card, [field]: value } : card));
  };

  const deleteCreditCard = (id) => {
    setCreditCards(prev => prev.filter(card => card.id !== id));
  };

  const addLoan = () => {
    setLoans(prev => [...prev, { id: Date.now(), name: '', balance: 0, payment: 0, apr: 0, dueDate: '', frequency: 'monthly' }]);
  };

  const updateLoan = (id, field, value) => {
    setLoans(prev => prev.map(loan => loan.id === id ? { ...loan, [field]: value } : loan));
  };

  const deleteLoan = (id) => {
    setLoans(prev => prev.filter(loan => loan.id !== id));
  };

  const categoryColors = {
    'Housing': '#2D5F4F',
    'Transportation': '#4A7C8E',
    'Food': '#6B8E7F',
    'Utilities': '#5A7A8C',
    'Entertainment': '#8B9E96',
    'Healthcare': '#3E6B7D',
    'Insurance': '#547A6E',
    'Other': '#6D8A87'
  };

  const expensesByCategory = () => {
    const categories = {};
    [...expenses.fixed, ...expenses.variable].forEach(exp => {
      const cat = exp.category || 'Other';
      categories[cat] = (categories[cat] || 0) + parseFloat(exp.amount || 0);
    });
    return Object.entries(categories).map(([name, value]) => ({ name, value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-700 to-teal-900 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-800 p-6">
            <h1 className="text-3xl font-bold text-white mb-2">Personal Budget Tracker</h1>
            <p className="text-slate-300">Take control of your finances</p>
          </div>

          <div className="bg-slate-900/70 border-b border-slate-700 px-6">
            <div className="flex space-x-1 overflow-x-auto">
              {['overview', 'income', 'expenses', 'credit cards', 'loans', 'savings'].map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 font-medium capitalize whitespace-nowrap transition-all ${
                    activeTab === tab ? 'text-teal-300 border-b-2 border-teal-500' : 'text-slate-400 hover:text-teal-400'
                  }`}>
                  {tab}
                </button>
              ))}
            </div>
          </div>

          <div className="p-6 bg-gradient-to-b from-slate-800 to-slate-900">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gradient-to-br from-emerald-800 to-teal-900 rounded-xl p-4 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm opacity-90">Total Income</span>
                      <TrendingUp size={20} />
                    </div>
                    <div className="text-2xl font-bold">${totals.totalIncome.toFixed(2)}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl p-4 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm opacity-90">Total Expenses</span>
                      <TrendingDown size={20} />
                    </div>
                    <div className="text-2xl font-bold">${totals.totalExpenses.toFixed(2)}</div>
                  </div>
                  
                  <div className="bg-gradient-to-br from-red-800 to-red-900 rounded-xl p-4 text-white shadow-xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm opacity-90">Total Debt</span>
                      <CreditCard size={20} />
                    </div>
                    <div className="text-2xl font-bold">${totals.totalDebt.toFixed(2)}</div>
                    <div className="text-xs mt-1 opacity-90">${totals.totalDebtPayments.toFixed(2)}/mo</div>
                  </div>
                  
                  <div className={`bg-gradient-to-br ${totals.remaining >= 0 ? 'from-teal-700 to-emerald-800' : 'from-orange-700 to-red-800'} rounded-xl p-4 text-white shadow-xl`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm opacity-90">After Debt Payments</span>
                      <DollarSign size={20} />
                    </div>
                    <div className="text-2xl font-bold">${totals.remaining.toFixed(2)}</div>
                    <div className="text-xs mt-1 opacity-90">
                      {totals.totalIncome > 0 ? ((totals.remaining / totals.totalIncome) * 100).toFixed(1) : 0}% of income
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <CreditCard className="text-teal-400" size={24} />
                      Credit Card Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400">Total Balance:</span>
                        <span className="text-xl font-bold text-red-400">${totals.totalCreditCardDebt.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Monthly Payments:</span>
                        <span className="text-lg font-semibold text-slate-200">${totals.totalCreditCardPayments.toFixed(2)}</span>
                      </div>
                      {creditCards.map(card => (
                        <div key={card.id} className="flex justify-between items-center text-sm py-2 border-t border-slate-700">
                          <span className="text-slate-400">{card.name || 'Unnamed Card'}</span>
                          <div className="text-right">
                            <div className="text-slate-200 font-medium">${parseFloat(card.balance || 0).toFixed(2)}</div>
                            <div className="text-xs text-slate-500">Due: {card.dueDate || 'N/A'}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                      <Target className="text-teal-400" size={24} />
                      Loan Summary
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center pb-2 border-b border-slate-700">
                        <span className="text-slate-400">Total Balance:</span>
                        <span className="text-xl font-bold text-red-400">${totals.totalLoanDebt.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Monthly Payments:</span>
                        <span className="text-lg font-semibold text-slate-200">${totals.totalLoanPayments.toFixed(2)}</span>
                      </div>
                      {loans.map(loan => (
                        <div key={loan.id} className="flex justify-between items-center text-sm py-2 border-t border-slate-700">
                          <span className="text-slate-400">{loan.name || 'Unnamed Loan'}</span>
                          <div className="text-right">
                            <div className="text-slate-200 font-medium">${parseFloat(loan.balance || 0).toFixed(2)}</div>
                            <div className="text-xs text-slate-500">
                              ${parseFloat(loan.payment || 0).toFixed(2)}/{loan.frequency || 'month'}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-200 mb-4">Expenses by Category</h3>
                    {expensesByCategory().length > 0 ? (
                      <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                          <Pie data={expensesByCategory()} cx="50%" cy="50%" labelLine={false}
                            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                            outerRadius={80} fill="#8884d8" dataKey="value">
                            {expensesByCategory().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={categoryColors[entry.name] || '#6D8A87'} />
                            ))}
                          </Pie>
                          <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#e2e8f0' }} />
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="h-[300px] flex items-center justify-center text-slate-500">
                        Add expenses to see breakdown
                      </div>
                    )}
                  </div>

                  <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                    <h3 className="text-xl font-semibold text-slate-200 mb-4">Monthly Financial Overview</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={[
                        { name: 'Income', amount: totals.totalIncome },
                        { name: 'Expenses', amount: totals.totalExpenses },
                        { name: 'Debt Payments', amount: totals.totalDebtPayments },
                        { name: 'Remaining', amount: Math.max(totals.remaining, 0) }
                      ]}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#e2e8f0' }} />
                        <Bar dataKey="amount" fill="#14b8a6" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                  <h3 className="text-xl font-semibold text-slate-200 mb-4 flex items-center gap-2">
                    <AlertCircle className="text-amber-500" size={20} />
                    Quick Insights
                  </h3>
                  <div className="space-y-2 text-slate-300">
                    {totals.remaining < 0 && (
                      <p className="text-red-400">⚠️ You're spending more than you earn. Consider reducing expenses or increasing income.</p>
                    )}
                    {totals.totalDebt > totals.totalIncome * 2 && (
                      <p className="text-amber-400">💡 Your total debt is over 2x your monthly income. Focus on debt reduction.</p>
                    )}
                    {totals.totalFixed > totals.totalIncome * 0.5 && (
                      <p className="text-amber-400">📊 Fixed expenses are over 50% of income. Look for ways to reduce them.</p>
                    )}
                    {totals.remaining > totals.totalIncome * 0.2 && totals.totalDebt === 0 && (
                      <p className="text-teal-400">✅ Excellent! You're debt-free and saving over 20% of your income.</p>
                    )}
                    {creditCards.some(card => parseFloat(card.apr || 0) > 25) && (
                      <p className="text-red-400">🔴 You have credit cards with APR over 25%. Consider balance transfer or debt consolidation.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'income' && (
              <div className="space-y-6">
                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                  <h3 className="text-xl font-semibold text-slate-200 mb-4">Monthly Income</h3>
                  <input type="number" value={income.monthly}
                    onChange={(e) => setIncome(prev => ({ ...prev, monthly: parseFloat(e.target.value) || 0 }))}
                    className="w-full bg-slate-900 border border-slate-600 rounded-lg px-4 py-3 text-slate-200 text-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="Enter monthly income" />
                </div>

                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-200">Additional Income</h3>
                    <button onClick={() => setIncome(prev => ({ ...prev, additional: [...prev.additional, { id: Date.now(), name: '', amount: 0 }] }))}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                      + Add Source
                    </button>
                  </div>
                  <div className="space-y-3">
                    {income.additional.map((item) => (
                      <div key={item.id} className="flex gap-3">
                        <input type="text" value={item.name}
                          onChange={(e) => setIncome(prev => ({
                            ...prev, additional: prev.additional.map(i => i.id === item.id ? { ...i, name: e.target.value } : i)
                          }))}
                          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Source name" />
                        <input type="number" value={item.amount}
                          onChange={(e) => setIncome(prev => ({
                            ...prev, additional: prev.additional.map(i => i.id === item.id ? { ...i, amount: parseFloat(e.target.value) || 0 } : i)
                          }))}
                          className="w-32 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Amount" />
                        <button onClick={() => setIncome(prev => ({ ...prev, additional: prev.additional.filter(i => i.id !== item.id) }))}
                          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'expenses' && (
              <div className="space-y-6">
                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-200">Fixed Expenses</h3>
                    <button onClick={() => addExpense('fixed')}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                      + Add Expense
                    </button>
                  </div>
                  <div className="space-y-3">
                    {expenses.fixed.map((exp) => (
                      <div key={exp.id} className="flex gap-3">
                        <input type="text" value={exp.name}
                          onChange={(e) => updateExpense('fixed', exp.id, 'name', e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Expense name" />
                        <select value={exp.category}
                          onChange={(e) => updateExpense('fixed', exp.id, 'category', e.target.value)}
                          className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                          <option value="">Category</option>
                          {Object.keys(categoryColors).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <input type="number" value={exp.amount}
                          onChange={(e) => updateExpense('fixed', exp.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-32 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Amount" />
                        <button onClick={() => deleteExpense('fixed', exp.id)}
                          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-right text-slate-200 font-semibold">
                      Total Fixed: ${totals.totalFixed.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-200">Variable Expenses</h3>
                    <button onClick={() => addExpense('variable')}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                      + Add Expense
                    </button>
                  </div>
                  <div className="space-y-3">
                    {expenses.variable.map((exp) => (
                      <div key={exp.id} className="flex gap-3">
                        <input type="text" value={exp.name}
                          onChange={(e) => updateExpense('variable', exp.id, 'name', e.target.value)}
                          className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Expense name" />
                        <select value={exp.category}
                          onChange={(e) => updateExpense('variable', exp.id, 'category', e.target.value)}
                          className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                          <option value="">Category</option>
                          {Object.keys(categoryColors).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                        <input type="number" value={exp.amount}
                          onChange={(e) => updateExpense('variable', exp.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="w-32 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                          placeholder="Amount" />
                        <button onClick={() => deleteExpense('variable', exp.id)}
                          className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                          Delete
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-700">
                    <div className="text-right text-slate-200 font-semibold">
                      Total Variable: ${totals.totalVariable.toFixed(2)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'credit cards' && (
              <div className="space-y-6">
                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-200">Credit Cards</h3>
                      <p className="text-sm text-slate-400 mt-1">Track balances, payments, and due dates</p>
                    </div>
                    <button onClick={addCreditCard}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                      + Add Card
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {creditCards.map((card) => (
                      <div key={card.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                          <input type="text" value={card.name}
                            onChange={(e) => updateCreditCard(card.id, 'name', e.target.value)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Card name" />
                          <input type="number" value={card.balance}
                            onChange={(e) => updateCreditCard(card.id, 'balance', parseFloat(e.target.value) || 0)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Balance" />
                          <input type="number" value={card.minPayment}
                            onChange={(e) => updateCreditCard(card.id, 'minPayment', parseFloat(e.target.value) || 0)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Min Payment" />
                          <input type="number" value={card.apr}
                            onChange={(e) => updateCreditCard(card.id, 'apr', parseFloat(e.target.value) || 0)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="APR %" />
                          <div className="flex gap-2">
                            <input type="text" value={card.dueDate}
                              onChange={(e) => updateCreditCard(card.id, 'dueDate', e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="Due (e.g., 1st)" />
                            <button onClick={() => deleteCreditCard(card.id)}
                              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 flex justify-between text-sm">
                          <span className="text-slate-400">
                            Monthly Interest: ~${((parseFloat(card.balance || 0) * parseFloat(card.apr || 0)) / 100 / 12).toFixed(2)}
                          </span>
                          <span className="text-slate-400">
                            Payoff time at min payment: {card.balance && card.minPayment ? 
                              Math.ceil(parseFloat(card.balance) / parseFloat(card.minPayment)) : 0} months
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {creditCards.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400">Total Balance:</span>
                          <div className="text-2xl font-bold text-red-400">${totals.totalCreditCardDebt.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">Total Min Payments:</span>
                          <div className="text-2xl font-bold text-slate-200">${totals.totalCreditCardPayments.toFixed(2)}/mo</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'loans' && (
              <div className="space-y-6">
                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-xl font-semibold text-slate-200">Personal Loans</h3>
                      <p className="text-sm text-slate-400 mt-1">Track loan balances and payment schedules</p>
                    </div>
                    <button onClick={addLoan}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                      + Add Loan
                    </button>
                  </div>
                  
                  <div className="space-y-4">
                    {loans.map((loan) => (
                      <div key={loan.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 shadow-sm">
                        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
                          <input type="text" value={loan.name}
                            onChange={(e) => updateLoan(loan.id, 'name', e.target.value)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Loan name" />
                          <input type="number" value={loan.balance}
                            onChange={(e) => updateLoan(loan.id, 'balance', parseFloat(e.target.value) || 0)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Balance" />
                          <input type="number" value={loan.payment}
                            onChange={(e) => updateLoan(loan.id, 'payment', parseFloat(e.target.value) || 0)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="Payment" />
                          <select value={loan.frequency}
                            onChange={(e) => updateLoan(loan.id, 'frequency', e.target.value)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent">
                            <option value="weekly">Weekly</option>
                            <option value="bi-weekly">Bi-weekly</option>
                            <option value="monthly">Monthly</option>
                          </select>
                          <input type="number" value={loan.apr}
                            onChange={(e) => updateLoan(loan.id, 'apr', parseFloat(e.target.value) || 0)}
                            className="bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                            placeholder="APR %" />
                          <div className="flex gap-2">
                            <input type="text" value={loan.dueDate}
                              onChange={(e) => updateLoan(loan.id, 'dueDate', e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="Due date" />
                            <button onClick={() => deleteLoan(loan.id)}
                              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                              Delete
                            </button>
                          </div>
                        </div>
                        <div className="mt-3 text-sm text-slate-400">
                          Estimated payoff: {loan.balance && loan.payment ? 
                            Math.ceil(parseFloat(loan.balance) / parseFloat(loan.payment)) : 0} payments
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  {loans.length > 0 && (
                    <div className="mt-6 pt-4 border-t border-slate-700">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-slate-400">Total Balance:</span>
                          <div className="text-2xl font-bold text-red-400">${totals.totalLoanDebt.toFixed(2)}</div>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400">Total Payments:</span>
                          <div className="text-2xl font-bold text-slate-200">${totals.totalLoanPayments.toFixed(2)}/mo</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'savings' && (
              <div className="space-y-6">
                <div className="bg-slate-800/80 rounded-xl p-6 border border-slate-700 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-semibold text-slate-200">Savings Goals</h3>
                    <button onClick={addSavingsGoal}
                      className="bg-teal-700 hover:bg-teal-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                      + Add Goal
                    </button>
                  </div>
                  <div className="space-y-4">
                    {savings.map((goal) => {
                      const progress = goal.target > 0 ? (goal.current / goal.target) * 100 : 0;
                      return (
                        <div key={goal.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-600 shadow-sm">
                          <div className="flex gap-3 mb-3">
                            <input type="text" value={goal.name}
                              onChange={(e) => updateSavingsGoal(goal.id, 'name', e.target.value)}
                              className="flex-1 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="Goal name" />
                            <input type="number" value={goal.target}
                              onChange={(e) => updateSavingsGoal(goal.id, 'target', parseFloat(e.target.value) || 0)}
                              className="w-32 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="Target" />
                            <input type="number" value={goal.current}
                              onChange={(e) => updateSavingsGoal(goal.id, 'current', parseFloat(e.target.value) || 0)}
                              className="w-32 bg-slate-900 border border-slate-600 rounded-lg px-4 py-2 text-slate-200 focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                              placeholder="Current" />
                            <button onClick={() => deleteSavingsGoal(goal.id)}
                              className="bg-red-700 hover:bg-red-800 text-white px-4 py-2 rounded-lg transition shadow-sm">
                              Delete
                            </button>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm text-slate-400">
                              <span>{progress.toFixed(1)}% Complete</span>
                              <span>${goal.current.toFixed(2)} / ${goal.target.toFixed(2)}</span>
                            </div>
                            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                              <div className="bg-gradient-to-r from-teal-500 to-emerald-600 h-full transition-all duration-500"
                                style={{ width: `${Math.min(progress, 100)}%` }} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);