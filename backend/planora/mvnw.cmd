@echo off
setlocal

SET JAVA_EXEC="%JAVA_HOME%\bin\java.exe"
SET MAVEN_WRAPPER_JAR="%~dp0.mvn\wrapper\maven-wrapper.jar"
SET MAVEN_WRAPPER_PROPERTIES="%~dp0.mvn\wrapper\maven-wrapper.properties"

IF NOT EXIST %MAVEN_WRAPPER_JAR% (
    echo Downloading Maven Wrapper...
    %JAVA_EXEC% -jar %MAVEN_WRAPPER_JAR% %*
) ELSE (
    %JAVA_EXEC% -cp %MAVEN_WRAPPER_JAR% org.apache.maven.wrapper.MavenWrapperMain %*
)

endlocal
