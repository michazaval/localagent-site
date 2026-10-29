@echo off
py -3 "%~dp0..\preview.py" --concept immersive --open --minutes 60
if errorlevel 1 pause
