
const INVOICE_API = "/api/invoices";
const CUSTOMER_API = "/api/customers";

let customersCache = [];

// ===== COMMON API HELPER =====
async function apiRequest(url, options = {}) {
    const response = await fetch(url, options);
    const text = await response.text();

    let data = null;
    try {
        data = text ? JSON.parse(text) : null;
    } catch {
        data = text;
    }

    if (!response.ok) {
        const message =
            typeof data === "string"
                ? data
                : data?.message || data?.error || "Request failed";
        throw new Error(message);
    }

    return data;
}

function escapeHTML(value) {
    return String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);
}

function showError(message) {
    alert("Error: " + message);
}

// ===== CREATE INVOICE =====
async function createInvoice() {
    const customerName =
        document.getElementById("customerName").value.trim();

    const quantity =
        Number(document.getElementById("quantity").value);

    const unitPrice =
        Number(document.getElementById("unitPrice").value);

    const discount =
        Number(document.getElementById("discount").value || 0);

    const tax =
        Number(document.getElementById("tax").value || 0);

    const paidAmount =
        Number(document.getElementById("paidAmount").value || 0);

    if (!customerName) {
        alert("Please enter the customer name.");
        return;
    }

    if (
        !Number.isFinite(quantity) || quantity < 1 ||
        !Number.isFinite(unitPrice) || unitPrice < 0 ||
        !Number.isFinite(discount) || discount < 0 ||
        !Number.isFinite(tax) || tax < 0 ||
        !Number.isFinite(paidAmount) || paidAmount < 0
    ) {
        alert("Please enter valid invoice amounts.");
        return;
    }

    const invoice = {
        invoiceNumber:
            document.getElementById("invoiceNumber").value.trim(),
        customerName,
        customerEmail:
            document.getElementById("customerEmail").value.trim(),
        customerPhone:
            document.getElementById("customerPhone").value.trim(),
        customerAddress:
            document.getElementById("customerAddress").value.trim(),
        productName:
            document.getElementById("productName").value.trim(),
        quantity,
        unitPrice,
        discount,
        tax,
        paidAmount,
        invoiceDate:
            document.getElementById("invoiceDate").value || null,
        dueDate:
            document.getElementById("dueDate").value || null,
        paymentMethod:
        document.getElementById("paymentMethod").value,
        notes:
            document.getElementById("notes").value.trim()
    };

    try {
        await apiRequest(INVOICE_API, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(invoice)
        });

        alert("Invoice added successfully!");

        document.getElementById("invoiceNumber").value = "";
        document.getElementById("customerName").value = "";
        document.getElementById("customerEmail").value = "";
        document.getElementById("customerPhone").value = "";
        document.getElementById("customerAddress").value = "";
        document.getElementById("productName").value = "";
        document.getElementById("quantity").value = "1";
        document.getElementById("unitPrice").value = "";
        document.getElementById("discount").value = "0";
        document.getElementById("tax").value = "0";
        document.getElementById("paidAmount").value = "0";
        document.getElementById("invoiceDate").value = "";
        document.getElementById("dueDate").value = "";
        document.getElementById("paymentMethod").value = "";
        document.getElementById("notes").value = "";

        await loadInvoices();
    } catch (error) {
        console.error("Create invoice error:", error);
        showError(error.message);
    }
}

// ===== LOAD INVOICES =====
async function loadInvoices() {
    const invoiceList = document.getElementById("invoiceList");

    try {
        invoiceList.innerHTML = "<p>Loading invoices...</p>";

        const invoices = await apiRequest(INVOICE_API);

        if (!Array.isArray(invoices) || invoices.length === 0) {
            invoiceList.innerHTML = "<p>No invoices found.</p>";
            return;
        }

        invoiceList.innerHTML = invoices.map(invoice => {
            const status = String(invoice.status || "PENDING").toUpperCase();

            const statusClass =
                status === "PAID" ? "status-paid" :
                    status === "OVERDUE" ? "status-overdue" :
                        "status-pending";

            return `
                <div class="invoice">
                    <h3>${escapeHTML(invoice.invoiceNumber || "Invoice")}</h3>
                    <p><strong>Customer:</strong> ${escapeHTML(invoice.customerName)}</p>
                    <p><strong>Email:</strong> ${escapeHTML(invoice.customerEmail || "-")}</p>
                    <p><strong>Product:</strong> ${escapeHTML(invoice.productName || "-")}</p>
                    <p><strong>Quantity:</strong> ${escapeHTML(invoice.quantity ?? "-")}</p>
                    <p><strong>Unit Price:</strong> ₹${escapeHTML(invoice.unitPrice ?? 0)}</p>
                    <p><strong>Total Amount:</strong> ₹${escapeHTML(invoice.amount ?? 0)}</p>
                    <p><strong>Paid:</strong> ₹${escapeHTML(invoice.paidAmount ?? 0)}</p>
                    <p><strong>Pending:</strong> ₹${escapeHTML(invoice.pendingAmount ?? 0)}</p>
                    <p><strong>Invoice Date:</strong> ${escapeHTML(invoice.invoiceDate || "-")}</p>
                    <p><strong>Due Date:</strong> ${escapeHTML(invoice.dueDate || "-")}</p>
                    <p><strong>Status:</strong>
                        <span class="${statusClass}">${escapeHTML(status)}</span>
                    </p>
                </div>
            `;
        }).join("");
    } catch (error) {
        console.error("Load invoices error:", error);
        invoiceList.innerHTML = "<p>Could not load invoices. Please try again.</p>";
        showError(error.message);
    }
}

