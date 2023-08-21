'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Image from 'next/image'
import { ChangeEvent, useState } from 'react'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
	Form,
	FormControl,
	FormDescription,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useUploadThing } from '@/lib/uploadthing'
import { isBase64Image } from '@/lib/utils'
import { UserValidation } from '@/lib/validations/user'

interface AccountProfileProps {
	user: {
		id: string
		objectId: string
		username: string
		name: string
		bio: string
		image: string
	}
	btnTitle: string
}

const AccountProfile = ({ user, btnTitle }: AccountProfileProps) => {
	const [files, setFiles] = useState<File[]>([])
	const { startUpload } = useUploadThing('media')

	const form = useForm({
		resolver: zodResolver(UserValidation),
		defaultValues: {
			profile_photo: user?.image || '',
			name: user?.name || '',
			username: user?.username || '',
			bio: user?.bio || '',
		},
	})

	const handleImage = (e: ChangeEvent<HTMLInputElement>, fieldChange: (value: string) => void) => {
    e.preventDefault()
    
    const fileReader = new FileReader()

    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      setFiles(Array.from(e.target.files))

      if (!file.type.includes('image')) return
      
      fileReader.onload = async (event) => {
        const imageDataUrl = event.target?.result?.toString() || ''

        fieldChange(imageDataUrl)
      }
      fileReader.readAsDataURL(file)
    }
	}

	const onSubmit = async(values: z.infer<typeof UserValidation>) => {
		const blob = values.profile_photo

		const hasImageChanged = isBase64Image(blob)
		if (hasImageChanged) {
			const imgRes = await startUpload(files)

			if (imgRes && imgRes[0].url) {
				values.profile_photo = imgRes[0].url
			}
		}
		// TODO: Update user profile
	}

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-start gap-10">
				{/* Profile Photo */}
				<FormField
					control={form.control}
					name="profile_photo"
					render={({ field }) => (
						<FormItem className="flex items-center gap-4">
							<FormLabel className="account-form_image-label">
								{field.value ? (
									<Image
										src={field.value}
										alt="profile photo"
										width={96}
										height={96}
										priority
										className="aspect-[4/4] rounded-full object-cover"
									/>
								) : (
									<Image
										src="/assets/profile.svg"
										alt="profile photo"
										width={24}
										height={24}
										className="object-contain"
									/>
								)}
							</FormLabel>
							<FormControl className="text-base-semibold flex-1 text-gray-200">
								<Input
									type="file"
									accept="image/*"
									placeholder="Upload a photo"
									className="account-form_image-input"
									onChange={(e) => handleImage(e, field.onChange)}
								/>
							</FormControl>
						</FormItem>
					)}
				/>
				{/* Profile Name */}
				<FormField
					control={form.control}
					name="name"
					render={({ field }) => (
						<FormItem className="flex w-full flex-col gap-3">
							<FormLabel className="text-base-semibold text-light-2">Name</FormLabel>
							<FormControl>
								<Input type="text" className="account-form_input no-focus" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				{/* Profile Username */}
				<FormField
					control={form.control}
					name="username"
					render={({ field }) => (
						<FormItem className="flex w-full flex-col gap-3">
							<FormLabel className="text-base-semibold text-light-2">Username</FormLabel>
							<FormControl>
								<Input type="text" className="account-form_input no-focus" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				{/* Profile Bio */}
				<FormField
					control={form.control}
					name="bio"
					render={({ field }) => (
						<FormItem className="flex w-full flex-col gap-3">
							<FormLabel className="text-base-semibold text-light-2">Bio</FormLabel>
							<FormControl>
								<Textarea rows={10} className="account-form_input no-focus" {...field} />
							</FormControl>
						</FormItem>
					)}
				/>
				<Button type="submit" className="bg-primary-500">
					Submit
				</Button>
			</form>
		</Form>
	)
}

export default AccountProfile
