# ITANIMULLI INC. Website Plan

## Overview
Build a responsive six-page nonprofit website that precisely mirrors the supplied letterhead: deep black document surfaces, inset double mint frames, the circular “I” seal at top-right, organization and placeholder email at top-left, wide-tracked italic copy, asterisk bullets, and centered document footers. Preserve the supplied organization language with only light spelling and grammar cleanup.

## Pages
- **Home:** Letterhead-style opening with the logo, exact mission language, evolving-corporation identity, core philosophy, leadership attribution, and blog placeholder link.
- **About:** Full supplied mission, equality statement, private-but-public identity, and “new puzzle piece” philosophy.
- **The Three Levels:** A formal vertical progression that follows the source letter: Level One introduction and asterisk list, Level Two introduction and branch list, then Level Three Community Outreach language. Avoid generic feature-card treatment.
- **Donations:** Philanthropy statement, donation and involvement explanation, certificate details, and a clearly marked placeholder donate action.
- **Membership / Join:** Accessible interest form with name, email, phone, community, areas of interest, and message fields. Submission remains presentation-only until a destination is provided.
- **Contact:** Accessible contact form plus explicit placeholders for address, phone, email, and blog URL.

## Shared Experience
- Add a consistent letterhead header, responsive mobile navigation, centered page indicator/footer, and active-page styling.
- Frame every page with an inset double mint border that remains usable on small screens.
- Use semantic page structure, one H1 per page, keyboard-visible focus states, restrained transitions, and accessible mint-on-black contrast.
- Keep all unknown contact details and external links unmistakably labeled as placeholders.

## Technical Details
- Define the full visual system in `src/styles.css` with semantic OKLCH tokens, including the specified #0A0A0A and #B8E6C1 equivalents.
- Build reusable logo, document frame, letterhead header/footer, navigation, section heading, asterisk list, and form-field components.
- Use separate TanStack routes for `/`, `/about`, `/levels`, `/donations`, `/join`, and `/contact`.
- Add unique SEO title, description, Open Graph metadata, Twitter card, and self-referencing canonical metadata to every page.
- Keep forms client-side and non-persistent; no backend or invented contact information.
- Verify desktop and mobile layouts, navigation, form controls, runtime behavior, and the final preview build.
