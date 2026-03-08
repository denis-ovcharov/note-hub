"use client";

import { useState } from "react";
import AuthNavigation from "../AuthNavigation/AuthNavigation";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import css from "./Header.module.css";
import Link from "next/link";

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen((prev) => !prev);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className={css.header}>
      <div className={css.brand}>
        <Link href="/" aria-label="Home">
          NoteHub
        </Link>
        <ThemeToggle />
      </div>
      <button
        className={css.burger}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className={css.burgerLine} />
        <span className={css.burgerLine} />
        <span className={css.burgerLine} />
      </button>
      <nav
        aria-label="Main Navigation"
        className={`${css.nav} ${menuOpen ? css.navOpen : ""}`}
      >
        <ul className={css.navigation}>
          <li>
            <Link href="/" onClick={closeMenu}>
              Home
            </Link>
          </li>
          <li>
            <Link href="/notes/filter/all" onClick={closeMenu}>
              Notes
            </Link>
          </li>
          <AuthNavigation onNavigate={closeMenu} />
        </ul>
      </nav>
    </header>
  );
};
export default Header;
