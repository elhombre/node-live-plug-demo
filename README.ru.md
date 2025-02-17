# Динамическая загрузка плагинов в Node.js

## Введение

Динамическая загрузка и выгрузка плагинов в Node.js открывает перед разработчиками возможности для создания модульных и расширяемых приложений. Это позволяет добавлять или обновлять функциональность без необходимости перезапуска всего приложения, что особенно ценно для систем, требующих высокой доступности.

В данном проекте демонстрируется концепция динамической работы с плагинами в Node.js. Репозиторий организован как монорепозиторий с использованием TurboRepo, а весь исходный код написан на TypeScript. “Хостовое” приложение построено на платформе NestJS, обеспечивающей маршрутизацию запросов к плагинам. Каждый плагин является самостоятельным NPM-пакетом и может быть собран с помощью esbuild. При каждом запуске сборщика создается новая версия плагина, которая помещается в отдельный подкаталог с номером сборки. В приложении предусмотрен менеджер плагинов, который следит за каталогами собранных плагинов и, при появлении новой версии, выгружает старую и загружает новую. Плагины корректно работают с отладчиком после загрузки новой версии.

Кроме того, проект поддерживает автоматическую валидацию данных запросов к плагинам с использованием JSON-схем. JSON-схемы генерируются автоматически из исходного кода DTO плагина, написанного на TypeScript. Это упрощает проверку данных и обеспечивает их корректность.

## Установка и запуск

### Установка зависимостей
```sh
yarn install
```

### Запуск приложения в режиме разработчика
```sh
yarn workspace backend dev
```

### Сборка плагина
```sh
yarn workspace sample-plugin build
```

### Пример запроса JSON-схемы тестового плагина
```sh
curl --location 'localhost:3100/plugins/sample-plugin/schema'
```

### Пример запроса к функционалу тестового плагина
```sh
curl --location 'localhost:3100/plugins/sample-plugin/process' \
--header 'Content-Type: application/json' \
--data '{
    "action": "echo",
    "payload": {
        "message": "test"
    }
}'
```

## Отладка в VSCode

### Установка Yarn SDK для TypeScript
```sh
yarn dlx @yarnpkg/sdks vscode
```

После этого выберите локальную версию TypeScript в VSCode:
1. Откройте любой `.ts` файл.
2. Выполните команду **"TypeScript: Select TypeScript Version..."** → **"Use Workspace Version"**.

Для отладки:
1. Включите автоматическое подключение отладчика: **"Debug: Toggle Auto Attach"** → **"Smart ..."**.
2. Запустите приложение в терминале в режиме разработчика. Отладчик должен активироваться автоматически.

Если отладка не началась, перезапустите среду разработки.

## Дополнительные возможности

- **Biome**: Быстрый линтер и форматтер. Для его использования установите [расширение Biome](https://marketplace.visualstudio.com/items?itemName=biomejs.biome) в VSCode.
  Пример настройки автоматического форматирования:
  ```json
  {
    "editor.codeActionsOnSave": {
      "quickfix.biome": "explicit",
      "source.fixAll": "explicit",
      "source.organizeImports.biome": "explicit"
    },
    "editor.formatOnSave": true
  }
  ```
- **Husky и Commitlint**: Проверка коммитов на соответствие соглашениям [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/).

## Лицензия

Этот проект распространяется под лицензией MIT. Подробнее смотрите в файле [LICENSE](./LICENSE).
