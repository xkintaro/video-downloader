Set WshShell = CreateObject("WScript.Shell")
Set fso = CreateObject("Scripting.FileSystemObject")
root = fso.GetParentFolderName(WScript.ScriptFullName)

WshShell.CurrentDirectory = root & "\backend"
WshShell.Run "cmd /c node index.js", 0, False

WshShell.CurrentDirectory = root & "\frontend"
WshShell.Run "cmd /c npm run dev", 0, False
