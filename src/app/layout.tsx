import React from "react";
import type { Metadata } from "next";
import Link from "next/link";
import HouseSVG from '@/app/svg/house';
import styles from '@/app/styles/App.module.css';
import "@/app/globals.css";
import Search from "@/app/components/Search";
import Shuffle from "./components/Shuffle";
import { SearchProvider } from "@/app/context/search";
import { SeedProvider } from "./context/seed";

export const metadata: Metadata = {
  title: "Recipe Web",
  description: "A web representation of RecipeMD recipes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <SearchProvider>
          <SeedProvider>
            <header>
              <div className={styles['header-wrapper']}>
                <div className={styles['header-left']}>
                  <Link href="/" className={styles.home}>
                    <HouseSVG />
                  </Link>
                  <Shuffle />
                </div>
                <span className={styles.title}>Recipe Web</span>
                <div className={styles['search-wrapper']}>
                  <Search />
                </div>
              </div>
            </header>
            <main>{children}</main>
            <footer className={styles.footer}>©2025, Robin Heinbockel<br />recipes provided by the respective GitHub users</footer>
          </SeedProvider>
        </SearchProvider>
      </body>
    </html>
  );
}
