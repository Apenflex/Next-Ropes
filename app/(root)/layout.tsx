import '@/styles/globals.css'

import { ClerkProvider } from '@clerk/nextjs'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import NextTopLoader from 'nextjs-toploader'

import { Bottombar, LeftSideBar, RightSideBar,Topbar } from '@/components/shared'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
	title: {
		template: '%s | Ropes',
		default: 'Ropes',
	},
	description: 'A Next.js 13 Meta Ropes Application',
	generator: 'Next.js',
	applicationName: 'Ropes',
	referrer: 'origin-when-cross-origin',
	keywords: ['Next.js', 'React', 'JavaScript'],
	colorScheme: 'dark',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<ClerkProvider>
			<html lang="en">
				<body className={inter.className}>
					<NextTopLoader
						color="#877EFF"
						initialPosition={0.08}
						crawlSpeed={400}
						height={3}
						crawl={true}
						// showSpinner={true}
						easing="easeInOutCubic"
						speed={400}
						shadow="0 0 10px #ffffff,0 0 5px #ffffff"
					/>
					<Topbar />
					<main className="flex flex-row">
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
