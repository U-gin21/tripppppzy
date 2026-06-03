<?php
require_once __DIR__ . '/../config/db.php';

class Destination {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data) {
        $sql = "INSERT INTO destinations (name, district, description, image, activities, budget_category, interest_category, latitude, longitude)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['name'],
            $data['district'],
            $data['description'],
            $data['image'],
            $data['activities'],
            $data['budget_category'],
            $data['interest_category'],
            $data['latitude'],
            $data['longitude']
        ]);
    }

    public function update($id, $data) {
        $sql = "UPDATE destinations SET name = ?, district = ?, description = ?, image = ?, activities = ?, budget_category = ?, interest_category = ?, latitude = ?, longitude = ?
                WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['name'],
            $data['district'],
            $data['description'],
            $data['image'],
            $data['activities'],
            $data['budget_category'],
            $data['interest_category'],
            $data['latitude'],
            $data['longitude'],
            $id
        ]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM destinations WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getById($id) {
        $stmt = $this->db->prepare("SELECT * FROM destinations WHERE id = ?");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getAll() {
        $stmt = $this->db->prepare("SELECT * FROM destinations ORDER BY name ASC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function search($filters = []) {
        $sql = "SELECT * FROM destinations WHERE 1=1";
        $params = [];

        if (!empty($filters['query'])) {
            $sql .= " AND (name LIKE ? OR district LIKE ? OR description LIKE ?)";
            $searchVal = "%" . $filters['query'] . "%";
            $params[] = $searchVal;
            $params[] = $searchVal;
            $params[] = $searchVal;
        }

        if (!empty($filters['district'])) {
            $sql .= " AND district = ?";
            $params[] = $filters['district'];
        }

        if (!empty($filters['interest_category'])) {
            $sql .= " AND interest_category = ?";
            $params[] = $filters['interest_category'];
        }

        if (!empty($filters['budget_category'])) {
            $sql .= " AND budget_category = ?";
            $params[] = $filters['budget_category'];
        }

        if (!empty($filters['activity'])) {
            $sql .= " AND activities LIKE ?";
            $params[] = "%" . $filters['activity'] . "%";
        }

        $sql .= " ORDER BY name ASC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }
}
