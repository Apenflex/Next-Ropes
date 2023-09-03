import { redirect } from 'next/navigation'

import RopeCard from '@/components/cards/RopeCard'
import { fetchUserPosts } from '@/lib/actions/user.actions'

interface RopesTabProps {
	currentUserId: string
	accountId: string
	accoutType: string
}

const RopesTab = async ({ currentUserId, accountId, accoutType }: RopesTabProps) => {
	let res = await fetchUserPosts(accountId)
	if (!res) redirect('/')

	return (
		<section className="mt-9 flex flex-col gap-10">
			{res.ropes.map((rope: any) => (
				<RopeCard
					key={rope._id}
					id={rope.id}
					currentUserId={currentUserId}
					parentId={rope.parentId}
					content={rope.text}
					author={
						accoutType === 'User'
							? { name: res.name, image: res.image, id: res.id }
							: { name: rope.author.name, image: rope.author.image, id: rope.author.id }
					}
					community={rope.community} // TODO:
					createdAt={rope.createdAt}
					comments={rope.children}
				/>
			))}
		</section>
	)
}

export default RopesTab
