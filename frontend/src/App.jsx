import { useState } from "react";
import Login from "./pages/Login";
import Main from "./pages/Main";
import Cart from "./pages/Cart";
import Orders from "./pages/Orders";
import Admin from "./pages/Admin";

export default function App() {
  const [page, setPage] = useState("login");

  return (
    <>
      {page === "login" && <Login go={setPage} />}
      {page === "main" && <Main go={setPage} />}
      {page === "cart" && <Cart go={setPage} />}
      {page === "orders" && <Orders go={setPage} />}
      {page === "admin" && <Admin go={setPage} />}
    </>
  );
}
