package com.example.smart_invoice_tracking;

import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;

    public InvoiceController(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    // Create Invoice
    @PostMapping
    public Invoice createInvoice(@RequestBody Invoice invoice) {
        return invoiceRepository.save(invoice);
    }

    // Get All Invoices
    @GetMapping
    public List<Invoice> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // Get Invoice By ID
    @GetMapping("/{id}")
    public Invoice getInvoiceById(@PathVariable Long id) {

        return invoiceRepository.findById(id)
                .orElse(null);
    }

    // Update Invoice
    @PutMapping("/{id}")
    public Invoice updateInvoice(
            @PathVariable Long id,
            @RequestBody Invoice updatedInvoice) {

        Invoice invoice = invoiceRepository.findById(id)
                .orElse(null);

        if (invoice != null) {

            invoice.setInvoiceNumber(
                    updatedInvoice.getInvoiceNumber());

            invoice.setCustomerName(
                    updatedInvoice.getCustomerName());

            invoice.setCustomerEmail(
                    updatedInvoice.getCustomerEmail());

            invoice.setAmount(
                    updatedInvoice.getAmount());

            invoice.setInvoiceDate(
                    updatedInvoice.getInvoiceDate());

            invoice.setDueDate(
                    updatedInvoice.getDueDate());

            invoice.setStatus(
                    updatedInvoice.getStatus());

            return invoiceRepository.save(invoice);
        }

        return null;
    }

    // Delete Invoice
    @DeleteMapping("/{id}")
    public String deleteInvoice(@PathVariable Long id) {

        invoiceRepository.deleteById(id);

        return "Invoice deleted successfully";
    }
}