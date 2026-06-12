# NaLI — Image License Register (Phase 7)

_Every image used in public articles, with license and attribution. Article image
credits also render publicly in the "Kredit & lisensi gambar" block on each article
and follow the rules in `/lisensi-foto`._

## Images currently in use

All three are in `harimau-jawa-lazarus-species.mdx` (`images:` frontmatter + inline).

| File | Subject | Creator | License | Source | Article |
|---|---|---|---|---|---|
| `public/images/harimau-jawa/harimau-jawa-hoogerwerf-1938.jpg` | Wild Javan tiger, Ujung Kulon, 1938 | Andries Hoogerwerf | Public domain | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Panthera_tigris_sondaica_1938.jpg) | Harimau Jawa |
| `public/images/harimau-jawa/harimau-jawa-bond.jpg` | Captive Javan tiger, pre-1942 | Frederick William Bond | Public domain | [Wikimedia Commons](https://commons.wikimedia.org/wiki/Category:Panthera_tigris_sondaica) | Harimau Jawa |
| `public/images/harimau-jawa/sebaran-harimau-jawa.png` | Historic distribution map | Vardion | Public domain | [Wikimedia Commons](https://commons.wikimedia.org/wiki/File:Javan_tiger_distribution.png) | Harimau Jawa |

## Image schema (frontmatter `images:` array)

```yaml
images:
  - src: "/images/<topic>/<file>"     # local path actually rendered (optional)
    title: "..."
    creator: "..."                    # photographer / illustrator
    institution: "..."                # if applicable
    sourceUrl: "https://commons.wikimedia.org/wiki/File:..."
    license: "Public domain"          # PD / CC0 / CC BY / CC BY-SA / institutional open
    licenseUrl: "https://..."
    attribution: "Creator — license via source"
    alt: "..."                        # accessibility
    caption: "..."                    # shown under the image
```

Validation (`npm run check:editorial`) fails if any image credit is missing
`sourceUrl`, `license`, `attribution`, `alt`, or `caption`.

## Articles intentionally without images

Per the rule "use a map/diagram from data or leave the slot empty rather than steal
photos", these published articles ship **text-only** until a properly-licensed image
is sourced and downloaded with attribution:

- `api-biru-kawah-ijen`, `burung-maleo-sulawesi`, `mangrove-segara-anakan`,
  `batavia-kota-tua-jakarta`, `citarum-sungai-tercemar`,
  `badak-jawa-benteng-terakhir`, `tambora-1815-iklim-dunia`,
  `jakarta-tenggelam-penurunan-tanah`.

## Acceptable sources for new images (recap)

Wikimedia Commons (with visible license), public-domain museum/archive scans
(Rijksmuseum, Tropenmuseum/Wereldmuseum, KITLV), NASA Earth Observatory (where terms
allow), official government media with clear license, GBIF/iNaturalist **only** when
the license is explicit and compatible.

## How to add an image safely

1. Confirm the license on the source page (must be PD/CC0/CC BY/CC BY-SA or
   institutional-open). Screenshot/record the license statement.
2. Download to `public/images/<topic>/` (do not hotlink).
3. Add a full `images:` entry (schema above) and reference inline with `![alt](src)`.
4. Run `npm run check:editorial`. If the license can't be verified, **do not use it**.
