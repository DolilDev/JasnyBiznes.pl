<?php
/* ============================================================
   contact.php — obsługa formularza kontaktowego Trafni.pl
   ============================================================
   KONFIGURACJA — zmień poniższe wartości na swoje:
*/

define('MAIL_OWNER',   'biuro@jasnybiznes.pl');         // <-- Twój e-mail (dostajesz dane z formularza)
define('MAIL_FROM',    'kontakt@jasnybiznes.pl');      // <-- Adres nadawcy (musi być na Twoim serwerze)
define('SITE_NAME',    'jasnybiznes.pl');

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Metoda niedozwolona.']);
    exit;
}

$name    = trim($_POST['name']    ?? '');
$email   = trim($_POST['email']   ?? '');
$phone   = trim($_POST['phone']   ?? '');
$service = trim($_POST['service'] ?? '');
$message = trim($_POST['message'] ?? '');
$hoursFrom = trim($_POST['hours_from'] ?? '');
$hoursTo   = trim($_POST['hours_to']   ?? '');
$validHour = fn($h) => preg_match('/^(8|9|10|11|12|13|14|15|16|17|18):00$/', $h);
if (!$validHour($hoursFrom) || !$validHour($hoursTo)) {
    $hoursFrom = ''; $hoursTo = '';
}
$hoursLabel = ($hoursFrom && $hoursTo) ? "{$hoursFrom} – {$hoursTo}" : 'Nie podano';

$errors = [];

$ip = $_SERVER['HTTP_CF_CONNECTING_IP']
   ?? $_SERVER['HTTP_X_FORWARDED_FOR']
   ?? $_SERVER['REMOTE_ADDR']
   ?? 'Nieznane';
if (str_contains($ip, ',')) {
    $ip = trim(explode(',', $ip)[0]);
}
$ipSafe = htmlspecialchars($ip);

$honeypot = trim($_POST['website'] ?? '');
if ($honeypot !== '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Wykryto bota.']);
    exit;
}

$formLoadTime = intval($_POST['_flt'] ?? 0);
$elapsed      = time() - $formLoadTime;
if ($formLoadTime === 0 || $elapsed < 4 || $elapsed > 3600) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'error' => 'Nieprawidłowe żądanie.']);
    exit;
}

if (!preg_match('/^[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]{3,}\s[A-Za-zĄąĆćĘęŁłŃńÓóŚśŹźŻż]{3,}$/u', $name)) {
    $errors['name'] = 'Wpisz imię i nazwisko (min. 3 litery, spacja, min. 3 litery).';
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors['email'] = 'Podaj poprawny adres e-mail (np. jan@firma.pl).';
}

$phoneDigits = preg_replace('/\D/', '', $phone);
if (strlen($phoneDigits) !== 9) {
    $errors['phone'] = 'Numer telefonu musi mieć dokładnie 9 cyfr.';
}

if (mb_strlen($message) < 30) {
    $errors['message'] = 'Wiadomość musi mieć co najmniej 30 znaków (masz ' . mb_strlen($message) . ').';
}

if (!empty($errors)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'errors' => $errors]);
    exit;
}

$serviceLabel = htmlspecialchars($service ?: 'Nie wybrano');
$nameSafe     = htmlspecialchars($name);
$emailSafe    = htmlspecialchars($email);
$phoneSafe    = htmlspecialchars($phone);
$messageSafe  = nl2br(htmlspecialchars($message));

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
        <tr><td style='padding:0.5rem 0;color:#717785;'>Adres IP</td><td style='padding:0.5rem 0;font-weight:600;font-family:monospace;'>{$ipSafe}</td></tr>
        <tr><td style='padding:0.5rem 0;color:#717785;'>Godziny kontaktu</td><td style='padding:0.5rem 0;font-weight:600;'>" . htmlspecialchars($hoursLabel) . "</td></tr>
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

