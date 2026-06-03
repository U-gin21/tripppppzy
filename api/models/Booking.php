<?php
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/../helpers/Mailer.php';

class Booking {
    private $db;

    public function __construct() {
        $this->db = Database::getInstance()->getConnection();
    }

    public function create($data) {
        // Generate a unique reference number
        $ref_no = 'TZ-' . strtoupper(substr($data['service_type'], 0, 1)) . '-' . date('Ymd') . '-' . rand(1000, 9999);

        // Fetch service price and provider details
        $stmt = $this->db->prepare("SELECT price, name_of_institute, email, contact_no FROM services WHERE id = ?");
        $stmt->execute([$data['service_id']]);
        $service = $stmt->fetch();
        if (!$service) {
            throw new Exception("Service not found.");
        }

        // Calculate price based on duration
        $start = new DateTime($data['start_date']);
        $end = new DateTime($data['end_date']);
        $days = $start->diff($end)->days;
        if ($days <= 0) {
            $days = 1; // Minimum 1 day
        }
        $total_price = $service['price'] * $days;

        $sql = "INSERT INTO bookings (tourist_id, service_id, ref_no, start_date, end_date, price, status, booking_details)
                VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)";
        $stmt = $this->db->prepare($sql);
        $result = $stmt->execute([
            $data['tourist_id'],
            $data['service_id'],
            $ref_no,
            $data['start_date'],
            $data['end_date'],
            $total_price,
            $data['booking_details'] ?? ''
        ]);

        if ($result) {
            $bookingId = $this->db->lastInsertId();

            // Fetch tourist details
            $stmt = $this->db->prepare("SELECT full_name, email FROM users WHERE id = ?");
            $stmt->execute([$data['tourist_id']]);
            $tourist = $stmt->fetch();

            if ($tourist) {
                // Send email notification to Tourist with Ref No
                $subject = "Tripzy Booking Confirmation Request - Ref: $ref_no";
                $body = "<h2>Dear " . htmlspecialchars($tourist['full_name']) . ",</h2>";
                $body .= "<p>Your booking request for <strong>" . htmlspecialchars($service['name_of_institute']) . "</strong> has been submitted successfully!</p>";
                $body .= "<h3>Booking Reference Details:</h3>";
                $body .= "<ul>";
                $body .= "<li><strong>Booking Ref No:</strong> " . $ref_no . "</li>";
                $body .= "<li><strong>Service:</strong> " . ucfirst($data['service_type']) . " (" . htmlspecialchars($service['name_of_institute']) . ")</li>";
                $body .= "<li><strong>Duration:</strong> " . $data['start_date'] . " to " . $data['end_date'] . " ($days day/s)</li>";
                $body .= "<li><strong>Total Cost:</strong> LKR " . number_format($total_price, 2) . "</li>";
                $body .= "<li><strong>Payment Mode:</strong> Offline (Pay on Arrival / Physical Payment to Provider)</li>";
                $body .= "<li><strong>Status:</strong> PENDING CONFIRMATION</li>";
                $body .= "</ul>";
                $body .= "<p>Please pay the provider physically upon arrival to complete your booking. The service provider will verify your reference number and mark the booking as completed.</p>";
                $body .= "<p>Best Regards,<br>Tripzy Sri Lanka Team</p>";

                Mailer::send($tourist['email'], $subject, $body);

                // Notify service provider
                $provider_subject = "New Booking Received - Ref: $ref_no";
                $provider_body = "<h2>Hello Provider,</h2>";
                $provider_body .= "<p>You have received a new booking request for your service: <strong>" . htmlspecialchars($service['name_of_institute']) . "</strong>.</p>";
                $provider_body .= "<p><strong>Client:</strong> " . htmlspecialchars($tourist['full_name']) . " (" . htmlspecialchars($tourist['email']) . ")</p>";
                $provider_body .= "<p><strong>Dates:</strong> " . $data['start_date'] . " to " . $data['end_date'] . "</p>";
                $provider_body .= "<p><strong>Price:</strong> LKR " . number_format($total_price, 2) . "</p>";
                $provider_body .= "<p>Please review and update the status in your Provider Dashboard.</p>";
                
                Mailer::send($service['email'], $provider_subject, $provider_body);
            }

            return [
                "booking_id" => $bookingId,
                "ref_no" => $ref_no,
                "total_price" => $total_price
            ];
        }
        return false;
    }

    public function getById($id) {
        $stmt = $this->db->prepare("
            SELECT b.*, s.name_of_institute, s.service_type, s.contact_no as service_contact, s.email as service_email,
                   t.full_name as tourist_name, t.contact_no as tourist_contact, t.email as tourist_email
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users t ON b.tourist_id = t.id
            WHERE b.id = ?
        ");
        $stmt->execute([$id]);
        return $stmt->fetch();
    }

    public function getByTouristId($touristId) {
        $stmt = $this->db->prepare("
            SELECT b.*, s.name_of_institute, s.service_type, s.photo as service_photo
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            WHERE b.tourist_id = ?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$touristId]);
        return $stmt->fetchAll();
    }

    public function getByProviderId($providerId) {
        $stmt = $this->db->prepare("
            SELECT b.*, s.name_of_institute, s.service_type,
                   t.full_name as tourist_name, t.contact_no as tourist_contact, t.email as tourist_email
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users t ON b.tourist_id = t.id
            WHERE s.provider_id = ?
            ORDER BY b.created_at DESC
        ");
        $stmt->execute([$providerId]);
        return $stmt->fetchAll();
    }

    public function updateStatus($id, $status) {
        $stmt = $this->db->prepare("UPDATE bookings SET status = ? WHERE id = ?");
        $result = $stmt->execute([$status, $id]);

        if ($result) {
            $booking = $this->getById($id);
            if ($booking) {
                // Email status update to Tourist
                $subject = "Tripzy Booking Status Updated - Ref: " . $booking['ref_no'];
                $body = "<h2>Dear " . htmlspecialchars($booking['tourist_name']) . ",</h2>";
                $body .= "<p>Your booking for <strong>" . htmlspecialchars($booking['name_of_institute']) . "</strong> (Ref: " . $booking['ref_no'] . ") has been marked as: <strong>" . strtoupper($status) . "</strong>.</p>";
                if ($status === 'completed') {
                    $body .= "<p>Thank you for completing your payment. Your booking is officially verified. We hope you enjoy your tour in Sri Lanka!</p>";
                } else if ($status === 'rejected') {
                    $body .= "<p>We are sorry, but your booking request was declined. Please contact the provider at " . htmlspecialchars($booking['service_contact']) . " for details.</p>";
                }
                $body .= "<p>Warm Regards,<br>Tripzy Sri Lanka Team</p>";
                Mailer::send($booking['tourist_email'], $subject, $body);
            }
        }
        return $result;
    }

    public function getAllBookings() {
        $stmt = $this->db->prepare("
            SELECT b.*, s.name_of_institute, s.service_type,
                   t.full_name as tourist_name, p.full_name as provider_name
            FROM bookings b
            JOIN services s ON b.service_id = s.id
            JOIN users t ON b.tourist_id = t.id
            JOIN users p ON s.provider_id = p.id
            ORDER BY b.created_at DESC
        ");
        $stmt->execute();
        return $stmt->fetchAll();
    }
}
