import { currentUser } from '@clerk/nextjs'
import { Metadata } from 'next'
import { redirect } from 'next/navigation'

import UserCard from '@/components/cards/UserCard'
import { fetchUser, fetchUsers } from '@/lib/actions/user.actions'

export const metadata: Metadata = {
	title: 'Search',
	description: 'Search for a specific post',
	keywords: ['Next.js', 'React', 'JavaScript, Search'],
}

export default async function Page() {
	const user = await currentUser()
	if (!user) return null

	const userInfo = await fetchUser(user.id)
	if (!userInfo?.onboarded) redirect('/onboarding')

	// Fetch users
	const result = await fetchUsers({ userId: user.id, searchString: '', pageNumber: 1, pageSize: 25 })

	return (
		<section>
			<h1 className="head-text mb-10">Search</h1>

			{/* SearchBar */}

			<div className="mt-14 flex flex-col gap-9">
				{result.users.length === 0 ? (
					<p className="no-result">No users</p>
				) : (
					<>
						{result.users.map((person) => (
							<UserCard
								key={person.id}
								id={person.id}
								name={person.name}
								username={person.username}
								imgUrl={person.image}
								personType="User"
							/>
						))}
					</>
				)}
			</div>
		</section>
	)
}
