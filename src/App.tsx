import { useState } from 'react';
import './App.css'

type Expense = {
  amount: number;
  memo: string;
}

function App() {
  const [amount, setAmount] = useState<number>(0);
  const [memo, setMemo] = useState<string>('');
  const [expenses, setExpenses] = useState<Expense[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount === 0 || memo.trim() === "") {
      alert("金額とメモを入力してください");
      return;
    }
    const expense: Expense = { amount, memo };
    setExpenses([...expenses, expense]);
    setAmount(0);
    setMemo("");
  };

  const handleDelete = (indexToDelete: number) => {
    setExpenses(expenses.filter((_, index) => index !== indexToDelete));
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className='min-h-screen bg-blue-100 flex flex-col items-center justify-center'>
      <h1 className='text-3xl font-bold mb-4 text-blue-800'>
        お小遣いアプリ手帳
      </h1>
      <form
        onSubmit={handleSubmit}
        className='bg-white p-6 rounded shadow-md w-full max-w-md'
      >
        <div className='mb-4'>
          <label className='block text-start text-[15px] font-medium mb-1'>お金</label>
          <input
            type='number'
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className='w-full p-2 border border-gray-300 rounded'
            min={1}
            required
          />
        </div>

        <div className='mb-4'>
          <label className='block text-start text-[15px] font-medium mb-1'>メモ</label>
          <input
            type='text'
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className='w-full p-2 border border-gray-300 rounded'
            required
          />
        </div>

        <button
          type='submit'
          className='bg-blue-500 hover:bg-blue-300 text-white px-4 py-2 rounded w-full cursor-pointer transition-colors duration-150'
        >
          送信
        </button>

        <div className="mt-4 mb-2">
          <div className="bg-green-100 border border-green-300 rounded p-3 text-2xl">
            <span>合計: {total.toLocaleString()}</span>
          </div>
        </div>

        <div>
          <p>支出</p>
          {expenses.map((expense, idx) => (
            <div key={idx} className="border-b border-gray-300 py-2 flex justify-between items-center">
              <span>¥ {expense.amount}</span>
              <span className="flex-1 mx-2">{expense.memo}</span>
              <button
                className='text-red-600 hover:text-red-700 ml-4 cursor-pointer'
                type="button"
                onClick={() => handleDelete(idx)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </form>
    </div>
  )
}

export default App
