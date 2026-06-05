import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <div>home</div>
    </>
  );
}
