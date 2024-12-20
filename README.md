# cms

**NOTICE:** This project is a work in progress. Track its development through `canary` branch commits.

## Purpose

To create an interface for content curation and elegant front-end GUI for users to explore that content.

Instead of my normal development environment, I decided to push myself to the limit.

Just me, an old laptop, and VSCode. I decided to rely as little on NPM packages as possible, building subsystems from scratch to provide a lightweight, dependable, dependency-less CMS system that boasts competitive features, all for free, forever.

## Core Object Types

-   Menu &mdash; Functions like a Joomla menu. The site should have a main menu and a default landing page. Menus can be considered internal, portioned off "mini-sites."
-   Menu Item &mdash; A "place" on the site, generally a page. Can display an article, module, or some other predefined (user-customizable) content type, such as a blog layout. Menu Items can be found in a menu structure, or standalone.
-   Article &mdash; A large piece of content, generally viewed within the context of a page or blog list, can be searched through, and can be unassociated with any page.
-   Module &mdash; A piece of content found within a page. Can be in the body of an article, or at a **position** on the page. Various types of core/extended modules can be defined, and the user has input over them. A "custom" module or "article-like" module should exist that functions like an article for open-ended input.
-   Plugin &mdash; A plugin will extend the features of the site in some way. They can introduce new modules, menu item types, or overall features. They should be universally installable, and able to access and manipulate the API of the site with permission.
-   Template &mdash; Templates determine how the content of each page should display, what the site's page positions should be, etc. Should follow a rigid structure.
-   User &mdash; A user on the site. Can be a front-end or back-end user.
-   Category
-   Tag

## Features

The designations front-end, and back-end, refer not to application architecture in this context, but to target audience. The back-end is for administrators to manage content, and the front-end is for users to view that content.

-   Psuedo-form submit on editor save, such as in global configuration, that way form can ensure each value is inputted correctly. All dropdowns, menus, etc, will need to be contained in the form, and have all the content in the dom at all times.
-   Deliver regular HTML/CSS/JS for client, deliver Next.js for administrator. (maybe)
-   SCSS/JS/HTML/SVG support.
-   Fix article refresh editor. Basically if you refresh the article editor after saving a brand new article, since the url doesnt include the ID, refreshing does not open to that article.
-   Include Lucide license in administrative portal.
-   .env timezone support, allow for overwrite by global configuration.
-   Allow backend reboot triggering. Include necessary warning messages about handling the site not loading during reboot or an issue stopping it.
-   Replace select dropdown with a headless popup for consistency across browsers.
-   Articles built in markdown, html, maybe modes for the editor.
-   Customizable admin dashboard.
-   Git-like versioning on articles?
-   Article version history.
-   Article editor exit without saving alert.
-   Article listing toggle featured/status by tapping corresponding listing button.
-   Fix dnd-kit resizing elements when hovering over larger elements.
-   Site offline feature support.
-   https/ssl support. Plus global config for forcing it.
-   Add save options to article/tag/category and any other editors that don't have them.
-   Save before exiting protection. Use SHA256 hashing of before/after.
-   Fields
-   A **GOOD** code editor.
-   Per-component permissions so that specific users/groups can be prevented from editing a specific article without blocking all groups or all users in a group from editing it.
-   Global theme and style control over every aspect of the site for one uniform design, article/module level style overrides.
-   Similar to global styles, user-controllable global defaults for how links, video players, menus, etc operate.
-   Automatic search archival.
-   Analytics and Accessibility integration.
-   Drag/Drop article editor, a cross between wordpress and SP Page Builder?
-   CMS-level update system as well as Plugin update system. CMS level update system may have to update database models automatically.
-   User creatable/exportable/uploadable templates.
-   Global template and templates for specific menu items.
-   User management as well as role and permission definitions.
-   Plugin installer.
-   Outward facing API.
-   Mass file upload, such as artiCles, to batch through and quickly transfer content from one CMS instance to another.
-   Site migration/transfer utilities, both between CMS versions, and between sites in general.
-   GridFS storage of articles with large amounts of content.
-   Front-end icon pack support? (should be template level)
-   Global Configuration, can be used to define password validation regex, and user experience on the back-end/front-end.
-   Favicon/Metadata control. Perhaps at template level.
-   Modules/Plugins
    -   User feedback module.
    -   Form module.
        -   Data should be trackable, and form should have some sort of event that occurs when it is filled out. Perhaps a JavaScript method will fire?
    -   Map module.
    -   Glossary module.
    -   Directory module.
    -   Captcha module.
    -   App event logging (probably build as an internal tool)
    -   Create notices about not storing confidential data within CMS.
    -   Create notices about not pasting JavaScript from the web.
    -   Can plugins add custom data to your database?
-   Tag hierarchy is inclusive, category hierarchy can be inclusive or exclusive depending on context. Ie, displaying articles with a tag, will also display articles with tag decendants of that tag. While with categories, sub-categories are displayed conditionally based on configuration.
-   (J) extension (plugin) equivalents:
    -   Contacts/Directory
    -   JSitemap PRO
    -   DOCman
    -   Events Booking
    -   JFilters
    -   JLex Helpful
    -   My Maps Location
    -   News Feed (blog?)
    -   PWT ACL
    -   SEO Glossary
    -   Smart Search (built-in?)
-   Editor unsaved changes before exit warning.
-   Finish adding filtration options for roles, users, articles, etc.
-   Add user/content custom fields.
-   NO side menu on editor pages.
-   Filter Options some are just dropdowns, some allow for "search" input, some allow for multiple selections and display them as little widgets in the text box.
-   Direct robots.txt access and control.
-   Stamp data with cms version to indicate when outdated.
-   Update menu/(potential autoupdate system) that tells you when version is outdated.
-   Add:
    versionsHref: "",
    previewHref: "",
    accessiblityCheckHref: "",
    helpHref: "",
-   ^ to each `<Editor/>`.

## Development Process

### indev (indev-x versions)

Goals:

-   Model other popular CMS platforms in modern languages/frameworks/tools.

Deadline: na

### infdev (infdev-x versions)

Goals:

-   Testing, streamlining, and reconfiguring codebase.

Deadline: na

### alpha (0.0.x versions)

Goals:

-   Implement unique, original features, design, and software to make this CMS stand out.

Deadline: na

### beta (0.x.x versions)

Goals:

-   Deployment testing, bug fixing, and fine tuning.

Deadline: na

### LTS/Production (>1.x.x versions)

Goals:

-   Maintain dependencies, make improvements, add suggested features over time.

Deadline: na
