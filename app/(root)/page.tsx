import { currentUser } from '@clerk/nextjs'

import RopeCard from '@/components/cards/RopeCard'
import { fetchPosts } from '@/lib/actions/rope.actions'

export default async function Home() {
	const user = await currentUser()
	const res = await fetchPosts(1, 30)


	return (
		<>
			<h1 className="head-text text-left">Home</h1>
			<section className="mt-9 flex flex-col gap-10">
				{res.posts.length === 0 ? (
					<p className="no-result">No posts found</p>
				) : (
					<>
						{res.posts.map((post) => (
							<RopeCard
								key={post._id}
								id={post.id}
								currentUserId={user?.id || ''}
								parentId={post.parentId}
								content={post.text}
								author={post.author}
								community={post.community}
								createdAt={post.createdAt}
								comments={post.children}
							/>
						))}
					</>
				)}
			</section>
		</>
	)
}
