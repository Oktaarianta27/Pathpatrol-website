const form = document.getElementById("contact-form");
const formStatus = document.getElementById("form-status");

form.addEventListener("submit", (event) => {
  event.preventDefault(); // Prevent default form submission

  // Get form data
  const formData = {
    name: form.name.value,
    email: form.email.value,
    subject: form.subject.value,
    message: form.message.value,
  };

  // Send email using EmailJS
  emailjs.send("service_j9seofe", "template_ekejc5p", formData).then(
    (response) => {
      console.log("Email sent successfully!", response);
      formStatus.textContent = "Thank you! Your message has been sent.";
      formStatus.style.color = "green";
      form.reset(); // Clear the form
    },
    (error) => {
      console.error("Failed to send email.", error);
      formStatus.textContent = "Oops! Something went wrong. Please try again.";
      formStatus.style.color = "red";
    }
  );
});
