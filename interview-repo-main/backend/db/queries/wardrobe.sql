-- name: ListWardrobeItems :many
SELECT * FROM wardrobe_items
WHERE user_id = $1
  AND (sqlc.narg('category')::text IS NULL OR category = sqlc.narg('category')::text)
ORDER BY created_at DESC;

-- name: GetWardrobeItem :one
SELECT * FROM wardrobe_items WHERE id = $1;

-- name: AddWardrobeItem :one
INSERT INTO wardrobe_items (user_id, name, brand, category, color, image_url, source_type, source_url, popular_item_id, price)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, sqlc.narg('popular_item_id')::uuid, $9)
RETURNING *;

-- name: UpdateWardrobeItem :one
UPDATE wardrobe_items SET
    name = $2, brand = $3, category = $4, color = $5, image_url = $6,
    updated_at = now()
WHERE id = $1
RETURNING *;

-- name: DeleteWardrobeItem :exec
DELETE FROM wardrobe_items WHERE id = $1;

-- name: GetWardrobeCategories :many
SELECT category, COUNT(*)::int AS count
FROM wardrobe_items
WHERE user_id = $1
GROUP BY category;

-- name: GetWardrobeStats :one
SELECT 
    (SELECT COUNT(*)::int FROM wardrobe_items WHERE user_id = $1) AS total_items,
    (SELECT MAX(created_at) FROM wardrobe_items WHERE user_id = $1) AS last_added,
    COALESCE(
        (SELECT json_object_agg(category, cat_count) 
         FROM (
             SELECT category, COUNT(*)::int as cat_count 
             FROM wardrobe_items 
             WHERE user_id = $1 
             GROUP BY category
         ) sub
        ), 
        '{}'::json
    ) AS category_counts;