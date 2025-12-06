import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
})

export const metadata = {
  title: 'NearU',
  description: 'Find coaching classes, tuitions, sports academies, hobby classes, and training centres nearby',
  icons: {
    icon: '/images/logo_ico.ico',
  },
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${poppins.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}

