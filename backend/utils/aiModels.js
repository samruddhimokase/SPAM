const natural = require('natural');
const tokenizer = new natural.WordTokenizer();

/**
 * Analyze Instagram profile for risk
 */
const analyzeInstagramProfile = (profileData) => {
  const { followerCount, followingCount, accountAgeDays, postCount, bio, profilePic } = profileData;
  
  let riskScore = 0;
  let flags = [];

  // 1. Follower/Following ratio (common in bot accounts)
  const ratio = followingCount / (followerCount || 1);
  if (ratio > 10) {
    riskScore += 30;
    flags.push("Extremely high following-to-follower ratio");
  }

  // 2. Account Age
  if (accountAgeDays < 7) {
    riskScore += 40;
    flags.push("Account created very recently (less than a week)");
  } else if (accountAgeDays < 30) {
    riskScore += 20;
    flags.push("Account created recently (less than a month)");
  }

  // 3. Profile Completeness
  if (!profilePic) {
    riskScore += 15;
    flags.push("Missing profile picture");
  }
  if (!bio || bio.length < 5) {
    riskScore += 10;
    flags.push("Empty or very short bio");
  }

  // 4. Bio keywords (Scammy keywords)
  const scamKeywords = ['crypto', 'forex', 'investment', 'giveaway', 'lottery', 'earn money', 'dm for collab'];
  const bioWords = tokenizer.tokenize((bio || "").toLowerCase());
  const foundKeywords = scamKeywords.filter(k => bioWords.includes(k));
  if (foundKeywords.length > 0) {
    riskScore += foundKeywords.length * 15;
    flags.push(`Suspicious keywords in bio: ${foundKeywords.join(', ')}`);
  }

  // Cap risk score at 100
  riskScore = Math.min(riskScore, 100);

  let classification = "Real";
  if (riskScore > 70) classification = "Likely Fake";
  else if (riskScore > 40) classification = "Suspicious";

  return { riskScore, classification, flags };
};

/**
 * NLP based scam detection for messages (Telegram/WhatsApp)
 */
const detectScamMessage = (text) => {
  const lowercaseText = text.toLowerCase();
  
  const scamPatterns = [
    { name: 'Phishing Link', regex: /https?:\/\/[^\s]+/, score: 40 },
    { name: 'Urgency / Pressure', keywords: ['urgent', 'immediately', 'within 24 hours', 'action required', 'limited time', 'hurry up'], score: 25 },
    { name: 'Lottery / Prize', keywords: ['winner', 'prize', 'lottery', 'won', 'claim your', 'gift card', 'congratulations', 'lucky winner'], score: 55 },
    { name: 'Crypto Fraud', keywords: ['bitcoin', 'crypto', 'wallet', 'seed phrase', 'investment', 'doubling', 'profit daily', 'mining'], score: 45 },
    { name: 'Fake Job', keywords: ['remote job', 'work from home', 'salary $', 'earn daily', 'part-time job', 'whatsapp for details'], score: 35 },
    { name: 'OTP Request', keywords: ['otp', 'one-time password', 'verification code', 'send me the code', 'share the otp'], score: 60 },
    { name: 'Bank Fraud', keywords: ['bank account', 'account suspended', 'verify identity', 'update your bank', 'credit card'], score: 40 }
  ];

  let totalRisk = 0;
  let detectedPatterns = [];

  scamPatterns.forEach(pattern => {
    let matched = false;
    if (pattern.regex && pattern.regex.test(lowercaseText)) {
      matched = true;
    } else if (pattern.keywords) {
      matched = pattern.keywords.some(k => lowercaseText.includes(k));
    }

    if (matched) {
      totalRisk += pattern.score;
      if (!detectedPatterns.includes(pattern.name)) {
        detectedPatterns.push(pattern.name);
      }
    }
  });

  // Additional heuristic: check for suspicious URL patterns (e.g., bit.ly, tinyurl, or misspellings)
  const suspiciousUrls = ['bit.ly', 'tinyurl.com', 't.me', 'wa.me', 'shorturl.at', 'is.gd'];
  suspiciousUrls.forEach(url => {
    if (lowercaseText.includes(url)) {
      totalRisk += 20;
      if (!detectedPatterns.includes('Shortened/Suspicious Link')) {
        detectedPatterns.push('Shortened/Suspicious Link');
      }
    }
  });

  totalRisk = Math.min(totalRisk, 100);
  
  let classification = "Safe";
  let recommendation = "None";

  if (totalRisk >= 70) {
    classification = "Scam";
    recommendation = "High risk detected! Do not click any links or share personal info. Block this user.";
  } else if (totalRisk >= 35) {
    classification = "Suspicious";
    recommendation = "Potentially risky message. Be cautious and verify the sender's identity.";
  } else if (totalRisk > 0) {
    classification = "Low Risk";
    recommendation = "Mostly safe, but stay alert for unusual requests.";
  }

  return { 
    riskScore: totalRisk, 
    classification, 
    flags: detectedPatterns,
    recommendation
  };
};

