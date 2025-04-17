## Task List for Issue #26: Mock Backend with ra-data-fakerest

1. **Analyze AdminView Data Needs**
   - Identify all resources (entities/endpoints) consumed by `AdminView` (e.g., users, rooms, wargames, forces).

2. **Install ra-data-fakerest**
   - Add the package:  
     `yarn add ra-data-fakerest`

3. **Design the Mock Dataset**
   - Define a JS object representing the mock data structure for all required resources.
   - Ensure the data covers all fields used by AdminView components.

4. **Implement Mock DataProvider in login.tsx**
   - Import and configure `ra-data-fakerest` with the mock dataset in `login.tsx`.
   - Ensure the mock dataProvider is only used in development mode or behind a feature flag.

5. **Wire Mock DataProvider to AdminView**
   - Pass the mock dataProvider to `AdminView` (or the relevant react-admin context).
   - Ensure AdminView pages render using the mock data.

6. **Test AdminView Pages**
   - Verify all AdminView pages load and interact correctly with the mock backend (list, edit, create, delete, etc.).
   - Adjust mock data as needed to cover edge cases.

7. **Document Usage**
   - Add developer documentation in this markdown file:
     - How to enable/disable the mock backend.
     - How to extend the mock dataset.

8. **Code Review & Merge**
   - Submit a PR referencing issue #26.
   - Request review and address feedback.

---

# Issue 26 - provide mock admin pages