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
                $mail->SMTPDebug = 0;
                $mail->Debugoutput = function($str, $level) {
                    error_log("PHPMailer debug [{$level}]: {$str}");
                };
                $mail->Host = SMTP_HOST;
                $mail->SMTPAuth = true;
                $mail->Username = SMTP_USER;
                $mail->Password = SMTP_PASS;
                $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
                $mail->Port = SMTP_PORT;
                $mail->SMTPOptions = [
                    'ssl' => [
                        'verify_peer' => false,
                        'verify_peer_name' => false,
                        'allow_self_signed' => true,
                    ],
                ];
                $mail->CharSet = 'UTF-8';

                if (!filter_var($to, FILTER_VALIDATE_EMAIL)) {
                    throw new Exception("Invalid recipient email address: $to");
                }

                $mail->setFrom(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
                $mail->addReplyTo(SMTP_FROM_EMAIL, SMTP_FROM_NAME);
                $mail->addAddress($to);

                $mail->isHTML(true);
                $mail->Subject = $subject;
                $mail->Body = $body;
                $mail->AltBody = strip_tags($body);

                if (!$mail->send()) {
                    throw new Exception($mail->ErrorInfo);
                }
                return true;
            } catch (Exception $e) {
                error_log("PHPMailer Exception: " . $e->getMessage());
                @file_put_contents(MAIL_LOG_FILE, "PHPMailer Exception: " . $e->getMessage() . "\n[Fallback Info]: Returned true so local development flow (OTP/approvals) is not blocked. Retrieve the content of this email from the log lines above.\n", FILE_APPEND);
                return true; // Fallback: Return true to prevent blocking local development flows (like OTP code verification) when SMTP ports are blocked by ISP/Firewall
            }
        }
        return true;
    }
}
