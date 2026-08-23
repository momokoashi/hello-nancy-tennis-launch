# Hello Nancy — Tennis Launch Homepage (mockup)

Static prototype of a tennis-launch version of the Hello Nancy homepage,
built for the Grand Slam campaign (ACE + SMASH).

**Live preview:** https://momokoashi.github.io/hello-nancy-tennis-launch/

## What this is

A design mockup, not a store. Cart and checkout do nothing. It exists so the
team can review the launch homepage layout before any of it touches Shopify.
The page carries `noindex,nofollow` so it can't be found in search or mistaken
for the real shop.

## What's on the page

- **Announcement bar** — rotates two messages (Grand Slam Sale / Tennis Collection drop)
- **Hero** — 5-slide slideshow, real campaign photography, replacing the old video
- **Split CTA** — Shop Bestsellers (pink) + Shop Tennis Collection (court green)
- **Best sellers** — unchanged from the live site (Lem, Tutti Frutti, Avo, Berri)
- **Tennis Collection** — new band: SMASH then ACE, "duo" layout
- Everything below is the original homepage, untouched

## Notes

- Product photography and pricing are pulled from the live ACE and SMASH PDPs
  (SMASH $129/$229, ACE $99/$199).
- Videos are stripped from this build — the working mirror is ~528MB, mostly
  video, including one 120MB file over GitHub's 100MB limit. Videos with poster
  frames fall back to their poster; the rest are hidden.
- Images are re-encoded (max 1600px) to keep the repo at ~42MB.

Generated from the working mirror in `Agent Skills/tennis-site/` via
`_build_deploy.py`.
