import smtplib
import random
import string
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timedelta
import os


def generate_otp():
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(email, otp_code):
    try:
        gmail_email = os.getenv('GMAIL_EMAIL')
        gmail_password = os.getenv('GMAIL_PASSWORD')

        msg = MIMEMultipart()
        msg['From'] = gmail_email
        msg['To'] = email
        msg['Subject'] = "Galvan AI - Email Verification OTP"

        body = f"""
        Hello,

        Your OTP for email verification is: {otp_code}

        This OTP will expire in 10 minutes.

        Best regards,
        Galvan AI Team
        """

        msg.attach(MIMEText(body, 'plain'))

        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(gmail_email, gmail_password)
        text = msg.as_string()
        server.sendmail(gmail_email, email, text)
        server.quit()
        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False


def get_otp_expiry():
    return datetime.utcnow() + timedelta(minutes=10)