#!/bin/sh
set -e


replace_env() {
  VAR_NAME=$1
  PLACEHOLDER=$2
  VALUE=$(printenv $VAR_NAME)
  if [ -n "$VALUE" ]; then
    find /usr/share/nginx/html/assets -type f -name '*.js' -exec \
      sed -i "s|$PLACEHOLDER|$VALUE|g" {} +
  fi
}

replace_env VITE_BASE_URL VITE_BASE_URL_PLACEHOLDER
replace_env VITE_ENABLE_DEVTOOLS VITE_ENABLE_DEVTOOLS_PLACEHOLDER

exec "$@"