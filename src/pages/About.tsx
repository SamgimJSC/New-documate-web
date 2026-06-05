import { Link } from "react-router-dom";

export default function About() {
  return (
    <>
      <nav>
        <Link to="/">Home</Link>
        <Link to="/about">About</Link>
      </nav>
      <div>about</div>
    </>
  );
}
