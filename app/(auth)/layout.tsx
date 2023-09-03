import '@/styles/globals.css'

import { ClerkProvider } from '@clerk/nextjs'
import { Inter } from 'next/font/google'

export const metadata = {
	title: 'Ropes',
	description: 'A Next.js 13 Meta Ropes Application',
}

const inter = Inter({ subsets: ['latin'] })

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={`${inter.className} bg-dark-1`}>
					<div className="flex min-h-screen w-full items-center justify-center">{children}</div>
				</body>
			</html>
		</ClerkProvider>
	)
}
