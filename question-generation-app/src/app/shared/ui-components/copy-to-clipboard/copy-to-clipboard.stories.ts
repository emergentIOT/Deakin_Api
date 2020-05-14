import { CopyToClipboardComponent } from './copy-to-clipboard.component';

export default {
  title: 'Shared UI/Copy to Clipboard'
};

export const standard = () => ({
  component: CopyToClipboardComponent,
  props: {
    itemToCopy: '9999999998',
    iconClass: 'fal fa-copy'
  }
});
