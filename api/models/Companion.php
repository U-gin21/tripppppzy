<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/Mailer.php';

class Companion {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function createPost($data) {
        $sql = "INSERT INTO companion_posts (owner_id, destination_place, start_date, end_date, budget_range, companions_needed, gender_preference, travel_interests, description, status)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'open')";
        $stmt = $this->db->prepare($sql);
        return $stmt->execute([
            $data['owner_id'],
            $data['destination_place'],
            $data['start_date'],
            $data['end_date'],
            $data['budget_range'],
            $data['companions_needed'],
            $data['gender_preference'] ?? 'Any',
            $data['travel_interests'],
            $data['description']
        ]);
    }

    public function getPosts($filters = []) {
        $sql = "
            SELECT cp.*, u.full_name, u.gender as owner_gender, u.profile_photo as owner_photo, u.date_of_birth
            FROM companion_posts cp
            JOIN users u ON cp.owner_id = u.id
            WHERE cp.status = 'open'
        ";
        $params = [];

        if (!empty($filters['destination'])) {
            $sql .= " AND cp.destination_place LIKE ?";
            $params[] = "%" . $filters['destination'] . "%";
        }
        if (!empty($filters['gender_preference']) && $filters['gender_preference'] !== 'Any') {
            $sql .= " AND (cp.gender_preference = ? OR cp.gender_preference = 'Any')";
            $params[] = $filters['gender_preference'];
        }

        $sql .= " ORDER BY cp.created_at DESC";
        $stmt = $this->db->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchAll();
    }

    public function getPostById($id) {
        $stmt = $this->db->prepare("
            SELECT cp.*, u.full_name, u.email as owner_email, u.contact_no as owner_contact, u.gender as owner_gender, u.profile_photo as owner_photo
            FROM companion_posts cp
            JOIN users u ON cp.owner_id = u.id
            WHERE cp.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getMyPosts($userId) {
        $stmt = $this->db->prepare("SELECT * FROM companion_posts WHERE owner_id = ? ORDER BY created_at DESC");
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function sendRequest($data) {
        // Prevent requesting multiple times for same post
        $stmt = $this->db->prepare("SELECT id FROM companion_requests WHERE post_id = ? AND requester_id = ?");
        $stmt->execute([$data['post_id'], $data['requester_id']]);
        if ($stmt->fetch()) {
            throw new Exception("You have already sent a request to join this trip.");
        }

        // Prevent requesting own post
        $stmt = $this->db->prepare("SELECT owner_id FROM companion_posts WHERE id = ?");
        $stmt->execute([$data['post_id']]);
        $post = $stmt->fetch();
        if ($post && $post['owner_id'] == $data['requester_id']) {
            throw new Exception("You cannot send a join request to your own trip post.");
        }

        $stmt = $this->db->prepare("INSERT INTO companion_requests (post_id, requester_id, message, status) VALUES (?, ?, ?, 'pending')");
        return $stmt->execute([
            $data['post_id'],
            $data['requester_id'],
            $data['message'] ?? ''
        ]);
    }

    public function getRequestsForPost($postId) {
        $stmt = $this->db->prepare("
            SELECT cr.*, u.full_name, u.email as requester_email, u.contact_no as requester_contact, u.gender as requester_gender, u.profile_photo as requester_photo, u.date_of_birth
            FROM companion_requests cr
            JOIN users u ON cr.requester_id = u.id
            WHERE cr.post_id = ?
            ORDER BY cr.created_at DESC
        ");
        $stmt->execute([$postId]);
        return $stmt->fetchAll();
    }

    public function getRequestsSentByTourist($touristId) {
        $stmt = $this->db->prepare("
            SELECT cr.*, cp.destination_place, cp.start_date, cp.end_date, u.full_name as owner_name, u.email as owner_email, u.contact_no as owner_contact
            FROM companion_requests cr
            JOIN companion_posts cp ON cr.post_id = cp.id
            JOIN users u ON cp.owner_id = u.id
            WHERE cr.requester_id = ?
            ORDER BY cr.created_at DESC
        ");
        $stmt->execute([$touristId]);
        return $stmt->fetchAll();
    }

    public function updateRequestStatus($requestId, $status) {
        // Fetch request details
        $stmt = $this->db->prepare("
            SELECT cr.*, cp.destination_place, cp.owner_id, 
                   req.full_name as requester_name, req.email as requester_email, req.contact_no as requester_contact,
                   own.full_name as owner_name, own.email as owner_email, own.contact_no as owner_contact
            FROM companion_requests cr
            JOIN companion_posts cp ON cr.post_id = cp.id
            JOIN users req ON cr.requester_id = req.id
            JOIN users own ON cp.owner_id = own.id
            WHERE cr.id = ?
        ");
        $stmt->execute([$requestId]);
        $request = $stmt->fetch();

        if (!$request) {
            throw new Exception("Request not found.");
        }

        $stmt = $this->db->prepare("UPDATE companion_requests SET status = ? WHERE id = ?");
        $result = $stmt->execute([$status, $requestId]);

        if ($result && $status === 'accepted') {
            // Share details with requester via email
            $subject = "Tripzy Companion Request Accepted!";
            $body = "<h2>Great News, " . htmlspecialchars($request['requester_name']) . "!</h2>";
            $body .= "<p>Your request to join the travel plan to <strong>" . htmlspecialchars($request['destination_place']) . "</strong> has been <strong>ACCEPTED</strong> by " . htmlspecialchars($request['owner_name']) . ".</p>";
            $body .= "<h3>Contact Details Shared:</h3>";
            $body .= "<ul>";
            $body .= "<li><strong>Travel Companion Name:</strong> " . htmlspecialchars($request['owner_name']) . "</li>";
            $body .= "<li><strong>Email Address:</strong> " . htmlspecialchars($request['owner_email']) . "</li>";
            $body .= "<li><strong>Contact Phone:</strong> " . htmlspecialchars($request['owner_contact']) . "</li>";
            $body .= "</ul>";
            $body .= "<p>You are now matched as travel companions. Get in touch and enjoy your trip together!</p>";
            $body .= "<p>Warm Regards,<br>Tripzy Sri Lanka Team</p>";
            Mailer::send($request['requester_email'], $subject, $body);

            // Also email the owner with requester details for completeness
            $owner_subject = "Companion Request Approved: Details Shared";
            $owner_body = "<h2>Hello " . htmlspecialchars($request['owner_name']) . ",</h2>";
            $owner_body .= "<p>You accepted " . htmlspecialchars($request['requester_name']) . "'s request to join your trip to <strong>" . htmlspecialchars($request['destination_place']) . "</strong>.</p>";
            $owner_body .= "<h3>Requester's Contact Details:</h3>";
            $owner_body .= "<ul>";
            $owner_body .= "<li><strong>Name:</strong> " . htmlspecialchars($request['requester_name']) . "</li>";
            $owner_body .= "<li><strong>Email:</strong> " . htmlspecialchars($request['requester_email']) . "</li>";
            $owner_body .= "<li><strong>Contact Phone:</strong> " . htmlspecialchars($request['requester_contact']) . "</li>";
            $owner_body .= "</ul>";
            $owner_body .= "<p>Happy Traveling!</p>";
            Mailer::send($request['owner_email'], $owner_subject, $owner_body);
        }

        return $result;
    }
}
