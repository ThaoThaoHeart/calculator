# Project Guidelines

## 1. Priorities

When rules conflict, the higher item wins:

1. Correctness
2. Verification
3. Minimal changes
4. Clarity
5. Maintainability

## 2. Workflow

For every non-trivial task:

1. **Understand.** Read the relevant files before editing. Never assume filesystem state, APIs, schemas, functions, or dependencies exist. Learn the existing structure, state flow, and conventions.
2. **State assumptions.** Say what you are assuming and what you are unsure about. If the request has multiple interpretations, list them instead of picking silently. Ask only when ambiguity affects correctness.
3. **Plan.** For multi-step or multi-component work, give a short plan with a verifiable check per step:
   ```
   1. [Step] -> verify: [check]
   2. [Step] -> verify: [check]
   ```
   Turn vague tasks into verifiable goals: "fix the bug" means "write a test that reproduces it, then make it pass"; "refactor X" means "tests pass before and after".
4. **Implement** the smallest complete change (see section 3).
5. **Verify** (see section 5).
6. **Report** what changed, important decisions, which checks ran, and any limitations.

If a simpler approach exists than the one requested, say so and push back.

## 3. Simplicity and Scope

- Write the minimum code that solves the problem. If 200 lines could be 50, rewrite it.
- No features, configurability, flexibility, or error handling beyond what the task needs.
- No new dependencies, libraries, or patterns (styling, data fetching, state management, testing) unless clearly necessary.
- Do not optimize prematurely.
- Every changed line must trace directly to the request.
- Do not refactor, reformat, or "improve" unrelated code. Preserve public interfaces and unrelated behavior.
- Match existing style, naming, and folder structure even if you would do it differently.
- Mention unrelated issues or dead code instead of changing them.
- Remove only the imports, variables, and functions that your own change made unused.
- Ask: "Would a senior engineer call this overcomplicated?" If yes, simplify.

## 4. Abstractions and Files

- Avoid duplicating meaningful logic: business rules, calculations, validation, repeated UI behavior.
- Similar-looking code is not automatically the same concept. A little duplication beats a wrong abstraction.
- Do not create a helper, hook, component, or file for trivial or single-use logic. Keep simple feature-specific helpers in the file that uses them.
- Extract to a separate file only when it is reused across meaningful boundaries or has substantial independent complexity.
- Colocate related components, types, constants, and helpers with their feature. No global `utils`, `helpers`, `common`, or `shared` grab-bags. No unnecessary barrel files or re-export chains.
- Before creating anything new, check whether an existing implementation already solves it, and ask: "Does this make the code easier to understand, or does it just move code elsewhere?"

## 5. Verification and Testing

- Never claim success without evidence from tests, execution, or direct inspection. Distinguish observations from assumptions.
- If a check cannot be run, say so instead of implying it passed.
- Bugs: reproduce first, fix the root cause rather than adding a narrow workaround, then confirm the fix.
- Features: confirm the expected behavior and check for obvious regressions.
- Refactors: preserve behavior and verify before and after.
- Use the existing test setup (Vitest + Testing Library for the frontend). Test user-visible behavior and edge cases, not implementation details.
- Run relevant tests, type checks, and linting when available.

## 6. When Blocked or Concerned

- Stop and describe the blocker, what information is missing, and what was already verified.
- Never fabricate progress or results.
- If a request seems harmful or destructive, explain the concern instead of proceeding silently.

## 7. React

### Components
- One clear responsibility per component. Do not split just to hit a line count.
- Extract a child component only when it has a distinct responsibility, independent behavior, or is reused.
- Avoid deep JSX nesting, unnecessary wrapper elements, and piles of conditional rendering. Use early returns and well-named variables.
- Prefer explicit props over generic components with many boolean flags.

### Hooks and State
- Follow the Rules of Hooks.
- Keep state close to where it is used. Lift it only when components genuinely share it.
- Do not store values that can be derived from props or state. Do not use `useEffect` to compute derived values.
- Use `useEffect` only to sync with external systems (subscriptions, browser APIs, imperative libraries), and clean up timers, listeners, and subscriptions.
- Prevent stale async results from updating state.
- No `useMemo`, `useCallback`, or `React.memo` without a demonstrated need.
- No custom hooks that just wrap a single hook.

### Data, Errors, and Side Effects
- Follow existing API patterns (axios + React Query).
- Handle errors at the appropriate boundary. No redundant try/catch, and never swallow errors silently.
- Avoid unnecessary state updates and side effects.

### Styling and UI
- Use the existing styling approach (Tailwind). Reuse existing components and styles.
- Preserve responsive behavior and accessibility.

### Types (for `.ts` / `.tsx` files)
- Make props and data structures explicit. Avoid `any`; use proper types or `unknown` with narrowing.
- Avoid unnecessary type assertions, non-null assertions, and elaborate generics.
- Keep component-specific types next to the component.

## 8. Code Style

- Use descriptive camelCase names with full words. No abbreviations (`isLoading`, `filteredProducts`, `handleSubmit`, not `data`, `tmp`, `btn`). Conventional loop indexes like `i` are fine.
- Name things so event handlers, booleans, collections, and derived values are distinguishable.
- Use guard clauses and early returns to reduce nesting. Prefer plain conditionals over clever expressions.
- Do not write code comments.
- Do not use em dashes.


# Django & Python Project Guidelines

## Environment & Commands
Always use `uv` for package management, script execution, and tool orchestration. Do not use bare `pip` or `python` commands.
- Install dependency: `uv add <package>`
- Run management command: `uv run python manage.py <command>`
- Run development server: `uv run python manage.py runserver`
- Format code: `uv run ruff format .`
- Lint code: `uv run ruff check --fix .`

## Testing Workflow & Guards
- Run test suite: `uv run pytest`
- Test Execution: Always run existing tests to verify system stability before and after making changes.
- Test-Driven Development: Draft or plan model and view tests before writing implementation code.
- Test Protection: NEVER modify or "fix" an existing failing test to match a code hallucination. If a test fails, the implementation is incorrect unless a breaking contract change was explicitly requested.

## Architecture & Code Conventions
- Business Logic: Enforce the views-services-selectors pattern. Never place heavy business logic directly in views, models, or serializers.
- Cross-App Imports: Enforce strict bounded contexts. Apps should interact via well-defined public service functions, never via direct cross-app model imports.
- Database Performance: Always optimize queries using `select_related()` for ForeignKey/OneToOne and `prefetch_related()` for ManyToMany relationships to prevent N+1 issues.
- Django Models: 
  - Always prefer `TextChoices` or `IntegerChoices` for choices fields.
  - Always use `update_fields=["field_name"]` when saving specific modifications in a model instance method to prevent race conditions.
  - Implement database indexing explicitly on fields frequently used in filters or lookups.

## Development Checklist (Step-by-Step)
When implementing a new feature or change, you must follow this exact development lifecycle:
1. Thinking & Planning: Propose a code change plan and wait for review before writing files.
2. Model-First Development: Implement or modify Django models and constraints first.
3. Validate Models: Run `uv run python manage.py check` to catch ORM structural flaws early.
4. Generate Migrations: Run `uv run python manage.py makemigrations` and verify the graph with `showmigrations`.
5. Implementation & Testing: Implement serializers, views, and URLs alongside accompanying unit/integration tests.


## README
- Update the readme when any new features get added.