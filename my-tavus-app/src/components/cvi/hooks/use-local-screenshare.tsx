import { useCallback } from 'react';
import { useDaily, useLocalSessionId, useScreenVideoTrack } from '@daily-co/daily-react';

export const useLocalScreenshare = (): {
	isScreenSharing: boolean;
	localSessionId: string;
	onToggleScreenshare: () => void;
} => {
	const daily = useDaily();
	const localSessionId = useLocalSessionId();
	const { isOff } = useScreenVideoTrack(localSessionId);
	const isScreenSharing = !isOff;

	const onToggleScreenshare = useCallback(() => {
		if (!daily) {
			console.warn('Cannot start screen share: Daily client not available');
			return;
		}

		// Check if we're in a joined state by checking if we have participants
		const participants = daily.participants();
		if (!participants || !participants.local) {
			console.warn('Cannot start screen share: call not joined yet');
			return;
		}

		if (isScreenSharing) {
			daily.stopScreenShare();
		} else {
			daily.startScreenShare({
				displayMediaOptions: {
					audio: false,
					selfBrowserSurface: 'exclude',
					surfaceSwitching: 'include',
					video: {
						width: 1920,
						height: 1080,
					},
				},
			});
		}
	}, [daily, isScreenSharing]);

	return {
		isScreenSharing,
		localSessionId,
		onToggleScreenshare,
	};
};
