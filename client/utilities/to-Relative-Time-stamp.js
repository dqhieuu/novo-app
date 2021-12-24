import TimeAgo from 'react-timeago';
import buildFormatter from 'react-timeago/lib/formatters/buildFormatter';

export default function RelativeTimestamp({ children }) {
  const formatter = buildFormatter({
    prefixAgo: null,
    prefixFromNow: null,
    suffixAgo: null,
    suffixFromNow: null,
    second: 'Vừa xong',
    seconds: 'Vừa xong',
    minute: '1 phút trước',
    minutes: '%d phút trước',
    hour: '1 giờ trước',
    hours: '%d giờ trước',
    day: '1 ngày trước',
    days: '%d ngày trước',
    week: '1 tuần trước',
    weeks: '%d tuần trước',
    month: '1 tháng trước',
    months: '%d tháng trước',
    year: '1 năm trước',
    years: '%d năm trước',
  });
  return (
    <TimeAgo date={children / 1000} formatter={formatter} />
  );
}
