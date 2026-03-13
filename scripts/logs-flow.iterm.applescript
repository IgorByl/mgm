on run argv
  set projectDir to item 1 of argv
  set quotedDir to quoted form of projectDir
  set cmds to { "cd " & quotedDir & " && docker compose logs -f --tail=100 user-service", "cd " & quotedDir & " && docker compose logs -f --tail=100 user-publication-service", "cd " & quotedDir & " && docker compose logs -f --tail=100 notification-service" }

  tell application "iTerm"
    activate
    set w1 to (create window with default profile)
    tell current session of w1 to write text (item 1 of cmds)
    set w2 to (create window with default profile)
    tell current session of w2 to write text (item 2 of cmds)
    set w3 to (create window with default profile)
    tell current session of w3 to write text (item 3 of cmds)
  end tell
end run
