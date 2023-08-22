'use server'

import { revalidatePath } from 'next/cache'

import Rope from '@/lib/models/rope.model'
import User from '@/lib/models/user.model'
import { connectToDB } from '@/lib/mongoose'

interface CreateRopeParams {
	text: string
	author: string
	communityId: string | null
	path: string
}

export async function createRope({ text, author, communityId, path }: CreateRopeParams) {
	try {
		connectToDB()

		const createdRope = await Rope.create({
			text,
			author,
			community: null,
		})
		// Update User Model
		await User.findByIdAndUpdate(author, {
			$push: { ropes: createdRope._id },
		})

		revalidatePath(path)
	} catch (error: any) {
		throw new Error(`Failed to create rope: ${error.message}`)
	}
}

export async function fetchPosts(pageNumber = 1, pageSize = 20) {
	try {
		connectToDB()

		// Calculate the number of posts to skip
		const skipAmount = (pageNumber - 1) * pageSize

		// Fetch the posts that have no parents (top level posts... without comments)
		const postsQuery = Rope.find({ parentId: { $in: [null, undefined] } })
			.sort({ createdAt: 'desc' })
			.skip(skipAmount)
			.limit(pageSize)
			.populate({ path: 'author', model: User })
			.populate({
				path: 'children',
				populate: {
					path: 'author',
					model: User,
					select: '_id name parentId image',
				},
			})

		// Calculate the total posts count
		const totalPostsCount = await Rope.countDocuments({ parentId: { $in: [null, undefined] } })

		// Execute the query
		const posts = await postsQuery.exec()

		// Check if there are next posts
		const isNext = totalPostsCount > skipAmount + posts.length

		// Return the posts and the isNext flag
		return { posts, isNext }
	} catch (error: any) {
		throw new Error(`Failed to fetch posts: ${error.message}`)
	}
}
