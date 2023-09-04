'use server'

import { revalidatePath } from 'next/cache'

import Community from '@/lib/models/community.model'
import Rope from '@/lib/models/rope.model'
import User from '@/lib/models/user.model'
import { connectToDB } from '@/lib/mongoose'

interface CreateRopeParams {
	text: string
	author: string
	communityId: string | null
	path: string
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
				path: 'community',
				model: Community,
			})
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

export async function createRope({ text, author, communityId, path }: CreateRopeParams) {
	try {
		connectToDB()

		const communityIdObject = await Community.findOne({ id: communityId }, { _id: 1 })

		const createdRope = await Rope.create({
			text,
			author,
			community: communityIdObject,
		})

		// Update User Model
		await User.findByIdAndUpdate(author, {
			$push: { ropes: createdRope._id },
		})

		if (communityIdObject) {
			// Update Community Model
			await Community.findByIdAndUpdate(communityIdObject, {
				$push: { ropes: createdRope._id },
			})
		}

		revalidatePath(path)
	} catch (error: any) {
		throw new Error(`Failed to create rope: ${error.message}`)
	}
}

async function fetchAllChildRopes(ropeId: string): Promise<any[]> {
	const childRopes = await Rope.find({ parentId: ropeId })

	const descendantRopes = []
	for (const childRope of childRopes) {
		const descendants = await fetchAllChildRopes(childRope._id)
		descendantRopes.push(childRope, ...descendants)
	}

	return descendantRopes
}

export async function deleteRope(id: string, path: string): Promise<void> {
	try {
		connectToDB()

		// Find the rope to be deleted (the main rope)
		const mainRope = await Rope.findById(id).populate('author community')

		if (!mainRope) throw new Error('Rope not found')

		// Fetch all child ropes and their descendants recursively
		const descendantRopes = await fetchAllChildRopes(id)

		// Get all descendant rope IDs including the main rope ID and child rope IDs
		const descendantRopeIds = [id, ...descendantRopes.map((rope) => rope._id)]

		// Extract the authorIds and communityIds to update User and Community models respectively
		const uniqueAuthorIds = new Set(
			[...descendantRopes.map((rope) => rope.author?._id?.toString()), mainRope.author?._id?.toString()].filter(
				(id) => id !== undefined
			)
		)

		const uniqueCommunityIds = new Set(
			[
				...descendantRopes.map((rope) => rope.community?._id?.toString()),
				mainRope.community?._id?.toString(),
			].filter((id) => id !== undefined)
		)

		// Recursively delete child ropes and their descendants
		await Rope.deleteMany({ _id: { $in: descendantRopeIds } })

		// Update User model
		await User.updateMany(
			{ _id: { $in: Array.from(uniqueAuthorIds) } },
			{ $pull: { ropes: { $in: descendantRopeIds } } }
		)

		// Update Community model
		await Community.updateMany(
			{ _id: { $in: Array.from(uniqueCommunityIds) } },
			{ $pull: { ropes: { $in: descendantRopeIds } } }
		)

		revalidatePath(path)
	} catch (error: any) {
		throw new Error(`Failed to delete rope: ${error.message}`)
	}
}

export async function fetchRopeById(id: string) {
	try {
		connectToDB()
		// TODO: Populate the Community
		const rope = await Rope.findById(id)
			.populate({ path: 'author', model: User, select: '_id id name image' })
			.populate({ path: 'community', model: Community, select: '_id id name image' })
			.populate({
				path: 'children',
				populate: [
					{
						path: 'author',
						model: User,
						select: '_id id name parentId image',
					},
					{
						path: 'children',
						model: Rope,
						populate: {
							path: 'author',
							model: User,
							select: '_id id name parentId image',
						},
					},
				],
			})
			.exec()

		return rope
	} catch (error: any) {
		throw new Error(`Failed to fetch post by id: ${error.message}`)
	}
}

export async function addCommentToRope(ropeId: string, commentText: string, userId: string, path: string) {
	try {
		connectToDB()

		// Find the original rope by ID
		const originalRope = await Rope.findById(ropeId)
		if (!originalRope) throw new Error('Rope not found')

		// Create a new rope with the comment text
		const commentRope = new Rope({
			text: commentText,
			author: userId,
			parentId: ropeId,
		})

		// Save the new rope
		const savedCommentRope = await commentRope.save()

		// Update the original rope to add the new comment
		originalRope.children.push(savedCommentRope._id)

		// Save the original rope
		await originalRope.save()

		revalidatePath(path)
	} catch (error: any) {
		throw new Error(`Failed to add comment to rope: ${error.message}`)
	}
}
