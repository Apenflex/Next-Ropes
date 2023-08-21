import * as z from 'zod'

export const RopeValidation = z.object({
	rope: z.string().nonempty().min(3, {message: 'Minimum 3 characters'}),
	accountId: z.string(),
})

export const CommentValidation = z.object({
	rope: z.string().nonempty().min(3, {message: 'Minimum 3 characters'}),
})