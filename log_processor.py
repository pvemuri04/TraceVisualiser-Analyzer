import json
from flask import Flask, jsonify, request
from flask_cors import CORS
from collections import defaultdict
from datetime import datetime
import ijson

app = Flask(__name__)
CORS(app)

LOG_FILE_PATH = 'react_code/trace_visual/src/parser/parsed_log.json'
TIMESTAMP_FORMATS = [
    '%Y %b %d %H:%M:%S.%f',
    '%Y %b %d %H:%M:%S',
    '%b %d %H:%M:%S.%f',
    '%b %d %H:%M:%S',
    '%Y-%m-%d %H:%M:%S.%f',
    '%Y-%m-%d %H:%M:%S',
]

def get_severity(message):
    if not message:
        return 'INFO'
    lower_case_message = message.lower()
    if 'error' in lower_case_message or 'fail' in lower_case_message or 'exception' in lower_case_message:
        return 'ERROR'
    if 'warn' in lower_case_message or 'warning' in lower_case_message:
        return 'WARN'
    return 'INFO'

def process_log_data_for_ai_streaming():
    unmatched_calls = []
    active_calls = {}
    total_entries = 0
    total_exits = 0
    unique_classes = set()
    class_counts = defaultdict(lambda: {'entries': 0, 'exits': 0})
    function_durations = defaultdict(list)
    error_messages_by_function = defaultdict(list)
    all_durations_flat = []

    with open(LOG_FILE_PATH, 'rb') as f:
        for timestamp_str, entry in ijson.kvitems(f, ''):
            entry_severity = get_severity(entry.get('message'))
            entry['severity'] = entry_severity
            event_type = entry.get('event_type')
            class_name = entry.get('class_run')
            function_name = entry.get('function_name')
            current_year = str(datetime.now().year)
            dt_object = None
            for fmt in TIMESTAMP_FORMATS:
                try:
                    if '%Y' in fmt and not timestamp_str.strip().startswith(str(current_year)):
                        timestamp_with_year = f"{current_year} {timestamp_str}"
                        dt_object = datetime.strptime(timestamp_with_year, fmt)
                    else:
                        dt_object = datetime.strptime(timestamp_str, fmt)
                    break
                except (ValueError, TypeError):
                    continue
            if dt_object:
                time = dt_object.timestamp() * 1000
            else:
                continue

            if event_type == '>':
                total_entries += 1
                unique_classes.add(class_name)
                class_counts[class_name]['entries'] += 1
                active_calls[function_name] = {'start_time': time, 'entry_event': entry}
            elif event_type == '<':
                total_exits += 1
                class_counts[class_name]['exits'] += 1
                if function_name in active_calls:
                    start_time = active_calls[function_name]['start_time']
                    duration = time - start_time
                    function_durations[function_name].append(duration)
                    all_durations_flat.append(duration)
                    del active_calls[function_name]
                else:
                    unmatched_calls.append({'type': 'exit_without_entry', 'event': entry})
            if entry_severity == 'ERROR':
                error_messages_by_function[function_name].append(entry['message'])

    for func_name, call_info in active_calls.items():
        unmatched_calls.append({'type': 'entry_without_exit', 'event': call_info['entry_event']})

    aggregated_durations = {
        func: {'avg_duration': sum(d) / len(d), 'max_duration': max(d), 'count': len(d)}
        for func, d in function_durations.items() if d
    }

    anomalous_durations = []
    error_patterns = []
    recommendations = []

    if all_durations_flat:
        mean_duration = sum(all_durations_flat) / len(all_durations_flat)
        std_dev_duration = (sum((x - mean_duration) ** 2 for x in all_durations_flat) / len(all_durations_flat)) ** 0.5
        for func_name, data in aggregated_durations.items():
            if std_dev_duration > 0 and (data['avg_duration'] - mean_duration) / std_dev_duration > 2:
                explanation = f"Function '{func_name}' has an average duration ({data['avg_duration']:.2f}ms) significantly higher than the overall average ({mean_duration:.2f}ms), indicating a potential performance bottleneck."
                anomalous_durations.append({'function_name': func_name, 'avg_duration': data['avg_duration'], 'explanation': explanation})
                recommendations.append(f"Investigate '{func_name}' for performance optimization due to its high average execution time.")
            elif data['max_duration'] > mean_duration + 3 * std_dev_duration:
                explanation = f"Function '{func_name}' has a maximum duration ({data['max_duration']:.2f}ms) that is an outlier, suggesting sporadic performance issues."
                anomalous_durations.append({'function_name': func_name, 'max_duration': data['max_duration'], 'explanation': explanation})
                recommendations.append(f"Examine the execution context of '{func_name}' to understand the cause of its sporadic high duration.")

    for func_name, messages in error_messages_by_function.items():
        grouped_errors = defaultdict(int)
        for msg in messages:
            error_key = msg[:30]
            grouped_errors[error_key] += 1
        for key, count in grouped_errors.items():
            if count > 3:
                sample_message = next(msg for msg in messages if msg.startswith(key))
                explanation = f"Function '{func_name}' shows a recurring error pattern starting with '{key}...', which occurred {count} times."
                error_patterns.append({'function_name': func_name, 'error_count': count, 'sample_message': sample_message, 'explanation': explanation})
                recommendations.append(f"Address the recurring error in '{func_name}': '{sample_message[:50]}...'.")

    if not recommendations:
        recommendations.append("No critical issues detected. The system appears to be stable.")

    return {
        'basic_analysis': {
            'unmatched_calls': unmatched_calls,
            'stats': {
                'total_entries': total_entries,
                'total_exits': total_exits,
                'unique_classes_count': len(unique_classes),
                'class_counts': dict(class_counts),
            },
            'aggregated_durations': aggregated_durations,
        },
        'ai_insights': {
            'anomalous_durations': anomalous_durations,
            'error_patterns': error_patterns,
            'recommendations': recommendations,
        }
    }

@app.route('/api/analysis', methods=['GET'])
def get_analysis():
    try:
        analysis_results = process_log_data_for_ai_streaming()
        return jsonify(analysis_results)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/log_chunk', methods=['GET'])
def get_log_chunk():
    offset = int(request.args.get('offset', 0))
    limit = int(request.args.get('limit', 1000))
    try:
        with open(LOG_FILE_PATH, 'rb') as f:
            full_log_data = json.load(f)
        sorted_timestamps = sorted(full_log_data.keys())
        chunk_timestamps = sorted_timestamps[offset : offset + limit]
        chunk_data = {ts: full_log_data[ts] for ts in chunk_timestamps}
        return jsonify({
            'chunk': chunk_data,
            'total_entries': len(full_log_data),
            'offset': offset,
            'limit': limit,
            'has_more': (offset + limit) < len(full_log_data)
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
