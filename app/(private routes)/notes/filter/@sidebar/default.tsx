"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import css from "./SidebarNotes.module.css";
import { tags } from "@/types/note";

const SideBar = () => {
  const params = useParams<{ slug?: string[] }>();
  const currentFilter = params.slug?.[0] ?? "all";

  return (
    <ul className={css.menuList}>
      <li className={css.menuItem}>
        <Link
          href="/notes/filter/all"
          className={`${css.menuLink} ${currentFilter === "all" ? css.active : ""}`}
        >
          All notes
        </Link>
      </li>
      <li className={css.menuItem}>
        <Link
          href="/notes/filter/favorites"
          className={`${css.menuLink} ${currentFilter === "favorites" ? css.active : ""}`}
        >
          ⭐ Favorites
        </Link>
      </li>
      <li className={css.menuItem}>
        <Link
          href="/notes/filter/trash"
          className={`${css.menuLink} ${css.trashLink} ${currentFilter === "trash" ? css.active : ""}`}
        >
          🗑️ Trash
        </Link>
      </li>
      <li className={css.divider} />
      {tags.map((tag) => (
        <li className={css.menuItem} key={tag}>
          <Link
            href={`/notes/filter/${tag}`}
            className={`${css.menuLink} ${currentFilter === tag ? css.active : ""}`}
          >
            {tag}
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default SideBar;
