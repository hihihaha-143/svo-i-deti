<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <title>{{ $title }}</title>
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
        .category {
            margin-bottom: 18px;
        }
        .category__title {
            font-size: 12px;
            font-weight: bold;
            color: #1f2937;
            margin: 0 0 6px 0;
            padding-bottom: 3px;
            border-bottom: 1px solid #d1d5db;
        }
        .category__count {
            font-size: 9px;
            color: #6b7280;
            font-weight: normal;
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
            padding: 6px 6px;
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
        <div class="header__title">Пользователи — {{ $title }}</div>
        <div class="header__subtitle">Сформировано: {{ $generatedAt }}</div>
    </div>

    @foreach ($categories as $categoryTitle => $rows)
        <div class="category">
            <div class="category__title">
                {{ $categoryTitle }}
                <span class="category__count">({{ count($rows) }})</span>
            </div>

            @if (count($rows) === 0)
                <div class="empty">Нет данных</div>
            @else
                <table>
                    <thead>
                        @if ($categoryTitle === 'Наставники')
                            <tr>
                                <th style="width: 8%;">ID</th>
                                <th style="width: 14%;">Номер</th>
                                <th style="width: 30%;">Имя</th>
                                <th style="width: 20%;">Логин</th>
                                <th style="width: 28%;">Организация</th>
                            </tr>
                        @elseif ($categoryTitle === 'Родители')
                            <tr>
                                <th style="width: 8%;">ID</th>
                                <th style="width: 16%;">Номер</th>
                                <th style="width: 28%;">Имя</th>
                                <th style="width: 18%;">Логин</th>
                                <th style="width: 30%;">Наставник</th>
                            </tr>
                        @else
                            <tr>
                                <th style="width: 7%;">ID</th>
                                <th style="width: 18%;">Номер</th>
                                <th style="width: 25%;">Имя</th>
                                <th style="width: 15%;">Логин</th>
                                <th style="width: 17%;">Родитель</th>
                                <th style="width: 18%;">Наставник</th>
                            </tr>
                        @endif
                    </thead>
                    <tbody>
                        @foreach ($rows as $row)
                            @if ($categoryTitle === 'Наставники')
                                <tr>
                                    <td>{{ $row['id'] }}</td>
                                    <td>{{ $row['number'] }}</td>
                                    <td>{{ $row['name'] }}</td>
                                    <td>{{ $row['login'] }}</td>
                                    <td>{{ $row['organization'] ?? '—' }}</td>
                                </tr>
                            @elseif ($categoryTitle === 'Родители')
                                <tr>
                                    <td>{{ $row['id'] }}</td>
                                    <td>{{ $row['number'] }}</td>
                                    <td>{{ $row['name'] }}</td>
                                    <td>{{ $row['login'] }}</td>
                                    <td>{{ $row['mentor_name'] ?? '—' }}</td>
                                </tr>
                            @else
                                <tr>
                                    <td>{{ $row['id'] }}</td>
                                    <td>{{ $row['number'] }}</td>
                                    <td>{{ $row['name'] }}</td>
                                    <td>{{ $row['login'] }}</td>
                                    <td>{{ $row['parent_name'] ?? '—' }}</td>
                                    <td>{{ $row['mentor_name'] ?? '—' }}</td>
                                </tr>
                            @endif
                        @endforeach
                    </tbody>
                </table>
            @endif
        </div>
    @endforeach

    <div class="footer">
        svo-i-deti — выгрузка пользователей — {{ $generatedAt }}
    </div>
</body>
</html>