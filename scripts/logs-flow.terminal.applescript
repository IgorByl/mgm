on run argv
  set projectDir to item 1 of argv
  set quotedDir to quoted form of projectDir
  set cmds to { "cd " & quotedDir & " && docker compose logs -f --tail=100 user-service", "cd " & quotedDir & " && docker compose logs -f --tail=100 user-publication-service", "cd " & quotedDir & " && docker compose logs -f --tail=100 notification-service" }

  tell application "Terminal"
    activate
    repeat with c in cmds
      try
        do script c
      on error
        if not (exists window 1) then
          do script ""
        end if
        do script c in window 1
      end try
      delay 0.2
    end repeat
  end tell
end run
