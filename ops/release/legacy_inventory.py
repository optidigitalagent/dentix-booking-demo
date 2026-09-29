"""Parse selected WordPress mysqldump INSERT rows without executing SQL.

Callers must keep the source SQL and returned raw values in private storage.
"""

import gzip
import re
from pathlib import Path


def _decode_escape(char):
    return {'0': '\0', 'b': '\b', 'n': '\n', 'r': '\r', 't': '\t', 'Z': '\x1a'}.get(char, char)


def parse_values(sql):
    """Yield value arrays from a MySQL VALUES clause, including escaped strings."""
    index = 0
    length = len(sql)
    while index < length:
        if sql[index] != '(':
            index += 1
            continue
        index += 1
        row = []
        while True:
            while index < length and sql[index].isspace():
                index += 1
            if index >= length:
                raise ValueError('truncated INSERT')
            if sql[index] == "'":
                index += 1
                value = []
                while index < length:
                    char = sql[index]
                    index += 1
                    if char == "'":
                        break
                    if char == '\\':
                        if index >= length:
                            raise ValueError('truncated escape')
                        value.append(_decode_escape(sql[index]))
                        index += 1
                    else:
                        value.append(char)
                else:
                    raise ValueError('unterminated string')
                row.append(''.join(value))
            else:
                start = index
                while index < length and sql[index] not in ',)':
                    index += 1
                value = sql[start:index].strip()
                row.append(None if value == 'NULL' else value)
            while index < length and sql[index].isspace():
                index += 1
            if index >= length:
                raise ValueError('truncated row')
            delimiter = sql[index]
            index += 1
            if delimiter == ')':
                yield row
                break
            if delimiter != ',':
                raise ValueError('invalid row delimiter')


def selected_tables(path: Path, tables: set[str]):
    """Yield (table, row) for named tables in a gzipped mysqldump."""
    pattern = re.compile(r'^INSERT INTO `([^`]+)` VALUES\s*(.*);$', re.S)
    with gzip.open(path, 'rt', encoding='utf-8', errors='replace') as source:
        statement = []
        for line in source:
            if line.startswith('INSERT INTO `'):
                statement = [line]
            elif statement:
                statement.append(line)
            if statement and line.rstrip().endswith(';'):
                match = pattern.match(''.join(statement).rstrip())
                if match and match.group(1) in tables:
                    for row in parse_values(match.group(2)):
                        yield match.group(1), row
                statement = []
