import { AUTH_ENABLED } from 'hooks/use-authentication'
import { TutorialCardBookmarkButton } from 'components/bookmark-button'
import TutorialCard from '.'
import { TutorialCardPropsWithId } from '.'

export function ConnectedTutorialCard(props: TutorialCardPropsWithId) {
	/**
	 * const isBookmarked = useIsBookmarked(props.id)
	 */
	return (
		<TutorialCard
			{...props}
			eyebrowSlot={
				<>
					<span>{props.duration}</span>
					{/** Hide from prod until auth is enabled */}
					{AUTH_ENABLED ? (
						<TutorialCardBookmarkButton isBookmarked={false} />
					) : null}
				</>
			}
		/>
	)
}