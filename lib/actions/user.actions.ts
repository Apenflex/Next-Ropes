'use server'

import { FilterQuery, SortOrder } from 'mongoose'
import { revalidatePath } from 'next/cache'

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

		return await User.findOne({ id: userId })
		// .populate({ path: 'communities', model: Community })
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
			populate: {
				path: 'children',
				model: Rope,
				populate: {
					path: 'author',
					model: User,
					select: 'id name image',
				},
			},
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

		const skipAmount = (pageNumber - 1) * pageSize
		const regex = new RegExp(searchString, 'i')

		const query: FilterQuery<typeof User> = {
			id: { $ne: userId },
		}
		if (searchString.trim() !== '') {
			query.$or = [{ username: { $regex: regex } }, { name: { $regex: regex } }]
		}

		const sortOptions = { createdAt: sortBy }

		const usersQuery = User.find(query).sort(sortOptions).skip(skipAmount).limit(pageSize)

		const totalUsersCount = await User.countDocuments(query)

		const users = await usersQuery.exec()

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
