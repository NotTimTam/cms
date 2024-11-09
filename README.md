# cms

**NOTICE:** This project is a work in progress. Track its development through `canary` branch commits.

## Purpose

To create an interface for content curation and elegant front-end GUI for users to explore that content.

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

-   Deliver regular HTML/CSS/JS for client, deliver Next.js for administrator.
-   SCSS/JS/HTML/SVG support.
-   Custom internal back-end 404s, and clientside 404s.
-   Fix article refresh editor. Basically if you refresh the article editor after saving a brand new article, since the url doesnt include the ID, refreshing does not open to that article.
-   Include Lucide license in administrative portal.
-   Articles built in markdown, html, maybe modes for the editor.
-   Headless popups.
-   Customizable admin dashboard.
-   Git-like versioning on articles?
-   Article version history.
-   Article editor exit without saving alert.
-   Article listing toggle featured/status by tapping corresponding listing button.
-   Fields
-   A **GOOD** code editor.
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
-   Front-end icon pack support?
-   Global Configuration, can be used to define password validation regex, and user experience on the back-end/front-end.
-   Favicon/Metadata control. Perhaps at template level.
-   Bcrypt Salt Length in env.
-   Modules/Plugins
    -   User feedback module.
    -   Form module.
        -   Data should be trackable, and form should have some sort of event that occurs when it is filled out. Perhaps a JavaScript method will fire?
    -   Map module.
    -   Glossary module.
    -   Directory module.
    -   Captcha module.
    -   App event logging (probably build as an internal tool)
    -   Stop robots from mapping administrator routes.
    -   Create notices about not storing confidential data within CMS.
    -   Create notices about not pasting JavaScript from the web.
    -   Can plugins add custom data to your database?
-   Store admin menu toggle state (and potentially dropdowns) in SessionStorage.
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
-   Users are assigned to groups, users can be assigned to multiple groups. Groups can be nested.
-   Access levels can be created, and certain groups can be given that access level.
-   The access level is used to choose who can see what. Access levels should be simple, one user group can have several access levels.
-   Article access for example, is set by selecting what user group can access the article.
-   No default access level, if no user group is defined for a resource, it is accessible by everyone. Editing of/viewing of a resource should be set separately.
