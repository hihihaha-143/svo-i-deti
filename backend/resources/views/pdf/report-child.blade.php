<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Отчёт по ребёнку</title>
    <style>
        @page { margin: 20mm 12mm 20mm 12mm; }
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
            font-size: 13px;
            font-weight: bold;
            color: #1f2937;
            margin-top: 2px;
        }
        .section-title {
            font-size: 11px;
            font-weight: bold;
            color: #374151;
            text-transform: uppercase;
            letter-spacing: 0.3px;
            margin: 16px 0 6px 0;
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
        <div class="header__title">Отчёт по ребёнку: {{ $child['name'] }} ({{ $child['login'] }})</div>
        <div class="header__subtitle">
            Период: {{ $period['from'] }} — {{ $period['to'] }} · Сформировано: {{ $generatedAt }}
        </div>
    </div>

    <div class="summary">
        <div class="summary__title">Итого</div>
        <div class="summary__grid">
            <div class="summary__item">
                <div class="summary__label">Настроений</div>
                <div class="summary__value">{{ $summary['moods_total'] }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">Хорошо</div>
                <div class="summary__value">{{ $summary['moods_good'] }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">Тестов пройдено</div>
                <div class="summary__value">{{ $summary['tests_completed'] }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">Статус</div>
                <div class="summary__value">
                    @if ($summary['is_risk'])
                        <span class="badge badge--risk">Зона риска</span>
                    @else
                        <span class="badge badge--good">В норме</span>
                    @endif
                </div>
            </div>
        </div>
    </div>

    <div class="section-title">Настроения</div>
    @if (count($moods) === 0)
        <div class="empty">Отметок настроения за период нет.</div>
    @else
        <table>
            <thead>
                <tr>
                    <th style="width: 10%;">№</th>
                    <th style="width: 40%;">Настроение</th>
                    <th style="width: 50%;">Дата</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($moods as $index => $mood)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>
                            @if ($mood['value'] === 'good')
                                <span class="badge badge--good">Хорошо</span>
                            @elseif ($mood['value'] === 'normal')
                                <span class="badge badge--normal">Нейтрально</span>
                            @else
                                <span class="badge badge--bad">Плохо</span>
                            @endif
                        </td>
                        <td>{{ \Illuminate\Support\Carbon::parse($mood['created_at'])->format('d.m.Y H:i') }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="section-title">Пройденные тесты</div>
    @if (count($attempts) === 0)
        <div class="empty">Попыток прохождения тестов за период нет.</div>
    @else
        <table>
            <thead>
                <tr>
                    <th style="width: 10%;">№</th>
                    <th style="width: 55%;">Тест</th>
                    <th style="width: 15%;">Статус</th>
                    <th style="width: 20%;">Дата</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($attempts as $index => $attempt)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $attempt['test'] }}</td>
                        <td>
                            @if ($attempt['is_completed'])
                                <span class="badge badge--good">Завершён</span>
                            @else
                                <span class="badge badge--normal">В процессе</span>
                            @endif
                        </td>
                        <td>{{ $attempt['finished_at'] ? \Illuminate\Support\Carbon::parse($attempt['finished_at'])->format('d.m.Y H:i') : '—' }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        svo-i-deti — отчёт по ребёнку — {{ $generatedAt }}
    </div>
</body>
</html>