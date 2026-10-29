#!/usr/bin/env bash
set -Eeuo pipefail

# Открываем чтение только для отслеживаемых файлов приложения; .env и копии БД не затрагиваются.
root="$(git rev-parse --show-toplevel)"
cd "$root"
chmod a+x "$root"
while IFS= read -r -d '' file; do
    case "$file" in
        manage.py|config/*|production/*|templates/*|static/*|tools/*) ;;
        *) continue ;;
    esac
    [[ -f "$file" && ! -L "$file" ]] || continue
    parent="$(dirname "$file")"
    while [[ "$parent" != . ]]; do
        [[ ! -L "$parent" ]] || { echo "Недопустимая символическая ссылка: $parent" >&2; exit 1; }
        chmod a+rx "$parent"
        parent="$(dirname "$parent")"
    done
    chmod a+r "$file"
done < <(git ls-files -z)
