
package com.example.smart_invoice_tracking;

import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/customers")
@CrossOrigin
public class CustomerController {

    private final CustomerRepository customerRepository;

    public CustomerController(CustomerRepository customerRepository) {
        this.customerRepository = customerRepository;
    }

    // Add a new customer
    @PostMapping
    public Customer addCustomer(@RequestBody Customer customer) {
        return customerRepository.save(customer);
    }

    // Get all customers
    @GetMapping
    public List<Customer> getAllCustomers() {
        return customerRepository.findAll();
    }

    // Get customer by ID
    @GetMapping("/{id}")
    public Customer getCustomerById(@PathVariable Long id) {
        return customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found with ID: " + id));
    }

    // Update customer
    @PutMapping("/{id}")
    public Customer updateCustomer(
            @PathVariable Long id,
            @RequestBody Customer customer) {

        Customer existing = customerRepository.findById(id)
                .orElseThrow(() ->
                        new RuntimeException("Customer not found with ID: " + id));

        existing.setCustomerName(customer.getCustomerName());
        existing.setEmail(customer.getEmail());
        existing.setPhone(customer.getPhone());
        existing.setAddress(customer.getAddress());
        existing.setGstNumber(customer.getGstNumber());

        return customerRepository.save(existing);
    }

    // Delete customer
    @DeleteMapping("/{id}")
    public String deleteCustomer(@PathVariable Long id) {

        if (!customerRepository.existsById(id)) {
            throw new RuntimeException("Customer not found with ID: " + id);
        }

        customerRepository.deleteById(id);
        return "Customer deleted successfully";
    }
}