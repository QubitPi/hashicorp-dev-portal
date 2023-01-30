HashiCorp Product Documentations Builder
========================================

This repo hosts the build logic for the following HashiCorp product documentation **forks**:

- [Packer][product Packer fork]
- [Terraform][product Terraform fork]
- [Vault][product Vault fork]

The repo does NOT host documentation contents; instead it **centralizes documentation build** using [Next.js][Next.js] 
framework. Each product documentation builds by cloning this [repo][] to their local as the builder and then invoking

```bash
PRODUCT_DOC_BASE_PATH=/hashicorp-vault npm run build:deploy-preview
```

at the end of their corresponding [website-build.sh (Vault example)][vault website-build.sh]

> The command above takes [Vault][product Vault fork] as an example. **It is important to make sure the base path starts 
> with `/`, otherwise build errors**
> 
> Note that the `build:deploy-preview` is a builder script that gets invoked in product repo. The invocation chain is 
> (taking [Vault][product Vault fork] as an example):
> 
>
> Vault (`npm run build`) -> Vault (execute `website-build.sh`) -> Builder (this repo: `npm run build:deploy-preview`)

Builder Usage Example (using [Vault][product Vault fork])
---------------------------------------------------------

Clone the [Vault][product Vault fork] and build:

```bash
git clone git@github.com:QubitPi/hashicorp-vault.git
cd hashicorp-vault/website
npm run build
```

The last command [generates the static site under `./website-preview/.next` directory][nextjs Build API]. Then make a 
dedicated directory for Vault documentation, let's say `hashicorp-vault-docs`. Obtain a complete GitHub Pages deployable
in the following steps:

1. everything under `hashicorp-vault/website/website-preview/.next/server/pages`:

   ```bash
   mv hashicorp-vault/website/website-preview/.next/server/pages/* hashicorp-vault-docs
   ```

2. everything under `.next/static/` as `_next/static` under `hashicorp-vault-docs`:

   ```bash
   mkdir hashicorp-vault-docs/_next
   mv hashicorp-vault/website/website-preview/.next/static hashicorp-vault-docs/_next/static
   ```

3. (HashiCorp specific) every thing inside `hashicorp-vault/website/website-preview/.next/server/pages` directory as an
   immutable copy sitting under `hashicorp-vault-docs/_next/data`. Next.js makes each build an immutable deployable by
   prefixing static resource path with a random string. This random string can be seen under
   `hashicorp-vault/website/website-preview/.next/static`:

   ```bash
   $ ls static/
   _3Jxeg2Dn24g3DTR-U	css			media
   chunks			images
   ```

   In this case, the random string is `_3Jxeg2Dn24g3DTR-U`.

   ```bash
   mkdir -p hashicorp-vault-docs/_next/data/_3Jxeg2Dn24g3DTR-U
   cp -r hashicorp-vault/website/website-preview/.next/server/pages/* hashicorp-vault-docs/_next/data/_3Jxeg2Dn24g3DTR-U
   ```

4. Put an empty `.nojekyll` under `hashicorp-vault-docs` to prevent Jekyll interruption during the build

[product Packer fork]: https://github.com/QubitPi/hashicorp-packer
[product Terraform fork]: https://github.com/QubitPi/hashicorp-terraform
[product Vault fork]: https://github.com/QubitPi/hashicorp-vault

[Next.js]: https://nextjs.org/

[Vault Doc]: https://qubitpi.github.io/hashicorp-vault/vault
[vault website-build.sh]: https://github.com/QubitPi/hashicorp-vault/blob/master/website/scripts/website-build.sh

---

# HashiCorp Developer - developer.hashicorp.com

Welcome to HashiCorp Developer! This is the home for HashiCorp product reference documentation, along with all other kinds of content for our practitioners.

## Contributing to the project

Additional documentation for internal collaborators is located in the [docs directory](./docs/README.md).
