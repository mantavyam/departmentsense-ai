# CONTEXT
- the system architecture is provided at 'docs/system-architecture.md'
- recently frontend layer was implemented with a mocked backend, DB & API, there are some fixes which needs to be resolved before we continue to build the fully functional backend integration with everything in realtime nothing mocked, having implementation of real features application wide.

# TASK
- First let's fix the existing frontend layer before we implement the backend, here are things requiring attention:
	- sidebar : shall always remain contracted by default, user shall be able to switch to different page by just clicking on the button, if hovered on sidebar for more than 2 seconds than it shall expand automatically and as soon as the hover focus is removed from over the sidebar it shall animate and contract automatically.
	- appbar : the top app bar which contains the sidebar expansion and contraction button and the name of page shall be kept fixed on the screen, it shall not scroll when the user scrolls in the main app shell.
	- the pages for account settings i.e. profile and preferences shall be moved from the sidebar to the top appbar in the right corner where the avatar is placed already, the dropdown menu (it currently shows an error: "A component that acts as a button expected a native <button> because the `nativeButton` prop is true. Rendering a non-<button> removes native button semantics, which can impact forms and accessibility. Use a real <button> in the `render` prop, or set `nativeButton` to `false`.") shall be fixed and used for the purpose.
	- for the logs table wherever it is being used you shall only use the provided component not any workaround or wrapped implementation, use the full functionality of the component given in 'apps/web/components/uitripled/interactive-logs-table.tsx'.
	- remove all the efferd's logo like the one in the auth page and on the dashboard pages of respective user on the top left corner, the svg besides the branding 'Departmentsense'
	- for all the search components utilised replace them to use the 'apps/web/components/uitripled/command-palette.tsx'
- Verify you already have complete context of 'docs/system-architecture.md'?
- Begin Setting up the backend layer, the visual flow of the UI layer has been verified and understood, all requirements have been confirmed.

# GUIDELINES
- Main Goal is to integrate the backend by removing the currently mocked service.

# CONSTRAINTS
- Mandatorily Gather relevant and complete context to generate a TODO list before performing a plan of action for your edits.
- Use multi step chain of thought reasoning using the mode:
	- 'Think a lot' - Comprehensive reasoning
- Do proper structured analysis, take your time freely, think step by step, Let's go. 