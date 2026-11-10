package com.expiryguard.server.config;

import com.expiryguard.server.entity.Category;
import com.expiryguard.server.repository.CategoryRepository;

import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.stereotype.Component;

/** Adds starter pharmacy categories to an empty database. */
@Component
public class CategorySeeder implements ApplicationRunner {

    private final CategoryRepository categories;

    public CategorySeeder(CategoryRepository categories) {
        this.categories = categories;
    }

    @Override
    public void run(ApplicationArguments args) {
        if (categories.count() > 0) {
            return;
        }

        String[][] data = {
                {"Antibiotics", "Infection treatment medicines"},
                {"Pain Relief", "Analgesics and anti-inflammatories"},
                {"Cold & Flu", "Cough, cold and allergy medicines"},
                {"Vitamins & Supplements", "Daily health supplements"},
                {"Diabetes Care", "Insulin and glucose control"},
                {"First Aid", "Dressings, antiseptics and supplies"}
        };

        for (String[] row : data) {
            Category c = new Category();
            c.setName(row[0]);
            c.setDescription(row[1]);
            categories.save(c);
        }
    }
}