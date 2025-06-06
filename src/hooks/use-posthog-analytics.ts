/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { useEffect } from 'react'
import { useRouter } from 'next/router'
import posthog, { type PostHog } from 'posthog-js'

declare global {
	/* 
	Loaded via a posthog script tag in GTM based on datagrail consent
	*/
	interface Window {
		posthog?: PostHog
	}
}

function onRouteChangeComplete() {
	/**
	 * PostHog automatically captures a `pageview` for initial page loads.
	 * Subsequent client-side navigation events have to be captured manually,
	 * which is why we have to set up this `onRouteChangeComplete` event.
	 *
	 * PostHog documentation for capturing pageviews in SPA with the JS web installation:
	 * https://posthog.com/docs/libraries/js#single-page-apps-and-pageviews
	 */
	posthog.capture('$pageview')
}

/**
 * Enables PostHog page view tracking on route changes
 */
export default function usePostHogPageAnalytics(): void {
	const router = useRouter()

	useEffect(() => {
		posthog.config.capture_pageview = false

		// Record a pageview when route changes
		router.events.on('routeChangeComplete', onRouteChangeComplete)

		// Unassign event listener
		return () => {
			router.events.off('routeChangeComplete', onRouteChangeComplete)
		}
	}, [router.events])
}
