<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Дневники родителей</title>
    <style>
        @page {
            margin: 20mm 12mm 20mm 12mm;
        }
        * {
            box-sizing: border-box;
        }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }
        .header {
            margin-bottom: 14px;
        }
        .header__title {
            font-size: 16px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 4px 0;
        }
        .header__subtitle {
            font-size: 10px;
            color: #6b7280;
            margin: 0;
        }
        .summary {
            margin-bottom: 14px;
            padding: 10px;
            background-color: #f3f4f6;
            border-radius: 6px;
        }
        .summary__title {
            font-size: 10px;
            font-weight: bold;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin-bottom: 6px;
        }
        .summary__grid {
            display: table;
            width: 100%;
            border-collapse: separate;
            border-spacing: 4px 0;
        }
        .summary__item {
            display: table-cell;
            width: 20%;
            padding: 6px;
            background-color: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 4px;
            text-align: center;
        }
        .summary__label {
            font-size: 8px;
            color: #6b7280;
            font-weight: bold;
            text-transform: uppercase;
        }
        .summary__value {
            font-size: 14px;
            font-weight: bold;
            color: #1f2937;
            margin-top: 2px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            table-layout: fixed;
        }
        thead {
            display: table-header-group;
        }
        th {
            background-color: #f3f4f6;
            color: #374151;
            font-size: 9px;
            font-weight: bold;
            text-align: left;
            padding: 6px;
            border: 1px solid #d1d5db;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        td {
            padding: 5px 6px;
            border: 1px solid #e5e7eb;
            font-size: 9px;
            vertical-align: top;
            word-wrap: break-word;
            overflow-wrap: break-word;
        }
        tbody tr:nth-child(even) {
            background-color: #fafafa;
        }
        .event-badge {
            display: inline-block;
            padding: 2px 6px;
            background-color: #e0e7ff;
            color: #3730a3;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            white-space: nowrap;
        }
        .empty {
            padding: 10px;
            font-size: 10px;
            color: #6b7280;
            font-style: italic;
        }
        .footer {
            position: fixed;
            bottom: -12mm;
            left: 0;
            right: 0;
            font-size: 8px;
            color: #9ca3af;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="header__title">Дневники родителей</div>
        <div class="header__subtitle">Сформировано: {{ $generatedAt }}</div>
    </div>

    <div class="summary">
        <div class="summary__title">Сводка по событиям</div>
        <div class="summary__grid">
            @foreach ($summary as $item)
                <div class="summary__item">
                    <div class="summary__label">{{ $item['label'] }}</div>
                    <div class="summary__value">{{ $item['count'] }}</div>
                </div>
            @endforeach
        </div>
    </div>

    @if ($rows->isEmpty())
        <div class="empty">Нет записей за выбранный период.</div>
    @else
        <table>
            <thead>
                <tr>
                    <th style="width: 18%;">Ребёнок</th>
                    <th style="width: 18%;">Родитель</th>
                    <th style="width: 15%;">Событие</th>
                    <th style="width: 33%;">Запись</th>
                    <th style="width: 16%;">Дата</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($rows as $row)
                    <tr>
                        <td>{{ $row['child_name'] }}</td>
                        <td>{{ $row['parent_name'] }}</td>
                        <td><span class="event-badge">{{ $row['event_label'] }}</span></td>
                        <td>{{ $row['text'] }}</td>
                        <td>{{ $row['date'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        svo-i-deti — выгрузка дневников родителей — {{ $generatedAt }}
    </div>
</body>
</html>