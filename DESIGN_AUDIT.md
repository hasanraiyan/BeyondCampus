# BeyondCampus Design Audit & Planning

## Phase 1 & 2: Route Analysis and Design Planning

### Global Design Theme: Clean & Minimal (Shadcn-like)
- **Theme**: Light mode default (with dark mode support). High contrast text on clean white/light-gray backgrounds. Subtle borders (1px solid neutral).
- **Typography**: Inter / system-ui for a crisp, functional look.
- **Interactions**: Fast, subtle state changes (hover:bg-muted). Functional animations (slide-in dialogs, accordion expands).
- **Components Framework**: Tailwind CSS + Lucide Icons. Focus on standard web components: Cards, Tabs, Accordions, Dialogs, Dropdowns.

---

### Authentication
#### 1. `/auth/signin`
- **Current State**: Basic email/password or OAuth login form.
- **Design Theme**: Centered, minimalist card on a very light gray background.
- **WOW Components**: Crisp input fields with clear focus rings (ring-2 ring-primary), subtle drop shadow on the main card, simple and clean OAuth buttons with standard logos.

#### 2. `/auth/signup`
- **Current State**: Registration form.
- **Design Theme**: Multi-step wizard inside a clean card.
- **WOW Components**: Progress indicator (steps), distinct primary action buttons, clear validation error text below inputs.

---

### Onboarding
#### 3. `/onboarding/welcome`
- **Current State**: Welcome message and basic user info collection.
- **Design Theme**: Hero-style greeting. Large typography, plenty of whitespace.
- **WOW Components**: Large primary button ("Get Started"), clean typography hierarchy (H1 -> p).

#### 4. `/onboarding/capabilities`
- **Current State**: Feature introduction.
- **Design Theme**: Grid of clean feature cards.
- **WOW Components**: Cards with a subtle hover effect (lift or border color change), simple icons, concise text.

#### 5. `/onboarding/chat`
- **Current State**: Initial chat setup or AI persona configuration.
- **Design Theme**: Split pane or focused chat view.
- **WOW Components**: Clean message bubbles (gray for AI, primary color for user), distinct input area fixed at the bottom.

#### 6. `/onboarding/preparing`
- **Current State**: Loading screen while twin/profile is generated.
- **Design Theme**: Centered indeterminate progress.
- **WOW Components**: Simple spinner or skeleton loaders indicating background work.

---

### Student Portal (Main App)
#### 7. `/` (Dashboard)
- **Current State**: Overview of user activity, chat interface.
- **Design Theme**: Dashboard layout with sidebar navigation and a main content area.
- **WOW Components**: Summary cards (Stats) at the top, a clean data table or list for recent activity, distinct header with user profile dropdown.

#### 8. `/explore`
- **Current State**: Hub for discovering universities and programs.
- **Design Theme**: Search and filter heavy interface.
- **WOW Components**: Prominent search bar, sidebar for faceted filtering (checkboxes, select dropdowns), grid of clean cards for results.

#### 9. `/explore/chapters`
- **Current State**: List of learning or program chapters.
- **Design Theme**: Vertical list or stepper.
- **WOW Components**: Accordion items for chapters, progress bars indicating completion status.

#### 10. `/explore/create`
- **Current State**: Form to create new exploration goals/twins.
- **Design Theme**: Standard form layout.
- **WOW Components**: Clear input labels, helper text, distinct "Save" and "Cancel" buttons.

#### 11. `/explore/my-twin`
- **Current State**: AI Twin management and overview.
- **Design Theme**: Profile/Settings page layout.
- **WOW Components**: Tabs for different settings categories, toggle switches for preferences.

#### 12. `/explore/playground`
- **Current State**: Interactive area to test AI capabilities.
- **Design Theme**: Split screen (Input/Output).
- **WOW Components**: Clean textarea for input, read-only markdown rendered output area.

#### 13. `/explore/train`
- **Current State**: Interface to feed data to the AI twin.
- **Design Theme**: Upload/Data management.
- **WOW Components**: Drag and drop file upload zone with a dashed border, list of uploaded files with delete icons.

#### 14. `/explore/twin-created`
- **Current State**: Success state after twin creation.
- **Design Theme**: Empty state/Success screen.
- **WOW Components**: Large checkmark icon, success message, primary button to continue.

