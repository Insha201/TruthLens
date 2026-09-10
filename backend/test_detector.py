from agents.claim_detector import detect_claim


test_post = """
Scientists have discovered that drinking coffee completely prevents
all types of cancer.
"""


result = detect_claim(test_post)

print("\n--- CLAIM DETECTOR RESULT ---")
print("Claim:", result.claim)
print("Confidence:", result.confidence)
print("Misinformation:", result.is_misinformation)
print("Severity:", result.severity)
print("Status:", result.status)