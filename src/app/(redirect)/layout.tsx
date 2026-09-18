import { Fraunces, Sora } from 'next/font/google'

import '../(frontend)/styles.css'

const heading = Fraunces({ subsets: ['latin'], variable: '--font-fraunces', display: 'swap' })
const body = Sora({ subsets: ['latin'], variable: '--font-sora', display: 'swap' })

export default function RedirectLayout({ children }: { children: React.ReactNode }) {
  return <html lang="de" className={`${heading.variable} ${body.variable}`}><body>{children}</body></html>
}
