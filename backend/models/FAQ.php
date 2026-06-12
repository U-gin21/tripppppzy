<?php
require_once __DIR__ . '/../config/db.php';

class FAQ {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($question, $answer) {
        $stmt = $this->db->prepare("INSERT INTO faqs (question, answer) VALUES (?, ?)");
        return $stmt->execute([$question, $answer]);
    }

    public function getAll() {
        $stmt = $this->db->prepare("SELECT * FROM faqs ORDER BY created_at DESC");
        $stmt->execute();
        return $stmt->fetchAll();
    }

    public function update($id, $question, $answer) {
        $stmt = $this->db->prepare("UPDATE faqs SET question = ?, answer = ? WHERE id = ?");
        return $stmt->execute([$question, $answer, $id]);
    }

    public function delete($id) {
        $stmt = $this->db->prepare("DELETE FROM faqs WHERE id = ?");
        return $stmt->execute([$id]);
    }
}
