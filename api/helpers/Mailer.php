<?php
require_once __DIR__ . '/../config/mail.php';

// Require PHPMailer files directly
require_once __DIR__ . '/phpmailer/Exception.php';
require_once __DIR__ . '/phpmailer/PHPMailer.php';
require_once __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer {
    public static function send($to, $subject, $body) {
        $log_dir = dirname(MAIL_LOG_FILE);
        if (!file_exists($log_dir)) {
            @mkdir($log_dir, 0755, true);
        }

        // Format mail logs to simulate email delivery locally
        $timestamp = date('Y-m-d H:i:s');
        $log_content = "========================================\n";
        $log_content .= "Timestamp: $timestamp\n";
        $log_content .= "To: $to\n";
        $log_content .= "Subject: $subject\n";
        $log_content .= "Body:\n$body\n";
        $log_content .= "========================================\n\n";

        // Write to local mail log
        @file_put_contents(MAIL_LOG_FILE, $log_content, FILE_APPEND);

        // Send actual email if SMTP_PASS is configured
        if (defined('SMTP_PASS') && SMTP_PASS !== '') {
            try {
                $mail = new PHPMailer(true);
                $mail->isSMTP();
                $mail->Host = SMTP_HOST;
                $mail->SMTPAuth = true;
                $mail->Username = SMTP_USER;
                $mail->Password = SMTP_PASS;
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = SMTP_PORT;

                $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
                $mail->addAddress($to);

                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body = $body;

                return $mail->send();
            } catch (Exception $e) {
                error_log("PHPMailer Exception: " . $e->getMessage());
                return false;
            }
        }
        return true;
    }
}
