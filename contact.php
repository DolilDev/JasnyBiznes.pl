<?php
/* ============================================================
   contact.php — obsługa formularza kontaktowego Trafni.pl
   ============================================================
   KONFIGURACJA — zmień poniższe wartości na swoje:
*/

define('MAIL_OWNER',   'twoj@email.pl');         // <-- Twój e-mail (dostajesz dane z formularza)
define('MAIL_FROM',    'kontakt@trafni.pl');      // <-- Adres nadawcy (musi być na Twoim serwerze)
define('SITE_NAME',    'Trafni.pl');

/* ============================================================ */

header('Content-Type: application/json; charset=utf-8');

// Akceptujemy tylko POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metoda niedozwolona.']);
    exit;
}

// Pobierz i oczyść dane
$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$phone   = trim($_POST['phone']   ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');

$errors = [];

// ── WALIDACJA ────────────────────────────────────────────────

// Imię i Nazwisko: minimum "AAA BBB" (3+ liter, spacja, 3+ liter)
if (!preg_match('/^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]{3,}\s[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]{3,}$/u', $name)) {
    $errors['name'] = 'Wpisz imię i nazwisko (min. 3 litery, spacja, min. 3 litery).';
}

// E-mail: format tekst@tekst.tekst
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Podaj poprawny adres e-mail (np. jan@firma.pl).';
}

// Telefon: dokładnie 9 cyfr (spacje/myślniki są ignorowane)
$phoneDigits = preg_replace('/\D/', '', $phone);
if (strlen($phoneDigits) !== 9) {
    $errors['phone'] = 'Numer telefonu musi mieć dokładnie 9 cyfr.';
}

// Wiadomość: min. 30 znaków
if (mb_strlen($message) < 30) {
    $errors['message'] = 'Wiadomość musi mieć co najmniej 30 znaków (masz ' . mb_strlen($message) . ').';
}

// Jeśli są błędy — zwróć je
if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

// ── WYSYŁKA MAILI ────────────────────────────────────────────

$serviceLabel = htmlspecialchars($service ?: 'Nie wybrano');
$nameSafe     = htmlspecialchars($name);
$emailSafe    = htmlspecialchars($email);
$phoneSafe    = htmlspecialchars($phone);
$messageSafe  = nl2br(htmlspecialchars($message));

// --- 1. Mail do właściciela strony (dane z formularza) ---
$ownerSubject = "Nowe zapytanie z formularza – {$nameSafe}";
$ownerBody    = "
<!DOCTYPE html>
<html lang='pl'>
<head><meta charset='utf-8'/></head>
<body style='font-family:Inter,sans-serif;background:#f9f9fb;padding:2rem;'>
  <div style='max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>
    <div style='background:#0059b5;padding:2rem;'>
      <h1 style='color:#fff;margin:0;font-size:1.5rem;'>Nowe zapytanie 📬</h1>
    </div>
    <div style='padding:2rem;'>
      <table style='width:100%;border-collapse:collapse;'>
        <tr><td style='padding:0.5rem 0;color:#717785;width:140px;'>Imię i nazwisko</td><td style='padding:0.5rem 0;font-weight:600;'>{$nameSafe}</td></tr>
        <tr><td style='padding:0.5rem 0;color:#717785;'>E-mail</td><td style='padding:0.5rem 0;font-weight:600;'><a href='mailto:{$emailSafe}' style='color:#0059b5;'>{$emailSafe}</a></td></tr>
        <tr><td style='padding:0.5rem 0;color:#717785;'>Telefon</td><td style='padding:0.5rem 0;font-weight:600;'>{$phoneSafe}</td></tr>
        <tr><td style='padding:0.5rem 0;color:#717785;'>Usługa</td><td style='padding:0.5rem 0;font-weight:600;'>{$serviceLabel}</td></tr>
      </table>
      <hr style='border:none;border-top:1px solid #e2e2e4;margin:1.5rem 0;'/>
      <p style='color:#717785;margin-bottom:0.5rem;'>Wiadomość:</p>
      <p style='line-height:1.7;'>{$messageSafe}</p>
    </div>
    <div style='background:#f3f3f5;padding:1rem 2rem;text-align:center;font-size:0.8rem;color:#717785;'>
      Wiadomość wysłana ze strony " . SITE_NAME . "
    </div>
  </div>
</body>
</html>
";

$ownerHeaders  = "MIME-Version: 1.0\r\n";
$ownerHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
$ownerHeaders .= "From: " . SITE_NAME . " <" . MAIL_FROM . ">\r\n";
$ownerHeaders .= "Reply-To: {$emailSafe}\r\n";

// --- 2. Mail potwierdzający do klienta ---
$clientSubject = "Potwierdzenie – otrzymaliśmy Twoją wiadomość | " . SITE_NAME;
$clientBody    = "
<!DOCTYPE html>
<html lang='pl'>
<head><meta charset='utf-8'/></head>
<body style='font-family:Inter,sans-serif;background:#f9f9fb;padding:2rem;'>
  <div style='max-width:560px;margin:auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);'>
    <div style='background:#0059b5;padding:2rem;'>
      <h1 style='color:#fff;margin:0;font-size:1.5rem;'>" . SITE_NAME . "</h1>
    </div>
    <div style='padding:2rem;'>
      <h2 style='margin-top:0;'>Cześć, {$nameSafe}! 👋</h2>
      <p style='line-height:1.7;color:#414753;'>Dziękujemy za kontakt. Twoja wiadomość dotarła do nas — skontaktujemy się z Tobą w ciągu <strong>24 godzin</strong>.</p>
      <div style='background:#f3f3f5;border-radius:8px;padding:1.25rem;margin:1.5rem 0;'>
        <p style='margin:0;color:#717785;font-size:0.9rem;'>Podsumowanie Twojego zapytania:</p>
        <p style='margin:0.5rem 0 0;font-weight:600;'>Usługa: {$serviceLabel}</p>
      </div>
      <p style='line-height:1.7;color:#414753;'>Jeśli masz pilną sprawę, możesz też napisać bezpośrednio na:<br/>
        <a href='mailto:" . MAIL_OWNER . "' style='color:#0059b5;font-weight:600;'>" . MAIL_OWNER . "</a>
      </p>
      <a href='https://trafni.pl' style='display:inline-block;margin-top:1.5rem;background:#0059b5;color:#fff;padding:0.75rem 2rem;border-radius:9999px;text-decoration:none;font-weight:600;'>Wróć na stronę →</a>
    </div>
    <div style='background:#f3f3f5;padding:1rem 2rem;text-align:center;font-size:0.8rem;color:#717785;'>
      © 2026 " . SITE_NAME . " | Ta wiadomość została wysłana automatycznie.
    </div>
  </div>
</body>
</html>
";

$clientHeaders  = "MIME-Version: 1.0\r\n";
$clientHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
$clientHeaders .= "From: " . SITE_NAME . " <" . MAIL_FROM . ">\r\n";

// Wyślij oba maile
$sentOwner  = mail(MAIL_OWNER, $ownerSubject,  $ownerBody,  $ownerHeaders);
$sentClient = mail($email,     $clientSubject, $clientBody, $clientHeaders);

if ($sentOwner) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Błąd serwera przy wysyłce. Spróbuj ponownie lub zadzwoń do nas.']);
}
