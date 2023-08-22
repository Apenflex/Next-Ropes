'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { usePathname, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Textarea } from '@/components/ui/textarea'
import { createRope } from '@/lib/actions/rope.actions'
import { RopeValidation } from '@/lib/validations/rope'

const PostRope = ({ userId }: { userId: string }) => {
	const router = useRouter()
	const pathname = usePathname()

	const form = useForm({
		resolver: zodResolver(RopeValidation),
		defaultValues: {
			rope: '',
			accountId: userId,
		},
	})

	const onSubmit = async (values: z.infer<typeof RopeValidation>) => {
		await createRope({
			text: values.rope,
			author: userId,
			communityId: null,
			path: pathname,
    })
    
    router.push('/')
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="mt-10 flex flex-col justify-start gap-10">
				<FormField
					control={form.control}
					name="rope"
					render={({ field }) => (
						<FormItem className="flex w-full flex-col gap-3">
							<FormLabel className="text-base-semibold text-light-2">Content</FormLabel>
							<FormControl className="no-focus border border-dark-4 bg-dark-3 text-light-1">
								<Textarea rows={15} {...field} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit" className="bg-primary-500">
					Post Rope
				</Button>
			</form>
		</Form>
	)
}

export default PostRope
