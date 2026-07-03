#!/usr/bin/env bash
# Scant img/ per huisje en schrijft gallery.json (front.jpg + overige foto's).
# Draai na het uploaden van nieuwe afbeeldingen: ./scripts/generate-gallery-manifests.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"

for img_dir in "$ROOT"/huisjes/*/img; do
  [ -d "$img_dir" ] || continue

  huisje="$(basename "$(dirname "$img_dir")")"
  images=()

  while IFS= read -r -d '' file; do
    rel="${file#"$img_dir"/}"
    base="$(basename "$rel")"
    base_lower="$(printf '%s' "$base" | tr '[:upper:]' '[:lower:]')"
    case "$base_lower" in
      banner.jpg|gallery.json) continue ;;
    esac
    images+=("$rel")
  done < <(
    find "$img_dir" -type f \( \
      -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o \
      -iname '*.webp' -o -iname '*.gif' \
    \) ! -name 'gallery.json' -print0 | sort -z
  )

  manifest="$img_dir/gallery.json"
  {
    printf '{\n  "images": [\n'
    for i in "${!images[@]}"; do
      sep=","
      [ "$i" -eq $((${#images[@]} - 1)) ] && sep=""
      printf '    "%s"%s\n' "${images[$i]}" "$sep"
    done
    printf '  ]\n}\n'
  } > "$manifest"

  echo "$huisje: ${#images[@]} foto('s) → $manifest"
done
