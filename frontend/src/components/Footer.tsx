import Link from "next/link";

export default function Footer() {
  return (
    <footer className="footer">
      <Link href="https://ruhis.fi" target={"_blank"}>
        © 2023 Toni Ruhanen, All rights reserved.
      </Link>
    </footer>
  );
}
