import TimeAgo from 'react-timeago';
import vietnameseStrings from 'react-timeago/lib/language-strings/vi';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

export default function RelativeTimestamp({ children }) {
  const formatter = buildFormatter(vietnameseStrings);
  return (
    <TimeAgo date={children / 1000} formatter={formatter} />
  );
}
