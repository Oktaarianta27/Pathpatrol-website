# Gunakan image dasar Python
FROM python:3.9-slim

# Setel working directory di dalam container
WORKDIR /app

# Salin semua file dari proyek ke dalam container
COPY . /app

# Instal dependensi yang dibutuhkan
RUN pip install --upgrade pip
RUN pip install -r requirements.txt

# Tentukan variabel lingkungan untuk Flask dan Gunicorn
ENV FLASK_APP=app.py
ENV FLASK_ENV=production
ENV FLASK_HOST=0.0.0.0
ENV FLASK_PORT=8080

# Perintah untuk menjalankan aplikasi menggunakan Gunicorn
CMD ["gunicorn", "-w", "4", "-b", "0.0.0.0:8080", "app:create_app()"]

# Tentukan port yang digunakan oleh aplikasi
EXPOSE 8080
