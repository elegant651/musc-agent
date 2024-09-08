'use client'
import Link from "next/link"
import styles from "./header.module.css"
import { SessionProvider } from "next-auth/react"
import { Wallet } from "./web3/wallet"

// The approach used in this component shows how to build a sign in and sign out
// component that works on pages which support both client and server side
// rendering, and avoids any flash incorrect content on initial page load.
export default function Header() {


  return (
    // <SessionProvider>
    <header>
      <noscript>
        <style>{`.nojs-show { opacity: 1; top: 0; }`}</style>
      </noscript>
      {/* <TopMenu /> */}

      {/* <nav>
          <ul className={styles.navItems}>
            <li className={styles.navItem}>
              <Link href="/">Home</Link>
            </li>
          </ul>
        </nav> */}
    </header>
    // </SessionProvider>
  )
}
