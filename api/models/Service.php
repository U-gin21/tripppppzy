<?php
require_once __DIR__ . '/../config/db.php';

class Service {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data) {
        $sql = "INSERT INTO services (provider_id, service_type, name_of_institute, photo, contact_no, email, price, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'enabled')";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['provider_id'],
            $data['service_type'],
            $data['name_of_institute'],
            $data['photo'],
            $data['contact_no'],
            $data['email'],
            $data['price'],
            $data['description']
        ]);
    }

    public function update($id, $data) {
        $sql = "UPDATE services SET name_of_institute = ?, photo = ?, contact_no = ?, email = ?, price = ?, description = ? WHERE id = ?";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['name_of_institute'],
            $data['photo'],
            $data['contact_no'],
            $data['email'],
            $data['price'],
            $data['description'],
            $id
        ]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM services WHERE id = ?");
        return $stmt->execute([$id]);
    }

    public function getById($id) {
        // Fetch service and average rating
        $stmt = $this->db->prepare("
            SELECT s.*, 
                   IFNULL(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count,
                   u.full_name as provider_name
            FROM services s
            LEFT JOIN reviews r ON s.id = r.service_id
            LEFT JOIN users u ON s.provider_id = u.id
            WHERE s.id = ?
            GROUP BY s.id
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getByProviderId($providerId) {
        $stmt = $this->db->prepare("
            SELECT s.*, 
                   IFNULL(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count
            FROM services s
            LEFT JOIN reviews r ON s.id = r.service_id
            WHERE s.provider_id = ?
            GROUP BY s.id
            ORDER BY s.created_at DESC
        ");
        $stmt->execute([$providerId]);
        return $stmt->fetchAll();
    }

    public function getAllActive($type = null) {
        $sql = "
            SELECT s.*, 
                   IFNULL(AVG(r.rating), 0) as average_rating,
                   COUNT(r.id) as review_count
            FROM services s
            LEFT JOIN reviews r ON s.id = r.service_id
            WHERE s.status = 'enabled'
        ";
        $params = [];
        if ($type) {
            $sql .= " AND s.service_type = ?";
            $params[] = $type;
        }
        $sql .= " GROUP BY s.id ORDER BY s.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function toggleStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE services SET status = ? WHERE id = ?");
        return $stmt->execute([$status, $id]);
    }

    public function addReview($touristId, $serviceId, $rating, $comment) {
        // Verify if already reviewed to avoid spam
        $stmt = $this->db->prepare("SELECT id FROM reviews WHERE tourist_id = ? AND service_id = ?");
        $stmt->execute([$touristId, $serviceId]);
        if ($stmt->fetch()) {
            throw new Exception("You have already reviewed this service.");
        }

        $stmt = $this->db->prepare("INSERT INTO reviews (tourist_id, service_id, rating, comment) VALUES (?, ?, ?, ?)");
        return $stmt->execute([$touristId, $serviceId, $rating, $comment]);
    }

    public function getReviews($serviceId) {
        $stmt = $this->db->prepare("
            SELECT r.*, u.full_name, u.profile_photo 
            FROM reviews r
            JOIN users u ON r.tourist_id = u.id
            WHERE r.service_id = ?
            ORDER BY r.created_at DESC
        ");
        $stmt->execute([$serviceId]);
        return $stmt->fetchAll();
    }
    
    public function getStats() {
        $stmt = $this->db->prepare("
            SELECT service_type, COUNT(*) as count 
            FROM services 
            GROUP BY service_type
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
