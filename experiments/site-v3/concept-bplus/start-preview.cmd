@echo off
py -3 "%~dp0..\preview.py" --concept bplus --open --minutes 60
if errorlevel 1 pause
