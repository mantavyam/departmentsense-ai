import { test, expect } from "@playwright/test";

const API = process.env.BACKEND_URL ?? "http://localhost:8000";

test.describe("DepartmentSense — full app smoke", () => {
	test.beforeEach(async ({ context }) => {
		await context.clearCookies();
	});

	test("backend is healthy", async ({ request }) => {
		const res = await request.get(`${API}/health`);
		expect(res.ok()).toBeTruthy();
		const body = await res.json();
		expect(body.status).toBe("ok");
		expect(["keyword", "hf-inference", "local"]).toContain(body.ml_mode);
	});

	test("backend lists departments + complaints", async ({ request }) => {
		const depts = await (await request.get(`${API}/api/departments`)).json();
		expect(depts.length).toBe(6);
		expect(depts[0]).toHaveProperty("verificationCode");

		const complaints = await (await request.get(`${API}/api/complaints`)).json();
		expect(complaints.length).toBeGreaterThanOrEqual(6);
		expect(complaints[0]).toHaveProperty("referenceNumber");
		expect(complaints[0]).toHaveProperty("reasoning");
	});

	test("landing renders and links to auth", async ({ page }) => {
		await page.goto("/");
		await expect(page.getByText("DepartmentSense").first()).toBeVisible();
		await expect(page.getByRole("link", { name: /sign in/i }).first()).toBeVisible();
	});

	test("auth: citizen signs in via real API", async ({ page }) => {
		await page.goto("/auth");
		await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible();
		await page.getByRole("button", { name: /citizen/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });
		await expect(page.getByRole("heading", { name: /your grievances/i })).toBeVisible();
	});

	test("auth: admin signs in via real API", async ({ page }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /administrator/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });
		await expect(page.getByRole("heading", { name: /admin overview/i })).toBeVisible();
	});

	test("auth: dept-head sign in requires correct verification code", async ({ page }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /department head/i }).click();
		await expect(page.getByText(/department verification/i)).toBeVisible();

		// Wrong code
		await page.getByPlaceholder(/ELEC-2026/i).fill("WRONG-CODE");
		await page.getByRole("button", { name: /verify and continue/i }).click();
		await expect(page.getByText(/invalid verification code/i)).toBeVisible();

		// Correct code
		await page.getByPlaceholder(/ELEC-2026/i).fill("ELEC-2026");
		await page.getByRole("button", { name: /verify and continue/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });
		await expect(page.getByText(/electricity/i).first()).toBeVisible();
	});

	test("citizen submits a complaint and gets routed via real classification", async ({ page }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /citizen/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });

		await page.goto("/dashboard/submit");
		await expect(page.getByRole("heading", { name: /submit a complaint/i })).toBeVisible();

		// Step 1 — fill identity
		await page.getByLabel(/full name/i).fill("Anita Desai");
		await page.getByLabel(/^email$/i).fill("anita.d@email.com");
		await page.getByRole("button", { name: /continue/i }).click();

		// Step 2 — location
		await page.getByLabel(/address \/ locality/i).fill("Sector 17, Block B");
		await page.getByRole("button", { name: /continue/i }).click();

		// Step 3 — complaint
		await page.getByLabel(/subject/i).fill("Power outage for 12 hours");
		await page.getByLabel(/describe the issue/i).fill(
			"Power has been completely out for 12 hours straight. Multiple complaints made already. Elderly residents at risk."
		);
		await page.getByRole("button", { name: /continue/i }).click();

		// Step 4 — review and submit
		await expect(page.getByText(/sector 17, block b/i)).toBeVisible();
		await page.getByRole("button", { name: /submit complaint/i }).click();

		// Processing page — wait for classification to complete
		await page.waitForURL(/\/dashboard\/processing/, { timeout: 15_000 });
		await expect(page.getByRole("heading", { name: /AI is analysing|routed successfully/i })).toBeVisible({ timeout: 30_000 });
		await expect(page.getByRole("heading", { name: /routed successfully/i })).toBeVisible({ timeout: 30_000 });
		// Reference number must be visible
		await expect(page.locator("text=/GRV-\\d{4}-\\d{5}/").first()).toBeVisible();
		// Ticket PDF link rendered
		await expect(page.getByRole("link", { name: /download PDF receipt/i })).toBeVisible();
	});

	test("admin sees overview charts + complaints + log PDF actions", async ({ page }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /administrator/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });
		await expect(page.getByRole("heading", { name: /admin overview/i })).toBeVisible();
		await expect(page.getByText(/total complaints/i).first()).toBeVisible();

		await page.goto("/dashboard/complaints");
		await expect(page.getByRole("heading", { name: /all complaints/i })).toBeVisible();

		// Admin gets per-row classification PDF buttons
		await expect(page.getByRole("link", { name: /report/i }).first()).toBeVisible({ timeout: 10_000 });

		await page.goto("/dashboard/logs");
		await expect(page.getByRole("heading", { name: /activity logs/i }).first()).toBeVisible();

		await page.goto("/dashboard/departments");
		await expect(page.getByText(/electricity/i).first()).toBeVisible();
		await expect(page.getByText(/ELEC-2026/i)).toBeVisible();
	});

	test("dept-head kanban persists status changes via API", async ({ page, request }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /department head/i }).click();
		await page.getByPlaceholder(/ELEC-2026/i).fill("ELEC-2026");
		await page.getByRole("button", { name: /verify and continue/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });

		await page.goto("/dashboard/pipeline");
		await expect(page.getByRole("heading", { name: /resolution pipeline/i })).toBeVisible();
		// Should at least show seeded electricity complaints
		await expect(page.locator("text=/GRV-\\d{4}-\\d{5}/").first()).toBeVisible();
	});

	test("avatar dropdown opens and navigates to profile", async ({ page }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /citizen/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });

		// Click the trigger by aria-label
		const trigger = page.getByRole("button", { name: /open account menu/i });
		await expect(trigger).toBeVisible();
		await trigger.click();
		// Dropdown should open — items rendered as link items or menu items
		await expect(page.getByText(/^profile$/i).first()).toBeVisible({ timeout: 5_000 });
		await expect(page.getByText(/^preferences$/i).first()).toBeVisible();
		await expect(page.getByText(/^sign out$/i).first()).toBeVisible();

		await page.getByText(/^preferences$/i).first().click();
		await page.waitForURL(/\/dashboard\/settings\/account/, { timeout: 10_000 });
	});

	test("PDF endpoints return application/pdf", async ({ request }) => {
		const complaints = await (await request.get(`${API}/api/complaints`)).json();
		const c = complaints[0];
		const ticket = await request.get(`${API}/api/pdf/ticket/${c.id}`);
		expect(ticket.ok()).toBeTruthy();
		expect(ticket.headers()["content-type"]).toContain("application/pdf");

		const classification = await request.get(`${API}/api/pdf/classification/${c.id}`);
		expect(classification.ok()).toBeTruthy();
		expect(classification.headers()["content-type"]).toContain("application/pdf");
	});

	test("sidebar starts collapsed on dashboard", async ({ page }) => {
		await page.goto("/auth");
		await page.getByRole("button", { name: /citizen/i }).click();
		await page.waitForURL("**/dashboard", { timeout: 20_000 });
		const sidebar = page.locator('[data-state="collapsed"]').first();
		await expect(sidebar).toBeVisible();
	});
});
