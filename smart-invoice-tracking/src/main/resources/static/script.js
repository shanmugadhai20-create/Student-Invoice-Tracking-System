const API_URL = "/api/invoices";

// Create Invoice
function createInvoice() {

    const invoice = {

        invoiceNumber:
        document.getElementById("invoiceNumber").value,

        customerName:
        document.getElementById("customerName").value,

        customerEmail:
        document.getElementById("customerEmail").value,

        amount:
            parseFloat(document.getElementById("amount").value),

        invoiceDate:
        document.getElementById("invoiceDate").value,

        dueDate:
        document.getElementById("dueDate").value,

        status:
        document.getElementById("status").value
    };

    fetch(API_URL, {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify(invoice)

    })
        .then(response => response.json())
        .then(data => {

            alert("Invoice added successfully!");

            loadInvoices();

        })
        .catch(error => {

            console.error(error);

            alert("Error creating invoice");

        });
}


// Get All Invoices
function loadInvoices() {

    fetch(API_URL)

        .then(response => response.json())

        .then(invoices => {

            const invoiceList =
                document.getElementById("invoiceList");

            invoiceList.innerHTML = "";

            invoices.forEach(invoice => {

                invoiceList.innerHTML += `

                    <div class="invoice">

                        <h3>
                            ${invoice.invoiceNumber}
                        </h3>

                        <p>
                            Customer:
                            ${invoice.customerName}
                        </p>

                        <p>
                            Email:
                            ${invoice.customerEmail}
                        </p>

                        <p>
                            Amount:
                            ₹${invoice.amount}
                        </p>

                        <p>
                            Due Date:
                            ${invoice.dueDate}
                        </p>

                        <p>
                            Status:
                            ${invoice.status}
                        </p>

                    </div>

                `;
            });

        })

        .catch(error => {

            console.error(error);

        });
}