const validator = require('@app-core/validator');
const { throwAppError } = require('@app-core/errors');
const { randomBytes } = require('@app-core/randomness');
const { CreatorCardMessages } = require('@app/messages');
const CreatorCard = require('@app/repository/creator-card');
const serializeCard = require('./serialize');

const spec = `root {
  title string<minLength:3|maxLength:100>
  description? string<maxLength:500>
  slug? string<lengthBetween:5,50>
  creator_reference string<length:20>
  links[]? {
    title string<minLength:1|maxLength:100>
    url string<maxLength:200>
  }
  service_rates? {
    currency string(NGN|USD|GBP|GHS)
    rates[] {
      name string<minLength:3|maxLength:100>
      description? string<maxLength:250>
      amount number<min:1>
    }
  }
  status string(draft|published)
  access_type? string(public|private)
  access_code? string<length:6>
}`;

const parsedSpec = validator.parse(spec);

const SLUG_SAFE_CHARS = /^[a-z0-9_-]+$/;
const ALNUM_ONLY = /^[a-zA-Z0-9]+$/;

async function createCreatorCard(serviceData, options = {}) {
  const data = validator.validate(serviceData, parsedSpec);

  const accessType = data.access_type || 'public';

  if (accessType === 'private' && !data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_REQUIRED, 'AC01');
  }

  if (accessType === 'public' && data.access_code) {
    throwAppError(CreatorCardMessages.ACCESS_CODE_NOT_ALLOWED, 'AC05');
  }

  if (data.access_code && !ALNUM_ONLY.test(data.access_code)) {
    throwAppError('access_code must contain only alphanumeric characters');
  }

  if (data.links) {
    for (const link of data.links) {
      if (!link.url.startsWith('http://') && !link.url.startsWith('https://')) {
        throwAppError('Link URL must start with http:// or https://');
      }
    }
  }

  let { slug } = data;

  if (slug) {
    if (!SLUG_SAFE_CHARS.test(slug)) {
      throwAppError('slug may only contain lowercase letters, numbers, hyphens, and underscores');
    }
    const existing = await CreatorCard.findOne({ query: { slug } });
    if (existing) {
      throwAppError(CreatorCardMessages.SLUG_TAKEN, 'SL02');
    }
  } else {
    slug = data.title
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]/g, '');

    const tooShort = slug.length < 5;
    const taken = tooShort ? null : await CreatorCard.findOne({ query: { slug } });

    if (tooShort || taken) {
      slug = `${slug}-${randomBytes(6)}`;
    }
  }

  const card = await CreatorCard.create({
    title: data.title,
    description: data.description,
    slug,
    creator_reference: data.creator_reference,
    links: data.links,
    service_rates: data.service_rates,
    status: data.status,
    access_type: accessType,
    access_code: data.access_code || null,
  });

  return serializeCard(card, { includeAccessCode: true });
}

module.exports = createCreatorCard;
