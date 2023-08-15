import '@/styles/globals.css'

import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'

import { Bottombar, LeftSideBar, RightSideBar,Topbar } from '@/components/shared'

const inter = Inter({ subsets: ['latin'] })

export const metadata = {
	title: 'Ropes',
	description: 'A Next.js 13 Meta Ropes Application',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={inter.className}>
					<Topbar />
					<main className='flex flex-row'>
						<LeftSideBar />
						<section className="main-container">
							<div className="w-full max-w-4xl">{children}</div>
						</section>
						<RightSideBar />
					</main>
					<Bottombar />
				</body>
			</html>
		</ClerkProvider>
	)
}
