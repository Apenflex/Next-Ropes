'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { addCommentToRope } from '@/lib/actions/rope.actions'
import { CommentValidation } from '@/lib/validations/rope'

interface CommentProps {
	ropeId: string
	currentUserImg: string
	currentUserId: string
}

const Comment = ({ ropeId, currentUserImg, currentUserId }: CommentProps) => {
	const router = useRouter()
	const pathname = usePathname()

	const form = useForm({
		resolver: zodResolver(CommentValidation),
		defaultValues: {
			rope: '',
		},
	})

	const onSubmit = async (values: z.infer<typeof CommentValidation>) => {
		await addCommentToRope(ropeId, values.rope, JSON.parse(currentUserId), pathname)
		form.reset()
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="comment-form">
				<FormField
					control={form.control}
					name="rope"
					render={({ field }) => (
						<FormItem className="flex w-full items-center gap-3">
							<FormLabel>
								<Image
									src={currentUserImg}
									alt="Profile Image"
									width={48}
									height={48}
									className="rounded-full object-cover"
								/>
							</FormLabel>
							<FormControl className="border-none bg-transparent">
								<Input
									type="text"
									placeholder="Comment..."
									{...field}
									className="no-focus text-light-1 outline-none"
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				<Button type="submit" className="comment-form_btn">
					Reply
				</Button>
			</form>
		</Form>
	)
}

export default Comment
