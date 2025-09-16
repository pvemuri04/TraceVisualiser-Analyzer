import re
import json
import html
from datetime import datetime

def parse_log_line(line):
    pattern = r'^(\w+\s+\d+\s+\d+:\d+:\d+\.\d+)\s+([^\s]+)\[(\d+):(\d+):[^\]]*\]:\s*([\w:]+)\s*([<>&DA])\s*(.*)'
    match = re.match(pattern, line)
    if match:
        timestamp = match.group(1)
        process = match.group(2)
        pid = match.group(3)
        tid = match.group(4)
        class_run = match.group(5)
        event_type = match.group(6)
        message = html.unescape(match.group(7))  # Unescape HTML entities
        return timestamp, {
            "process": process,
            "pid": pid,
            "tid": tid,
            "class_run": class_run,
            "event_type": event_type,
            "message": message
        }
    return None, None

def main():
    log_file = 'arb_rcpd.log'
    output_file = 'parsed_log.json'
    data = []
    with open(log_file, 'r') as f:
        for line in f:
            line = line.strip()
            if not line:
                continue
            timestamp, attrs = parse_log_line(line)
            if timestamp:
                data.append((timestamp, attrs))
    # Sort by parsed datetime
    data.sort(key=lambda x: datetime.strptime(x[0], "%b %d %H:%M:%S.%f"))
    # Convert to dict for JSON output (order preserved)
    sorted_data = {timestamp: attrs for timestamp, attrs in data}
    with open(output_file, 'w') as f:
        json.dump(sorted_data, f, indent=2)
    print(f"Parsed log saved to {output_file}")
if __name__ == "__main__":
    main()
