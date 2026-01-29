import Header from "../components/Header";

export default function Orders({ go }) {
  return (
    <div>
      <Header go={go} />
      <div className="container">
        <h2>Orders</h2>
        <p>No orders yet</p>
      </div>
    </div>
  );
}
