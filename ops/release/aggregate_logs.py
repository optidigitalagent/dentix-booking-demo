"""Aggregate private Apache logs by allowlisted migration path without identifiers."""

import argparse
import collections
import gzip
import json
import re
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlsplit

LINE = re.compile(r'^\S+ \S+ \S+ \[([^]]+)\] "([A-Z]+) ([^ ]+) [^"]+" (\d{3}) \S+ "([^"]*)" "([^"]*)"')


def agent_class(agent):
    value = agent.lower()
    if 'googlebot' in value:
        return 'GOOGLEBOT'
    if 'bingbot' in value:
        return 'BINGBOT'
    if any(token in value for token in ('bot', 'crawl', 'spider')):
        return 'OTHER_BOT'
    if any(token in value for token in ('mozilla/', 'chrome/', 'safari/')):
        return 'BROWSER_CLASS'
    return 'OTHER'


def referrer_class(value):
    if value == '-':
        return 'NONE'
    host = urlsplit(value).hostname
    if host in ('dentix.ua', 'www.dentix.ua'):
        return 'DENTIX'
    if host:
        return 'EXTERNAL_HOST'
    return 'OTHER'


def parse(line):
    match = LINE.match(line)
    if not match:
        return None
    date, method, target, status, referrer, agent = match.groups()
    try:
        timestamp = datetime.strptime(date, '%d/%b/%Y:%H:%M:%S %z')
    except ValueError:
        return None
    return timestamp, method, urlsplit(target).path, status, referrer_class(referrer), agent_class(agent)


def aggregate(log_dir, paths, now=None):
    now = now or datetime.now(timezone.utc)
    end = now.date()
    buckets = {28: {}, 90: {}}
    available_days = set()
    parsed = 0
    malformed = 0
    for file in sorted(Path(log_dir).glob('access_log*')):
        opener = gzip.open if file.suffix == '.gz' else open
        with opener(file, 'rt', encoding='utf-8', errors='replace') as source:
            for line in source:
                item = parse(line)
                if not item:
                    malformed += 1
                    continue
                parsed += 1
                timestamp, method, path, status, referrer, agent = item
                if timestamp.date() >= end:
                    continue
                available_days.add(timestamp.date())
                if path not in paths:
                    continue
                for days in (28, 90):
                    if (end - timestamp.date()).days > days:
                        continue
                    record = buckets[days].setdefault(path, {'requests': 0, 'days': set(),
                        'statuses': collections.Counter(), 'methods': collections.Counter(),
                        'user_agent_classes': collections.Counter(), 'referrer_classes': collections.Counter(),
                        'last_request_utc': None})
                    record['requests'] += 1
                    record['days'].add(timestamp.date().isoformat())
                    record['statuses'][status] += 1
                    record['methods'][method] += 1
                    record['user_agent_classes'][agent] += 1
                    record['referrer_classes'][referrer] += 1
                    value = timestamp.astimezone(timezone.utc).isoformat()
                    if not record['last_request_utc'] or value > record['last_request_utc']:
                        record['last_request_utc'] = value
    out = {'site_id': 'DENTIX', 'parsed_lines': parsed, 'malformed_lines': malformed,
           'available_completed_days': len(available_days),
           'first_completed_day': min(available_days).isoformat() if available_days else None,
           'last_completed_day': max(available_days).isoformat() if available_days else None,
           'windows': {}}
    for days, rows in buckets.items():
        full = len({end.fromordinal(end.toordinal() - n) for n in range(1, days + 1)} & available_days) == days
        serialized = {}
        for path in sorted(paths):
            record = rows.get(path)
            serialized[path] = {'requests': record['requests'] if record else 0,
                'unique_days': len(record['days']) if record else 0,
                'statuses': dict(record['statuses']) if record else {},
                'methods': dict(record['methods']) if record else {},
                'user_agent_classes': dict(record['user_agent_classes']) if record else {},
                'referrer_classes': dict(record['referrer_classes']) if record else {},
                'last_request_utc': record['last_request_utc'] if record else None}
        coverage = len({end.fromordinal(end.toordinal() - n) for n in range(1, days + 1)} & available_days)
        out['windows'][str(days)] = {'complete': full,
                                     'status': 'COMPLETE' if full else 'PARTIAL_DO_NOT_REPORT_AS_FULL_WINDOW',
                                     'coverage_days': coverage,
                                     'start': (end.fromordinal(end.toordinal() - days)).isoformat(),
                                     'end_exclusive': end.isoformat(), 'rows': serialized}
    return out


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--logs', required=True, type=Path)
    parser.add_argument('--contract', required=True, type=Path)
    parser.add_argument('--output', required=True, type=Path)
    args = parser.parse_args()
    contract = json.loads(args.contract.read_text())
    paths = {row['source_path'] for row in contract['rows']
             if row['disposition'].startswith('200_STATIC_') or row['disposition'] == 'HOLD_FOR_CONFIRMATION'}
    result = aggregate(args.logs, paths)
    args.output.write_text(json.dumps(result, indent=2) + '\n')
    print(json.dumps({key: result[key] for key in ('site_id', 'parsed_lines', 'malformed_lines',
        'available_completed_days', 'first_completed_day', 'last_completed_day')}))
