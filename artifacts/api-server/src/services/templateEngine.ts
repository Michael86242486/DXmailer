export type TemplateName =
  | "verification"
  | "otp"
  | "password-reset"
  | "magic-link"
  | "security-alert"
  | "welcome-email";

export const TEMPLATES: Record<TemplateName, { subject: string; html: string }> = {
  verification: {
    subject: "Verify your email address",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 40px 20px; }
  .card { background: #fff; border-radius: 12px; max-width: 520px; margin: 0 auto; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .brand { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6366f1; margin-bottom: 32px; }
  h1 { font-size: 24px; font-weight: 700; color: #111; margin: 0 0 12px; }
  p { color: #555; line-height: 1.6; margin: 0 0 24px; font-size: 15px; }
  .code { background: #f4f4f5; border-radius: 8px; font-size: 32px; font-weight: 700; letter-spacing: 0.12em; color: #111; text-align: center; padding: 20px; margin: 24px 0; font-family: monospace; }
  .footer { font-size: 12px; color: #999; margin-top: 32px; text-align: center; }
</style></head>
<body>
  <div class="card">
    <div class="brand">{{senderName}}</div>
    <h1>Verify your email</h1>
    <p>Thanks for signing up. Use the verification code below to confirm your email address. This code expires in 10 minutes.</p>
    <div class="code">{{code}}</div>
    <p>If you didn't request this, you can safely ignore this email.</p>
    <div class="footer">Sent via ORACLEX &middot; {{senderName}}</div>
  </div>
</body>
</html>`,
  },

  otp: {
    subject: "Your one-time passcode",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f10; margin: 0; padding: 40px 20px; }
  .card { background: #18181b; border-radius: 12px; max-width: 520px; margin: 0 auto; padding: 40px; border: 1px solid #27272a; }
  .brand { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #a78bfa; margin-bottom: 32px; }
  h1 { font-size: 24px; font-weight: 700; color: #fafafa; margin: 0 0 12px; }
  p { color: #a1a1aa; line-height: 1.6; margin: 0 0 24px; font-size: 15px; }
  .otp { background: #27272a; border-radius: 8px; font-size: 40px; font-weight: 800; letter-spacing: 0.18em; color: #a78bfa; text-align: center; padding: 24px; margin: 24px 0; font-family: monospace; }
  .expiry { color: #71717a; font-size: 13px; text-align: center; }
  .footer { font-size: 12px; color: #52525b; margin-top: 32px; text-align: center; }
</style></head>
<body>
  <div class="card">
    <div class="brand">{{senderName}}</div>
    <h1>Your one-time passcode</h1>
    <p>Enter this OTP to complete your login. It is valid for {{expiry}} minutes.</p>
    <div class="otp">{{otp}}</div>
    <p class="expiry">Do not share this code with anyone.</p>
    <div class="footer">Sent via ORACLEX &middot; {{senderName}}</div>
  </div>
</body>
</html>`,
  },

  "password-reset": {
    subject: "Reset your password",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 40px 20px; }
  .card { background: #fff; border-radius: 12px; max-width: 520px; margin: 0 auto; padding: 40px; box-shadow: 0 2px 8px rgba(0,0,0,0.08); }
  .brand { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #ef4444; margin-bottom: 32px; }
  h1 { font-size: 24px; font-weight: 700; color: #111; margin: 0 0 12px; }
  p { color: #555; line-height: 1.6; margin: 0 0 24px; font-size: 15px; }
  .btn { display: block; background: #111; color: #fff !important; text-decoration: none; text-align: center; border-radius: 8px; padding: 14px 24px; font-weight: 600; font-size: 15px; margin: 24px 0; }
  .link { font-size: 12px; color: #999; word-break: break-all; }
  .footer { font-size: 12px; color: #999; margin-top: 32px; text-align: center; }
</style></head>
<body>
  <div class="card">
    <div class="brand">{{senderName}}</div>
    <h1>Reset your password</h1>
    <p>We received a request to reset the password for your account. Click the button below to choose a new password.</p>
    <a href="{{resetUrl}}" class="btn">Reset Password</a>
    <p>This link expires in {{expiry}} minutes. If you didn't request a password reset, you can safely ignore this email.</p>
    <p class="link">Or copy this link: {{resetUrl}}</p>
    <div class="footer">Sent via ORACLEX &middot; {{senderName}}</div>
  </div>
</body>
</html>`,
  },

  "magic-link": {
    subject: "Your magic login link",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #faf9f6; margin: 0; padding: 40px 20px; }
  .card { background: #fff; border-radius: 16px; max-width: 520px; margin: 0 auto; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .brand { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #f59e0b; margin-bottom: 32px; }
  .icon { font-size: 40px; margin-bottom: 16px; }
  h1 { font-size: 26px; font-weight: 700; color: #111; margin: 0 0 12px; }
  p { color: #555; line-height: 1.6; margin: 0 0 24px; font-size: 15px; }
  .btn { display: block; background: #111; color: #fff !important; text-decoration: none; text-align: center; border-radius: 10px; padding: 16px 24px; font-weight: 600; font-size: 15px; margin: 24px 0; letter-spacing: 0.01em; }
  .expiry { font-size: 13px; color: #888; text-align: center; }
  .footer { font-size: 12px; color: #999; margin-top: 32px; text-align: center; }
</style></head>
<body>
  <div class="card">
    <div class="brand">{{senderName}}</div>
    <div class="icon">✨</div>
    <h1>Click to sign in</h1>
    <p>Use this magic link to sign in to your account. No password needed — just click and you're in.</p>
    <a href="{{magicUrl}}" class="btn">Sign in to {{senderName}}</a>
    <p class="expiry">This link expires in {{expiry}} minutes and can only be used once.</p>
    <div class="footer">Sent via ORACLEX &middot; {{senderName}}</div>
  </div>
</body>
</html>`,
  },

  "security-alert": {
    subject: "Security alert: new activity on your account",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #fff8f7; margin: 0; padding: 40px 20px; }
  .card { background: #fff; border-radius: 12px; max-width: 520px; margin: 0 auto; padding: 40px; border-top: 4px solid #ef4444; box-shadow: 0 2px 8px rgba(0,0,0,0.06); }
  .brand { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #ef4444; margin-bottom: 32px; }
  h1 { font-size: 22px; font-weight: 700; color: #111; margin: 0 0 12px; }
  p { color: #555; line-height: 1.6; margin: 0 0 20px; font-size: 15px; }
  .alert-box { background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 16px; margin: 20px 0; }
  .alert-box p { margin: 0; color: #7f1d1d; font-size: 14px; }
  .detail { background: #f9fafb; border-radius: 6px; padding: 14px; font-size: 13px; color: #444; margin: 16px 0; }
  .detail strong { color: #111; }
  .btn-sec { display: inline-block; background: #ef4444; color: #fff !important; text-decoration: none; border-radius: 6px; padding: 10px 20px; font-weight: 600; font-size: 14px; margin-top: 8px; }
  .footer { font-size: 12px; color: #999; margin-top: 32px; text-align: center; }
</style></head>
<body>
  <div class="card">
    <div class="brand">{{senderName}} Security</div>
    <h1>New sign-in to your account</h1>
    <p>We detected a new login to your {{senderName}} account. If this was you, no action is needed.</p>
    <div class="detail">
      <strong>Time:</strong> {{time}}<br>
      <strong>Location:</strong> {{location}}<br>
      <strong>Device:</strong> {{device}}
    </div>
    <div class="alert-box">
      <p>If you did not sign in, secure your account immediately.</p>
    </div>
    <a href="{{secureUrl}}" class="btn-sec">Secure my account</a>
    <div class="footer">Sent via ORACLEX &middot; {{senderName}}</div>
  </div>
</body>
</html>`,
  },

  "welcome-email": {
    subject: "Welcome to {{senderName}} — you're in!",
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><style>
  body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f4f4f5; margin: 0; padding: 40px 20px; }
  .card { background: #fff; border-radius: 16px; max-width: 560px; margin: 0 auto; padding: 48px 40px; box-shadow: 0 4px 24px rgba(0,0,0,0.06); }
  .brand { font-size: 13px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #6366f1; margin-bottom: 32px; }
  h1 { font-size: 30px; font-weight: 800; color: #111; margin: 0 0 12px; }
  p { color: #555; line-height: 1.7; margin: 0 0 24px; font-size: 16px; }
  .steps { list-style: none; padding: 0; margin: 24px 0; }
  .steps li { display: flex; align-items: flex-start; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f1f1; font-size: 15px; color: #333; }
  .steps li .num { background: #6366f1; color: #fff; border-radius: 50%; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; margin-top: 1px; }
  .btn { display: block; background: #6366f1; color: #fff !important; text-decoration: none; text-align: center; border-radius: 10px; padding: 16px 24px; font-weight: 700; font-size: 15px; margin: 32px 0 16px; }
  .footer { font-size: 12px; color: #999; margin-top: 32px; text-align: center; }
</style></head>
<body>
  <div class="card">
    <div class="brand">{{senderName}}</div>
    <h1>Welcome, {{name}}! 👋</h1>
    <p>We're thrilled to have you. Your account is ready — here's how to get started.</p>
    <ul class="steps">
      <li><span class="num">1</span><span>Complete your profile with your details</span></li>
      <li><span class="num">2</span><span>Explore the dashboard and get familiar</span></li>
      <li><span class="num">3</span><span>Invite your team to collaborate</span></li>
    </ul>
    <a href="{{dashboardUrl}}" class="btn">Get started →</a>
    <p>Have questions? Reply to this email — our team is happy to help.</p>
    <div class="footer">Sent via ORACLEX &middot; {{senderName}}</div>
  </div>
</body>
</html>`,
  },
};

export function renderTemplate(
  templateName: TemplateName,
  data: Record<string, unknown>,
  senderName: string,
): { subject: string; html: string } {
  const template = TEMPLATES[templateName];
  const vars: Record<string, string> = {
    senderName,
    ...Object.fromEntries(
      Object.entries(data).map(([k, v]) => [k, String(v ?? "")]),
    ),
  };

  const replace = (str: string): string =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key: string) => vars[key] ?? `{{${key}}}`);

  return {
    subject: replace(template.subject),
    html: replace(template.html),
  };
}
