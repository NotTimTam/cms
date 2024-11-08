# cms

**NOTICE:** This project is a work in progress. Track its development through `canary` branch commits.

## Purpose

To create an interface for content curation and elegant front-end GUI for users to explore that content.

## Core Object Types

-   Menu &mdash; Functions like a Joomla menu. The site should have a main menu and a default landing page. Menus can be considered internal, portioned off "mini-sites."
-   Menu Item &mdash; A "place" on the site, generally a page. Can display an article, module, or some other predefined (user-customizable) content type, such as a blog layout. Menu Items can be found in a menu structure, or standalone.
-   Article &mdash; A large piece of content, generally viewed within the context of a page or blog list, can be searched through, and can be unassociated with any page.
-   Module &mdash; A piece of content found within a page. Can be in the body of an article, or at a **position** on the page. Various types of core/extended modules can be defined, and the user has input over them. A "custom" module or "article-like" module should exist that functions like an article for open-ended input.
-   Extension &mdash; An extension will extend the features of the site in some way. They can introduce new modules, menu item types, or overall features. They should be universally installable, and able to access and manipulate the API of the site with permission.
-   Template &mdash; Templates determine how the content of each page should display, what the site's page positions should be, etc. Should follow a rigid structure.
-   User &mdash; A user on the site. Can be a front-end or back-end user.

## Features

The designations front-end, and back-end, refer not to application architecture in this context, but to target audience. The back-end is for administrators to manage content, and the front-end is for users to view that content.

-   Deliver regular HTML/CSS/JS for client, deliver Next.js for administrator.
-   SCSS/JS/HTML/SVG support.
-   Articles built in markdown, html, maybe modes for the editor.
-   A **GOOD** code editor.
-   Global theme and style control over every aspect of the site for one uniform design, article/module level style overrides.
-   Similar to global styles, user-controllable global defaults for how links, video players, menus, etc operate.
-   Automatic search archival.
-   Analytics and Accessibility integration.
-   Drag/Drop article editor, a cross between wordpress and SP Page Builder?
-   CMS-level update system as well as extension update system.
-   User creatable/exportable/uploadable templates.
-   Global template and templates for specific menu items.
-   User management as well as role and permission definitions.
-   Extension installer.
-   Front-end icon pack support?
-   Modules
    -   User feedback module.
    -   Form module.
        -   Data should be trackable, and form should have some sort of event that occurs when it is filled out. Perhaps a JavaScript method will fire?
    -   Map module.
    -   Glossary module.
    -   Directory module.
    -   Captcha module.
