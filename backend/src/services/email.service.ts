import nodemailer from "nodemailer";

export interface StudentCredentialsEmailInput {
  toEmail: string;
  studentName: string;
  admissionNumber: string;
  password?: string;
  instituteName: string;
  batchName?: string;
  loginUrl?: string;
}

export interface TeacherCredentialsEmailInput {
  toEmail: string;
  teacherName: string;
  employeeCode: string;
  password?: string;
  instituteName: string;
  loginUrl?: string;
}

export class EmailService {
  private static transporter: any = null;

  /**
   * Initialize Nodemailer Transporter or fallback console logger
   */
  private static getTransporter(): any {
    if (!this.transporter) {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = Number(process.env.SMTP_PORT) || 587;
      const smtpUser = process.env.SMTP_USER;
      const smtpPass = process.env.SMTP_PASS;

      if (smtpHost && smtpUser && smtpPass) {
        this.transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: {
            user: smtpUser,
            pass: smtpPass
          }
        });
      } else {
        // Fallback Transporter (Logs email payload cleanly in console)
        this.transporter = nodemailer.createTransport({
          jsonTransport: true
        });
      }
    }

    return this.transporter;
  }

  /**
   * Send Welcome Credentials Email to Enrolled Student
   */
  static async sendStudentCredentials(input: StudentCredentialsEmailInput): Promise<boolean> {
    const {
      toEmail,
      studentName,
      admissionNumber,
      password,
      instituteName,
      batchName,
      loginUrl = process.env.CLIENT_URL || "http://localhost:3000/login"
    } = input;

    const fromAddress = process.env.SMTP_FROM || `"${instituteName}" <no-reply@institute.com>`;
    const subject = `Welcome to ${instituteName} - Your Student Account Credentials`;

    const passwordHtml = password
      ? `<p style="margin: 4px 0;"><strong>Password:</strong> <code style="color: #059669; font-size: 1.1em;">${password}</code></p>`
      : `<p style="margin: 4px 0; color: #6b7280;"><em>Use your existing account password.</em></p>`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Welcome to ${instituteName}!</h2>
        <p>Dear <strong>${studentName}</strong>,</p>
        <p>You have been successfully enrolled in ${batchName ? `batch <strong>${batchName}</strong> at ` : ""}${instituteName}. Below are your login credentials to access the Student Portal.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Student User ID (Admission No.):</strong> <code style="color: #4f46e5; font-size: 1.1em;">${admissionNumber}</code></p>
          <p style="margin: 4px 0;"><strong>Email Address:</strong> ${toEmail}</p>
          ${passwordHtml}
        </div>

        <p style="color: #374151;">💡 <strong>How to Login:</strong> You can sign in using <em>either</em> your <strong>Student ID (${admissionNumber})</strong> or your <strong>Email (${toEmail})</strong> along with your password.</p>

        <div style="margin-top: 24px;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Student Portal</a>
        </div>

        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 0.85em; color: #9ca3af;">If you did not request this account, please contact your institute administration.</p>
      </div>
    `;

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlBody,
        text: `Welcome to ${instituteName}!\nStudent ID: ${admissionNumber}\nEmail: ${toEmail}\nPassword: ${password || "(Existing Password)"}\nLogin: ${loginUrl}`
      });

      console.log(`[EMAIL SERVICE] Student credentials email dispatched to ${toEmail}. MessageId: ${info.messageId || "console-log"}`);
      return true;
    } catch (err) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send student email to ${toEmail}:`, err);
      return false;
    }
  }

  /**
   * Send Welcome Credentials Email to Added Teacher
   */
  static async sendTeacherCredentials(input: TeacherCredentialsEmailInput): Promise<boolean> {
    const {
      toEmail,
      teacherName,
      employeeCode,
      password,
      instituteName,
      loginUrl = process.env.CLIENT_URL || "http://localhost:3000/login"
    } = input;

    const fromAddress = process.env.SMTP_FROM || `"${instituteName}" <no-reply@institute.com>`;
    const subject = `Welcome to ${instituteName} - Your Faculty Account Credentials`;

    const passwordHtml = password
      ? `<p style="margin: 4px 0;"><strong>Password:</strong> <code style="color: #059669; font-size: 1.1em;">${password}</code></p>`
      : `<p style="margin: 4px 0; color: #6b7280;"><em>Use your existing account password.</em></p>`;

    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e5e7eb; border-radius: 8px;">
        <h2 style="color: #4f46e5; margin-bottom: 8px;">Welcome to ${instituteName}!</h2>
        <p>Dear <strong>${teacherName}</strong>,</p>
        <p>You have been registered as a Faculty member at ${instituteName}. Below are your official login credentials to access the Teacher Portal.</p>
        
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 6px; margin: 20px 0;">
          <p style="margin: 4px 0;"><strong>Teacher User ID (Employee Code):</strong> <code style="color: #4f46e5; font-size: 1.1em;">${employeeCode}</code></p>
          <p style="margin: 4px 0;"><strong>Email Address:</strong> ${toEmail}</p>
          ${passwordHtml}
        </div>

        <p style="color: #374151;">💡 <strong>How to Login:</strong> You can sign in using <em>either</em> your <strong>Teacher Employee Code (${employeeCode})</strong> or your <strong>Email (${toEmail})</strong> along with your password.</p>

        <div style="margin-top: 24px;">
          <a href="${loginUrl}" style="background-color: #4f46e5; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Access Teacher Portal</a>
        </div>

        <hr style="margin-top: 30px; border: 0; border-top: 1px solid #e5e7eb;" />
        <p style="font-size: 0.85em; color: #9ca3af;">If you did not request this account, please contact your institute administration.</p>
      </div>
    `;

    try {
      const transporter = this.getTransporter();
      const info = await transporter.sendMail({
        from: fromAddress,
        to: toEmail,
        subject,
        html: htmlBody,
        text: `Welcome to ${instituteName}!\nEmployee Code: ${employeeCode}\nEmail: ${toEmail}\nPassword: ${password || "(Existing Password)"}\nLogin: ${loginUrl}`
      });

      console.log(`[EMAIL SERVICE] Teacher credentials email dispatched to ${toEmail}. MessageId: ${info.messageId || "console-log"}`);
      return true;
    } catch (err) {
      console.error(`[EMAIL SERVICE ERROR] Failed to send teacher email to ${toEmail}:`, err);
      return false;
    }
  }
}
