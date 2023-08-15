import { currentUser } from '@clerk/nextjs'

import { AccountProfile } from '@/components/forms'

export default async function Page() {
	const user = await currentUser()

	const userInfo = {}
	const userData = {
		id: user?.id,
		objectId: userInfo?._id,
		username: userInfo?.username || user?.username,
		name: userInfo?.name || user?.firstName || '',
		bio: userInfo?.bio || '',
		image: userInfo?.image || user?.imageUrl,
	}

	return (
		<main className="mx-auto flex max-w-3xl flex-col justify-start px-10 py-20">
			<h1 className="head-text">Onboarding</h1>
			<p className="text-base-regular text-light-2 mt-3">Complete your profile now to use Ropes</p>
			<section className="bg-dark-2 mt-9 p-10">
				<AccountProfile user={userData} btnTitle='Continue' />
			</section>
		</main>
	)
}
