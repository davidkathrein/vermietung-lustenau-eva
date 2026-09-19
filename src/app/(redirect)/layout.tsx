import { Figtree, Lora } from 'next/font/google'

import '../(frontend)/styles.css'

const heading = Lora({ subsets: ['latin'], variable: '--font-lora', display: 'swap' })
const body = Figtree({ subsets: ['latin'], variable: '--font-figtree', display: 'swap' })

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de" className={`${heading.variable} ${body.variable}`}><body>{children}</body></html>
}
