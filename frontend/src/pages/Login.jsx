export default function Login({ go }) {
  return (
    <div className="container">
      <h2>SURVEY CORPS SYSTEMS</h2>

      <input placeholder="Username" />
      <input type="password" placeholder="Password" />

      <button onClick={() => go("main")}>LOGIN</button>
    </div>
  );
}
