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
