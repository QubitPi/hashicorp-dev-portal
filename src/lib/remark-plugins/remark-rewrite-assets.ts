/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import * as path from 'path'
import { visitParents } from 'unist-util-visit-parents'

import type { Plugin } from 'unified'
import type { Image } from 'mdast'

/**
 * This is a generator function that returns a remark plugin
 * to rewrite asset urls in markdown files.
 */
export function remarkRewriteAssets(args: {
	product: string
	version: string
	getAssetPathParts?: (nodeUrl: string) => string[]
	isInUDR?: boolean
}): Plugin {
	const {
		product,
		version,
		getAssetPathParts = (nodeUrl) => [nodeUrl],
		isInUDR = false,
	} = args

	return function plugin() {
		return function transform(tree) {
			// @ts-expect-error Types Should be correct here
			visitParents<Image>(tree, 'image', (node, ancestors: Array<Parent>) => {
				let url
				const originalUrl = node.url

				if (isInUDR) {
					let domain

					if (process.env.NODE_ENV === 'development') {
						domain = `http://localhost:${process.env.UNIFIED_DOCS_PORT}`
					} else {
						domain = process.env.UNIFIED_DOCS_API
					}

					url = new URL(`${domain}/api/assets/${product}/${version}${node.url}`)
				} else {
					const asset = path.posix.join(...getAssetPathParts(originalUrl))

					url = new URL(`${process.env.MKTG_CONTENT_DOCS_API}/api/assets`)
					url.searchParams.append('asset', asset)
					url.searchParams.append('version', version)
					url.searchParams.append('product', product)
				}

				node.url = url.toString()
				logOnce(
					node.url,
					`Rewriting asset url for local preview:
- Found: ${originalUrl}
- Replaced with: ${node.url}

If this is a net-new asset, you'll need to commit and push it to GitHub.\n`
				)

				// if the image is wrapped in a link, and shares the same url as the original image, then update the link's url to the new asset url
				if (isInUDR) {
					const parent = ancestors[ancestors.length - 1]
					if (parent && parent.type === 'link' && parent.url === originalUrl) {
						parent.url = url.toString()
					}
				}
			})
		}
	}
}

// A simple cache & util to prevent logging the same message multiple times
const cache = new Map<string, boolean>()
const logOnce = (id: string, message: string) => {
	if (process.env.CI) {
		return
	}
	if (cache.get(id)) {
		return
	}
	cache.set(id, true)
	console.log(message)
}