// ===== SAVE CUSTOMER: ADD OR UPDATE =====
async function saveCustomer() {
    const id = document.getElementById("customerId").value;

    const customerName =
        document.getElementById("newCustomerName").value.trim();

    if (!customerName) {
        alert("Please enter the customer name.");
        return;
    }

    const customer = {
        customerName,
        email: document.getElementById("newCustomerEmail").value.trim(),
        phone: document.getElementById("newCustomerPhone").value.trim(),
        address: document.getElementById("newCustomerAddress").value.trim(),
        gstNumber: document.getElementById("newCustomerGst").value.trim()
    };

    try {
        const url = id
            ? `${CUSTOMER_API}/${encodeURIComponent(id)}`
            : CUSTOMER_API;

        await apiRequest(url, {
            method: id ? "PUT" : "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(customer)
        });

        alert(id ? "Customer updated successfully!" : "Customer saved successfully!");

        resetCustomerForm();
        await loadCustomers();
    } catch (error) {
        console.error("Save customer error:", error);
        showError(error.message);
    }
}

// ===== LOAD CUSTOMERS =====
async function loadCustomers() {
    const customerList = document.getElementById("customerList");

    try {
        customerList.innerHTML = "<p>Loading customers...</p>";

        const customers = await apiRequest(CUSTOMER_API);
        customersCache = Array.isArray(customers) ? customers : [];

        if (customersCache.length === 0) {
            customerList.innerHTML = "<p>No customers found. Add your first customer above.</p>";
            return;
        }

        customerList.innerHTML = customersCache.map(customer => `
            <div class="customer-card">
                <h3>${escapeHTML(customer.customerName || "Customer")}</h3>
                <p><strong>Email:</strong> ${escapeHTML(customer.email || "-")}</p>
                <p><strong>Phone:</strong> ${escapeHTML(customer.phone || "-")}</p>
                <p><strong>Address:</strong> ${escapeHTML(customer.address || "-")}</p>
                <p><strong>GST Number:</strong> ${escapeHTML(customer.gstNumber || "-")}</p>

                <button type="button"
                    onclick="editCustomer(${Number(customer.id)})">
                    Edit
                </button>

                <button type="button"
                    onclick="deleteCustomer(${Number(customer.id)})"
                    style="background: linear-gradient(110deg, #ef476f, #e63946);">
                    Delete
                </button>
            </div>
        `).join("");
    } catch (error) {
        console.error("Load customers error:", error);
        customerList.innerHTML = "<p>Could not load customers. Please try again.</p>";
        showError(error.message);
    }
}

// ===== EDIT CUSTOMER =====
function editCustomer(id) {
    const customer = customersCache.find(item => item.id === id);

    if (!customer) {
        alert("Customer not found. Please reload the customer list.");
        return;
    }

    document.getElementById("customerId").value = customer.id;
    document.getElementById("newCustomerName").value = customer.customerName || "";
    document.getElementById("newCustomerEmail").value = customer.email || "";
    document.getElementById("newCustomerPhone").value = customer.phone || "";
    document.getElementById("newCustomerAddress").value = customer.address || "";
    document.getElementById("newCustomerGst").value = customer.gstNumber || "";

    document.getElementById("newCustomerName").focus();
    window.scrollTo({ top: 0, behavior: "smooth" });
}

// ===== DELETE CUSTOMER =====
async function deleteCustomer(id) {
    if (!confirm("Are you sure you want to delete this customer?")) {
        return;
    }

    try {
        await apiRequest(`${CUSTOMER_API}/${encodeURIComponent(id)}`, {
            method: "DELETE"
        });

        alert("Customer deleted successfully!");
        await loadCustomers();
    } catch (error) {
        console.error("Delete customer error:", error);
        showError(error.message);
    }
}

// ===== RESET CUSTOMER FORM =====
function resetCustomerForm() {
    document.getElementById("customerId").value = "";
    document.getElementById("newCustomerName").value = "";
    document.getElementById("newCustomerEmail").value = "";
    document.getElementById("newCustomerPhone").value = "";
    document.getElementById("newCustomerAddress").value = "";
    document.getElementById("newCustomerGst").value = "";
}

// ===== INITIAL PAGE LOAD =====
document.addEventListener("DOMContentLoaded", () => {
    loadInvoices();
    loadCustomers();
});