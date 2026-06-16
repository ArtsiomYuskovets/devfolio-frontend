# Devfolio Frontend

Веб-приложение для создания и просмотра портфолио IT-специалистов: профили, проекты, ленты, избранное и верификация навыков.

## Возможности

- **Аутентификация** — регистрация, вход, обновление access-токена
- **Профиль** — создание и редактирование (никнейм, имя, bio, ссылки, аватар, тип пользователя)
- **Проекты** — создание, редактирование, просмотр, удаление, галерея изображений
- **Навыки проекта** — добавление из каталога и верификация через API
- **Ленты** — проекты и профили с поиском и фильтрами
- **Избранное** — сохранённые проекты
- **Роли** — соискатель (`JOB_SEEKER`) и рекрутёр (`RECRUITER`) с разным UI

## Стек

- [Next.js 15](https://nextjs.org/) (App Router, Turbopack)
- [React 19](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Redux Toolkit](https://redux-toolkit.js.org/) + RTK Query
- [Axios](https://axios-http.com/)
- SCSS Modules

## Требования

- Node.js 20+
- npm
- Запущенный backend API (по умолчанию `http://localhost:8080`)

## Быстрый старт

```bash
# Клонировать репозиторий
git clone <repository-url>
cd devfolio-frontend

# Установить зависимости
npm install

# Скопировать переменные окружения
cp .env.example .env.local

# Запустить dev-сервер
npm run dev
```

Приложение откроется на [http://localhost:3000](http://localhost:3000).

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и при необходимости измените значения.

| Переменная | Описание | По умолчанию |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | URL backend API (без `/` в конце) | `http://localhost:8080` |
| `NEXT_PUBLIC_VERIFY_TIMEOUT_MS` | Ожидание после запроса верификации навыков (мс) | `10000` |

Переменные с префиксом `NEXT_PUBLIC_` доступны в браузере. После изменения `.env` перезапустите dev-сервер.

## Скрипты

| Команда | Описание |
|---|---|
| `npm run dev` | Dev-сервер с Turbopack |
| `npm run build` | Production-сборка |
| `npm run start` | Запуск production-сборки |
| `npm run lint` | ESLint |
| `npm test` | Jest-тесты |
| `npm run test:watch` | Тесты в watch-режиме |

## Структура проекта

```
app/                  # Маршруты Next.js (auth, protected-зона)
components/           # UI-компоненты
hooks/                # React-хуки
lib/                  # Утилиты, env, нормализация API-ответов
stores/               # Redux store, RTK Query API-слайсы
types/                # Общие TypeScript-типы
styles/               # SCSS-токены и миксины
tests/                # Тесты
```

### Основные маршруты

| Путь | Описание |
|---|---|
| `/` | Приветственная страница |
| `/auth` | Вход / регистрация |
| `/profile` | Редирект на свой профиль |
| `/profile/edit` | Создание и редактирование профиля |
| `/profile/[id]` | Просмотр профиля |
| `/projects` | Лента проектов |
| `/projects/new` | Создание проекта |
| `/projects/favorites` | Избранные проекты |
| `/profiles` | Лента профилей |
| `/project/[id]` | Просмотр проекта |
| `/project/[id]/template` | Редактирование проекта |

## Backend

Фронтенд ожидает REST API на адресе из `NEXT_PUBLIC_API_URL`. Основные группы эндпоинтов:

- `auth/*` — аутентификация
- `api/profiles/*` — профили
- `api/projects/*` — проекты, навыки, верификация, избранное
- `api/skills/*` — каталог навыков

Без запущенного backend большинство страниц в защищённой зоне работать не будут.

## Сборка для production

```bash
npm run build
npm run start
```

Убедитесь, что `NEXT_PUBLIC_API_URL` указывает на production backend до сборки — значение встраивается на этапе `next build`.
