import { currentUser } from '@clerk/nextjs'
import { redirect } from 'next/navigation'

import { PostRope } from '@/components/forms'
import { fetchUser } from '@/lib/actions/user.actions'

export default async function Page() {
	const user = await currentUser()
	if (!user) return null

  const userInfo = await fetchUser(user.id)
  if (!userInfo?.onboarded) redirect('/onboarding')
  
  const userId = userInfo._id.toString()
  
	return (
		<>
			<h1 className="head-text">Create Rope</h1>
			<PostRope userId={userId} />
		</>
	)
}
