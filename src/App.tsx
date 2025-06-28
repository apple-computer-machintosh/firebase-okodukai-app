import { useState, useEffect } from "react";
import db from "./lib/firebase";
import {
  collection,
  addDoc,
  onSnapshot,
  deleteDoc,
  doc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import "./App.css";

type Expense = {
  amount: number;
  memo: string;
  createdAt: Timestamp;
};

function App() {
  const [amount, setAmount] = useState<number | "">("");
  const [memo, setMemo] = useState<string>("");
  const [expenses, setExpenses] = useState<Expense[]>([]);

  useEffect(() => {
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((docSnap) => {
        const docData = docSnap.data();
        return {
          amount: docData.amount,
          memo: docData.memo,
          createdAt: docData.createdAt,
        } as Expense;
      });
      setExpenses(data);
    });
    return () => unsubscribe();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof amount !== "number" || amount <= 0 || memo.trim() === "") {
      alert("金額とメモを入力してください");
      return;
    }
    await addDoc(collection(db, "expenses"), {
      amount,
      memo,
      createdAt: Timestamp.now(),
    });
    setAmount(0);
    setMemo("");
  };

  const handleDelete = async (indexToDelete: number) => {
    // Firestoreから削除
    const q = query(collection(db, "expenses"), orderBy("createdAt", "desc"));
    const snapshot = await import("firebase/firestore").then(({ getDocs }) =>
      getDocs(q)
    );
    const docId = (await snapshot).docs[indexToDelete]?.id;
    if (docId) {
      await deleteDoc(doc(db, "expenses", docId));
    }
  };

  const total = expenses.reduce((sum, item) => sum + item.amount, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 flex flex-col items-center py-6 sm:py-10">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-6 sm:mb-8 text-blue-800 drop-shadow text-center">
        お小遣いアプリ手帳
      </h1>
      <form
        onSubmit={handleSubmit}
        className="bg-white p-4 sm:p-8 rounded-xl shadow-lg w-full max-w-xs sm:max-w-md md:max-w-lg mb-6 sm:mb-8"
      >
        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-700 text-base sm:text-lg font-semibold mb-2">
            お金
          </label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base sm:text-lg"
            min={1}
            required
            placeholder="金額を入力"
          />
        </div>

        <div className="mb-4 sm:mb-6">
          <label className="block text-gray-700 text-base sm:text-lg font-semibold mb-2">
            メモ
          </label>
          <input
            type="text"
            value={memo}
            onChange={(e) => setMemo(e.target.value)}
            className="w-full p-2 sm:p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition text-base sm:text-lg"
            required
            placeholder="用途やメモ"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 sm:py-3 rounded-lg font-bold hover:bg-blue-700 transition text-base sm:text-lg"
        >
          送信
        </button>
      </form>

      <div className="w-full max-w-xs sm:max-w-md md:max-w-lg">
        <div className="bg-green-100 border border-green-300 rounded-lg p-3 sm:p-4 text-xl sm:text-2xl font-bold text-green-800 mb-4 sm:mb-6 flex justify-between items-center">
          <span>合計</span>
          <span>¥ {total.toLocaleString()}</span>
        </div>

        <div className="bg-white rounded-xl shadow divide-y divide-gray-200">
          <p className="text-gray-600 px-4 sm:px-6 py-2 sm:py-3 font-semibold text-base sm:text-lg">
            支出履歴
          </p>
          {expenses.length === 0 && (
            <div className="px-4 sm:px-6 py-3 sm:py-4 text-gray-400 text-sm sm:text-base">
              まだ記録がありません
            </div>
          )}
          {expenses.map((expense, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-4 sm:px-6 py-3 sm:py-4 hover:bg-gray-50 transition"
            >
              <div>
                <span className="block text-base sm:text-lg font-bold text-blue-700">
                  ¥ {expense.amount.toLocaleString()}
                </span>
                <span className="block text-gray-500 text-xs sm:text-sm">
                  {expense.memo}
                </span>
              </div>
              <button
                className="text-red-500 hover:text-red-700 font-semibold px-2 sm:px-3 py-1 rounded transition text-xs sm:text-base"
                type="button"
                onClick={() => handleDelete(idx)}
              >
                削除
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