$hoursInfo     = ($hoursFrom && $hoursTo) ? "{$hoursFrom} – {$hoursTo}" : 'Nie podano';
$clientSubject = "Potwierdzenie – otrzymaliśmy Twoją wiadomość | " . SITE_NAME;
$clientBody    = "
<!DOCTYPE html>
<html lang='pl'>
<head><meta charset='utf-8'/></head>
<body style='margin:0;padding:0;background:#eef2f7;font-family:Inter,Arial,sans-serif;'>
  <table width='100%' cellpadding='0' cellspacing='0' style='background:#eef2f7;padding:2rem 1rem;'>
    <tr><td align='center'>
      <table width='100%' style='max-width:560px;' cellpadding='0' cellspacing='0'>

        <!-- HEADER -->
        <tr>
          <td style='background:#0059b5;border-radius:12px 12px 0 0;padding:2rem 2rem 1.5rem;'>
            <p style='margin:0;font-size:1.3rem;font-weight:700;color:#ffffff;letter-spacing:-0.02em;'>" . SITE_NAME . "</p>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style='background:#ffffff;padding:2rem;'>
            <h2 style='margin:0 0 0.75rem;font-size:1.4rem;font-weight:700;color:#1a1c1d;'>Cześć, {$nameSafe}! 👋</h2>
            <p style='margin:0 0 1.5rem;line-height:1.7;color:#414753;font-size:0.95rem;'>
              Dziękujemy za kontakt. Twoja wiadomość dotarła do nas —<br/>skontaktujemy się z Tobą w ciągu <strong style='color:#0059b5;'>24 godzin</strong>.
            </p>

            <!-- PODSUMOWANIE -->
            <table width='100%' cellpadding='0' cellspacing='0' style='background:#f0f4fa;border-radius:10px;border:1px solid #d7e2ff;margin-bottom:1.5rem;'>
              <tr>
                <td style='padding:1rem 1.25rem 0.5rem;'>
                  <p style='margin:0 0 0.75rem;font-size:0.8rem;font-weight:700;color:#00458f;text-transform:uppercase;letter-spacing:0.06em;'>Podsumowanie zapytania</p>
                </td>
              </tr>
              <tr>
                <td style='padding:0 1.25rem;'>
                  <table width='100%' cellpadding='0' cellspacing='0'>
                    <tr>
                      <td style='padding:0.4rem 0;font-size:0.85rem;color:#717785;width:130px;vertical-align:top;'>Imię i nazwisko</td>
                      <td style='padding:0.4rem 0;font-size:0.85rem;font-weight:600;color:#1a1c1d;'>{$nameSafe}</td>
                    </tr>
                    <tr>
                      <td style='padding:0.4rem 0;font-size:0.85rem;color:#717785;vertical-align:top;'>Telefon</td>
                      <td style='padding:0.4rem 0;font-size:0.85rem;font-weight:600;color:#1a1c1d;'>{$phoneSafe}</td>
                    </tr>
                    <tr>
                      <td style='padding:0.4rem 0;font-size:0.85rem;color:#717785;vertical-align:top;'>Usługa</td>
                      <td style='padding:0.4rem 0;font-size:0.85rem;font-weight:600;color:#1a1c1d;'>{$serviceLabel}</td>
                    </tr>
                    <tr>
                      <td style='padding:0.4rem 0 1rem;font-size:0.85rem;color:#717785;vertical-align:top;'>Twoja wiadomość</td>
                      <td style='padding:0.4rem 0 1rem;font-size:0.85rem;color:#1a1c1d;line-height:1.6;'>{$messageSafe}</td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>

            <p style='margin:0 0 0.5rem;font-size:0.9rem;color:#414753;line-height:1.6;'>Masz pilną sprawę? Napisz bezpośrednio na:</p>
            <p style='margin:0 0 1.75rem;'>
              <a href='mailto:" . MAIL_OWNER . "' style='color:#0059b5;font-weight:600;font-size:0.9rem;'>" . MAIL_OWNER . "</a>
            </p>

            <a href='https://jasnybiznes.pl' style='display:inline-block;background:#0059b5;color:#ffffff;padding:0.8rem 2rem;border-radius:9999px;text-decoration:none;font-weight:600;font-size:0.95rem;'>Wróć na stronę →</a>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style='background:#1a1c1d;border-radius:0 0 12px 12px;padding:1.25rem 2rem;text-align:center;'>
            <p style='margin:0;font-size:0.78rem;color:#9aa0ad;'>© 2026 " . SITE_NAME . " &nbsp;|&nbsp; Ta wiadomość została wysłana automatycznie.</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>
";

$clientHeaders  = "MIME-Version: 1.0\r\n";
$clientHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";
$clientHeaders .= "From: " . SITE_NAME . " <" . MAIL_FROM . ">\r\n";

$sentOwner  = mail(MAIL_OWNER, $ownerSubject,  $ownerBody,  $ownerHeaders);
$sentClient = mail($email,     $clientSubject, $clientBody, $clientHeaders);

if ($sentOwner) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'error' => 'Błąd serwera przy wysyłce. Spróbuj ponownie lub zadzwoń do nas.']);
}