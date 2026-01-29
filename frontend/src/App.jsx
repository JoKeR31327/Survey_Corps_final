import { useState } from "react";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";
import Health from "./pages/Health";
import Dashboard from "./pages/Dashboard";

export default function App() {
  const [page, setPage] = useState("login");
  const [history, setHistory] = useState(["login"]);

  const go = (next) => {
    setHistory((prev) => [...prev, next]);
    setPage(next);
  };

  const back = () => {
    setHistory((prev) => {
      if (prev.length <= 1) return prev;
      const nextHistory = prev.slice(0, -1);
      setPage(nextHistory[nextHistory.length - 1]);
      return nextHistory;
    });
  };

  return (
    <>
      {page === "login" && <Login go={go} />}
      {page === "main" && <Main go={go} back={back} />}
      {page === "cart" && <Cart go={go} back={back} />}
      {page === "orders" && <Orders go={go} back={back} />}
      {page === "admin" && <Admin go={go} back={back} />}
      {page === "health" && <Health go={go} back={back} />}
      {page === "dashboard" && <Dashboard go={go} back={back} />}
    </>
  );
}
