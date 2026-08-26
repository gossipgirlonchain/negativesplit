import VisitorCounter from "./VisitorCounter";

export default function Hero() {
  return (
    <div className="hero-head">
      <h1>Your brand, on my Ironman journey</h1>
      <p className="sub">
        Training content, a December Ironman 70.3, and a full Ironman in Q2 2027.
      </p>
      <VisitorCounter />
    </div>
  );
}
