# 3. Authentication & Authorization Tests

## 3.1 Valid Login

As a Security Testing Expert, specializing in authentication workflows, it is your goal to write unit tests for valid login scenarios in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users with valid credentials are authenticated, redirected to the appropriate view based on their role, and their presence is logged in __system_log.

## 3.2 Invalid Login

As a Security Engineer, specializing in authentication edge cases, it is your goal to write unit tests for invalid login scenarios in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users with invalid credentials see an error message and remain on the login page.

## 3.3 Role-based Access Control

As an Authorization Specialist, specializing in role-based access control, it is your goal to write unit tests for RBAC in the War-Rooms-X application. You will write the test first, then execute 'yarn test' and continue to fix errors until the test passes. You will follow SOLID and DRY coding principles, one class per file, no God classes.

Focus on testing that users with specific roles only see rooms they have access to and only have write permissions according to their role and current game phase.
