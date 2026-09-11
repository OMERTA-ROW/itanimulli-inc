# ITANIMULLI INC. Website Plan

## Overview
Build a responsive six-page nonprofit website that closely follows the existing letterhead identity: near-black surfaces, soft mint typography and borders, a circular “I” mark, wide-spaced headings, and an elegant institutional tone.

## Pages
- **Home:** Prominent logo and organization name, mission summary, evolving-corporation tagline, core philosophy, short overview of the three levels, and blog placeholder link.
- **About:** Full mission, equality and community focus, and the “new puzzle piece” philosophy.
- **The Three Levels:** Foundation funding sources, five individual branch cards with clearly marked description space, and Community Outreach details.
- **Donations:** Philanthropy statement, donation and involvement explanation, certificate details, and a clearly marked placeholder donate action.
- **Membership / Join:** Accessible interest form with name, email, phone, community, areas of interest, and message fields. Submission remains presentation-only until a destination is provided.
- **Contact:** Accessible contact form plus explicit placeholders for address, phone, email, and blog URL.

## Shared Experience
- Add a consistent header, responsive mobile navigation, footer, and active-page styling.
- Frame every page with an inset double mint border that remains usable on small screens.
- Use semantic page structure, one H1 per page, keyboard-visible focus states, restrained transitions, and accessible mint-on-black contrast.
- Keep all unknown contact details and external links unmistakably labeled as placeholders.

## Technical Details
- Define the full visual system in `src/styles.css` with semantic OKLCH tokens, including the specified #0A0A0A and #B8E6C1 equivalents.
- Build reusable logo, document frame, navigation, section heading, and form-field components.
- Use separate TanStack routes for `/`, `/about`, `/levels`, `/donations`, `/join`, and `/contact`.
- Add unique SEO title, description, Open Graph metadata, Twitter card, and self-referencing canonical metadata to every page.
- Keep forms client-side and non-persistent; no backend or invented contact information.
- Verify desktop and mobile layouts, navigation, form controls, runtime behavior, and the final preview build.
