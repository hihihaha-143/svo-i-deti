<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Сводка по детям</title>
    <style>
        @page { margin: 18mm 12mm 18mm 12mm; }
        * { box-sizing: border-box; }
        body {
            font-family: 'DejaVu Sans', sans-serif;
            font-size: 10px;
            color: #1f2937;
            margin: 0;
            padding: 0;
        }
        .header { margin-bottom: 14px; }
        .header__title { font-size: 16px; font-weight: bold; margin: 0 0 4px 0; }
        .header__subtitle { font-size: 10px; color: #6b7280; margin: 0; }
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
            width: 25%;
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
        table { width: 100%; border-collapse: collapse; table-layout: fixed; }
        thead { display: table-header-group; }
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
        }
        tbody tr:nth-child(even) { background-color: #fafafa; }
        .badge {
            display: inline-block;
            padding: 2px 6px;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            white-space: nowrap;
        }
        .badge--good { background-color: #dcfce7; color: #166534; }
        .badge--normal { background-color: #e0e7ff; color: #3730a3; }
        .badge--bad { background-color: #fee2e2; color: #991b1b; }
        .badge--risk { background-color: #fef3c7; color: #92400e; }
        .footer {
            position: fixed;
            bottom: -10mm;
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
        <div class="header__title">Сводка по детям</div>
        <div class="header__subtitle">
            Период: {{ $period['from'] }} — {{ $period['to'] }} · Сформировано: {{ $generatedAt }}
        </div>
    </div>

    <div class="summary">
        <div class="summary__title">Итого</div>
        <div class="summary__grid">
            <div class="summary__item">
                <div class="summary__label">Всего детей</div>
                <div class="summary__value">{{ $summary['total_children'] }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">Активных</div>
                <div class="summary__value">{{ $summary['active_children'] }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">Прошли тесты</div>
                <div class="summary__value">{{ $summary['children_with_tests'] }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">В зоне риска</div>
                <div class="summary__value">{{ $summary['children_in_risk'] }}</div>
            </div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th style="width: 20%;">Ребёнок</th>
                <th style="width: 12%;">Логин</th>
                <th style="width: 10%;">Настроений</th>
                <th style="width: 10%;">Хорошо</th>
                <th style="width: 10%;">Нейтрально</th>
                <th style="width: 10%;">Плохо</th>
                <th style="width: 10%;">Тестов</th>
                <th style="width: 18%;">Статус</th>
            </tr>
        </thead>
        <tbody>
            @foreach ($rows as $row)
                <tr>
                    <td>{{ $row['name'] }}</td>
                    <td>{{ $row['login'] }}</td>
                    <td>{{ $row['moods_total'] }}</td>
                    <td>{{ $row['moods_good'] }}</td>
                    <td>{{ $row['moods_normal'] }}</td>
                    <td>{{ $row['moods_bad'] }}</td>
                    <td>{{ $row['tests_completed'] }}</td>
                    <td>
                        @if ($row['is_risk'])
                            <span class="badge badge--risk">Зона риска</span>
                        @elseif ($row['is_active'])
                            <span class="badge badge--good">Активен</span>
                        @else
                            <span class="badge badge--normal">Не активен</span>
                        @endif
                    </td>
                </tr>
            @endforeach
        </tbody>
    </table>

    <div class="footer">
        svo-i-deti — сводный отчёт по детям — {{ $generatedAt }}
    </div>
</body>
</html>