@echo off
echo Creating JTCC skills directory...
if not exist "c:\Users\muqingkun\.claude\skills" (
    mkdir "c:\Users\muqingkun\.claude\skills"
    echo Skills directory created
)

echo Copying JTCC skills...
robocopy "c:\Users\muqingkun\Desktop\projectByGit\projectByGit\everything-claude-code\skills" "c:\Users\muqingkun\.claude\skills" /E /XD .git

echo Creating commands directory...
if not exist "c:\Users\muqingkun\.claude\commands\jtcc" (
    mkdir "c:\Users\muqingkun\.claude\commands\jtcc"
    echo Commands directory created
)

echo Copying JTCC commands...
robocopy "c:\Users\muqingkun\Desktop\projectByGit\projectByGit\everything-claude-code\commands" "c:\Users\muqingkun\.claude\commands\jtcc" /E

echo Creating agents directory...
if not exist "c:\Users\muqingkun\.claude\agents" (
    mkdir "c:\Users\muqingkun\.claude\agents"
    echo Agents directory created
)

echo Copying JTCC agents...
robocopy "c:\Users\muqingkun\Desktop\projectByGit\projectByGit\everything-claude-code\agents" "c:\Users\muqingkun\.claude\agents" /E

echo Creating rules directory...
if not exist "c:\Users\muqingkun\.claude\rules" (
    mkdir "c:\Users\muqingkun\.claude\rules"
    echo Rules directory created
)

echo Copying JTCC rules...
robocopy "c:\Users\muqingkun\Desktop\projectByGit\projectByGit\everything-claude-code\rules" "c:\Users\muqingkun\.claude\rules" /E

echo JTCC manual installation completed!
echo.
echo You can now use JTCC commands in Claude Code:
echo - /jt-tdd
echo - /jt-plan
echo - /jt-code-review
echo - /jt-e2e
echo etc.
pause