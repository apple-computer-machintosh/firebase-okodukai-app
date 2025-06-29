import "beercss";
import "material-dynamic-colors";
import { useState, useEffect } from "react";
import db from "../lib/firebase";
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

type Expense = {
  amount: number;
  memo: string;
  createdAt: Timestamp;
};

function M3Design() {
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
    <div className="responsive">
      <header className="fill">
        <nav>
          <h6>お小遣いアプリ手帳</h6>
        </nav>
      </header>

      <main>
        <fieldset>
          <form onSubmit={handleSubmit}>
            <div className="field border label" style={{ borderWidth: 0 }}>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                required
              />
              <label>金額</label>
            </div>

            <div className="field border label" style={{ borderWidth: 0 }}>
              <input
                type="text"
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                required
              />
              <label>商品の名前</label>
            </div>

            <button type="submit" className="responsive no-margin">
              Button
            </button>
          </form>
        </fieldset>

        <div className="space"></div>

        <article>
          <div className="row">
            <h6 className="max">合計</h6>
            <p className="center-align">¥ {total.toLocaleString()}</p>
          </div>
        </article>

        <div className="space"></div>

        <article>
          <h6>支出履歴</h6>
          <ul className="list border">
            {expenses.map((expense, idx) => (
              <li key={idx}>
                <div className="max">
                  <span className="block sm:text-lg font-bold">
                    ¥ {expense.amount.toLocaleString()}
                  </span>
                  <span>{expense.memo}</span>
                </div>
                <button type="button" onClick={() => handleDelete(idx)}>
                  削除
                </button>
              </li>
            ))}
          </ul>
        </article>
      </main>
    </div>
  );
}

export default M3Design;
