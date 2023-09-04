import { currentUser } from '@clerk/nextjs'
import Image from 'next/image'

import UserCard from '@/components/cards/UserCard'
import { ProfileHeader } from '@/components/shared'
import { RopesTab } from '@/components/shared'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { communityTabs } from '@/constants'
import { fetchCommunityDetails } from '@/lib/actions/community.actions'

export default async function Page({ params }: { params: { id: string } }) {
	const user = await currentUser()
	if (!user) return null

	const communityDetails = await fetchCommunityDetails(params.id)

	return (
		<section>
			<ProfileHeader
				accountId={communityDetails.id}
				authUserId={user.id}
				name={communityDetails.name}
				username={communityDetails.username}
				imgUrl={communityDetails.image}
				bio={communityDetails.bio}
				type="Community"
			/>

			<div className="mt-9">
				<Tabs defaultValue="ropes" className="w-full">
					<TabsList className="tab">
						{communityTabs.map((tab) => (
							<TabsTrigger key={tab.label} value={tab.value} className="tab">
								<Image src={tab.icon} alt={tab.label} width={24} height={24} className="object-contain" />
								<p className="max-sm:hidden">{tab.label}</p>
								{tab.label === 'Ropes' && (
									<p className="ml-1 rounded-sm bg-light-4 px-2 py-1 !text-tiny-medium text-light-2">
										{communityDetails?.ropes?.length}
									</p>
								)}
							</TabsTrigger>
						))}
					</TabsList>
					<TabsContent value="ropes" className="w-full text-light-1">
						<RopesTab currentUserId={user.id} accountId={communityDetails._id} accountType="Community" />
					</TabsContent>
					<TabsContent value="members" className="w-full text-light-1">
						<section className="mt-9 flex flex-col gap-10">
							{communityDetails?.members.map((member: any) => (
								<UserCard
									key={member.id}
									id={member.id}
									name={member.name}
									username={member.username}
									imgUrl={member.image}
									personType="User"
								/>
							))}
						</section>
					</TabsContent>
					<TabsContent value="requests" className="w-full text-light-1">
						<RopesTab currentUserId={user.id} accountId={communityDetails._id} accountType="Community" />
					</TabsContent>
				</Tabs>
			</div>
		</section>
	)
}
