<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Настроения детей</title>
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
            display: table;
            width: 100%;
            margin-bottom: 16px;
            border-collapse: separate;
            border-spacing: 8px 0;
        }
        .summary__item {
            display: table-cell;
            width: 33.33%;
            padding: 10px;
            border-radius: 6px;
            text-align: center;
        }
        .summary__item--good {
            background-color: #e8f5e9;
            color: #2e7d32;
        }
        .summary__item--normal {
            background-color: #fff3e0;
            color: #e65100;
        }
        .summary__item--bad {
            background-color: #ffebee;
            color: #c62828;
        }
        .summary__label {
            font-size: 9px;
            font-weight: bold;
            text-transform: uppercase;
            letter-spacing: 0.3px;
        }
        .summary__value {
            font-size: 18px;
            font-weight: bold;
            margin-top: 4px;
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
        .risk-yes {
            color: #c62828;
            font-weight: bold;
        }
        .risk-no {
            color: #9ca3af;
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
        <div class="header__title">Настроения детей</div>
        <div class="header__subtitle">Сформировано: {{ $generatedAt }}</div>
    </div>

    <div class="summary">
        <div class="summary__item summary__item--good">
            <div class="summary__label">Хорошее</div>
            <div class="summary__value">{{ $summary['good'] }}</div>
        </div>
        <div class="summary__item summary__item--normal">
            <div class="summary__label">Нормальное</div>
            <div class="summary__value">{{ $summary['normal'] }}</div>
        </div>
        <div class="summary__item summary__item--bad">
            <div class="summary__label">Плохое</div>
            <div class="summary__value">{{ $summary['bad'] }}</div>
        </div>
    </div>

    @if ($rows->isEmpty())
        <div class="empty">Нет записей о настроениях за выбранный период.</div>
    @else
        <table>
            <thead>
                <tr>
                    <th style="width: 30%;">Ребёнок</th>
                    <th style="width: 15%;">Зона риска</th>
                    <th style="width: 30%;">Настроение</th>
                    <th style="width: 25%;">Дата</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($rows as $row)
                    <tr>
                        <td>{{ $row['child_name'] }}</td>
                        <td>
                            @if ($row['risk'])
                                <span class="risk-yes">Да</span>
                            @else
                                <span class="risk-no">—</span>
                            @endif
                        </td>
                        <td>{{ $row['mood_label'] }}</td>
                        <td>{{ $row['date'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        svo-i-deti — выгрузка настроений — {{ $generatedAt }}
    </div>
</body>
</html>