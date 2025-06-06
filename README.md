[![Docker](https://img.shields.io/badge/Running%20Doc%20in%20Docker-309DEE?style=for-the-badge&logo=docker&logoColor=white)](https://hub.docker.com/r/jack20191124/hashicorp-dev-portal)

# HashiCorp Product Documentations Builder

This repo hosts the build logic for the following HashiCorp product documentation **forks**:

- [Packer][product packer fork]
- [Terraform][product terraform fork]
- [Vault][product vault fork]

The repo does NOT host documentation contents; instead it **centralizes documentation build** using [Next.js][next.js]
framework. Each product documentation builds by cloning this repo to their local as the builder and then invoking

```bash
PRODUCT_DOC_BASE_PATH=/hashicorp-vault npm run build:deploy-preview
```

at the end of their corresponding [website-build.sh (Vault example)][vault website-build.sh]

> The command above takes [Vault][product vault fork] as an example. **It is important to make sure the value of
> `PRODUCT_DOC_BASE_PATH` starts with `/`**, otherwise build ends up with errors
>
> Note that the `build:deploy-preview` is a builder script that gets invoked in product repo. The invocation chain is
> (taking [Vault][product vault fork] as an example):
>
> Vault (`npm run build`) -> Vault (execute `website-build.sh`) -> Builder (this repo: `npm run build:deploy-preview`)

## Builder Usage Example (using [Vault][product vault fork])

Checkout [Vault][product vault fork] and build:

```bash
git clone git@github.com:QubitPi/hashicorp-vault.git
cd hashicorp-vault/website
npm run build
```

The last command [generates the static site under `./website-preview/.next` directory][next.js build api] and makes a
dedicated directory for Vault documentation, let's say `hashicorp-vault-docs`. Next we obtain a complete [GitHub Pages
deployable][vault github pages deployable] in the following steps:

1. Copy everything under `hashicorp-vault/website/website-preview/.next/server/pages` into `hashicorp-vault-docs`:

   ```bash
   cp -r hashicorp-vault/website/website-preview/.next/server/pages/* hashicorp-vault-docs
   ```

   Note that we use 'copy', instead of 'move', command here because later steps still need to look at this original
   directory for some processing info

2. Copy everything under `.next/static/` into `hashicorp-vault-docs` and rename it as `_next/static`:

   ```bash
   mkdir hashicorp-vault-docs/_next
   cp -r hashicorp-vault/website/website-preview/.next/static hashicorp-vault-docs/_next/static
   ```

3. (HashiCorp specific) Put every thing inside `hashicorp-vault/website/website-preview/.next/server/pages` directory
   into a directory named by a random string ID and put this directory under `hashicorp-vault-docs/_next/data`.

   Next.js makes each build an immutable deployable by prefixing static resource path with a random string. This random
   string can be seen under `hashicorp-vault/website/website-preview/.next/static`:

   ```bash
   $ ls static/
   _3Jxeg2Dn24g3DTR-U	css			media
   chunks			images
   ```

   In this case, the random string is `_3Jxeg2Dn24g3DTR-U` which will be the name of the aforementioned directory

   ```bash
   mkdir -p hashicorp-vault-docs/_next/data/_3Jxeg2Dn24g3DTR-U
   cp -r hashicorp-vault/website/website-preview/.next/server/pages/* hashicorp-vault-docs/_next/data/_3Jxeg2Dn24g3DTR-U
   ```

4. Put an empty `.nojekyll` under `hashicorp-vault-docs` to prevent Jekyll interruption during the build

Now the `hashicorp-vault-docs` becomes a completed [GitHub Pages deployable][vault github pages deployable] which can
be served from `gh-pages` branch.

---

# HashiCorp Developer - developer.hashicorp.com

Welcome to HashiCorp Developer! This is the home for HashiCorp product reference documentation and tutorials for our practitioners. For background information on this project, refer to [[MKTG-034]](https://docs.google.com/document/d/1ASyBOCWWP8VUahbL5c5y0qrDMgqhYdXJ2h15xzh3JtA/edit#heading=h.spiwwyows3cr).

> **Content Authors** Please see [this documentation](./src/content/README.md) for contributing content updates to Developer. Reach out in [#proj-dev-portal](https://hashicorp.slack.com/archives/C01KCU4HDPY) on Slack if you have any issues / questions.

## Table of contents

- [Local Development](#local-development)
- [Accessibility](#accessibility)
- [Testing](#testing)
- [Helpers](#helpers)
- [Component Organziation](#component-organization)
- [Configuration](#configuration)
- [Analytics](#analytics)
- [SEO metadata](#seo-metadata)
- [Performance](#performance)
- [Remote Content & Application context](#remote-content--application-context)

## Local Development

### Setting Up Environment Variables

There are a few things you need to set up before you can begin developing in this repository.

1. [Install the Vercel CLI](https://vercel.com/cli)

   The CLI is needed for the next 2 steps.

2. Run `vercel link`

   This command will prompt you to connect your local copy of repo to [the Vercel `dev-portal` project](https://vercel.com/hashicorp/dev-portal). The command creates a `.vercel` directory with a JSON file that contains the information that links to the Vercel project.

3. Run `vercel env pull .env.local`

   This command will pull the development environment variables from the linked Vercel project and write them to a new file called `.env.local`.

4. Remove the line containing `VERCEL="1"` from `.env.local`.

   This step is required to prevent the login flow from using HTTPS URLs.

### Running The Project

If you're developing in this repository, get started by running:

```
npm install
npm start
```

This will give you a development server running on [localhost:3000](http://localhost:3000).

> **Note**: Historically, the `.io` sites were served from this repository. They have been migrated into [the hashicorp/web repository](https://github.com/hashicorp/web). See [this RFC](https://docs.google.com/document/d/1iLx2jL09YkLbhSXdK9ScSedwSiujYDEa524FejOAnZM/) for full context.

### Running in a Docker container

If using `npm` isn't working for you, you can try running the website through the Docker container instead.

1. Build the docker container and tag it with something memorable, e.g. `dev-portal`:

   ```shell-session
   $ docker build -t dev-portal .
   [+] Building 115.2s (16/16) FINISHED
   => => naming to docker.io/library/dev-portal 
   ```
1. Run the container, making sure to export port 3000 and mount the local source files into it:

   ```shell-session
   $ docker run -it -v $(pwd)/src:/app/website-preview/src -p 3000:3000 dev-portal
   ...
   > Ready on http://localhost:3000
   ```

Now you can view the website on http://localhost:3000 and any local edits will be reflected on the rendered page.

### Installing Recommended VS Code Extensions

In the `.vscode` directory, you'll find [an `extensions.json` file](./.vscode/extensions.json) that lists recommended VS Code extensions to use for this project.

To add the recommended extensions:

1. Open VS Code
2. Open [the command palette](https://code.visualstudio.com/docs/getstarted/userinterface#_command-palette)
3. Type `Show Recommended Extensions`
4. Hit the `Enter` key
5. Click the "Install Workspace Recommended Extensions" icon (it looks like a cloud with an arrow pointing down) under the Workspace Recommendations section of the sidebar

### Project VS Code Settings

In the `.vscode` directory, you'll find [a `settings.json` file](./.vscode/settings.json) with VS Code settings for this project.

- `source.fixAll.eslint` enables auto-fixing of eslint issues when a file is saved
- `eslint.codeActionsOnSave.rules` specifies which rules can be auto-fixed on save

## Accessibility

`@axe-core/react` is a package that allows us to run accessibility checks against the rendered DOM and see results in a browser dev tools console.

_\*\* Note: it is recommended to use Chrome. There is limited functionality in Safari and Firefox_

### Why is it used in `dev-portal`?

We use it for local accessibility testing of the DOM. It does not replace other tools like linting rules and tools like linting rules also do not replace this tool. Both kinds of tools are important for different reasons. Linters can help us write accessible code and form good habits, but they can't check the full output of the code. Tools that check the DOM ensure that the final state of elements is accessible including all calculated text and colors.

### How do I use it as a development tool?

The code is set up in [`_app.tsx`](/src/pages/_app.tsx) to only use `react-dom` and `@axe-core/react` if the `AXE_ENABLED` environment variable is set. We've added an npm script to make setting that variable easy. To run the app locally with `@axe-core/react` enabled, run the following command in your terminal instead of `npm start`:

```
npm run start:with-axe
```

After you've got the project running locally with `AXE_ENABLED` set, you can open a browser to the local server and look at the dev tools console and inspect the console logs output by `@axe-core/react`.

## Testing

We use [jest](https://jestjs.io/) to write unit tests for our code. We also have [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/) integrated for writing tests against our rendered React components.

To run tests:

```
npm test
```

To run tests in watch mode:

```
npm run test:watch
```

Additionally, we use [Playwright](https://playwright.dev/) for end-to-end integration tests. Playwright tests should be used when testing functionality that requires a running Next.js server, such as middleware and redirects.

To run the end-to-end tests:

```
npm run test:e2e
```

To view the report for an end-to-end test run:

```
npx playwright show-report
```

## Helpers

### Reset with `clean`

Auto-populated subdirectories such as `.next` and `node_modules` can sometimes become out of date. Delete all related subdirectories with the `clean` command.

```
npm install
npm run clean
```

## Component Organization

In order to create some structure and consistency throughout this project, we're creating some light guidelines around where certain components should live. We have three top-level folders which should house components:

```
src/
  components/
  views/
  layouts/
  hooks/
  contexts/
```

- **`components`** - Shareable, smaller components for use across any number of other components
- **`views`** - Componentry which represents a full site "view." This is a way to abstract out page components and easily co-locate related code. Not necessarily intended for re-use, unless one needs to render the same view on multiple pages. This also allows us to co-locate sub-components and test files with page components, which is otherwise difficult with file-based routing
- **`layouts`** - Layout components which are generic and possibly used across different pages (see [Next.js docs](https://nextjs.org/docs/basic-features/layouts#per-page-layouts))
  - **Note**: In support of future app-router adoption, we are no longer using the `.layout` or `.getLayout` pattern, which is not supported in the app directory.
- **`hooks`** - Shared hooks which are applicable for use across a variety of other components. Hooks which access shared contexts should live in `contexts/` (see below)
- **`contexts`** - Shared [contexts](https://reactjs.org/docs/context.html) and utilities for accessing / interacting with the context values

An example implementation of components laid out this way:

```tsx
// pages/some/page.tsx
import SomePageView from 'views/some-page'
import SomeLayout from 'layouts/some-layout'

// if we need to adjust props, can wrap this to make any changes necessary
export default function SomePage(props) {
	return (
		<SomeLayout>
			<SomePageView {...props} />
		</SomeLayout>
	)
}
```

## Configuration

Per-environment configuration values are defined in JSON files in the `config/` folder. Each environment has its own config file, controlled by the `HASHI_ENV` environment variable, currently:

```
config/
  base.json # May be used in any environment, including production (see below)
  development.json
  preview.json
  production.json
```

Each configuration can define an `extends` property, which will cause it to merge its properties with the extended configuration file. If no `extends` property is explicitly defined, the configuration file will extend from `base.json`.

The configuration values are available globally within the application. They can be accessed from a global `__config` object:

```js
// config file:
{
   "my_config_value": "foo"
}

// in code:
console.log(__config.my_config_value)
```

Configuration files should be used for any non-sensitive configuration values needed throughout the application which might vary by environment. Consider API endpoints, constants, and flags in scope for the configuration files. Any references to `__config` are replaced at build-time with the values from the environment's configuration file using [Webpack's DefinePlugin](https://webpack.js.org/plugins/define-plugin/).

## Search

We're using [Algolia](https://www.algolia.com/) to make the repository searchable. The search index is automatically updated when content changes are pushed in the various content repositories. The scripts to update the search index live in `mktg-content-workflows`: [docs](https://github.com/hashicorp/mktg-content-workflows/tree/main/workflows/update-search-index), [tutorials](https://github.com/hashicorp/mktg-content-workflows/tree/main/workflows/update-search-index-tutorials), and [integrations](https://github.com/hashicorp/mktg-content-workflows/tree/main/workflows/algolia-sync/sources/integrations).

The `main` branch and all preview builds use the production Algolia index, `prod_DEVDOT_omni`. To use the staging index, `staging_DEVDOT_omni`, update the [algolia config value](https://github.com/hashicorp/dev-portal/blob/3d0c59d51240798f42fd3ce79b9e30a47371784f/config/base.json#L11-L15).

## Analytics

Calls to `window.analytics.track()` are logged in development for easy iteration while adding analytics code. If you would prefer to reduce the noise created by these logs, start the app with `NEXT_PUBLIC_ANALYTICS_LOG_LEVEL=0`:

```
$ NEXT_PUBLIC_ANALYTICS_LOG_LEVEL=0 npm start
```

## SEO Metadata

The meta tags for the site are rendered by the [`HeadMetadata`](./src/components/head-metadata/index.tsx) component. Each page which uses `getStaticProps` can return a `metadata` property in its prop object to control the metadata which is ultimately rendered. The root site title is defined in our base config under `dev_dot.meta.title`.

```ts
export async function getStaticProps() {
	return {
		props: {
			metadata: {
				title: 'My Page', // Will be joined with the root site title
				description: 'This is a cool page',
			},
		},
	}
}
```

Social card images / OpenGraph images live in [`/public/og-image/`](./public/og-image/). Each product should have a `{product}.jpg` file in that folder for its generic card image.

## Performance

### Next Bundle Analysis

We use the [Next.js Bundle Analysis GitHub Action](https://github.com/hashicorp/nextjs-bundle-analysis) to track the size of our JavaScript bundles generated by Next.js's build step. To speed up the execution of the analysis step, we also have a [custom build script](./scripts/next-build-webpack-only.ts) which prevents the execution of the static generation build step, short-circuiting the Next.js build after the webpack compilation is finished.

## Remote Content & Application context

This application pulls content from multiple different repositories (remote content) through our [Learn API](https://github.com/hashicorp/learn-api), [content API](https://github.com/hashicorp/mktg-content-workflows), [integrations API](https://github.com/hashicorp/integrations-api), from the local filesystem, as well as directly from the GitHub API. In order to facilitate development and previewing of this content, the application can be run within the context of one of these source repositories. In this scenario, we want to read
content from the filesystem for that specific source. This can be distilled down into three specific contexts that need to be handled for any remote content:

- Running the application in this repository (`hashicorp/dev-portal`): all content is sourced remotely
- Running the application in a content's source repository (e.g. vault docs in `hashicorp/vault`): all content from the repository is read from the file system
- Running the application in a different source repository (e.g. waypoint docs in `hashicorp/vault`): content is sourced remotely if not from the current context

> Note: For content which is read from the GitHub API, we try to minimize loading this content from the API in source repositories to reduce reliance on GitHub PATs

If you are wiring up remote data which needs to change its loading strategy depending on the context, you can use `isDeployPreview()` from `lib/env-checks`:

```ts
import { isDeployPreview } from 'lib/env-checks'

isDeployPreview() // in any source repository?
isDeployPreview('vault') // in vault's source repository?
```

Additional documentation for internal collaborators is located in the [docs directory](./docs/README.md).

[product packer fork]: https://github.com/QubitPi/hashicorp-packer
[product terraform fork]: https://github.com/QubitPi/hashicorp-terraform
[product vault fork]: https://github.com/QubitPi/hashicorp-vault

[next.js]: https://nextjs.org/
[next.js build api]: https://nextjs.org/docs/deployment#nextjs-build-api

[vault doc]: https://qubitpi.github.io/hashicorp-vault/vault
[vault github pages deployable]: https://github.com/QubitPi/hashicorp-vault/tree/gh-pages
[vault website-build.sh]: https://github.com/QubitPi/hashicorp-vault/blob/master/website/scripts/website-build.sh
