@echo off

for /D %%d in (".\*") do (
  echo ^<^<^<^<^<^< %%d ^>^>^>^>^>^>
  call pack-single.bat %%d
  echo.
)
