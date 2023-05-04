# HashiCorp Product Documentations Builder

This repo hosts the build logic for the following HashiCorp product documentation **forks**:

- [Packer][product packer fork]
- [Terraform][product terraform fork]
- [Vault][product vault fork]

The repo does NOT host documentation contents; instead it **centralizes documentation build** using [Next.js][next.js]
framework. Each product documentation builds by cloning this [repo][] to their local as the builder and then invoking

```bash
PRODUCT_DOC_BASE_PATH=/hashicorp-vault npm run build:deploy-preview
```

at the end of their corresponding [website-build.sh (Vault example)][vault website-build.sh]

> The command above takes [Vault][product vault fork] as an example. **It is important to make sure the base path
> starts with `/`**, otherwise build ends up with errors
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
   into a directory named by a random string ID and put this directory under `hashicorp-vault-docs/_next/data`. Next.js
   makes each build an immutable deployable by prefixing static resource path with a random string. This random string
   can be seen under `hashicorp-vault/website/website-preview/.next/static`:

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

---

# HashiCorp Developer - developer.hashicorp.com

Welcome to HashiCorp Developer! This is the home for HashiCorp product reference documentation, along with all other kinds of content for our practitioners.

## Contributing to the project

Additional documentation for internal collaborators is located in the [docs directory](./docs/README.md).

[product packer fork]: https://github.com/QubitPi/hashicorp-packer
[product terraform fork]: https://github.com/QubitPi/hashicorp-terraform
[product vault fork]: https://github.com/QubitPi/hashicorp-vault
[next.js]: https://nextjs.org/
[next.js build api]: https://nextjs.org/docs/deployment#nextjs-build-api
[vault doc]: https://qubitpi.github.io/hashicorp-vault/vault
[vault github pages deployable]: https://github.com/QubitPi/hashicorp-vault/tree/gh-pages
[vault website-build.sh]: https://github.com/QubitPi/hashicorp-vault/blob/master/website/scripts/website-build.sh
