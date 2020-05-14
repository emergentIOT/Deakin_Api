# Badge Overview

A simple informational component designed to take a very short string. It has semantic meaning aligned with other semantic components in the Design System such as the 'alert panel'.

Options are 'info', 'success', 'warning' and 'danger'. 'Info' is the default.

The badge component also supports icons by passing in the appropriate classes. For example, "far fa-cog" for the Font Awesome settings icon. Note that no icon libraries are included with the component. The stylesheet for any icon library must be globally available in the application.

## Example usage

```html
<app-badge>Badge</app-badge>
<app-badge purpose="warning">A Warning</app-badge>
<app-badge icon="far fa-clock">Coming soon</app-badge>
```
