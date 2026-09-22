"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { adminPath } from "@/lib/admin-path";
import { ADMIN_NAVIGATION } from "@/lib/admin-navigation";
import styles from "./admin-shell.module.css";

export default function AdminSidebar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  return <aside className={styles.sidebar}>
    <button className={`govuk-button govuk-button--secondary ${styles.toggle}`} aria-expanded={open} aria-controls="admin-navigation" onClick={() => setOpen(!open)}>Admin menu {open ? "−" : "+"}</button>
    <nav id="admin-navigation" aria-label="Admin sections" className={`${styles.navigation} ${open ? styles.open : ""}`}>
      {ADMIN_NAVIGATION.map(group => <section key={group.title}>
        <h2 className="govuk-heading-s">{group.title}</h2>
        <ul className="govuk-list">{group.items.map(item => {
          const href = adminPath(item.path);
          const active = pathname === href || Boolean(item.path && pathname.startsWith(`${href}/`));
          return <li key={item.path}><Link href={href} aria-current={active ? "page" : undefined} className={active ? styles.current : "govuk-link govuk-link--no-visited-state"} onClick={() => setOpen(false)}>{item.label}</Link></li>;
        })}</ul>
      </section>)}
    </nav>
  </aside>;
}
