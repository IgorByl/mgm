#!/usr/bin/env bash
set -euo pipefail

if [[ "$(uname -s)" != "Darwin" ]]; then
  echo "logs:flow is only supported on macOS."
  exit 1
fi

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
term_program="${TERM_PROGRAM:-}"
terminal_pref="${LOGS_FLOW_TERMINAL:-}"

if [[ "$terminal_pref" == "iterm" || "$term_program" == "iTerm.app" || -n "${ITERM_SESSION_ID:-}" ]]; then
  if ! osascript "$project_dir/scripts/logs-flow.iterm.applescript" "$project_dir"; then
    echo "Failed to open iTerm windows."
    echo "If you use Terminal, run: LOGS_FLOW_TERMINAL=terminal yarn logs:flow"
    exit 1
  fi
else
  if ! osascript "$project_dir/scripts/logs-flow.terminal.applescript" "$project_dir"; then
    echo "Failed to open Terminal windows."
    echo "If you use iTerm, run: LOGS_FLOW_TERMINAL=iterm yarn logs:flow"
    exit 1
  fi
fi
