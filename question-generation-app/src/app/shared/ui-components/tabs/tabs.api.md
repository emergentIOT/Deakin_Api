# Tabs API

<table>
  <tbody>
    <tr>
      <th>Module name</th>
      <td>TabsModule</td>
    </tr>
    <tr>
      <th>Selectors</th>
      <td>`app-tab-container`, `app-tab-panel`</td>
    </tr>
  </tbody>
</table>

## Tab container

### Inputs

| name | type | notes |
| ---- | ---- | ---- |
| label | `string` | used to set an aria-label |

### Outputs

none

### Methods

| name | arguments type | return type | notes |
| ---- | ---- | ---- | ---- |
| selectTab | `TabPanelComponent` | none | used by the template to change the active tab when a tab button is clicked |
| handleKeybNav | `number`, `event` | none | used by the template to enable keyboard navigation between tabs |

## Tab panel

### Inputs

| name | type | notes |
| ---- | ---- | ---- |
| title | `string` | |
| active | `boolean` | sets the initial active tab |

### Outputs

none

### Methods

| name | arguments type | return type | notes |
| ---- | ---- | ---- | ---- |
| safeTitleForAttributes | none | string | for use in the template to create an attribute safe id from the title |
