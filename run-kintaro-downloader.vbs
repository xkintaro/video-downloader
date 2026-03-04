Set WshShell = CreateObject("WScript.Shell")

WshShell.Run "cmd /c cd C:\kintaro-downloader\backend && node index.js", 0, False

WshShell.Run "cmd /c cd C:\kintaro-downloader\frontend && npm run dev", 0, False
