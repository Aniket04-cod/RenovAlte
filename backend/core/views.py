from django.http import HttpResponse
from django.shortcuts import render, get_object_or_404
from django.utils import timezone
from django.conf import settings
from django.template.loader import render_to_string
from django.core.mail import send_mail

from core.models.offer import Offer
from core.forms import OfferUploadForm


def healthcheck(_request):
	return HttpResponse("OK")


def upload_offer(request, token):
	"""Render an upload page for the Offer identified by the token.

	POST will save the uploaded file to the Offer.offer_letter field and mark it submitted.
	"""
	offer = get_object_or_404(Offer, token=token)

	# if token is empty or already used, treat as invalid
	if not offer.token:
		return render(request, "core/upload_invalid.html", {"reason": "invalid"})

	if request.method == "POST":
		form = OfferUploadForm(request.POST, request.FILES)
		if form.is_valid():
			uploaded = form.cleaned_data["uploaded_file"]
			notes = form.cleaned_data.get("notes", "")
			# save file on the existing Offer
			offer.offer_letter = uploaded
			offer.notes = (offer.notes or "") + "\n" + notes if notes else offer.notes
			offer.status = "submitted"
			offer.submitted_at = timezone.now()
			# clear token to prevent reuse
			offer.clear_upload_token()
			offer.save()
			return render(request, "core/upload_success.html", {"offer": offer})
	else:
		form = OfferUploadForm()

	return render(request, "core/upload_offer.html", {"form": form, "offer": offer})


def send_invitation_email_for_offer(offer, subject=None, template_name="core/invite_email.html"):
	"""Generate token for the given Offer (if missing) and send an email with the upload link.

	offer: Offer instance with a related contractor who has an `email` field.
	Returns the upload URL.
	"""
	if not offer.token:
		token = offer.generate_upload_token()
	else:
		token = str(offer.token)

	site = getattr(settings, "SITE_URL", "http://localhost:8000").rstrip("/")
	upload_path = f"/offers/upload/{token}/"
	upload_url = site + upload_path

	context = {"offer": offer, "contractor": offer.contractor, "upload_link": upload_url}
	html_message = render_to_string(template_name, context)
	text_message = render_to_string(template_name, context)

	send_mail(
		subject or "Please upload your offer letter",
		text_message,
		getattr(settings, "DEFAULT_FROM_EMAIL", None),
		[getattr(offer.contractor, "email")],
		fail_silently=False,
		html_message=html_message,
	)

	return upload_url


