@echo off
echo Starting Planora Backend...
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=D:\maven\apache-maven-3.9.16\bin;%PATH%
cd /d "%~dp0\backend\planora"
mvn spring-boot:run
pause
