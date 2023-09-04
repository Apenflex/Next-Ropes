'use server'

import { FilterQuery, SortOrder } from 'mongoose'
import { revalidatePath } from 'next/cache'

import Community from '@/lib/models/community.model'
import Rope from '@/lib/models/rope.model'
import User from '@/lib/models/user.model'
import { connectToDB } from '@/lib/mongoose'

interface UpdateUserParams {
	userId: string
	username: string
	name: string
	image: string
	bio: string
	path: string
}

export async function updateUser({ userId, username, name, image, bio, path }: UpdateUserParams): Promise<void> {
	try {
		connectToDB()

		await User.findOneAndUpdate(
			{ id: userId },
			{ username: username.toLowerCase(), name, image, bio, onboarded: true },
			{ upsert: true }
		)
		if (path === '/profile/edit') {
			revalidatePath(path)
		}
	} catch (error: any) {
		throw new Error(`Failed to create/update user: ${error.message}`)
	}
}

export async function fetchUser(userId: string) {
	try {
		connectToDB()

		return await User.findOne({ id: userId }).populate({ path: 'communities', model: Community })
	} catch (error: any) {
		throw new Error(`Failed to fetch user: ${error.message}`)
	}
}

export async function fetchUserPosts(userId: string) {
	try {
		connectToDB()
		// Find all ropes authored by user with given userId
		// TODO: Populate Community
		const ropes = await User.findOne({ id: userId }).populate({
			path: 'ropes',
			model: Rope,
			populate: [
				{
					path: 'community',
					model: Community,
					select: 'id _id name image',
				},
				{
					path: 'children',
					model: Rope,
					populate: {
						path: 'author',
						model: User,
						select: 'id name image',
					},
				},
			],
		})

		return ropes
	} catch (error: any) {
		throw new Error(`Failed to fetch user ropes: ${error.message}`)
	}
}

export async function fetchUsers({
	userId,
	searchString = '',
	pageNumber = 1,
	pageSize = 20,
	sortBy = 'desc',
}: {
	userId: string
	searchString?: string
	pageNumber?: number
	pageSize?: number
	sortBy?: SortOrder
}) {
	try {
		connectToDB()

		// Calculate the number of users to skip based on the page number and page size.
		const skipAmount = (pageNumber - 1) * pageSize

		// Create a case-insensitive regular expression for the provided search string.
		const regex = new RegExp(searchString, 'i')

		// Create an initial query object to filter users.
		const query: FilterQuery<typeof User> = {
			id: { $ne: userId },
		}

		// If the search string is not empty, add the $or operator to match either username or name fields.
		if (searchString.trim() !== '') {
			query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }]
		}

		// Define the sort options for the fetched users based on createdAt field and provided sort order.
		const sortOptions = { createdAt: sortBy }

		const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize)

		// Count the total number of users that match the search criteria (without pagination).
		const totalUsersCount = await User.countDocuments(query)

		const users = await usersQuery.exec()

		// Check if there are more users beyond the current page.
		const isNext = totalUsersCount > skipAmount + users.length

		return { users, isNext }
	} catch (error: any) {
		throw new Error(`Failed to fetch users: ${error.message}`)
	}
}

export async function GetActivity(userId: string) {
	try {
		connectToDB()

		// Find all ropes created by user
		const userRopes = await Rope.find({ author: userId })

		// Collect all the child ropes ids (replies) from the 'children' field
		const childRopesIds = userRopes.reduce((acc, userRope) => {
			return acc.concat(userRope.children)
		}, [])

		// Find and return the child ropes (replies) excluding the ones created by the same user
		const replies = await Rope.find({
			_id: { $in: childRopesIds },
			author: { $ne: userId },
		}).populate({
			path: 'author',
			model: User,
			select: 'name image _id',
		})

		return replies
	} catch (error: any) {
		throw new Error(`Failed to fetch user activity: ${error.message}`)
	}
}
