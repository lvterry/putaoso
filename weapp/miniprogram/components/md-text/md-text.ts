import { parseBold, TextSegment } from '../../utils/md';

Component({
  properties: {
    text: {
      type: String,
      value: '',
      observer(value: string) {
        this.setData({ segments: parseBold(value) });
      },
    },
  },
  data: {
    segments: [] as TextSegment[],
  },
});
