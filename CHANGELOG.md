# rimfrost-regel-bekraftabeslut-fe changelog

Changelog of rimfrost-regel-bekraftabeslut-fe.

## 0.0.4 (2026-09-17)

### Bug Fixes

-  self-load runtime-config.js when running as a Module Federation remote ([5b34c](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/5b34c6e8b46a99d) LisaWedin_Ductus)  

### Other changes

**Merge branch 'main' of https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe**


[02e6b](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/02e6be768323ae7) LisaWedin_Ductus *2026-09-17 06:23:26*


## 0.0.3 (2026-09-15)

### Bug Fixes

-  namespace the runtime-config global per app ([cc9e4](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/cc9e4bb2ddba632) LisaWedin_Ductus)  

## 0.0.2 (2026-09-14)

### Bug Fixes

-  correct case-mismatched module federation expose path ([5284b](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/5284b6b504d64a3) LisaWedin_Ductus)  

## 0.0.1 (2026-09-14)

### Features

-  add Playwright e2e smoke suite ([df84f](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/df84f377db4d3de) LisaWedin_Ductus)  
-  adds krav docs ([0dad8](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/0dad8ff47b4f541) LisaWedin_Ductus)  
-  error message when referensdata is not present ([00358](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/00358480d967482) julolsso)  
-  adds more error messages ([e2307](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/e2307901529d406) LisaWedin_Ductus)  
-  updates for be changes ([3bb73](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/3bb7323c224581d) LisaWedin_Ductus)  
-  migrates to module federations vite package ([bc0e9](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/bc0e9fdd2d86a7b) LisaWedin_Ductus)  
-  updates envs and paths ([1b35f](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/1b35fa1db299355) LisaWedin_Ductus)  
-  add success field to task-done event ([43a4c](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/43a4c58ef014028) Jorgen Lindstrom)  
-  add toast notification on task completion ([94653](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/94653d626d47878) Jorgen Lindstrom)  
-  updates component with changes from be and adds event on done ([7afa0](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/7afa0abe52da252) LisaWedin_Ductus)  
-  update BekraftaBeslutKomponent ([abc1a](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/abc1a4e8ff602df) julolsso)  
-  add bekräfta beslut component with PATCH via BFF integration ([0b75b](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/0b75b264996bce0) Jorgen Lindstrom)  

### Bug Fixes

-  fetch beslutsdata via GET .../handlaggning/{id} (FKPOC-1027) ([98306](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/98306714c430d28) LisaWedin_Ductus)  
-  changes anspråksstatus to status ([a7b73](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/a7b73d5eb092f75) LisaWedin_Ductus)  
-  updates both 503s to use the same error message ([752dc](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/752dc92eb2a504f) LisaWedin_Ductus)  
-  merge conflict ([1e0b7](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/1e0b7dd3d3b7e4f) LisaWedin_Ductus)  
-  removed uppgiftstyp ([0cd5c](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/0cd5c779e2c377f) LisaWedin_Ductus)  
-  bugfix ([57d69](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/57d6960c951d2f0) LisaWedin_Ductus)  
-  cleanup ([865c2](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/865c2948305bd38) LisaWedin_Ductus)  
-  sets bekraftad to false on unmount ([e0c3f](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/e0c3f85066c84ac) LisaWedin_Ductus)  
-  updates path ([19b3a](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/19b3a7e8843d67d) LisaWedin_Ductus)  
-  refactors component and adds uppgiftbeskrivning ([f141c](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/f141c0d11ecf7ed) LisaWedin_Ductus)  
-  move error handling to static display instead of toast ([3e7c1](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/3e7c193d8e74188) Jorgen Lindstrom)  
-  remove mf temp and update script ([4e483](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/4e483c9496d6394) LisaWedin_Ductus)  
-  update BekraftaBeslutKomponent ([909b9](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/909b99044cd67e0) Jorgen Lindstrom)  

### Other changes

**bekraftabeslut**


[8565d](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/8565d9db94821e2) Jorgen Lindstrom *2026-03-16 14:17:30*

**lagt till en enkel pingfubnktion för att verifiera att kedjan fungerar**


[a6815](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/a681544a0af5d9e) Julia Olsson *2026-02-10 10:19:47*

**Adds fetch to micro fe**


[c0e75](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/c0e753a47d133ee) Lisa Wedin *2026-01-15 13:43:33*

**updates readme**


[3eb30](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/3eb307d65499366) Lisa Wedin *2026-01-14 09:17:53*

**updates readme**


[4a001](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/4a001de596f9325) Lisa Wedin *2026-01-14 09:17:02*

**initial commit**


[affd0](https://github.com/Forsakringskassan/rimfrost-regel-bekraftabeslut-fe/commit/affd0ebacdfc84e) Lisa Wedin *2026-01-14 09:14:27*


