import { redirect } from 'next/navigation'

import { fetchUserPosts } from '@/lib/actions/user.actions'

interface RopesTabProps {
	currentUserId: string
	accountId: string
	accoutType: string
}

const RopesTab = async ({ currentUserId, accountId, accoutType }: RopesTabProps) => {
	let res = await fetchUserPosts(accountId)
	if (!res) redirect('/')

	return <section className="mt-9 flex flex-col gap-10">RopesTab</section>
}

export default RopesTab
