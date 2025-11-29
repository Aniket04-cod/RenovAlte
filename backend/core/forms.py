from django import forms


class OfferUploadForm(forms.Form):
    uploaded_file = forms.FileField(label="Offer letter (PDF/DOCX)")
    notes = forms.CharField(widget=forms.Textarea, required=False)
