import Header from "../components/Header";

export default function Cart({ go }) {
  return (
    <div>
      <Header go={go} />
      <div className="container">
        <h2>Shopping Cart</h2>
        <p>Your cart is empty</p>
      </div>
    </div>
  );
}
