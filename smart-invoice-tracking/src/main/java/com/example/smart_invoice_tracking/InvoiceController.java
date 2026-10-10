package com.example.smart_invoice_tracking;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/invoices")
@CrossOrigin
public class InvoiceController {

    private final InvoiceRepository invoiceRepository;

    public InvoiceController(InvoiceRepository invoiceRepository) {
        this.invoiceRepository = invoiceRepository;
    }

    // =========================
    // CREATE INVOICE
    // =========================
    @PostMapping
    public Invoice createInvoice(@RequestBody Invoice invoice) {

        // Automatic invoice number
        if (invoice.getInvoiceNumber() == null ||
                invoice.getInvoiceNumber().isEmpty()) {

            invoice.setInvoiceNumber(
                    "INV-" + System.currentTimeMillis()
            );
        }

        // Invoice date
        if (invoice.getInvoiceDate() == null) {
            invoice.setInvoiceDate(LocalDate.now());
        }

        // Default values
        if (invoice.getQuantity() == null) {
            invoice.setQuantity(1);
        }

        if (invoice.getUnitPrice() == null) {
            invoice.setUnitPrice(0.0);
        }

        if (invoice.getDiscount() == null) {
            invoice.setDiscount(0.0);
        }

        if (invoice.getTax() == null) {
            invoice.setTax(0.0);
        }

        if (invoice.getPaidAmount() == null) {
            invoice.setPaidAmount(0.0);
        }

        // Subtotal
        double subtotal =
                invoice.getQuantity() * invoice.getUnitPrice();

        invoice.setSubtotal(subtotal);

        // Amount after discount
        double amountAfterDiscount =
                subtotal - invoice.getDiscount();

        if (amountAfterDiscount < 0) {
            amountAfterDiscount = 0;
        }

        // GST / Tax
        double taxAmount =
                amountAfterDiscount * invoice.getTax() / 100;

        // Final amount
        double finalAmount =
                amountAfterDiscount + taxAmount;

        invoice.setAmount(finalAmount);

        // Pending amount
        double pendingAmount =
                finalAmount - invoice.getPaidAmount();

        if (pendingAmount < 0) {
            pendingAmount = 0;
        }

        invoice.setPendingAmount(pendingAmount);

        // Invoice status
        if (invoice.getPaidAmount() >= finalAmount) {

            invoice.setStatus("PAID");

        } else if (invoice.getPaidAmount() > 0) {

            invoice.setStatus("PARTIALLY PAID");

        } else if (invoice.getDueDate() != null &&
                invoice.getDueDate().isBefore(LocalDate.now())) {

            invoice.setStatus("OVERDUE");

        } else {

            invoice.setStatus("PENDING");
        }

        return invoiceRepository.save(invoice);
    }


    // =========================
    // GET ALL INVOICES
    // =========================
    @GetMapping
    public List<Invoice> getAllInvoices() {

        return invoiceRepository.findAll();
    }


    // =========================
    // GET INVOICE BY ID
    // =========================
    @GetMapping("/{id}")
    public Invoice getInvoiceById(@PathVariable Long id) {

        return invoiceRepository.findById(id)
                .orElse(null);
    }


    // =========================
    // UPDATE INVOICE
    // =========================
    @PutMapping("/{id}")
    public Invoice updateInvoice(
            @PathVariable Long id,
            @RequestBody Invoice updatedInvoice) {

        Invoice invoice =
                invoiceRepository.findById(id)
                        .orElse(null);

        if (invoice == null) {
            return null;
        }

        invoice.setInvoiceNumber(
                updatedInvoice.getInvoiceNumber());

        invoice.setCustomerName(
                updatedInvoice.getCustomerName());

        invoice.setCustomerEmail(
                updatedInvoice.getCustomerEmail());

        invoice.setCustomerPhone(
                updatedInvoice.getCustomerPhone());

        invoice.setCustomerAddress(
                updatedInvoice.getCustomerAddress());

        invoice.setProductName(
                updatedInvoice.getProductName());

        invoice.setProductDescription(
                updatedInvoice.getProductDescription());

        invoice.setQuantity(
                updatedInvoice.getQuantity());

        invoice.setUnitPrice(
                updatedInvoice.getUnitPrice());

        invoice.setDiscount(
                updatedInvoice.getDiscount());

        invoice.setTax(
                updatedInvoice.getTax());

        invoice.setInvoiceDate(
                updatedInvoice.getInvoiceDate());

        invoice.setDueDate(
                updatedInvoice.getDueDate());

        invoice.setPaidAmount(
                updatedInvoice.getPaidAmount());

        invoice.setPaymentMethod(
                updatedInvoice.getPaymentMethod());

        invoice.setPaymentDate(
                updatedInvoice.getPaymentDate());

        invoice.setNotes(
                updatedInvoice.getNotes());


        // Recalculate invoice
        double quantity =
                invoice.getQuantity() == null
                        ? 1
                        : invoice.getQuantity();

        double unitPrice =
                invoice.getUnitPrice() == null
                        ? 0
                        : invoice.getUnitPrice();

        double discount =
                invoice.getDiscount() == null
                        ? 0
                        : invoice.getDiscount();

        double tax =
                invoice.getTax() == null
                        ? 0
                        : invoice.getTax();

        double paidAmount =
                invoice.getPaidAmount() == null
                        ? 0
                        : invoice.getPaidAmount();


        double subtotal = quantity * unitPrice;

        invoice.setSubtotal(subtotal);

        double amountAfterDiscount =
                subtotal - discount;

        if (amountAfterDiscount < 0) {
            amountAfterDiscount = 0;
        }

        double taxAmount =
                amountAfterDiscount * tax / 100;

        double finalAmount =
                amountAfterDiscount + taxAmount;

        invoice.setAmount(finalAmount);


        double pendingAmount =
                finalAmount - paidAmount;

        if (pendingAmount < 0) {
            pendingAmount = 0;
        }

        invoice.setPendingAmount(pendingAmount);


        // Update status
        if (paidAmount >= finalAmount) {

            invoice.setStatus("PAID");

        } else if (paidAmount > 0) {

            invoice.setStatus("PARTIALLY PAID");

        } else if (invoice.getDueDate() != null &&
                invoice.getDueDate().isBefore(LocalDate.now())) {

            invoice.setStatus("OVERDUE");

        } else {

            invoice.setStatus("PENDING");
        }


        return invoiceRepository.save(invoice);
    }


    // =========================
    // DELETE INVOICE
    // =========================
    @DeleteMapping("/{id}")
    public String deleteInvoice(@PathVariable Long id) {

        if (!invoiceRepository.existsById(id)) {
            return "Invoice not found";
        }

        invoiceRepository.deleteById(id);

        return "Invoice deleted successfully";
    }
}