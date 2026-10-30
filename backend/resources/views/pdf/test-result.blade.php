<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>Результат теста</title>
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
            font-size: 12px;
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
        .type-badge {
            display: inline-block;
            padding: 2px 6px;
            background-color: #e0e7ff;
            color: #3730a3;
            border-radius: 3px;
            font-size: 8px;
            font-weight: bold;
            white-space: nowrap;
        }
        .superpowers-table td {
            font-size: 10px;
        }
        .superpowers-table td:last-child {
            text-align: right;
            font-weight: bold;
            color: #10409a;
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
        <div class="header__title">Результат теста: {{ $attempt->test->title }}</div>
        <div class="header__subtitle">Сформировано: {{ $generatedAt }}</div>
    </div>

    <div class="summary">
        <div class="summary__title">Информация о прохождении</div>
        <div class="summary__grid">
            <div class="summary__item">
                <div class="summary__label">Ребёнок</div>
                <div class="summary__value">{{ $attempt->user->name ?: $attempt->user->login }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">Логин</div>
                <div class="summary__value">{{ $attempt->user->login }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">Тест</div>
                <div class="summary__value">{{ $attempt->test->title }}</div>
            </div>
            <div class="summary__item">
                <div class="summary__label">Пройден</div>
                <div class="summary__value">{{ $attempt->finished_at ? $attempt->finished_at->format('d.m.Y H:i') : '—' }}</div>
            </div>
        </div>
    </div>

    <div class="section-title">Ответы</div>
    @if (empty($answers))
        <div class="empty">Ответов нет.</div>
    @else
        <table>
            <thead>
                <tr>
                    <th style="width: 6%;">№</th>
                    <th style="width: 50%;">Вопрос</th>
                    <th style="width: 12%;">Тип</th>
                    <th style="width: 32%;">Ответ</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($answers as $index => $answer)
                    <tr>
                        <td>{{ $index + 1 }}</td>
                        <td>{{ $answer['question'] }}</td>
                        <td><span class="type-badge">{{ $answer['type'] }}</span></td>
                        <td>{{ $answer['answer'] }}</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="section-title">Суперсилы ребёнка</div>
    @if (empty($superpowersRows))
        <div class="empty">Оценка качества ещё не выставлена.</div>
    @else
        <table class="superpowers-table">
            <thead>
                <tr>
                    <th style="width: 80%;">Качество</th>
                    <th style="width: 20%;">Оценка</th>
                </tr>
            </thead>
            <tbody>
                @foreach ($superpowersRows as $row)
                    <tr>
                        <td>{{ $row['label'] }}</td>
                        <td>{{ $row['value'] }} / 10</td>
                    </tr>
                @endforeach
            </tbody>
        </table>
    @endif

    <div class="footer">
        svo-i-deti — выгрузка результата теста — {{ $generatedAt }}
    </div>
</body>
</html>