#### 15. `/applications`
- **Current State**: List of university applications and statuses.
- **Design Theme**: Data table or list view.
- **WOW Components**: Badges for status (e.g., green for accepted, yellow for pending), simple action menus (three dots) per row.

#### 16. `/documents`
- **Current State**: Document management and upload.
- **Design Theme**: File manager layout.
- **WOW Components**: List or grid toggle, standard folder/file icons, clean upload button.

#### 17. `/person/[id]`
- **Current State**: Public or detailed view of a person/twin.
- **Design Theme**: Profile header + content tabs.
- **WOW Components**: Round avatar, clear name and bio, tabbed navigation for different profile sections.

#### 18. `/person-profile/[id]`
- **Current State**: Editable profile view.
- **Design Theme**: Form split into sections.
- **WOW Components**: Clear section headers, standard form controls, sticky save bar at the bottom.

#### 19. `/profile`
- **Current State**: Current user's profile settings.
- **Design Theme**: Vertical settings navigation.
- **WOW Components**: Left sidebar for settings categories, right pane for forms.

#### 20. `/roadmap`
- **Current State**: User's timeline or educational roadmap.
- **Design Theme**: Vertical timeline.
- **WOW Components**: Simple connected dots and lines, clear date labels, card-based content for each milestone.

#### 21. `/universities`
- **Current State**: Directory of all universities.
- **Design Theme**: Directory listing.
- **WOW Components**: Alpha-index navigation, list items with university logos and brief descriptions.

#### 22. `/university/[slug]`
- **Current State**: Detailed view of a specific university.
- **Design Theme**: Detail page with hero image.
- **WOW Components**: Clean hero banner, sticky sub-navigation, distinct content blocks (About, Programs, Admissions).

#### 23. `/workspace`
- **Current State**: Productivity area or central hub.
- **Design Theme**: Modular dashboard.
- **WOW Components**: Draggable or customizable cards, clean minimal headers.

#### 24. `/workspace/tasks`
- **Current State**: Task management list.
- **Design Theme**: To-do list or simple Kanban.
- **WOW Components**: Checkboxes for tasks, clear "Add Task" inline input.

#### 25. `/[twinSlug]`
- **Current State**: Public facing twin page.
- **Design Theme**: Clean landing page.
- **WOW Components**: Centered chat interface, simple header with the twin's name.

---

### Admin Portal
#### 26. `/admin`
- **Current State**: Admin dashboard overview.
- **Design Theme**: Complex data dashboard.
- **WOW Components**: Summary stat cards, clean line/bar charts, dense data tables for recent actions.

#### 27. `/admin/setup`
- **Current State**: Initial admin configuration.
- **Design Theme**: Stepper/Wizard.
- **WOW Components**: Clear step indicators, large form areas.

#### 28. `/admin/universities`
- **Current State**: Manage universities list.
- **Design Theme**: Data table.
- **WOW Components**: Advanced data table with sorting, filtering, and pagination controls.

#### 29. `/admin/universities/create`
- **Current State**: Form to add a new university.
- **Design Theme**: Long form layout.
- **WOW Components**: Sticky header with "Save" button, sectioned form areas.

#### 30. `/admin/universities/[slug]/edit`
- **Current State**: Edit university details.
- **Design Theme**: Settings page layout.
- **WOW Components**: Tabs for different editing sections (General, Images, Contact).

#### 31. `/admin/universities/[slug]/knowledge`
- **Current State**: Manage Qdrant vector database knowledge for a university.
- **Design Theme**: Data management interface.
- **WOW Components**: Upload zones, lists of indexed documents with status badges.

#### 32. `/admin/universities/[slug]/programs`
- **Current State**: Manage university programs.
- **Design Theme**: List management.
- **WOW Components**: Add new item button, list of programs with edit/delete actions.

---

### Miscellaneous
#### 33. `/portfolio`
- **Current State**: User's portfolio or showcase.
- **Design Theme**: Clean gallery.
- **WOW Components**: Grid of projects/items, simple lightbox or modal for details.

#### 34. `/users/[userId]/train`
- **Current State**: Training interface for specific user's AI.
- **Design Theme**: Technical interface.
- **WOW Components**: Split pane for data input and logs, mono-spaced font for code/data snippets.