/**
 * Heuristic based gender detection from name/bio (inspired by peimandaii/detecting-user-gender-using-instagram-data)
 */
const detectGenderFromName = (name, bio) => {
  const lowercaseName = (name || "").toLowerCase();
  const lowercaseBio = (bio || "").toLowerCase();
  
  const maleKeywords = ['boy', 'man', 'king', 'prince', 'mr', 'sir', 'gentleman', 'brother', 'dad', 'father', 'husband', 'fitness enthusiast', 'gym rat'];
  const femaleKeywords = ['girl', 'woman', 'queen', 'princess', 'ms', 'mrs', 'lady', 'sister', 'mom', 'mother', 'wife', 'makeup', 'fashionista', 'beauty', 'fashion'];

  let maleScore = maleKeywords.filter(k => lowercaseName.includes(k) || lowercaseBio.includes(k)).length;
  let femaleScore = femaleKeywords.filter(k => lowercaseName.includes(k) || lowercaseBio.includes(k)).length;

  if (maleScore > femaleScore) return "Male";
  if (femaleScore > maleScore) return "Female";
  return "Unknown";
};

/**
 * Deep Link Analysis for phishing detection
 */
const analyzeLinkSafety = (url) => {
  const lowercaseUrl = url.toLowerCase();
  let riskScore = 0;
  let findings = [];

  // 1. TLD Analysis
  const suspiciousTLDs = ['.xyz', '.zip', '.top', '.win', '.icu', '.club', '.net', '.info'];
  suspiciousTLDs.forEach(tld => {
    if (lowercaseUrl.endsWith(tld) || lowercaseUrl.includes(tld + '/')) {
      riskScore += 25;
      findings.push(`Suspicious Top-Level Domain (${tld})`);
    }
  });

  // 2. Typosquatting detection (Commonly spoofed brands)
  const brands = ['google', 'amazon', 'whatsapp', 'instagram', 'facebook', 'telegram', 'apple', 'netflix', 'paypal'];
  brands.forEach(brand => {
    // If brand is in URL but not as the main domain
    const brandRegex = new RegExp(brand);
    if (brandRegex.test(lowercaseUrl)) {
      // Check if it's actually the brand domain
      const isOfficial = new RegExp(`^https?://(www\\.)?${brand}\\.(com|org|net)`).test(lowercaseUrl);
      if (!isOfficial) {
        riskScore += 45;
        findings.push(`Possible Typosquatting/Spoofing of ${brand}`);
      }
    }
  });

  // 3. Subdomain depth (Scammers often use deep subdomains)
  const dots = (url.split('.').length - 1);
  if (dots > 4) {
    riskScore += 20;
    findings.push("Excessive subdomain depth (often used to hide real domain)");
  }

  // 4. IP-based URLs
  const ipRegex = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/;
  if (ipRegex.test(url)) {
    riskScore += 50;
    findings.push("URL uses a raw IP address instead of a domain name");
  }

  riskScore = Math.min(riskScore, 100);
  let status = "Safe";
  if (riskScore > 70) status = "Malicious";
  else if (riskScore > 30) status = "Suspicious";

  return { riskScore, status, findings };
};

module.exports = {
  analyzeInstagramProfile,
  detectScamMessage,
  detectGenderFromName,
  analyzeLinkSafety
};