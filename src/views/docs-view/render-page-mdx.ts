/**
 * Copyright (c) HashiCorp, Inc.
 * SPDX-License-Identifier: MPL-2.0
 */

import { trace } from '@opentelemetry/api'
import type { MDXRemoteSerializeResult } from 'lib/next-mdx-remote'
import { serialize } from 'lib/next-mdx-remote/serialize'
import { Pluggable } from 'unified'
import grayMatter from 'gray-matter'
interface Options {
	mdxContentHook?: (content: string, scope: Options['scope']) => string
	remarkPlugins?: Pluggable[]
	rehypePlugins?: Pluggable[]
	scope?: Record<string, unknown>
}

async function renderPageMdx(
	mdxFileString: string,
	{
		mdxContentHook = (c, scope) => c,
		remarkPlugins = [],
		rehypePlugins = [],
		scope,
	}: Options = {}
): Promise<{
	mdxSource: MDXRemoteSerializeResult
	frontMatter: Record<string, unknown>
}> {
	return await trace
		.getTracer('docs-view')
		.startActiveSpan('renderPageMdx', async (span) => {
			try {
				const { data: frontMatter, content: rawContent } =
					grayMatter(mdxFileString)
				const content = mdxContentHook(rawContent, scope)
				const mdxSource = await serialize(content, {
					mdxOptions: {
						remarkPlugins,
						rehypePlugins,
					},
					scope,
				})
				return { mdxSource, frontMatter }
			} finally {
				span.end()
			}
		})
}

export default renderPageMdx
