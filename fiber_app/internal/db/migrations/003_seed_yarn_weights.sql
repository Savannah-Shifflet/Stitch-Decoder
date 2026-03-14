-- Migration 003: Seed yarn weight reference data
-- CYC (Craft Yarn Council) standard weights

INSERT INTO yarn_weights (name, sort_order, wpi_min, wpi_max, typical_gauge_st_4in_min, typical_gauge_st_4in_max, needle_size_us_min, needle_size_us_max, hook_size_mm_min, hook_size_mm_max)
VALUES
    ('Lace',        1, 30, 40, 33, 40, '000', '1',  1.5, 2.25),
    ('Fingering',   2, 14, 30, 27, 32, '1',   '3',  2.25, 3.5),
    ('Sport',       3, 12, 14, 23, 26, '3',   '5',  3.5, 4.5),
    ('DK',          4, 11, 12, 21, 24, '5',   '7',  4.5, 5.5),
    ('Worsted',     5, 9,  11, 16, 20, '7',   '9',  5.5, 6.5),
    ('Bulky',       6, 7,  9,  12, 15, '9',   '11', 6.5, 9.0),
    ('Super Bulky', 7, 0,  7,  7,  11, '11',  '17', 9.0, 16.0),
    ('Jumbo',       8, 0,  4,  0,  6,  '17',  '35', 16.0, 25.0)
ON CONFLICT (name) DO NOTHING;
