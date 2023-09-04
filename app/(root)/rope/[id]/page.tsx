import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import RopeCard from '@/components/cards/RopeCard'
import { Comment } from '@/components/forms'
import { fetchRopeById } from '@/lib/actions/rope.actions'
import { fetchUser } from '@/lib/actions/user.actions'

export default async function Page({ params }: { params: { id: string } }) {
	const user = await currentUser()
	if (!user || !params.id) return null

	const userInfo = await fetchUser(user.id)
	if (!userInfo?.onboarded) redirect('/onboarding')

	const rope = await fetchRopeById(params.id)

	return (
		<section className="relative">
			<div>
				<RopeCard
					key={rope._id}
					id={rope.id}
					currentUserId={user?.id || ''}
					parentId={rope.parentId}
					content={rope.text}
					author={rope.author}
					community={rope.community}
					createdAt={rope.createdAt}
					comments={rope.children}
				/>
			</div>

			<div className="mt-7">
				<Comment
					ropeId={rope.id}
					currentUserImg={userInfo.image}
					currentUserId={userInfo._id.toString()}
				/>
			</div>

			<div className="mt-10">
				{rope.children.map((comment: any) => (
					<RopeCard
						key={comment._id}
						id={comment.id}
						currentUserId={user?.id || ''}
						parentId={comment.parentId}
						content={comment.text}
						author={comment.author}
						community={comment.community}
						createdAt={comment.createdAt}
						comments={comment.children}
						isComment
					/>
				))}
			</div>
		</section>
	)
}
