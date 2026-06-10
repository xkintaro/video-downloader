Set WshShell = CreateObject("WScript.Shell")

WshShell.Run "cmd /c cd C:\video-downloader\backend && node index.js", 0, False

WshShell.Run "cmd /c cd C:\video-downloader\frontend && npm run dev", 0, False
